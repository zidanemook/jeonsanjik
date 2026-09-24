// 파트(parts.js)와 파트별 점검 모드(part-check.js + app.js)를 확인한다.
// 1) 파트 규칙(5문제 → 틀리면 3문제씩 더 → 통과·다시 볼 파트)  2) 파트 범위: 모든 문제가 정확히 한 파트에
// 3) 앱을 가짜 DOM 위에서 돌려 19강 파트별 점검(모두 맞힘 = 5×파트 수 · 하나 틀리면 +3 · 바닥나면 다시 볼 파트 · 새로고침 뒤 이어짐)
// 4) 파트별 상태 화면의 수(문제·외움·틀린 적 있음·안 푼 문제)가 기록과 같다.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const PartCheck=require('./part-check.js');

// ── 1) 규칙
{
 const C='correct',W='wrong',U='unsure',ev=PartCheck.evaluate;
 assert.equal(ev(12,[]).status,'todo');
 assert.deepEqual([ev(12,[C,C]).status,ev(12,[C,C]).inBatch,ev(12,[C,C]).batchSize],['active',2,5]);
 assert.equal(ev(12,[C,C,C,C,C]).status,'pass','5문제 모두 맞히면 통과');
 const miss=ev(12,[C,W,C,C,C]);assert.deepEqual([miss.status,miss.batch,miss.batchSize,miss.inBatch],['active',2,3,0],'하나 틀리면 3문제 더');
 assert.equal(ev(12,[C,W,C,C,C,C,C,C]).status,'pass','추가 3문제를 모두 맞히면 통과(8문제)');
 assert.equal(ev(12,[C,W,C,C,C,C,U,C]).status,'active','설명 보고 맞힘은 정답이 아니다 → 또 3문제');
 assert.equal(ev(12,[C,W,C,C,C,C,U,C,C,C,C]).status,'pass','세 번째 묶음을 모두 맞히면 통과(11문제)');
 assert.equal(ev(8,[W,W,W,W,W,W,W,W]).status,'weak','8문제 파트를 다 틀리면 5+3에서 바닥 → 다시 볼 파트');
 const tail=ev(6,[W,C,C,C,C]);assert.deepEqual([tail.status,tail.batchSize],['active',1],'남은 문제가 1개면 1문제만 더');
 assert.equal(ev(6,[W,C,C,C,C,C]).status,'pass');
 assert.equal(ev(6,[W,C,C,C,C,W]).status,'weak');
 assert.deepEqual([ev(3,[]).batchSize,ev(3,[C,C,C]).status],[3,'pass'],'3문제뿐인 파트는 3문제로 판정');
 assert.equal(ev(0,[]).status,'skip');
 // 고르기: 바로 앞과 같은 내용은 피하고, 안 푼 문제 → 복습일 문제 → 나머지, 덜 나온 사실 먼저
 const key=id=>id.split(':')[0],pick=(c,used,last)=>PartCheck.pick(c,new Map(Object.entries(used||{})),last,key).id;
 assert.equal(pick([{id:'a:1',fresh:true},{id:'b:1',fresh:false,due:true}],{},null),'a:1','안 푼 문제 먼저');
 assert.equal(pick([{id:'a:1',fresh:true},{id:'b:1',fresh:false,due:true}],{},'a'),'b:1','바로 앞과 같은 내용이면 다른 내용 먼저');
 assert.equal(pick([{id:'a:1',fresh:true},{id:'a:2',fresh:true}],{},'a'),'a:1','같은 내용뿐이면 그래도 낸다(막다른 화면 없음)');
 assert.equal(pick([{id:'a:1',fresh:true},{id:'b:1',fresh:true}],{a:2},null),'b:1','이 판에 덜 나온 내용 먼저');
 assert.equal(pick([{id:'a:1',fresh:false,due:false},{id:'b:1',fresh:false,due:true}],{},null),'b:1','복습일이 된 문제가 나머지보다 먼저');
 const r=PartCheck.round([{id:'p1',ids:['x1','x2']},{id:'p2',ids:['y1','y2','y3']}],new Map([['x1',{result:C,at:'1'}],['x2',{result:C,at:'2'}]]),()=>true);
 assert.deepEqual([r.parts[0].status,r.current,r.done],['pass',1,false],'2문제 파트는 2문제로 통과하고 다음 파트로');
}

