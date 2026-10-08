'use strict';
// 원본 파일에서 색인(content-index.js) · 조각(chunks/*.json) · 조각 목록(chunk-manifest.json)을 만든다. 설계: research/lazy-load-20261008/DESIGN.md
//   node build-chunks.cjs          만든다(달라진 파일만 쓴다, 없어진 조각은 지운다)
//   node build-chunks.cjs --check  만들지 않고 커밋된 파일과 한 바이트씩 견준다. 다르면 실패(낡은 색인 · 조각으로 배포되지 않게 — lazy.test.cjs가 부른다)
// 원본(저작 · 통합 스크립트 · 원장 · 감사 · 검사가 읽고 쓰는 파일)은 그대로다:
//   core-review-pack.js · quiz-options.js · practice-bank.js · basics.js · study-review-catalog.js · memorize.js · hanneung-explanations.js (+ 나누는 기준 parts.js)
// 문제를 더하거나 고친 뒤에는 이 스크립트를 한 번 돌리고 chunks/ · content-index.js · chunk-manifest.json을 같이 커밋한다.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const store=require('./content-store.js');
const SOURCES=['core-review-pack.js','quiz-options.js','hanneung-explanations.js','practice-bank.js','study-review-catalog.js','parts.js','memorize.js','basics.js'];
// 조각 이름에 쓰는 과목 줄임말. 새 과목이 생기면 여기에 한 줄 더한다.
const SUBJECT_CODE={'한국사':'hist','영어':'en','국어':'ko','컴퓨터일반':'com','정보보호론':'sec'};
// 원본을 브라우저가 읽던 순서로 한 문맥에서 실행한다. 줄 끝은 LF로 맞춘다(Windows 작업 폴더의 CRLF와 CI의 LF가 같은 결과를 내게).
function loadSources(dir=__dirname){
 const ctx={console};vm.createContext(ctx);
 for(const f of SOURCES)vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8').replace(/\r\n/g,'\n'),ctx,{filename:f});
 return ctx;
}
const bytes=text=>Buffer.from(text,'utf8');
function derive(ctx){
 const core=ctx.CORE_REVIEW_PACK,options=ctx.QUIZ_OPTIONS,bank=ctx.PRACTICE_BANK,basics=ctx.STUDY_BASICS,parts=ctx.STUDY_PARTS,catalog=ctx.STUDY_REVIEW_CATALOG,memo=ctx.MEMORIZE,explanations=ctx.HANNEUNG_EXPLANATIONS,mnemonics=ctx.HISTORY_MNEMONICS,formulas=ctx.ENGLISH_FORMULAS;
 const fail=m=>{throw Error('build-chunks: '+m);};
 const code=subject=>SUBJECT_CODE[subject]||fail('과목 줄임말이 없다(SUBJECT_CODE에 더할 것): '+subject);
 const coreById=new Map(core.map(c=>[c.id,c]));if(coreById.size!==core.length)fail('묶음 카드 id가 겹친다');
 const subjectOf=id=>coreById.has(id)?coreById.get(id).subject:(bank[id].subject||'영어');
 const selfIds=[...core.map(c=>c.id),...Object.keys(bank).filter(id=>!coreById.has(id))];
 for(const id of selfIds)if(/^(gichul|hanneung)-/.test(id))fail('자체 제작 문제 id가 기출 앞머리를 쓴다: '+id);
 const unitName=id=>{const p=parts.partOf(id),u=p&&parts.unitOf(p);return u?'u-'+u.id:'x-'+code(subjectOf(id));};
 const selfChunk=new Map(selfIds.map(id=>[id,unitName(id)]));
 const paperChunk=id=>{if(id.startsWith('gichul-')){const paper=id.slice(7,id.lastIndexOf('-'));return 'g-'+paper.slice(paper.lastIndexOf('-')+1);}const h=/^hanneung-(\d+)-\d+$/.exec(id);return h?'h-'+Number(h[1]):null;};
 const homeOf=id=>selfChunk.get(id)||paperChunk(id)||fail('어느 조각에도 넣을 수 없는 id: '+id);
 const chunks=new Map(),chunk=name=>{if(!/^[a-z]-[a-z0-9-]+$/.test(name))fail('조각 이름: '+name);if(!chunks.has(name))chunks.set(name,{schema:1,id:name});return chunks.get(name);};
 // ---- 자체 제작 문제: 묶음 카드 · 보기 · 연습 문제 · 대입 ----
 for(const c of core){const k=chunk(selfChunk.get(c.id));(k.core??=[]).push(c);}
 for(const [id,o]of Object.entries(options)){if(!selfChunk.has(id))fail('보기만 있고 문제가 없는 id: '+id);(chunk(selfChunk.get(id)).options??={})[id]=o;}
 {const perChunk=new Map();for(const [id,lesson]of Object.entries(bank)){const name=selfChunk.get(id);if(!perChunk.has(name))perChunk.set(name,{});perChunk.get(name)[id]=lesson;
   // 출처 줄이 다른 묶음 카드를 가리키면(lesson.ruleId가 묶음 카드 id) 그 카드도 같은 조각에 있어야 조각 하나로 카드 내용을 만들 수 있다.
   if(!lesson.srcLine&&coreById.has(lesson.ruleId)&&selfChunk.get(lesson.ruleId)!==name)fail('출처 줄이 다른 조각의 묶음 카드를 가리킨다: '+id);
   if(!lesson.variants.length&&!options[id])fail('문제도 보기도 없는 연습 문제: '+id);}
  for(const [name,lessons]of perChunk){const packed=store.packLessons(lessons),k=chunk(name);k.shared=packed.shared;k.bank=packed.bank;}}
 // ---- 대입: 자체 제작은 그 문제의 조각, 9급 기출은 과목마다 하나(g-), 한능검은 회차마다 하나(h-) ----
 for(const [id,a]of Object.entries(basics.apply))(chunk(homeOf(id)).apply??={})[id]=a;
 for(const [id,e]of Object.entries(explanations)){const name=paperChunk(id);if(!name||!name.startsWith('h-'))fail('한능검 해설 id: '+id);(chunk(name).explanations??={})[id]=e;}
 // ---- 상자: 한 단원의 문제만 쓰면 그 단원 조각에, 기출이나 다른 단원도 쓰면 따로(b-<처음 쓰는 단원>) ----
 const ruleFor=id=>bank[id]?.ruleId||(typeof basics.apply[id]?.box==='string'?basics.apply[id].box:null)||null;
 const users=new Map(),firstUnit=new Map();
 for(const id of new Set([...selfIds,...Object.keys(basics.apply)])){const r=ruleFor(id);if(!r||!basics.boxes[r])continue;if(!users.has(r))users.set(r,new Set());users.get(r).add(homeOf(id));}
 for(const u of parts.units)for(const p of u.parts)for(const id of p.ids){const r=ruleFor(id);if(r&&basics.boxes[r]&&!firstUnit.has(r))firstUnit.set(r,u.id);}
 const boxHome={},slots=store.sharedSlots(parts.units,ruleFor,r=>basics.boxes[r]);
 for(const [rule,box]of Object.entries(basics.boxes)){
  const who=[...(users.get(rule)||[])],name=who.length===1&&who[0].startsWith('u-')?who[0]:'b-'+(firstUnit.get(rule)||'misc'),k=chunk(name);
  boxHome[rule]=name;(k.boxes??={})[rule]=box;if(slots.has(rule))(k.sharedSlots??={})[rule]=slots.get(rule);
  for(const x of box.mnemonics||[]){const b=mnemonics?.get(x.id);if(b)(k.mnemonics??={})[x.id]=b;}
 }
 // ---- 외울 것: 과목마다 하나 ----
 const memoRows=[];for(const set of memo.sets){const name='m-'+code(set.subject);(chunk(name).memorize??=[]).push(set);memoRows.push({id:set.id,subject:set.subject,title:set.title,size:memo.size(set),name});}
 // ---- 조각 글 · 지문 ----
 const files=new Map();for(const name of [...chunks.keys()].sort()){const text=JSON.stringify(chunks.get(name));files.set(name,{text,hash:store.hashBytes(bytes(text))});}
 // ---- 색인 ----
 const names=[...files.keys()],at=new Map(names.map((n,i)=>[n,i])),table=()=>{const list=[],seen=new Map();return {list,of(v){if(!seen.has(v)){seen.set(v,list.length);list.push(v);}return seen.get(v);}};};
 const subjects=table(),topics=table(),formulaIds=table(),rules=table(),sections=table();
 const coreIdx={ids:[],s:[],c:[],o:[]};for(const c of core){coreIdx.ids.push(c.id);coreIdx.s.push(subjects.of(c.subject));coreIdx.c.push(at.get(selfChunk.get(c.id)));coreIdx.o.push(options[c.id]?1:0);}
 const bankIdx={ids:[],s:[],c:[],o:[],t:[],f:[],r:[],n:[]};
 for(const [id,l]of Object.entries(bank)){if(typeof l.topic!=='string'||typeof l.ruleId!=='string')fail('연습 문제에 topic · ruleId가 없다: '+id);
  bankIdx.ids.push(id);bankIdx.s.push(subjects.of(l.subject||'영어'));bankIdx.c.push(at.get(selfChunk.get(id)));bankIdx.o.push(options[id]?1:0);bankIdx.t.push(topics.of(l.topic));bankIdx.f.push(l.formula===undefined?-1:formulaIds.of(l.formula));bankIdx.r.push(rules.of(l.ruleId));bankIdx.n.push(l.variants.length);}
 const applyBox={};for(const [id,a]of Object.entries(basics.apply))if(typeof a?.box==='string')(applyBox[a.box]??=[]).push(id);
 const q={};for(const [id,x]of Object.entries(catalog.questions))q[id]=[x.number,sections.of(x.section)];
 const hx={};for(const id of Object.keys(explanations)){const m=/^hanneung-(\d+)-(\d+)$/.exec(id);(hx[Number(m[1])]??=[]).push(Number(m[2]));}
 const index={v:1,build:'',chunks:Object.fromEntries([...files].map(([n,f])=>[n,f.hash])),names,
  subjects:subjects.list,topics:topics.list,formulas:formulaIds.list,rules:rules.list,core:coreIdx,bank:bankIdx,
  boxes:Object.fromEntries(Object.entries(boxHome).map(([r,n])=>[r,at.get(n)])),applyBox,
  catalog:{schema:catalog.schema,total:catalog.total,sets:catalog.sets,lectures:catalog.lectures,sections:sections.list,q},
  english:{areas:formulas.areas},memo:memoRows.map(m=>({id:m.id,subject:m.subject,title:m.title,size:m.size,c:at.get(m.name)})),hx};
 const body=o=>'{\n'+Object.entries(o).map(([k,v])=>JSON.stringify(k)+':'+JSON.stringify(v)).join(',\n')+'\n}';
 index.build=store.hashBytes(bytes(body(index)));
 const indexText='// 자동 생성 파일 — 손으로 고치지 않는다. 원본(practice-bank.js · basics.js · core-review-pack.js · quiz-options.js · study-review-catalog.js · memorize.js · hanneung-explanations.js · parts.js)을 고친 뒤 node build-chunks.cjs 로 다시 만든다.\n'
  +'// 색인: 시작 · 목록 화면이 쓰는 딱지만 있다(문제 글 · 해설 없음). 글은 chunks/<이름>.json?h=<지문>으로 그 문제를 처음 낼 때 받는다(content-store.js).\n'
  +'globalThis.CONTENT_INDEX='+body(index)+';\n'
  +'// 받는 방식의 빈 그릇: hanneung.js · gichul.js가 색인으로 만든 카드 · 보기를 여기에 설치하고, 자체 제작 문제는 조각을 받을 때 채운다.\n'
  +'globalThis.CORE_REVIEW_PACK=[];globalThis.QUIZ_OPTIONS={};\n';
 const manifestText=JSON.stringify({schema:1,build:index.build,files:index.chunks})+'\n';
 return {index,indexText,manifestText,files,chunks};
}
// 디스크에 있어야 할 파일(상대 경로 → 글).
function outputs(built){const out=new Map([['content-index.js',built.indexText],['chunk-manifest.json',built.manifestText]]);for(const [name,f]of built.files)out.set('chunks/'+name+'.json',f.text);return out;}
function diff(built,dir=__dirname){
 const want=outputs(built),bad=[];
 for(const [rel,text]of want){const p=path.join(dir,rel);if(!fs.existsSync(p))bad.push('없음: '+rel);else if(!fs.readFileSync(p).equals(bytes(text)))bad.push('다름: '+rel);}
 const cdir=path.join(dir,'chunks');if(fs.existsSync(cdir))for(const f of fs.readdirSync(cdir))if(!want.has('chunks/'+f))bad.push('남은 파일: chunks/'+f);
 return bad;
}
function write(built,dir=__dirname){
 const want=outputs(built);let changed=0,removed=0;fs.mkdirSync(path.join(dir,'chunks'),{recursive:true});
 for(const [rel,text]of want){const p=path.join(dir,rel),b=bytes(text);if(fs.existsSync(p)&&fs.readFileSync(p).equals(b))continue;fs.writeFileSync(p,b);changed++;}
 for(const f of fs.readdirSync(path.join(dir,'chunks')))if(!want.has('chunks/'+f)){fs.unlinkSync(path.join(dir,'chunks',f));removed++;}
 return {changed,removed};
}
function summary(built){const kinds={};let total=0;for(const [name,f]of built.files){const k=name[0],n=Buffer.byteLength(f.text);kinds[k]??={files:0,bytes:0};kinds[k].files++;kinds[k].bytes+=n;total+=n;}
 return '조각 '+built.files.size+'개 '+(total/1048576).toFixed(2)+'MB('+Object.entries(kinds).map(([k,v])=>k+' '+v.files+'개 '+(v.bytes/1048576).toFixed(2)+'MB').join(' · ')+') · 색인 '+(Buffer.byteLength(built.indexText)/1024).toFixed(0)+'KB · 판 '+built.index.build;}
module.exports={SOURCES,SUBJECT_CODE,loadSources,derive,outputs,diff,write,summary};
if(require.main===module){
 const built=derive(loadSources());
 if(process.argv.includes('--check')){const bad=diff(built);if(bad.length){console.error('조각 · 색인이 원본과 다르다(낡았다). node build-chunks.cjs 를 돌리고 chunks/ · content-index.js · chunk-manifest.json을 커밋할 것:\n '+bad.slice(0,20).join('\n ')+(bad.length>20?'\n … 외 '+(bad.length-20):''));process.exitCode=1;}else console.log('PASS build-chunks --check: '+summary(built));}
 else{const r=write(built);console.log('build-chunks: 쓴 파일 '+r.changed+' · 지운 파일 '+r.removed+' · '+summary(built));}
}
