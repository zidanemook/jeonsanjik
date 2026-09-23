// 뱃지 둘(v146): 과목마다 레벨(숫자 하나) + 기출 뱃지(예상 점수) + 자체제작 뱃지(파트별 외운 비율의 평균).
// 앱을 가짜 DOM 위에서 돌려 확인한다: 1) 자체제작 파트 묶음(파트 + 파트 없는 문제의 대체 묶음)이 과목의 자체제작 문제를 빠짐없이 한 번씩 덮는다
// 2) 저장된 기록으로 과목 줄·과목 화면·홈 카드의 뱃지 색 3) 뱃지를 누르면 설명(다음 등급까지 · 가장 약한 파트), 약한 파트를 누르면 그 파트 범위
// 4) 풀이 뒤 해설 화면: 기출 뱃지가 처음 생기면 알림.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
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
const nodes=new Map(),store=new Map();
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
for(const f of FILES)vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx,{filename:f});
const R=code=>vm.runInContext(code,ctx);
// 가짜 DOM 쪽 객체는 다른 realm이라 deepStrictEqual 전에 이 realm으로 옮긴다.
const J=code=>JSON.parse(JSON.stringify(R(code)));
const node=sel=>nodes.get(sel);
const text=n=>n?n.textContent:'';

// ── 1) 자체제작 파트 묶음: 과목의 자체제작 문제를 빠짐없이 정확히 한 번씩
const cover=J(`(()=>{const out={};for(const s of subjectsList()){const groups=selfGroups(s),ids=groups.flatMap(g=>g.ids),want=data.cards.filter(c=>c.subject===s&&isPlayable(c)&&!StudyXp.isExam(c.id)).map(c=>c.id);
 out[s]={groups:groups.length,parts:groups.filter(g=>STUDY_PARTS.part(g.id)).length,dup:ids.length-new Set(ids).size,missing:want.filter(id=>!ids.includes(id)).length,extra:ids.length-want.length,
  fallback:groups.filter(g=>!STUDY_PARTS.part(g.id)).map(g=>[g.id,g.title,g.ids.length,g.scope])};}return out;})()`);
for(const [s,c] of Object.entries(cover)){assert.equal(c.dup,0,s+' 문제가 두 묶음에');assert.equal(c.missing,0,s+' 빠진 문제');assert.equal(c.extra,0,s);}
assert.equal(cover['한국사'].parts,R("STUDY_PARTS.unitsFor('한국사').reduce((n,u)=>n+u.parts.length,0)"),'한국사 파트 전부');
assert.deepEqual(cover['영어'].fallback.map(f=>[f[0],f[1],f[3]&&f[3].topic]).sort(),[['rest','그 밖의 문제',null],['topic:수일치','수일치','수일치'],['topic:영문법','그 밖의 문법 연습','영문법']],'영어: 파트 없는 연습 주제마다 한 파트 + 주제 없는 문제 한 묶음');
assert.deepEqual(cover['한국사'].fallback.map(f=>[f[0],f[1],f[3]]),[['rest','그 밖의 문제',null]],'한국사: 강에 없는 문화유산 사진 문제는 한 묶음(누를 범위 없음)');
for(const s of ['컴퓨터일반','정보보호론'])assert.equal(cover[s].groups,0,s+'는 자체제작 문제가 없다');

// ── 2) 저장된 기록(실제 동기화 경로로 합침): 19강 첫 파트는 전부 외움 · 지대 파트 둘은 틀림 · 컴퓨터일반 기출 12문제(9개 정답) · 정보보호론 기출 3문제
const seed=R(`(()=>{const today=ReviewSchedule.day(),ago=n=>ReviewSchedule.plus(today,-n),rows=[];let k=0;
 const add=(id,d,result)=>rows.push({id:'seed-'+String(k++).padStart(4,'0'),cardId:id,date:ago(d),at:ago(d)+'T09:'+String(k%60).padStart(2,'0')+':00+09:00',result,mode:'quiz'});
 const p19=STUDY_PARTS.units.find(u=>u.id==='hist-19').parts;
 for(const id of p19[0].ids){add(id,60,'correct');add(id,50,'correct');add(id,35,'correct');add(id,4,'correct');}
 for(const id of p19[3].ids.slice(0,2))add(id,8,'wrong');
 const exam=s=>data.cards.filter(c=>c.subject===s&&/^gichul-/.test(c.id)).map(c=>c.id);
 exam('컴퓨터일반').slice(0,12).forEach((id,i)=>add(id,3,i<9?'correct':'wrong'));
 exam('정보보호론').slice(0,3).forEach(id=>add(id,3,'correct'));
 data.cards.filter(c=>/^hanneung-/.test(c.id)).slice(0,11).forEach((c,i)=>add(c.id,3,i<8?'correct':'wrong'));
 exam('한국사').slice(0,4).forEach(id=>add(id,3,'correct'));
 const next=ProgressSync.merge(data,rows);commit(next);go('home');return {rows:rows.length,p0:p19[0].id,p3:p19[3].id,p3title:'19강 '+p19[3].title,sec:exam('정보보호론').slice(3,10)};})()`);