// ── 2) 파트 범위
require('./study-review-catalog.js');require('./practice-bank.js');require('./quiz-options.js');const PARTS=require('./parts.js');
const CAT=globalThis.STUDY_REVIEW_CATALOG,BANK=globalThis.PRACTICE_BANK,QO=globalThis.QUIZ_OPTIONS;
const counts={};
{
 const seen=new Map(),partIds=new Set();
 for(const u of PARTS.units){
  assert.ok(['한국사','영어','국어'].includes(u.subject),u.id);
  const expected=u.subject==='한국사'?CAT.lectures.find(l=>'lecture-'+l.id===u.scope.round).ids:Object.keys(BANK).filter(id=>BANK[id].topic===u.scope.topic);
  assert.ok(expected.length,u.id+' 범위가 비어 있다');
  const inParts=u.parts.flatMap(p=>p.ids);
  for(const p of u.parts){
   assert.match(p.id,/^[a-z0-9-]+$/);assert.ok(!partIds.has(p.id),'파트 id 중복 '+p.id);partIds.add(p.id);
   assert.ok(('part-'+p.id).length<=80,'범위 이름이 동기화 한도(80자) 안');assert.ok(p.ids.length,'빈 파트 '+p.id);
   assert.ok(!/기타/.test(p.title),'기타 파트 없음: '+p.title);
   for(const id of p.ids){assert.ok(!seen.has(id),id+' 가 두 파트에 있다: '+seen.get(id)+' · '+p.id);seen.set(id,p.id);assert.equal(PARTS.partOf(id),p.id);
    assert.ok(QO[id]||BANK[id]?.variants.length===1,id+'는 문제 하나');}
  }
  assert.deepEqual([...inParts].sort(),[...expected].sort(),u.id+': 범위의 모든 문제가 정확히 한 파트에');
  counts[u.short]=u.parts.length;
 }
 for(const l of CAT.lectures)assert.ok(PARTS.units.some(u=>u.scope.round==='lecture-'+l.id),'한국사 '+l.title+'에 파트가 있다');
 for(const t of ['Day 1','Day 2','Day 3','Day 4','Day 5','문법 공식 훈련','논리 1장','논리 2장','논리 3장','논리 4장','논리 5장','논리 6장','독해 1장'])assert.ok(PARTS.units.some(u=>u.scope.topic===t),t+'에 파트가 있다');
 const h19=PARTS.units.find(u=>u.id==='hist-19');assert.equal(h19.parts.length,8);assert.equal(h19.parts.reduce((n,p)=>n+p.ids.length,0),115);
 // 2026-09-23 20강 조선 전기(문화 I): facts.cjs 묶음 15개 → 8파트, 99문제. 파트마다 8문제 이상이고 문제는 정답이 묻는 사실(첫 사실)의 묶음을 따른다.
 const h20=PARTS.units.find(u=>u.id==='hist-20');assert.equal(h20.title,'20강 조선 전기(문화 I)');
 // 2026-09-24 보충 파트 '이름이 비슷한 향교·유향소·향약·향도'(9문제, 여러 강 사실을 가르는 문제라 따로)를 교육 기관 파트 뒤에 둔다.
 assert.deepEqual(h20.parts.map(p=>p.title),['성균관·4부 학당·향교','서원·서당','이름이 비슷한 향교·유향소·향약·향도','성리학의 발달과 이황','이이·학파와 붕당','불교와 도교','역사서·실록·승정원일기','지도·지리서','의례서·법전·음악']);
 assert.equal(h20.parts.reduce((n,p)=>n+p.ids.length,0),108);assert.ok(h20.parts.every(p=>p.ids.length>=8),'20강 파트마다 8문제 이상');
}

