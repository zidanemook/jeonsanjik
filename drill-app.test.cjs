// app.js를 가짜 DOM 위에서 실제로 돌려, "이 범위 전부 풀기"가 화면·기록·일정에서 어떻게 동작하는지 확인한다.
// 평소 모드는 그대로 막히고(사용자가 겪던 상태), 드릴을 켜면 범위의 모든 문항이 나오고, 틀린 문항만 다음 회차로 돈다.
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
for(const f of ['scheduler.js','learning.js','core-review-pack.js','quiz-options.js','hanneung-data.js','hanneung-explanations.js','hanneung.js','gichul-data.js','gichul.js','practice-bank.js','practice.js','content-corrections.js','review-record.js','review-policy.js','drill.js','sync-core.js','study-credit.js','study-review-catalog.js','hanneung-topics.js','topics.js','app.js'])
 vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx,{filename:f});
const run=code=>vm.runInContext(code,ctx);
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

// 1) 평소 모드: 문제집 Day 1 범위를 풀 수 있는 데까지 푼다. 곧 막히고, 범위의 대부분은 손도 못 댄다.
run("openScope({subject:'영어',topic:'Day 1'})");
const total=run("questionCount(data.cards.filter(c=>isPlayable(c)&&inCurrent(c)))");
const cardCount=run("data.cards.filter(c=>isPlayable(c)&&inCurrent(c)).length");
assert.ok(total>100&&cardCount>=12,'Day 1 범위: 카드 '+cardCount+'장 · 문항 '+total+'개');
let normal=0;while(run('data.activePractice')&&normal<total){answerCurrent(false);normal++;}
assert.ok(normal<cardCount,'평소 모드는 카드 수보다도 적게 풀고 막힌다 ('+normal+'문제)');
assert.ok(/잠시 뒤|마쳤어요/.test(screen()),'막힌 화면: '+screen().slice(0,60));
assert.ok(screen().includes('이 범위 전부 풀기 · '+total+'문항'),'막힌 화면에서 드릴을 권한다');
assert.equal(run('drill'),null,'사용자가 켜기 전에는 드릴이 없다');
assert.equal(nodes.get('#drillStatus').hidden,true);
assert.equal(nodes.get('#drillToggle')._text,'이 범위 전부 풀기');
assert.equal(nodes.get('#drillToggle').attrs['aria-pressed'],'false');

// 2) 드릴을 켜면 범위의 모든 문항이 순서대로 나온다. 5번째만 일부러 틀린다.
run('toggleDrill()');
assert.equal(run('drill.order.length'),total);
assert.equal(nodes.get('#drillStatus').hidden,false);
assert.equal(nodes.get('#drillStatus')._text,'1회차 1/'+total+' · 이 범위 전부 풀기');
assert.equal(nodes.get('#retryStatus')._text,'','재시도·형제 대기 안내는 드릴에서 뜨지 않는다');
assert.equal(nodes.get('#drillToggle').attrs['aria-pressed'],'true');
const served=[];let missed=null;
while(run('StudyDrill.current(drill)')&&served.length<total*2){
 const item=run('StudyDrill.current(drill)');
 assert.equal(run('data.activePractice.cardId'),item.cardId);
 assert.equal(run('data.activePractice.exercise.variantIndex'),item.index,'드릴이 지목한 문항이 그대로 나온다');
 const wrong=served.length===4;if(wrong)missed=item.key;
 served.push(item.key);
 if(served.length===37)assert.equal(nodes.get('#drillStatus')._text,'1회차 37/'+total+' · 이 범위 전부 풀기');
 answerCurrent(wrong);
}
assert.equal(served.length,total+1,'1회차 전체 + 틀린 1문항');
assert.equal(new Set(served.slice(0,total)).size,total,'1회차에 범위의 모든 문항이 한 번씩');
assert.deepEqual(served.slice(total),[missed],'2회차는 이 드릴에서 틀린 문항만');
assert.ok(screen().includes('이 범위를 전부 풀었어요'),'끝 화면: '+screen().slice(0,60));
assert.ok(screen().includes(total+'문항을 모두 한 번 이상 맞혔어요'));

