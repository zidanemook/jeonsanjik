// 한국사 강마다 핵심 20문제(v179, 2026-09-28 사용자 "강 마다 20문제로").
// 1) 자료: 강 범위(study-review-catalog.js lectures)마다 core = 교재 강 하나에 20문제(02~05강은 교재 강 넷이라 80, 22·23강은 그 강 20문제 전부), 강 안의 문제 · 강 순서, 파트마다 하나 이상, 같은 정답 두 번 없음.
// 2) 앱(가짜 DOM): 기본은 강 범위 · 파트 · 과목 전체 · 수 · 뱃지 묶음 · 복습 대기열 모두 핵심 20만, '이 강 문제 더 풀기'를 켜면 그 강의 나머지가 들어오고 끄면 빠진다.
//    접힌 문제의 복습일이 와도 대기열에 안 들어온다. 핵심 20을 다 풀면 끝 화면에 '이 강 문제 더 풀기' 버튼(막다른 화면 없음). 설정은 새로고침 뒤에도 남는다.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function el(tag='div'){
 const node={tag,children:[],attrs:{},dataset:{},classes:new Set(),_text:'',hidden:false,disabled:false,open:false,checked:false,
  get textContent(){return node._text+node.children.map(c=>c.textContent).join('');},set textContent(v){node._text=String(v);node.children=[];},
  append(...k){node.children.push(...k);},replaceChildren(...k){node.children=k;},
  classList:{add:c=>node.classes.add(c),remove:c=>node.classes.delete(c),toggle:(c,on)=>on?node.classes.add(c):node.classes.delete(c),contains:c=>node.classes.has(c)},
  setAttribute(k,v){node.attrs[k]=v;},getAttribute(k){return node.attrs[k];},focus(){},setSelectionRange(){},addEventListener(){},
  querySelector(sel){return sel==='summary'?el('summary'):null;},querySelectorAll(){return [];},
  get all(){const out=[];(function walk(n){for(const c of n.children){out.push(c);walk(c);}})(node);return out;}};
 return node;
}
const FILES=['scheduler.js','learning.js','core-review-pack.js','quiz-options.js','hanneung-data.js','hanneung-explanations.js','hanneung.js','gichul-index.js','gichul.js','practice-bank.js','practice.js','content-corrections.js','review-record.js','review-policy.js','sync-core.js','study-credit.js','xp.js','score.js','study-review-catalog.js','hanneung-topics.js','topics.js','parts.js','part-check.js','memorize.js','basics.js','core-units.js','app.js'];
const SRC=new Map(FILES.map(f=>[f,fs.readFileSync(__dirname+'/'+f,'utf8')]));
function boot(store){
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
 const R=code=>vm.runInContext(code,ctx),J=code=>JSON.parse(JSON.stringify(R(code)));
 return {R,J,node:sel=>nodes.get(sel)||doc.querySelector(sel)};
}
const text=n=>n?n.textContent:'';
const BANNED=/카드|문항|변형|스코프/;

