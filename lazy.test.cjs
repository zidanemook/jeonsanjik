// 자체 제작 내용을 필요할 때 받기(v247) 검사. 설계: research/lazy-load-20261008/DESIGN.md
//  0) 만든 파일(content-index.js · chunks/ · chunk-manifest.json)이 원본과 맞는가(낡았으면 실패 — 통합 뒤 node build-chunks.cjs를 잊은 경우).
//  1) 색인의 모든 칸이 원본(practice-bank · basics · core-review-pack · quiz-options · study-review-catalog · memorize · hanneung-explanations)과 같은가.
//  2) 조각을 모두 붙이면 원본과 글자 하나까지 같은가, 문제마다 필요한 조각(need)에 그 문제의 글 · 대입 · 상자 · 공통 줄 · 암기법이 다 있는가.
//  3) 같은 저장 상태(여러 날 푼 기록)로 전체 방식(원본을 다 읽음 = 다른 검사들이 도는 방식)과 받는 방식(브라우저가 도는 방식)을 가짜 DOM에서 나란히 돌려
//     홈 · 과목 · 범위 · 파트 · 진도 화면과 저장 상태가 같고, 여러 범위와 과목이 섞인 대기열을 풀어 가는 화면 · 기록 · 일정이 걸음마다 같은가.
//  4) 받지 못함(다시 불러오기) · 판이 바뀜(새 버전으로 다시 열기) · 기초 개념 보기 · 외울 것 · 다른 기기의 위치 · 채점 화면 복원.
//  5) 서비스 워커: 설치 때 모든 조각을 미리 받고(지문 확인 · 같은 지문은 옛 캐시에서 복사), 오프라인에서 셸과 모든 조각을 내고, v246 캐시에서 올라오고, 조각 하나가 없으면 그 조각만 실패한다.
//  6) 배포 목록(index.html · sw.js · pages.yml).
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const build=require('./build-chunks.cjs'),store=require('./content-store.js');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8'),J=x=>JSON.stringify(x);
// 값 비교는 JSON 글로 한다(vm 문맥에서 온 배열 · 객체는 원형이 달라 deepEqual이 통하지 않는다).
const D=(a,b,msg)=>same(JSON.stringify(a),JSON.stringify(b),msg||'값이 다르다');
const same=(a,b,msg)=>{if(a===b)return;let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;assert.fail(msg+' — 처음 다른 곳 '+i+': 「'+a.slice(Math.max(0,i-60),i+80)+'」 ≠ 「'+b.slice(Math.max(0,i-60),i+80)+'」');};
(async()=>{
// ---------------------------------------------------------------- 0) 만든 파일이 낡지 않았다
const src=build.loadSources(),built=build.derive(src);
{const bad=build.diff(built);D(bad,[],'조각 · 색인이 원본과 다르다(낡았다). node build-chunks.cjs 를 돌리고 chunks/ · content-index.js · chunk-manifest.json을 커밋할 것: '+bad.slice(0,8).join(' / '));}
const pack=src.CORE_REVIEW_PACK,options=src.QUIZ_OPTIONS,bank=src.PRACTICE_BANK,basics=src.STUDY_BASICS,parts=src.STUDY_PARTS,catalog=src.STUDY_REVIEW_CATALOG,memo=src.MEMORIZE,explanations=src.HANNEUNG_EXPLANATIONS,mnemonics=src.HISTORY_MNEMONICS;
// ---------------------------------------------------------------- 1) 색인 = 원본
const index=(()=>{const c={};vm.createContext(c);vm.runInContext(read('content-index.js'),c,{filename:'content-index.js'});assert.equal(J(c.CORE_REVIEW_PACK),'[]');assert.equal(J(c.QUIZ_OPTIONS),'{}');return JSON.parse(J(c.CONTENT_INDEX));})();
same(J(index),J(built.index),'커밋된 색인 파일이 실행 결과와 다르다');
const names=index.names;
{D(index.core.ids,pack.map(c=>c.id),'묶음 카드 순서');
 pack.forEach((c,i)=>{assert.equal(index.subjects[index.core.s[i]],c.subject,c.id);assert.equal(!!index.core.o[i],!!options[c.id],c.id);});
 const ids=Object.keys(bank);D(index.bank.ids,ids,'연습 문제 순서');
 ids.forEach((id,i)=>{const l=bank[id],b=index.bank;assert.equal(index.subjects[b.s[i]],l.subject||'영어',id);assert.equal(index.topics[b.t[i]],l.topic,id);assert.equal(b.f[i]<0?undefined:index.formulas[b.f[i]],l.formula,id);assert.equal(index.rules[b.r[i]],l.ruleId,id);assert.equal(b.n[i],l.variants.length,id);assert.equal(!!b.o[i],!!options[id],id);});
 for(const id of Object.keys(options))assert.ok(pack.some(c=>c.id===id)||bank[id],'보기만 있는 id: '+id);
 D(Object.keys(index.boxes).sort(),Object.keys(basics.boxes).sort(),'상자 목록');
 const flat=Object.entries(index.applyBox).flatMap(([box,list])=>list.map(id=>id+'>'+box)).sort(),want=Object.entries(basics.apply).filter(e=>typeof e[1].box==='string').map(([id,a])=>id+'>'+a.box).sort();
 D(flat,want,'대입이 가리키는 상자');
 same(J(index.catalog.sets),J(catalog.sets),'요약 묶음');same(J(index.catalog.lectures),J(catalog.lectures),'강 범위 · 핵심 20');assert.equal(index.catalog.total,catalog.total);assert.equal(index.catalog.schema,catalog.schema);
 D(Object.keys(index.catalog.q),Object.keys(catalog.questions));for(const [id,q]of Object.entries(catalog.questions))D([index.catalog.q[id][0],index.catalog.sections[index.catalog.q[id][1]]],[q.number,q.section],id);
 same(J(index.english.areas),J(src.ENGLISH_FORMULAS.areas),'문법 공식 영역');
 D(index.memo.map(m=>[m.id,m.subject,m.title,m.size]),memo.sets.map(s=>[s.id,s.subject,s.title,memo.size(s)]),'외울 것 목록');
 D(Object.entries(index.hx).flatMap(([r,l])=>l.map(n=>'hanneung-'+r+'-'+String(n).padStart(2,'0'))).sort(),Object.keys(explanations).sort(),'해설 있는 한능검 문제');
 assert.ok(!/"(question|explanation|rule|hook|examples|choices|coverage)":/.test(read('content-index.js')),'색인에 문제 글 · 해설 칸이 없다');
 assert.ok(Buffer.byteLength(read('content-index.js'))<1200000,'색인이 1.2MB를 넘었다 — 글이 섞여 들었는지 볼 것');}
// ---------------------------------------------------------------- 2) 조각 = 원본
const chunks=new Map(names.map(n=>[n,JSON.parse(read('chunks/'+n+'.json'))]));
{D(Object.keys(index.chunks),names);
 for(const n of names){const bytes=fs.readFileSync(path.join(__dirname,'chunks',n+'.json'));assert.equal(store.hashBytes(bytes),index.chunks[n],'조각 지문: '+n);assert.ok(!bytes.includes(10)&&!bytes.includes(13),'조각은 한 줄(줄 끝 변환을 타지 않게): '+n);assert.equal(chunks.get(n).schema,1);assert.equal(chunks.get(n).id,n);}
 const manifest=JSON.parse(read('chunk-manifest.json'));D(manifest,{schema:1,build:index.build,files:index.chunks},'서비스 워커용 조각 목록 = 색인의 조각 목록');
 for(const c of chunks.values())if(c.bank)store.unpackLessons(c.shared||[],c.bank);
 const once=(kind,want,get,home)=>{const seen=new Map();for(const [n,c]of chunks)for(const [id,v]of get(c)){assert.ok(!seen.has(id),kind+'가 두 조각에: '+id);seen.set(id,n);same(J(v),J(want[id]),kind+' 글이 원본과 다르다: '+id);if(home)assert.equal(n,home(id),kind+'의 조각이 색인과 다르다: '+id);}assert.equal(seen.size,Object.keys(want).length,kind+' 수');return seen;};
 const coreAt=new Map(index.core.ids.map((id,i)=>[id,names[index.core.c[i]]])),bankAt=new Map(index.bank.ids.map((id,i)=>[id,names[index.bank.c[i]]]));
 once('묶음 카드',Object.fromEntries(pack.map(c=>[c.id,c])),c=>(c.core||[]).map(x=>[x.id,x]),id=>coreAt.get(id));
 once('연습 문제',bank,c=>Object.entries(c.bank||{}),id=>bankAt.get(id));
 once('보기',options,c=>Object.entries(c.options||{}),id=>coreAt.get(id)||bankAt.get(id));
 once('대입',basics.apply,c=>Object.entries(c.apply||{}));
 once('상자',basics.boxes,c=>Object.entries(c.boxes||{}),id=>names[index.boxes[id]]);
 once('한능검 해설',explanations,c=>Object.entries(c.explanations||{}));
 once('외울 것',Object.fromEntries(memo.sets.map(s=>[s.id,s])),c=>(c.memorize||[]).map(s=>[s.id,s]),id=>names[index.memo.find(m=>m.id===id).c]);
 // 조각 안의 묶음 카드 순서 = 원본 순서(새 기기의 카드 순서가 여기서 나오지는 않지만 붙는 순서를 고정해 둔다).
 for(const [n,c]of chunks)if(c.core)D(c.core.map(x=>x.id),pack.filter(x=>coreAt.get(x.id)===n).map(x=>x.id),n);
 // 공통 줄: v246까지의 계산(app.js basicsSharedSets)을 여기 그대로 두고, 상자 조각에 실린 자리 이름과 모든 (파트 · 상자 · 줄)에서 맞대 본다.
 const ruleFor=id=>bank[id]?.ruleId||basics.apply[id]?.box||null,keysOf=b=>[...new Set([...(b.terms||[]),...(b.rules?.items||[]),b.table,...(b.tables||[])].filter(Boolean).map(x=>JSON.stringify(x)))];
 const byPart=new Map(),byRule=new Map();
 for(const u of parts.units)for(const p of u.parts){const rules=[...new Set(p.ids.map(ruleFor).filter(r=>r&&basics.boxes[r]))];if(rules.length<2)continue;
  const n=new Map();for(const r of rules)for(const k of keysOf(basics.boxes[r]))n.set(k,(n.get(k)||0)+1);
  const shared=new Set([...n].filter(e=>e[1]>1).map(e=>e[0]));if(!shared.size)continue;byPart.set(p.id,shared);
  for(const r of rules){let s=byRule.get(r);if(!s)byRule.set(r,s=new Set());for(const k of keysOf(basics.boxes[r]))if(shared.has(k))s.add(k);}}
 const slotsOf=new Map();for(const c of chunks.values())for(const [r,p]of Object.entries(c.sharedSlots||{})){assert.ok(c.boxes?.[r],'공통 줄 표는 그 상자와 같은 조각에: '+r);slotsOf.set(r,p);}
 let checked=0,sharedCount=0;const partsOfRule=new Map();for(const u of parts.units)for(const p of u.parts)for(const r of new Set(p.ids.map(ruleFor)))if(r&&basics.boxes[r]){if(!partsOfRule.has(r))partsOfRule.set(r,[]);partsOfRule.get(r).push(p);}
 for(const [rule,box]of Object.entries(basics.boxes))for(const [slot,x]of store.boxItems(box)){const k=JSON.stringify(x),got=slotsOf.get(rule)||{};
  for(const p of partsOfRule.get(rule)||[]){const want=!!byPart.get(p.id)?.has(k);assert.equal(!!got[p.id]?.includes(slot),want,'공통 줄(파트 안): '+p.id+' '+rule+' '+slot);checked++;if(want)sharedCount++;}
  assert.equal(Object.values(got).some(s=>s.includes(slot)),!!byRule.get(rule)?.has(k),'공통 줄(어느 파트든): '+rule+' '+slot);}
 assert.ok(checked>3000&&sharedCount>100,'공통 줄 대조가 비어 있지 않다: '+checked+' · '+sharedCount);
 for(const [n,c]of chunks)for(const [rule,box]of Object.entries(c.boxes||{}))for(const x of box.mnemonics||[]){const b=mnemonics.get(x.id);if(b)same(J(c.mnemonics?.[x.id]),J(b),'암기법 블록은 그 상자와 같은 조각에: '+n+' '+x.id);}
 globalThis.__shared={checked,sharedCount};}
// ---------------------------------------------------------------- 가짜 DOM에서 앱 돌리기(app.test.cjs와 같은 틀)
const FULL=['scheduler.js','learning.js','core-review-pack.js','quiz-options.js','hanneung-data.js','hanneung-explanations.js','hanneung.js','gichul-index.js','gichul.js','practice-bank.js','practice.js','content-corrections.js','review-record.js','review-policy.js','sync-core.js','study-credit.js','xp.js','score.js','study-review-catalog.js','hanneung-topics.js','topics.js','parts.js','part-check.js','memorize.js','basics.js','core-units.js','content-store.js','app.js'];
const html=read('index.html'),LAZY=[...html.matchAll(/<script src="([^"?]+)\?v=\d+"><\/script>/g)].map(m=>m[1]).filter(f=>f!=='firebase-config.js'&&f!=='sync.js');
const text=new Map();const source=f=>{if(!text.has(f))text.set(f,read(f));return text.get(f);};
const flush=()=>new Promise(r=>setImmediate(r));
const T=Date.now(),tick=label=>{if(process.env.LAZY_TIMING)console.error(((Date.now()-T)/1000).toFixed(1)+'s '+label);};
const RealDate=Date,DAY=86400000,T0=RealDate.parse('2026-10-08T03:00:00Z');
function boot({lazy,saved,now=T0}){
 function el(tag='div'){const node={tag,children:[],attrs:{},dataset:{},classes:new Set(),_text:'',hidden:false,disabled:false,open:false,
  get textContent(){return node._text;},set textContent(v){node._text=String(v);node.children=[];},
  append(...k){node.children.push(...k);},replaceChildren(...k){node.children=k;},
  classList:{add:c=>node.classes.add(c),remove:c=>node.classes.delete(c),toggle:(c,on)=>on?node.classes.add(c):node.classes.delete(c),contains:c=>node.classes.has(c)},
  setAttribute(k,v){node.attrs[k]=v;},getAttribute(k){return node.attrs[k];},focus(){},setSelectionRange(){},addEventListener(){},
  querySelector(sel){return sel==='summary'?el('summary'):null;},querySelectorAll(){return [];},
  get all(){const out=[];(function walk(n){for(const c of n.children){out.push(c);walk(c);}})(node);return out;}};return node;}
 const nodes=new Map(),local=new Map(saved||[]),inst={nodes,local,lazy,reloads:0,uuid:{n:1},clock:{now},net:{log:[],offline:false,missing:new Set(),tamper:new Set()}};
 // 한능검 원문 그림은 받은 것으로 친다(답을 받으려면 그림이 떠 있어야 한다).
 nodes.set('#card .paper-image img',Object.assign(el('img'),{complete:true,naturalWidth:10}));
 class FakeDate extends RealDate{constructor(...a){if(a.length)super(...a);else super(inst.clock.now);}static now(){return inst.clock.now;}}
 const doc={createElement:tag=>el(tag),createTextNode(t){const n=el('#text');n._text=String(t);return n;},body:el('body'),activeElement:null,
  querySelector(sel){if(!nodes.has(sel))nodes.set(sel,el(sel));return nodes.get(sel);},querySelectorAll(){return [];},addEventListener(){}};
 const ctx={document:doc,console,
  localStorage:{getItem:k=>local.has(k)?local.get(k):null,setItem:(k,v)=>local.set(k,String(v)),removeItem:k=>local.delete(k)},
  crypto:{randomUUID:()=>'id-'+(inst.uuid.n++)},
  history:{state:{depth:0},pushState(s){this.state=s;},replaceState(s){this.state=s;}},
  navigator:{},setInterval:()=>1,clearInterval(){},clearTimeout(){},structuredClone,addEventListener(){},dispatchEvent(){},scrollTo(){},location:{reload(){inst.reloads++;}},
  Date:FakeDate,JSON,Math,Set,Map,Number,String,Object,Array,Error,RegExp,Intl,Promise,TextDecoder,Uint8Array,Event:class{constructor(t){this.type=t;}}};
 ctx.window=ctx;ctx.self=ctx;vm.createContext(ctx);
 ctx.fetch=(url,opts)=>{inst.net.log.push(url+(opts?.cache?' ['+opts.cache+']':''));
  if(inst.net.offline)return Promise.reject(new TypeError('Failed to fetch'));
  let m=/^chunks\/([a-z]-[a-z0-9-]+)\.json\?h=([0-9a-f]{16})$/.exec(url);
  if(m){assert.ok(lazy,'전체 방식은 조각을 받지 않는다');if(inst.net.missing.has(m[1]))return Promise.resolve({ok:false,status:404});
   let b=fs.readFileSync(path.join(__dirname,'chunks',m[1]+'.json'));if(inst.net.tamper.has(m[1]))b=Buffer.concat([b,Buffer.from(' ')]);
   return Promise.resolve({ok:true,status:200,arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.length))});}
  m=/^gichul\/([a-z0-9-]+)\.json$/.exec(url);if(m)return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(require('./gichul-files.cjs').read(m[1]))});
  return Promise.reject(Error('unexpected fetch '+url));};
 for(const f of lazy?LAZY:FULL)vm.runInContext(source(f),ctx,{filename:f});
 inst.ctx=ctx;inst.run=code=>vm.runInContext(code,ctx);
 inst.text=sel=>{const n=nodes.get(sel);return n?[n._text,...n.all.map(x=>x._text)].filter(Boolean).join(' | '):'';};
 inst.card=()=>inst.text('#card');
 inst.click=(sel,label)=>{const b=nodes.get(sel).all.find(n=>n.tag==='button'&&n._text===label);assert.ok(b,'버튼이 없다: '+label+' — '+inst.text(sel).slice(0,200));b.onclick();};
 inst.settle=async()=>{for(let i=0;i<6;i++)await flush();};
 inst.lean=()=>inst.run('JSON.stringify(leanState(data))');
 return inst;
}
const open=async(inst,scope)=>{inst.run('openScope('+J(scope)+')');await inst.settle();};
const next=async inst=>{inst.run("(()=>{const s=structuredClone(data);delete s.quizFeedback;delete s.activePractice;if(commit(s)){sessionDirty=true;render();}})()");await inst.settle();};
// 지금 문제에 답한다(wrong이면 틀린 답). 돌려주는 값: 채점 화면 글. 풀 문제가 없으면 null.
const answer=(inst,wrong)=>{
 if(!inst.run('!!data.activePractice&&!data.quizFeedback'))return null;
 const quiz=inst.run('data.activePractice.exercise'),id=inst.run('data.activePractice.cardId');
 const input=quiz.type==='choice'?(wrong?(quiz.correctIndex+1)%quiz.choices.length:quiz.correctIndex):(wrong?'zzz not the answer':quiz.answers[0]);
 inst.run('answerPractice('+J(id)+','+J(input)+')');assert.ok(inst.run('!!data.quizFeedback'),'답이 채점되지 않았다: '+id+' — '+inst.nodes.get('#message')._text);
 return inst.card();
};
// 한 범위를 열어 n문제를 푼다(셋에 하나는 틀린다). 걸음마다의 화면 글을 모아 돌려준다. 시계 · 기록 id는 걸음 번호로 정한다(두 방식이 같은 값을 쓰게).
let stepNo=0;
async function play(inst,scope,n,base){
 const out=[];inst.clock.now=base;inst.uuid.n=1000000+stepNo*100;await open(inst,scope);
 for(let i=0;i<n;i++){out.push('Q '+inst.nodes.get('#scopeLabel')._text+' · '+inst.nodes.get('#roundScore')._text+' · '+inst.nodes.get('#orderStatus')._text+' · '+inst.nodes.get('#retryStatus')._text+' :: '+inst.card()+' @@ 위치 '+inst.run('JSON.stringify(data.session||null)'));
  inst.clock.now=base+(i+1)*40000;inst.uuid.n=1000000+stepNo*100+i*3+1;
  const fb=answer(inst,i%3===1);if(fb===null)break;out.push('A '+fb);await next(inst);}
 return out;
}
// ---------------------------------------------------------------- 3) 같은 상태로 두 방식을 나란히
// 저장 상태 만들기: 앱으로 여러 날에 걸쳐 여러 범위를 푼다(틀림 · 맞음 · 해설 열람 · 더 풀기 · 대기열 모드 · 파트 점검 · 하루 목표 · 목표 점수 · 의견).
// 받는 방식으로 만든다(전체 방식은 답 하나에 0.5초가 든다 — 카드마다 글을 든 채 상태를 통째로 복사해서). 저장소에는 어느 방식이든 글 없이 일정 · 기록만 남고,
// 아래에서 같은 저장 상태를 두 방식이 똑같이 읽고 똑같이 이어 가는지 본다.
const SCOPES=[{subject:'한국사',round:'lecture-11'},{subject:'영어',topic:'Day 3'},{subject:'영어',topic:'formula:ditransitive-no'},{subject:'국어',topic:'논리 2장'},{subject:'국어',topic:'어휘 2장'},
 {subject:'컴퓨터일반',topic:'컴일 cg04'},{subject:'한국사',round:'79'},{subject:'컴퓨터일반',round:'paper-local9-2025-computer'},{subject:'정보보호론',round:''},{subject:'한국사',round:'lecture-252-256'},{subject:'영어',topic:'수일치'},{subject:'한국사',round:''}];