// 3) 답안은 평소와 똑같이 기록되고, 같은 날 반복이 복습 간격을 부풀리지 않는다.
const data=run('structuredClone(data)'),today=run('day()'),tomorrow=run('plus(day(),1)');
const rows=data.history.filter(h=>h.date===today);
assert.equal(rows.length,normal+total+1,'드릴 답안도 평소와 같은 기록으로 남는다');
assert.ok(rows.every(h=>h.mode==='quiz'&&h.detail&&h.detail.exerciseId),'기록에는 평소처럼 채점 상세가 들어 있다');
const touched=data.cards.filter(c=>rows.some(h=>h.cardId===c.id));
assert.equal(touched.length,cardCount);
for(const c of touched){assert.ok(c.interval<=1,'같은 날 반복이 간격을 늘리지 않았다: '+c.id+' → '+c.interval);assert.equal(c.due,tomorrow);}
// 동기화가 기록에서 카드를 다시 계산해도 같은 결론이다.
for(const c of run('ProgressSync.merge(data,[])').cards.filter(c=>rows.some(h=>h.cardId===c.id)))assert.ok(c.interval<=1,'동기화 재계산도 같다: '+c.id);
// 4) 드릴을 끄면 화면과 대기열은 평소대로 돌아온다.
run('toggleDrill()');
assert.equal(run('drill'),null);
assert.equal(nodes.get('#drillStatus').hidden,true);
assert.equal(nodes.get('#drillToggle')._text,'이 범위 전부 풀기');
assert.equal(run("reviewQueue(data.cards.filter(inCurrent)).ready.length"),0,'드릴을 꺼도 복습 대기열 규칙은 그대로다');
// 범위를 다시 고르면 드릴은 끝난다.
run('toggleDrill()');assert.ok(run('drill'));
run("openScope({subject:'영어',topic:'수일치'})");
assert.equal(run('drill'),null,'다른 범위를 열면 드릴이 남지 않는다');

// 5) 기출 회차는 앱이 문제를 고르지 않는다 — 켜야 하는 모드가 아니라 회차의 기본 동작이다.
//    복습 일정·재시도 대기·형제 간격·하루 새 문제 몫 어느 것도 회차 안에서는 걸리지 않고,
//    1번부터 마지막 번호까지 원문 순서 그대로 나온 뒤 멈춘다.
const paperId=run("Gichul.forSubject('컴퓨터일반')[0].id");
const openPaper=()=>run("openScope({subject:'컴퓨터일반',round:'paper-"+paperId+"'})");
openPaper();
const paperOrder=Array.from(run("catalogOrder(data.cards.filter(c=>isPlayable(c)&&inCurrent(c))).map(c=>c.id)"));
assert.equal(paperOrder.length,19,'2026 지방직 9급 컴퓨터일반 수록 문항 수');
assert.deepEqual(paperOrder,[...paperOrder].sort(),'회차 순서는 원문 문항 번호 순이다');
assert.equal(run('drill'),null,'회차는 드릴이 아니다');
assert.equal(nodes.get('#drillToggle').hidden,true,'회차에서는 전부 풀기 버튼을 감춰 두 방식이 부딪히지 않게 한다');
assert.equal(nodes.get('#retryStatus')._text,'','회차에서는 재시도·형제 대기 안내가 뜨지 않는다');
assert.equal(nodes.get('#drillStatus')._text,'1/19 · 원문 순서 그대로');
const firstQuiz=run('data.activePractice.exercise');
assert.equal(firstQuiz.fixedOrder,true,'공식 보기는 순서를 섞지 않는다');
assert.deepEqual(Array.from(firstQuiz.choices),Array.from(run("QUIZ_OPTIONS["+JSON.stringify(paperOrder[0])+"].choices")),'보기는 원문 그대로 나온다');
assert.ok(Array.from(firstQuiz.choices).every((c,i)=>c.startsWith(['①','②','③','④'][i])),'보기는 원문 번호를 달고 있다');
// 한 번에 끝까지: 하루 새 문제 몫(5개)도, 5분 재시도 대기도 순서를 막지 못한다.
const paperServed=[];
while(run('data.activePractice')&&paperServed.length<40){paperServed.push(run('data.activePractice.cardId'));answerCurrent(paperServed.length%4===0);}
assert.deepEqual(paperServed,paperOrder,'1번부터 마지막 번호까지 한 번씩, 원문 순서 그대로');
assert.ok(screen().includes('이 회차를 끝까지 풀었어요'),'회차 끝 화면: '+screen().slice(0,60));
// 어제 맞힌 문제가 아니라 방금 맞힌 문제여도, 회차를 다시 열면 제자리에 다시 나온다.
openPaper();
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
 assert.ok(c.interval<=1,'같은 날 회차 반복이 간격을 늘리지 않았다: '+c.id+' → '+c.interval);
 assert.equal(c.due,nextDay);
}
for(const c of run('ProgressSync.merge(data,[])').cards.filter(c=>paperOrder.includes(c.id)))assert.ok(c.interval<=1,'동기화 재계산도 같다: '+c.id);

