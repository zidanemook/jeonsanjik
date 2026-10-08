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
const FILES=['scheduler.js','learning.js','core-review-pack.js','quiz-options.js','hanneung-data.js','hanneung-explanations.js','hanneung.js','gichul-index.js','gichul.js','practice-bank.js','practice.js','content-corrections.js','review-record.js','review-policy.js','sync-core.js','study-credit.js','xp.js','score.js','study-review-catalog.js','hanneung-topics.js','topics.js','parts.js','part-check.js','memorize.js','basics.js','core-units.js','content-store.js','app.js'];
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
assert.deepEqual(lectures.map(l=>l.id),['02-05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','28-40','250','252-256']);
const answerOf=id=>R(`(()=>{const q=QUIZ_OPTIONS[${JSON.stringify(id)}];return q&&q.choices?q.choices[q.correctIndex]:CORE_REVIEW_PACK.find(c=>c.id===${JSON.stringify(id)}).answer;})()`);
let folded=0;
// 교재 강마다 20: 앱 범위 '02~05강'만 교재 강 넷(02 선사 · 03 고조선·여러 나라 · 04 고구려·가야 · 05 백제·신라·통일)을 묶은 범위라 80(부모 검토 2026-09-28).
// 2026-10-05 근대 순서 훈련(28~40강) 범위는 교재 강이 아니라 사건 순서 30문제 묶음 — core = 30 전부(접는 문제 없음).
const WANT=id=>id==='02-05'?80:id==='28-40'?30:20;
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
for(const id of ['22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','28-40']){const l=lectures.find(x=>x.id===id);assert.deepEqual(l.core,l.ids,l.title+': 이미 20문제 → 전부 핵심');}
assert.equal(lectures.reduce((n,l)=>n+l.core.length,0),850,'37범위 × 20 + 02~05강 80 + 근대 순서 훈련 30');
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
R("go('subject','한국사')");assert.match(text(node('#subjectSummary')),new RegExp('/'+(allHist())+', '),'과목 화면 수 = 보이는 문제');
R("go('range','한국사')");
{const rows=node('#rangeList').all.filter(n=>n.tag==='button');const r12=rows.find(b=>text(b).startsWith(L12.title));
 assert.match(text(r12),/풀어야 할 문제 \d+\/20, 첫 시도 0\/20, 더 풀기 167문제$/,'연습 범위: 20 + 더 풀 수');
 const r22=rows.find(b=>text(b).startsWith('22강'));assert.match(text(r22),/\/20, 첫 시도 0\/20$/,'22강은 더 풀 문제 없음');}
// 파트별 상태: 파트 수 = 보이는 문제
R("go('parts','한국사')");
{const f=node('#partsBody').children.find(c=>c.dataset?.unit==='hist-12');assert.match(text(f.children[0]),/^12강 고려\(외교\): 7파트, 20문제/,'파트별 상태 12강 = 20문제');}

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
 assert.ok(buttons.some(b=>/^다음 강 풀기: 08강/.test(text(b))),'다음 강 버튼도 그대로');
 assert.ok(!BANNED.test(text(card)),'끝 화면에 앱 속 용어가 없다');
 more.onclick();
 assert.deepEqual(J('data.openLectures'),['07']);assert.ok(R("!!document.querySelector('#card').all.find(n=>n.className==='question')"),'누르면 바로 다음 문제');}

// ── 7) 설정은 저장소에 남고(새로고침 뒤 그대로), 잘못된 값은 받지 않는다
{const again=boot(store);assert.deepEqual(again.J('data.openLectures'),['07'],'새로고침 뒤에도 07강은 켜져 있다');
 again.R("openScope({subject:'한국사',topic:'',round:'lecture-07'})");assert.equal(again.R("data.cards.filter(c=>isPlayable(c)&&inCurrent(c)).length"),L07.ids.length);
 again.R("openScope({subject:'한국사',topic:'',round:'lecture-12'})");assert.equal(again.R("data.cards.filter(c=>isPlayable(c)&&inCurrent(c)).length"),20);
 for(const bad of ['"07"','[7]','[""]','{}'])assert.throws(()=>again.R(`validateBackup({...structuredClone(data),openLectures:${bad}})`),/이 강 문제 더 풀기/,bad);
 again.R("validateBackup({...structuredClone(data),openLectures:['07','12']})");}

console.log('PASS core20: 38개 강 범위 × 핵심 20(02~05강은 교재 강 넷 × 20 = 80, 22~40강은 전부, 파트마다 하나 이상, 같은 정답 없음, 820문제), 기본은 강 · 파트 · 과목 전체 · 수 · 뱃지: 대기열 모두 핵심 20만(접힌 '+folded+'문제), '+
 '이 강 문제 더 풀기 켜기/끄기(강 단위, 파트 화면은 그 파트 수), 접힌 문제는 복습일이 와도 대기열 밖, 핵심을 다 풀면 끝 화면에 더 풀기 버튼, 새로고침 뒤 설정 유지 · 잘못된 설정 거부');