// (개발할 때만) LAZY_STATE=<파일>을 주면 만든 상태를 그 파일에 두고 다음부터 다시 쓴다. CI는 언제나 새로 만든다.
const stateFile=process.env.LAZY_STATE||'';
let SAVED;
if(stateFile&&fs.existsSync(stateFile))SAVED=JSON.parse(fs.readFileSync(stateFile,'utf8'));
else{
const G=boot({lazy:true,now:T0-45*DAY});
{let k=0;for(const d of [-45,-30,-16,-9,-1]){for(const sc of SCOPES){stepNo=k++;await play(G,sc,d<=-30?3:2,T0+d*DAY+k*1000000%DAY);}
  if(d===-45)G.run("setLectureOpen('en-day3',true);setLectureOpen('11',true)");
  if(d===-30){G.run("openScope({subject:'국어',topic:'논리 2장'});setQueueMode('wrong')");G.run("setSubjectGoal('영어',30);saveTarget({name:'지방직 전산9급',cutoff:90,bonus:5})");}
  if(d===-16){G.run("openScope({subject:'한국사',round:'lecture-12'});setQueueMode('parts')");await G.settle();for(let i=0;i<7;i++){if(answer(G,i%4===0)===null)break;await next(G);}}
  if(d===-9){G.run("openScope({subject:'한국사',round:'lecture-12'});setQueueMode('default')");for(const id of G.run("data.history.filter(h=>h.mode==='quiz').slice(-25).map(h=>h.id)"))G.run('creditExplanation('+J(id)+')');
   G.run("(()=>{const c=data.cards.find(c=>c.id==='en-day3-001')||data.cards[0];data.noteDraft={cardId:c.id,text:'보기 2번이 헷갈려요',open:true};sendNote(c,{exerciseId:'x',question:'q'},'question','제목');data.memorizeLast='goryeo-kings';saveDraft();})()");}
 }
 G.clock.now=T0-3600000;stepNo=900;await play(G,{subject:'영어',topic:'Day 9'},3,T0-3600000);assert.ok(answer(G,true),'마지막 답');} // 마지막은 채점 화면을 남긴 채(풀던 자리 복원 검사)
SAVED=[...G.local];if(stateFile)fs.writeFileSync(stateFile,JSON.stringify(SAVED));}
{const s=JSON.parse(new Map(SAVED).get('chagog-v1'));assert.ok(s.history.length>120&&s.explanationViews?.length>=20&&s.notes?.length===1&&s.openLectures?.length===2&&s.queueModes&&s.partChecks&&s.dailyGoals&&s.targetExam&&s.quizFeedback,'만든 상태에 기록 · 설정이 고루 들어 있다: '+s.history.length);
 assert.ok(s.cards.every(c=>!c.id.startsWith('en-day')||c.question===undefined),'저장소에는 문제 글을 남기지 않는다');}