// ── 3) 앱
function el(tag='div'){
 const node={tag,children:[],attrs:{},dataset:{},classes:new Set(),_text:'',hidden:false,disabled:false,open:false,
  get textContent(){return node._text+node.children.map(c=>c.textContent).join('');},set textContent(v){node._text=String(v);node.children=[];},
  append(...k){node.children.push(...k);},replaceChildren(...k){node.children=k;},
  classList:{add:c=>node.classes.add(c),remove:c=>node.classes.delete(c),toggle:(c,on)=>on?node.classes.add(c):node.classes.delete(c),contains:c=>node.classes.has(c)},
  setAttribute(k,v){node.attrs[k]=v;},getAttribute(k){return node.attrs[k];},focus(){},setSelectionRange(){},addEventListener(){},
  querySelector(sel){return sel==='summary'?el('summary'):null;},querySelectorAll(){return [];},
  get all(){const out=[];(function walk(n){for(const c of n.children){out.push(c);walk(c);}})(node);return out;}};
 return node;
}
const FILES=['scheduler.js','learning.js','core-review-pack.js','quiz-options.js','hanneung-data.js','hanneung-explanations.js','hanneung.js','gichul-index.js','gichul.js','practice-bank.js','practice.js','content-corrections.js','review-record.js','review-policy.js','sync-core.js','study-credit.js','xp.js','score.js','study-review-catalog.js','hanneung-topics.js','topics.js','parts.js','part-check.js','memorize.js','app.js'];
const SRC=new Map(FILES.map(f=>[f,fs.readFileSync(__dirname+'/'+f,'utf8')]));
// store를 넘기면 같은 저장소로 앱을 다시 연다(= 새로고침).
function boot(store=new Map()){
 const nodes=new Map();
 const doc={createElement:tag=>el(tag),createTextNode(t){const n=el('#text');n._text=String(t);return n;},body:el('body'),activeElement:null,
  querySelector(sel){if(!nodes.has(sel))nodes.set(sel,el(sel));return nodes.get(sel);},querySelectorAll(){return [];},addEventListener(){}};
 let uid=0;
 const ctx={document:doc,console,
  localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
  crypto:{randomUUID:()=>'id-'+(++uid)+'-'+Math.random().toString(16).slice(2)},
  history:{state:{depth:0},pushState(s){this.state=s;},replaceState(s){this.state=s;}},
  navigator:{},setInterval:()=>1,clearInterval(){},setTimeout:()=>1,clearTimeout(){},structuredClone,addEventListener(){},dispatchEvent(){},scrollTo(){},
  fetch:()=>Promise.reject(Error('no fetch')),
  Date,JSON,Math,Set,Map,Number,String,Object,Array,Error,RegExp,Intl,Promise,Event:class{constructor(t){this.type=t;}}};
 ctx.window=ctx;ctx.self=ctx;vm.createContext(ctx);
 for(const f of FILES)vm.runInContext(SRC.get(f),ctx,{filename:f});
 const run=code=>vm.runInContext(code,ctx);
 const text=sel=>nodes.get(sel)?.textContent||'';
 return {ctx,run,nodes,store,text};
}
const tick=()=>{const t=Date.now();while(Date.now()===t){}};
let app=boot();
const {run}=app;
const R=code=>app.run(code);
// 지금 화면의 문제를 맞히거나(wrong=false) 틀리고, 해설 화면에서 다음 문제로 넘어간다. 푼 문제 id를 돌려준다.
function answer(wrong){
 const quiz=R('data.activePractice.exercise'),id=R('data.activePractice.cardId');
 const input=quiz.type==='choice'?(wrong?(quiz.correctIndex+1)%quiz.choices.length:quiz.correctIndex):(wrong?'zzz':quiz.answers[0]);
 R('answerPractice('+JSON.stringify(id)+','+JSON.stringify(input)+')');
 assert.equal(R('data.quizFeedback.result'),wrong?'wrong':'correct');
 const line=app.text('#orderStatus');
 R("(()=>{const s=structuredClone(data);delete s.quizFeedback;delete s.activePractice;commit(s);render();})()");
 return {id,line};
}
const partOfCard=id=>PARTS.partOf(id);
const onQuestion=()=>R("!!document.querySelector('#card').all.find(n=>n.className==='question')");
const cardText=()=>app.text('#card');
const lecture19=PARTS.units.find(u=>u.id==='hist-19');

