// app.js를 가짜 DOM 위에서 실제로 돌려, 화면·기록·복습 일정이 어떻게 맞물리는지 확인한다.
// 문제 하나가 카드 하나다. 평소 모드는 문법 포인트마다 한 문제씩 낸 뒤 같은 포인트의 나머지를 형제 간격 뒤로 미룬다.
// 기출 회차는 대기열을 거치지 않고 원문 순서대로 낸다. 화면의 모든 수는 "문제" 한 단위다.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function el(tag='div'){
 const node={tag,children:[],attrs:{},dataset:{},classes:new Set(),_text:'',hidden:false,disabled:false,open:false,
  get textContent(){return node._text;},set textContent(v){node._text=String(v);node.children=[];},
  append(...k){node.children.push(...k);},replaceChildren(...k){node.children=k;},
  classList:{add:c=>node.classes.add(c),remove:c=>node.classes.delete(c),toggle:(c,on)=>on?node.classes.add(c):node.classes.delete(c),contains:c=>node.classes.has(c)},
  setAttribute(k,v){node.attrs[k]=v;},getAttribute(k){return node.attrs[k];},focus(){},setSelectionRange(){},addEventListener(){},
  querySelector(sel){return sel==='summary'?el('summary'):null;},querySelectorAll(){return [];},
  get all(){const out=[];(function walk(n){for(const c of n.children){out.push(c);walk(c);}})(node);return out;}};
 return node;
}
const nodes=new Map(),store=new Map();
const doc={createElement:tag=>el(tag),createTextNode(t){const n=el('#text');n._text=String(t);return n;},body:el('body'),activeElement:null,
 querySelector(sel){if(!nodes.has(sel))nodes.set(sel,el(sel));return nodes.get(sel);},querySelectorAll(){return [];},addEventListener(){}};
const ctx={document:doc,console,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
 crypto:{randomUUID:()=>'id-'+(store.size+Math.random()).toString(16).replace('.','-')},
 history:{state:{depth:0},pushState(s){this.state=s;},replaceState(s){this.state=s;}},
 navigator:{},setInterval:()=>1,clearInterval(){},structuredClone,addEventListener(){},dispatchEvent(){},scrollTo(){},
 Date,JSON,Math,Set,Map,Number,String,Object,Array,Error,RegExp,Intl,Promise,Event:class{constructor(t){this.type=t;}}};
ctx.window=ctx;ctx.self=ctx;
vm.createContext(ctx);
// 기출 회차 파일은 앱이 필요할 때 fetch로 받는다. 가짜 fetch는 저장소의 gichul/<id>.json을 돌려주고, 받은 주소를 모두 남긴다.
const fetched=[];let failNextFetch=false;
ctx.fetch=url=>{fetched.push(url);if(failNextFetch){failNextFetch=false;return Promise.resolve({ok:false,status:503,json:()=>Promise.reject(Error('no body'))});}
 const m=/^gichul\/([a-z0-9-]+)\.json$/.exec(url);if(!m)return Promise.reject(Error('unexpected fetch '+url));
 return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(require('./gichul-files.cjs').read(m[1]))});};
const flush=()=>new Promise(r=>setImmediate(r));
for(const f of ['scheduler.js','learning.js','core-review-pack.js','quiz-options.js','hanneung-data.js','hanneung-explanations.js','hanneung.js','gichul-index.js','gichul.js','practice-bank.js','practice.js','content-corrections.js','review-record.js','review-policy.js','sync-core.js','study-credit.js','xp.js','score.js','study-review-catalog.js','hanneung-topics.js','topics.js','parts.js','part-check.js','memorize.js','app.js'])
 vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx,{filename:f});
const run=code=>vm.runInContext(code,ctx);
// 시작할 때는 회차 파일을 하나도 받지 않는다. 그래도 카드·과목 문항 수는 색인으로 모든 기출 문항을 센다.
assert.deepEqual(fetched,[],'앱을 열 때 기출 회차 파일을 받지 않는다');
const indexedComputer=run("Gichul.forSubject('컴퓨터일반').reduce((n,p)=>n+p.numbers.length,0)");
assert.equal(run("questionCount(data.cards.filter(c=>isPlayable(c)&&c.subject==='컴퓨터일반'))"),indexedComputer,'받지 않은 회차의 문항도 과목 문항 수에 들어간다');
assert.equal(run("Object.keys(QUIZ_OPTIONS).filter(id=>id.startsWith('gichul-')).length"),0,'받기 전에는 기출 보기가 없다');
const screen=()=>nodes.get('#card').all.map(n=>n._text).filter(Boolean).join(' | ');
// 채점 뒤 해설 화면에서 "다음 문제"를 누른 것과 같다.
const next=()=>run("(()=>{const s=structuredClone(data);delete s.quizFeedback;delete s.activePractice;commit(s);render();})()");
const answerCurrent=wrong=>{
 const quiz=run('data.activePractice.exercise'),id=run('data.activePractice.cardId');
 const input=quiz.type==='choice'?(wrong?(quiz.correctIndex+1)%quiz.choices.length:quiz.correctIndex):(wrong?'zzz not the answer':quiz.answers[0]);
 run('answerPractice('+JSON.stringify(id)+','+JSON.stringify(input)+')');
 assert.equal(run('data.quizFeedback.result'),wrong?'wrong':'correct','채점 결과가 의도와 다르다');
 next();
};

