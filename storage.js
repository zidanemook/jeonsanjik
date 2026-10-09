'use strict';
// v248: 기기 저장소. 문제 일정, 풀이 기록, 해설 열람 같은 큰 것은 IndexedDB에 두고, localStorage에는 작은 표시만 남긴다.
// (localStorage 한도는 5,242,880자 — 상태 전체를 한 줄로 쓰던 방식은 풀이 3,000건쯤에서 저장이 막혔다. research/storage-budget-20261008/DESIGN.md)
// 이 파일은 스크립트 목록 맨 앞에서 읽는다: 곧바로 IndexedDB를 열고 지금 프로필을 읽기 시작해, 나머지 스크립트를 읽는 동안 끝나게 한다(app.js가 StudyStorage.ready를 기다린다).
//
// 데이터베이스 'chagog'(version 1). 프로필 키는 localStorage 키 그대로(chagog-v1, chagog-user-<uid>, chagog-guest).
//   meta   [프로필]            {format:1, rev, verified, counts:{c,h,v}, legacy:{len,hash,at}|null, savedAt}
//   seg    [프로필,'core',0]   {k:'core',i:0,s: 설정, 풀던 자리, 의견 등 작은 것 전부의 JSON 글}
//          [프로필,'c',k]      {k:'c',i:k,s: 문제 일정 128줄의 JSON 글}      (배열 순서 그대로 잘라 둔 조각)
//          [프로필,'h',k]      {k:'h',i:k,s: 풀이 64줄의 JSON 글}            (사본 없이 일정 칸 + ex, cid)
//          [프로필,'v',k]      {k:'v',i:k,s: 해설 열람 256줄의 JSON 글}
//   detail [프로필, 풀이 id]   {id, d: 그 풀이의 사본(문제, 보기, 고른 답, 정답, 해설)}   (한 번 쓰고 고치지 않는다. 시작할 때 읽지 않는다)
//   backup [프로필]            {raw: 옮기기 전 localStorage 글 그대로, at}
// 상태 = 조각을 차례로 이어 붙인 배열. 쓸 때는 조각 글을 만들어 마지막에 쓴 글과 다른 조각만 넣는다(답 하나 = 조각 두셋 + 사본 한 건).
// 조각, 사본, meta는 한 트랜잭션이다(반만 쓰이지 않는다). meta.rev가 내가 아는 값이 아니면(다른 탭이 썼다) 쓰지 않고 conflict로 알린다.
(function(root){
 const DB='chagog',SIZE={c:128,h:64,v:256},KINDS=['c','h','v'],FIELD={c:'cards',h:'history',v:'explanationViews'};
 const state={available:false,mode:'pending',persisted:null,error:null,lastWrite:null,writes:0,failures:0};
 let db=null,opening=null;
 const req=r=>new Promise((ok,no)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error||Error('IndexedDB request failed'));});
 // 요청 하나가 실패하면 트랜잭션 전체가 취소된다(막지 않는다 — 반만 쓰인 상태를 남기지 않으려고).
 const done=tx=>new Promise((ok,no)=>{tx.oncomplete=()=>ok();tx.onabort=()=>no(tx.error||Error('IndexedDB transaction aborted'));});
 function profileKey(){try{const uid=root.localStorage.getItem('chagog-active-user');return uid?'chagog-user-'+uid:root.localStorage.getItem('chagog-owner')?'chagog-guest':'chagog-v1';}catch{return 'chagog-v1';}}
 function open(){
  if(db)return Promise.resolve(db);if(opening)return opening;
  opening=new Promise((ok,no)=>{
   let r;try{if(!root.indexedDB)throw Error('IndexedDB is not available');r=root.indexedDB.open(DB,1);}catch(e){no(e);return;}
   r.onupgradeneeded=()=>{const d=r.result;for(const name of ['meta','seg','detail','backup'])if(!d.objectStoreNames.contains(name))d.createObjectStore(name);};
   r.onsuccess=()=>{db=r.result;db.onversionchange=()=>{try{db.close();}catch{}db=null;};db.onclose=()=>{db=null;};ok(db);};
   r.onerror=()=>no(r.error||Error('IndexedDB open failed'));r.onblocked=()=>no(Error('IndexedDB open blocked'));
  });
  opening.then(()=>{opening=null;},()=>{opening=null;});return opening;
 }
 const range=key=>root.IDBKeyRange.bound([key],[key,[]]);
 // 프로필의 meta와 조각 전부(글 그대로). 없으면 null.
 async function read(key){
  const d=await open(),tx=d.transaction(['meta','seg'],'readonly');
  const [meta,segs]=await Promise.all([req(tx.objectStore('meta').get(key)),req(tx.objectStore('seg').getAll(range(key)))]);
  return meta?{meta,segs}:null;
 }
 // 읽은 조각을 상태로. 빠진 조각이 있으면 던진다(깨진 상태를 반쯤 읽어 쓰지 않는다).
 function assemble(loaded){
  const {meta,segs}=loaded,by={c:[],h:[],v:[]},strings=new Map();let core=null;
  if(!meta||meta.format!==1||!meta.counts)throw Error('Unknown storage format');
  for(const x of segs){if(x.k==='core'){core=x.s;strings.set('core:0',x.s);}else if(by[x.k]&&x.i<meta.counts[x.k]){by[x.k][x.i]=x.s;strings.set(x.k+':'+x.i,x.s);}}
  if(typeof core!=='string')throw Error('Missing core segment');
  const out=JSON.parse(core);
  for(const k of KINDS){const n=meta.counts[k],rows=[];for(let i=0;i<n;i++){if(typeof by[k][i]!=='string')throw Error('Missing segment '+k+':'+i);const part=JSON.parse(by[k][i]);for(const row of part)rows.push(row);}
   if(k!=='v'||out.explanationViews!==undefined)out[FIELD[k]]=rows;}
  return {state:out,strings,counts:{...meta.counts}};
 }
 // 상태(글 없는 일정 칸, 사본 없는 풀이 줄)를 조각 글로.
 function split(lean){
  const strings=new Map(),counts={c:0,h:0,v:0},{cards,history,explanationViews,...rest}=lean;
  // 열쇠 순서를 지키려고 자리만 남긴다(읽을 때 그 자리에 배열을 다시 꽂는다).
  const core={};for(const k of Object.keys(lean))core[k]=k==='cards'||k==='history'||k==='explanationViews'?0:rest[k];
  strings.set('core:0',JSON.stringify(core));
  for(const k of KINDS){const rows=lean[FIELD[k]]||[],size=SIZE[k];counts[k]=Math.ceil(rows.length/size);for(let i=0;i<counts[k];i++)strings.set(k+':'+i,JSON.stringify(rows.slice(i*size,(i+1)*size)));}
  return {strings,counts};
 }
 // 프로필 손잡이: 마지막으로 쓰였다고 확인된 조각 글, rev를 든다.
 function handle(key,loaded,assembled){
  const meta=loaded&&loaded.meta;
  return {key,rev:meta?meta.rev:0,verified:meta?!!meta.verified:true,legacy:meta?meta.legacy||null:null,counts:assembled?assembled.counts:{c:0,h:0,v:0},strings:assembled?assembled.strings:new Map(),fresh:!meta};
 }
 // 한 트랜잭션으로 쓴다. 호출한 자리에서 곧바로 트랜잭션을 연다(미루지 않는다).
 // opt.replace: 프로필의 조각, 사본을 지우고 통째로(옮기기), opt.verified, opt.legacy, opt.backup({raw,at}), opt.force(rev를 보지 않음)
 function write(p,lean,details,opt={}){
  if(!db)return open().then(()=>write(p,lean,details,opt));
  let tx,parts;
  try{parts=split(lean);tx=db.transaction(['meta','seg','detail','backup'],'readwrite');}catch(e){state.failures++;return Promise.reject(e);}
  let conflict=false;const finished=done(tx);
  const metaStore=tx.objectStore('meta'),seg=tx.objectStore('seg'),det=tx.objectStore('detail'),get=metaStore.get(p.key);
  get.onerror=()=>{};
  get.onsuccess=()=>{
   try{
    const cur=get.result,curRev=cur?cur.rev:0;
    if(!opt.replace&&!opt.force&&curRev!==p.rev){conflict=true;tx.abort();return;}
    if(opt.replace){seg.delete(range(p.key));det.delete(range(p.key));}
    for(const [id,s]of parts.strings){if(!opt.replace&&p.strings.get(id)===s)continue;const [k,i]=id.split(':');seg.put({k,i:+i,s},[p.key,k,+i]);}
    if(!opt.replace)for(const k of KINDS){const old=Math.max(p.counts[k]||0,cur&&cur.counts?cur.counts[k]||0:0);for(let i=parts.counts[k];i<old;i++)seg.delete([p.key,k,i]);}
    if(details)for(const [id,d]of details)det.put({id,d},[p.key,id]);
    if(opt.backup)tx.objectStore('backup').put(opt.backup,p.key);
    metaStore.put({format:1,rev:curRev+1,verified:opt.verified!==undefined?!!opt.verified:p.verified,counts:parts.counts,legacy:opt.legacy!==undefined?opt.legacy:p.legacy,savedAt:Date.now()},p.key);
    if(typeof tx.commit==='function')tx.commit();
   }catch(e){try{tx.abort();}catch{}}
  };
  return finished.then(()=>{
   p.rev=(get.result?get.result.rev:0)+1;p.strings=parts.strings;p.counts=parts.counts;p.fresh=false;
   if(opt.verified!==undefined)p.verified=!!opt.verified;if(opt.legacy!==undefined)p.legacy=opt.legacy;
   state.writes++;state.lastWrite=Date.now();
  },e=>{state.failures++;const err=e instanceof Error?e:Error(String(e&&e.name||e||'IndexedDB write failed'));if(conflict)err.conflict=true;throw err;});
 }
 // meta만 고친다(옮기기 확인 표시, 옛 글 지문).
 async function mark(p,patch){
  const d=await open(),tx=d.transaction(['meta'],'readwrite'),store=tx.objectStore('meta'),finished=done(tx),cur=await req(store.get(p.key));
  if(!cur||cur.rev!==p.rev){try{tx.abort();}catch{}await finished.catch(()=>{});const e=Error('Storage changed elsewhere');e.conflict=true;throw e;}
  store.put({...cur,...patch,rev:cur.rev+1,savedAt:Date.now()},p.key);if(typeof tx.commit==='function')tx.commit();await finished;
  p.rev=cur.rev+1;if(patch.verified!==undefined)p.verified=!!patch.verified;if(patch.legacy!==undefined)p.legacy=patch.legacy;
 }
 // 풀이 id들의 사본. 없는 id는 빠진다.
 async function details(key,ids){
  const out=new Map();if(!ids.length)return out;
  const d=await open(),store=d.transaction(['detail'],'readonly').objectStore('detail');
  const rows=await Promise.all(ids.map(id=>req(store.get([key,id]))));
  rows.forEach(row=>{if(row)out.set(row.id,row.d);});return out;
 }
 // 프로필의 사본 전부를 묶음으로 넘긴다(기록 파일, 옮기기 대조).
 async function eachDetail(key,fn,batch=2000){
  const d=await open();let lower=[key],open1=false;
  for(;;){
   const store=d.transaction(['detail'],'readonly').objectStore('detail');
   const rows=await req(store.getAll(root.IDBKeyRange.bound(lower,[key,[]],open1,false),batch));
   for(const row of rows)fn(row.id,row.d);
   if(rows.length<batch)return;lower=[key,rows[rows.length-1].id];open1=true;
  }
 }
 async function backup(key){const d=await open();return (await req(d.transaction(['backup'],'readonly').objectStore('backup').get(key)))||null;}
 // 옛 글의 지문: 길이 + 드문드문 고른 글자와 끝 2,000자의 해시(풀이가 하나라도 더해지면 길이가 달라진다).
 function fingerprint(raw){let a=2166136261;const n=raw.length,mix=i=>{a=Math.imul(a^raw.charCodeAt(i),16777619)>>>0;};for(let i=0;i<n;i+=61)mix(i);for(let i=Math.max(0,n-2000);i<n;i++)mix(i);return {len:n,hash:a.toString(16).padStart(8,'0')};}
 // 브라우저가 저장 공간이 모자랄 때 이 사이트의 기록을 지우지 않게 청한다(설치한 앱, 자주 쓰는 사이트는 묻지 않고 받아들여진다).
 async function persist(){try{const s=root.navigator&&root.navigator.storage;if(!s||!s.persist)return null;state.persisted=(await s.persisted())||(await s.persist());return state.persisted;}catch{return null;}}
 // 시작할 때 한 번: 지금 프로필을 읽어 둔다. 6초 안에 열리지 않으면 못 쓰는 것으로 본다(앱은 옛 방식으로 시작한다 — 멈춘 채 두지 않는다).
 // IndexedDB가 아예 없는 환경(검사, 아주 옛 브라우저)은 기다릴 것이 없다: none을 보고 앱이 그 자리에서 옛 방식으로 시작한다.
 const key=profileKey(),none=!root.indexedDB||!root.IDBKeyRange;
 const ready=none?(state.mode='local',Promise.resolve({available:false,key,loaded:null,error:null})):new Promise(resolve=>{
  let settled=false;const finish=v=>{if(settled)return;settled=true;state.available=v.available;state.mode=v.available?'idb':'local';if(v.error)state.error=String(v.error&&v.error.message||v.error);resolve(v);};
  const timer=typeof root.setTimeout==='function'?root.setTimeout(()=>finish({available:false,key,loaded:null,error:Error('IndexedDB open timed out')}),6000):null;
  const stop=()=>{if(timer!==null&&typeof root.clearTimeout==='function')root.clearTimeout(timer);};
  read(key).then(loaded=>{stop();finish({available:true,key,loaded,error:null});},error=>{stop();finish({available:false,key,loaded:null,error});});
 });
 root.StudyStorage={ready,none,profileKey,open,read,assemble,split,handle,write,mark,details,eachDetail,backup,fingerprint,persist,SIZE,status:()=>({...state})};
})(globalThis);