tick('상태 준비');
const F=boot({lazy:false,saved:SAVED}),L=boot({lazy:true,saved:SAVED});tick('두 방식 시작');
D(L.net.log,[],'받는 방식: 시작할 때 조각을 하나도 받지 않는다');
assert.equal(L.run('Object.keys(PRACTICE_BANK).length'),0,'받는 방식: 시작할 때 연습 문제 글이 없다');
assert.equal(L.run('StudyContent.lazy'),true);assert.equal(F.run('StudyContent.lazy'),false);
same(L.lean(),F.lean(),'불러온 직후의 상태(카드 순서 · 일정 · 기록)');
same(J([...L.local]),J([...F.local]),'불러온 직후의 저장소');
assert.equal(L.run('data.cards.length'),F.run('data.cards.length'));
same(L.run('JSON.stringify([...cardContent()].map(([id,c])=>[id,c.subject]))'),F.run('JSON.stringify([...cardContent()].map(([id,c])=>[id,c.subject]))'),'카드 내용 순서 · 과목');
const SUBJECTS=F.run('JSON.stringify(subjectsList())');same(L.run('JSON.stringify(subjectsList())'),SUBJECTS,'과목 목록');
// 목록 화면: 조각 없이 그려지고 두 방식이 글자까지 같다.
const screens=inst=>{const out={};const grab=(k,sels)=>{out[k]=sels.map(s=>inst.text(s)).join(' ## ');};
 inst.run("go('home')");grab('홈',['#subjectList','#xpLevel','#xpAcc','#xpStreak','#xpText','#xpGoal','#homeScore']);
 for(const s of JSON.parse(SUBJECTS)){inst.run('go("subject",'+J(s)+')');grab(s+' 과목',['#subjectTitle','#subjectSummary','#subjectGoalText','#subjectLevel','#memorizeHint','#partsHint','#resumeHint']);
  inst.run('go("range",'+J(s)+')');grab(s+' 범위',['#rangeTitle','#rangeList']);
  inst.run('go("parts",'+J(s)+')');grab(s+' 파트',['#partsTitle','#partsBody']);
  inst.run('go("memorize",'+J('과목:'+s)+')');grab(s+' 외울 것',['#memorizeTitle','#memorizeBody']);}
 inst.run("go('progress')");grab('진도',['#due','#total','#done','#retention','#subjectStats','#studyToday','#studyTotal','#studyCreditCount','#studyTimeHistory','#scoreTarget','#scoreTotal','#scoreGap','#scoreRows']);
 for(const kind of ['exam','self'])for(const s of [null,...JSON.parse(SUBJECTS)]){inst.run('openBadgeInfo('+J(s)+','+J(kind)+')');grab('뱃지 '+kind+' '+s,['#badgeInfo']);inst.run('closeBadgeInfo()');}
 inst.run("go('home')");return out;};
{const a=screens(F),b=screens(L);for(const k of Object.keys(a)){assert.ok(a[k].length>10,'화면이 비어 있지 않다: '+k);same(b[k],a[k],'화면이 다르다: '+k);}
 D(L.net.log,[],'목록 화면(홈 · 과목 · 범위 · 파트 · 외울 것 목록 · 진도 · 뱃지)은 조각 없이 그려진다');
 assert.ok(/약한 파트|복습 판정 \d/.test(a['한국사 파트']+a['영어 파트']+a['국어 파트']),'파트 화면에 복습 판정이 실제로 잡힌다');}
