'use strict';
(function(root){
const RETRY_MS=5*60*1000;
function begin(card,history,recall,now=new Date()){
 if(!['remember','partial','none'].includes(recall))throw Error('Invalid recall');
 const today=ReviewSchedule.day(now), rows=history.filter(h=>h.cardId===card.id);
 return {recall,at:now.toISOString(),date:today,delayedFirst:rows.some(h=>h.date<today)&&!rows.some(h=>h.date===today)&&!card.pendingAttempt};
}
function assess(card,history,result,now=new Date()){
 const attempt=card.pendingAttempt;if(!attempt)throw Error('Recall first');
 if(attempt.recall==='none'&&result!=='wrong')throw Error('No recall is a failed attempt');
 if(attempt.recall==='partial'&&result==='correct')throw Error('Partial recall is not complete');
 const today=ReviewSchedule.day(now),retry=card.retryAt&&ReviewSchedule.day(new Date(card.retryAt))===today;
 const next={...card};delete next.pendingAttempt;delete next.retryAt;
 // 일정은 ReviewSchedule.step 하나로(기회·한 단계 내림·다시 익힘 포함). 틀리면 5분 뒤 다시 풀 수 있다.
 Object.assign(next,ReviewSchedule.schedule(card,result,today));
 if(result!=='correct')next.retryAt=new Date(now.getTime()+RETRY_MS).toISOString();
 return {card:next,entry:{cardId:card.id,date:today,at:now.toISOString(),result,recall:attempt.recall,delayedFirst:attempt.delayedFirst&&attempt.date===today,kind:retry?'relearning':'review',interval:next.interval,ease:next.ease}};
}
// 같은 날 두 번째부터의 답은 복습 간격을 다시 올리지 않는다. 틀리면 내려가기만 한다.
// 기출 회차처럼 한자리에서 여러 번 푸는 흐름이 일정을 부풀리지 않게 한다.
// (동기화의 ProgressSync.merge도 하루의 시도를 한 번으로 접는다 — 같은 규칙이다.)
function assessRepeat(card,history,result,now=new Date()){
 // v139: 제때 전 정답은 단계를 바꾸지 않고, 다시 익히는 중의 오답은 더 내리지 않으므로 같은 날 여러 번 풀어도 일정이 부풀거나 무너지지 않는다.
 return assess(card,history,result,now);
}
function queue(cards,now=new Date()){
 const today=ReviewSchedule.day(now);
 return cards.filter(c=>c.pendingAttempt||(c.retryAt?Date.parse(c.retryAt)<=now.getTime():c.due&&c.due<=today)).sort((a,b)=>Number(!!b.pendingAttempt)-Number(!!a.pendingAttempt)||(a.retryAt||a.due).localeCompare(b.retryAt||b.due));
}
function metrics(cards,history){const ids=new Set(cards.map(c=>c.id)),seen=new Set();const rows=history.filter(h=>{const k=h.cardId+'|'+h.date;if(!ids.has(h.cardId)||h.delayedFirst!==true||seen.has(k))return false;seen.add(k);return true;});return {total:rows.length,correct:rows.filter(h=>h.result==='correct'&&h.recall==='remember').length};}
const api={begin,assess,assessRepeat,queue,metrics,RETRY_MS};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ReviewLearning=api;
})(globalThis);
