// v248 저장 방식(IndexedDB 조각 + localStorage 작은 표시) 검사. 가짜 IndexedDB(트랜잭션 · 실패 주입) 위에서 app.js를 브라우저와 같은 방식(색인 + 조각)으로 돌린다.
//  1 조각으로 나누기 · 다시 붙이기        2 빈 기기              3 옛 상태 옮기기(44일 — 옛 판이 읽는 것과 같음, 옛 글 · 사본 보존, 기록 파일)
//  4 큰 상태 옮기기(풀이 3,000 / 10,000 / 60,000)   5 두 번 돌려도 같음    6 옮기다 끊김(쓰기 실패 · 확인 전 끊김 · 탭 닫힘)
//  7 옮긴 뒤 옛 판 탭이 더 씀(합집합)     8 저장 실패(IndexedDB · 둘 다 · 옛 방식)   9 다른 탭   10 브라우저가 지움 · 열리지 않음
//  11 옛 글 치우기(14일)                  12 계정 바꾸기         13 옛 판 기기와 가짜 Firestore로 왕복
// 사용자의 실제 기록은 쓰지 않는다. 옛 판 = fixtures/v247(f00a20e의 app.js · sync.js · sync-core.js).
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const Heavy=require('./fixtures/heavy-state.cjs');
const DIR=__dirname,read=f=>fs.readFileSync(path.join(DIR,f),'utf8'),J=x=>JSON.stringify(x);
// 가짜 브라우저(vm) 안에서 만든 값은 원형이 달라 deepEqual이 통하지 않는다 → 열쇠를 정렬한 글로 견준다.
const sortKeys=v=>Array.isArray(v)?v.map(sortKeys):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,sortKeys(v[k])])):v;
const canon=v=>JSON.stringify(sortKeys(v));
// 어디가 다른지 한 줄로(상태 전체를 찍으면 수 MB다).
function firstDiff(a,b,at='$'){if(a===b)return null;if(typeof a!=='object'||typeof b!=='object'||!a||!b)return at+': '+JSON.stringify(a)?.slice(0,160)+' ≠ '+JSON.stringify(b)?.slice(0,160);
 if(Array.isArray(a)&&Array.isArray(b)&&a.length!==b.length)return at+': 길이 '+a.length+' ≠ '+b.length;
 for(const k of new Set([...Object.keys(a),...Object.keys(b)])){const d=firstDiff(a[k],b[k],at+'.'+k);if(d)return d;}return null;}
const sameText=(x,y,m)=>{if(x!==y)assert.fail((m||'다르다')+' — '+firstDiff(JSON.parse(x),JSON.parse(y)));};
const same=(a,b,m)=>sameText(canon(a),canon(b),m);
const QUOTA=5242880; // Edge · Chrome의 localStorage 한도(글자 수, 키 + 값)

// ── 가짜 IndexedDB: 저장소 · 범위 읽기 · 트랜잭션(차례로 하나씩, 끝나야 반영, 취소하면 흔적 없음) · 실패 주입 ──
function createBackend(){
 const stores=new Map(),queue=[];let created=false,running=false,conns=0;
 const control={failWrites:false,failTx:new Set(),failOpen:false,hangOpen:false,txCount:0,rwCount:0,afterCommit:null,failPut:null};
 const type=x=>Array.isArray(x)?3:typeof x==='string'?2:1;
 const cmp=(a,b)=>{if(type(a)!==type(b))return type(a)-type(b);if(type(a)===3){for(let i=0;i<Math.min(a.length,b.length);i++){const c=cmp(a[i],b[i]);if(c)return c;}return a.length-b.length;}return a<b?-1:a>b?1:0;};
 class Range{constructor(lower,upper,lowerOpen,upperOpen){Object.assign(this,{lower,upper,lowerOpen:!!lowerOpen,upperOpen:!!upperOpen});}
  has(k){const a=cmp(k,this.lower),b=cmp(k,this.upper);return (a>0||(!this.lowerOpen&&a===0))&&(b<0||(!this.upperOpen&&b===0));}}
 const K=k=>JSON.stringify(k),quotaError=()=>Object.assign(Error('QuotaExceededError'),{name:'QuotaExceededError'});
 const view=(tx,name)=>{const out=new Map(stores.get(name));for(const [k,v]of tx._overlay.get(name)){if(v.deleted)out.delete(k);else out.set(k,v);}return out;};
 const size=()=>{let n=0;for(const m of stores.values())for(const [k,v]of m)n+=k.length+JSON.stringify(v.value).length;return n;};
 function finish(tx,how,error){if(tx._state==='done')return;tx._state='done';if(how==='complete'){for(const [name,m]of tx._overlay){const s=stores.get(name);for(const [k,v]of m){if(v.deleted)s.delete(k);else s.set(k,v);}}if(tx.oncomplete)tx.oncomplete({target:tx});}else{tx.error=error||tx.error||null;if(tx.onabort)tx.onabort({target:tx});}}
 function next(){queue.shift();running=false;pump();}
 function step(tx){setImmediate(()=>{
  if(tx._state==='done'){next();return;}
  const job=tx._reqs.shift();
  if(!job){ // 남은 요청이 없다 → 끝낸다(실패 주입은 여기서: 한도 · 지정한 트랜잭션).
   if(tx._dead){tx._state='done';next();return;}
   if(tx.mode==='readwrite'&&(control.failWrites||control.failTx.has(tx._rw)))finish(tx,'abort',quotaError());
   else{finish(tx,'complete');if(tx.mode==='readwrite'&&control.afterCommit)control.afterCommit(tx);}
   next();return;}
  try{job.r.result=job.fn();}catch(e){job.r.error=e;try{job.r.onerror&&job.r.onerror({target:job.r});}catch{}finish(tx,'abort',e);next();return;}
  try{job.r.onsuccess&&job.r.onsuccess({target:job.r});}catch(e){finish(tx,'abort',e);next();return;}
  step(tx);});}
 function pump(){if(running||!queue.length)return;running=true;step(queue[0]);}
 function connect(){
  const id=++conns;
  function transaction(names,mode='readonly'){
   const tx={mode,error:null,oncomplete:null,onabort:null,_conn:id,_reqs:[],_overlay:new Map(names.map(n=>[n,new Map()])),_state:'pending',_n:++control.txCount,_rw:mode==='readwrite'?++control.rwCount:0,
    commit(){},abort(){if(tx._state==='done')throw Error('InvalidStateError');const error=tx.error;tx._state='aborting';queueMicrotask(()=>{tx._state='pending';finish(tx,'abort',error);});tx._reqs.length=0;},
    objectStore(name){assert.ok(tx._overlay.has(name),'store in scope: '+name);
     const request=fn=>{if(tx._state!=='pending')throw Error('TransactionInactiveError');const r={onsuccess:null,onerror:null,result:undefined,error:null};tx._reqs.push({r,fn});return r;};
     const keys=q=>q instanceof Range?[...view(tx,name)].filter(([,v])=>q.has(v.key)).sort((a,b)=>cmp(a[1].key,b[1].key)):null;
     return {get:key=>request(()=>{const v=view(tx,name).get(K(key));return v?structuredClone(v.value):undefined;}),
      put:(value,key)=>request(()=>{assert.equal(tx.mode,'readwrite');if(control.failPut&&control.failPut(name,key))throw quotaError();tx._overlay.get(name).set(K(key),{key,value:structuredClone(value)});return key;}),
      delete:q=>request(()=>{assert.equal(tx.mode,'readwrite');const o=tx._overlay.get(name);const hit=keys(q);if(hit)for(const [k,v]of hit)o.set(k,{key:v.key,deleted:true});else o.set(K(q),{key:q,deleted:true});}),
      getAll:(q,count)=>request(()=>{const hit=keys(q)||[...view(tx,name)].sort((a,b)=>cmp(a[1].key,b[1].key));return hit.slice(0,count||Infinity).map(([,v])=>structuredClone(v.value));})};}};
   queue.push(tx);pump();return tx;
  }
  const db={objectStoreNames:{contains:n=>stores.has(n)},createObjectStore(n){stores.set(n,new Map());},transaction,close(){},onversionchange:null,onclose:null};
  const indexedDB={open(){const r={onsuccess:null,onerror:null,onupgradeneeded:null,onblocked:null,result:null,error:null};
   setImmediate(()=>{if(control.hangOpen)return;if(control.failOpen){r.error=Error('open failed');r.onerror&&r.onerror();return;}r.result=db;if(!created){created=true;r.onupgradeneeded&&r.onupgradeneeded();}r.onsuccess&&r.onsuccess();});return r;}};
  return {indexedDB,IDBKeyRange:{bound:(a,b,c,d)=>new Range(a,b,c,d)},id};
 }
 // 탭이 닫힘: 그 연결의 트랜잭션은 끝난 것도 실패한 것도 아니게 사라진다(콜백이 오지 않는다).
 const kill=id=>{for(const tx of queue)if(tx._conn===id){tx._dead=true;tx._reqs.length=0;tx.oncomplete=tx.onabort=null;}};
 const dump=()=>Object.fromEntries([...stores].map(([n,m])=>[n,Object.fromEntries([...m].sort().map(([k,v])=>[k,v.value]))]));
 const get=(name,key)=>stores.get(name)?.get(K(key))?.value;
 const keysOf=(name,prefix)=>stores.has(name)?[...stores.get(name).values()].filter(v=>v.key===prefix||(Array.isArray(v.key)&&v.key[0]===prefix)).map(v=>v.key):[];
 const wipe=()=>{for(const m of stores.values())m.clear();};
 return {connect,control,kill,dump,get,keysOf,wipe,stores,size,busy:()=>queue.length>0};
}

