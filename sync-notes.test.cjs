const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),core=require('./sync-core.js');
// Mock Firestore with events plus users/{uid}/notes. Notes are immutable, and their rule can be switched off
// to prove that a missing notes rule never holds back answer records.
const remote=new Map(),listeners=new Set();let online=true,notesRules=true,noteWrites=0;
const key=(uid,type)=>uid+'/'+type,map=(uid,type)=>remote.get(key(uid,type))||new Map();
const snapshot=(uid,type)=>({metadata:{fromCache:false,hasPendingWrites:false},docs:[...map(uid,type)].map(([id,value])=>({id,data:()=>structuredClone(value)}))});
const emit=()=>{for(const l of listeners)queueMicrotask(()=>l.fn(snapshot(l.uid,l.type)));};
const denied=()=>Object.assign(Error('denied'),{code:'permission-denied'});
const empty=()=>({version:2,cards:[{id:'c',subject:'국어',question:'q',answer:'a',created:'2026-09-01',due:'2026-09-09',ease:2.5,interval:0,streak:0}],history:[],notes:[]});
const note=(id,text,at,extra={})=>({id,cardId:'c',exerciseId:'c-abc',stage:'question',subject:'국어',question:'국어 · 기출\n문제',text,at,...extra});
function client({withNotes=true}={}){
 let current=empty(),profile=null,authCallback;const profiles=new Map(),events=new Map();
 const store={get:()=>structuredClone(current),merge(rows){current=core.merge(current,rows);profiles.set(profile,current);},switchUser(uid){profiles.set(profile,current);profile=uid;current=profiles.get(uid)||empty();}};
 if(withNotes){store.notes=()=>structuredClone(current.notes||[]);store.mergeNotes=rows=>{current.notes=core.unionNotes((current.notes||[]).filter(n=>{try{core.note(n);return true;}catch{return false;}}),rows);profiles.set(profile,current);};}
 const auth={currentUser:{uid:'owner'},onAuthStateChanged(fn){authCallback=fn;queueMicrotask(()=>fn(this.currentUser));return()=>{};}};
 const db={collection(name){return {doc(uid){
  if(name==='allowedUsers')return {async get(){if(!online)throw Error('offline');return {exists:['owner','second'].includes(uid)};}};
  return {collection(type){return {
   doc(id){return {uid,type,id,async set(value){
    assert.equal(type,'notes','Only notes are written one document at a time');
    if(!online)throw Error('offline');if(!notesRules)throw denied();core.note(value);assert.equal(value.id,id);
    if(value.at>Date.now()+300000)throw denied();
    const old=map(uid,type).get(id);if(old)assert.deepEqual(old,value,'Stored notes are never rewritten');
    const m=map(uid,type);m.set(id,structuredClone(value));remote.set(key(uid,type),m);noteWrites++;emit();
   }};},
   onSnapshot(options,fn,error){if(type==='notes'&&!notesRules){queueMicrotask(()=>error(denied()));return()=>{};}const l={uid,type,fn};listeners.add(l);queueMicrotask(()=>fn(snapshot(uid,type)));return()=>listeners.delete(l);}
  };}};
 }};},batch(){const writes=[];return {set(ref,value){writes.push({ref,value});},async commit(){
  if(!online)throw Error('offline');
  assert(!writes.some(w=>w.ref.type==='notes'),'Notes never ride in answer batches');
  for(const {ref,value}of writes){const old=map(ref.uid,ref.type).get(ref.id);if(old)assert.deepEqual(old,value,'Stored records are never rewritten');}
  for(const {ref,value}of writes){const m=map(ref.uid,ref.type);m.set(ref.id,structuredClone(value));remote.set(key(ref.uid,ref.type),m);}emit();
 }};}};
 const context={ProgressSync:core,navigator:{onLine:true},setInterval:()=>1,clearInterval(){},addEventListener(k,fn){events.set(k,fn);},removeEventListener(k){events.delete(k);}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/sync.js','utf8'),context);const connection=context.ProgressCloud.connect({auth,db,store,status(){}});
 const saved=()=>events.get('study-progress-saved')();
 return {store,connection,
  answer(id){current.history.push({id,cardId:'c',date:'2026-09-14',at:'2026-09-14T09:00:00+09:00',result:'correct',mode:'quiz'});saved();},
  write(...rows){current.notes=[...(current.notes||[]),...rows];saved();},
  login(uid){auth.currentUser=uid?{uid}:null;return authCallback(auth.currentUser);}};
}
async function settle(){for(let i=0;i<40;i++)await new Promise(r=>setImmediate(r));}
(async()=>{
 // Validation: blank or oversized text, a bad stage or a non-integer time is refused; union keeps the first copy of an id.
 const at=Date.parse('2026-09-14T10:00:00+09:00');
 assert.throws(()=>core.note(note('x','   ',at)));assert.throws(()=>core.note(note('x','a'.repeat(2001),at)));
 assert.throws(()=>core.note(note('x','ok',at,{stage:'other'})));assert.throws(()=>core.note(note('x','ok',1.5)));assert.throws(()=>core.note(note('bad id','ok',at)));
 assert.deepEqual(core.unionNotes([note('b','second',at+1)],[note('a','first',at),note('b','second',at+1)]).map(n=>n.id),['a','b']);
 assert.deepEqual(Object.keys(core.note({...note('k','keep',at),extra:'dropped'})).sort(),['at','cardId','exerciseId','id','question','stage','subject','text']);

 const a=client(),b=client();
 try{
  await settle();
  a.write(note('n1','9번 해설이 헷갈려요',at));await settle();
  assert.equal(map('owner','notes').get('n1').text,'9번 해설이 헷갈려요');assert.equal(b.store.notes().length,1,'A note reaches the other device');
  a.write(note('n1','9번 해설이 헷갈려요',at));await settle();assert.equal(map('owner','notes').size,1,'Replaying a note stores it once');
  // Offline: notes queue locally and go up once online; a malformed local note does not block the rest.
  online=false;a.write(...Array.from({length:60},(_,i)=>note('off-'+i,'오프라인 의견 '+i,at+10+i)),{...note('broken','',at+100)});await settle();
  online=true;a.connection.retry();await settle();a.connection.retry();await settle();
  assert.equal(map('owner','notes').size,61);assert.equal(map('owner','notes').has('broken'),false);assert.equal(b.store.notes().length,61);
  // A note the rules refuse (clock 10 minutes ahead) is set aside; notes written before and after it still arrive, and it is not retried in a loop.
  const before=noteWrites;a.write(note('ok-before','앞 의견',at+200),note('future','시계가 빠른 폰',Date.now()+600000),note('ok-after','뒤 의견',at+300));await settle();
  a.connection.retry();await settle();a.write(note('ok-later','나중 의견',at+400));await settle();
  for(const id of ['ok-before','ok-after','ok-later'])assert(map('owner','notes').has(id),id);assert.equal(map('owner','notes').has('future'),false);
  assert.equal(noteWrites-before,3,'only accepted notes count as writes');assert.equal(a.store.notes().some(n=>n.id==='future'),true,'the refused note stays on the device');
  // Account isolation: another account neither sees nor uploads the owner's notes.
  await b.login('second');await settle();assert.equal(b.store.notes().length,0);assert.equal(map('second','notes').size,0);
  await b.login('owner');await settle();assert.equal(b.store.notes().length,64);
 }finally{a.connection.close();b.connection.close();}

 // A notes rule that is not published yet: answers still sync, notes wait locally, and a later retry picks them up.
 notesRules=false;const c=client();
 try{
  await settle();c.write(note('wait-1','규칙 게시 전 의견',at+500));c.answer('answer-while-denied');await settle();
  assert(map('owner','events').has('answer-while-denied'),'Answer records are not held back by notes');assert.equal(map('owner','notes').has('wait-1'),false);
  notesRules=true;for(let i=0;i<10;i++)c.connection.retry();await settle();
  assert(map('owner','notes').has('wait-1'),'Notes resume after the rule appears');
 }finally{c.connection.close();}

 // A local store that throws on merge (for example storage full) still uploads notes.
 const full=client();try{await settle();full.store.mergeNotes=()=>{throw Error('Local save failed');};full.write(note('while-full','저장공간 가득',at+600));await settle();full.write(note('while-full-2','두 번째',at+700));await settle();
  assert(map('owner','notes').has('while-full')&&map('owner','notes').has('while-full-2'),'uploads continue when the local merge fails');}finally{full.connection.close();}

 // An older store without note support keeps working exactly as before.
 const old=client({withNotes:false});try{await settle();old.answer('legacy-store');await settle();assert(map('owner','events').has('legacy-store'));}finally{old.connection.close();}
 console.log('PASS question notes: validation, two devices, replay once, offline queue, malformed note skipped, refused note set aside without blocking others, account isolation, answers not blocked by a missing rule, uploads survive a failing local store, legacy store');
})().catch(e=>{console.error(e);process.exitCode=1;});