tick('목록 화면');
// 풀던 자리(채점 화면) 복원: 과목 화면의 '이어서'와 같은 길.
{for(const inst of [F,L]){inst.run("openScope(lastScope('영어'),true)");await inst.settle();}
 assert.ok(/채점 결과 · 해설/.test(F.card())&&/기초 개념/.test(F.card()),'채점 화면이 복원된다: '+F.card().slice(0,80));same(L.card(),F.card(),'복원된 채점 화면');
 D(L.net.log.map(u=>u.replace(/^chunks\/|\.json.*$/g,'')).sort(),L.run('StudyContent.need(data.quizFeedback.cardId)').slice().sort(),'채점 화면은 그 문제에 필요한 조각만 받아 그린다');assert.ok(L.net.log.length>=1&&L.net.log.length<=2);
 for(const inst of [F,L])await next(inst);same(L.card(),F.card(),'다음 문제');}
// 여러 범위를 차례로 풀기: 걸음마다 화면 글이 같다. 받는 방식은 필요한 조각만 받는다.
const TODAY=[{subject:'영어',topic:'Day 3'},{subject:'한국사',round:'lecture-11'},{subject:'컴퓨터일반',topic:'컴일 cg04'},{subject:'국어',topic:'논리 2장'},{subject:'한국사',round:'79'},{subject:'컴퓨터일반',round:'paper-local9-2025-computer'},
 {subject:'정보보호론',round:''},{subject:'영어',topic:'formula:ditransitive-no'},{subject:'영어',topic:'수일치'},{subject:'한국사',round:'lecture-23'},{subject:'국어',topic:'독해 3장'},{subject:'한국사',round:''},{subject:'컴퓨터일반',round:''}];
let steps=0,answered=0;
for(const [i,sc]of TODAY.entries()){stepNo=2000+i;const before=L.net.log.length,a=await play(F,sc,4,T0+i*600000),b=await play(L,sc,4,T0+i*600000);
 assert.equal(b.length,a.length,'걸음 수: '+J(sc));for(let k=0;k<a.length;k++){same(b[k],a[k],'풀이 화면이 다르다: '+J(sc)+' 걸음 '+k);steps++;}
 tick('범위 '+J(sc));answered+=a.filter(x=>x.startsWith('A ')).length;assert.ok(a.length>=1&&a[0].length>40,'화면이 그려졌다: '+J(sc));{const bad=a.find(x=>/문제를 불러오는 중|문제를 불러오지 못했|기출 문제를 불러오/.test(x));assert.ok(!bad,'화면에 받는 중 안내가 남지 않는다: '+J(sc)+' '+String(bad).slice(0,300));}
 const got=L.net.log.slice(before).filter(u=>u.startsWith('chunks/')).map(u=>u.replace(/^chunks\/|\.json.*$/g,''));
 if(sc.topic==='Day 3')D(got,['u-en-day3'],'영어 Day 3은 그 단원 조각만');
 if(sc.topic==='컴일 cg04')D(got.sort(),['b-com-u2','u-comq-cg04'],'컴퓨터일반 한 단원은 그 단원 조각 + 기출과 함께 쓰는 상자 조각');
 if(sc.round==='79')assert.ok(got.includes('h-79')&&got.every(n=>n==='h-79'||n.startsWith('b-hist-')),'한능검 79회는 그 회 조각과 한국사 상자 조각만: '+got);
 same(L.lean(),F.lean(),'풀고 난 상태(기록 · 일정 · 설정): '+J(sc));}
assert.ok(answered>=36,'범위마다 실제로 풀었다(틀린 문제 위주 모드의 빈 범위 · 다 푼 공식 범위는 안내 화면만 견준다): '+answered);
// 과목이 섞인 대기열(범위 = 전체 과목): 여러 과목 · 단원의 문제가 한 대기열에 오고, 받는 방식이 문제마다 조각을 받아 가며 같은 순서로 낸다.
{// 새로 연 앱(받은 조각 없음)에서 이어 풀기: 지금까지의 저장 상태로 두 방식을 다시 연다.
 const F2=boot({lazy:false,saved:[...F.local]}),L2=boot({lazy:true,saved:[...L.local]});same(L2.lean(),F2.lean(),'다시 연 상태');
 stepNo=3000;const a=await play(F2,{subject:''},30,T0+20*600000),b=await play(L2,{subject:''},30,T0+20*600000);
 assert.equal(b.length,a.length);for(let k=0;k<a.length;k++){same(b[k],a[k],'섞인 대기열 걸음 '+k);steps++;}
 const subjects=new Set(a.filter(x=>x.startsWith('Q ')).map(x=>/:: ([^ ]+) · /.exec(x)?.[1]));assert.ok(subjects.size>=3,'대기열에 세 과목 이상이 섞였다: '+[...subjects]);
 const got=new Set(L2.net.log.filter(u=>u.startsWith('chunks/')).map(u=>u.replace(/^chunks\/|\.json.*$/g,'')));assert.ok(got.size>=5,'섞인 대기열에서 새 조각을 받아 가며 풀었다: '+[...got]);
 same(L2.lean(),F2.lean(),'섞인 대기열을 푼 뒤의 상태');globalThis.__mixed={subjects:[...subjects],chunks:got.size,steps:a.length};}
{const a=screens(F),b=screens(L);for(const k of Object.keys(a))same(b[k],a[k],'푼 뒤 화면이 다르다: '+k);}
// 기초 개념 보기 · 외울 것 목록 하나: 받은 뒤 두 방식이 같다.
{const partsToSee=['h11-1','enf-1','ko2-1','cg04','s01'].filter(p=>F.run('!!PARTS.part('+J(p)+')'));assert.ok(partsToSee.length>=3,'볼 파트: '+partsToSee);
 for(const p of partsToSee){for(const inst of [F,L]){inst.run('go("parts",PARTS.unitOf('+J(p)+').subject);openBasics('+J(p)+')');await inst.settle();}assert.ok(F.text('#basicsBody').length>200,p);same(L.text('#basicsBody'),F.text('#basicsBody'),'기초 개념 보기: '+p);}
 for(const m of memo.sets.filter((s,i)=>i%6===0)){for(const inst of [F,L]){inst.run('memorizeShown=new Set();go("memorize",'+J(m.id)+')');await inst.settle();}assert.ok(F.text('#memorizeBody').length>100,m.id);same(L.text('#memorizeBody'),F.text('#memorizeBody'),'외울 것: '+m.id);same(L.text('#memorizeTitle'),F.text('#memorizeTitle'),'외울 것 제목');}}
