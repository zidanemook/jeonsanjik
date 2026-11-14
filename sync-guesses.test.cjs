const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),core=require('./sync-core.js');
// Two devices using the actual sync controller and an in-memory Firestore transport.
// Server rules are not executed here; the transport rejects stale writes.
const remote=new Map(),listeners=new Set();let online=true;
const key=(uid,type)=>uid+'/'+type,map=(uid,type)=>remote.get(key(uid,type))||new Map();
const snapshot=(uid,type)=>({metadata:{fromCache:false,hasPendingWrites:false},docs:[...map(uid,type)].map(([id,value])=>({id,data:()=>structuredClone(value)}))});
const emit=(uid,type)=>{for(const l of listeners)if(l.uid===uid&&l.type===type)queueMicrotask(()=>l.fn(snapshot(uid,type)));};
function client(){
 let current={version:3,cards:[],history:[]};const events=new Map();
 const store={get:()=>structuredClone(current),merge(rows){current=core.merge(current,rows);},switchUser(){},
  guesses:()=>current.guessMarks||[],mergeGuesses(rows){current.guessMarks=core.unionGuesses(current.guessMarks||[],rows);}};
 const auth={currentUser:{uid:'owner'},onAuthStateChanged(fn){queueMicrotask(()=>fn(this.currentUser));return()=>{};}};
 const db={collection(name){return {doc(uid){
  if(name==='allowedUsers')return {async get(){if(!online)throw Error('offline');return {exists:uid==='owner'};}};
  return {collection(type){return {
   doc(id){return {uid,type,id,async set(value){
    if(!online)throw Error('offline');assert.equal(type,'guessMarks');assert.equal(value.cardId,id);core.guess(value);assert.deepEqual(Object.keys(value).sort(),['at','cardId','guess']);
    const m=map(uid,type),prev=m.get(id);if(prev&&(value.at<prev.at||(value.at===prev.at&&value.guess&&!prev.guess)))throw Error('older');m.set(id,structuredClone(value));remote.set(key(uid,type),m);emit(uid,type);
   }};},
   onSnapshot(options,fn){const l={uid,type,fn};listeners.add(l);queueMicrotask(()=>fn(snapshot(uid,type)));return()=>listeners.delete(l);}
  };}};
 }};},batch(){const writes=[];return {set(ref,value){writes.push({ref,value});},async commit(){if(!online)throw Error('offline');for(const {ref,value}of writes){const m=map(ref.uid,ref.type);m.set(ref.id,structuredClone(value));remote.set(key(ref.uid,ref.type),m);emit(ref.uid,ref.type);}}};}};
 const context={ProgressSync:core,navigator:{onLine:true},setInterval:()=>1,clearInterval(){},addEventListener(name,fn){events.set(name,fn);},removeEventListener(name){events.delete(name);}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/sync.js','utf8'),context);const connection=context.ProgressCloud.connect({auth,db,store,status(){}});
 return {connection,marks:()=>structuredClone(current.guessMarks||[]),mark(cardId,guess,at){current.guessMarks=core.unionGuesses(current.guessMarks||[],[{cardId,guess,at}]);events.get('study-progress-saved')();}};
}
async function settle(){for(let i=0;i<20;i++)await new Promise(r=>setImmediate(r));}
(async()=>{
 const a=client(),b=client();await settle();
 a.mark('q1',true,1000);await settle();assert.equal(b.marks()[0].guess,true,'mark reaches another device');
 b.mark('q1',false,2000);await settle();assert.equal(a.marks()[0].guess,false,'removal reaches another device');
 a.mark('q2',true,3000);await settle();assert.equal(b.marks().find(r=>r.cardId==='q2').guess,true,'other question kept independently');
 const c=client();await settle();assert.deepEqual(c.marks(),a.marks(),'fresh device receives marks and removals');
 online=false;a.mark('q1',true,4000);await settle();assert.equal(b.marks().find(r=>r.cardId==='q1').guess,false);
 online=true;a.connection.retry();await settle();assert.equal(b.marks().find(r=>r.cardId==='q1').guess,true,'offline changes retry');
 const state={version:3,cards:[],history:[],guessMarks:a.marks()};assert.deepEqual(core.merge(state,[]).guessMarks,state.guessMarks,'history merge preserves independent marks');
 const x={cardId:'q1',guess:true,at:1},y={...x,guess:false,at:2};assert.deepEqual(core.unionGuesses([x],[y]),core.unionGuesses([y],[x]));
 assert.deepEqual(core.unionGuesses([x],[{...x,guess:false}]),[{...x,guess:false}],'same timestamp removal wins');
 for(const bad of [null,{...x,guess:1},{...x,at:0},{...x,cardId:'bad / id'}])assert.throws(()=>core.guess(bad));
 for(const p of [a,b,c])p.connection.close();
 console.log('PASS sync-guesses: two-device marks/removals, fresh device, offline retry, history preservation, convergence, validation');
})().catch(e=>{console.error(e);process.exit(1);});