// ── 1) 자료
const store=new Map();
const {R,J,node}=boot(store);
const lectures=J('STUDY_REVIEW_CATALOG.lectures');
assert.deepEqual(lectures.map(l=>l.id),['02-05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','38','250','252-256']);
const answerOf=id=>R(`(()=>{const q=QUIZ_OPTIONS[${JSON.stringify(id)}];return q&&q.choices?q.choices[q.correctIndex]:CORE_REVIEW_PACK.find(c=>c.id===${JSON.stringify(id)}).answer;})()`);
let folded=0;
// 교재 강마다 20: 앱 범위 '02~05강'만 교재 강 넷(02 선사 · 03 고조선·여러 나라 · 04 고구려·가야 · 05 백제·신라·통일)을 묶은 범위라 80(부모 검토 2026-09-28).
const WANT=id=>id==='02-05'?80:20;
for(const l of lectures){
 assert.ok(Array.isArray(l.core),l.title+': core가 있다');
 const want=WANT(l.id);
 assert.equal(l.core.length,want,l.title+': 핵심 '+want+'문제');assert.equal(new Set(l.core).size,want,l.title+': 핵심은 서로 다른 문제');
 assert.deepEqual(l.core,l.ids.filter(id=>l.core.includes(id)),l.title+': 핵심은 그 강의 문제이고 강 순서 그대로');
 for(const id of l.core)assert.ok(R(`!!QUIZ_OPTIONS[${JSON.stringify(id)}]&&CORE_REVIEW_PACK.some(c=>c.id===${JSON.stringify(id)})`),'앱에 있는 문제: '+id);
 const answers=l.core.map(id=>String(answerOf(id)).trim());assert.equal(new Set(answers).size,want,l.title+': 같은 정답(같은 사실)이 두 번 나오지 않는다');
 const questions=l.core.map(id=>R(`CORE_REVIEW_PACK.find(c=>c.id===${JSON.stringify(id)}).question`));assert.equal(new Set(questions).size,want,l.title+': 같은 발문이 두 번 나오지 않는다');
 const unit=J(`STUDY_PARTS.units.find(u=>u.scope.round==='lecture-${l.id}')`);
 for(const p of unit.parts)assert.ok(p.ids.some(id=>l.core.includes(id)),l.title+' 파트 '+p.title+': 핵심이 하나 이상(파트가 통째로 접히지 않는다)');
 folded+=l.ids.length-want;
}
// 2026-09-28 24강부터 강마다 20문제로 만든다 → core = 그 강의 20문제 전부(접는 문제 없음, 22 · 23강과 같음).
for(const id of ['22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','38']){const l=lectures.find(x=>x.id===id);assert.deepEqual(l.core,l.ids,l.title+': 이미 20문제 → 전부 핵심');}
assert.equal(lectures.reduce((n,l)=>n+l.core.length,0),760,'34범위 × 20 + 02~05강 80');
// 02~05강 80은 교재 강 넷에 고루: 선사(파트 둘) · 고조선·여러 나라(둘) · 고구려 · 백제 파트마다 5 이상(한 교재 강 20이 그 파트들에 있다)
{const l=lectures.find(x=>x.id==='02-05'),unit=J("STUDY_PARTS.units.find(u=>u.id==='hist-02-05')");
 for(const p of unit.parts)assert.ok(p.ids.filter(id=>l.core.includes(id)).length>=5,'02~05강 '+p.title+': 핵심 5 이상');
 const n=pid=>unit.parts.filter(p=>pid.includes(p.id)).reduce((s,p)=>s+p.ids.filter(id=>l.core.includes(id)).length,0);
 assert.equal(n(['h0205-1','h0205-2']),20,'02강 선사 시대 = 20');assert.equal(n(['h0205-3','h0205-4']),20,'03강 고조선·여러 나라 = 20');}
// 대조군: core가 없는 강(앞으로 넣을 24강 등)은 접는 문제가 없다
assert.equal(R("foldedLecture('no-such-id')"),null);

// ── 2) 앱: 기본 = 핵심 20만
const inCur="data.cards.filter(c=>isPlayable(c)&&inCurrent(c))";
const open=round=>R(`openScope({subject:'한국사',topic:'',round:${JSON.stringify(round)}})`);
const playableCount=ids=>R(`(()=>{const s=new Set(${JSON.stringify(ids)});return data.cards.filter(c=>s.has(c.id)&&playableRaw(c)).length;})()`);
for(const l of lectures){
 open('lecture-'+l.id);
 const want=WANT(l.id);
 assert.equal(R(inCur+'.length'),want,l.title+': 범위 = 핵심 '+want);
 assert.match(R(`countLine(${inCur})`),new RegExp('^풀어야 할 문제 [0-9]+/'+want+'$'),l.title);
 const more=playableCount(l.ids)-want;
 if(more){assert.equal(node('#moreLabel').hidden,false,l.title+': 이 강 문제 더 풀기가 보인다');assert.equal(text(node('#moreCount')),'('+more+'문제)');assert.equal(node('#moreLecture').checked,false);}
 else assert.equal(node('#moreLabel').hidden,true,l.title+': 더 풀 문제가 없으면 안 보인다');
 assert.match(text(node('#roundScore')),new RegExp('^첫 시도 0/'+want+'문제'),l.title+': 첫 시도 줄도 핵심 수');
}
const L12=lectures.find(l=>l.id==='12'),L07=lectures.find(l=>l.id==='07');
// 과목 전체 · 진행 상황 수 = 보이는 문제만
const allHist=()=>R("data.cards.filter(c=>isPlayable(c)&&c.subject==='한국사').length");
const rawHist=R("data.cards.filter(c=>playableRaw(c)&&c.subject==='한국사').length");
assert.equal(allHist(),rawHist-folded,'한국사 전체에서 접힌 문제만 빠진다');
R("go('subject','한국사')");assert.match(text(node('#subjectSummary')),new RegExp('/'+(allHist())+' · '),'과목 화면 수 = 보이는 문제');
R("go('range','한국사')");
{const rows=node('#rangeList').all.filter(n=>n.tag==='button');const r12=rows.find(b=>text(b).startsWith(L12.title));
 assert.match(text(r12),/풀어야 할 문제 \d+\/20 · 첫 시도 0\/20 · 더 풀기 167문제$/,'연습 범위: 20 + 더 풀 수');
 const r22=rows.find(b=>text(b).startsWith('22강'));assert.match(text(r22),/\/20 · 첫 시도 0\/20$/,'22강은 더 풀 문제 없음');}