// 1) 평소 모드: 문제집 Day 1 범위를 풀 수 있는 데까지 푼다(전부 맞힌다).
run("openScope({subject:'영어',topic:'Day 1'})");
const total=run("questionCount(data.cards.filter(c=>isPlayable(c)&&inCurrent(c)))");
const cardCount=run("data.cards.filter(c=>isPlayable(c)&&inCurrent(c)).length");
assert.equal(total,60,'Day 1 범위는 준비된 60문제');
assert.equal(cardCount,total,'문제 하나가 카드 하나: 카드 '+cardCount+'장 · 문제 '+total+'개');
const countNow=()=>run("countLine(data.cards.filter(c=>isPlayable(c)&&inCurrent(c)))");
assert.equal(countNow(),'풀어야 할 문제 60/60','처음에는 60문제가 모두 지금 풀 차례');
const points=run("new Set(data.cards.filter(c=>isPlayable(c)&&inCurrent(c)).map(c=>ReviewPolicy.concept(c.id))).size");
assert.equal(points,24,'Day 1 문법 포인트 24개');
let normal=0;while(run('data.activePractice')&&normal<total){answerCurrent(false);normal++;}
// v56까지는 카드 12장이 129문항을 돌려 내서 8문제 만에 막혔다. v57에서는 문법 포인트마다 한 문제씩 24문제 뒤 형제 간격으로 막혔다.
// 지금은 같은 개념 간격이 다른 문제가 있을 때만 사이를 벌리고, 풀 문제가 같은 개념뿐이면 막지 않는다. 60문제가 모두 이어서 나온다.
assert.equal(normal,total,'평소 모드에서 60문제가 막힘 없이 모두 나온다 ('+normal+'문제)');
assert.ok(!/비슷한 내용은 잠시 뒤/.test(screen()),'같은 개념 간격 때문에 막힌 화면이 뜨지 않는다: '+screen().slice(0,60));
assert.ok(!nodes.get('#retryStatus')._text.includes('같은 개념의 문제'),'같은 개념 대기 안내가 남지 않는다: '+nodes.get('#retryStatus')._text);
// 첫 화면·과목·범위·진행상황의 수도 같은 단위("문제")다. 어느 화면에도 "문항"·"카드"라는 말이 나오지 않는다.
{
 const texts=sel=>[nodes.get(sel)._text,...nodes.get(sel).all.map(n=>n._text)].filter(Boolean).join(' | ');
 const menuDetail=(sel,title)=>{const b=nodes.get(sel).all.find(n=>n.tag==='button'&&n.children[0]?._text===title);return b?.children[1]?._text;};
 const en="data.cards.filter(c=>isPlayable(c)&&c.subject==='영어')";
 const enLine='풀어야 할 문제 '+run('questionCount(reviewQueue('+en+').ready)')+'/'+run('questionCount('+en+')');
 run("go('home')");assert.equal(menuDetail('#subjectList','영어'),enLine,'첫 화면 과목 줄');
 run("go('subject','영어')");assert.equal(nodes.get('#subjectSummary')._text,enLine+' · 오늘 푼 문제 60개','과목 화면 요약(오늘 푼 문제는 서로 다른 문제 수)');
 run("go('range','영어')");assert.equal(menuDetail('#rangeList','Day 1 문장의 구조·동사 유형'),'풀어야 할 문제 0/60 · 첫 시도 60/60 · 정답 60','범위 줄');
 // 영어 범위 화면의 '문제집 진도'는 Day 순서대로 나온다: Day 1 바로 다음이 Day 2이고, Day 2는 아직 풀지 않은 60문제다.
 {const rows=nodes.get('#rangeList').all.filter(n=>n.tag==='button').map(n=>n.children[0]?._text),d1=rows.indexOf('Day 1 문장의 구조·동사 유형'),d2=rows.indexOf('Day 2 동사의 형태·명사·일치');
  assert.ok(d1>=0&&d2===d1+1,'문제집 진도는 Day 1 다음에 Day 2: '+rows.slice(0,4).join(' / '));
  assert.equal(menuDetail('#rangeList','Day 2 동사의 형태·명사·일치'),'풀어야 할 문제 60/60 · 첫 시도 0/60','Day 2 범위 줄');}
 // Day 3은 Day 2 바로 다음에 나오고, 아직 풀지 않은 178문제다.
 {const rows=nodes.get('#rangeList').all.filter(n=>n.tag==='button').map(n=>n.children[0]?._text),d2=rows.indexOf('Day 2 동사의 형태·명사·일치'),d3=rows.indexOf('Day 3 분사·준동사·관사와 도치');
  assert.ok(d2>=0&&d3===d2+1,'문제집 진도는 Day 2 다음에 Day 3: '+rows.slice(0,5).join(' / '));
  assert.equal(menuDetail('#rangeList','Day 3 분사·준동사·관사와 도치'),'풀어야 할 문제 178/178 · 첫 시도 0/178','Day 3 범위 줄');}
 // Day 4는 Day 3 바로 다음에 나오고, 아직 풀지 않은 152문제다.
 {const rows=nodes.get('#rangeList').all.filter(n=>n.tag==='button').map(n=>n.children[0]?._text),d3=rows.indexOf('Day 3 분사·준동사·관사와 도치'),d4=rows.indexOf('Day 4 형용사·부사와 비교 구문');
  assert.ok(d3>=0&&d4===d3+1,'문제집 진도는 Day 3 다음에 Day 4: '+rows.slice(0,6).join(' / '));
  assert.equal(menuDetail('#rangeList','Day 4 형용사·부사와 비교 구문'),'풀어야 할 문제 152/152 · 첫 시도 0/152','Day 4 범위 줄');}
 // Day 5는 Day 4 바로 다음에 나오고, 아직 풀지 않은 196문제다.
 {const rows=nodes.get('#rangeList').all.filter(n=>n.tag==='button').map(n=>n.children[0]?._text),d4=rows.indexOf('Day 4 형용사·부사와 비교 구문'),d5=rows.indexOf('Day 5 접속사·관계사·가정법과 도치');
  assert.ok(d4>=0&&d5===d4+1,'문제집 진도는 Day 4 다음에 Day 5: '+rows.slice(0,7).join(' / '));
  assert.equal(menuDetail('#rangeList','Day 5 접속사·관계사·가정법과 도치'),'풀어야 할 문제 196/196 · 첫 시도 0/196','Day 5 범위 줄');}
 // 문법 공식 훈련(v98): 마지막 Day(v115부터 Day 5) 다음에 ‘공식 훈련 새 문제 전체’ 범위, 그 아래 영역별로 접힌 공식 범위가 나온다. 공식 범위는 그 공식의 Day 문제와 새 문제를 함께 담는다.
 {const rows=nodes.get('#rangeList').all.filter(n=>n.tag==='button').map(n=>n.children[0]?._text),d5=rows.indexOf('Day 5 접속사·관계사·가정법과 도치'),f=rows.indexOf('공식 훈련 새 문제 전체');
  assert.ok(d5>=0&&f===d5+1,'Day 5 다음에 공식 훈련: '+rows.slice(0,9).join(' / '));
  assert.equal(menuDetail('#rangeList','공식 훈련 새 문제 전체'),'풀어야 할 문제 364/364 · 첫 시도 0/364','공식 훈련 새 문제 범위 줄');
  assert.equal(rows.filter(t=>run('ENGLISH_FORMULAS.areas.flatMap(a=>a.rules.map(r=>r.title))').includes(t)).length,89,'공식 범위 89개');}
 run("go('progress')");assert.equal(nodes.get('#total')._text,String(run('questionCount(data.cards.filter(isPlayable))')),'진행상황의 전체 문제');
 assert.equal(nodes.get('#done')._text,'60','진행상황의 오늘 푼 문제');
 for(const sel of ['#subjectList','#subjectSummary','#rangeList','#subjectStats','#card','#retryStatus'])assert.ok(!/문항|카드/.test(texts(sel)),sel+'에 문항/카드라는 말이 보인다: '+texts(sel).slice(0,120));
 run("go('quiz')");
}
// 5) 기출 회차는 앱이 문제를 고르지 않는다 — 켜야 하는 모드가 아니라 회차의 기본 동작이다.
//    복습 일정·재시도 대기·형제 간격 어느 것도 회차 안에서는 걸리지 않고,
//    1번부터 마지막 번호까지 원문 순서 그대로 나온 뒤 멈춘다.
(async()=>{
const paperId=run("Gichul.forSubject('컴퓨터일반')[0].id");
const openPaper=()=>run("openScope({subject:'컴퓨터일반',round:'paper-"+paperId+"'})");
openPaper();
// 처음 여는 회차: 그 회차 파일 하나만 받는다. 받는 동안에는 문제 대신 안내가 나오고 답을 받지 않는다.
assert.ok(screen().includes('기출 문제를 불러오는 중입니다'),'회차 파일을 받는 동안의 화면: '+screen().slice(0,60));
assert.deepEqual(fetched,['gichul/'+paperId+'.json'],'회차를 열면 그 회차 파일 하나만 받는다');
assert.ok(!run('data.activePractice'),'받기 전에는 풀이 중인 문항이 없다');
await flush();
assert.equal(run("Gichul.state("+JSON.stringify(paperId)+")"),'ready');
assert.equal(run("Object.keys(QUIZ_OPTIONS).filter(id=>id.startsWith('gichul-'+"+JSON.stringify(paperId)+"+'-')).length"),run("Gichul.paper("+JSON.stringify(paperId)+").numbers.length"),'받은 회차의 보기가 모두 채워진다');
assert.deepEqual(Array.from(run("Gichul.papers.filter(p=>p.questions).map(p=>p.id)")),[paperId],'다른 회차는 받지 않았다');
const paperOrder=Array.from(run("catalogOrder(data.cards.filter(c=>isPlayable(c)&&inCurrent(c))).map(c=>c.id)"));
assert.equal(paperOrder.length,19,'2026 지방직 9급 컴퓨터일반 수록 문항 수');
assert.deepEqual(paperOrder,[...paperOrder].sort(),'회차 순서는 원문 문항 번호 순이다');
assert.equal(nodes.get('#retryStatus')._text,'','회차에서는 재시도·형제 대기 안내가 뜨지 않는다');
assert.equal(nodes.get('#orderStatus')._text,'1/19 · 원문 순서 그대로');
const firstQuiz=run('data.activePractice.exercise');
assert.equal(firstQuiz.fixedOrder,true,'공식 보기는 순서를 섞지 않는다');
assert.deepEqual(Array.from(firstQuiz.choices),Array.from(run("QUIZ_OPTIONS["+JSON.stringify(paperOrder[0])+"].choices")),'보기는 원문 그대로 나온다');
assert.ok(Array.from(firstQuiz.choices).every((c,i)=>c.startsWith(['①','②','③','④'][i])),'보기는 원문 번호를 달고 있다');
// 한 번에 끝까지: 5분 재시도 대기도 순서를 막지 못한다.
const paperServed=[];
while(run('data.activePractice')&&paperServed.length<40){paperServed.push(run('data.activePractice.cardId'));answerCurrent(paperServed.length%4===0);}
assert.deepEqual(paperServed,paperOrder,'1번부터 마지막 번호까지 한 번씩, 원문 순서 그대로');
assert.ok(screen().includes('이 회차를 끝까지 풀었어요'),'회차 끝 화면: '+screen().slice(0,60));
// 어제 맞힌 문제가 아니라 방금 맞힌 문제여도, 회차를 다시 열면 제자리에 다시 나온다.
openPaper();
assert.equal(fetched.length,1,'이미 받은 회차는 다시 받지 않는다');
assert.equal(run('data.activePractice.cardId'),paperOrder[0],'회차를 다시 열면 언제나 1번부터');
assert.equal(run("reviewQueue(data.cards.filter(inCurrent)).ready.some(c=>c.id==="+JSON.stringify(paperOrder[0])+")"),false,'복습 대기열에 없는 문제도 회차에서는 제자리에 나온다');
const secondPass=[];
while(run('data.activePractice')&&secondPass.length<40){secondPass.push(run('data.activePractice.cardId'));answerCurrent(false);}
assert.deepEqual(secondPass,paperOrder,'두 번째로 열어도 같은 순서로 전부 나온다');
// 답안은 평소와 똑같이 기록되고(약점 분석이 그대로 돌아간다), 같은 날 두 바퀴가 간격을 부풀리지 않는다.
const paperState=run('structuredClone(data)'),todayStamp=run('day()'),nextDay=run('plus(day(),1)');
const paperRows=paperState.history.filter(h=>paperOrder.includes(h.cardId));
assert.equal(paperRows.length,paperOrder.length*2,'두 바퀴 모두 평소와 같은 기록으로 남는다');
assert.ok(paperRows.every(h=>h.mode==='quiz'&&h.detail&&h.detail.exerciseId),'기록에는 평소처럼 채점 상세가 들어 있다');
assert.ok(paperRows.every(h=>h.date===todayStamp));
for(const c of paperState.cards.filter(c=>paperOrder.includes(c.id))){
 // v131: 맞히면 7일(틀리면 1일), 같은 날 두 번째 바퀴는 단계를 올리지 않는다.
 assert.ok([1,7].includes(c.interval),'같은 날 회차 반복이 간격을 늘리지 않았다: '+c.id+' → '+c.interval);
 assert.equal(c.due,run("plus(day(),"+c.interval+")"));
}
{const live=new Map(paperState.cards.map(c=>[c.id,c]));for(const c of run('ProgressSync.merge(data,[])').cards.filter(c=>paperOrder.includes(c.id)))assert.equal(c.interval,live.get(c.id).interval,'동기화 재계산도 같다: '+c.id);}

// 6) 한능검 회차도 같은 규칙이다. 점수 계산(첫 시도 공식 배점)은 그대로 남는다.
run("openScope({subject:'한국사',round:'79'})");
const roundOrder=Array.from(run("catalogOrder(data.cards.filter(c=>isPlayable(c)&&inCurrent(c))).map(c=>c.id)"));
assert.deepEqual(roundOrder,Array.from({length:50},(_,i)=>'hanneung-79-'+String(i+1).padStart(2,'0')),'한능검 79회도 1번부터 50번까지 원문 순서');
assert.equal(run('data.activePractice.cardId'),'hanneung-79-01');
// 원문 이미지가 뜬 뒤에만 답을 받는 규칙은 그대로다. 가짜 DOM에서 이미지가 준비된 상태를 만든다.
const paperImg=doc.querySelector('#card .paper-image img');paperImg.complete=true;paperImg.naturalWidth=1;
const roundServed=[];
while(run('data.activePractice')&&roundServed.length<5){roundServed.push(run('data.activePractice.cardId'));answerCurrent(roundServed.length===2);}
assert.deepEqual(roundServed,roundOrder.slice(0,5),'한능검 회차도 순서대로 나온다');
assert.equal(nodes.get('#orderStatus')._text,'6/50 · 원문 순서 그대로');
const roundStats=run("Hanneung.stats(79,data.history)");
assert.equal(roundStats.answered,5,'회차 점수는 첫 시도 기준으로 그대로 계산된다');
assert.equal(roundStats.total,50);
assert.ok(roundStats.points>0&&roundStats.points<100,'맞힌 문항만큼의 공식 배점: '+roundStats.points);
run("openScope({subject:'한국사',round:'79'})");
assert.equal(run('data.activePractice.cardId'),'hanneung-79-01','한능검 회차를 다시 열어도 1번부터');
// 회차 파일을 받지 못하면(오프라인·서버 오류) 문제 대신 다시 불러오기 버튼을 보여 주고, 누르면 다시 받는다.
const englishPaper=run("Gichul.forSubject('영어')[0].id");
failNextFetch=true;
run("openScope({subject:'영어',round:'paper-"+englishPaper+"'})");
await flush();
assert.equal(run("Gichul.state("+JSON.stringify(englishPaper)+")"),'error');
assert.ok(screen().includes('기출 문제를 불러오지 못했어요'),'받기 실패 화면: '+screen().slice(0,60));
const retry=nodes.get('#card').all.find(n=>n._text==='다시 불러오기');
assert.ok(retry&&typeof retry.onclick==='function','다시 불러오기 버튼이 있다');
retry.onclick();
assert.ok(screen().includes('기출 문제를 불러오는 중입니다'));
await flush();
assert.equal(run("Gichul.state("+JSON.stringify(englishPaper)+")"),'ready');
assert.equal(run('data.activePractice.cardId'),'gichul-'+englishPaper+'-'+String(run("Gichul.paper("+JSON.stringify(englishPaper)+").numbers[0]")).padStart(2,'0'),'다시 받은 뒤 1번 문항부터 나온다');
assert.equal(fetched.filter(u=>u.includes(englishPaper)).length,2,'실패한 회차만 한 번 더 받았다');
// 회차가 아닌 범위는 예전 그대로 복습 대기열을 따른다.
run("openScope({subject:'한국사',round:'lecture-02-05'})");
// 국어 범위 화면: 『사고의 힘 논리』 묶음이 맨 위에 1장 → 2장 → 3장 → 4장 → 5장 → 6장 → 제2편 독해 1장 순서로 나오고, 모두 아직 풀지 않은 4지선다 문제다.
// 2장을 열면 국어 문제만 나오고, 틀린 뒤 해설 화면에 정리·출처·같은 개념 안내가 나오며 문항/카드라는 말은 없다.
{
 const rangeRows=()=>nodes.get('#rangeList').all.filter(n=>n.tag==='button').map(n=>n.children[0]?._text);
 const rowDetail=title=>nodes.get('#rangeList').all.find(n=>n.tag==='button'&&n.children[0]?._text===title)?.children[1]?._text;
 run("go('range','국어')");
 const heads=nodes.get('#rangeList').all.filter(n=>String(n.className||'').split(' ').includes('range-heading')).map(n=>n._text);
 assert.equal(heads[0],'사고의 힘 논리','국어 범위 화면의 첫 묶음: '+heads.slice(0,3).join(' / '));
 const rows=rangeRows();
 assert.deepEqual(rows.slice(0,6),['1장 논증의 개념과 유형','2장 명제 논리','3장 정언 논리','4장 술어 논리','5장 귀납 논증','6장 논리의 오류'],'사고의 힘 논리는 1장부터 6장까지 차례로: '+rows.slice(0,7).join(' / '));
 assert.equal(rowDetail('1장 논증의 개념과 유형'),'풀어야 할 문제 31/31 · 첫 시도 0/31','1장 범위 줄');
 assert.equal(rowDetail('2장 명제 논리'),'풀어야 할 문제 179/179 · 첫 시도 0/179','2장 범위 줄');
 assert.equal(rowDetail('3장 정언 논리'),'풀어야 할 문제 181/181 · 첫 시도 0/181','3장 범위 줄');
 assert.equal(rowDetail('4장 술어 논리'),'풀어야 할 문제 147/147 · 첫 시도 0/147','4장 범위 줄');
 assert.equal(rowDetail('5장 귀납 논증'),'풀어야 할 문제 128/128 · 첫 시도 0/128','5장 범위 줄');
 assert.equal(rowDetail('6장 논리의 오류'),'풀어야 할 문제 329/329 · 첫 시도 0/329','6장 범위 줄');
 assert.equal(rows[6],'독해 1장 독해의 원리','제2편 독해 1장은 논리 6장 바로 다음 줄: '+rows.slice(0,8).join(' / '));
 assert.equal(rowDetail('독해 1장 독해의 원리'),'풀어야 할 문제 444/444 · 첫 시도 0/444','독해 1장 범위 줄');
 assert.ok(rows.includes('국어 전체')&&heads.some(h=>h.startsWith('기출 · 회차별')),'국어 기출과 국어 전체 범위는 그대로 있다');
 const rangeText=[...nodes.get('#rangeList').all.map(n=>n._text)].join(' | ');assert.ok(!/문항|카드/.test(rangeText),'국어 범위 화면에 문항/카드라는 말이 없다');
 run("openScope({subject:'국어',topic:'논리 2장'})");
 assert.equal(nodes.get('#scopeLabel')._text,'국어 · 사고의 힘 논리 2장 명제 논리','범위 이름');
 assert.equal(run("data.cards.filter(c=>isPlayable(c)&&inCurrent(c)).length"),179,'2장 범위는 179문제(문제 하나 = 카드 하나)');
 assert.ok(run("data.cards.filter(c=>isPlayable(c)&&inCurrent(c)).every(c=>c.subject==='국어'&&PRACTICE_BANK[c.id].topic==='논리 2장')"),'2장 범위에는 국어 2장 문제만 있다');
 const koId=run('data.activePractice.cardId'),koQuiz=run('data.activePractice.exercise');
 assert.ok(koId.startsWith('ko-logic2-'),'2장 범위의 첫 문제: '+koId);assert.equal(koQuiz.type,'choice');assert.equal(koQuiz.choices.length,4);
 run('answerPractice('+JSON.stringify(koId)+','+((koQuiz.correctIndex+1)%4)+')');
 assert.equal(run('data.quizFeedback.result'),'wrong','일부러 틀린 답');
 const shown=screen(),lesson=run('PRACTICE_BANK['+JSON.stringify(koId)+']');
 assert.ok(shown.includes('국어 · '+lesson.title+' · 객관식'),'문제 머리말: 과목 · 정리 제목 · 객관식');
 assert.ok(shown.includes(lesson.hook),'해설 화면에 정리 한 줄(hook)이 나온다');
 assert.ok(shown.includes('사고의 힘 논리 제1편 개념 기반 자체 제작 문제'),'출처 줄이 자체 제작임을 밝힌다');
 assert.ok(shown.includes('같은 개념의 다른 문제도 10분 뒤 이어서 나와요'),'같은 개념 문제가 이어서 나온다는 안내');
 assert.ok(!/문항|카드/.test(shown),'국어 해설 화면에 문항/카드라는 말이 없다: '+shown.slice(0,120));
 next();
 // 3장 정언 논리: 181문제가 모두 국어 3장이고, 맞힌 답의 해설 화면에도 정리·출처가 나오며 문항/카드라는 말은 없다.
 run("openScope({subject:'국어',topic:'논리 3장'})");
 assert.equal(nodes.get('#scopeLabel')._text,'국어 · 사고의 힘 논리 3장 정언 논리','3장 범위 이름');
 assert.equal(run("data.cards.filter(c=>isPlayable(c)&&inCurrent(c)).length"),181,'3장 범위는 181문제(문제 하나 = 카드 하나)');
 assert.ok(run("data.cards.filter(c=>isPlayable(c)&&inCurrent(c)).every(c=>c.subject==='국어'&&PRACTICE_BANK[c.id].topic==='논리 3장')"),'3장 범위에는 국어 3장 문제만 있다');
 const k3Id=run('data.activePractice.cardId'),k3Quiz=run('data.activePractice.exercise');
 assert.ok(k3Id.startsWith('ko-logic3-'),'3장 범위의 첫 문제: '+k3Id);assert.equal(k3Quiz.type,'choice');assert.equal(k3Quiz.choices.length,4);
 run('answerPractice('+JSON.stringify(k3Id)+','+k3Quiz.correctIndex+')');
 assert.equal(run('data.quizFeedback.result'),'correct','맞힌 답');
 const shown3=screen(),lesson3=run('PRACTICE_BANK['+JSON.stringify(k3Id)+']');
 assert.ok(shown3.includes('국어 · '+lesson3.title+' · 객관식'),'3장 문제 머리말');assert.ok(shown3.includes(lesson3.hook),'3장 해설 화면에 정리 한 줄');
 assert.ok(shown3.includes('사고의 힘 논리 제1편 개념 기반 자체 제작 문제'),'3장 출처 줄');assert.ok(!/문항|카드/.test(shown3),'3장 해설 화면에 문항/카드라는 말이 없다');
 next();
 // 4장 술어 논리 147문제 · 5장 귀납 논증 128문제: 범위 이름·문제 수가 맞고, 범위 안의 첫 문제가 그 장의 4지선다다.
 for(const [topic,title,n,prefix] of [['논리 4장','4장 술어 논리',147,'ko-logic4-'],['논리 5장','5장 귀납 논증',128,'ko-logic5-'],['논리 6장','6장 논리의 오류',329,'ko-logic6-'],['독해 1장','독해 1장 독해의 원리',444,'ko-read1-']]){
  run('openScope({subject:\'국어\',topic:'+JSON.stringify(topic)+'})');
  assert.equal(nodes.get('#scopeLabel')._text,'국어 · 사고의 힘 논리 '+title,topic+' 범위 이름');
  assert.equal(run('data.cards.filter(c=>isPlayable(c)&&inCurrent(c)).length'),n,topic+' 범위 문제 수');
  assert.ok(run('data.cards.filter(c=>isPlayable(c)&&inCurrent(c)).every(c=>c.subject===\'국어\'&&PRACTICE_BANK[c.id].topic==='+JSON.stringify(topic)+')'),topic+' 범위에는 그 장 문제만 있다');
  const id=run('data.activePractice.cardId'),quiz=run('data.activePractice.exercise');
  assert.ok(id.startsWith(prefix),topic+' 범위의 첫 문제: '+id);assert.equal(quiz.type,'choice');assert.equal(quiz.choices.length,4);
 }
}
// 보기별 틀린 곳(v100): 옳은 보기의 꼬리표는 문제 유형을 따른다. 우리말→영어 옮기기는 뜻까지 보므로 ‘옳게 옮김’, 어법 문제는 그대로 ‘어법상 옳음’.
{
 const flat=n=>(n._text||'')+n.children.map(flat).join('');
 const shown=(id,i)=>{const v=run('PRACTICE_BANK['+JSON.stringify(id)+'].variants[0]');return {v,node:run('markedChoice(PRACTICE_BANK['+JSON.stringify(id)+'].variants[0].choices['+i+'],PRACTICE_BANK['+JSON.stringify(id)+'].variants[0].marks['+i+'],okLabel(PRACTICE_BANK['+JSON.stringify(id)+'].variants[0]))')};};
 const ok=shown('en-day3-009',0);assert.equal(ok.v.correctIndex,0);assert.ok(flat(ok.node).endsWith(' (옳게 옮김)'),'옮기기 문제의 옳은 보기: '+flat(ok.node));assert.ok(!flat(ok.node).includes('어법상 옳음'));
 const bad=shown('en-day3-009',1),marks=bad.node.all.filter(n=>n.className==='choice-error').map(n=>n._text),fixes=bad.node.all.filter(n=>n.className==='choice-fix').map(n=>n._text);
 assert.deepEqual(marks,['participated']);assert.deepEqual(fixes,[' → participating']);assert.ok(!flat(bad.node).includes('옳'),'틀린 보기에는 꼬리표가 없다');
 const old=shown('en-day3-006',2);assert.equal(old.v.correctIndex,2);assert.ok(flat(old.node).endsWith(' (어법상 옳음)'),'어법 문제의 옳은 보기는 그대로: '+flat(old.node));
 const bracket=shown('en-formula-071',0);assert.ok(flat(bracket.node).endsWith(' (어법상 옳음)'),'옮길 때 대괄호 문제는 어법 꼬리표: '+flat(bracket.node));
 assert.ok(flat(run('markedChoice("A b.",null)')).endsWith(' (어법상 옳음)'),'꼬리표를 넘기지 않은 옛 호출도 그대로');
}
// 새로 만든 문제가 '이미 쓰던 기기'에 들어오는지. 예전에는 팩 이름이 바뀔 때만 들어와서, 이름을 안 올린 배포의
// 문항은 영영 안 들어왔다(2026-09-17 뒤 158문항). 이름이 그대로여도 기기에 없는 문제는 채워 넣어야 한다.
{
 const missing=['joseonearly-hist-20260919-001','joseonearly-hist-20260919-080','joseonphoto-hist-20260919-008','heritagephoto-hist-20260919-070'];
 const has=()=>run('['+JSON.stringify(missing).slice(1,-1)+'].filter(id=>data.cards.some(c=>c.id===id)).length');
 assert.equal(has(),missing.length,'새 문제는 기본으로 들어 있다');
 run("(()=>{const s=structuredClone(data);s.cards=s.cards.filter(c=>!"+JSON.stringify(missing)+".includes(c.id));s.installedPacks=['core-2026-09-17-v37'];commit(s);})()");
 assert.equal(has(),0,'대조군: 지운 상태');
 const before=run('data.cards.length');
 run('installCorePack()');
 assert.equal(has(),missing.length,'팩 이름이 그대로여도 기기에 없는 새 문제가 들어온다');
 assert.equal(run('data.cards.length'),before+missing.length,'없던 문제만 들어온다');
 run('installCorePack()');
 assert.equal(run('data.cards.length'),before+missing.length,'다시 불러도 같은 문제를 두 번 넣지 않는다');
}
// 외울 것은 과목 안에 있다(2026-09-19 사용자: "외울것들은 과목별로 분류해서 정리해라"). 과목 화면에 그 과목 목록만 세고, 눌러 연 목록에도 그 과목만 나온다.
{
 const titles=()=>nodes.get('#memorizeBody').all.map(n=>n._text).filter(Boolean);
 run("go('subject','국어')");
 assert.equal(run("$('#openMemorize').hidden"),false,'국어 화면에 외울 것이 보인다');
 const koSets=run("MEMORIZE.sets.filter(s=>s.subject==='국어').length");
 assert.equal(koSets,3,'국어 외울 것 목록 3개');
 assert.ok(run("$('#memorizeHint').textContent").startsWith(koSets+'개 목록 · 61칸'),'설명줄: '+run("$('#memorizeHint').textContent"));
 run("$('#openMemorize').onclick()");
 assert.equal(run('view'),'memorize');assert.equal(run("$('#memorizeTitle').textContent"),'국어 · 외울 것');
 const shown=titles();
 assert.ok(shown.includes('정언 논리 용어 뜻')&&shown.includes('정언 논리 핵심'),'국어 목록이 나온다: '+shown.join(' | '));
 assert.ok(!shown.some(t=>/왕 순서|어법 공식|외울 값/.test(t)),'다른 과목 목록은 섞이지 않는다: '+shown.join(' | '));
 assert.ok(!shown.some(t=>t.includes('국어 · ')),'과목 화면 안이라 과목 이름을 되풀이하지 않는다');
 run("go('subject','영어')");run("$('#openMemorize').onclick()");
 const en=titles();assert.ok(en.includes('영어 어법 공식')&&!en.some(t=>t.startsWith('정언')),'영어 화면은 영어 목록만: '+en.join(' | '));
 run("go('home','')");
}
// 대기열 모드(2026-09-20): 무엇을 먼저 낼지만 고른다. 늘 고른 범위 안에서만 돌고, 채점·복습 일정은 모드와 무관하다.
{
 run("openScope({subject:'영어',topic:'Day 2'})");
 const inside=Array.from(run("catalogOrder(data.cards.filter(c=>isPlayable(c)&&inCurrent(c))).map(c=>c.id)"));
 assert.ok(inside.length>=6,'Day 2 범위 카드 수: '+inside.length);
 const outside=run("data.cards.filter(c=>isPlayable(c)&&!inCurrent(c)).map(c=>c.id)[0]");
 assert.ok(outside,'범위 밖 카드가 있어야 대조가 된다');
 // 오답 이력을 심는다. at을 옛날로 두어 형제 10분 간격이 끼어들지 않게 한다.
 const rows=[[inside[4],3],[inside[1],1],[outside,5]],history=[];
 for(const [cardId,n] of rows)for(let i=0;i<n;i++)history.push({id:'wq-'+history.length,cardId,date:'2026-01-05',at:'2026-01-05T03:00:00.000Z',result:'wrong',mode:'quiz'});
 run("(()=>{const s=structuredClone(data);s.history="+JSON.stringify(history)+";commit(s);render();})()");
 const readyIds=()=>Array.from(run("reviewQueue(data.cards.filter(c=>isPlayable(c)&&inCurrent(c))).ready.map(c=>c.id)"));

 assert.equal(run('queueMode()'),'default','기본 모드가 기본값이다');
 const base=readyIds();
 assert.equal(base.length,inside.length,'기본 모드에서는 범위의 모든 문제가 지금 풀 차례다');

 // 틀린 문제 위주 — 오답 이력이 있는 문제만, 많이 틀린 순. 범위 밖은 절대 넘어오지 않는다.
 run("setQueueMode('wrong')");
 const wrong=readyIds();
 assert.deepEqual(wrong,[inside[4],inside[1]],'오답 이력이 있는 문제만 많이 틀린 순으로 나온다');
 assert.ok(!wrong.includes(outside),'범위 밖의 오답은 나오지 않는다');
 assert.equal(nodes.get('#queueModeLabel').hidden,false,'평소 화면에서는 모드를 고를 수 있다');

 // 안 푼 문제 먼저 — 카드가 빠지지 않고 순서만 바뀐다.
 run("setQueueMode('fresh')");
 const fresh=readyIds();
 assert.deepEqual([...fresh].sort(),[...base].sort(),'안 푼 문제 먼저는 순열이어야 한다(빠지는 카드 없음)');
 assert.deepEqual(fresh.slice(-2).sort(),[inside[4],inside[1]].sort(),'푼 적 있는 문제는 뒤로 밀린다');

 // 과목별 모드(v148): 영어에서 고른 모드는 한국사에 번지지 않고, 한국사에서 고른 모드도 영어를 바꾸지 않는다. 옛 공통 모드는 과목별로 처음 고를 때 지운다.
 run("openScope({subject:'한국사'})");
 assert.equal(run('queueMode()'),'default','영어의 안 푼 문제 먼저가 한국사로 번지지 않는다');
 run("setQueueMode('wrong')");assert.equal(run('queueMode()'),'wrong');
 assert.equal(run("queueMode('영어')"),'fresh','한국사를 바꿔도 영어는 그대로');
 run("setQueueMode('default')");assert.equal(run('JSON.stringify(data.queueModes)'),JSON.stringify({'영어':'fresh'}),'기본 모드는 적지 않는다');
 assert.equal(run('data.queueMode'),undefined,'옛 공통 모드는 남지 않는다');
 assert.throws(()=>run("validateBackup({version:3,cards:[],history:[],queueModes:{'영어':'nope'}})"),/대기열/,'잘못된 과목별 모드는 거절');
 assert.equal(run("(()=>{const s=data.queueModes;delete data.queueModes;data.queueMode='wrong';const r=queueMode('국어');delete data.queueMode;data.queueModes=s;return r;})()"),'wrong','과목별 선택이 없던 옛 저장은 공통 모드를 그대로 읽는다');
 run("openScope({subject:'영어',topic:'Day 2'})");assert.equal(run('queueMode()'),'fresh');

 // 오답이 없는 범위에서 '틀린 문제 위주'를 켜면 막다른 길 대신 안내와 되돌리기를 준다.
 run("setQueueMode('wrong')");
 run("openScope({subject:'영어',topic:'Day 3'})");
 assert.deepEqual(readyIds(),[],'Day 3에는 오답 이력이 없다');
 assert.ok(screen().includes('틀렸던 문제가 없어요'),'오답이 없을 때 안내: '+screen().slice(0,60));
 const back=nodes.get('#card').all.find(n=>n.tag==='button'&&n._text==='기본 모드로 돌아가기');
 assert.ok(back,'기본 모드로 돌아가는 버튼이 있다');
 back.onclick();
 assert.equal(run('queueMode()'),'default','버튼을 누르면 기본 모드로 돌아온다');
 assert.ok(run('data.activePractice')!==null&&run('data.activePractice')!==undefined,'돌아오면 바로 풀 문제가 나온다');

 // 기출 회차는 대기열을 거치지 않으므로 모드를 숨긴다.
 run("openScope({subject:'한국사',round:79})");
 assert.equal(nodes.get('#queueModeLabel').hidden,true,'기출 회차에서는 모드 선택을 숨긴다');
}
// v131 외운 문제: 특정 범위에서는 옵션을 켜야만 나오고, 과목 전체에서는 하루 7분의 1 정도만 섞인다.
{const mq=run(`(()=>{const c=data.cards.find(c=>isPlayable(c)&&PRACTICE_BANK[c.id]);const m={...c,streak:4,due:day(),retryAt:undefined,pendingAttempt:undefined};const off=reviewQueue([m],true).ready.length;data.includeMastered=true;const on=reviewQueue([m],true).ready.length;delete data.includeMastered;const wide=reviewQueue([m],false).ready.length;return [off,on,wide,dailyPick(m.id)?1:0];})()`);
 assert.equal(mq[0],0,'mastered question hidden in a range');assert.equal(mq[1],1,'shown when the option is on');assert.equal(mq[2],mq[3],'subject-wide: only on its random day');
 const share=run(`(()=>{let n=0;for(let i=0;i<7000;i++)if(dailyPick('x'+i))n++;return n;})()`);assert.ok(share>800&&share<1200,'about one in seven: '+share);}
console.log('PASS app: every card is one question (Day 1 '+total+'; 국어 사고의 힘 논리 range rows 1장 31 · 2장 179 · 3장 181 · 4장 147 · 5장 128 · 6장 329 · 독해 1장 444 and four-option feedback screens (2장 wrong with same-concept notice, 3장 correct) with lesson and source), home/subject/range/progress counts read "풀어야 할 문제 M/N" with no 문항/카드 wording, normal mode serves one question per grammar point ('+normal+'/'+total+') and holds the rest behind the sibling gap, records stay normal, no same-day interval inflation; 대기열 모드 3종(기본·틀린 문제 위주·안 푼 문제 먼저)은 범위 안에서만 돌고 카드를 잃지 않는다; 기출 회차는 '+paperOrder.length+'문항·한능검 79회는 50문항을 원문 순서대로 게이트 없이 내고 다시 열면 1번부터 시작하며, 회차 점수와 기록은 그대로다; 기출 회차 파일은 시작 때 0개, 회차를 열 때 그 회차 하나만 받고, 받기 실패는 다시 불러오기로 복구된다');
})().catch(e=>{console.error(e);process.exit(1);});