// 3-1) 19강 · 파트별 점검 · 모두 맞힘 → 파트마다 5문제, 8파트 = 40문제
R("openScope({subject:'한국사',round:'lecture-19'})");
const countBefore=R("countLine(data.cards.filter(c=>isPlayable(c)&&inCurrent(c)))");
R("setQueueMode('parts')");
assert.equal(R('queueMode()'),'parts');
assert.equal(R("countLine(data.cards.filter(c=>isPlayable(c)&&inCurrent(c)))"),countBefore,'파트별 점검을 골라도 "풀어야 할 문제" 수는 그대로');
assert.match(app.text('#orderStatus'),/^파트 1\/8 · 과전법·수신전·휼양전 · 1\/5$/,'진행 줄: '+app.text('#orderStatus'));
const historyBefore=R('data.history.length');
const served=[];
while(onQuestion()){served.push(answer(false).id);assert.ok(served.length<=200);}
assert.equal(served.length,5*lecture19.parts.length,'모두 맞히면 파트마다 5문제: '+served.length);
lecture19.parts.forEach((p,i)=>assert.ok(served.slice(i*5,i*5+5).every(id=>partOfCard(id)===p.id),'교재 순서대로 한 파트씩: '+p.title));
assert.equal(new Set(served).size,served.length,'한 판에서 같은 문제를 두 번 내지 않는다');
assert.equal(R('data.history.length')-historyBefore,40,'답은 평소처럼 풀이 기록에 남는다');
assert.ok(R("data.history.slice(-40).every(h=>h.mode==='quiz'&&h.result==='correct'&&h.detail)"),'기록 형식은 다른 모드와 같다');
assert.ok(R("data.cards.filter(c=>"+JSON.stringify(served)+".includes(c.id)).every(c=>c.streak===1&&c.due>day())"),'복습 일정도 평소대로(처음 맞힘 → 7일 뒤)');
// 같은 내용이 바로 이어 나오지 않는다(파트 안에 다른 내용이 있을 때)
{const key=id=>R('partKeyOf('+JSON.stringify(id)+')');let back=0;for(let i=1;i<served.length;i++)if(partOfCard(served[i])===partOfCard(served[i-1])&&key(served[i])===key(served[i-1]))back++;assert.ok(back<=2,'같은 사실 연속 '+back);}
let card=cardText();
assert.match(card,/19강 파트 점검 끝/);assert.match(card,/8파트 중 통과 8 · 모두 통과했어요/);assert.match(card,/이번 점검에서 푼 문제 40개 · 맞힌 문제 40개/);
assert.match(card,/나머지 문제는 기본 순서로 이어 풀기/,'끝 화면에서 막히지 않는다');

// 3-2) 새 판 · 첫 파트에서 하나 틀림 → 같은 파트에서 3문제 더 → 모두 맞혀 통과(8문제) → 다음 파트
tick();R("startPartRound(scopeOf(),null)");
const first=lecture19.parts[0].id,round2=[];
round2.push(answer(false),answer(true),answer(false),answer(false));
const fifth=answer(false);round2.push(fifth);
assert.match(fifth.line,/틀린 문제가 있어 3문제 더 풀어요/,'5문제째 해설 화면: '+fifth.line);
assert.match(app.text('#orderStatus'),/^파트 1\/8 · 과전법·수신전·휼양전 · 1\/3 \(틀린 문제가 있어 3문제 더\)$/,app.text('#orderStatus'));
round2.push(answer(false),answer(false));
const eighth=answer(false);round2.push(eighth);
assert.match(eighth.line,/✓ 통과 · 다음 파트: 직전법~녹봉/,eighth.line);
assert.ok(round2.every(x=>partOfCard(x.id)===first),'8문제 모두 첫 파트에서');
assert.equal(partOfCard(R('data.activePractice.cardId')),lecture19.parts[1].id,'통과하면 다음 파트로');
assert.ok(onQuestion(),'틀린 문제가 5분 재시도 대기여도 다음 문제가 바로 나온다');

