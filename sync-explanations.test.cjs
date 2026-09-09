const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),core=require('./sync-core.js'),credit=require('./study-credit.js');
const remote=new Map(),listeners=new Set(),batches=[];let online=true;
const key=(uid,type)=>uid+'/'+type,map=(uid,type)=>remote.get(key(uid,type))||new Map();
const snapshot=(uid,type)=>({metadata:{fromCache:false,hasPendingWrites:false},docs:[...map(uid,type)].map(([id,value])=>({id,data:()=>structuredClone(value)}))});
const emit=()=>{for(const l of listeners)queueMicrotask(()=>l.fn(snapshot(l.uid,l.type)));};
const empty=()=>({version:2,cards:[{id:'c',subject:'영어',question:'q',answer:'a',created:'2026-09-01',due:'2026-09-09',ease:2.5,interval:0,streak:0}],history:[]});
function client(){
 let current=empty(),profile=null,authCallback;const profiles=new Map(),events=new Map(),messages=[];
 const store={get:()=>structuredClone(current),merge(rows){current=core.merge(current,rows);profiles.set(profile,current);},mergeExplanations(rows){current.explanationViews=credit.unionExplanations(current.explanationViews||[],rows);profiles.set(profile,current);},switchUser(uid){profiles.set(profile,current);profile=uid;current=profiles.get(uid)||empty();}};
 const auth={currentUser:{uid:'owner'},onAuthStateChanged(fn){authCallback=fn;queueMicrotask(()=>fn(this.currentUser));return()=>{};}};
 const db={collection(name){return {doc(uid){if(name==='allowedUsers')return {async get(){if(!online)throw Error('offline');return {exists:['owner','second'].includes(uid)};}};return {collection(type){return {doc(id){return {uid,type,id};},onSnapshot(options,fn){const l={uid,type,fn};listeners.add(l);queueMicrotask(()=>fn(snapshot(uid,type)));return()=>listeners.delete(l);}};}};}};},batch(){const writes=[];return {set(ref,value){writes.push({ref,value});},async commit(){
  if(!online)throw Error('offline');const views=writes.filter(w=>w.ref.type==='explanationViews');assert(views.length<=10,'Avoid Firestore rule lookup limits');
  for(const {ref,value}of writes){const old=map(ref.uid,ref.type).get(ref.id);if(ref.type==='explanationViews'){assert.equal(map(ref.uid,'events').get(ref.id)?.mode,'quiz','Parent quiz must be uploaded first');if(old&&value.openedAt>old.openedAt)throw Object.assign(Error('earlier view exists'),{code:'permission-denied'});}else if(old)assert.deepEqual(old,value);}
  for(const {ref,value}of writes){const m=map(ref.uid,ref.type);m.set(ref.id,structuredClone(value));remote.set(key(ref.uid,ref.type),m);}batches.push(writes.map(w=>w.ref.type));emit();
 }}}};
 const context={ProgressSync:core,StudyCredit:credit,navigator:{onLine:true},setInterval:()=>1,clearInterval(){},addEventListener(k,fn){events.set(k,fn);},removeEventListener(k){events.delete(k);}};vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/sync.js','utf8'),context);const connection=context.ProgressCloud.connect({auth,db,store,status:m=>messages.push(m)});
 return {store,connection,messages,answer(id){current.history.push({id,cardId:'c',date:'2026-09-10',at:'2026-09-10T09:00:00+09:00',result:'correct',mode:'quiz'});events.get('study-progress-saved')();},open(id,openedAt){store.mergeExplanations([{id,openedAt}]);events.get('study-progress-saved')();},login(uid){auth.currentUser=uid?{uid}:null;return authCallback(auth.currentUser);}};
}
async function settle(){for(let i=0;i<35;i++)await new Promise(r=>setImmediate(r));}
(async()=>{const a=client(),b=client(),at=Date.parse('2026-09-10T10:00:00+09:00');try{
 await settle();a.answer('one');await settle();const history=JSON.stringify(a.store.get().history),cards=JSON.stringify(a.store.get().cards);
 a.open('one',at);await settle();assert.equal(b.store.get().explanationViews.length,1);assert.equal(credit.summary(b.store.get().history,'2026-09-10',b.store.get().explanationViews).totalMinutes,2);assert.equal(JSON.stringify(a.store.get().history),history);assert.equal(JSON.stringify(a.store.get().cards),cards);
 a.open('one',at+5000);await settle();assert.equal(map('owner','explanationViews').size,1);assert.equal(map('owner','explanationViews').get('one').openedAt,at);
 a.answer('race');await settle();online=false;a.open('race',at+10000);b.open('race',at+5000);await settle();online=true;a.connection.retry();b.connection.retry();await settle();a.connection.retry();b.connection.retry();await settle();assert.equal(map('owner','explanationViews').get('race').openedAt,at+5000);assert.deepEqual(a.store.get().explanationViews,b.store.get().explanationViews);
 online=false;for(let i=0;i<25;i++){a.answer('offline-'+i);a.open('offline-'+i,at+20000+i);}await settle();online=true;a.connection.retry();await settle();b.connection.retry();await settle();assert.equal(map('owner','events').size,27);assert.equal(map('owner','explanationViews').size,27);assert.deepEqual(a.store.get().explanationViews,b.store.get().explanationViews);assert.equal(credit.summary(a.store.get().history,'2026-09-10',a.store.get().explanationViews).totalMinutes,54);
 await b.login('second');await settle();assert.equal(b.store.get().history.length,0);assert.equal(b.store.get().explanationViews?.length||0,0);await b.login(null);await settle();assert.equal(b.store.get().explanationViews?.length||0,0);await b.login('owner');await settle();assert.equal(b.store.get().explanationViews.length,27);
 console.log('PASS explanation sync: unchanged quiz scores, two clients, earliest concurrent open, replay, offline parent-first upload, batches of ten and account isolation');
}finally{a.connection.close();b.connection.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
