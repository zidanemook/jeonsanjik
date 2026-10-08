'use strict';
// 내용 창고(v247): 자체 제작 문제의 글 · 해설 · 기초 개념 상자를 시작할 때 다 읽지 않고, 그 문제를 처음 낼 때 조각(chunks/*.json)으로 받는다.
// 설계 · 실측: research/lazy-load-20261008/DESIGN.md. 기출 회차(gichul.js)와 같은 길이다 — 작은 색인으로 수 · 범위 · 일정을 다 만들고 본문은 필요할 때.
//
// 두 방식이 같은 API(StudyContent)를 낸다.
//  - 전체 방식: 원본 파일(practice-bank.js · basics.js · core-review-pack.js · quiz-options.js · study-review-catalog.js · memorize.js · hanneung-explanations.js)을
//    먼저 읽은 경우(검사 · 감사). 모든 글이 이미 있다. 딱지(과목 · topic · formula · ruleId · 문제 수 · 상자)는 원본에서 바로 읽는다.
//  - 받는 방식: 브라우저. content-index.js(build-chunks.cjs가 원본에서 만든 색인)만 읽은 경우. 딱지는 색인에서, 글은 조각을 받은 뒤
//    PRACTICE_BANK · QUIZ_OPTIONS · CORE_REVIEW_PACK · STUDY_BASICS · MEMORIZE · HANNEUNG_EXPLANATIONS · HISTORY_MNEMONICS에 채운다.
// 조각 주소는 내용 지문이다(chunks/<이름>.json?h=<지문>). 받은 바이트의 지문이 색인의 지문과 다르면 붙이지 않는다 — 새 색인에 옛 조각(또는 그 반대)이 붙을 수 없다.
// Node(build-chunks.cjs · 검사)는 이 파일을 require해서 지문 · 공통 줄 계산 같은 순수 함수만 쓴다.
(function(root){
 const node=typeof module!=='undefined'&&module.exports;
 // ---- 빌드와 앱이 함께 쓰는 순수 함수 ----
 // 지문: 바이트에 대한 32비트 해시 둘(FNV-1a · 31진 다항)을 이어 붙인 16자. 낡은 조각을 알아보는 용도다(위조 방지가 아니다). sw.js에 같은 함수가 있다(lazy.test가 대조).
 function hashBytes(u8){let a=2166136261,b=7;for(let i=0;i<u8.length;i++){const x=u8[i];a=Math.imul(a^x,16777619)>>>0;b=(Math.imul(b,31)+x)>>>0;}return a.toString(16).padStart(8,'0')+b.toString(16).padStart(8,'0');}
 // 같은 요점의 문제들이 똑같이 들고 있는 칸. 조각 안에서는 한 번만 적고 번호로 가리킨다(pack → unpack하면 원래 값).
 const SHARED_KEYS=['title','rule','hook','examples'];
 function packLessons(bank){const shared=[],at=new Map(),out={};
  for(const [id,lesson]of Object.entries(bank)){const row={...lesson};for(const k of SHARED_KEYS){if(row[k]===undefined)continue;const key=k+'\u0000'+JSON.stringify(row[k]);if(!at.has(key)){at.set(key,shared.length);shared.push(row[k]);}row[k]=at.get(key);}out[id]=row;}
  return {shared,bank:out};}
 function unpackLessons(shared,bank){for(const lesson of Object.values(bank))for(const k of SHARED_KEYS)if(typeof lesson[k]==='number')lesson[k]=shared[lesson[k]];return bank;}
 // 상자의 줄(용어 · 규칙 · 표)과 그 자리 이름. 공통 줄 계산이 이 순서와 자리 이름을 쓴다.
 function boxItems(b){const out=[];(b.terms||[]).forEach((x,i)=>out.push(['t'+i,x]));(b.rules?.items||[]).forEach((x,i)=>out.push(['r'+i,x]));if(b.table)out.push(['T',b.table]);(b.tables||[]).forEach((x,i)=>out.push(['S'+i,x]));return out.filter(e=>e[1]);}
 // 여러 상자에 똑같이 실린 줄: 같은 파트에 함께 나오는 상자끼리만 센다(v246까지 app.js basicsSharedSets와 같은 규칙).
 // 결과: 상자 id → {파트 id: [그 파트에서 공통인 이 상자의 자리 이름]}. 빌드가 미리 계산해 상자 조각에 싣고, 전체 방식은 그 자리에서 계산한다.
 function sharedSlots(units,ruleFor,boxOf){
  const out=new Map();
  for(const u of units||[])for(const p of u.parts||[]){
   const rules=[...new Set((p.ids||[]).map(ruleFor).filter(r=>r&&boxOf(r)))];if(rules.length<2)continue;
   const keys=new Map(rules.map(r=>[r,boxItems(boxOf(r)).map(([slot,x])=>[slot,JSON.stringify(x)])])),n=new Map();
   for(const r of rules)for(const k of new Set(keys.get(r).map(e=>e[1])))n.set(k,(n.get(k)||0)+1);
   const shared=new Set([...n].filter(e=>e[1]>1).map(e=>e[0]));if(!shared.size)continue;
   for(const r of rules){if(!out.has(r))out.set(r,{});out.get(r)[p.id]=keys.get(r).filter(e=>shared.has(e[1])).map(e=>e[0]);}
  }
  return out;
 }
 // 한 문제의 카드 내용(과목 · 질문 · 정답 · 해설 · 출처). v246까지 app.js cardContent()가 모든 문제에 대해 만들던 값이다.
 const coreBase=c=>({subject:c.subject,question:c.question,answer:c.answer,explanation:c.explanation||'',source:c.source||'',verified:true});
 // 출처 줄은 app.js의 bankSource가 만든다(통합 스크립트가 그 줄을 고친다 — 한 곳에만 둔다). 이 함수는 app.js가 읽힌 뒤에만 불린다.
 function bankBase(id,lesson,bank,options){const e=root.Practice.select({id,question:'',explanation:''},[],bank,options);return {subject:lesson.subject||'영어',question:e.question,answer:e.type==='text'?e.answers[0]:e.choices[e.correctIndex],explanation:e.explanation||'',source:root.bankSource(id,lesson),verified:true};}
 const memoSize=set=>set.lines?set.lines.reduce((n,l)=>n+l.items.length,0):set.pairs?set.pairs.length*2:set.groups?set.groups.reduce((n,g)=>n+g.cards.length,0):set.size||0;
 const pure={hashBytes,packLessons,unpackLessons,boxItems,sharedSlots,memoSize,SHARED_KEYS};
 if(node){module.exports=pure;return;}

 const index=root.CONTENT_INDEX||null,lazy=!!index;
 const listeners=[];
 // 줄의 자리 이름: 그 상자의 줄 그대로면 바로 찾고, 사본이면 글이 같은 줄을 찾는다.
 const slotOf=(box,x)=>{const items=boxItems(box);for(const [slot,item]of items)if(item===x)return slot;const k=JSON.stringify(x);for(const [slot,item]of items)if(JSON.stringify(item)===k)return slot;return null;};

 // ================= 전체 방식 =================
 if(!lazy){
  const basics=()=>root.STUDY_BASICS||{boxes:{},apply:{},box:()=>null,forQuestion:()=>null};
  let coreMap=null,coreLen=-1,content=null,ruleOf=null,shared=null;
  const core=id=>{const pack=root.CORE_REVIEW_PACK||[];if(!coreMap||coreLen!==pack.length){coreMap=new Map(pack.map(c=>[c.id,c]));coreLen=pack.length;}return coreMap.get(id);};
  const ruleFor=id=>root.PRACTICE_BANK?.[id]?.ruleId||basics().forQuestion(id)?.box||null;
  const api={...pure,lazy:false,index:null,
   lesson:id=>root.PRACTICE_BANK?.[id],
   hasOptions:id=>!!root.QUIZ_OPTIONS?.[id],
   core,
   applyBox:id=>{const b=basics().forQuestion(id)?.box;return typeof b==='string'?b:null;},
   applyBoxEntries:()=>Object.entries(basics().apply||{}).filter(e=>typeof e[1]?.box==='string').map(e=>[e[0],e[1].box]),
   hasBox:rule=>!!basics().box(rule),
   ruleOfBox(box){if(!ruleOf)ruleOf=new Map(Object.entries(basics().boxes||{}).map(([r,b])=>[b,r]));return ruleOf.get(box)||null;},
   // 이 상자의 줄 x가 공통 줄인가: partId를 주면 그 파트 안에서, 없으면 이 상자가 나오는 어느 파트에서든.
   isShared(box,x,partId){
    if(!shared)shared=sharedSlots(root.STUDY_PARTS?.units||[],ruleFor,r=>basics().box(r));
    const rule=api.ruleOfBox(box),parts=rule&&shared.get(rule);if(!parts)return false;const slot=slotOf(box,x);if(!slot)return false;
    return partId?!!parts[partId]?.includes(slot):Object.values(parts).some(s=>s.includes(slot));
   },
   contentMap(){
    if(content)return content;const m=new Map(),bank=root.PRACTICE_BANK||{},options=root.QUIZ_OPTIONS||{};
    for(const c of root.CORE_REVIEW_PACK||[])m.set(c.id,coreBase(c));
    for(const [id,lesson]of Object.entries(bank))if(!m.has(id))m.set(id,bankBase(id,lesson,bank,options));
    return content=m;
   },
   memoKnown:id=>!!root.MEMORIZE?.get(id),
   need:()=>[],needBoxes:()=>[],needMemo:()=>[],ready:()=>true,status:()=>({state:'ready',stale:false}),
   load:()=>Promise.resolve(),prefetch(){},loadAll:()=>Promise.resolve(),onAttach(fn){listeners.push(fn);},loaded:()=>[]
  };
  root.StudyContent=api;return;
 }

 // ================= 받는 방식 =================
 const names=index.names,chunkOf=i=>names[i];
 // 색인 → 문제마다의 딱지. meta: {subject, chunk, options, core, lesson(연습 문제 딱지)}
 const meta=new Map();
 {const {core,bank}=index;
  core.ids.forEach((id,i)=>meta.set(id,{subject:index.subjects[core.s[i]],chunk:chunkOf(core.c[i]),options:!!core.o[i],core:true,lesson:null}));
  bank.ids.forEach((id,i)=>{const m=meta.get(id)||{subject:index.subjects[bank.s[i]],chunk:chunkOf(bank.c[i]),options:false,core:false,lesson:null};
   if(bank.o[i])m.options=true;
   // 받기 전에 범위 · 수 · 접기 · 뱃지가 읽는 칸만 든 딱지. 글(title · rule · variants의 내용)은 조각이 붙어야 생긴다.
   m.lesson={subject:index.subjects[bank.s[i]],topic:index.topics[bank.t[i]],ruleId:index.rules[bank.r[i]],variants:{length:bank.n[i]}};if(bank.f[i]>=0)m.lesson.formula=index.formulas[bank.f[i]];
   meta.set(id,m);});}
 const boxChunk=new Map(Object.entries(index.boxes).map(([rule,c])=>[rule,chunkOf(c)]));
 const applyBoxOf=new Map();for(const [box,ids]of Object.entries(index.applyBox))for(const id of ids)applyBoxOf.set(id,box);
 const memoMeta=new Map(index.memo.map(m=>[m.id,{id:m.id,subject:m.subject,title:m.title,size:m.size,chunk:chunkOf(m.c)}]));
 // 전역 그릇: 색인 파일이 CORE_REVIEW_PACK=[] · QUIZ_OPTIONS={}를 먼저 만들어 두었고(hanneung.js · gichul.js가 거기에 설치), 나머지는 여기서 만든다.
 const pack=root.CORE_REVIEW_PACK,options=root.QUIZ_OPTIONS,bank=root.PRACTICE_BANK={};
 const boxes={},apply={},ruleOf=new Map(),sharedOf=new Map(),mnemonics=new Map(),memoSets=new Map();
 root.STUDY_BASICS={boxes,apply,box:rule=>boxes[rule]||null,forQuestion:id=>apply[id]||null};
 root.HISTORY_MNEMONICS={get:id=>mnemonics.get(id)||null};
 root.HANNEUNG_EXPLANATIONS=root.HANNEUNG_EXPLANATIONS||{};
 root.HANNEUNG_EXPLAINED=new Set(Object.entries(index.hx).flatMap(([round,list])=>list.map(n=>'hanneung-'+round+'-'+String(n).padStart(2,'0'))));
 root.STUDY_REVIEW_CATALOG={schema:index.catalog.schema,total:index.catalog.total,sets:index.catalog.sets,lectures:index.catalog.lectures,
  questions:Object.fromEntries(Object.entries(index.catalog.q).map(([id,[number,section]])=>[id,{number,section:index.catalog.sections[section]}]))};
 {const titles=new Map(index.english.areas.flatMap(a=>a.rules.map(r=>[r.id,r.title])));root.ENGLISH_FORMULAS={areas:index.english.areas,title:id=>titles.get(id)||''};}
 // 외울 것: 목록 화면은 색인의 이름 · 칸 수만 쓰고, 목록 하나는 조각을 받은 뒤 get으로 준다.
 root.MEMORIZE={sets:[...memoMeta.values()],size:memoSize,get:id=>memoSets.get(id)||null};
 // 시작할 때 hanneung.js · gichul.js가 설치한 카드(색인만으로 만든 것). 순서: 묶음 카드 → 한능검 → 9급 기출 → 연습 문제(원본 순서 그대로).
 const coreMap=new Map(pack.map(c=>[c.id,c])),installed=pack.slice();
 const core=id=>coreMap.get(id);
 let content=null;
 function contentMap(){
  if(content)return content;const m=new Map();
  for(const id of index.core.ids){const c=coreMap.get(id);m.set(id,c?coreBase(c):{subject:meta.get(id).subject,verified:true});}
  for(const c of installed)if(!m.has(c.id))m.set(c.id,coreBase(c));
  for(const id of index.bank.ids)if(!m.has(id))m.set(id,bank[id]?bankBase(id,bank[id],bank,options):{subject:meta.get(id).subject,verified:true});
  return content=m;
 }
 // ---- 어떤 조각이 필요한가 ----
 const has=name=>Object.prototype.hasOwnProperty.call(index.chunks,name);
 function paperChunk(id){
  if(id.startsWith('gichul-')){const paper=root.Gichul?.paperOf(id);if(!paper)return null;const name='g-'+paper.slice(paper.lastIndexOf('-')+1);return has(name)?name:null;}
  const h=/^hanneung-(\d+)-\d+$/.exec(id);if(h){const name='h-'+Number(h[1]);return has(name)?name:null;}
  return null;
 }
 const ruleFor=id=>meta.get(id)?.lesson?.ruleId||applyBoxOf.get(id)||null;
 function need(id){const out=new Set(),m=meta.get(id),p=paperChunk(id);if(m)out.add(m.chunk);if(p)out.add(p);const b=boxChunk.get(ruleFor(id));if(b)out.add(b);return [...out];}
 const needBoxes=rules=>[...new Set(rules.map(r=>boxChunk.get(r)).filter(Boolean))];
 const needMemo=id=>memoMeta.has(id)?[memoMeta.get(id).chunk]:[];
 // ---- 받기 ----
 const done=new Set(),jobs=new Map(),failed=new Map(); // failed: 이름 → {stale}
 const TIMEOUT_MS=15000;
 function fetchBytes(url,again){
  let timer=null,signal;
  if(typeof root.AbortController==='function'&&typeof root.setTimeout==='function'){const c=new root.AbortController();signal=c.signal;timer=root.setTimeout(()=>c.abort(),TIMEOUT_MS);}
  const opts={};if(signal)opts.signal=signal;if(again)opts.cache='reload';
  let request;try{request=root.fetch(url,opts);}catch(error){request=Promise.reject(error);}
  const clear=()=>{if(timer!==null)root.clearTimeout(timer);};
  return Promise.resolve(request).then(r=>{if(!r.ok){const e=Error('HTTP '+r.status);e.stale=r.status===404||r.status===409;throw e;}return r.arrayBuffer();}).then(b=>{clear();return new Uint8Array(b);},e=>{clear();throw e;});
 }
 // 받은 바이트의 지문이 색인의 지문과 같아야 쓴다. 다르면 HTTP 캐시를 건너뛰고 한 번 더 받아 보고, 그래도 다르면 판이 바뀐 것이다(stale).
 function fetchChunk(name,again){
  const hash=index.chunks[name],url='chunks/'+name+'.json?h='+hash;
  return fetchBytes(url,again).then(u8=>{
   if(hashBytes(u8)!==hash){if(!again)return fetchChunk(name,true);const e=Error('Chunk differs from the index: '+name);e.stale=true;throw e;}
   return JSON.parse(new root.TextDecoder().decode(u8));
  },e=>{if(e.stale&&!again)return fetchChunk(name,true);throw e;});
 }
 function attach(name,data){
  if(!data||data.schema!==1||data.id!==name)throw Error('Chunk file mismatch: '+name);
  const ids=[];
  for(const c of data.core||[]){if(!meta.get(c.id)?.core)throw Error('Chunk question is not in the index: '+c.id);if(!coreMap.has(c.id)){coreMap.set(c.id,c);pack.push(c);}ids.push(c.id);}
  for(const [id,o]of Object.entries(data.options||{})){if(!meta.get(id)?.options)throw Error('Chunk options are not in the index: '+id);options[id]=o;}
  if(data.bank){unpackLessons(data.shared||[],data.bank);for(const [id,lesson]of Object.entries(data.bank)){const m=meta.get(id)?.lesson;
   if(!m||m.topic!==lesson.topic||m.ruleId!==lesson.ruleId||m.formula!==lesson.formula||m.variants.length!==lesson.variants.length||m.subject!==(lesson.subject||'영어'))throw Error('Chunk question differs from the index: '+id);
   bank[id]=lesson;if(!coreMap.has(id))ids.push(id);}}
  Object.assign(apply,data.apply||{});
  for(const [rule,box]of Object.entries(data.boxes||{})){if(boxChunk.get(rule)!==name)throw Error('Chunk box is not in the index: '+rule);boxes[rule]=box;ruleOf.set(box,rule);}
  for(const [rule,parts]of Object.entries(data.sharedSlots||{}))sharedOf.set(rule,parts);
  for(const [id,block]of Object.entries(data.mnemonics||{}))mnemonics.set(id,block);
  for(const set of data.memorize||[]){if(memoMeta.get(set.id)?.chunk!==name)throw Error('Chunk list is not in the index: '+set.id);memoSets.set(set.id,set);}
  if(data.explanations){Object.assign(root.HANNEUNG_EXPLANATIONS,data.explanations);const filled=Object.keys(data.explanations);root.Hanneung?.refill?.(filled);ids.push(...filled);}
  done.add(name);
  // 붙은 문제의 카드 내용을 다시 만든다(app.js가 data.cards의 그 문제들에 글을 붙인다).
  if(content)for(const id of ids){const c=coreMap.get(id);content.set(id,c?coreBase(c):bankBase(id,bank[id],bank,options));}
  for(const fn of listeners)fn(ids);
 }
 // quiet: 미리 받기. 실패해도 '받지 못함'으로 남기지 않는다(그 문제 차례가 오면 다시 받는다).
 function loadChunk(name,quiet){
  if(done.has(name))return Promise.resolve();
  if(!has(name))return Promise.reject(Error('Unknown chunk: '+name));
  if(jobs.has(name)){const j=jobs.get(name);if(!quiet)j.quiet=false;return j.promise;}
  failed.delete(name);
  const job={quiet:!!quiet,promise:null};
  job.promise=fetchChunk(name).then(data=>{attach(name,data);jobs.delete(name);},error=>{jobs.delete(name);if(!job.quiet)failed.set(name,{stale:!!error?.stale});throw error;});
  jobs.set(name,job);return job.promise;
 }
 const ready=list=>list.every(n=>done.has(n));
 function status(list){
  if(ready(list))return {state:'ready',stale:false};
  const bad=list.filter(n=>failed.has(n));if(bad.length)return {state:'error',stale:bad.some(n=>failed.get(n).stale)};
  return {state:list.some(n=>jobs.has(n)&&!jobs.get(n).quiet)?'loading':'idle',stale:false};
 }
 const load=list=>Promise.all(list.filter(n=>!done.has(n)).map(n=>loadChunk(n,false))).then(()=>{});
 function prefetch(ids){for(const id of ids)for(const n of need(id))if(!done.has(n)&&!jobs.has(n))loadChunk(n,true).catch(()=>{});}
 // 모든 조각을 받는다(검사 도구용: 받은 뒤에는 전역이 전체 방식과 같은 내용을 가진다). 앱 화면은 부르지 않는다.
 async function loadAll(){const all=Object.keys(index.chunks);for(let i=0;i<all.length;i+=8)await Promise.all(all.slice(i,i+8).map(n=>loadChunk(n,false)));}
 root.StudyContent={...pure,lazy:true,index,
  lesson:id=>bank[id]||meta.get(id)?.lesson||undefined,
  hasOptions:id=>!!options[id]||!!meta.get(id)?.options,
  core,
  applyBox:id=>applyBoxOf.get(id)||null,
  applyBoxEntries:()=>[...applyBoxOf],
  hasBox:rule=>boxChunk.has(rule),
  ruleOfBox:box=>ruleOf.get(box)||null,
  isShared(box,x,partId){const rule=ruleOf.get(box),parts=rule&&sharedOf.get(rule);if(!parts)return false;const slot=slotOf(box,x);if(!slot)return false;
   return partId?!!parts[partId]?.includes(slot):Object.values(parts).some(s=>s.includes(slot));},
  contentMap,
  memoKnown:id=>memoMeta.has(id),
  need,needBoxes,needMemo,ready,status,load,prefetch,loadAll,onAttach(fn){listeners.push(fn);},loaded:()=>[...done]
 };
})(globalThis);