// 3-3) 새로고침: 같은 저장소로 앱을 다시 열어도 판이 이어진다
answer(false);answer(false);
const store=app.store;app=boot(store);
R("go('quiz','한국사')");
assert.equal(R('storageOK'),true,'모드를 바꾼 뒤 새로고침해도 저장소를 읽는다(v144까지는 QUEUE_MODES 초기화 전 참조로 저장이 멈췄다)');
assert.equal(R('queueMode()'),'parts');
assert.match(app.text('#orderStatus'),/^파트 2\/8 · 직전법~녹봉 · 3\/5$/,'새로고침 뒤 이어서: '+app.text('#orderStatus'));

// 3-4) 파트 하나 범위 · 모두 틀림 → 5 + 3 = 8문제에서 바닥 → 다시 볼 파트 · 끝 화면에 버튼
const weakPart=lecture19.parts.find(p=>p.title==='지대·수취 제도의 문란');assert.equal(weakPart.ids.length,8);
R("openScope({subject:'한국사',round:'part-"+weakPart.id+"'})");tick();R("startPartRound(scopeOf(),null)");
assert.match(R("scopeLabel(scopeOf())"),/^한국사 · 19강 · 지대·수취 제도의 문란$/);
const wrongs=[];while(onQuestion()){const a=answer(true);wrongs.push(a);assert.ok(wrongs.length<=8,'파트 문제 수보다 많이 내지 않는다');}
assert.equal(wrongs.length,8,'모두 틀리면 5 + 3 = 8문제로 파트가 바닥난다');
assert.match(wrongs.at(-1).line,/다시 볼 파트로 표시 · 다음: 점검 결과/);
card=cardText();
assert.match(card,/19강 지대·수취 제도의 문란 파트 점검 끝/);assert.match(card,/1파트 중 통과 0 · 다시 볼 파트: 지대·수취 제도의 문란/);assert.match(card,/다시 볼 파트만 다시 점검하기 \(1파트\)/);
// 다시 볼 파트만 다시 점검 → 5문제 모두 맞혀 통과
tick();R("startPartRound(scopeOf(),["+JSON.stringify(weakPart.id)+"])");
let again=0;while(onQuestion()){answer(false);again++;assert.ok(again<=8);}
assert.equal(again,5);assert.match(cardText(),/1파트 중 통과 1 · 모두 통과했어요/);
// 기본 순서로 이어 풀기 → 기본 모드
R("setQueueMode('default')");assert.equal(R('queueMode()'),'default');

// 3-5) 파트가 없는 범위(영어 수일치): 모드는 기본처럼 돌고 알린다 · 파트 모드 선택지는 흐려진다
R("openScope({subject:'영어',topic:'수일치'})");R("setQueueMode('parts')");
assert.equal(app.text('#orderStatus'),'이 범위는 파트가 없어 기본 순서로 풀어요');assert.ok(onQuestion(),'파트가 없어도 문제는 나온다');
assert.equal(R('partsOption.disabled'),true);
// 과목 전체(영어): 교재 순서대로 Day 1 첫 파트부터
R("openScope({subject:'영어'})");
assert.equal(partOfCard(R('data.activePractice.cardId')),'en1-1');assert.match(app.text('#orderStatus'),/^파트 1\/\d+ · Day 1 문장 구조·동사 유형 · 1\/5$/,app.text('#orderStatus'));
assert.equal(R('partsOption.disabled'),false);
// 동기화용 위치 기록(session)은 파트 범위도 규격 안
R("openScope({subject:'한국사',round:'part-"+weakPart.id+"'})");R('stampSession()');assert.equal(R('data.session.round'),'part-'+weakPart.id);R('ProgressSync.session(data.session)');