// 파트별 상태: 파트 수 = 보이는 문제
R("go('parts','한국사')");
{const f=node('#partsBody').children.find(c=>c.dataset?.unit==='hist-12');assert.match(text(f.children[0]),/^12강 고려\(외교\) · 7파트 · 20문제/,'파트별 상태 12강 = 20문제');}

// ── 3) 켜고 끄기(강 화면의 체크 상자)
open('lecture-12');
const toggle=on=>{node('#moreLecture').checked=on;node('#moreLecture').onchange({target:{checked:on}});};
toggle(true);
assert.deepEqual(J('data.openLectures'),['12']);
assert.equal(R(inCur+'.length'),L12.ids.length,'켜면 12강 전부');
assert.equal(node('#moreLabel').hidden,false);assert.equal(node('#moreLecture').checked,true);assert.equal(text(node('#moreCount')),'(167문제)','켠 뒤에도 같은 수');
assert.match(text(node('#message')),/이 강의 나머지 문제도 함께 풀어요/);assert.ok(!BANNED.test(text(node('#message'))));
assert.equal(allHist(),rawHist-folded+167,'과목 전체에도 12강 나머지가 들어온다');
// 다른 강은 그대로
open('lecture-07');assert.equal(R(inCur+'.length'),20,'07강은 여전히 20');
// 파트 범위: 켠 강의 파트는 전부, 안 켠 강의 파트는 핵심만 · 파트 화면에서도 그 파트 수로 켤 수 있다
const part07=J("STUDY_PARTS.units.find(u=>u.id==='hist-07').parts[0]");
open('part-'+part07.id);
const core07=part07.ids.filter(id=>L07.core.includes(id)).length;
assert.equal(R(inCur+'.length'),core07,'07강 첫 파트 = 그 파트의 핵심');
assert.equal(text(node('#moreCount')),'('+(part07.ids.length-core07)+'문제)','파트 화면의 수 = 그 파트에 더해지는 문제');
open('lecture-12');toggle(false);
assert.equal(R('data.openLectures'),undefined,'끄면 설정을 지운다');assert.equal(R(inCur+'.length'),20);assert.match(text(node('#message')),/핵심 20문제만 풀어요/);
// 02~05강: 알림의 수도 그 범위의 핵심 수(80)
open('lecture-02-05');assert.equal(text(node('#moreCount')),'(140문제)');toggle(true);assert.equal(R(inCur+'.length'),220);toggle(false);
assert.match(text(node('#message')),/02~05강 선사 시대~삼국 통일 — 핵심 80문제만 풀어요/);assert.equal(R(inCur+'.length'),80);

// ── 4) 뱃지(자체제작 = 파트별 외운 비율 평균)는 보이는 문제로: 07강 첫 파트의 핵심을 모두 외우면 접힌 동안 그 파트 100%
const seedMaster=ids=>R(`(()=>{const today=ReviewSchedule.day(),ago=n=>ReviewSchedule.plus(today,-n),rows=[];let k=0;
 for(const id of ${JSON.stringify(ids)})for(const d of [60,50,35,4])rows.push({id:'m-'+id+'-'+d,cardId:id,date:ago(d),at:ago(d)+'T09:00:00+09:00',result:'correct',mode:'quiz'});
 commit(ProgressSync.merge(data,rows));})()`);
const coreFirst=part07.ids.filter(id=>L07.core.includes(id));
seedMaster(coreFirst);
const groupOf=id=>J(`subjectBadges()['한국사'].self.groups.find(g=>g.id===${JSON.stringify(id)})`);
{const g=J(`selfGroups('한국사').find(x=>x.id===${JSON.stringify(part07.id)})`);assert.deepEqual(g.ids.slice().sort(),coreFirst.slice().sort(),'뱃지 묶음 = 그 파트의 보이는 문제');
 assert.ok(!R("selfGroups('한국사').some(x=>x.ids.some(id=>foldedLecture(id)))"),'뱃지 묶음에 접힌 문제가 없다');
 assert.equal(groupOf(part07.id).pct,100,'접힌 동안: 보이는 문제를 다 외웠으니 100%');}