tick('풀이 대조');
// ---------------------------------------------------------------- 2-2) 모든 조각을 붙이면 전역이 전체 방식과 같다 · 문제마다 need가 충분하다
{const A=boot({lazy:true,saved:SAVED});
 // need: 조각을 붙이기 전에, 색인만으로 모든 문제의 필요한 조각을 묻는다.
 const ids=[...pack.map(c=>c.id),...Object.keys(bank)],paperIds=A.run("JSON.stringify([...Gichul.papers.flatMap(p=>p.numbers.map(n=>Gichul.cardId(p,n))),...Hanneung.rows.map(r=>r.id)])");
 const need=JSON.parse(A.run('JSON.stringify(Object.fromEntries('+J([...new Set([...ids,...JSON.parse(paperIds)])])+'.map(id=>[id,StudyContent.need(id)])))'));
 const within=(list,get)=>list.some(n=>get(chunks.get(n)));
 for(const id of Object.keys(need)){const list=need[id];for(const n of list)assert.ok(chunks.has(n),'없는 조각: '+n);
  if(pack.some(c=>c.id===id)&&ids.includes(id))assert.ok(within(list,c=>c.core?.some(x=>x.id===id)),'묶음 카드 조각: '+id);
  if(bank[id])assert.ok(within(list,c=>c.bank?.[id]),'연습 문제 조각: '+id);if(options[id])assert.ok(within(list,c=>c.options?.[id]),'보기 조각: '+id);
  if(basics.apply[id])assert.ok(within(list,c=>c.apply?.[id]),'대입 조각: '+id);if(explanations[id])assert.ok(within(list,c=>c.explanations?.[id]),'해설 조각: '+id);
  const rule=bank[id]?.ruleId||basics.apply[id]?.box;if(rule&&basics.boxes[rule])assert.ok(within(list,c=>c.boxes?.[rule]),'상자 조각: '+id+' → '+rule);}
 const cores=pack.filter(c=>!bank[c.id]).length;assert.ok(Object.keys(need).length>ids.length+3000,'기출 문제도 물었다');
 await A.run('StudyContent.loadAll()');await A.settle();
 D(A.run('StudyContent.loaded().sort()'),names.slice().sort(),'모든 조각을 붙였다');
 same(A.run('JSON.stringify(PRACTICE_BANK)'),J(Object.fromEntries(Object.keys(JSON.parse(A.run('JSON.stringify(Object.keys(PRACTICE_BANK))')).reduce((o,k)=>(o[k]=1,o),{})).map(k=>[k,bank[k]]))),'붙인 연습 문제 = 원본');
 assert.equal(A.run('Object.keys(PRACTICE_BANK).length'),Object.keys(bank).length);
 for(const [name,code]of [['보기',"Object.fromEntries(Object.entries(QUIZ_OPTIONS).filter(([id])=>!/^(gichul|hanneung)-/.test(id)).sort())"],['상자','Object.fromEntries(Object.entries(STUDY_BASICS.boxes).sort())'],['대입','Object.fromEntries(Object.entries(STUDY_BASICS.apply).sort())'],['한능검 해설','Object.fromEntries(Object.entries(HANNEUNG_EXPLANATIONS).sort())']]){
  const want={'보기':options,'상자':basics.boxes,'대입':basics.apply,'한능검 해설':explanations}[name];same(A.run('JSON.stringify('+code+')'),J(Object.fromEntries(Object.entries(want).sort())),'붙인 '+name+' = 원본');}
 same(A.run("JSON.stringify(StudyContent.index.core.ids.map(id=>StudyContent.core(id)))"),J(pack),'붙인 묶음 카드 = 원본');
 same(A.run('JSON.stringify(MEMORIZE.sets.map(s=>MEMORIZE.get(s.id)))'),J(memo.sets),'붙인 외울 것 = 원본');
 // 붙인 뒤의 카드 내용(과목 · 질문 · 정답 · 해설 · 출처)과 공통 줄 판정이 전체 방식과 같다.
 const content="JSON.stringify([...cardContent()])";same(A.run(content),F.run(content),'카드 내용(모든 문제)');
 const hx="JSON.stringify(Hanneung.rows.map(r=>[r.id,Hanneung.hasExplanation(r.id),Hanneung.explanation(r.id),QUIZ_OPTIONS[r.id]?.explanation]))";same(A.run(hx),F.run(hx),'한능검 해설 · 보기에 채운 해설');
 const sh="JSON.stringify(PARTS.units.flatMap(u=>u.parts.flatMap(p=>partBasics(p).flatMap(r=>{const b=BASICS.box(r);return [...b.terms,...b.rules.items,b.table,...(b.tables||[])].filter(Boolean).map(x=>(basicsShared(x,r,p.id)?1:0)+(basicsShared(x,r,null)?2:0)).join('');}))))";same(A.run(sh),F.run(sh),'공통 줄 판정(모든 파트 · 상자 · 줄)');
 const mn="JSON.stringify(Object.values(BASICS.boxes).flatMap(b=>(b.mnemonics||[]).map(x=>[x.id,HISTORY_MNEMONICS.get(x.id)])))";same(A.run(mn),F.run(mn),'암기법 블록');
 globalThis.__need=Object.keys(need).length;}