const badges=J('subjectBadges()');
assert.equal(badges['컴퓨터일반'].exam.ready,true);assert.equal(badges['컴퓨터일반'].exam.score,R('ExamScore.estimate(9,12).score'));
assert.equal(badges['컴퓨터일반'].exam.tier.id,R('StudyXp.tier(ExamScore.estimate(9,12).score).id'));
assert.deepEqual([badges['정보보호론'].exam.ready,badges['정보보호론'].exam.n,badges['정보보호론'].exam.need],[false,3,7],'10문제 미만 → 아직');
assert.equal(badges['컴퓨터일반'].self.ready,false,'자체제작 문제가 없는 과목 → 아직');
assert.deepEqual([badges['한국사'].exam.source,badges['한국사'].exam.ready,badges['한국사'].exam.n,badges['한국사'].exam.score],['한능검 심화',true,11,R('ExamScore.estimate(8,11).score')],'한국사 기출 뱃지 = 한능검 심화 첫 풀이(9급 한국사 기출은 안 셈)');
const hist=badges['한국사'].self,groupsN=cover['한국사'].groups;
assert.equal(hist.groups.find(g=>g.id===seed.p0).pct,100,'19강 첫 파트 전부 외움');
assert.equal(hist.pct,Math.floor(100/groupsN*10)/10,'파트 평균 = 100 / 파트 수(한 파트만 외움)');
assert.equal(hist.weakest[0].id,seed.p3,'가장 약한 파트: 0% 중 풀어 본 파트(지대) 먼저');
// 과목 줄: 레벨 육각형 + 뱃지 둘(버튼 안에 버튼 없음)
const rows=node('#subjectList').children;
assert.ok(rows.every(r=>r.className==='subject-row'&&r.children[0].tag==='button'&&r.children[0].all.every(n=>n.tag!=='button')),'과목 버튼 안에 버튼이 없다');
const chipsOf=s=>rows.find(r=>r.dataset.subject===s).children[1].children.map(c=>[c.dataset.badge,c.dataset.tier,text(c)]);
assert.deepEqual(chipsOf('컴퓨터일반'),[['exam',badges['컴퓨터일반'].exam.tier.id,'기출 '+badges['컴퓨터일반'].exam.tier.name],['self','none','자체제작 아직']]);
assert.deepEqual(chipsOf('정보보호론')[0],['exam','none','기출 아직']);
assert.deepEqual(chipsOf('한국사')[1],['self',hist.tier.id,'자체제작 '+hist.tier.name]);
assert.ok(rows.every(r=>r.children[0].all.some(n=>n.className==='level-badge lv-plain')),'레벨 육각형은 과목마다 하나(색 없음)');
assert.ok(!/문항|카드/.test(text(node('#subjectList'))),'과목 줄에 문항/카드라는 말이 없다');

// ── 3) 뱃지를 누르면 설명
const tap=(root,s,kind)=>{const chip=node(root).all.find(n=>n.dataset?.badge===kind&&(!s||n.attrs['aria-label'].startsWith(s+' ')));chip.onclick();return node('#badgeInfo');};
const lines=box=>box.children.filter(c=>c.className==='badge-info-line').map(text);
let box=tap('#subjectList','컴퓨터일반','exam');
{const x=J("StudyXp.explainBadge(subjectBadges()['컴퓨터일반'].exam)");assert.equal(box.hidden,false);
 assert.equal(text(box.children[0].children[0]),'컴퓨터일반 '+x.title);assert.deepEqual(lines(box),x.lines);
 assert.match(x.lines[0],/^기출을 처음 풀었을 때 기준 예상 점수: \d+점$/);assert.match(x.lines[1],/^다음 등급\(.+ \d+점\)까지 \d+점 남았어요$/);}
