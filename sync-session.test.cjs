const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),core=require('./sync-core.js');
// Mock Firestore: event collections plus the single users/{uid}/state/session document.
const remote=new Map(),listeners=new Set(),sessions=new Map(),sessionListeners=new Set();let online=true,sessionRules=true,sessionWrites=0;
// Fake timers shared by every timer-driven client, so the write cooldown is advanced explicitly.
const clock=[];let timerId=0;
const timers={setTimeout(fn){const t={id:++timerId,fn};clock.push(t);return t.id;},clearTimeout(id){const i=clock.findIndex(t=>t.id===id);if(i>=0)clock.splice(i,1);}};
const key=(uid,type)=>uid+'/'+type,map=(uid,type)=>remote.get(key(uid,type))||new Map();
const snapshot=(uid,type)=>({metadata:{fromCache:false,hasPendingWrites:false},docs:[...map(uid,type)].map(([id,value])=>({id,data:()=>structuredClone(value)}))});
const sessionDoc=uid=>({exists:sessions.has(uid),data:()=>structuredClone(sessions.get(uid)),metadata:{fromCache:false,hasPendingWrites:false}});
const emit=()=>{for(const l of listeners)queueMicrotask(()=>l.fn(snapshot(l.uid,l.type)));},emitSession=uid=>{for(const l of sessionListeners)if(l.uid===uid)queueMicrotask(()=>l.fn(sessionDoc(uid)));};
const empty=()=>({version:2,cards:[{id:'c',subject:'한국사',question:'q',answer:'a',created:'2026-09-01',due:'2026-09-09',ease:2.5,interval:0,streak:0}],history:[]});
const position=(at,round,cardId)=>({at,subject:'한국사',topic:'',round,cardId:cardId||null,exerciseId:cardId?cardId+'-abc':null,variantIndex:cardId?0:null,type:cardId?'choice':null,choices:cardId?['가','나','다','라']:null});
function client({withTimers=false}={}){
 let current=empty(),profile=null,authCallback;const profiles=new Map(),events=new Map();
 const store={get:()=>structuredClone(current),merge(rows){current=core.merge(current,rows);profiles.set(profile,current);},switchUser(uid){profiles.set(profile,current);profile=uid;current=profiles.get(uid)||empty();},
  session:()=>current.session?structuredClone(current.session):null,
  mergeSession(row){const s=core.session(row);if(s.at<=(current.session?.at||0))return;current={...current,session:s,practiceScope:{subject:s.subject,topic:s.topic,round:s.round}};}};
 const auth={currentUser:{uid:'owner'},onAuthStateChanged(fn){authCallback=fn;queueMicrotask(()=>fn(this.currentUser));return()=>{};}};
 const db={collection(name){return {doc(uid){
  if(name==='allowedUsers')return {async get(){if(!online)throw Error('offline');return {exists:uid==='owner'};}};
  return {collection(type){return {
   doc(id){if(type!=='state')return {uid,type,id};assert.equal(id,'session');return {
    onSnapshot(options,fn,error){if(!sessionRules){queueMicrotask(()=>error(Object.assign(Error('denied'),{code:'permission-denied'})));return()=>{};}const l={uid,fn};sessionListeners.add(l);queueMicrotask(()=>fn(sessionDoc(uid)));return()=>sessionListeners.delete(l);},
    async set(value){if(!online)throw Error('offline');if(!sessionRules)throw Object.assign(Error('denied'),{code:'permission-denied'});const old=sessions.get(uid);core.session(value);if(old&&!(value.at>old.at))throw Object.assign(Error('older position'),{code:'permission-denied'});sessions.set(uid,structuredClone(value));sessionWrites++;emitSession(uid);}
   };},
   onSnapshot(options,fn){const l={uid,type,fn};listeners.add(l);queueMicrotask(()=>fn(snapshot(uid,type)));return()=>listeners.delete(l);}
  };}};
 }};},batch(){const writes=[];return {set(ref,value){writes.push({ref,value});},async commit(){if(!online)throw Error('offline');for(const {ref,value}of writes){const m=map(ref.uid,ref.type);m.set(ref.id,structuredClone(value));remote.set(key(ref.uid,ref.type),m);}emit();}};}};
 const context={ProgressSync:core,navigator:{onLine:true},setInterval:()=>1,clearInterval(){},addEventListener(name,fn){events.set(name,fn);},removeEventListener(name){events.delete(name);},...(withTimers?timers:{})};
 vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/sync.js','utf8'),context);const connection=context.ProgressCloud.connect({auth,db,store,status(){}});
 return {store,connection,
  // Mirrors app.js stampSession: never older than the last position this device has seen.
  choose(clock,round,cardId){current={...current,session:core.session(position(Math.max(clock,(current.session?.at||0)+1),round,cardId)),practiceScope:{subject:'한국사',topic:'',round}};profiles.set(profile,current);events.get('study-progress-saved')();},
  hide(){events.get('pagehide')();},
  answer(id){current.history.push({id,cardId:'c',date:'2026-09-11',at:'2026-09-11T12:00:00+09:00',result:'correct',mode:'quiz'});events.get('study-progress-saved')();}};
}
const tick=()=>new Promise(r=>setImmediate(r));async function settle(){for(let i=0;i<20;i++)await tick();}
// Run every armed cooldown to completion, including timers armed while draining.
async function elapse(){for(let i=0;i<12&&clock.length;i++){for(const t of clock.splice(0,clock.length))t.fn();await settle();}}
(async()=>{
 assert.throws(()=>core.session({...position(1,'x','c'),choices:[]}),/choices/);
 assert.throws(()=>core.session({...position(1,'x','c'),cardId:'bad id'}),/question/);
 assert.throws(()=>core.session({...position(0,'x')}),/Invalid session/);
 assert.deepEqual(core.session({at:5,subject:'',topic:'',round:''}),{at:5,subject:'',topic:'',round:'',cardId:null,exerciseId:null,variantIndex:null,type:null,choices:null});
 const a=client(),b=client();await settle();
 // Device A opens set 28 at question c; B follows.
 a.choose(1000,'study-20260910-28','c');await settle();
 assert.equal(sessions.get('owner').at,1000);assert.equal(b.store.get().practiceScope.round,'study-20260910-28');assert.equal(b.store.session().cardId,'c');
 // B's clock is behind, but a later explicit choice must still win.
 b.choose(10,'study-20260910-3');await settle();
 assert.equal(sessions.get('owner').at,1001);assert.equal(a.store.get().practiceScope.round,'study-20260910-3');
 // Offline A chooses first; online B chooses later. On reconnect A's older write is refused and A adopts B.
 online=false;a.choose(2000,'study-20260910-5');online=true;b.choose(3000,'study-20260910-7');await settle();
 a.connection.retry();await settle();
 assert.equal(sessions.get('owner').at,3000);assert.equal(a.store.get().practiceScope.round,'study-20260910-7');
 // Redraws or incoming records do not move the shared position.
 a.answer('r1');await settle();assert.equal(sessions.get('owner').at,3000);assert.equal(map('owner','events').size,1);
 a.connection.close();b.connection.close();
 // Unpublished position rules must never block answer records.
 sessionRules=false;const c=client();await settle();c.choose(4000,'study-20260910-9');c.answer('r2');await settle();
 assert.equal(map('owner','events').size,2);assert.equal(sessions.get('owner').at,3000);c.connection.close();
 // Writes are throttled: one leading write, then a single trailing write per cooldown.
 sessionRules=true;sessions.clear();
 const d=client({withTimers:true});await settle();const base=sessionWrites;
 d.choose(5000,'study-20260910-11','c');await settle();
 assert.equal(sessionWrites-base,1,'the first explicit choice is written at once');
 assert.equal(sessions.get('owner').at,5000);
 d.choose(5100,'study-20260910-12');await settle();d.choose(5200,'study-20260910-13');await settle();d.choose(5300,'study-20260910-14');await settle();
 assert.equal(sessionWrites-base,1,'choices inside the cooldown must not each be written');
 assert.equal(sessions.get('owner').at,5000);
 await elapse();
 assert.equal(sessionWrites-base,2,'one trailing write carries the coalesced last position');
 assert.equal(sessions.get('owner').at,5300);assert.equal(sessions.get('owner').round,'study-20260910-14');
 // Re-stamping the same position advances `at` locally but must not be resent.
 d.choose(6000,'study-20260910-14');await settle();await elapse();
 assert.equal(sessionWrites-base,2,'an unchanged position is skipped');
 assert.equal(sessions.get('owner').at,5300);
 // The last action lands even when the tab hides before the cooldown ends.
 d.choose(7000,'study-20260910-15');await settle();d.choose(7100,'study-20260910-16');await settle();
 const pending=sessionWrites;d.hide();await settle();
 assert.equal(sessionWrites,pending+1,'hiding the tab flushes the pending position');
 assert.equal(sessions.get('owner').at,7100);assert.equal(sessions.get('owner').round,'study-20260910-16');
 assert.ok(sessions.get('owner').at>5300,'the stored position stays strictly increasing');
 await elapse();assert.equal(sessionWrites,pending+1,'a flushed position is not written twice');
 d.connection.close();
 console.log('study position sync passed: cross-device resume, stale-write refusal, coalesced and flushed position writes');
})().catch(e=>{console.error(e);process.exitCode=1;});