tick('전체 붙이기');
// ---------------------------------------------------------------- 4) 받지 못함 · 판이 바뀜 · 다른 기기의 위치
{const B=boot({lazy:true,saved:SAVED});B.run("(()=>{const s=structuredClone(data);delete s.queueModes;commit(s);})()"); // 저장 상태의 국어는 '틀린 문제 위주'라 안 푼 범위가 비어 보인다 — 여기서는 기본 순서로
 // (가) 연결 없음: 안내 + 다시 불러오기. 빈 화면 · 멈춘 화면이 아니다.
 B.net.offline=true;await open(B,{subject:'영어',topic:'Day 5'});
 assert.match(B.card(),/문제를 불러오지 못했어요/);assert.match(B.card(),/다시 불러오기/);assert.match(B.card(),/다른 범위 고르기/);assert.ok(!/새 버전/.test(B.card()));assert.equal(B.run('!!data.activePractice'),false);
 B.run("go('home')");assert.ok(B.text('#subjectList').length>50,'홈은 그대로 그려진다');B.run("go('range','영어')");assert.ok(B.text('#rangeList').includes('Day 5'),'범위 목록도 그대로');
 B.run("openScope({subject:'영어',topic:'Day 5'},true)");await B.settle();assert.match(B.card(),/문제를 불러오지 못했어요/,'다시 들어와도 같은 안내(자동으로 되풀이해 받지 않는다)');
 const tries=B.net.log.length,per=B.run("StudyContent.need(data.cards.find(c=>inCurrent(c)).id).length");assert.equal(tries,per,'안내 화면에 다시 들어와도 받기를 되풀이하지 않았다');
 B.click('#card','다시 불러오기');await B.settle();assert.equal(B.net.log.length,tries+per,'누를 때마다 필요한 조각을 한 번씩만 다시 받는다');assert.match(B.card(),/문제를 불러오지 못했어요/);
 B.net.offline=false;B.click('#card','다시 불러오기');await B.settle();assert.ok(B.run('!!data.activePractice'),'연결되면 다시 불러오기로 문제가 나온다: '+B.card().slice(0,80));assert.ok(!/불러오/.test(B.card()));
 // 풀던 중 연결이 끊김: 받은 단원은 계속 풀리고, 다음 문제가 안 받은 조각이면 안내가 나온다(미리 받기 실패는 화면에 남지 않는다).
 B.net.offline=true;for(let i=0;i<3;i++){assert.ok(answer(B,false),'받은 단원은 연결 없이 풀린다');await next(B);}assert.ok(B.run('!!data.activePractice'));
 await open(B,{subject:'국어',topic:'논리 5장'});assert.match(B.card(),/문제를 불러오지 못했어요/);B.net.offline=false;B.click('#card','다시 불러오기');await B.settle();assert.ok(B.run('!!data.activePractice'));
 // (나) 판이 바뀜: 받은 바이트의 지문이 색인과 다르다 → 한 번 더 받아 보고(HTTP 캐시 건너뜀) 그래도 다르면 새 버전 안내.
 B.net.tamper.add('u-ko-ko3');const at=B.net.log.length;await open(B,{subject:'국어',topic:'논리 3장'});
 assert.match(B.card(),/새 버전으로 바뀌었어요/);assert.match(B.card(),/새 버전으로 다시 열기/);assert.match(B.card(),/다시 불러오기/);assert.match(B.card(),/다른 범위 고르기/);
 D(B.net.log.slice(at).map(u=>u.replace(/\?h=[0-9a-f]+/,'')),['chunks/u-ko-ko3.json','chunks/u-ko-ko3.json [reload]'],'지문이 다르면 캐시를 건너뛰고 한 번만 더 받는다');
 assert.equal(B.run('Object.keys(PRACTICE_BANK).filter(id=>id.startsWith("ko-logic3")).length'),0,'지문이 다른 조각은 붙이지 않는다');
 B.click('#card','새 버전으로 다시 열기');assert.equal(B.reloads,1,'새 버전으로 다시 열기 = 새로고침');
 B.net.tamper.clear();B.click('#card','다시 불러오기');await B.settle();assert.ok(B.run('!!data.activePractice'));
 // 조각이 없어짐(404)도 판이 바뀐 것.
 B.net.missing.add('u-ko-ko4');await open(B,{subject:'국어',topic:'논리 4장'});assert.match(B.card(),/새 버전으로 바뀌었어요/);B.net.missing.clear();
 // (다) 기초 개념 보기 · 외울 것: 같은 안내, 뒤로 가기는 그대로.
 B.net.offline=true;B.run('go("parts","한국사");openBasics("h13-1")');await B.settle();assert.match(B.text('#basicsBody'),/문제를 불러오지 못했어요/);assert.match(B.text('#basicsBody'),/다시 불러오기/);
 B.net.offline=false;B.click('#basicsBody','다시 불러오기');await B.settle();assert.match(B.text('#basicsBody'),/이 파트 문제 풀기/);
 B.net.offline=true;B.run('go("memorize","history-people")');await B.settle();assert.match(B.text('#memorizeBody'),/문제를 불러오지 못했어요/);assert.equal(B.text('#memorizeTitle').length>3,true);
 B.net.offline=false;B.click('#memorizeBody','다시 불러오기');await B.settle();assert.match(B.text('#memorizeBody'),/확인/);
 assert.ok(!/카드|문항/.test([B.card(),B.text('#basicsBody'),B.text('#memorizeBody')].join(' ')),'안내 글에 카드 · 문항이라는 말이 없다');}
{// (라) 다른 기기의 위치: 그 문제의 조각을 받은 뒤 같은 문제 · 같은 보기 순서로 연다. 받지 못하면 범위만 옮기고 안내를 보인다.
 const R=boot({lazy:false,saved:SAVED}),C=boot({lazy:true,saved:SAVED}),Z=boot({lazy:true,saved:SAVED});
 R.clock.now=T0+DAY/2;await open(R,{subject:'영어',topic:'Day 7'});const row=JSON.parse(R.run('JSON.stringify(data.session)'));assert.ok(row.cardId&&row.choices,'전체 방식 기기의 위치: '+J(row).slice(0,120));
 C.run('StudyProgress.mergeSession('+J(row)+')');assert.equal(C.run('data.practiceScope?.topic')==='Day 7',false,'조각을 받기 전에는 위치를 옮기지 않는다');await C.settle();
 assert.equal(C.run('data.practiceScope.topic'),'Day 7');assert.equal(C.run('data.activePractice.cardId'),row.cardId);D(C.run('data.activePractice.exercise.choices'),row.choices,'같은 보기 순서');assert.equal(C.run('data.activePractice.exercise.exerciseId'),row.exerciseId);
 C.run("go('quiz')");await C.settle();R.run("go('quiz')");same(C.card(),R.card(),'다른 기기에서 넘어온 문제 화면');
 Z.net.offline=true;Z.run('StudyProgress.mergeSession('+J(row)+')');await Z.settle();assert.equal(Z.run('data.practiceScope.topic'),'Day 7','받지 못해도 범위는 옮긴다');assert.equal(Z.run('!!data.activePractice'),false);
 Z.run("go('quiz')");await Z.settle();assert.match(Z.card(),/문제를 불러오지 못했어요/);Z.net.offline=false;Z.click('#card','다시 불러오기');await Z.settle();assert.ok(Z.run('!!data.activePractice'));}
{// (마) 기록이 없는 새 기기: 카드 순서 · 일정 · 첫 화면이 전체 방식과 같다.
 const a=boot({lazy:false}),b=boot({lazy:true});same(b.lean(),a.lean(),'새 기기의 상태');same(b.text('#subjectList'),a.text('#subjectList'),'새 기기의 첫 화면');D(b.net.log,[]);
 assert.equal(b.run("data.cards.filter(c=>c.question!==undefined&&!/^(gichul|hanneung)-/.test(c.id)).length"),0,'받기 전 자체 제작 카드에는 글이 없다');
 await open(b,{subject:'영어',topic:'Day 1'});assert.ok(b.run("data.cards.filter(c=>c.id.startsWith('en-day1-')).every(c=>typeof c.question==='string'&&c.question&&typeof c.explanation==='string'&&c.source)"),'조각이 붙으면 그 단원 카드에 글이 붙는다');
 assert.ok(JSON.parse(b.local.get('chagog-v1')).cards.every(c=>c.question===undefined&&c.explanation===undefined&&c.subject===undefined),'저장소에는 여전히 글을 남기지 않는다(일정만)');}
{// (바) 쌍둥이만 남아 그대로 낸 문제가 화면에 있는 동안 앞서 틀린 문제의 5분 대기가 끝나도, 화면의 문제에 누른 답은 받는다.
 // v246까지는 그 답이 '풀 차례가 바뀌어 문제를 다시 불러왔어요'로 버려졌다(틀렸던 문제가 다시 나오는 순간 누름이 먹지 않던 일 — Edge 도구가 어휘 2장에서 본 것).
 const W=boot({lazy:true});W.run("setLectureOpen('ko-kv2',true)");await open(W,{subject:'국어',topic:'어휘 2장'});
 const X=W.run('data.activePractice.cardId');assert.ok(answer(W,true));await next(W);
 const twin=id=>W.run("(id=>{const g=ReviewPolicy.concept(id),seen=new Set(data.history.map(h=>h.cardId)),rows=data.history.filter(h=>(h.detail?.conceptId||ReviewPolicy.concept(h.cardId))===g).sort((a,b)=>a.at.localeCompare(b.at));return g!==id&&!seen.has(id)&&rows.at(-1)?.result==='correct'&&new Set(rows.filter(r=>r.result==='correct').map(r=>r.cardId)).size>=3;})("+J(id)+")");
 let n=0;for(;;){W.clock.now+=1000;assert.ok(W.run('!!data.activePractice')&&++n<200,'쌍둥이만 남는 데까지 푼다');if(twin(W.run('data.activePractice.cardId')))break;assert.ok(answer(W,false));await next(W);}
 const A=W.run('data.activePractice.cardId'),retryAt=RealDate.parse(W.run('data.cards.find(c=>c.id==='+J(X)+').retryAt'));assert.ok(W.clock.now<retryAt,'틀린 문제는 아직 대기 중(그래서 쌍둥이만 남았다)');
 W.clock.now=retryAt+1000;assert.ok(W.run("reviewQueue(data.cards.filter(inCurrent),true,'국어').ready.every(c=>c.id!=="+J(A)+")"),'대기가 끝나자 화면의 문제는 대기열에서 빠졌다');
 assert.ok(answer(W,false),'그래도 화면의 문제에 누른 답은 받는다');assert.equal(W.run('data.quizFeedback.cardId'),A);assert.equal(W.nodes.get('#message')._text,'');
 await next(W);assert.equal(W.run('data.activePractice.cardId'),X,'그다음에 틀렸던 문제가 나온다');
 // 대조: 다른 기기에서 방금 맞힌 문제(더는 풀 차례가 아님)는 지금처럼 답을 받지 않고 다시 그린다.
 W.run("(()=>{const now=new Date();data=ProgressSync.merge(data,[{id:'remote-1',cardId:"+J(X)+",date:day(now),at:now.toISOString(),result:'correct',mode:'quiz'}]);})()");
 const before=W.run('data.history.length');W.run('answerPractice('+J(X)+',data.activePractice.exercise.correctIndex)');
 assert.equal(W.run('data.history.length'),before,'풀 차례가 아닌 문제의 답은 기록하지 않는다');assert.match(W.nodes.get('#message')._text,/풀 차례가 바뀌어/);}