// ── 앱 한 대(가짜 DOM + 가짜 시계). build: 'new' = 지금 파일 · 'old' = fixtures/v247 ──
const OLD=new Set(['app.js','sync.js','sync-core.js']);
const scriptList=build=>[...read('index.html').matchAll(/<script src="([^"?]+)\?v=\d+"><\/script>/g)].map(m=>m[1]).filter(f=>f!=='firebase-config.js'&&!(build==='old'&&f==='storage.js'));
const sources=new Map();const source=(f,build)=>{const k=build+'/'+f;if(!sources.has(k))sources.set(k,new vm.Script(build==='old'&&OLD.has(f)?read('fixtures/v247/'+f):read(f),{filename:(build==='old'&&OLD.has(f)?'v247/':'')+f}));return sources.get(k);};
function el(tag='div'){const node={tag,children:[],attrs:{},dataset:{},_text:'',hidden:false,disabled:false,open:false,
 get textContent(){return node._text;},set textContent(v){node._text=String(v);node.children=[];},append(...k){node.children.push(...k);},replaceChildren(...k){node.children=k;},
 classList:{add(){},remove(){},toggle(){},contains(){return false;}},setAttribute(){},getAttribute(){},focus(){},setSelectionRange(){},addEventListener(){},click(){node.clicked=(node.clicked||0)+1;},remove(){},
 querySelector(sel){return sel==='summary'?el('summary'):null;},querySelectorAll(){return [];}};return node;}
let uuidSeq=1;
function makeLocal(){const map=new Map(),local={map,quota:Infinity,fail:false,
 getItem:k=>map.has(k)?map.get(k):null,removeItem:k=>{map.delete(k);},
 setItem(k,v){v=String(v);let n=k.length+v.length;for(const [a,b]of map)if(a!==k)n+=a.length+b.length;if(local.fail||n>local.quota)throw Object.assign(Error('QuotaExceededError'),{name:'QuotaExceededError'});map.set(k,v);},
 size(){let n=0;for(const [a,b]of map)n+=a.length+b.length;return n;}};return local;}
async function boot({build='new',local,backend=null,now=Date.parse('2026-10-08T03:00:00Z'),sync=false}){
 const nodes=new Map(),clock={now},timers=[],listeners=new Map(),conn=backend?backend.connect():null,blobs=[];
 nodes.set('#card .paper-image img',Object.assign(el('img'),{complete:true,naturalWidth:10}));
 const RealDate=Date;class FakeDate extends RealDate{constructor(...a){if(a.length)super(...a);else super(clock.now);}static now(){return clock.now;}}
 const doc={createElement:t=>el(t),createTextNode(t){const n=el('#text');n._text=String(t);return n;},body:el('body'),activeElement:null,hidden:false,visibilityState:'visible',
  querySelector(sel){if(!nodes.has(sel))nodes.set(sel,el(sel));return nodes.get(sel);},querySelectorAll(){return [];},addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);}};
 const ctx={document:doc,console,localStorage:local,crypto:{randomUUID:()=>'7e57'+build.slice(0,3)+'-0000-4000-8000-'+(uuidSeq++).toString(16).padStart(12,'0')},
  history:{state:{depth:0},pushState(s){this.state=s;},replaceState(s){this.state=s;}},navigator:{onLine:true,storage:{persisted:async()=>false,persist:async()=>true}},
  setInterval:()=>1,clearInterval(){},setTimeout(fn,ms){timers.push({fn,ms});return timers.length;},clearTimeout(id){if(timers[id-1])timers[id-1].fn=null;},
  structuredClone,queueMicrotask,scrollTo(){},location:{reload(){}},
  addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);},removeEventListener(type,fn){const l=listeners.get(type)||[];const i=l.indexOf(fn);if(i>=0)l.splice(i,1);},
  dispatchEvent(e){for(const fn of [...(listeners.get(e.type)||[])])fn(e);},
  URL:{createObjectURL:b=>{blobs.push(b);return 'blob:'+blobs.length;},revokeObjectURL(){}},Blob:class{constructor(parts,o){this.parts=parts;this.type=o&&o.type;}},
  Date:FakeDate,JSON,Math,Set,Map,Number,String,Object,Array,Error,RegExp,Intl,Promise,TextDecoder,Uint8Array,Event:class{constructor(t){this.type=t;}}};
 if(conn){ctx.indexedDB=conn.indexedDB;ctx.IDBKeyRange=conn.IDBKeyRange;}
 ctx.window=ctx;ctx.self=ctx;vm.createContext(ctx);
 ctx.fetch=url=>{let m=/^chunks\/([a-z]-[a-z0-9-]+)\.json/.exec(url);if(m){const b=fs.readFileSync(path.join(DIR,'chunks',m[1]+'.json'));return Promise.resolve({ok:true,status:200,arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.length))});}
  m=/^gichul\/([a-z0-9-]+)\.json$/.exec(url);if(m)return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(JSON.parse(read('gichul/'+m[1]+'.json')))});return Promise.reject(Error('unexpected fetch '+url));};
 for(const f of scriptList(build)){if(f==='sync.js'&&!sync)continue;source(f,build).runInContext(ctx);}
 const run=code=>vm.runInContext(code,ctx),tick=()=>new Promise(r=>setImmediate(r)),settle=async(n=12)=>{for(let round=0;round<200;round++){for(let i=0;i<n;i++)await tick();if(!backend||!backend.busy())break;}for(let i=0;i<4;i++)await tick();};
 const app={build,ctx,run,nodes,clock,timers,local,backend,conn,blobs,settle,
  text:sel=>nodes.get(sel)?.textContent||'',
  mode:()=>build==='old'?'local':run('idb?"idb":"local"'),
  state:()=>run('StudyProgress.get()'),
  async open(scope){run('openScope('+J(scope)+')');await settle();},
  // 지금 화면의 문제에 답한다(wrong이면 틀리게). 채점되면 그 풀이 id.
  async answer(wrong=false){if(!run('!!data.activePractice&&!data.quizFeedback'))return null;const quiz=run('data.activePractice.exercise'),id=run('data.activePractice.cardId');
   const input=quiz.type==='choice'?(wrong?(quiz.correctIndex+1)%quiz.choices.length:quiz.correctIndex):(wrong?'zzz not the answer':quiz.answers[0]);
   clock.now+=30000;run('answerPractice('+J(id)+','+J(input)+')');await settle();return run('data.quizFeedback?data.quizFeedback.reviewId:null');},
  async next(){clock.now+=15000;run("(()=>{const s=structuredClone(data);delete s.quizFeedback;delete s.activePractice;if(commit(s)){sessionDirty=true;render();}})()");await settle();},
  async solve(n,scope,wrongEvery=0){const ids=[];await app.open(scope);for(let i=0;i<n;i++){const id=await app.answer(wrongEvery&&i%wrongEvery===0);assert.ok(id,'답이 채점된다('+J(scope)+' '+i+')');ids.push(id);await app.next();}return ids;},
  fireTimers(){for(const t of timers.splice(0))if(t.fn)t.fn();},
  close(){if(backend&&conn)backend.kill(conn.id);}};
 if(build==='new')await run('started');
 await settle();return app;
}
// 견줄 모양: 문제 일정(글 없는 칸) · 풀이(사본 붙임) · 열람 · 나머지 칸. 사본은 app.details로 붙인다.
const SCHEDULE=['id','created','due','ease','interval','streak','chance','relearn','retryAt'];
const pick=(o,keys)=>{const out={};for(const k of keys)if(o[k]!==undefined)out[k]=o[k];return out;};
const leanCards=cards=>cards.map(c=>pick(c,SCHEDULE));
function fullHistory(app,rows){const b=app.backend,key=app.run('KEY');return rows.map(h=>{if(h.detail||h.ex===undefined)return h;const {ex,cid,...row}=h,d=app.run('pendingDetails').get(h.id)||b.get('detail',[key,h.id])?.d;assert.ok(d,'사본이 있다: '+h.id);return {...row,detail:d};});}
const whole=(app,s=app.state())=>({...s,cards:leanCards(s.cards),history:app.mode()==='idb'?fullHistory(app,s.history):s.history});
const baseRaw=Heavy.baseRaw();
const time=async(label,fn)=>{const t=Date.now(),v=await fn();return [v,Date.now()-t];};