// ── 4) 파트별 상태 화면
R("go('parts','한국사')");
const body=app.nodes.get('#partsBody');
const fold=body.all.find(n=>n.dataset?.unit==='hist-19');assert.ok(fold?.open,'지금 풀던 강(19강)은 펼쳐 둔다');
assert.ok(body.all.filter(n=>n.dataset?.unit&&n.dataset.unit!=='hist-19').every(n=>!n.open),'다른 강은 접어 둔다');
const expect=p=>{const s=R("(()=>{const ids="+JSON.stringify(p.ids)+",wrong=new Set(data.history.filter(h=>h.result==='wrong').map(h=>h.cardId)),seen=new Set(data.history.map(h=>h.cardId)),cards=data.cards.filter(c=>ids.includes(c.id));return {n:cards.length,m:cards.filter(c=>c.streak>=4).length,w:cards.filter(c=>wrong.has(c.id)).length,f:cards.filter(c=>!seen.has(c.id)).length,t:cards.filter(c=>seen.has(c.id)).length};})()");return s;};
for(const p of lecture19.parts){
 const item=body.all.find(n=>n.dataset?.part===p.id),e=expect(p),spans=item.children.map(c=>c.textContent);
 assert.equal(spans[1],e.n+'문제 · 외움 '+e.m+' · 틀린 적 있음 '+e.w+' · 안 푼 문제 '+e.f,p.title);
 assert.equal(/⚠ 약함/.test(spans[0]),e.t>=3&&e.w/e.t>=0.3,p.title+' 약함 표시');
}
{const item=body.all.find(n=>n.dataset?.part===weakPart.id);assert.match(item.children[0].textContent,/⚠ 약함$/);assert.equal(item.children[1].textContent,'8문제 · 외움 0 · 틀린 적 있음 8 · 안 푼 문제 0');}
assert.match(fold.children[0].textContent,/^19강 조선 전기\(경제, 사회\) · 8파트 · 115문제 · 약한 파트 [1-9]/);
// 파트를 누르면 그 파트만 푸는 범위가 열린다
const second=lecture19.parts[1];body.all.find(n=>n.dataset?.part===second.id).onclick();
assert.equal(R('scopeOf().round'),'part-'+second.id);assert.ok(R("data.cards.filter(inCurrent).every(c=>STUDY_PARTS.partOf(c.id)==="+JSON.stringify(second.id)+")"));
assert.equal(R("data.cards.filter(inCurrent).length"),second.ids.length,'파트 범위의 문제 수 = 상태 화면의 수');
// 과목 화면에 파트별 상태 버튼(파트가 있는 과목만)
R("go('subject','한국사')");assert.equal(app.nodes.get('#openParts').hidden,false);
R("go('subject','컴퓨터일반')");assert.equal(app.nodes.get('#openParts').hidden,true);

console.log('PASS parts: '+PARTS.units.length+'단위 · '+PARTS.units.reduce((n,u)=>n+u.parts.length,0)+'파트, 모든 문제가 정확히 한 파트(기타 0) — '+Object.entries(counts).map(([k,v])=>k+' '+v).join(' · ')+
 '; 파트별 점검: 19강 모두 맞힘 = 5×8 = 40문제, 하나 틀리면 같은 파트 3문제 더(8문제로 통과), 8문제 파트를 모두 틀리면 5+3에서 다시 볼 파트, 다시 볼 파트만 다시 점검, 새로고침 뒤 이어짐, 파트 없는 범위는 기본 순서, 기록·일정은 평소대로; 파트별 상태 수 = 기록');