tick('실패 화면');
// ---------------------------------------------------------------- 5) 서비스 워커
const swText=read('sw.js');
{const fn=/function hashBytes\(u8\)\{[^\n]*\}/.exec(swText)?.[0],fn2=/function hashBytes\(u8\)\{[^\n]*?\}(?=\n)/.exec(read('content-store.js').replace(/\r\n/g,'\n'))?.[0];assert.ok(fn&&fn2&&fn.replace(/\r/g,'')===fn2.trim(),'sw.js의 지문 함수가 content-store.js와 글자까지 같다');}
// v246의 서비스 워커(배포돼 있는 것)를 그대로 옮겨 둔다: 올라오는 길을 검사하는 데 쓴다.
const SW246="const CACHE='chagog-v246-computer-selfmade';\nconst ASSETS=['./index.html?v=214','./app.js?v=214','./practice-bank.js?v=214','./basics.js?v=214','./manifest.json','./icon.svg'];\n"
 +"self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await Promise.all(ASSETS.map(async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('Asset fetch failed');await c.put(url,r);}));await self.skipWaiting();})()));\n"
 +"self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim();})()));\n"
 +"self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith((async()=>{const c=await caches.open(CACHE);try{const r=await fetch(e.request,{cache:'no-store'});if(r.ok)await c.put(e.request,r.clone());return r;}catch{const cached=await c.match(e.request);if(cached)return cached;if(e.request.mode==='navigate')return (await c.match('./index.html?v=214'))||Response.error();return Response.error();}})());});\n";
const ORIGIN='https://example.test/jeonsanjik/';
// 가짜 기기: 캐시 저장소 하나 + 네트워크(서버 함수). 서비스 워커 글을 그 위에서 실행한다.
function device(){
 const stores=new Map(),net={offline:false,hits:[],serve:()=>null};
 const abs=r=>new URL(typeof r==='string'?r:r.url,ORIGIN).href;
 const cacheOf=name=>{if(!stores.has(name))stores.set(name,new Map());const m=stores.get(name);return {async put(req,res){m.set(abs(req),{buf:Buffer.from(await res.arrayBuffer()),status:res.status});},async match(req){const hit=m.get(abs(req));return hit?new Response(hit.buf,{status:hit.status}):undefined;},async delete(req){return m.delete(abs(req));},async keys(){return [...m.keys()];}};};
 const caches={open:async name=>cacheOf(name),keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name),async match(req){for(const m of stores.values()){const hit=m.get(abs(req));if(hit)return new Response(hit.buf,{status:hit.status});}return undefined;}};
 const fetch=async req=>{const href=abs(req);net.hits.push(href.slice(ORIGIN.length));if(net.offline)throw new TypeError('Failed to fetch');const body=net.serve(href.slice(ORIGIN.length));return body===null||body===undefined?new Response('',{status:404}):new Response(body,{status:200});};
 function worker(text){const on={},self={location:new URL(ORIGIN+'sw.js'),addEventListener:(k,f)=>{on[k]=f;},skipWaiting:async()=>{self.skipped=true;},clients:{claim:async()=>{}}};
  const ctx={self,caches,fetch,Response,URL,console,Uint8Array,Promise,Error,Object,Array,Math};vm.createContext(ctx);vm.runInContext(text,ctx,{filename:'sw.js'});
  const fire=async kind=>{let p=Promise.resolve();on[kind]({waitUntil(x){p=x;}});await p;};
  return {self,install:()=>fire('install'),activate:()=>fire('activate'),
   async get(rel,mode='cors'){let p;on.fetch({request:{method:'GET',url:ORIGIN+rel,mode},respondWith(x){p=x;}});if(!p)return null;try{return await p;}catch{return Response.error();}}};}
 return {stores,net,worker,caches};
}
const assetsOf=t=>JSON.parse(/const ASSETS=(\[[^\]]*\])/.exec(t)[1].replace(/'/g,'"')).map(u=>u.replace(/^\.\//,''));
const fileOf=rel=>{const f=rel.replace(/\?.*$/,'');if(f==='firebase-config.js')return 'globalThis.STUDY_FIREBASE_CONFIG=null;';const p=path.join(__dirname,f);return fs.existsSync(p)?fs.readFileSync(p):null;};
const chunkUrls=names.map(n=>'chunks/'+n+'.json?h='+index.chunks[n]);
{// (가) 새 기기에 설치: 셸 + 모든 조각이 캐시에. 오프라인에서 전부 나온다.
 const d=device();d.net.serve=fileOf;const w=d.worker(swText);await w.install();await w.activate();
 const cacheName=/const CACHE='([^']+)'/.exec(swText)[1],c=d.stores.get(cacheName);assert.ok(w.self.skipped);
 for(const a of assetsOf(swText))assert.ok(c.has(ORIGIN+a),'셸이 캐시에: '+a);for(const u of chunkUrls)assert.ok(c.has(ORIGIN+u),'조각이 캐시에: '+u);
 assert.equal([...c.keys()].filter(k=>k.includes('/chunks/')).length,names.length);
 d.net.offline=true;d.net.hits.length=0;
 for(const a of assetsOf(swText)){const r=await w.get(a);assert.ok(r&&r.ok,'오프라인 셸: '+a);}
 for(const [i,u]of chunkUrls.entries()){const r=await w.get(u);assert.ok(r.ok,'오프라인 조각: '+u);assert.equal(store.hashBytes(new Uint8Array(await r.arrayBuffer())),index.chunks[names[i]]);}
 assert.equal(d.net.hits.filter(h=>h.includes('chunks/')).length,0,'조각은 캐시 먼저 — 네트워크를 건드리지 않는다');
 {const r=await w.get('',"navigate");assert.ok(r.ok,'오프라인에서 앱 주소를 열면 캐시의 index.html');}
 // (나) 조각 하나가 캐시에 없고 연결도 없으면 그 조각만 실패한다(앱은 다시 불러오기를 보인다). 연결되면 받아서 캐시에 넣는다.
 c.delete(ORIGIN+chunkUrls[0]);{const r=await w.get(chunkUrls[0]);assert.equal(r.type,'error','없는 조각 + 오프라인 = 네트워크 오류');const ok=await w.get(chunkUrls[1]);assert.ok(ok.ok,'다른 조각은 그대로');}
 d.net.offline=false;{const r=await w.get(chunkUrls[0]);assert.ok(r.ok);assert.ok(c.has(ORIGIN+chunkUrls[0]),'받은 조각은 캐시에 남는다');}
 // (다) 주소의 지문과 다른 바이트: 캐시에 넣지 않고 409.
 c.delete(ORIGIN+chunkUrls[2]);d.net.serve=rel=>rel===chunkUrls[2]?Buffer.from('{"schema":1}'):fileOf(rel);{const r=await w.get(chunkUrls[2]);assert.equal(r.status,409);assert.ok(!c.has(ORIGIN+chunkUrls[2]),'지문이 다른 조각은 캐시에 넣지 않는다');}
 // 옛 지문 주소(열려 있던 옛 탭이 묻는 것): 캐시에 없고, 네트워크의 파일은 지문이 다르다 → 409.
 d.net.serve=fileOf;{const r=await w.get('chunks/'+names[3]+'.json?h=0000000000000000');assert.equal(r.status,409,'옛 지문 주소는 409(앱이 새 버전으로 다시 열기를 보인다)');}
 // (라) 다시 설치(같은 판): 조각을 다시 받지 않고 캐시에서 복사한다.
 d.net.hits.length=0;const w2=d.worker(swText);await w2.install();D(d.net.hits.filter(h=>h.startsWith('chunks/')),[chunkUrls[2]],'지문이 같은 조각은 다시 받지 않는다(빠져 있던 하나만 받음)');
 // (마) 색인과 조각 목록이 다른 판이면 설치하지 않는다.
 const d2=device();d2.net.serve=rel=>rel.startsWith('chunk-manifest.json')?J({schema:1,build:'ffffffffffffffff',files:index.chunks}):fileOf(rel);await assert.rejects(d2.worker(swText).install(),/different builds/);
 // (바) 받는 중 조각 하나가 실패하면 설치가 실패하고(옛 워커가 남는다), 다음 시도는 받은 데서 이어 간다.
 const d3=device();let broken=true;d3.net.serve=rel=>broken&&rel===chunkUrls[50]?null:fileOf(rel);const w3=d3.worker(swText);await assert.rejects(w3.install(),/Chunk fetch failed/);assert.ok(!w3.self.skipped,'실패한 설치는 켜지지 않는다');
 broken=false;d3.net.hits.length=0;const w4=d3.worker(swText);await w4.install();assert.ok(w4.self.skipped);assert.ok(d3.net.hits.filter(h=>h.startsWith('chunks/')).length<names.length,'이어 받기: 이미 받은 조각은 건너뛴다');
 globalThis.__sw={assets:assetsOf(swText).length,chunks:names.length};}
{// (사) v246에서 올라오기: v246 워커가 잡고 있는 기기가 온라인으로 새 판을 연다.
 const d=device();const old=rel=>/\?v=214$|^manifest\.json$|^icon\.svg$/.test(rel)?Buffer.from('v246 '+rel):null;
 d.net.serve=old;const w246=d.worker(SW246);await w246.install();await w246.activate();assert.ok(d.stores.has('chagog-v246-computer-selfmade'));
 // 배포: 서버가 새 판을 낸다. 페이지의 요청은 아직 v246 워커(네트워크 먼저)를 거친다 — 새 html · 색인 · 조각이 네트워크에서 온다.
 d.net.serve=fileOf;
 for(const a of ['index.html?v=215','content-index.js?v=215','app.js?v=215']){const r=await w246.get(a);assert.ok(r.ok,'v246 워커를 거쳐 새 셸: '+a);}
 const early=chunkUrls.slice(0,5);for(const u of early){const r=await w246.get(u);assert.ok(r.ok);assert.equal(store.hashBytes(new Uint8Array(await r.arrayBuffer())),/h=([0-9a-f]+)/.exec(u)[1],'v246 워커를 거친 조각도 지문이 맞다');}
 // 뒤에서 새 워커가 설치된다: 페이지가 이미 받은 조각은 v246 캐시에서 복사한다.
 d.net.hits.length=0;const w=d.worker(swText);await w.install();for(const u of early)assert.ok(!d.net.hits.includes(u),'이미 받은 조각은 옛 캐시에서 복사: '+u);
 // 설치 중에도 v246 캐시는 그대로다(새 워커가 켜지기 전에 오프라인이 되면 v246 앱이 통째로 뜬다).
 assert.ok(d.stores.get('chagog-v246-computer-selfmade').has(ORIGIN+'practice-bank.js?v=214'));
 await w.activate();D([...d.stores.keys()],[/const CACHE='([^']+)'/.exec(swText)[1]],'켜지면 옛 캐시를 지운다');
 // 그 탭(새 판)은 그대로 이어진다: 같은 지문 주소가 새 캐시에 있다. 오프라인에서도.
 d.net.offline=true;for(const u of chunkUrls){const r=await w.get(u);assert.ok(r.ok,'올라온 뒤 오프라인 조각: '+u);}for(const a of assetsOf(swText))assert.ok((await w.get(a)).ok,'올라온 뒤 오프라인 셸: '+a);
 // v246 캐시만 가진 기기가 오프라인으로 열면: v246 워커가 v246 앱을 낸다(새 워커는 설치조차 못 한다).
 const e=device();e.net.serve=old;const o=e.worker(SW246);await o.install();await o.activate();e.net.offline=true;await assert.rejects(e.worker(swText).install());
 for(const a of ['index.html?v=214','app.js?v=214','practice-bank.js?v=214'])assert.equal(await (await o.get(a)).text(),'v246 '+a,'오프라인 v246: '+a);}
