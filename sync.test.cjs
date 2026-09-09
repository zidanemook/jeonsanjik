const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),core=require('./sync-core.js');
const empty=()=>({version:2,cards:[{id:'c',subject:'국어',question:'q',answer:'a',created:'2026-09-01',due:'2026-09-09',ease:2.5,interval:0,streak:0}],history:[]});
const remote=new Map(),listeners=new Set();let online=true;
const snapshot=uid=>({metadata:{fromCache:false,hasPendingWrites:false},docs:[...(remote.get(uid)||new Map())].map(([id,value])=>({id,data:()=>structuredClone(value)}))});
const emit=()=>{for(const listener of listeners)queueMicrotask(()=>listener.fn(snapshot(listener.uid)));};
function client(){
 let current=empty(),profile=null,authCallback;const profiles=new Map([[null,current]]),events=new Map(),messages=[];
 const store={get:()=>structuredClone(current),merge(rows){current=core.merge(current,rows);profiles.set(profile,current);},switchUser(uid){profile=uid;current=profiles.get(uid)||empty();profiles.set(uid,current);}};
 const auth={currentUser:{uid:'owner'},onAuthStateChanged(fn){authCallback=fn;queueMicrotask(()=>fn(this.currentUser));return()=>{};}};
 const db={
  collection(name){return {doc(uid){
   if(name==='allowedUsers')return {async get(){if(!online)throw Error('offline');return {exists:uid==='owner'||uid==='second'};}};
   return {collection(){return {
    doc(id){return {uid,id};},
    onSnapshot(options,fn){const l={uid,fn};listeners.add(l);queueMicrotask(()=>fn(snapshot(uid)));return ()=>listeners.delete(l);}
   };}};
  }};},
  batch(){const writes=[];return {
   set(ref,value){writes.push({ref,value});},
   async commit(){
    if(!online)throw Error('offline');
    for(const {ref,value}of writes){if(!remote.has(ref.uid))remote.set(ref.uid,new Map());const prior=remote.get(ref.uid).get(ref.id);if(prior)assert.deepEqual(prior,value);remote.get(ref.uid).set(ref.id,structuredClone(value));}
    emit();
   }
  };}
 };
 const context={ProgressSync:core,navigator:{onLine:true},setInterval:()=>1,clearInterval(){},addEventListener(name,fn){events.set(name,fn);},removeEventListener(name){events.delete(name);}};vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/sync.js','utf8'),context);const connection=context.ProgressCloud.connect({auth,db,store,status:m=>messages.push(m)});
 return{store,messages,connection,answer(id,date,result,detail){const row={id,cardId:'c',date,at:date+'T12:00:00+09:00',result,mode:'quiz'};if(detail)row.detail=detail;current.history.push(row);events.get('study-progress-saved')();},login(uid){auth.currentUser=uid?{uid}:null;return authCallback(auth.currentUser);}};
}
const tick=()=>new Promise(r=>setImmediate(r));async function settle(){for(let i=0;i<15;i++)await tick();}
(async()=>{const a=client(),b=client();try{
 await settle();a.answer('a','2026-09-09','correct');await settle();assert.equal(b.store.get().history.length,1);assert.deepEqual(a.store.get().cards,b.store.get().cards);
 const detail={schema:1,presentation:'text',assisted:false,exerciseId:'example-sync',conceptId:'grammar-sync',title:'수일치',subject:'영어',question:'Each student ___ a book.',options:'',submittedAnswer:'have',correctAnswer:'has',explanation:'each는 단수다.'};
 online=false;a.answer('offline-a','2026-09-10','wrong',detail);b.answer('offline-b','2026-09-10','correct');await settle();assert.equal(remote.get('owner').size,1);
 online=true;a.connection.retry();b.connection.retry();await settle();assert.equal(remote.get('owner').size,3);assert.equal(a.store.get().history.length,3);assert.deepEqual(a.store.get().cards,b.store.get().cards);
 assert.deepEqual(b.store.get().history.find(r=>r.id==='offline-a').detail,core.event({id:'offline-a',cardId:'c',date:'2026-09-10',result:'wrong',mode:'quiz',detail}).detail);
 a.connection.retry();await settle();assert.equal(remote.get('owner').size,3);
 await b.login('second');await settle();assert.equal(b.store.get().history.length,0);assert.equal(remote.has('second'),false);
 await b.login(null);await settle();assert.equal(b.store.get().history.length,0);
 await b.login('owner');await settle();assert.equal(b.store.get().history.length,3);
 console.log('PASS sync controller (mock server): two clients, offline concurrent answers, retry deduplication, account isolation and reconnect');
 }finally{a.connection.close();b.connection.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