open('lecture-07');toggle(true);
{const g=groupOf(part07.id);assert.ok(g.pct>0&&g.pct<100,'켜면 파트 전체 기준(외우지 않은 나머지가 들어와 100% 밑): '+g.pct);}
toggle(false);

// ── 5) 접힌 문제는 복습일이 와도 대기열에 안 들어온다(켜면 들어온다)
const foldedId=L12.ids.find(id=>!L12.core.includes(id));
R(`(()=>{const today=ReviewSchedule.day(),d=ReviewSchedule.plus(today,-9);commit(ProgressSync.merge(data,[{id:'due-1',cardId:${JSON.stringify(foldedId)},date:d,at:d+'T09:00:00+09:00',result:'correct',mode:'quiz'}]));})()`);
assert.ok(R(`data.cards.find(c=>c.id===${JSON.stringify(foldedId)}).due<=ReviewSchedule.day()`),'대조군: 그 문제는 복습일이 왔다');
R("openScope({subject:'한국사',topic:'',round:''})");
const dueIds=()=>R(`reviewQueue(data.cards.filter(c=>isPlayable(c)&&inCurrent(c))).ready.map(c=>c.id)`);
assert.ok(!Array.from(dueIds()).includes(foldedId),'접힌 동안 한국사 전체 대기열에 없다');
assert.ok(!R(`countLine(data.cards.filter(isPlayable)).includes('NaN')`));
R("setLectureOpen('12',true)");assert.ok(Array.from(dueIds()).includes(foldedId),'켜면 대기열에 들어온다');
R("setLectureOpen('12',false)");
assert.equal(R(`data.history.filter(h=>h.cardId===${JSON.stringify(foldedId)}).length`),1,'접어도 풀이 기록은 그대로');

// ── 6) 막다른 화면 없음: 07강 핵심 20을 오늘 다 풀면 끝 화면에 '이 강 문제 더 풀기'
R(`(()=>{const today=ReviewSchedule.day(),rows=${JSON.stringify(L07.core)}.map((id,i)=>({id:'t-'+i,cardId:id,date:today,at:today+'T08:'+String(i).padStart(2,'0')+':00+09:00',result:'correct',mode:'quiz'}));commit(ProgressSync.merge(data,rows));})()`);
open('lecture-07');
{const card=node('#card');const buttons=card.all.filter(n=>n.tag==='button');const more=buttons.find(b=>/^이 강 문제 더 풀기 \(20문제\)$/.test(text(b)));
 assert.ok(!card.all.some(n=>n.className==='question'),'핵심 20을 다 풀어 낼 문제가 없다');
 assert.ok(more,'끝 화면에 이 강 문제 더 풀기(20문제): '+buttons.map(text).join(' / '));
 assert.ok(buttons.some(b=>/^다음 강 풀기 · 08강/.test(text(b))),'다음 강 버튼도 그대로');
 assert.ok(!BANNED.test(text(card)),'끝 화면에 앱 속 용어가 없다');
 more.onclick();
 assert.deepEqual(J('data.openLectures'),['07']);assert.ok(R("!!document.querySelector('#card').all.find(n=>n.className==='question')"),'누르면 바로 다음 문제');}

// ── 7) 설정은 저장소에 남고(새로고침 뒤 그대로), 잘못된 값은 받지 않는다
{const again=boot(store);assert.deepEqual(again.J('data.openLectures'),['07'],'새로고침 뒤에도 07강은 켜져 있다');
 again.R("openScope({subject:'한국사',topic:'',round:'lecture-07'})");assert.equal(again.R("data.cards.filter(c=>isPlayable(c)&&inCurrent(c)).length"),L07.ids.length);
 again.R("openScope({subject:'한국사',topic:'',round:'lecture-12'})");assert.equal(again.R("data.cards.filter(c=>isPlayable(c)&&inCurrent(c)).length"),20);
 for(const bad of ['"07"','[7]','[""]','{}'])assert.throws(()=>again.R(`validateBackup({...structuredClone(data),openLectures:${bad}})`),/이 강 문제 더 풀기/,bad);
 again.R("validateBackup({...structuredClone(data),openLectures:['07','12']})");}

