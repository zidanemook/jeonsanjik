const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),core=require('./sync-core.js');
// 외울 것에서 연 칸의 동기화(users/{uid}/state/memorize 한 문서, at이 큰 쪽이 이긴다). 가짜 Firestore로 두 기기를 흉내 낸다.
// 서버 규칙은 여기서 실행하지 않는다. 가짜 서버가 게시된 규칙이 허용하는 동작(더 새것만 덮어씀, 규칙이 없으면 거절)만 흉내 낸다.
const remote=new Map(),listeners=new Set(),docs=new Map(),docListeners=new Set();let online=true,memoRules=true,memoWrites=0;
const clock=[];let timerId=0;
const timers={setTimeout(fn){const t={id:++timerId,fn};clock.push(t);return t.id;},clearTimeout(id){const i=clock.findIndex(t=>t.id===id);if(i>=0)clock.splice(i,1);}};
const key=(uid,type)=>uid+'/'+type,map=(uid,type)=>remote.get(key(uid,type))||new Map();
const snapshot=(uid,type)=>({metadata:{fromCache:false,hasPendingWrites:false},docs:[...map(uid,type)].map(([id,value])=>({id,data:()=>structuredClone(value)}))});
const stateDoc=k=>({exists:docs.has(k),data:()=>structuredClone(docs.get(k)),metadata:{fromCache:false,hasPendingWrites:false}});
const emitDoc=k=>{for(const l of docListeners)if(l.k===k)queueMicrotask(()=>l.fn(stateDoc(k)));};
const empty=()=>({version:2,cards:[],history:[]});
function client(){
 let current=empty(),authCallback;const events=new Map();
 const store={get:()=>structuredClone(current),merge(rows){current=core.merge(current,rows);},switchUser(){},
  session:()=>null,mergeSession(){},
  memo:()=>current.memorizeAt?{at:current.memorizeAt,shown:[...(current.memorizeShown||[])]}:null,
  mergeMemo(row){if(!(row.at>(current.memorizeAt||0)))return;current={...current,memorizeShown:[...row.shown],memorizeAt:row.at};}};
 const auth={currentUser:{uid:'owner'},onAuthStateChanged(fn){authCallback=fn;queueMicrotask(()=>fn(this.currentUser));return()=>{};}};
 const db={collection(name){return {doc(uid){
  if(name==='allowedUsers')return {async get(){if(!online)throw Error('offline');return {exists:uid==='owner'};}};
  return {collection(type){return {
   doc(id){if(type!=='state')return {uid,type,id};const k=uid+'/'+id,denied=id==='memorize'&&!memoRules;return {
    onSnapshot(options,fn,error){if(denied){queueMicrotask(()=>error(Object.assign(Error('denied'),{code:'permission-denied'})));return()=>{};}const l={k,fn};docListeners.add(l);queueMicrotask(()=>fn(stateDoc(k)));return()=>docListeners.delete(l);},
    async set(value){if(!online)throw Error('offline');if(denied)throw Object.assign(Error('denied'),{code:'permission-denied'});
     if(id==='memorize'){core.memo(value);assert.deepEqual(Object.keys(value).sort(),['at','shown'],'only at and shown are sent');memoWrites++;}
     const old=docs.get(k);if(old&&!(value.at>old.at))throw Object.assign(Error('older'),{code:'permission-denied'});docs.set(k,structuredClone(value));emitDoc(k);}
   };},
   onSnapshot(options,fn){const l={uid,type,fn};listeners.add(l);queueMicrotask(()=>fn(snapshot(uid,type)));return()=>listeners.delete(l);}
  };}};
 }};},batch(){const writes=[];return {set(ref,value){writes.push({ref,value});},async commit(){if(!online)throw Error('offline');for(const {ref,value}of writes){const m=map(ref.uid,ref.type);m.set(ref.id,structuredClone(value));remote.set(key(ref.uid,ref.type),m);}}};}};
 const context={ProgressSync:core,navigator:{onLine:true},setInterval:()=>1,clearInterval(){},addEventListener(name,fn){events.set(name,fn);},removeEventListener(name){events.delete(name);},...timers};
 vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/sync.js','utf8'),context);const connection=context.ProgressCloud.connect({auth,db,store,status(){}});
 return {store,connection,shown:()=>[...(current.memorizeShown||[])].sort(),at:()=>current.memorizeAt||0,
  // app.js memorizeSave를 흉내 낸다: 목록과 저장 시각을 적고 저장 알림을 보낸다.
  save(at,keys){current={...current,memorizeShown:[...keys],memorizeAt:at};events.get('study-progress-saved')();}};
}
const tick=()=>new Promise(r=>setImmediate(r));async function settle(){for(let i=0;i<20;i++)await tick();}
async function elapse(){for(let i=0;i<12&&clock.length;i++){for(const t of clock.splice(0,clock.length))t.fn();await settle();}}
(async()=>{
 // 값 검증
 assert.deepEqual(core.memo({at:5,shown:['a:0:1','a:0:1','b:2:3']}),{at:5,shown:['a:0:1','b:2:3']},'duplicates collapse');
 for(const bad of [null,{at:0,shown:[]},{at:1.5,shown:[]},{at:1,shown:'x'},{at:1,shown:[1]},{at:1,shown:['공백 있는 이름']},{at:1,shown:Array(4001).fill('a:0:0')}])assert.throws(()=>core.memo(bad),'rejects '+JSON.stringify(bad)?.slice(0,40));
 // 두 기기: 폰에서 연 칸이 탭으로 넘어간다
 const phone=client(),tab=client();await settle();await elapse();
 assert.equal(memoWrites,0,'nothing is sent before the reader opens a cell');
 phone.save(1000,['hanneung-urgent:0:0','hanneung-urgent:0:1']);await settle();await elapse();
 assert.equal(memoWrites,1);assert.deepEqual(tab.shown(),['hanneung-urgent:0:0','hanneung-urgent:0:1'],'the tablet receives the phone cells');assert.equal(tab.at(),1000);
 // 탭에서 하나 더 열면 폰으로 넘어온다(더 새것이 이긴다)
 tab.save(2000,['hanneung-urgent:0:0','hanneung-urgent:0:1','silla-kings:0:3']);await settle();await elapse();
 assert.deepEqual(phone.shown(),['hanneung-urgent:0:0','hanneung-urgent:0:1','silla-kings:0:3']);
 // 초기화도 넘어간다
 phone.save(3000,[]);await settle();await elapse();
 assert.deepEqual(tab.shown(),[],'a reset reaches the other device');assert.equal(docs.get('owner/memorize').at,3000);
 // 더 옛것은 받아들이지 않는다(대조군: 서버가 거절하고 다른 기기도 그대로)
 const before=memoWrites;tab.store.mergeMemo({at:2500,shown:['x:0:0']});assert.deepEqual(tab.shown(),[],'an older state never replaces a newer one');
 // 같은 상태를 다시 알려도 또 보내지 않는다
 phone.save(3000,[]);await settle();await elapse();assert.equal(memoWrites,before,'the same state is not resent');
 // 새로 켠 기기는 서버의 것을 받는다
 tab.save(4000,['a:1:1']);await settle();await elapse();const pc=client();await settle();await elapse();assert.deepEqual(pc.shown(),['a:1:1'],'a freshly opened device catches up');
 // 연결이 끊긴 동안 연 칸은 다시 연결되면 간다
 online=false;phone.save(5000,['a:1:1','a:1:2']);await settle();await elapse();assert.deepEqual(tab.shown(),['a:1:1']);
 online=true;phone.save(5001,['a:1:1','a:1:2']);await settle();await elapse();assert.deepEqual(tab.shown(),['a:1:1','a:1:2'],'an offline change is delivered after reconnecting');
 // 서버 규칙이 아직 없을 때: 조용히 이 기기에만 남고 풀이 기록 동기화는 그대로 된다
 memoRules=false;const w=memoWrites,lone=client();await settle();await elapse();lone.save(9000,['z:0:0']);await settle();await elapse();
 assert.equal(memoWrites,w,'nothing is written while the rule is missing');assert.deepEqual(lone.shown(),['z:0:0'],'the cells stay on this device');
 console.log('PASS sync-memo: 값 검증(대조군 7종), 두 기기 주고받기, 초기화 전달, 옛것 거절, 같은 상태 다시 안 보냄, 새 기기 따라잡기, 끊겼다 이어짐, 규칙이 없을 때 조용히 기기에만 ('+memoWrites+'번 씀)');
})().catch(e=>{console.error(e);process.exit(1);});
