// Quantifies the billed-read effect of Firestore offline persistence on this app's listeners.
// This is a SIMULATION of documented SDK behaviour, not a measurement of real Firestore
// traffic: it drives the real sync.js controller against a mock server that bills reads the
// way Firestore does, and models the two documented listen paths.
//   - No persistence (today): the cache is in-memory only, so every page load starts a fresh
//     listen with no resume token. The server replies with the whole result set: N reads.
//   - With persistence (db.enablePersistence): the result set and its resume token survive the
//     reload in IndexedDB. onSnapshot serves the cached documents first (0 reads, fromCache),
//     then resumes the listen from the token, so the server sends only documents changed since
//     it: K reads, where K is independent of history length.
// Reference: Firestore listen semantics — "if the listener is resumed with a resume token the
// server sends only the changes since that token"; reads are billed per document delivered
// from the server.
const vm=require('node:vm'),fs=require('node:fs'),core=require('./sync-core.js'),credit=require('./study-credit.js');
const EVENTS=2000,day=i=>new Date(Date.UTC(2026,0,1+Math.floor(i/20))).toISOString().slice(0,10);
const log=new Map();for(let i=0;i<EVENTS;i++){const d=day(i);log.set('e'+i,{id:'e'+i,cardId:'card-'+(i%1489),date:d,at:d+'T03:00:00.000Z',result:i%7?'correct':'wrong',mode:'quiz'});}
function run({persistence,cachedDocs,changedSinceToken}){
 let billed=0,fromCacheSnapshots=0,serverSnapshots=0;
 const state={version:2,cards:[...new Set([...log.values()].map(e=>e.cardId))].map(id=>({id,subject:'한국사',question:'q',answer:'a',created:'2026-01-01',due:'2026-01-02',ease:2.5,interval:0,streak:0})),history:[]};
 let current=state;
 const store={get:()=>structuredClone(current),merge(rows){current=core.merge(current,rows);},switchUser(){}};
 const docsOf=ids=>[...ids].map(id=>({id,data:()=>structuredClone(log.get(id))}));
 const auth={currentUser:{uid:'owner'},onAuthStateChanged(fn){queueMicrotask(()=>fn(this.currentUser));return()=>{};}};
 const listen=(options,fn)=>{
  if(persistence){
   // 1) cached documents, billed as zero, flagged fromCache so the controller waits for server.
   fromCacheSnapshots++;queueMicrotask(()=>fn({metadata:{fromCache:true,hasPendingWrites:false},docs:docsOf(cachedDocs)}));
   // 2) the resumed listen: only documents changed since the stored resume token are billed.
   billed+=changedSinceToken.length;serverSnapshots++;
   queueMicrotask(()=>fn({metadata:{fromCache:false,hasPendingWrites:false},docs:docsOf(log.keys())}));
  }else{
   // No cache survives the reload, so the listen starts cold: the full result set is billed.
   billed+=log.size;serverSnapshots++;
   queueMicrotask(()=>fn({metadata:{fromCache:false,hasPendingWrites:false},docs:docsOf(log.keys())}));
  }
  return()=>{};
 };
 const db={collection(name){return {doc(uid){
  if(name==='allowedUsers')return {async get(){return {exists:true};}};
  return {collection(){return {doc(id){return {uid,id};},onSnapshot:listen};}};
 }};},batch(){return {set(){},async commit(){}};}};
 const context={ProgressSync:core,StudyCredit:credit,navigator:{onLine:true},setInterval:()=>1,clearInterval(){},addEventListener(){},removeEventListener(){}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/sync.js','utf8'),context);
 const connection=context.ProgressCloud.connect({auth,db,store,status(){}});
 return {reads:()=>billed,cacheSnapshots:()=>fromCacheSnapshots,serverSnapshots:()=>serverSnapshots,connection,history:()=>current.history.length};
}
(async()=>{
 const settle=async()=>{for(let i=0;i<40;i++)await new Promise(r=>setImmediate(r));};
 const cold=run({persistence:false,cachedDocs:[],changedSinceToken:[]});await settle();
 const first=run({persistence:true,cachedDocs:[],changedSinceToken:[...log.keys()]});await settle();
 const warm=run({persistence:true,cachedDocs:[...log.keys()],changedSinceToken:['e0','e1','e2']});await settle();
 const out=[
  ['reload today (no persistence)',cold.reads()],
  ['first load with persistence (cache empty, token absent)',first.reads()],
  ['reload with persistence (3 events added elsewhere)',warm.reads()]];
 for(const [label,n]of out)console.log(String(n).padStart(5)+' billed document reads · '+label);
 const saved=cold.reads()-warm.reads();
 console.log('events in the simulated log: '+log.size+'; history rebuilt identically in all three runs: '+
  [cold,first,warm].every(r=>r.history()===log.size));
 console.log('reload saving: '+saved+'/'+cold.reads()+' reads ('+(100*saved/cold.reads()).toFixed(1)+'%); '+
  'warm reads scale with events changed since the last load, not with history length.');
 console.log('NOTE simulated from documented resume-token behaviour (firebase 12.2.1 compat). '+
  'Real Firestore traffic and multi-device behaviour were NOT measured: no credentials, no deploy.');
 for(const r of [cold,first,warm])r.connection.close();
})();
