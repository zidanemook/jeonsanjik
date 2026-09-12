const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
global.ReviewSchedule=require('./scheduler.js');global.ReviewLearning=require('./learning.js');
const Drill=require('./drill.js'),practice=require('./practice.js'),bank=require('./practice-bank.js'),policy=require('./review-policy.js'),sync=require('./sync-core.js');
const ctx={};vm.createContext(ctx);for(const f of ['core-review-pack.js','quiz-options.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const OPTIONS=ctx.QUIZ_OPTIONS,PACK=ctx.CORE_REVIEW_PACK;
const size=id=>(OPTIONS[id]?1:0)+(bank[id]?.variants.length||0);
const scope={subject:'영어',topic:'Day 1',round:''};
// 문제집 Day 1 범위: 카드 12장에 문항 129개. 드릴은 카드가 아니라 문항 단위로 돈다.
const day1=Object.keys(bank).filter(id=>bank[id].topic==='Day 1');
const cards=day1.map(id=>PACK.find(c=>c.id===id)||{id,subject:'영어',question:bank[id].variants[0].question});
const total=day1.reduce((n,id)=>n+size(id),0);
assert.equal(cards.length,12);assert.equal(total,129);

// 1) 범위의 모든 문항을 정확히 한 번씩, 카드 순서 그대로 펼친다.
let state=Drill.create(scope,cards,size);
assert.equal(state.order.length,total);
assert.equal(new Set(state.order.map(i=>i.key)).size,total);
assert.deepEqual(state.order.filter(i=>i.cardId===day1[0]).map(i=>i.index),Array.from({length:size(day1[0])},(_,i)=>i));
assert.deepEqual(state.order.map(i=>i.cardId),day1.flatMap(id=>Array(size(id)).fill(id)));
// 카드 하나의 index 0..n-1이 그 카드의 서로 다른 모든 변형(주관식 변형 + 객관식)을 정확히 덮는다.
for(const card of cards){
 const mine=state.order.filter(i=>i.cardId===card.id);
 const shown=mine.map(item=>practice.select(card,Array.from({length:Drill.attempts(state,item)},()=>({cardId:card.id})),bank,OPTIONS));
 assert.equal(new Set(shown.map(e=>e.exerciseId)).size,mine.length,'중복 문항: '+card.id);
 assert.equal(shown.filter(e=>e.type==='choice').length,bank[card.id].variants.filter(v=>v.type==='choice').length+(OPTIONS[card.id]?1:0));
 assert.deepEqual(shown.map(e=>e.variantIndex),mine.map(i=>i.index));
}

// 2) 회차 루프: 1회차 전체 → 2회차는 틀린 문항만, 순서 그대로 → 다 맞히면 끝.
const wrongKeys=new Set([state.order[3].key,state.order[7].key,state.order[100].key]);
const served=[];
while(Drill.current(state)){const item=Drill.current(state);served.push({key:item.key,round:state.round});state=Drill.answer(state,item.cardId,item.index,!(state.round===1&&wrongKeys.has(item.key)));}
assert.equal(served.filter(s=>s.round===1).length,total,'1회차는 범위 전체를 한 번씩');
assert.deepEqual(served.filter(s=>s.round===1).map(s=>s.key),state.order.map(i=>i.key));
assert.deepEqual(served.filter(s=>s.round===2).map(s=>s.key),state.order.filter(i=>wrongKeys.has(i.key)).map(i=>i.key),'2회차는 틀린 문항만 같은 순서로');
assert.equal(served.filter(s=>s.round>2).length,0);
assert.equal(state.total,total,'반복은 1회차 총량을 늘리지 않는다');
assert.ok(Drill.finished(state));
assert.equal(Drill.label(state),'전부 풀기 완료 · 129문항을 모두 맞혔어요');
// 계속 틀리면 같은 문항만 회차를 거듭한다.
let stuck=Drill.create(scope,cards.slice(0,1),size);
for(let i=0;i<size(day1[0])*3;i++){const item=Drill.current(stuck);stuck=Drill.answer(stuck,item.cardId,item.index,false);}
assert.equal(stuck.round,4);assert.equal(stuck.roundTotal,size(day1[0]));
assert.equal(Drill.label(stuck),'4회차 1/'+size(day1[0])+' · 틀린 문제만');
// 진행 표시: 1회차는 범위 전체 기준, 2회차부터는 남은 오답 기준.
let shown=Drill.create(scope,cards,size);
assert.equal(Drill.label(shown),'1회차 1/129 · 이 범위 전부 풀기');
for(let i=0;i<36;i++){const item=Drill.current(shown);shown=Drill.answer(shown,item.cardId,item.index,true);}
assert.equal(Drill.label(shown),'1회차 37/129 · 이 범위 전부 풀기');
assert.deepEqual(Drill.progress(shown),{round:1,done:36,roundTotal:129,total:129,finished:false,left:93});
// 차례가 아닌 문항의 채점은 진행을 움직이지 못한다.
assert.equal(Drill.answer(shown,'other-card',0,true),shown);
assert.equal(Drill.answer(shown,Drill.current(shown).cardId,99,true),shown);

// 3) 복습 게이트(내일 due · 5분 재시도 · 10분 형제 간격)를 모두 무시한다.
const src=fs.readFileSync(__dirname+'/app.js','utf8');
const from=src.indexOf('// A wrong answer today'),to=src.indexOf('let creditHistoryLimit');
assert.ok(from>0&&to>from,'app.js의 복습 대기열 블록을 찾지 못했습니다');
// 대기열은 실제 시계를 쓰므로(ReviewLearning.queue의 기본값) 날짜도 오늘을 기준으로 만든다.
const clock=new Date(),stamp=ReviewSchedule.day(clock),tomorrow=ReviewSchedule.plus(stamp,1),yesterday=ReviewSchedule.plus(stamp,-1);
const box={ReviewLearning:global.ReviewLearning,ReviewPolicy:policy,day:()=>stamp,data:{history:[]}};
vm.createContext(box);vm.runInContext(src.slice(from,to),box);
const scheduled=cards.map((c,i)=>({...c,ease:2.5,interval:3,streak:1,created:'2026-09-01',
 due:tomorrow,                                                                       // 오늘 맞혀서 내일로 밀린 카드
 ...(i===1?{retryAt:new Date(clock.getTime()+4*60*1000).toISOString()}:{})}));       // 5분 재시도 대기 중인 카드
box.data.history=cards.map((c,i)=>({id:'h'+i,cardId:c.id,date:stamp,at:new Date(clock.getTime()-60*1000).toISOString(),result:i===1?'wrong':'correct',mode:'quiz'}));
const closed=box.reviewQueue(scheduled);
assert.deepEqual(closed.ready.map(c=>c.id),[],'평소 대기열은 비어 있다 — 이것이 사용자가 막히던 상태');
assert.ok(scheduled.some(c=>c.retryAt&&Date.parse(c.retryAt)>clock.getTime()));
const openAll=Drill.create(scope,scheduled,size);
assert.equal(openAll.order.length,total,'드릴은 due·retryAt·형제 간격과 무관하게 전 문항을 낸다');
assert.deepEqual(new Set(openAll.order.map(i=>i.cardId)),new Set(cards.map(c=>c.id)));
// 형제 간격(ReviewPolicy.separate)이 잡아 두는 같은 개념 카드도 드릴에서는 이어서 나온다.
const siblings=scheduled.filter(c=>policy.concept(c.id)===policy.concept('grammar-verb-lookalike'));
assert.ok(siblings.length>1,'형제 카드 묶음이 있어야 한다');
assert.ok(policy.separate(siblings,box.data.history,clock.getTime()).waiting.length>0,'형제 간격이 실제로 걸려 있어야 한다');
assert.equal(openAll.order.filter(i=>siblings.some(s=>s.id===i.cardId)).length,siblings.reduce((n,c)=>n+size(c.id),0));

// 4) 모드가 꺼져 있으면 대기열과 순서는 그대로다 (현재 동작을 그대로 고정한다).
const seen=cards.map((c,i)=>({id:'y'+i,cardId:c.id,date:yesterday,at:yesterday+'T12:00:00+09:00',result:'correct',mode:'quiz'}));
box.data.history=[...seen];
const plain=cards.map((c,i)=>({...c,ease:2.5,interval:3,streak:1,created:'2026-09-01',due:i<6?yesterday:tomorrow}));
const base=box.reviewQueue(plain);
assert.deepEqual(base.ready.map(c=>c.id),cards.slice(0,6).map(c=>c.id),'due 카드만, 저장 순서 그대로');
assert.deepEqual(base.waiting.map(w=>w.card.id),[]);
box.data.history=[...seen,{id:'w',cardId:cards[0].id,date:stamp,at:new Date(clock.getTime()-60*1000).toISOString(),result:'wrong',mode:'quiz'}];
const after=box.reviewQueue(plain.map(c=>c.id===cards[0].id?{...c,retryAt:new Date(clock.getTime()+60000).toISOString()}:c));
assert.deepEqual(after.ready.map(c=>c.id),cards.slice(1,6).map(c=>c.id),'재시도 대기 카드만 빠지고 나머지 순서는 그대로');
assert.deepEqual(after.waiting.map(w=>w.card.id),['grammar-verb-prep-pair'],'오답의 형제 카드는 10분 간격으로 대기한다');
assert.equal(Drill.sameScope(null,{subject:'',topic:'',round:''}),true);
assert.equal(Drill.sameScope(scope,{subject:'영어',topic:'Day 1'}),true);
assert.equal(Drill.sameScope(scope,{subject:'영어',topic:'수일치'}),false);
assert.equal(Drill.current(null),null);assert.equal(Drill.label(null),'');assert.equal(Drill.progress(null),null);

// 5) 같은 날 반복 풀이가 복습 간격을 부풀리지 않는다.
const now=new Date(2026,8,12,12),today='2026-09-12';
const card0={id:'c',subject:'영어',question:'q',answer:'a',created:'2026-09-01',due:today,ease:2.5,interval:3,streak:2};
const answerWith=(assess,times,result='correct')=>{
 let card=card0,history=[];
 for(let i=0;i<times;i++){
  const pending={...card,pendingAttempt:global.ReviewLearning.begin(card,history,result==='correct'?'remember':'none',now)};
  const out=assess(pending,history,result,now);card=out.card;
  history=[...history,{id:'r'+i,cardId:'c',date:today,at:today+'T12:'+String(i).padStart(2,'0')+':00+09:00',result,mode:'quiz'}];
 }
 return {card,history};
};
const once=answerWith(Drill.assess,1),drilled=answerWith(Drill.assess,12);
assert.equal(once.card.interval,8);
assert.deepEqual({...drilled.card},{...once.card},'12번을 풀어도 카드 일정은 한 번 푼 것과 같다');
const inflated=answerWith(global.ReviewLearning.assess,12);
assert.ok(inflated.card.interval>once.card.interval*4,'대조군: 평소 assess를 12번 부르면 간격이 부풀어 오른다 ('+inflated.card.interval+'일)');
// 기록 자체도 안전하다: 동기화가 히스토리에서 카드를 다시 계산해도 12번은 1번과 같은 결과다
// (sync-core.test.cjs가 지키는 "no same-day interval inflation" 규칙 — 드릴 기록에도 그대로 적용된다).
const blank={version:2,cards:[{...card0}],history:[]};
assert.deepEqual(sync.merge(blank,drilled.history).cards[0],sync.merge(blank,[drilled.history[0]]).cards[0]);
assert.equal(sync.merge(blank,drilled.history).cards[0].interval,1);
// 틀리면 내려가기만 한다: 여러 번 틀려도 하루치 한 번의 실패와 같다.
const missed=answerWith(Drill.assess,5,'wrong');
assert.equal(missed.card.interval,1);assert.equal(missed.card.streak,0);assert.equal(missed.card.ease,2.3);
{const many=sync.merge(blank,missed.history).cards[0],one=sync.merge(blank,[missed.history[0]]).cards[0];
 assert.deepEqual({...many,retryAt:''},{...one,retryAt:''},'여러 번 틀려도 하루치 한 번의 실패와 같다');
 assert.equal(many.retryAt,'2026-09-12T03:09:00.000Z','재시도 시각만 마지막 오답 기준으로 미뤄진다');}
// 맞힌 뒤 같은 날 틀리면 간격은 다시 내려간다 (올라가지는 않는다).
const first=answerWith(Drill.assess,1);
const failing={...first.card,pendingAttempt:global.ReviewLearning.begin(first.card,first.history,'none',now)};
const back=Drill.assess(failing,first.history,'wrong',now);
assert.equal(back.card.interval,1);assert.equal(back.card.streak,0);assert.equal(back.card.due,'2026-09-13');
assert.ok(Date.parse(back.card.retryAt)>now.getTime(),'틀린 답은 평소처럼 재시도 시각을 남긴다');
// 첫 답은 평소와 완전히 같다.
const fresh={...card0,pendingAttempt:global.ReviewLearning.begin(card0,[],'remember',now)};
assert.deepEqual(Drill.assess(fresh,[],'correct',now),global.ReviewLearning.assess(fresh,[],'correct',now));
console.log('PASS drill: '+total+' exercises over '+cards.length+' cards, wrong-only rounds, gates ignored, queue unchanged when off, no same-day interval inflation');