// 6) 한능검 회차도 같은 규칙이다. 점수 계산(첫 시도 공식 배점)은 그대로 남는다.
run("openScope({subject:'한국사',round:'79'})");
const roundOrder=Array.from(run("catalogOrder(data.cards.filter(c=>isPlayable(c)&&inCurrent(c))).map(c=>c.id)"));
assert.deepEqual(roundOrder,Array.from({length:50},(_,i)=>'hanneung-79-'+String(i+1).padStart(2,'0')),'한능검 79회도 1번부터 50번까지 원문 순서');
assert.equal(nodes.get('#drillToggle').hidden,true,'한능검 회차에서도 전부 풀기 버튼을 감춘다');
assert.equal(run('data.activePractice.cardId'),'hanneung-79-01');
// 원문 이미지가 뜬 뒤에만 답을 받는 규칙은 그대로다. 가짜 DOM에서 이미지가 준비된 상태를 만든다.
const paperImg=doc.querySelector('#card .paper-image img');paperImg.complete=true;paperImg.naturalWidth=1;
const roundServed=[];
while(run('data.activePractice')&&roundServed.length<5){roundServed.push(run('data.activePractice.cardId'));answerCurrent(roundServed.length===2);}
assert.deepEqual(roundServed,roundOrder.slice(0,5),'한능검 회차도 순서대로 나온다');
assert.equal(nodes.get('#drillStatus')._text,'6/50 · 원문 순서 그대로');
const roundStats=run("Hanneung.stats(79,data.history)");
assert.equal(roundStats.answered,5,'회차 점수는 첫 시도 기준으로 그대로 계산된다');
assert.equal(roundStats.total,50);
assert.ok(roundStats.points>0&&roundStats.points<100,'맞힌 문항만큼의 공식 배점: '+roundStats.points);
run("openScope({subject:'한국사',round:'79'})");
assert.equal(run('data.activePractice.cardId'),'hanneung-79-01','한능검 회차를 다시 열어도 1번부터');
// 회차가 아닌 범위는 예전 그대로 복습 대기열을 따른다.
run("openScope({subject:'한국사',round:'lecture-02-05'})");
assert.equal(nodes.get('#drillToggle').hidden,false,'회차가 아닌 범위에서는 전부 풀기 버튼이 그대로 있다');
console.log('PASS drill in app: normal mode stops at '+normal+'/'+total+', drill serves all '+total+' exercises then repeats only the missed one, records stay normal, no same-day interval inflation; 기출 회차는 '+paperOrder.length+'문항·한능검 79회는 50문항을 원문 순서대로 게이트 없이 내고 다시 열면 1번부터 시작하며, 회차 점수와 기록은 그대로다');