(async()=>{
 const report=[];
 // ── 1. 조각 ──
 {const ctx={localStorage:makeLocal(),setTimeout:()=>0,clearTimeout(){},navigator:{}};const b=createBackend(),c=b.connect();ctx.indexedDB=c.indexedDB;ctx.IDBKeyRange=c.IDBKeyRange;vm.createContext(ctx);source('storage.js','new').runInContext(ctx);
  const S=ctx.StudyStorage,boot0=await S.ready;assert.equal(boot0.available,true);assert.equal(boot0.loaded,null);assert.equal(boot0.key,'chagog-v1');
  const state={version:3,cards:Array.from({length:300},(_,i)=>({id:'c'+i,created:'2026-10-01',due:'2026-10-01',ease:2.5,interval:0,streak:0})),quizUiVersion:1,history:Array.from({length:130},(_,i)=>({id:'h'+i,cardId:'c'+(i%7),date:'2026-10-02',result:'correct',ex:'e'+i,cid:'g'})),notes:[{a:1}],explanationViews:[{id:'h1',openedAt:5}],session:{at:1}};
  const p=S.handle('chagog-v1',null,null);await S.write(p,state,new Map([['h0',{q:'문제'}],['h1',{q:'둘'}]]),{});
  same(p.counts,{c:3,h:3,v:1});assert.equal(p.rev,1);
  const loaded=await S.read('chagog-v1'),asm=S.assemble(loaded);assert.equal(JSON.stringify(asm.state),JSON.stringify(state),'다시 붙이면 열쇠 순서까지 같다');
  same([...(await S.details('chagog-v1',['h1','h0','none']))].sort(),[['h0',{q:'문제'}],['h1',{q:'둘'}]]);
  // 한 줄만 바꾸면 그 조각과 core만 다시 쓴다(rev + 1).
  const before=b.dump();state.cards[200]={...state.cards[200],streak:1};state.session={at:2};await S.write(p,state,null,{});
  const after=b.dump(),changed=Object.keys(after.seg).filter(k=>JSON.stringify(after.seg[k])!==JSON.stringify(before.seg[k]));same(changed.sort(),['["chagog-v1","c",1]','["chagog-v1","core",0]']);assert.equal(p.rev,2);
  // 줄어들면 남는 조각을 지운다. 해설 열람이 없는 상태는 없는 채로 돌아온다.
  const small={version:3,cards:state.cards.slice(0,10),history:[]};await S.write(p,small,null,{});assert.equal(JSON.stringify(S.assemble(await S.read('chagog-v1')).state),JSON.stringify(small));assert.equal(b.keysOf('seg','chagog-v1').length,2);
  // 다른 손잡이(다른 탭)가 쓴 뒤의 옛 손잡이는 conflict.
  const stale=S.handle('chagog-v1',loaded,asm);await assert.rejects(S.write(stale,state,null,{}),e=>e.conflict===true);assert.equal(JSON.stringify(S.assemble(await S.read('chagog-v1')).state),JSON.stringify(small),'conflict는 아무것도 쓰지 않는다');
  // 빠진 조각은 읽지 않는다.
  await S.write(p,state,null,{});const l2=await S.read('chagog-v1');l2.segs=l2.segs.filter(x=>!(x.k==='h'&&x.i===1));assert.throws(()=>S.assemble(l2),/Missing segment h:1/);
  // 사본 전부 넘기기(묶음 경계).
  const many=new Map(Array.from({length:25},(_,i)=>['d'+String(i).padStart(2,'0'),{n:i}]));await S.write(p,state,many,{});const seen=[];await S.eachDetail('chagog-v1',(id,d)=>seen.push(id),10);assert.equal(seen.length,27);assert.equal(new Set(seen).size,27);
  assert.notEqual(J(S.fingerprint('a'.repeat(5000)+'b')),J(S.fingerprint('a'.repeat(5000)+'c')));assert.equal(S.fingerprint('x'.repeat(70)).len,70);
 }
 // ── 2. 빈 기기 ──
 {const local=makeLocal(),backend=createBackend();local.quota=QUOTA;
  const a=await boot({local,backend});assert.equal(a.mode(),'idb');const total=a.state().cards.length;assert.ok(total>15000,'문제가 모두 들어온다');
  assert.equal(local.getItem('chagog-v1'),null,'상태는 localStorage에 쓰지 않는다');assert.ok(local.size()<200,'localStorage에는 작은 표시만: '+local.size());
  assert.equal(backend.get('meta','chagog-v1').verified,true);
  const ids=await a.solve(3,{subject:'영어',topic:'Day 1',round:''},3);
  const row=a.state().history.at(-1);assert.equal(row.detail,undefined,'메모리의 풀이 줄에는 사본이 없다');assert.ok(row.ex&&row.cid,'ex · cid 두 칸만');
  const d=backend.get('detail',['chagog-v1',ids[2]]).d;assert.equal(d.exerciseId,row.ex);assert.equal(d.conceptId,row.cid);assert.ok(d.question.length>0&&d.explanation.length>0);
  assert.equal(a.text('#saveAlert')!==undefined&&a.nodes.get('#saveAlert').hidden,true);
  const wholeA=whole(a);a.close();
  const b=await boot({local,backend});same(whole(b),{...wholeA,scheduleVersion:3},'다시 열면 그대로다(일정 규칙 판 표시만 더해진다)');assert.equal(b.state().history.length,3);
  assert.ok(local.getItem('chagog-idb:chagog-v1'),'IndexedDB에 있다는 표시');
  report.push('빈 기기: 문제 '+total+' · localStorage '+local.size()+'자 · IndexedDB '+backend.size()+'자');
 }
 // ── 3. 44일 상태 옮기기 ──
 let after44;
 {const local=makeLocal(),backend=createBackend();local.quota=QUOTA;local.setItem('chagog-v1',baseRaw);
  // 옛 판이 같은 글을 읽은 모습(기준).
  const oldLocal=makeLocal();oldLocal.setItem('chagog-v1',baseRaw);const old=await boot({build:'old',local:oldLocal});const expected=whole(old);
  const screen=app=>['#due','#total','#done','#retention','#studyToday','#studyTotal','#studyCreditCount'].map(s=>app.text(s)).join(' | ')+' | '+app.run("JSON.stringify(Gichul.subjects.concat(['영어','국어','한국사']).map(s=>[s,questionCount(data.cards.filter(c=>isPlayable(c)&&c.subject===s)),reviewQueue(data.cards.filter(c=>c.subject===s),false,s).ready.length]))");
  old.run("go('progress')");const oldScreen=screen(old);
  const [a,ms]=await time('migrate',()=>boot({local,backend}));assert.equal(a.mode(),'idb');
  same(whole(a),expected,'옮긴 상태 = 옛 판이 읽은 상태(문제 일정 · 풀이와 사본 · 열람 · 설정 · 풀던 자리)');
  a.run("go('progress')");// 옛 판(v247)은 '풀이 N회 · 해설 M회', 새 판(v254~)은 '풀이 N회, 해설 M회' — 사이 글자만 맞춰 수를 견준다.
  assert.ok(oldScreen.includes('회 · 해설 '),'옛 판 화면 글의 꼴');assert.equal(screen(a),oldScreen.split('회 · 해설 ').join('회, 해설 '),'홈 · 진행상황의 수가 같다');
  assert.ok(local.getItem('chagog-v1')===baseRaw,'옛 글은 그대로 둔다');assert.ok(backend.get('backup','chagog-v1').raw===baseRaw,'backup 저장소에도 그대로 한 부');
  const meta=backend.get('meta','chagog-v1');assert.equal(meta.verified,true);assert.equal(meta.legacy.len,baseRaw.length);
  assert.equal(backend.keysOf('detail','chagog-v1').length,820);assert.ok(a.state().history.every(h=>h.detail===undefined&&h.ex));
  // 기록 파일 = 옛 형식 그대로 전부.
  const parts=await a.run('buildExport()'),file=JSON.parse(parts.join(''));assert.equal(file.exportComplete,true);a.run('validateBackup')(file);
  const {exportedAt,exportComplete,...fileState}=file;same({...fileState,cards:leanCards(fileState.cards)},expected,'기록 파일에 문제 일정 · 풀이 사본 · 열람 · 설정이 모두 있다');
  await a.run('downloadExport()');assert.equal(a.blobs.length,1);assert.equal(JSON.parse(a.blobs[0].parts.join('')).history.length,820);assert.match(a.text('#message'),/기록 파일을 내려받았어요\(풀이 820건\)/);
  // 이어서 풀면 조각 몇 개만 쓴다.
  const rw0=backend.control.rwCount,segBefore=backend.dump().seg;await a.solve(1,{subject:'국어',topic:'논리 1장',round:''});
  const segAfter=backend.dump().seg,changed=Object.keys(segAfter).filter(k=>JSON.stringify(segAfter[k])!==JSON.stringify(segBefore[k]));
  assert.ok(changed.length<=5&&changed.reduce((n,k)=>n+segAfter[k].s.length,0)<120000,'답 하나에 쓰는 조각: '+changed.join(' '));
  report.push('44일 상태(264만 자) 옮기기 '+ms+'ms · 답 하나에 쓴 조각 '+changed.length+'개 '+changed.reduce((n,k)=>n+segAfter[k].s.length,0)+'자(트랜잭션 '+(backend.control.rwCount-rw0)+'번)');
  after44={local,backend,expected,app:a};
 }
 // ── 5. 두 번 돌려도 같음 ──
 {const {local,backend}=after44;after44.app.close();await new Promise(r=>setImmediate(r));
  const b=await boot({local,backend}),dump1=JSON.stringify(backend.dump()),wholeB=canon(whole(b));b.close();
  const c=await boot({local,backend});sameText(JSON.stringify(backend.dump()),dump1,'다시 열어도 IndexedDB에 한 글자도 다시 쓰지 않는다');assert.equal(canon(whole(c)),wholeB);c.close();
  // 확인 표시가 없는 사본은 쓰지 않고 옛 글에서 다시 옮긴다(결과가 같다) — 옮긴 뒤 새 판에서 푼 한 건은 확인된 사본에만 있었으므로 여기서는 옛 글 기준으로 돌아간다.
  const m=backend.stores.get('meta').get(JSON.stringify('chagog-v1'));m.value={...m.value,verified:false};
  const d=await boot({local,backend});assert.equal(d.mode(),'idb');same(whole(d),after44.expected,'확인 안 된 사본은 버리고 옛 글에서 처음부터 다시');assert.equal(backend.get('meta','chagog-v1').verified,true);d.close();
 }
 // ── 4. 큰 상태 ──
 for(const N of [3000,10000,60000]){
  const state=Heavy.make(N),raw=JSON.stringify(state),local=makeLocal(),backend=createBackend();local.setItem('chagog-v1',raw);
  const [a,ms]=await time('migrate',()=>boot({local,backend}));assert.equal(a.mode(),'idb');
  const s=a.state();assert.equal(s.history.length,N);assert.equal(backend.keysOf('detail','chagog-v1').length,N);
  assert.equal(canon({...s,cards:leanCards(s.cards),history:fullHistory(a,s.history)}),canon({...state,cards:leanCards(state.cards)}),'풀이 '+N+'건: 옮긴 상태가 옛 상태와 같다');
  assert.ok(local.getItem('chagog-v1')===raw,'옛 글이 그대로다');
  const segChars=Object.values(backend.dump().seg).reduce((n,x)=>n+x.s.length,0),detailChars=backend.size()-segChars-raw.length;
  const t0=Date.now();const ids=await a.solve(2,{subject:'영어',topic:'Day 2',round:''});const per=(Date.now()-t0)/2;assert.equal(a.state().history.length,N+2);
  a.close();const [b,ms2]=await time('reopen',()=>boot({local,backend}));assert.equal(b.state().history.length,N+2);assert.ok(backend.get('detail',['chagog-v1',ids[1]]));
  assert.equal(b.run('pendingDetails.size'),0);b.close();
  report.push('풀이 '+N+'건(옛 글 '+(raw.length/1e6).toFixed(2)+'M자): 옮기기 '+ms+'ms · 다시 열기 '+ms2+'ms · 답 하나 '+Math.round(per)+'ms(가짜 DOM) · 조각 '+(segChars/1e6).toFixed(2)+'M자 · 사본 '+(detailChars/1e6).toFixed(2)+'M자');
 }
 // ── 6. 옮기다 끊김 ──
 {// (가) 쓰는 트랜잭션이 실패(공간 부족) → 옛 방식으로 그대로 돈다. 그날 푼 것은 옛 글에 남고, 다음에 열 때 함께 옮겨진다.
  const local=makeLocal(),backend=createBackend();local.setItem('chagog-v1',baseRaw);backend.control.failWrites=true;
  const a=await boot({local,backend});assert.equal(a.mode(),'local','옮기지 못하면 옛 방식');assert.equal(a.state().history.length,820);assert.equal(backend.get('meta','chagog-v1'),undefined);
  const [id]=await a.solve(1,{subject:'영어',topic:'Day 1',round:''});assert.equal(JSON.parse(local.getItem('chagog-v1')).history.at(-1).id,id,'옛 방식으로 저장됐다');assert.equal(a.nodes.get('#saveAlert').hidden,true);a.close();
  backend.control.failWrites=false;const b=await boot({local,backend});assert.equal(b.mode(),'idb');assert.equal(b.state().history.length,821);assert.ok(backend.get('detail',['chagog-v1',id]));b.close();
  // (나) 쓰기는 됐는데 확인 표시를 찍기 전에 끊김(둘째 쓰기 트랜잭션 실패) → 옛 방식. 다음에 다시.
  const local2=makeLocal(),backend2=createBackend();local2.setItem('chagog-v1',baseRaw);backend2.control.failTx.add(2);
  const c=await boot({local:local2,backend:backend2});assert.equal(c.mode(),'local');assert.equal(backend2.get('meta','chagog-v1').verified,false,'확인 안 된 사본이 남아 있다');
  const [id2]=await c.solve(1,{subject:'국어',topic:'논리 1장',round:''});c.close();
  const d=await boot({local:local2,backend:backend2});assert.equal(d.mode(),'idb');assert.equal(d.state().history.length,821);assert.equal(d.state().history.at(-1).id,id2,'확인 안 된 옛 사본이 아니라 그 뒤의 옛 글에서 옮겼다');
  assert.equal(backend2.keysOf('detail','chagog-v1').length,821);assert.equal(backend2.get('meta','chagog-v1').verified,true);d.close();
  // (다) 옮기는 도중 탭이 닫힘(트랜잭션이 끝나지도 실패하지도 않음) → 다음에 열면 처음부터.
  const local3=makeLocal(),backend3=createBackend();local3.setItem('chagog-v1',baseRaw);
  {const conn=backend3.connect(),ctx={localStorage:local3,indexedDB:conn.indexedDB,IDBKeyRange:conn.IDBKeyRange,setTimeout:()=>0,clearTimeout(){},navigator:{}};vm.createContext(ctx);source('storage.js','new').runInContext(ctx);
   const S=ctx.StudyStorage;await S.ready;const p=S.handle('chagog-v1',null,null);void S.write(p,{version:3,cards:[{id:'half'}],history:[]},null,{replace:true,verified:false}).catch(()=>{});backend3.kill(conn.id);}
  const e=await boot({local:local3,backend:backend3});assert.equal(e.mode(),'idb');assert.equal(e.state().history.length,820);assert.ok(!e.state().cards.some(c=>c.id==='half'));e.close();
  // (라) 옮긴 사본을 다시 읽었더니 다름(쓰는 중 한 조각이 바뀜) → 확인 표시를 찍지 않고 옛 방식.
  const local4=makeLocal(),backend4=createBackend();local4.setItem('chagog-v1',baseRaw);
  backend4.control.afterCommit=tx=>{if(tx._rw===1){const m=backend4.stores.get('detail');m.delete([...m.keys()][0]);}};
  const f=await boot({local:local4,backend:backend4});assert.equal(f.mode(),'local','다시 읽은 사본이 다르면 쓰지 않는다');assert.equal(backend4.get('meta','chagog-v1').verified,false);assert.equal(JSON.parse(local4.getItem('chagog-v1')).history.length,820,'옛 글은 그대로 쓰인다');f.close();
  const g=await boot({local:local4,backend:backend4});assert.equal(g.mode(),'idb');assert.equal(backend4.keysOf('detail','chagog-v1').length,820);g.close();
 }
 // ── 7. 옮긴 뒤 옛 판 탭이 더 씀 ──
 {const local=makeLocal(),backend=createBackend();local.setItem('chagog-v1',baseRaw);
  const a=await boot({local,backend});const [n1,n2]=await a.solve(2,{subject:'영어',topic:'Day 1',round:''});a.close();
  const old=await boot({build:'old',local});const [o1,o2,o3]=await old.solve(3,{subject:'국어',topic:'논리 2장',round:''},2);assert.equal(JSON.parse(local.getItem('chagog-v1')).history.length,823);
  const b=await boot({local,backend});const ids=new Set(b.state().history.map(h=>h.id));
  assert.equal(b.state().history.length,825,'새 판에서 푼 2건 + 옛 판 탭이 푼 3건이 모두 있다');for(const id of [n1,n2,o1,o2,o3])assert.ok(ids.has(id));
  for(const id of [o1,o2,o3]){assert.ok(backend.get('detail',['chagog-v1',id])||b.run('pendingDetails').get(id),'옛 판 풀이의 사본도 옮겨졌다');}
  await b.settle();const fp=backend.get('meta','chagog-v1').legacy;assert.equal(fp.len,local.getItem('chagog-v1').length,'합친 옛 글의 지문을 적었다');
  // 일정은 합친 기록에서 다시 계산한 것과 같다.
  const s=b.state(),re=b.run('ProgressSync.merge')(s,[]);assert.equal(canon(leanCards(re.cards)),canon(leanCards(s.cards)));
  const dump=JSON.stringify(backend.dump());b.close();const c=await boot({local,backend});assert.equal(c.state().history.length,825);sameText(JSON.stringify(backend.dump()),dump,'같은 옛 글을 다시 합치지 않는다(다시 쓰지도 않는다)');c.close();
 }
 // ── 8. 저장 실패 ──
 {// (가) IndexedDB 쓰기 실패: 답은 채점되고 메모리에 남고, 띠가 뜨고, localStorage에 넘겨 둔다. 되면 띠를 지운다.
  const local=makeLocal(),backend=createBackend();local.quota=QUOTA;
  const a=await boot({local,backend});await a.solve(1,{subject:'영어',topic:'Day 1',round:''});
  backend.control.failWrites=true;await a.open({subject:'영어',topic:'Day 1',round:''});
  assert.match(a.text('#message'),/이 기기에 저장하지 못했어요/,'처음 실패했을 때 아래 글로도 한 번 알린다');assert.equal(a.nodes.get('#saveAlert').hidden,false);
  const id=await a.answer(true);assert.ok(id,'저장이 실패해도 답은 채점된다');assert.equal(a.run('!!data.quizFeedback'),true,'채점 화면이 뜬다');
  assert.equal(a.state().history.at(-1).id,id,'풀이가 메모리에 남는다');assert.equal(a.nodes.get('#saveAlert').hidden,false,'띠가 떠 있다');
  const spill=JSON.parse(local.getItem('chagog-spill:chagog-v1'));same(spill.history.map(h=>h.id),[id]);assert.ok(spill.history[0].detail.question,'넘겨 둔 풀이에 사본이 있다');
  assert.equal((await a.run('StudyProgress.withDetails')([{id,cardId:spill.history[0].cardId,date:spill.history[0].date,at:spill.history[0].at,result:'wrong',mode:'quiz'}]))[0].detail.question,spill.history[0].detail.question,'올릴 줄에는 메모리의 사본이 붙는다');
  await a.next();const id2=await a.answer();assert.ok(id2,'계속 풀 수 있다');assert.equal(a.state().history.length,3);assert.equal(JSON.parse(local.getItem('chagog-spill:chagog-v1')).history.length,2);
  a.nodes.get('#message').textContent='';await a.next();assert.equal(a.text('#message'),'','같은 실패를 되풀이해 알리지 않는다(띠는 그대로)');assert.equal(a.nodes.get('#saveAlert').hidden,false);
  assert.ok(a.timers.some(t=>t.fn&&t.ms===15000),'15초 뒤 다시 시도를 걸어 둔다');
  // 기록 파일은 못 쓴 풀이까지 담는다.
  const file=JSON.parse((await a.run('buildExport()')).join(''));assert.equal(file.history.length,3);assert.ok(file.history.every(h=>h.detail&&h.detail.question));
  backend.control.failWrites=false;a.fireTimers();await a.settle();
  assert.equal(a.nodes.get('#saveAlert').hidden,true,'다시 저장되면 띠를 지운다');assert.match(a.text('#message'),/다시 저장됐어요/);assert.equal(local.getItem('chagog-spill:chagog-v1'),null);
  assert.ok(backend.get('detail',['chagog-v1',id])&&backend.get('detail',['chagog-v1',id2]));assert.equal(a.run('pendingDetails.size'),0);a.close();
  const b=await boot({local,backend});assert.equal(b.state().history.length,3);b.close();
  // (나) 실패한 채로 닫음 → 다음에 열 때 넘겨 둔 풀이를 합친다.
  const local2=makeLocal(),backend2=createBackend();const c=await boot({local:local2,backend:backend2});await c.solve(2,{subject:'영어',topic:'Day 1',round:''});
  backend2.control.failWrites=true;await c.open({subject:'국어',topic:'논리 1장',round:''});const lostId=await c.answer();await c.run('creditExplanation')(lostId);await c.settle();c.close();
  backend2.control.failWrites=false;assert.ok(local2.getItem('chagog-spill:chagog-v1'));
  const d=await boot({local:local2,backend:backend2});assert.equal(d.state().history.length,3,'넘겨 둔 풀이가 합쳐졌다');assert.equal(d.state().history.at(-1).id,lostId);assert.ok((d.state().explanationViews||[]).some(v=>v.id===lostId),'그 풀이의 해설 열람도');
  await d.settle();assert.ok(backend2.get('detail',['chagog-v1',lostId]),'사본도 IndexedDB에');assert.equal(local2.getItem('chagog-spill:chagog-v1'),null,'합친 것이 쓰인 뒤에 지운다');
  const card=d.state().cards.find(x=>x.id===d.state().history.at(-1).cardId);assert.ok(card.streak>=1,'합친 풀이로 일정이 다시 계산됐다');d.close();
  // (다) IndexedDB도 localStorage도 안 됨 → 메모리에만. 그래도 채점되고 띠가 뜬다.
  const local3=makeLocal(),backend3=createBackend();const e=await boot({local:local3,backend:backend3});backend3.control.failWrites=true;local3.fail=true;
  await e.open({subject:'영어',topic:'Day 1',round:''});const id3=await e.answer();assert.ok(id3);assert.equal(e.nodes.get('#saveAlert').hidden,false);assert.equal(e.state().history.length,1);
  backend3.control.failWrites=false;local3.fail=false;e.run('persist()');await e.settle();assert.equal(e.nodes.get('#saveAlert').hidden,true);assert.ok(backend3.get('detail',['chagog-v1',id3]));e.close();
  // (라) 옛 방식(IndexedDB 없음)에서 한도에 닿음 → 예전에는 답이 버려졌다. 이제 채점되고 띠가 뜨고, 공간이 나면 저장된다.
  const heavy=JSON.stringify(Heavy.make(2950)),local4=makeLocal();local4.quota=QUOTA;local4.setItem('chagog-v1',heavy);
  const oldLocal=makeLocal();oldLocal.quota=QUOTA;oldLocal.setItem('chagog-v1',heavy);const old=await boot({build:'old',local:oldLocal});await old.open({subject:'영어',topic:'',round:''});
  let dropped=0;for(let i=0;i<60&&!dropped;i++){const got=await old.answer();if(!got){dropped=i+1;break;}await old.next();}
  assert.ok(dropped>0&&dropped<60,'대조: 옛 판은 한도에서 답을 받지 못한다');assert.match(old.text('#message'),/기록은 변경되지 않았습니다/);
  const f=await boot({local:local4});assert.equal(f.mode(),'local');await f.open({subject:'영어',topic:'',round:''});
  let failedAt=0;for(let i=0;i<60;i++){const got=await f.answer();assert.ok(got,'옛 방식에서도 답은 언제나 채점된다');if(!failedAt&&!f.nodes.get('#saveAlert').hidden)failedAt=i+1;await f.next();}
  assert.ok(failedAt>0,'한도에 닿았다');assert.equal(f.state().history.length,3010);assert.ok(JSON.parse(local4.getItem('chagog-v1')).history.length<3010,'저장소에는 다 못 들어갔다');
  local4.quota=Infinity;f.fireTimers();assert.equal(JSON.parse(local4.getItem('chagog-v1')).history.length,3010,'공간이 나면 메모리의 것이 모두 저장된다');assert.equal(f.nodes.get('#saveAlert').hidden,true);
  report.push('한도 흉내(풀이 2,950건 옛 글): 옛 판은 '+dropped+'번째 답부터 받지 못함 → 새 판 옛 방식은 60건 모두 채점, '+failedAt+'번째부터 띠, 공간이 나자 3,010건 저장');
  // (마) 같은 옛 글을 IndexedDB가 있는 기기에서 열면: 옮겨지고 한도와 무관하게 풀린다.
  const backend5=createBackend(),g=await boot({local:local4,backend:backend5});assert.equal(g.mode(),'idb');local4.quota=QUOTA;await g.solve(40,{subject:'영어',topic:'',round:''});assert.equal(g.state().history.length,3050);assert.equal(g.nodes.get('#saveAlert').hidden,true);g.close();
 }
 // ── 9. 다른 탭 ──
 {const local=makeLocal(),backend=createBackend();const a=await boot({local,backend}),b=await boot({local,backend});
  const [ia]=await a.solve(1,{subject:'영어',topic:'Day 1',round:''});
  const [ib]=await b.solve(1,{subject:'국어',topic:'논리 1장',round:''});await b.settle(30);
  const idsB=b.state().history.map(h=>h.id);assert.ok(idsB.includes(ia)&&idsB.includes(ib),'늦게 쓴 탭이 먼저 쓴 탭의 풀이를 지우지 않고 합친다');assert.equal(b.nodes.get('#saveAlert').hidden,true);
  a.close();b.close();const c=await boot({local,backend});same(c.state().history.map(h=>h.id).sort(),[ia,ib].sort());
  // 쓰는 중에 저장소가 통째로 사라짐(브라우저가 지움) → 메모리의 상태를 처음부터 다시 쓴다(사본은 이미 메모리에 없으므로 풀이 줄 · 일정만).
  assert.ok(backend.get('detail',['chagog-v1',ia])&&backend.get('detail',['chagog-v1',ib]));
  backend.wipe();const [ic]=await c.solve(1,{subject:'영어',topic:'Day 2',round:''});await c.settle(30);assert.equal(c.nodes.get('#saveAlert').hidden,true);assert.equal(backend.get('meta','chagog-v1').verified,true);assert.ok(backend.get('detail',['chagog-v1',ic]));c.close();const d9=await boot({local,backend});assert.equal(d9.state().history.length,3);d9.close();
 }
 // ── 10. 브라우저가 지움 · 열리지 않음 ──
 {const local=makeLocal(),backend=createBackend();local.setItem('chagog-v1',baseRaw);const a=await boot({local,backend});await a.solve(1,{subject:'영어',topic:'Day 1',round:''});a.close();
  backend.wipe();const b=await boot({local,backend});assert.equal(b.mode(),'idb');assert.equal(b.state().history.length,820,'남아 있던 옛 글로 되살린다');assert.match(b.text('#message'),/브라우저가 지워서, 남아 있던 예전 기록으로 되살렸어요/);b.close();
  backend.wipe();local.removeItem('chagog-v1');const c=await boot({local,backend});assert.equal(c.state().history.length,0);assert.match(c.text('#message'),/저장해 둔 기록을 브라우저가 지웠어요/);c.close();
  // 열리지 않음(오류): 옛 방식으로 열고 알린다. 그날 푼 것은 다음에 합쳐진다.
  const local2=makeLocal(),backend2=createBackend();const d=await boot({local:local2,backend:backend2});const [x1]=await d.solve(1,{subject:'영어',topic:'Day 1',round:''});d.close();
  backend2.control.failOpen=true;const e=await boot({local:local2,backend:backend2});assert.equal(e.mode(),'local');assert.match(e.text('#message'),/저장소를 열지 못해 예전 방식으로 열었어요/);
  const [x2]=await e.solve(1,{subject:'국어',topic:'논리 1장',round:''});e.close();backend2.control.failOpen=false;
  const f=await boot({local:local2,backend:backend2});same(f.state().history.map(h=>h.id).sort(),[x1,x2].sort(),'못 열던 날 푼 것이 합쳐진다');f.close();
  // 열리지 않음(응답 없음): 6초 뒤 옛 방식으로 시작한다(멈춘 채 두지 않는다).
  const local3=makeLocal(),backend3=createBackend();backend3.control.hangOpen=true;
  const nodes=new Map(),timers=[];const conn=backend3.connect(),ctx={localStorage:local3,indexedDB:conn.indexedDB,IDBKeyRange:conn.IDBKeyRange,setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length;},clearTimeout(){},navigator:{}};vm.createContext(ctx);source('storage.js','new').runInContext(ctx);
  let done=null;ctx.StudyStorage.ready.then(v=>{done=v;});await new Promise(r=>setImmediate(r));assert.equal(done,null);same(timers.map(t=>t.ms),[6000]);timers[0].fn();await new Promise(r=>setImmediate(r));assert.equal(done.available,false);
 }
 // ── 11. 옛 글 치우기 ──
 {const local=makeLocal(),backend=createBackend();local.setItem('chagog-v1',baseRaw);const t0=Date.parse('2026-10-08T03:00:00Z');
  (await boot({local,backend,now:t0})).close();
  (await boot({local,backend,now:t0+13*86400000})).close();assert.ok(local.getItem('chagog-v1')===baseRaw,'13일째에는 그대로');
  const c=await boot({local,backend,now:t0+15*86400000});assert.equal(local.getItem('chagog-v1'),null,'14일이 지나면 localStorage의 옛 글을 지운다');assert.ok(backend.get('backup','chagog-v1').raw===baseRaw,'backup의 사본은 남는다');assert.equal(c.state().history.length,820);c.close();
  const d=await boot({local,backend,now:t0+16*86400000});assert.equal(d.state().history.length,820);assert.equal(d.text('#message'),'');d.close();
 }
 // ── 12. 계정 바꾸기 ──
 {const local=makeLocal(),backend=createBackend();local.quota=QUOTA;local.setItem('chagog-v1',baseRaw);
  const a=await boot({local,backend});const [g1]=await a.solve(1,{subject:'영어',topic:'Day 1',round:''});
  await a.run('StudyProgress.switchUser')('uid-1');await a.settle();
  assert.equal(a.run('KEY'),'chagog-user-uid-1');assert.equal(local.getItem('chagog-owner'),'uid-1');assert.equal(local.getItem('chagog-active-user'),'uid-1');
  assert.equal(a.state().history.length,821,'처음 로그인하면 손님 기록을 합친다');assert.equal(local.getItem('chagog-user-uid-1'),null,'계정 상태를 localStorage에 쓰지 않는다');
  assert.equal(backend.keysOf('detail','chagog-user-uid-1').length,821,'사본도 계정 쪽으로');assert.ok(backend.get('detail',['chagog-user-uid-1',g1]));
  const [u1]=await a.solve(1,{subject:'국어',topic:'논리 1장',round:''});a.close();
  const b=await boot({local,backend});assert.equal(b.run('KEY'),'chagog-user-uid-1','다시 열면 그 계정의 상태를 IndexedDB에서 바로 읽는다');assert.equal(b.state().history.length,822);
  const size0=local.size();await b.run('StudyProgress.switchUser')(null);await b.settle();assert.equal(b.run('KEY'),'chagog-guest');assert.equal(b.state().history.length,0);assert.ok(b.state().cards.length>15000);
  assert.ok(local.size()<=size0+60,'로그아웃해도 localStorage가 늘지 않는다(예전에는 문제 목록 168만 자가 더 생겼다)');assert.ok(backend.get('meta','chagog-guest'));
  await b.run('StudyProgress.switchUser')('uid-1');await b.settle();assert.equal(b.state().history.length,822,'다시 로그인하면 그대로');assert.equal(b.state().history.at(-1).id,u1);
  // 한꺼번에 불러도 차례로 돈다.
  const p1=b.run('StudyProgress.switchUser')(null),p2=b.run('StudyProgress.switchUser')('uid-1');await Promise.all([p1,p2]);await b.settle();assert.equal(b.run('KEY'),'chagog-user-uid-1');assert.equal(b.state().history.length,822);b.close();
  // 옛 판이 localStorage에 남긴 계정 글이 있는 기기: 계정을 바꿀 때 옮긴다.
  const local2=makeLocal(),backend2=createBackend();local2.setItem('chagog-owner','uid-2');local2.setItem('chagog-user-uid-2',baseRaw);
  const c=await boot({local:local2,backend:backend2});assert.equal(c.run('KEY'),'chagog-guest');await c.run('StudyProgress.switchUser')('uid-2');await c.settle();
  assert.equal(c.state().history.length,820);assert.equal(backend2.get('meta','chagog-user-uid-2').verified,true);assert.ok(local2.getItem('chagog-user-uid-2')===baseRaw);c.close();
  // 옛 방식(IndexedDB 없음)에서 처음 로그인: 손님 기록이 합쳐지고, 손님 글은 지워지지 않는다.
  // 대조: 옛 판(v247)은 이때 빈 상태를 손님 자리에 먼저 써서 손님 기록이 사라졌다.
  const local3=makeLocal();local3.setItem('chagog-v1',baseRaw);const d=await boot({local:local3});assert.equal(d.mode(),'local');
  await d.run('StudyProgress.switchUser')('uid-3');await d.settle();assert.equal(d.run('KEY'),'chagog-user-uid-3');assert.equal(d.state().history.length,820,'손님 기록 820건이 계정으로 합쳐졌다');
  assert.equal(JSON.parse(local3.getItem('chagog-v1')).history.length,820,'손님 글은 그대로');assert.equal(JSON.parse(local3.getItem('chagog-user-uid-3')).history.length,820);
  assert.ok(d.state().cards.every(c=>c.subject),'합친 문제에 과목이 붙어 있다');
  await d.run('StudyProgress.switchUser')(null);await d.settle();assert.equal(JSON.parse(local3.getItem('chagog-user-uid-3')).history.length,820,'로그아웃해도 계정의 기기 사본이 지워지지 않는다');
  const local4=makeLocal();local4.setItem('chagog-v1',baseRaw);const old=await boot({build:'old',local:local4});old.run("StudyProgress.switchUser('uid-3')");
  assert.equal(old.state().history.length,0,'대조: 옛 판은 처음 로그인에서 손님 기록을 잃는다');assert.ok(local4.getItem('chagog-v1').length<1000);
 }
 // ── 13. 옛 판 기기와 가짜 Firestore로 왕복 ──
 {const remote=new Map(),listeners=new Set();
  const coll=(uid,type)=>{const k=uid+'/'+type;if(!remote.has(k))remote.set(k,new Map());return remote.get(k);};
  const snap=(uid,type)=>({metadata:{fromCache:false,hasPendingWrites:false},docs:[...coll(uid,type)].map(([id,v])=>({id,data:()=>structuredClone(v)}))});
  const emit=()=>{for(const l of listeners)queueMicrotask(()=>l.type==='state'?l.fn({exists:coll(l.uid,'state').has('session'),data:()=>structuredClone(coll(l.uid,'state').get('session')),metadata:{fromCache:false,hasPendingWrites:false}}):l.fn(snap(l.uid,l.type)));};
  const EVENT_KEYS=['id','cardId','date','at','result','mode','detail'];
  // 규칙 흉내: 풀이 문서는 정해진 칸만, 한 번 쓰면 같은 내용으로만 다시 쓸 수 있다(바꾸면 거부). 사본은 규칙의 칸 · 길이 그대로(ReviewRecord.validate).
  const Record=require('./review-record.js');
  const put=(uid,type,id,value)=>{const m=coll(uid,type),old=m.get(id);
   if(type==='events'){assert.ok(Object.keys(value).every(k=>EVENT_KEYS.includes(k)),'풀이 문서에 정해진 칸만 올린다: '+Object.keys(value));assert.ok(value.detail,'풀이 문서는 사본과 함께 올라간다: '+id);Record.validate(value.detail);if(old)same(value,old,'올린 풀이 문서는 바꾸지 않는다: '+id);}
   m.set(id,structuredClone(value));};
  function cloud(app,uid){let cb;const auth={currentUser:{uid},onAuthStateChanged(fn){cb=fn;queueMicrotask(()=>fn(this.currentUser));return()=>{};}};
   const db={collection(name){return {doc(u){if(name==='allowedUsers')return {async get(){return {exists:true,data:()=>({})};}};
     return {collection(type){return {doc(id){return {uid:u,type,id,async set(v){put(u,type,id,v);emit();},onSnapshot(o,fn){const l={uid:u,type:'state',fn};listeners.add(l);queueMicrotask(()=>fn({exists:coll(u,'state').has('session'),data:()=>structuredClone(coll(u,'state').get('session')),metadata:{fromCache:false,hasPendingWrites:false}}));return()=>listeners.delete(l);}};},
      onSnapshot(o,fn){const l={uid:u,type,fn};listeners.add(l);queueMicrotask(()=>fn(snap(u,type)));return()=>listeners.delete(l);}};}};}};},
    batch(){const w=[];return {set(ref,v){w.push([ref,v]);},async commit(){for(const [ref,v]of w)put(ref.uid,ref.type,ref.id,v);emit();}};}};
   app.ctx.__cloud={auth,db};app.run("globalThis.__conn=ProgressCloud.connect({auth:__cloud.auth,db:__cloud.db,store:StudyProgress,status(t){globalThis.__status=t;}})");return app;}
  const localOld=makeLocal(),localNew=makeLocal(),backend=createBackend();// 옛 판 기기는 이미 로그인해 쓰던 기기다(계정 키에 44일 상태).
  localOld.setItem('chagog-owner','u');localOld.setItem('chagog-active-user','u');localOld.setItem('chagog-user-u',baseRaw);
  const oldDev=cloud(await boot({build:'old',local:localOld,sync:true}),'u');await oldDev.settle(40);
  assert.equal(coll('u','events').size,820,'옛 판 기기가 820건을 올렸다');assert.equal(oldDev.run('KEY'),'chagog-user-u');
  const newDev=cloud(await boot({local:localNew,backend,sync:true}),'u');await newDev.settle(60);
  assert.equal(newDev.mode(),'idb');assert.equal(newDev.run('KEY'),'chagog-user-u');assert.equal(newDev.state().history.length,820,'새 판 기기가 서버의 820건을 받았다');
  assert.ok(newDev.state().history.every(h=>h.detail===undefined&&h.ex),'받은 줄도 메모리에는 사본 없이');assert.equal(backend.keysOf('detail','chagog-user-u').length,820,'받은 사본은 IndexedDB로');
  const sched=app=>canon(leanCards(app.state().cards).filter(c=>c.streak||c.interval).sort((a,b)=>a.id.localeCompare(b.id)).map(c=>pick(c,['id','due','ease','interval','streak','chance','relearn'])));
  assert.equal(sched(newDev),sched(oldDev),'두 기기의 복습 일정이 같다');
  // 새 판에서 풀기 → 서버 → 옛 판.
  const n=await newDev.solve(3,{subject:'영어',topic:'Day 1',round:''},2);await newDev.settle(40);await oldDev.settle(40);
  assert.equal(coll('u','events').size,823);for(const id of n){const doc=coll('u','events').get(id);assert.ok(doc.detail.question&&doc.detail.explanation,'새 판이 올린 문서에 사본이 있다');same(doc.detail,backend.get('detail',['chagog-user-u',id]).d);}
  assert.equal(oldDev.state().history.length,823,'옛 판 기기가 새 판의 풀이를 받았다');same(oldDev.state().history.find(h=>h.id===n[0]).detail,coll('u','events').get(n[0]).detail);
  // 옛 판에서 풀기 → 서버 → 새 판.
  const o=await oldDev.solve(3,{subject:'국어',topic:'논리 1장',round:''},3);await oldDev.settle(40);await newDev.settle(60);
  assert.equal(coll('u','events').size,826);assert.equal(newDev.state().history.length,826);for(const id of o)same(backend.get('detail',['chagog-user-u',id]).d,coll('u','events').get(id).detail,'옛 판 풀이의 사본이 새 판 IndexedDB에 그대로');
  assert.equal(sched(newDev),sched(oldDev),'왕복 뒤에도 일정이 같다');
  same(newDev.state().history.map(h=>pick(h,['id','cardId','date','at','result','mode'])),oldDev.state().history.map(h=>pick(h,['id','cardId','date','at','result','mode'])),'풀이 줄이 순서까지 같다');
  // 해설 열람도 왕복한다.
  await newDev.run('creditExplanation')(n[0]);await newDev.settle(40);await oldDev.settle(40);assert.ok(coll('u','explanationViews').has(n[0]));assert.ok((oldDev.state().explanationViews||[]).some(v=>v.id===n[0]));
  // 새 판을 다시 열어도(IndexedDB에서 읽음) 서버와 어긋나지 않고 다시 올리지도 않는다.
  newDev.run('__conn.close()');newDev.close();const before=JSON.stringify([...coll('u','events')]);
  const again=cloud(await boot({local:localNew,backend,sync:true}),'u');await again.settle(60);assert.equal(again.state().history.length,826);assert.equal(JSON.stringify([...coll('u','events')]),before);assert.equal(sched(again),sched(oldDev));
  // 오프라인으로 푼 것(사본은 IndexedDB에만 있다)을 다시 연 뒤에 올려도 사본이 붙는다.
  again.run('__conn.close()');const off=await again.solve(2,{subject:'영어',topic:'Day 2',round:''});again.close();
  const back=cloud(await boot({local:localNew,backend,sync:true}),'u');await back.settle(60);for(const id of off){assert.ok(coll('u','events').get(id)?.detail?.question,'다시 연 뒤에 올린 문서에도 사본이 있다');assert.equal(back.run('pendingDetails').has(id),false);}
  await oldDev.settle(40);assert.equal(oldDev.state().history.length,828);
  // 사본을 읽지 못하면 올리지 않는다(사본 없는 문서가 굳지 않게).
  back.run('__conn.close()');const off2=await back.solve(1,{subject:'영어',topic:'Day 2',round:''});back.close();
  const fail=await boot({local:localNew,backend,sync:true});fail.run("Store.details=()=>Promise.reject(Error('read failed'))");cloud(fail,'u');await fail.settle(60);
  assert.equal(coll('u','events').has(off2[0]),false,'사본을 못 읽는 동안은 올리지 않는다');assert.match(fail.run('__status'),/전송 대기 중/);
  fail.run('__conn.close()');fail.close();const ok=cloud(await boot({local:localNew,backend,sync:true}),'u');await ok.settle(60);assert.ok(coll('u','events').get(off2[0]).detail.question);
  report.push('옛 판 ↔ 새 판(가짜 Firestore): 서버 문서 '+coll('u','events').size+'건 모두 사본 포함 · 고쳐 쓴 문서 0 · 두 기기 일정 같음');
 }
 for(const line of report)console.log(' · '+line);
 console.log('PASS storage: 조각 나누기 · 빈 기기 · 44일 상태 옮기기(옛 판과 같음 · 옛 글 보존 · 기록 파일) · 풀이 3,000 / 10,000 / 60,000 · 두 번 돌려도 같음 · 옮기다 끊김 4종 · 옛 판 탭이 더 씀 · 저장 실패 5종 · 다른 탭 · 브라우저가 지움 · 열리지 않음 · 옛 글 치우기 · 계정 바꾸기 · 옛 판 기기와 왕복');
})().catch(e=>{console.error(e);process.exit(1);});