tick('서비스 워커');
// ---------------------------------------------------------------- 6) 배포 목록
{const yml=read('.github/workflows/pages.yml'),v=/app\.js\?v=(\d+)/.exec(html)[1],scripts=[...html.matchAll(/<script src="([^"?]+)\?v=(\d+)"><\/script>/g)];
 assert.ok(scripts.every(m=>m[2]===v),'index.html의 ?v=는 하나');
 for(const big of ['practice-bank.js','basics.js','core-review-pack.js','quiz-options.js','study-review-catalog.js','memorize.js','hanneung-explanations.js']){assert.ok(!html.includes(big),'index.html이 원본을 싣지 않는다: '+big);assert.ok(!swText.includes(big),'sw.js가 원본을 미리 받지 않는다: '+big);assert.ok(!new RegExp('cp [^\\n]*\\b'+big.replace('.','\\.')).test(yml),'배포 묶음에 원본을 넣지 않는다: '+big);}
 const order=scripts.map(m=>m[1]);assert.ok(order.indexOf('content-index.js')<order.indexOf('hanneung.js')&&order.indexOf('content-index.js')<order.indexOf('gichul.js'),'색인은 hanneung.js · gichul.js 앞(그릇을 먼저 만든다)');
 assert.equal(order[order.indexOf('app.js')-1],'content-store.js','content-store.js는 app.js 바로 앞');
 const assets=assetsOf(swText);for(const f of [...order,'index.html','style.css'])assert.ok(assets.includes(f+'?v='+v),'sw.js 미리 받기에 '+f);
 assert.ok(swText.includes("./chunk-manifest.json?v="+v),'sw.js가 같은 판의 조각 목록을 받는다');
 for(const f of new Set(assets.map(a=>a.replace(/\?.*$/,''))))if(f!=='firebase-config.js')assert.ok(new RegExp('cp [^\\n]*\\b'+f.replace('.','\\.')+'\\b').test(yml),'pages.yml이 올린다: '+f);
 assert.ok(/cp [^\n]*\bchunk-manifest\.json\b/.test(yml)&&yml.includes('cp -r chunks _site/'),'pages.yml이 조각과 조각 목록을 올린다');assert.ok(/node lazy\.test\.cjs/.test(yml)&&/run: node build-chunks\.cjs --check && /.test(yml),'pages.yml이 맨 먼저 조각이 낡지 않았는지 보고(1초) 이 검사를 돌린다');
 assert.ok(/^chunks\/\*\.json -text$/m.test(read('.gitattributes')),'조각은 줄 끝 변환을 타지 않는다');}
console.log('PASS lazy: 조각 '+names.length+'개 · 색인 '+Math.round(Buffer.byteLength(read('content-index.js'))/1024)+'KB가 원본과 맞고(낡지 않음), 조각을 다 붙이면 원본과 같고, 문제 '+globalThis.__need+'개마다 필요한 조각에 글 · 대입 · 상자가 있고, 공통 줄 '+globalThis.__shared.checked+'곳이 옛 계산과 같다; '
 +'같은 저장 상태로 전체 방식과 받는 방식의 목록 화면 · 저장 상태가 같고 풀이 '+steps+'걸음(과목이 섞인 대기열 '+globalThis.__mixed.steps+'걸음 · '+globalThis.__mixed.subjects.join('·')+' · 새 조각 '+globalThis.__mixed.chunks+'개)의 화면이 같다; '
 +'받지 못함 → 다시 불러오기, 지문 다름 · 404 → 새 버전으로 다시 열기, 기초 개념 보기 · 외울 것 · 다른 기기의 위치 · 채점 화면 복원; 서비스 워커: 셸 '+globalThis.__sw.assets+' + 조각 '+globalThis.__sw.chunks+' 미리 받기 · 오프라인 · 지문 확인 · 이어 받기 · v246에서 올라오기; 배포 목록');
})().catch(e=>{console.error(e);process.exitCode=1;});