console.log('PASS core20: 35개 강 범위 × 핵심 20(02~05강은 교재 강 넷 × 20 = 80, 22~36 · 38강은 전부, 파트마다 하나 이상, 같은 정답 없음, 760문제), 기본은 강 · 파트 · 과목 전체 · 수 · 뱃지 · 대기열 모두 핵심 20만(접힌 '+folded+'문제), '+
 '이 강 문제 더 풀기 켜기/끄기(강 단위, 파트 화면은 그 파트 수), 접힌 문제는 복습일이 와도 대기열 밖, 핵심을 다 풀면 끝 화면에 더 풀기 버튼, 새로고침 뒤 설정 유지 · 잘못된 설정 거부');

// ── 8) v199 영어 · 국어 단원마다 핵심 20(2026-09-30 사용자 "단원마다 핵심 20").
// 자료: core-units.js 17단원(영어 Day 1~7 · 문법 공식 훈련, 국어 논리 1~6장 · 독해 1~3장) × 20, 단원 순서 · 파트마다 하나 이상 · 쌍둥이(같은 요점) 두 번 없음.
// 앱: 단원 · 파트 · 과목 전체 · 수 · 뱃지 · 대기열이 모두 보이는 문제로, '이 단원 문제 더 풀기' 켜기/끄기, 문제가 모두 접힌 문법 공식은 '이 공식 문제 더 풀기'로 그 공식만,
// 접힌 문제는 풀 수 없고(대조군: 핵심은 풀 수 있음) 복습일이 와도 대기열 밖, 핵심을 다 풀면 끝 화면 버튼, 설정은 새로고침 뒤에도, 한국사는 그대로.
{
 const store2=new Map(),A=boot(store2);
 const UNIT_IDS=['en-day1','en-day2','en-day3','en-day4','en-day5','en-day6','en-day7','en-formula','ko-ko1','ko-ko2','ko-ko3','ko-ko4','ko-ko5','ko-ko6','ko-kr1','ko-kr2','ko-kr3'];
 const units=A.J('STUDY_CORE_UNITS');assert.deepEqual(units.map(u=>u.id),UNIT_IDS,'17단원');
 const P=id=>A.J(`STUDY_PARTS.units.find(u=>u.id===${JSON.stringify(id)})`);
 const folded={영어:0,국어:0},info={};
 for(const u of units){const p=P(u.id),ids=p.parts.flatMap(x=>x.ids);info[u.id]={p,ids,n:ids.length};
  assert.equal(u.core.length,20,p.title+': 핵심 20');assert.equal(new Set(u.core).size,20,p.title+': 서로 다른 문제');
  assert.deepEqual(u.core,ids.filter(id=>u.core.includes(id)),p.title+': 단원 안의 문제 · 단원 순서');
  for(const id of u.core)assert.equal(A.R(`PRACTICE_BANK[${JSON.stringify(id)}]?.topic`),p.scope.topic,'자체 제작 문제만(기출 아님): '+id);
  for(const x of p.parts)assert.ok(x.ids.some(id=>u.core.includes(id)),p.title+' 파트 '+x.title+': 핵심이 하나 이상');
  const concepts=new Set(u.core.map(id=>A.R(`ReviewPolicy.concept(${JSON.stringify(id)})`))),points=new Set(ids.map(id=>A.R(`ReviewPolicy.concept(${JSON.stringify(id)})`)));
  assert.equal(concepts.size,Math.min(20,points.size),p.title+': 같은 요점(쌍둥이)은 요점이 20개보다 적을 때만 두 번');
  folded[u.subject]+=ids.length-20;}
 // 대조군: 접히는 문제는 풀 수 없고 핵심은 풀 수 있다.
 {const u=units[0],f=info[u.id].ids.find(id=>!u.core.includes(id));
  assert.equal(A.R(`isPlayable(data.cards.find(c=>c.id===${JSON.stringify(f)}))`),false,'접힌 문제는 풀 수 없다');assert.equal(A.R(`playableRaw(data.cards.find(c=>c.id===${JSON.stringify(f)}))`),true,'대조군: 내용은 있다');
  assert.equal(A.R(`isPlayable(data.cards.find(c=>c.id===${JSON.stringify(u.core[0])}))`),true,'대조군: 핵심은 풀 수 있다');}
 const cur="data.cards.filter(c=>isPlayable(c)&&inCurrent(c))";
 const openU=sc=>A.R(`openScope(${JSON.stringify(sc)})`),scopeOfUnit=id=>({subject:info[id].p.subject,topic:info[id].p.scope.topic,round:''});
 for(const u of units){openU(scopeOfUnit(u.id));const t=info[u.id].p.title;
  assert.equal(A.R(cur+'.length'),20,t+': 범위 = 핵심 20');assert.match(A.R(`countLine(${cur})`),/^풀어야 할 문제 [0-9]+\/20$/,t);
  assert.equal(A.node('#moreLabel').hidden,false,t+': 더 풀기가 보인다');assert.equal(text(A.node('#moreText')),'이 단원 문제 더 풀기');assert.equal(text(A.node('#moreCount')),'('+(info[u.id].n-20)+'문제)',t);}
 // 과목 전체 = 전체 − 접힌 문제(수일치 · 그 밖의 문법 · 기출은 접지 않는다)
 for(const s of ['영어','국어'])assert.equal(A.R(`data.cards.filter(c=>isPlayable(c)&&c.subject===${JSON.stringify(s)}).length`),A.R(`data.cards.filter(c=>playableRaw(c)&&c.subject===${JSON.stringify(s)}).length`)-folded[s],s+' 전체에서 접힌 문제만 빠진다');
 // 자체제작 뱃지 묶음(파트별 외운 비율)에 접힌 문제가 없다
 for(const s of ['영어','국어'])assert.ok(!A.R(`selfGroups(${JSON.stringify(s)}).some(x=>x.ids.some(id=>foldedLecture(id)))`),s+' 뱃지 묶음에 접힌 문제가 없다');
 // 연습 범위 목록 줄
 A.R("go('range','영어')");
 const row=title=>{const b=A.node('#rangeList').all.find(n=>n.tag==='button'&&n.children[0]?._text===title);return b?.children[1]?._text;};
 assert.equal(row('Day 1 문장의 구조·동사 유형'),'풀어야 할 문제 20/20 · 첫 시도 0/20 · 더 풀기 40문제');assert.equal(row('공식 훈련 새 문제 전체'),'풀어야 할 문제 20/20 · 첫 시도 0/20 · 더 풀기 344문제');
 // 켜기 / 끄기(Day 1)
 const toggle=on=>{A.node('#moreLecture').checked=on;A.node('#moreLecture').onchange({target:{checked:on}});};
 openU(scopeOfUnit('en-day1'));toggle(true);
 assert.deepEqual(A.J('data.openLectures'),['en-day1']);assert.equal(A.R(cur+'.length'),60,'켜면 Day 1 전부');assert.equal(text(A.node('#moreCount')),'(40문제)','켠 뒤에도 같은 수');
 assert.match(text(A.node('#message')),/^Day 1 문장의 구조·동사 유형 — 이 단원의 나머지 문제도 함께 풀어요\.$/);assert.ok(!BANNED.test(text(A.node('#message'))));
 A.R("go('range','영어')");assert.equal(row('Day 1 문장의 구조·동사 유형'),'풀어야 할 문제 60/60 · 첫 시도 0/60 · 이 단원 문제 더 풀기 켬');
 openU(scopeOfUnit('en-day2'));assert.equal(A.R(cur+'.length'),20,'다른 단원은 그대로');
 openU(scopeOfUnit('en-day1'));toggle(false);assert.equal(A.R('data.openLectures'),undefined);assert.equal(A.R(cur+'.length'),20);assert.match(text(A.node('#message')),/— 핵심 20문제만 풀어요\. 푼 기록은 그대로 남아요\.$/);
 // 파트 범위: 그 파트의 핵심만, 수 = 그 파트에 더해지는 문제
 {const p=info['ko-ko2'].p.parts[5],core=units.find(u=>u.id==='ko-ko2').core,inPart=p.ids.filter(id=>core.includes(id)).length;
  openU({subject:'국어',topic:'',round:'part-'+p.id});assert.equal(A.R(cur+'.length'),inPart,'국어 2장 파트 = 그 파트의 핵심');assert.equal(text(A.node('#moreCount')),'('+(p.ids.length-inPart)+'문제)');assert.equal(text(A.node('#moreText')),'이 단원 문제 더 풀기');}
 // 파트별 상태: 단원 = 20문제
 A.R("go('parts','국어')");{const f=A.node('#partsBody').children.find(c=>c.dataset?.unit==='ko-ko2');assert.match(text(f.children[0]),/· 6파트 · 20문제/,'파트별 상태 2장 = 20문제');}
 // 문제가 모두 접힌 문법 공식(Day 2 + 공식 훈련): 목록에 남고, 그 공식만 펼 수 있다.
 const ff=A.J(`(()=>{const m=new Map();for(const [id,l] of Object.entries(PRACTICE_BANK)){if(!l.formula)continue;const x=m.get(l.formula)||{id:l.formula,vis:0,topics:[],all:0};x.all++;if(isPlayable({id}))x.vis++;if(!x.topics.includes(l.topic))x.topics.push(l.topic);m.set(l.formula,x);}
  return [...m.values()].find(x=>!x.vis&&x.topics.includes('Day 2')&&!x.topics.includes('Day 1'));})()`);
 assert.ok(ff,'모두 접힌 공식이 있다(대조군)');const fTitle=A.R(`ENGLISH_FORMULAS.title(${JSON.stringify(ff.id)})`);
 A.R("go('range','영어')");assert.equal(row(fTitle),'풀어야 할 문제 0/0 · 첫 시도 0/0 · 더 풀기 '+ff.all+'문제','모두 접힌 공식도 목록에 남는다');
 openU({subject:'영어',topic:'formula:'+ff.id,round:''});assert.equal(A.R(cur+'.length'),0);assert.equal(text(A.node('#moreText')),'이 공식 문제 더 풀기');assert.equal(text(A.node('#moreCount')),'('+ff.all+'문제)');
 {const card=A.node('#card'),buttons=card.all.filter(n=>n.tag==='button'),more=buttons.find(b=>text(b)==='이 공식 문제 더 풀기 ('+ff.all+'문제)');
  assert.ok(card.all.some(n=>n.tag==='h2'&&text(n)==='이 공식 문제는 모두 더 풀기에 있어요'),'끝 화면 제목');assert.ok(more,'끝 화면 버튼: '+buttons.map(text).join(' / '));assert.ok(!BANNED.test(text(card)));
  more.onclick();}
 assert.deepEqual(A.J('data.openLectures'),['formula:'+ff.id],'공식 하나만 편다');assert.equal(A.R(cur+'.length'),ff.all,'그 공식 문제 전부');
 assert.equal(A.R(`PRACTICE_BANK[data.activePractice.cardId].formula`),ff.id,'누르면 바로 그 공식 문제');
 {const add=A.R(`Object.values(PRACTICE_BANK).filter(l=>l.topic==='Day 2'&&l.formula===${JSON.stringify(ff.id)}).length`);openU(scopeOfUnit('en-day2'));
  assert.equal(A.R(cur+'.length'),20+add,'그 공식의 Day 2 문제도 Day 2에 들어온다');assert.equal(text(A.node('#moreCount')),'('+(40-add)+'문제)','Day 2 더 풀기 수 = 아직 접힌 문제');
  openU(scopeOfUnit('en-day3'));assert.equal(A.R(cur+'.length'),20,'다른 단원은 그대로');}
 A.R(`setLectureOpen('formula:${ff.id}',false)`);assert.equal(A.R('data.openLectures'),undefined);assert.match(text(A.node('#message')),/— 단원마다 고른 핵심 문제만 풀어요/);
 // 접힌 문제는 복습일이 와도 대기열 밖(켜면 안)
 {const f=info['ko-kr3'].ids.find(id=>!units.find(u=>u.id==='ko-kr3').core.includes(id));
  A.R(`(()=>{const d=ReviewSchedule.plus(ReviewSchedule.day(),-9);commit(ProgressSync.merge(data,[{id:'due-k',cardId:${JSON.stringify(f)},date:d,at:d+'T09:00:00+09:00',result:'correct',mode:'quiz'}]));})()`);
  assert.ok(A.R(`data.cards.find(c=>c.id===${JSON.stringify(f)}).due<=ReviewSchedule.day()`),'대조군: 복습일이 왔다');
  A.R("openScope({subject:'국어',topic:'',round:''})");const due=()=>Array.from(A.R(`reviewQueue(${cur}).ready.map(c=>c.id)`));
  assert.ok(!due().includes(f),'접힌 동안 국어 전체 대기열에 없다');A.R("setLectureOpen('ko-kr3',true)");assert.ok(due().includes(f),'켜면 들어온다');A.R("setLectureOpen('ko-kr3',false)");
  assert.equal(A.R(`data.history.filter(h=>h.cardId===${JSON.stringify(f)}).length`),1,'접어도 풀이 기록은 그대로');}
 // 막다른 화면 없음: Day 5 핵심 20을 오늘 다 풀면 끝 화면에 '이 단원 문제 더 풀기 (176문제)'
 {const core=units.find(u=>u.id==='en-day5').core;
  A.R(`(()=>{const today=ReviewSchedule.day(),rows=${JSON.stringify(core)}.map((id,i)=>({id:'e5-'+i,cardId:id,date:today,at:today+'T08:'+String(i).padStart(2,'0')+':00+09:00',result:'correct',mode:'quiz'}));commit(ProgressSync.merge(data,rows));})()`);
  openU(scopeOfUnit('en-day5'));const card=A.node('#card'),buttons=card.all.filter(n=>n.tag==='button'),more=buttons.find(b=>text(b)==='이 단원 문제 더 풀기 (176문제)');
  assert.ok(!card.all.some(n=>n.className==='question'),'핵심 20을 다 풀어 낼 문제가 없다');assert.ok(more,'끝 화면에 이 단원 문제 더 풀기: '+buttons.map(text).join(' / '));
  assert.ok(card.all.some(n=>/^이 단원은 핵심 20문제만 보여 주고 있어요\. 나머지 176문제도/.test(n._text||'')));assert.ok(!BANNED.test(text(card)));
  more.onclick();assert.deepEqual(A.J('data.openLectures'),['en-day5']);assert.ok(A.R("!!document.querySelector('#card').all.find(n=>n.className==='question')"),'누르면 바로 다음 문제');}
 // 설정은 새로고침 뒤에도 남고, 공식 열쇠(긴 이름)도 받는다 · 잘못된 값은 거부
 A.R(`setLectureOpen('formula:${ff.id}',true)`);
 {const again=boot(store2);assert.deepEqual(again.J('data.openLectures'),['en-day5','formula:'+ff.id],'새로고침 뒤에도 켜져 있다');
  again.R("openScope({subject:'영어',topic:'Day 5',round:''})");assert.equal(again.R(cur+'.length'),196);
  for(const bad of ['[""]','["'+'x'.repeat(61)+'"]','[1]'])assert.throws(()=>again.R(`validateBackup({...structuredClone(data),openLectures:${bad}})`),/더 풀기/,bad);
  again.R("validateBackup({...structuredClone(data),openLectures:['07','en-day1','formula:object-complement-passive']})");}
 // 한국사는 그대로: 12강 20 · '이 강 문제 더 풀기 (167문제)'
 A.R("openScope({subject:'한국사',topic:'',round:'lecture-12'})");assert.equal(A.R(cur+'.length'),20);assert.equal(text(A.node('#moreText')),'이 강 문제 더 풀기');assert.equal(text(A.node('#moreCount')),'(167문제)');
 // 배포: 앱 파일 목록(index.html · sw.js · pages.yml)에 core-units.js
 {const html=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8'),yml=fs.readFileSync(__dirname+'/.github/workflows/pages.yml','utf8'),v=(html.match(/core-units\.js\?v=(\d+)/)||[])[1];
  assert.ok(v&&html.indexOf('core-units.js?v=')<html.indexOf('src="app.js'),'index.html: core-units.js를 app.js 앞에서 읽는다');assert.ok(sw.includes("'./core-units.js?v="+v+"'"),'sw.js가 core-units.js를 담는다');assert.ok(/cp [^\n]*\bcore-units\.js\b/.test(yml),'Pages 배포에 core-units.js');
  assert.ok(html.includes('<span id="moreText">이 강 문제 더 풀기</span>'));}
 console.log('PASS core20 영어 · 국어: 17단원 × 핵심 20(단원 순서 · 파트마다 하나 이상 · 쌍둥이 한 번), 접힌 영어 '+folded['영어']+' · 국어 '+folded['국어']+'문제는 풀 수 없고 수 · 파트 · 대기열 밖, '+
  "'이 단원 문제 더 풀기' 켜기/끄기, 모두 접힌 문법 공식은 목록에 남고 '이 공식 문제 더 풀기'로 그 공식만, 핵심을 다 풀면 끝 화면 버튼, 새로고침 뒤 유지 · 잘못된 설정 거부, 한국사 그대로, 배포 목록");
}