// ── 8) v199 영어 · 국어 단원마다 핵심 20(2026-09-30 사용자 "단원마다 핵심 20").
// 자료: core-units.js 28단원(2026-10-07 국어 문법 3장 · 공문서 수정 1~3장 · 어휘 1~2장 포함, 국어 문법 1 · 2장 포함 — 2026-10-07, 영어 Day 1~10 · 문법 공식 훈련, 국어 논리 1~6장 · 독해 1~3장 — Day 8 · 9 · 10은 2026-10-07 더 풀기를 더하며 들어옴, 핵심 = 먼저 만든 20문제) × 20, 단원 순서 · 파트마다 하나 이상 · 쌍둥이(같은 요점) 두 번 없음.
// 앱: 단원 · 파트 · 과목 전체 · 수 · 뱃지: 대기열이 모두 보이는 문제로, '이 단원 문제 더 풀기' 켜기/끄기, 문제가 모두 접힌 문법 공식은 '이 공식 문제 더 풀기'로 그 공식만,
// 접힌 문제는 풀 수 없고(대조군: 핵심은 풀 수 있음) 복습일이 와도 대기열 밖, 핵심을 다 풀면 끝 화면 버튼, 설정은 새로고침 뒤에도, 한국사는 그대로.
{
 const store2=new Map(),A=boot(store2);
 const UNIT_IDS=['en-day1','en-day2','en-day3','en-day4','en-day5','en-day6','en-day7','en-day8','en-day9','en-day10','en-day11','en-day12','en-day13','en-day14','en-day15','en-formula','ko-ko1','ko-ko2','ko-ko3','ko-ko4','ko-ko5','ko-ko6','ko-kr1','ko-kr2','ko-kr3','ko-kg1','ko-kg2','ko-kg3','ko-kd1','ko-kd2','ko-kd3','ko-kv1','ko-kv2','comq-cg01','comq-cg02','comq-cg03','comq-cg04','comq-cg05','comq-cg06','comq-cg07','comq-cg17','comq-cg18','comq-cg19','comq-cg20'];
 // 국어 문법 1 · 2장(2026-10-07 더 풀기를 더하며 들어옴): 핵심 = 001~020(요점마다 한 문제), 더 풀기 = 021~ 전부.
 const units=A.J('STUDY_CORE_UNITS');assert.deepEqual(units.map(u=>u.id),UNIT_IDS,'44단원');
 // 2026-10-07 국어 묶음(문법 3장 · 공문서 수정 1~3장 · 어휘 1~2장): 핵심 = 001~020, 더 풀기 = 021~ 전부.
 for(const [id,pre] of [["ko-kg3","ko-gram3-"],["ko-kd1","ko-doc1-"],["ko-kd2","ko-doc2-"],["ko-kd3","ko-doc3-"],["ko-kv1","ko-voc1-"],["ko-kv2","ko-voc2-"]]){const u=units.find(x=>x.id===id);assert.deepEqual([...u.core].sort(),Array.from({length:20},(_,i)=>pre+String(i+1).padStart(3,'0')),id+' 핵심 = 001~020');}
 for(const g of [1,2]){const u=units.find(x=>x.id==='ko-kg'+g);assert.deepEqual([...u.core].sort(),Array.from({length:20},(_,i)=>'ko-gram'+g+'-'+String(i+1).padStart(3,'0')),'문법 '+g+'장 핵심 = 001~020');}
 // Day 8 · 9 · 10: 핵심 = 001~020(먼저 만든 포인트마다 한 문제), 더 풀기 = 021~ 전부.
 for(const d of [8,9,10,11,12,13,14,15]){const u=units.find(x=>x.id==='en-day'+d);assert.deepEqual([...u.core].sort(),Array.from({length:20},(_,i)=>'en-day'+d+'-'+String(i+1).padStart(3,'0')),'Day '+d+' 핵심 = 001~020');}
 const P=id=>A.J(`STUDY_PARTS.units.find(u=>u.id===${JSON.stringify(id)})`);
 const folded={영어:0,국어:0,컴퓨터일반:0},info={};
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
 for(const s of ['영어','국어','컴퓨터일반'])assert.equal(A.R(`data.cards.filter(c=>isPlayable(c)&&c.subject===${JSON.stringify(s)}).length`),A.R(`data.cards.filter(c=>playableRaw(c)&&c.subject===${JSON.stringify(s)}).length`)-folded[s],s+' 전체에서 접힌 문제만 빠진다');
 // 자체제작 뱃지 묶음(파트별 외운 비율)에 접힌 문제가 없다
 for(const s of ['영어','국어','컴퓨터일반'])assert.ok(!A.R(`selfGroups(${JSON.stringify(s)}).some(x=>x.ids.some(id=>foldedLecture(id)))`),s+' 뱃지 묶음에 접힌 문제가 없다');
 // 연습 범위 목록 줄
 A.R("go('range','영어')");
 const row=title=>{const b=A.node('#rangeList').all.find(n=>n.tag==='button'&&n.children[0]?._text===title);return b?.children[1]?._text;};
 assert.equal(row('Day 1 문장의 구조와 동사 유형'),'풀어야 할 문제 20/20, 첫 시도 0/20, 더 풀기 40문제');assert.equal(row('공식 훈련 새 문제 전체'),'풀어야 할 문제 20/20, 첫 시도 0/20, 더 풀기 344문제');
 // 켜기 / 끄기(Day 1)
 const toggle=on=>{A.node('#moreLecture').checked=on;A.node('#moreLecture').onchange({target:{checked:on}});};
 openU(scopeOfUnit('en-day1'));toggle(true);
 assert.deepEqual(A.J('data.openLectures'),['en-day1']);assert.equal(A.R(cur+'.length'),60,'켜면 Day 1 전부');assert.equal(text(A.node('#moreCount')),'(40문제)','켠 뒤에도 같은 수');
 assert.match(text(A.node('#message')),/^Day 1 문장의 구조와 동사 유형 — 이 단원의 나머지 문제도 함께 풀어요\.$/);assert.ok(!BANNED.test(text(A.node('#message'))));
 A.R("go('range','영어')");assert.equal(row('Day 1 문장의 구조와 동사 유형'),'풀어야 할 문제 60/60, 첫 시도 0/60, 이 단원 문제 더 풀기 켬');
 openU(scopeOfUnit('en-day2'));assert.equal(A.R(cur+'.length'),20,'다른 단원은 그대로');
 openU(scopeOfUnit('en-day1'));toggle(false);assert.equal(A.R('data.openLectures'),undefined);assert.equal(A.R(cur+'.length'),20);assert.match(text(A.node('#message')),/— 핵심 20문제만 풀어요\. 푼 기록은 그대로 남아요\.$/);
 // 파트 범위: 그 파트의 핵심만, 수 = 그 파트에 더해지는 문제
 {const p=info['ko-ko2'].p.parts[5],core=units.find(u=>u.id==='ko-ko2').core,inPart=p.ids.filter(id=>core.includes(id)).length;
  openU({subject:'국어',topic:'',round:'part-'+p.id});assert.equal(A.R(cur+'.length'),inPart,'국어 2장 파트 = 그 파트의 핵심');assert.equal(text(A.node('#moreCount')),'('+(p.ids.length-inPart)+'문제)');assert.equal(text(A.node('#moreText')),'이 단원 문제 더 풀기');}
 // 파트별 상태: 단원 = 20문제
 A.R("go('parts','국어')");{const f=A.node('#partsBody').children.find(c=>c.dataset?.unit==='ko-ko2');assert.match(text(f.children[0]),/: 6파트, 20문제/,'파트별 상태 2장 = 20문제');}
 // 문제가 모두 접힌 문법 공식(Day 2 + 공식 훈련): 목록에 남고, 그 공식만 펼 수 있다.
 const ff=A.J(`(()=>{const m=new Map();for(const [id,l] of Object.entries(PRACTICE_BANK)){if(!l.formula)continue;const x=m.get(l.formula)||{id:l.formula,vis:0,topics:[],all:0};x.all++;if(isPlayable({id}))x.vis++;if(!x.topics.includes(l.topic))x.topics.push(l.topic);m.set(l.formula,x);}
  return [...m.values()].find(x=>!x.vis&&x.topics.includes('Day 2')&&!x.topics.includes('Day 1'));})()`);
 assert.ok(ff,'모두 접힌 공식이 있다(대조군)');const fTitle=A.R(`ENGLISH_FORMULAS.title(${JSON.stringify(ff.id)})`);
 A.R("go('range','영어')");assert.equal(row(fTitle),'풀어야 할 문제 0/0, 첫 시도 0/0, 더 풀기 '+ff.all+'문제','모두 접힌 공식도 목록에 남는다');
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
 // 컴퓨터일반 자체 제작(research/computer-20261007): 범위 목록(기출 단원 제목 아래에 그 단원의 장) · 범위 이름 · 핵심 20과 더 풀기(20문제가 넘는 단원만 접는다) · 파트 범위 파트별 상태 · 뱃지 묶음 · 쌍둥이 묶음 · 줄바꿈과 들여쓰기.
 {const SPEC=/*COMQ-SPEC*/[{"part":"cg01","unit":"comq-cg01","parent":"com-u1","topic":"컴일 cg01","title":"컴퓨터 구성, 정보 단위, 문자 코드 (자체 제작)","short":"컴퓨터 구성, 정보 단위, 문자 코드","pre":"comq-cg01-","box":"com-cg01","n":211,"core":20,"folded":true,"points":14,"parts":[["cq01-1","하드웨어의 구성 장치",20,1],["cq01-2","하드웨어, 소프트웨어, 펌웨어 가르기",9,1],["cq01-3","시스템 소프트웨어와 응용 소프트웨어",20,1],["cq01-4","초기 계산 도구와 컴퓨터의 역사",17,2],["cq01-5","컴퓨터 세대별 소자, 언어, 사건",19,1],["cq01-6","컴퓨터의 분류 기준과 종류",13,1],["cq01-7","정보 표현 단위의 길이와 쓰임",16,2],["cq01-8","기억 용량 단위의 접두어와 크기 순서",12,2],["cq01-9","표준 BCD 코드",9,1],["cq01-10","ASCII 코드",17,2],["cq01-11","문자 코드의 비트 수와 문자 수 비교",10,2],["cq01-12","입출력장치, 주변장치, 포트",22,1],["cq01-13","프로그래밍 언어 수준과 번역기",19,2],["cq01-14","컴퓨터의 기능과 동작 과정",8,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nat9","nat10","nat11","nat12","nat13","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nbt8","nbt9","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","nct9","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","nar1","nar2","nar3","nar4","nar5","nar6","nbr1","nbr2","nbr3","nbr4","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ndr1","ndr2","nax1","nbx1","nbx2","nbx3","ncx1","ncx2","ncx3","ncx4","ncx5","ndx1","naa","naa1","naa2","naa3","naa4","nab","nab1","nab2","nab3","nac","nac1","nac2","nad","nad1","nad2","nad3","nad4","nad5","nad6","nad7","nad8","nba","nba1","nba2","nba3","nba4","nbb","nbb1","nbb2","nbb3","nbb4","nbc","nbc1","nbc2","nbc3","nbc4","nbd","nbd1","nbd2","nbd3","nbd4","nbe","nbe1","nbe2","nbe3","nbe4","nca","nca1","nca2","nca3","nca4","nca5","nca6","nca7","nca8","nca9","ncb","ncb1","ncb2","ncb3","ncb4","ncc","ncc1","ncc2","ncc3","ncc4","ncc5","ncd","ncd1","ncd2","ncd3","nce","nce1","nce2","nce3","nce4","nce5","ncf","ncf1","ncf2","nda","nda1","nda2","nda3","nda4","nda5","nda6","nda7","nda8","nda9","ndb","ndb1","ndb2","ndb3","ndb4","ndb5","ndc","ndc1","ndc2","ndc3","ndd","ndd1","ndd2","ndd3","ndd4","nde","nde1","nde2","nde3","ndf","ndf1","ndf2","ndf3","ndg","ndg1","ndg2","ndg3","ndg4","ndg5","ndh","ndh1","ndh2","ndh3","ndh4","ndh5","ndh6","ndi","ndi1","ndi2","ndi3","ndi4"],"boxLines":220},{"part":"cg02","unit":"comq-cg02","parent":"com-u1","topic":"컴일 cg02","title":"진법 변환과 수의 표현(보수, 부동소수점) (자체 제작)","short":"진법 변환과 수의 표현(보수, 부동소수점)","pre":"comq-cg02-","box":"com-cg02","n":310,"core":20,"folded":true,"points":19,"parts":[["cq02-1","진법의 자릿값과 2진, 8진, 16진 숫자",17,1],["cq02-2","10진 정수를 2진수, 8진수, 16진수로",10,1],["cq02-3","2진, 8진, 16진 사이의 변환(소수점 포함)",20,1],["cq02-4","진법이 섞인 계산과 크기 비교",11,1],["cq02-5","r의 보수와 (r−1)의 보수",18,1],["cq02-6","보수로 하는 뺄셈(부호 없는 수)",12,1],["cq02-7","부호 있는 2진 정수의 표현 방식",20,1],["cq02-8","2의 보수 만들기와 읽기",19,1],["cq02-9","n비트 정수의 표현 범위와 비트 수 늘리기",23,1],["cq02-10","소수점 있는 수의 진법 변환",18,1],["cq02-11","고정소수점, 부동소수점과 정규화",19,1],["cq02-12","바이어스된 지수와 비표준 형식",10,1],["cq02-13","IEEE 754 단정도와 배정도",23,1],["cq02-14","2의 보수 덧셈, 뺄셈과 오버플로",23,1],["cq02-15","2진 정수의 곱셈과 나눗셈",11,1],["cq02-16","부동소수점 수의 연산",17,1],["cq02-17","비트를 골라 세트하기, 지우기, 넣기",12,1],["cq02-18","비트 뒤집기와 두 데이터 비교",10,1],["cq02-19","시프트의 종류와 움직임",17,2]],"lines":["nat1","nat2","nbt1","nbt2","nbt3","nct1","nct2","ndt1","ndt2","ndt3","ndt4","ndt5","net1","net2","net3","net4","net5","nft1","nft2","nft3","nar1","nar2","nar3","nar4","nar5","nbr1","nbr2","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ncr7","ncr8","ncr9","ncr10","ncr11","ndr1","ndr2","ndr3","ndr4","ndr5","ner1","ner2","ner3","ner4","ner5","ner6","ner7","ner8","ner9","ner10","ner11","ner12","ner13","nfr1","nfr2","nfr3","nfr4","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","ncx1","ncx4","ndx1","ndx2","ndx3","nex1","nex2","nex3","nex4","nfx1","nfx2","nfx3","nfx4","naa","naa1","naa2","naa3","nab","nab1","nab2","nab3","nab4","nab5","nab6","nba","nba1","nba2","nba3","nba4","nba5","nba6","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbc","nbc1","nbc2","nbc3","nbc4","nca","nca1","nca2","nca3","nca4","nca5","ncb","ncb1","ncb2","ncb3","ncb4","nda","nda1","nda2","nda3","nda4","ndb","ndb1","ndb2","ndb3","ndc","ndc1","ndc2","ndc3","ndc4","ndd","ndd1","ndd2","ndd3","ndd4","nea","nea1","nea2","nea3","nea4","nea5","neb","neb1","neb2","neb3","neb4","nec","nec1","nec2","nec3","nfa","nfa1","nfa2","nfa3","nfa4","nfb","nfb1","nfb2","nfb3","nfb4","nfb5","nfc","nfc1","nfc2","nfc3","nfc4"],"boxLines":205},{"part":"cg03","unit":"comq-cg03","parent":"com-u1","topic":"컴일 cg03","title":"논리 회로(부울 대수, 게이트, 플립플롭) (자체 제작)","short":"논리 회로(부울 대수, 게이트, 플립플롭)","pre":"comq-cg03-","box":"com-cg03","n":272,"core":20,"folded":true,"points":17,"parts":[["cq03-1","기본 게이트의 진리표와 출력 계산",26,1],["cq03-2","범용 게이트와 3상 게이트",10,1],["cq03-3","부울 대수의 기본 법칙과 등식",27,1],["cq03-4","부울식 간소화(법칙 적용)",25,2],["cq03-5","부울 함수의 표준형 표현",15,1],["cq03-6","카르노 맵의 규칙",17,1],["cq03-7","카르노 맵으로 식 읽기와 간소화",14,1],["cq03-8","래치와 플립플롭의 개념, R-S 래치",11,1],["cq03-9","플립플롭 종류별 특성표와 다음 상태",23,2],["cq03-10","조합 논리회로와 순차 논리회로 가르기",11,2],["cq03-11","반가산기, 전가산기, 병렬 가산기",13,1],["cq03-12","감산기와 병렬 가감산기, 오버플로",10,1],["cq03-13","비교기와 패리티 발생기",10,1],["cq03-14","인코더와 디코더",13,1],["cq03-15","멀티플렉서와 디멀티플렉서",14,1],["cq03-16","레지스터와 시프트 레지스터",15,1],["cq03-17","카운터의 종류와 계수",18,1]],"lines":["nat1","nat2","nat3","nat4","nbt1","nbt2","nct1","nct2","nct3","nct4","nct5","nct6","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","net1","net2","net3","net4","net5","net6","net7","net8","net9","nft1","nft2","nft3","nft4","nft5","nft6","nar1","nar2","nar3","nar5","nar4","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","nbr8","ncr1","ncr2","ncr3","ndr1","ndr2","ndr3","ndr4","ner1","ner2","ner3","ner4","ner5","ner6","ner7","nfr1","nfr2","nfr3","nfr4","nfr5","nfr6","nfr7","nfr8","nfr9","nfr10","nfr11","nax1","nax2","nax3","nbx1","nbx2","nbx3","nbx4","ncx1","ncx2","ncx3","ndx1","ndx2","ndx3","ndx4","nfx1","nfx2","nfx3","nfx4","naa","naa1","naa2","naa3","naa4","naa5","naa6","naa7","nab","nab1","nab2","nab3","nba","nba1","nba2","nba3","nba4","nba5","nba6","nba7","nbb","nbb1","nbb2","nbb3","nbb4","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncb5","ncb6","ncc","ncc1","ncc2","ncc3","ncc4","ncc5","ncc6","ncc7","nda","nda1","nda2","nda3","nda4","ndb","ndb1","ndb2","ndb3","ndb4","ndc","ndc1","ndc2","ndc3","ndc4","nea","nea1","nea2","neb","neb1","neb2","neb3","neb4","neb5","neb6","nec","nec1","nec2","nec3","nec4","nfa","nfa1","nfa2","nfa3","nfa4","nfb","nfb1","nfb2","nfc","nfc1","nfc2","nfc3","nfc4","nfc5","nfc6","nfd","nfd1","nfd2","nfd3","nbw1","nbw2"],"boxLines":206},{"part":"cg04","unit":"comq-cg04","parent":"com-u2","topic":"컴일 cg04","title":"CPU, 레지스터, 명령어, 주소 지정, 성능 (자체 제작)","short":"CPU, 레지스터, 명령어, 주소 지정, 성능","pre":"comq-cg04-","box":"com-cg04","n":429,"core":20,"folded":true,"points":19,"parts":[["cq04-1","CPU의 구성과 내부 버스",22,1],["cq04-2","ALU의 구성과 연산 회로",35,1],["cq04-3","ALU의 상태 비트와 조건 코드",13,1],["cq04-4","CPU 레지스터의 종류와 역할",27,1],["cq04-5","CPU와 제어장치의 동작 단계",14,1],["cq04-6","CPU 처리 속도의 단위와 성능 요소",19,1],["cq04-7","명령어 사이클의 기본 흐름",23,1],["cq04-8","저급 언어와 어셈블리 프로그램",26,1],["cq04-9","명령어 집합, 분기, 서브루틴 호출",25,1],["cq04-10","주소 수에 따른 명령어와 프로그램 길이",22,1],["cq04-11","명령어의 필드와 비트 수",21,1],["cq04-12","RISC와 CISC",23,1],["cq04-13","주소 지정 방식(기본)",32,1],["cq04-14","변위 주소 지정 방식",19,1],["cq04-15","명령어 사이클의 부 사이클과 마이크로 연산",24,1],["cq04-16","제어장치의 구현 방식",14,1],["cq04-17","마이크로 프로그램 제어장치의 구성과 동작",27,1],["cq04-18","마이크로 명령어의 형식과 필드",20,1],["cq04-19","암달의 법칙과 CPU 실행 시간 계산",23,2]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","ndt9","ndt10","ndt11","net1","net2","net3","net4","net5","net6","net7","net8","nft1","nft2","nft3","nft4","nft5","ngt1","ngt2","ngt3","ngt4","ngt5","ngt6","ngt7","ngt8","ngt9","ngt10","nht1","nht2","nht3","nht4","nht5","nht6","nht7","nht8","nht9","nht10","nit1","nit2","nit3","nit4","nit5","nit6","nar1","nar2","nar3","nar4","nar5","nar6","nar7","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ncr7","ncr8","ncr9","ndr1","ndr2","ndr3","ner1","ner2","ner3","ner4","ner5","nfr1","nfr2","nfr3","ngr1","ngr2","ngr3","ngr4","ngr5","ngr6","ngr7","nhr1","nhr2","nhr3","nhr4","nhr5","nhr6","nhr7","nhr8","nhr9","nir1","nir2","nir3","nir4","nir5","nir6","nir7","nir8","nir9","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","ncx1","ncx2","ncx3","nex1","nex2","nex3","nex4","nfx1","nfx2","nfx3","ngx1","ngx2","ngx3","ngx4","nhx1","nhx2","nhx3","nhx4","nix1","nix2","nix3","nix4","nix5","nix6","naa","naa1","naa2","naa3","naa4","nab","nab1","nab2","nab3","nab4","nac","nac1","nac2","nac3","nad","nad1","nad2","nad3","nad4","nae","nae1","nae2","nae3","nae4","nba","nba1","nba2","nba3","nba4","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbc","nbc1","nbc2","nbc3","nbc4","nbc5","nbc6","nbc7","nbc8","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncb5","ncc","ncc1","ncc2","ncc3","ncc4","ncd","ncd1","ncd2","ncd3","ncd4","nce","nce1","nce2","nce3","ncf","ncf1","ncf2","ncf3","ncg","ncg1","ncg2","ncg3","ncg4","ncg5","ncg6","nch","nch1","nch2","nch3","nch4","nda","nda1","nda2","nda3","nda4","nda5","ndb","ndb1","ndb2","ndb3","ndb4","ndb5","ndc","ndc1","ndc2","ndc3","ndc4","ndd","ndd1","ndd2","ndd3","ndd4","nde","nde1","nde2","nde3","nde4","ndf","ndf1","ndf2","ndf3","ndg","ndg1","ndg2","ndg3","ndh","ndh1","ndh2","ndh3","ndh4","nea","nea1","nea2","nea3","nea4","neb","neb1","neb2","neb3","neb4","neb5","neb6","neb7","neb8","neb9","nec","nec1","nec2","nec3","nec4","nec5","nfa","nfa1","nfa2","nfa3","nfa4","nfa5","nfa6","nfa7","nfa8","nfa9","nfa10","nfa11","nfb","nfb1","nfb2","nfb3","nfb4","nfb5","nfb6","nga","nga1","nga2","nga3","nga4","nga5","nga6","ngb","ngb1","ngb2","ngb3","ngb4","ngc","ngc1","ngc2","ngc3","nha","nha1","nha2","nha3","nha4","nha5","nhb","nhb1","nhb2","nhb3","nhb4","nhb5","nhc","nhc1","nhc2","nhc3","nia","nia1","nia2","nib","nib1","nib2","nib3","nib4","nbw1","nbw2","nbw3"],"boxLines":406},{"part":"cg05","unit":"comq-cg05","parent":"com-u2","topic":"컴일 cg05","title":"파이프라인과 병렬 처리 (자체 제작)","short":"파이프라인과 병렬 처리","pre":"comq-cg05-","box":"com-cg05","n":140,"core":20,"folded":true,"points":9,"parts":[["cq05-1","명령어를 겹쳐 실행하는 기법의 뜻과 효과",13,3],["cq05-2","파이프라인 단계 구성",16,1],["cq05-3","파이프라인의 걸림돌과 해결",24,4],["cq05-4","파이프라인 실행 시간과 속도 향상",16,3],["cq05-5","명령어 여러 개를 한꺼번에 처리하는 구조",9,2],["cq05-6","플린(Flynn) 분류",22,3],["cq05-7","병렬 처리와 다중 프로세서 구조",17,2],["cq05-8","여러 컴퓨터를 묶은 시스템",17,1],["cq05-9","컴퓨터를 묶는 범위와 방식 견주기",6,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nar1","nar2","nar3","nar4","nar5","nar6","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","ncr1","ncr2","ncr3","nax1","nax4","nbx1","nbx2","nbx3","nbx4","nbx5","ncx1","ncx2","ncx3","naa","naa1","naa2","naa3","naa4","nab","nab1","nab2","nab3","nab4","nab5","nab6","nac","nac1","nac2","nac3","nad","nad1","nad2","nad3","nba","nba1","nba2","nba3","nba4","nbb","nbb1","nbb2","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncc","ncc1","ncc2","ncc3","ncc4","ncd","ncd1","ncd2","ncd3","ncd4"],"boxLines":123},{"part":"cg06","unit":"comq-cg06","parent":"com-u2","topic":"컴일 cg06","title":"기억장치와 캐시 (자체 제작)","short":"기억장치와 캐시","pre":"comq-cg06-","box":"com-cg06","n":364,"core":20,"folded":true,"points":19,"parts":[["cq06-1","기억장치의 성능 요소와 접근 방식",20,1],["cq06-2","기억장치 계층 구조와 속도 순서",19,1],["cq06-3","주기억장치의 구조, MAR/MBR 동작, 영역 구분",12,1],["cq06-4","주기억장치 할당과 적합 알고리즘",17,1],["cq06-5","기억장치 용량과 주소선, 데이터선 수",18,1],["cq06-6","RAM의 종류와 특성",27,1],["cq06-7","RAM 칩의 내부 조직과 주소 비트",12,1],["cq06-8","ROM의 쓰임, 구조, 종류",23,1],["cq06-9","플래시 메모리의 특성과 종류",21,1],["cq06-10","기억장치 확장: 칩 개수와 연결 방식",23,1],["cq06-11","캐시의 원리와 동작",20,1],["cq06-12","평균 기억장치 접근 시간과 적중률 계산",20,1],["cq06-13","캐시 크기, 인출 방식, 블록 크기",11,1],["cq06-14","캐시 사상 방식과 주소 필드 계산",40,1],["cq06-15","캐시 교체 알고리즘",20,2],["cq06-16","캐시 쓰기 정책",16,1],["cq06-17","다단계 캐시와 평균 접근 시간",18,1],["cq06-18","캐시를 두는 위치와 용도별 구성",9,1],["cq06-19","멀티프로세서의 캐시 불일치와 일관성 유지",18,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nat9","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nct1","nct2","nct3","nct4","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","net1","net2","net3","net4","net5","net6","net7","nft1","nft2","nft3","nft4","nft5","nft6","nft7","nft8","nft9","nar1","nar2","nar3","nar4","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","ncr1","ncr2","ncr3","ncr4","ndr1","ndr2","ndr3","ndr4","ndr5","ner1","ner2","ner3","ner4","ner5","ner6","nfr1","nfr2","nfr3","nfr4","nax1","nax2","nax3","nax4","nax5","nbx1","nbx2","nbx3","nbx4","nbx5","ncx2","ndx1","ndx2","ndx3","nex1","nex2","nex3","nex4","nfx1","naa","naa1","naa2","naa3","naa4","naa5","naa6","nab","nab1","nab2","nab3","nab4","nac","nac1","nac2","nac3","nac4","nad","nad1","nad2","nad3","nad4","nae","nae1","nae2","nae3","naf","naf1","naf2","naf3","nba","nba1","nba2","nba3","nba4","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbc","nbc1","nbc2","nbc3","nbd","nbd1","nbd2","nbd3","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncb5","ncb6","ncb7","ncc","ncc1","ncc2","ncc3","ncc4","ncc5","ncd","ncd1","ncd2","ncd3","ncd4","nda","nda1","nda2","nda3","nda4","nda5","nea","nea1","nea2","nea3","nea4","nea5","neb","neb1","neb2","neb3","neb4","neb5","nec","nec1","nec2","nec3","nfa","nfa1","nfa2","nfa3","nfb","nfb1","nfb2","nfb3","nfc","nfc1","nfc2","nfc3","naw1","naw2","naw3","naw4","ncw1"],"boxLines":234},{"part":"cg07","unit":"comq-cg07","parent":"com-u2","topic":"컴일 cg07","title":"보조기억장치, RAID, 입출력, 버스, 인터럽트 (자체 제작)","short":"보조기억장치, RAID, 입출력, 버스, 인터럽트","pre":"comq-cg07-","box":"com-cg07","n":339,"core":20,"folded":true,"points":17,"parts":[["cq07-1","보조기억장치의 자리와 부팅 순서",16,1],["cq07-2","RAID의 뜻과 기본 구성",34,1],["cq07-3","RAID 검사 정보와 패리티 계산",23,1],["cq07-4","RAID 패리티 배치와 용량",22,2],["cq07-5","결합 RAID의 구성과 용량",15,1],["cq07-6","SSD의 구조와 관리 기능",12,1],["cq07-7","입출력 모듈이 필요한 까닭과 하는 일",19,1],["cq07-8","입출력장치의 연결과 주소 지정",17,1],["cq07-9","입출력 비동기 전송의 제어 신호",18,1],["cq07-10","입출력 제어 방식의 비교",19,1],["cq07-11","인터럽트의 종류와 처리 순서",21,2],["cq07-12","인터럽트를 요구한 장치 찾기",28,1],["cq07-13","DMA 방식의 동작과 제어기",31,1],["cq07-14","입출력 프로세서와 채널",17,1],["cq07-15","시스템 버스의 구성과 폭",23,2],["cq07-16","버스 제어 신호와 동작 시간, 확장 버스",15,1],["cq07-17","임베디드 시스템",9,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","net1","net2","net3","net4","net5","net6","net7","net8","net9","nft1","nft2","nft3","nft4","nft5","nft6","nft7","nft8","nft9","nft10","nft11","nft12","nft13","nft14","nft15","nft16","nar1","nar2","nar3","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","ncr1","ncr2","ncr3","ncr4","ndr1","ndr2","ndr3","ndr4","ndr5","ndr6","ner1","ner2","ner3","ner4","ner5","ner6","ner7","nfr1","nfr2","nfr3","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","nbx5","ncx1","ncx2","ncx3","ncx4","ndx1","ndx4","nex1","nex2","nex3","nex4","nfx1","nfx4","nfx5","naa","naa1","naa2","naa3","naa4","naa5","nab","nab1","nab2","nab3","nab4","nab5","nab6","nba","nba1","nba2","nba3","nba4","nba5","nba6","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncb5","ncb6","ncb7","ncb8","ncb9","ncc","ncc1","ncc2","ncc3","ncc4","ncd","ncd1","ncd2","ncd3","ncd4","ncd5","nce","nce1","nce2","nce3","nce4","nda","nda1","nda2","nda3","nda4","ndb","ndb1","ndb2","ndb3","ndb4","ndc","ndc1","ndc2","ndc3","ndc4","ndc5","ndc6","nea","nea1","nea2","nea3","nea4","neb","neb1","neb2","neb3","nec","nec1","nec2","nec3","nec4","ned","ned1","ned2","ned3","nfa","nfa1","nfa2","nfa3","nfb","nfb1","nfb2","nfb3","nfb4"],"boxLines":234},{"part":"cg17","unit":"comq-cg17","parent":"com-u6","topic":"컴일 cg17","title":"OSI와 TCP/IP 계층 모델 (자체 제작)","short":"OSI와 TCP/IP 계층 모델","pre":"comq-cg17-","box":"com-cg17","n":268,"core":20,"folded":true,"points":15,"parts":[["cq17-1","OSI 모델의 틀과 계층 묶음",19,1],["cq17-2","헤더와 트레일러 붙이고 떼기",11,1],["cq17-3","OSI 계층별 기능",88,5],["cq17-4","프로토콜의 요소와 일반 기능",12,1],["cq17-5","프로토콜은 어느 계층인가(OSI)",29,1],["cq17-6","장비는 어느 OSI 계층인가",15,2],["cq17-7","TCP/IP 계층과 OSI의 대응",27,2],["cq17-8","IP와 보조 프로토콜 가르기",21,2],["cq17-9","계층별 전송 단위의 이름",14,2],["cq17-10","계층마다 쓰는 주소의 갈래",21,2],["cq17-11","라우터의 길 찾기와 라우팅 프로토콜",11,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nct1","nct2","nct3","nct4","nct5","nct6","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","ndt9","ndt10","ndt11","ndt12","ndt13","nar1","nar2","nar3","nbr1","nbr2","nbr3","nbr4","nbr6","nbr5","ncr1","ncr2","ncr3","ncr4","ncr5","ndr1","ndr2","ndr3","ndr4","ndr5","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","ncx1","ncx2","ncx3","ncx4","ndx1","ndx2","ndx3","ndx4","ndx5","naa","naa1","naa2","naa3","naa4","naa5","nab","nab1","nab2","nab3","nab4","nac","nac1","nac2","nac3","nac4","nac5","nac6","nac7","nac8","nad","nad1","nad2","nad3","nad4","nad5","nad6","nad7","nad8","nba","nba1","nba2","nba3","nba4","nba5","nba6","nba7","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbc","nbc1","nbc2","nbc3","nbd","nbd1","nbd2","nbd3","nbd4","nbd5","nbd6","nbd7","nbe","nbe1","nbe2","nbe3","nbe4","nbe5","nbe6","nbe7","nca","nca1","nca2","nca3","nca4","nca5","ncb","ncb1","ncb2","ncb3","ncb4","ncc","ncc1","ncc2","ncc3","ncc4","nda","nda1","nda2","nda3","nda4","nda5","ndb","ndb1","ndb2","ndb3","ndb4","ndb5","ndc","ndc1","ndc2","ndc3"],"boxLines":190},{"part":"cg18","unit":"comq-cg18","parent":"com-u6","topic":"컴일 cg18","title":"응용 계층과 전송 계층 프로토콜, 오류 제어와 흐름 제어 (자체 제작)","short":"응용 계층과 전송 계층 프로토콜, 오류 제어와 흐름 제어","pre":"comq-cg18-","box":"com-cg18","n":333,"core":20,"folded":true,"points":18,"parts":[["cq18-1","응용 계층 프로토콜과 TCP, UDP 위의 서비스",18,1],["cq18-2","전송 계층 프로토콜 견주기",22,1],["cq18-3","TCP와 UDP 헤더의 필드",26,1],["cq18-4","TCP 헤더의 플래그 비트",13,1],["cq18-5","TCP의 전송률 조절과 그 기법",20,1],["cq18-6","TCP의 수신 측 맞춤 전송과 타이머",14,1],["cq18-7","전송 오류의 종류와 검출의 바탕",12,1],["cq18-8","패리티로 하는 오류 검출",24,1],["cq18-9","덧셈으로 하는 오류 검출",13,1],["cq18-10","오류 검출 방식의 절차와 계산",21,2],["cq18-11","오류를 바로잡는 방법과 부호",16,1],["cq18-12","해밍 코드 계산",28,1],["cq18-13","데이터 링크 제어: 세 기능과 보낼 차례",18,1],["cq18-14","데이터 링크 제어: 보내는 양 다루기",21,1],["cq18-15","데이터 링크 제어: 오류 다루기와 프레임",14,1],["cq18-16","정지-대기 방식의 재전송과 확인응답",12,1],["cq18-17","슬라이딩 윈도우 ARQ의 재전송 방식",24,2],["cq18-18","데이터 링크 프로토콜의 갈래",17,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","ndt9","net1","net2","net3","net4","net5","net6","net7","net8","nft1","nft2","nft3","nft4","nft5","nar1","nar2","nar3","nar4","nar5","nar6","nbr1","nbr2","nbr3","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ncr7","ncr8","ncr9","ncr10","ncr11","ncr12","ncr13","ndr1","ndr2","ndr3","ndr4","ndr5","ndr6","ndr8","ndr7","ner1","ner2","ner3","ner4","ner5","nfr1","nfr2","nfr3","nfr4","nfr5","nax1","nax4","nbx1","nbx2","ncx1","ncx2","ncx3","ndx1","ndx2","ndx3","ndx4","nex1","nex2","nex3","nex4","nfx1","nfx2","nfx3","nfx4","naa","naa1","naa2","naa3","naa4","naa5","naa6","nab","nab1","nab2","nab3","nab4","nab5","nab6","nac","nac1","nac2","nac3","nac4","nba","nba1","nba2","nba3","nba4","nba5","nba6","nba7","nbb","nbb1","nbb2","nbb3","nbb4","nca","nca1","nca2","nca3","nca4","nca5","nda","nda1","nda2","nda3","ndb","ndb1","ndb2","ndb3","ndb4","ndc","ndc1","ndc2","ndc3","ndc4","ndd","ndd1","ndd2","ndd3","ndd4","nea","nea1","nea2","nea3","neb","neb1","neb2","neb3","neb4","nec","nec1","nec2","nec3","nfa","nfa1","nfa2","nfa3","nfb","nfb1","nfb2","nfb3","nfb4","nfc","nfc1","nfc2","nfc3","nfd","nfd1","nfd2","nfe","nfe1","nfe2"],"boxLines":213},{"part":"cg19","unit":"comq-cg19","parent":"com-u6","topic":"컴일 cg19","title":"IP 주소와 서브네팅 (자체 제작)","short":"IP 주소와 서브네팅","pre":"comq-cg19-","box":"com-cg19","n":285,"core":20,"folded":true,"points":13,"parts":[["cq19-1","주소의 종류와 길이",21,2],["cq19-2","서브넷 마스크와 접두사 길이",28,2],["cq19-3","호스트 수와 서브넷 수 계산",35,2],["cq19-4","서브넷의 주소 범위 구하기",27,2],["cq19-5","접두사 길이와 주소 묶기",14,1],["cq19-6","IPv4 헤더의 필드",27,1],["cq19-7","데이터그램 쪼개기와 오프셋 계산",28,1],["cq19-8","IP 프로토콜의 특징",11,1],["cq19-9","IPv4 클래스 판별과 크기",35,2],["cq19-10","IPv6의 주소, 헤더, 특징",22,3],["cq19-11","IPv6 주소 표기와 IPv4 주소 담기",15,1],["cq19-12","IPv6 전환 기술",8,1],["cq19-13","IPv6 주소의 종류와 받는 대상",14,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nbt1","nbt2","nbt3","nbt4","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","nar1","nar2","nar3","nar4","nar5","nar6","nar7","nar8","nar9","nar10","nar11","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","nbr8","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ncr7","ncr8","ncr9","ndr1","ndr2","ndr3","ndr4","ndr5","ndr6","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","nbx5","ncx1","ncx2","ncx3","ndx1","ndx2","naa","naa1","naa2","naa3","naa4","nab","nab1","nab2","nab3","nab4","nab5","nab6","nab7","nab8","nab9","nac","nac1","nac2","nac3","nac4","nac5","nac6","nac7","nac8","nac9","nac10","nac11","nac12","nac13","nac14","nac15","nac16","nac17","nac18","nac19","nac20","nad","nad1","nad2","nad3","nad4","nad5","nad6","nad7","nad8","nad9","nad10","nad11","nad12","nad13","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbb7","nbc","nbc1","nbc2","nbc3","nbc4","nbc5","nba","nba1","nba2","nba3","nba4","nba5","nba6","nba7","nba8","nba9","nba10","nba11","nbd","nbd1","nbd2","nbd3","nbd4","nbd5","nbd6","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","nda","nda1","nda2","nda3","nda4","nda5","ndb","ndb1","ndb2","ndb3","ndc","ndc1","ndc2","ndc3","ndd","ndd1","ndd2","ndd3","nde","nde1","nde2","nde3"],"boxLines":206},{"part":"cg20","unit":"comq-cg20","parent":"com-u6","topic":"컴일 cg20","title":"네트워크 장비, 토폴로지, 전송, 매체 접근, 무선 (자체 제작)","short":"네트워크 장비, 토폴로지, 전송, 매체 접근, 무선","pre":"comq-cg20-","box":"com-cg20","n":321,"core":20,"folded":true,"points":19,"parts":[["cq20-1","회선 구성: 점-대-점, 다중점, 교환",9,1],["cq20-2","토폴로지의 모양과 회선 수",24,1],["cq20-3","토폴로지별 장단점 비교",26,1],["cq20-4","두 장치가 주고받는 전송 방식",10,1],["cq20-5","규모로 나눈 네트워크와 인터넷",15,1],["cq20-6","이더넷 표준과 MAC 주소, 부계층",20,1],["cq20-7","이더넷의 매체 접근과 충돌 처리",20,1],["cq20-8","이더넷 프레임의 필드와 길이",19,1],["cq20-9","이더넷의 발전과 충돌 영역",13,1],["cq20-10","교환의 뜻과 전화망의 교환 방식",13,1],["cq20-11","데이터를 나눠 보내는 교환의 갈래",16,1],["cq20-12","교환 방식 견주기와 프레임 전달",13,1],["cq20-13","무선 랜의 매체 접근과 단말 문제",22,1],["cq20-14","무선 LAN 802.11 규격 비교",23,1],["cq20-15","기반 시설 없는 무선망의 특성",15,1],["cq20-16","기반 시설 없는 무선망의 라우팅",6,1],["cq20-17","무선 PAN 기술 비교",19,1],["cq20-18","디지털 데이터 전송 방식의 갈래",7,1],["cq20-19","네트워크 장비와 동작 계층 — 계층별 스위치",31,2]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nat9","nat10","nat11","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","ndt9","ndt10","ndt11","ndt12","ndt13","ndt14","ndt15","net1","net2","net3","net4","net5","nft1","nft2","nft3","nft4","nft5","nft6","nft7","nft8","nar1","nar2","nar3","nar4","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","nbr9","nbr8","ncr1","ncr2","ncr3","ncr4","ndr1","ndr2","ndr3","ndr4","ndr5","ner1","ner2","ner3","nfr1","nfr2","nfr3","nfr4","nfr5","nfr6","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","ncx1","ncx2","ncx3","ncx4","ndx1","ndx2","ndx3","ndx4","nex1","nex2","nex3","nex4","nfx1","nfx2","nfx3","nfx4","naa","naa1","naa2","naa3","naa4","naa5","nab","nab1","nab2","nab3","nab4","nab5","nba","nba1","nba2","nba3","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbc","nbc1","nbc2","nbd","nbd1","nbd2","nbd3","nca","nca1","nca2","nca3","nca4","nca5","nca6","nca7","ncb","ncb1","ncb2","ncb3","ncb4","ncc","ncc1","ncc2","ncc3","ncc4","ncd","ncd1","ncd2","ncd3","ncd4","ncd5","ncd6","ncd7","nda","nda1","nda2","nda3","ndb","ndb1","ndb2","ndb3","ndb4","ndb5","ndc","ndc1","ndc2","nea","nea1","nea2","nea3","nea4","nea5","neb","neb1","neb2","neb3","neb4","nec","nec1","nec2","nec3","nec4","nec5","nec6","nec7","nec8","nec9","ned","ned1","ned2","ned3","nfa","nfa1","nfa2","nfa3","nfb","nfb1","nfb2","nfb3","nfb4","nfc","nfc1","nfc2","nfc3","nfc4","nfc5","nfd","nfd1","nfd2","nfd3","nfd4","nfe","nfe1","nfe2","nfe3","nfe4"],"boxLines":261}]/*END-COMQ-SPEC*/,S='컴퓨터일반';
  for(const s of SPEC){const u=units.find(x=>x.id===s.unit),want=Array.from({length:s.core},(_,i)=>s.pre+String(i+1).padStart(3,'0'));
   if(s.folded)assert.deepEqual([...u.core].sort(),want,s.unit+' 핵심 = 001~020');else assert.ok(!u,s.unit+': 20문제 이하 단원은 접지 않는다(core-units.js에 없음)');
   assert.equal(A.R(`data.cards.filter(c=>isPlayable(c)&&PRACTICE_BANK[c.id]?.topic===${JSON.stringify(s.topic)}).length`),s.core,s.unit+' 보이는 문제');}
  A.R("go('range','"+S+"')");
  const list=A.node('#rangeList'),heads=list.all.filter(n=>n.className==='range-heading').map(n=>n._text),crow=t=>{const b=list.all.find(n=>n.tag==='button'&&n.children[0]?._text===t);return b?.children[1]?._text;};
  const parents=[...new Set(SPEC.map(s=>s.parent))].map(id=>A.R(`STUDY_PARTS.units.find(u=>u.id===${JSON.stringify(id)}).title`));
  for(const p of parents)assert.ok(heads.includes('자체 제작: '+p),'범위 묶음: 자체 제작: '+p+' / '+heads.join(' | '));
  assert.equal(heads.filter(h=>h.startsWith('자체 제작: ')).length,parents.length,'자체 제작 묶음은 문제가 있는 단원만');assert.ok(heads.some(h=>/^기출: 회차별 \(\d+회차\)$/.test(h)),'기출 회차 묶음은 그대로');
  assert.ok(heads.findIndex(h=>h.startsWith('자체 제작: '))<heads.findIndex(h=>h.startsWith('기출: 회차별')),'자체 제작이 기출 회차보다 먼저');
  for(const s of SPEC)assert.equal(crow(s.short),'풀어야 할 문제 '+s.core+'/'+s.core+', 첫 시도 0/'+s.core+(s.folded?', 더 풀기 '+(s.n-20)+'문제':''),s.unit+' 범위 줄');
  for(const s of SPEC){openU({subject:S,topic:s.topic,round:''});assert.equal(A.R(cur+'.length'),s.core,s.unit+' 범위 = 보이는 문제');assert.equal(A.R('scopeLabel(scopeOf())'),S+' '+s.title,s.unit+' 범위 이름');
   assert.equal(A.node('#moreLabel').hidden,!s.folded,s.unit+': 더 풀기는 접힌 문제가 있을 때만');
   if(s.folded){toggle(true);assert.equal(A.R(cur+'.length'),s.n,s.unit+': 켜면 전부');assert.match(text(A.node('#message')),/ \(자체 제작\) — 이 단원의 나머지 문제도 함께 풀어요\.$/);assert.ok(!BANNED.test(text(A.node('#message'))));
    A.R("go('range','"+S+"')");assert.equal(crow(s.short),'풀어야 할 문제 '+s.n+'/'+s.n+', 첫 시도 0/'+s.n+', 이 단원 문제 더 풀기 켬',s.unit+' 켠 뒤 범위 줄');
    openU({subject:S,topic:s.topic,round:''});toggle(false);assert.equal(A.R(cur+'.length'),20,s.unit+': 끄면 핵심 20');}
   for(const [pid,title,size,vis] of s.parts){openU({subject:S,topic:'',round:'part-'+pid});assert.equal(A.R(cur+'.length'),vis,pid+' 파트 범위 = 그 파트의 보이는 문제');assert.equal(A.R('scopeLabel(scopeOf())'),S+' '+s.short+': '+title,pid+' 파트 범위 이름');
    assert.equal(text(A.node('#moreCount')),size>vis?'('+(size-vis)+'문제)':'',pid+' 파트의 더 풀기 수');assert.ok(vis>=1,pid+': 파트가 통째로 접히지 않는다');assert.deepEqual(A.J(`partBasics(PARTS.part(${JSON.stringify(pid)}))`),[s.box],pid+' 파트의 기초 개념 상자');}}
  A.R("go('parts','"+S+"')");{const b=A.node('#partsBody');assert.equal(b.children[0].children[0].textContent,'파트 = 같은 주제를 묻는 9급 기출과 자체 제작 문제 묶음 (누르면 그 파트만 풀어요)');
   for(const s of SPEC){const f=b.children.find(c=>c.dataset?.unit===s.unit);assert.ok(f,s.unit+' 파트별 상태 묶음');assert.equal(text(f.children[0]),s.title+': '+s.parts.length+'파트, '+s.core+'문제');
    for(const [pid,title,size,vis] of s.parts){const item=b.all.find(n=>n.dataset?.part===pid);assert.ok(item,pid+' 파트 줄');assert.equal(item.children[0].textContent,title);assert.match(item.children[1].textContent,new RegExp('^'+vis+'문제, 외움 0, '));assert.ok(b.all.some(n=>n.dataset?.basics===pid),pid+' 기초 개념 보기');}}
   assert.ok(!BANNED.test(text(b)),'파트별 상태에 내부 낱말 없음');}
  assert.deepEqual(A.J(`selfGroups('${S}').map(g=>[g.id,g.ids.length])`),SPEC.flatMap(s=>s.parts.map(p=>[p[0],p[3]])),'자체제작 뱃지 묶음 = 자체 제작 파트(보이는 문제만)');
  assert.equal(A.R(`footerText('${S}')`),'자체 제작 복습 문제, 인사혁신처 공개 9급 기출','출처 줄');
  for(const s of SPEC){const ids=Array.from({length:s.n},(_,i)=>s.pre+String(i+1).padStart(3,'0')),groups=new Set(ids.map(id=>A.R(`ReviewPolicy.concept(${JSON.stringify(id)})`)));
   assert.equal(groups.size,s.points,s.unit+': 요점 하나 = 쌍둥이 묶음 하나');assert.ok(ids.every(id=>A.R(`ReviewPolicy.concept(${JSON.stringify(id)})`)!==id),s.unit+': 모든 문제가 묶음에 있다');}
  // 코드 · 표 발문: 줄바꿈과 줄 머리 공백(들여쓰기)이 글자 그대로 화면 요소에 들어가고(고정폭 자료 상자만 모든 줄에 같이 붙은 앞 공백을 뗀다 — 줄끼리의 들여쓰기 차이는 그대로), 그 요소들은 white-space:pre-wrap으로 그린다(발문 · 자료 상자 · 보기 · 해설).
  assert.ok(A.R(`Object.keys(PRACTICE_BANK).filter(id=>id.startsWith('comq-')).every(id=>{const q=PRACTICE_BANK[id].variants[0].question;const NL=String.fromCharCode(10),ns=questionNodes(q),at=q.indexOf(NL+NL+'[');if(at<0)return ns.length===1&&ns[0]._text===q;const a=q.slice(at+2).split(NL),b=ns[1]._text.split(NL),cut=a.map((l,i)=>l.length-(b[i]||'').length),body=cut.filter((c,i)=>i>0&&a[i].trim());return ns[0]._text===q.slice(0,at)&&a.length===b.length&&a[0]===b[0]&&a.every((l,i)=>l.endsWith(b[i]))&&new Set(body).size<=1&&(ns[1].className.includes('mono')||cut.every(c=>c===0));})`),'발문이 글자 그대로(줄바꿈 · 들여쓰기 포함) 화면 요소에 들어간다');
  {const css=fs.readFileSync(__dirname+'/style.css','utf8');for(const sel of ['.question','.quiz-choices button','.question-clue','.explanation-text'])assert.match(css,new RegExp('(^|\\n)'+sel.replace(/[.]/g,'\\.')+' \\{[^}]*white-space: ?pre-wrap'),sel+'는 줄바꿈 · 들여쓰기를 그대로 그린다');}}
 // 한국사는 그대로: 12강 20 · '이 강 문제 더 풀기 (167문제)'
 A.R("openScope({subject:'한국사',topic:'',round:'lecture-12'})");assert.equal(A.R(cur+'.length'),20);assert.equal(text(A.node('#moreText')),'이 강 문제 더 풀기');assert.equal(text(A.node('#moreCount')),'(167문제)');
 // 배포: 앱 파일 목록(index.html · sw.js · pages.yml)에 core-units.js
 {const html=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8'),yml=fs.readFileSync(__dirname+'/.github/workflows/pages.yml','utf8'),v=(html.match(/core-units\.js\?v=(\d+)/)||[])[1];
  assert.ok(v&&html.indexOf('core-units.js?v=')<html.indexOf('src="app.js'),'index.html: core-units.js를 app.js 앞에서 읽는다');assert.ok(sw.includes("'./core-units.js?v="+v+"'"),'sw.js가 core-units.js를 담는다');assert.ok(/cp [^\n]*\bcore-units\.js\b/.test(yml),'Pages 배포에 core-units.js');
  assert.ok(html.includes('<span id="moreText">이 강 문제 더 풀기</span>'));}
 console.log('PASS core20 영어 · 국어: 44단원 × 핵심 20(단원 순서 · 파트마다 하나 이상 · 쌍둥이 한 번), 접힌 영어 '+folded['영어']+' · 국어 '+folded['국어']+'문제는 풀 수 없고 수 · 파트 · 대기열 밖, '+
  "'이 단원 문제 더 풀기' 켜기/끄기, 모두 접힌 문법 공식은 목록에 남고 '이 공식 문제 더 풀기'로 그 공식만, 핵심을 다 풀면 끝 화면 버튼, 새로고침 뒤 유지 · 잘못된 설정 거부, 한국사 그대로, 배포 목록");
}
