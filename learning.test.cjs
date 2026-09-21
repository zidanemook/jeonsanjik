const assert=require('node:assert/strict');global.ReviewSchedule=require('./scheduler.js');const L=require('./learning.js'),sync=require('./sync-core.js');
const now=new Date(2026,8,9,12),card={id:'a',due:'2026-09-09',ease:2.5,interval:3,streak:2},history=[{cardId:'a',date:'2026-09-06',result:'correct'}];
let c={...card,pendingAttempt:L.begin(card,history,'none',now)};assert.equal(c.pendingAttempt.delayedFirst,true);assert.throws(()=>L.assess(c,history,'correct',now));let r=L.assess(c,history,'wrong',now);assert.equal(r.entry.delayedFirst,true);assert.equal(L.queue([r.card],now).length,0);const later=new Date(now.getTime()+L.RETRY_MS);assert.equal(L.queue([r.card],later).length,1);const hs=[...history,r.entry];c={...r.card,pendingAttempt:L.begin(r.card,hs,'remember',later)};const success=L.assess(c,hs,'correct',later);assert.equal(success.card.interval,7,"v131: relearned in the 5-minute retry → 7 days");assert.equal(success.card.streak,1);assert.equal(success.card.retryAt,undefined);assert.equal(success.entry.delayedFirst,false);assert.deepEqual(L.metrics([card],[...hs,success.entry]),{total:1,correct:0});assert.deepEqual(L.metrics([card],history),{total:0,correct:0});assert.equal(L.begin(card,[],'remember',now).delayedFirst,false);assert.equal(L.queue([r.card],new Date(2026,8,10,12)).length,1);assert.equal(card.interval,3);assert.equal(L.begin({...card,pendingAttempt:c.pendingAttempt},history,'remember',now).delayedFirst,false);

// assessRepeat — 같은 날 두 번째부터의 답은 복습 간격을 다시 올리지 않는다(기출 회차처럼 한자리에서 여러 번 푸는 흐름).
// v117까지는 drill.js가 갖고 있던 규칙이다. '전부 풀기'를 없애면서 여기로 옮겼고, 지금은 기출 회차가 쓴다.
{
 const now=new Date(2026,8,12,12),today='2026-09-12';
 const card0={id:'c',subject:'영어',question:'q',answer:'a',created:'2026-09-01',due:today,ease:2.5,interval:3,streak:2};
 const answerWith=(assess,times,result='correct')=>{
  let card=card0,history=[];
  for(let i=0;i<times;i++){
   const pending={...card,pendingAttempt:L.begin(card,history,result==='correct'?'remember':'none',now)};
   card=assess(pending,history,result,now).card;
   history=[...history,{id:'r'+i,cardId:'c',date:today,at:today+'T12:'+String(i).padStart(2,'0')+':00+09:00',result,mode:'quiz'}];
  }
  return {card,history};
 };
 const once=answerWith(L.assessRepeat,1),repeated=answerWith(L.assessRepeat,12);
 assert.equal(once.card.interval,30,'v131: third on-time right answer → 30 days');
 assert.deepEqual({...repeated.card},{...once.card},'12번을 풀어도 카드 일정은 한 번 푼 것과 같다');
 const inflated=answerWith(L.assess,12);
 assert.equal(inflated.card.interval,once.card.interval,'v131: due 전에 맞힌 답은 단계를 올리지 않으므로 평소 assess로 12번 불러도 부풀지 않는다');
 // 기록 자체도 안전하다: 동기화가 히스토리에서 카드를 다시 계산해도 12번은 1번과 같은 결과다.
 const blank={version:2,cards:[{...card0}],history:[]};
 assert.deepEqual(sync.merge(blank,repeated.history).cards[0],sync.merge(blank,[repeated.history[0]]).cards[0]);
 assert.equal(sync.merge(blank,repeated.history).cards[0].interval,7,'from history alone: first right answer → 7 days');
 // 틀리면 내려가기만 한다: 여러 번 틀려도 하루치 한 번의 실패와 같다.
 const missed=answerWith(L.assessRepeat,5,'wrong');
 assert.equal(missed.card.interval,1);assert.equal(missed.card.streak,0);assert.equal(missed.card.ease,2.3);
 {const many=sync.merge(blank,missed.history).cards[0],one=sync.merge(blank,[missed.history[0]]).cards[0];
  assert.deepEqual({...many,retryAt:''},{...one,retryAt:''},'여러 번 틀려도 하루치 한 번의 실패와 같다');
  assert.equal(many.retryAt,'2026-09-12T03:09:00.000Z','재시도 시각만 마지막 오답 기준으로 미뤄진다');}
 // 맞힌 뒤 같은 날 틀리면 간격은 다시 내려간다 (올라가지는 않는다).
 const first=answerWith(L.assessRepeat,1);
 const failing={...first.card,pendingAttempt:L.begin(first.card,first.history,'none',now)};
 const back=L.assessRepeat(failing,first.history,'wrong',now);
 assert.equal(back.card.interval,1);assert.equal(back.card.streak,0);assert.equal(back.card.due,'2026-09-13');
 assert.ok(Date.parse(back.card.retryAt)>now.getTime(),'틀린 답은 평소처럼 재시도 시각을 남긴다');
 // 첫 답은 평소와 완전히 같다.
 const fresh={...card0,pendingAttempt:L.begin(card0,[],'remember',now)};
 assert.deepEqual(L.assessRepeat(fresh,[],'correct',now),L.assess(fresh,[],'correct',now));
}
console.log('PASS learning: recall guard, retry timing, next day rollover, no same-day interval inflation, delayed metrics, legacy exclusion, no same-day interval inflation (assessRepeat)');