box=tap('#subjectList','정보보호론','exam');
assert.equal(text(box.children[0].children[0]),'정보보호론 기출 뱃지 · 아직');assert.deepEqual(lines(box),['기출을 처음 풀었을 때 기준 예상 점수로 등급을 매겨요.','지금까지 처음 푼 기출 3문제 — 7문제 더 풀면 등급이 나와요.']);
box=tap('#subjectList','한국사','self');
{const x=J("StudyXp.explainBadge(subjectBadges()['한국사'].self)");assert.deepEqual(lines(box),x.lines);assert.equal(x.lines[0],'파트별로 외운 비율의 평균: '+hist.pct+'%');
 assert.equal(x.lines[1],'다음 등급(브론즈 25%)까지 '+(Math.round((25-hist.pct)*10)/10)+'% 남았어요');
 const weak=box.all.filter(n=>(n.className||'').startsWith('badge-info-part'));assert.equal(weak.length,2);assert.equal(text(weak[0]),seed.p3title+' 0%');
 assert.ok(!/카드|변형|스코프|streak|stage|규칙|쌍둥이/.test(text(box)),'설명에 앱 속 용어가 없다: '+text(box));
 // 약한 파트를 누르면 그 파트 범위가 열리고 설명은 닫힌다
 weak[0].onclick();assert.equal(R('scopeOf().round'),'part-'+seed.p3);assert.equal(R('view'),'quiz');assert.equal(node('#badgeInfo').hidden,true);
 assert.equal(R("scopeLabel(scopeOf())"),'한국사 · '+seed.p3title.replace(' ',' · '));}
// 영어 대체 묶음(수일치)이 가장 약할 때도 링크가 그 연습 주제를 연다 / '그 밖의 문제'는 링크 없이
{const g=R("selfGroups('영어')");const topic=g.find(x=>x.id==='topic:수일치');R("openScope("+JSON.stringify(topic.scope)+")");assert.equal(R("scopeLabel(scopeOf())"),'영어 · 수일치');
 R("go('home')");box=tap('#subjectList','영어','self');const weak=box.all.filter(n=>(n.className||'').startsWith('badge-info-part'));assert.ok(weak.length>=1);}
// 과목 화면: 레벨 줄 + 뱃지 둘, 눌러서 설명
R("go('subject','한국사')");assert.equal(node('#badgeInfo').hidden,true,'화면을 옮기면 설명은 닫힌다');
assert.equal(node('#subjectBadge').children[0].className,'level-badge lv-plain big');
assert.match(text(node('#subjectLevel')),new RegExp('^Lv [0-9]+ · 다음 레벨까지 [0-9]+ XP · 이 과목 누적 [0-9]+ XP기출 '+badges['한국사'].exam.tier.name+'자체제작 .+뱃지를 누르면 무엇으로 정해지는지 보여 줘요[.]$'));
box=tap('#subjectLevel',null,'self');assert.equal(text(box.children[0].children[0]),'한국사 자체제작 뱃지 · '+hist.tier.name);
// 홈 카드: 전체 뱃지 = 과목 뱃지의 평균
R("go('home')");box=tap('#xpAcc',null,'exam');
{const x=J("StudyXp.explainBadge(StudyXp.overallBadges(subjectBadges()).exam)");assert.equal(text(box.children[0].children[0]),x.title);assert.match(x.title,/^전체 기출 뱃지 · /);
 assert.deepEqual(lines(box),x.lines);assert.equal(x.lines[1],'한국사 '+badges['한국사'].exam.score+'점 · 컴퓨터일반 '+badges['컴퓨터일반'].exam.score+'점');assert.match(text(box),/아직 등급이 없는 과목: .*정보보호론\(7문제 더\)/);}
R('closeBadgeInfo()');

// ── 4) 해설 화면: 정보보호론 기출 10문제째를 풀면 기출 뱃지가 생겼다고 알린다(9문제까지는 없음)
{const more=seed.sec;let last='';
 for(let i=0;i<more.length;i++){const id='late-'+i;R(`(()=>{const s=structuredClone(data),d=ReviewSchedule.day();s.history.push({id:${JSON.stringify('late-'+i)},cardId:${JSON.stringify(more[i])},date:d,at:d+'T10:0${i}:00+09:00',result:'correct',mode:'quiz'});commit(s);})()`);
  last=text(R('xpAwardNode('+JSON.stringify(id)+')'));
  const n=3+i+1;if(n<10)assert.ok(!/🏅/.test(last),n+'문제째: 알림 없음');else assert.match(last,/🏅 정보보호론 기출 .+ 뱃지! 예상 점수 \d+점/,n+'문제째: '+last);
  assert.match(last,/정보보호론 Lv \d+ · 다음까지 \d+ XP기출 /);}}

console.log('PASS badges: 자체제작 파트 묶음이 과목의 자체제작 문제를 빠짐없이 한 번씩('+Object.entries(cover).map(([s,c])=>s+' '+c.groups).join(' · ')+'; 영어 수일치·그 밖의 문법 연습·그 밖의 문제, 한국사 그 밖의 문제), '+
 '기출 뱃지 = 예상 점수(10문제 미만 아직), 자체제작 뱃지 = 파트 평균, 누르면 설명 · 약한 파트 → 그 파트 범위, 홈 전체 뱃지, 해설 화면 알림');
