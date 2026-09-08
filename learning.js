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
 if(retry&&result==='correct'){next.interval=1;next.due=ReviewSchedule.plus(today,1);next.streak=0;}
 else Object.assign(next,ReviewSchedule.schedule(card,result,today));
 if(result!=='correct'){next.retryAt=new Date(now.getTime()+RETRY_MS).toISOString();next.interval=1;next.due=ReviewSchedule.plus(today,1);}
 return {card:next,entry:{cardId:card.id,date:today,at:now.toISOString(),result,recall:attempt.recall,delayedFirst:attempt.delayedFirst&&attempt.date===today,kind:retry?'relearning':'review',interval:next.interval,ease:next.ease}};
}
function queue(cards,now=new Date()){
 const today=ReviewSchedule.day(now);
 return cards.filter(c=>c.pendingAttempt||(c.retryAt?Date.parse(c.retryAt)<=now.getTime():c.due&&c.due<=today)).sort((a,b)=>Number(!!b.pendingAttempt)-Number(!!a.pendingAttempt)||(a.retryAt||a.due).localeCompare(b.retryAt||b.due));
}
function metrics(cards,history){const ids=new Set(cards.map(c=>c.id)),seen=new Set();const rows=history.filter(h=>{const k=h.cardId+'|'+h.date;if(!ids.has(h.cardId)||h.delayedFirst!==true||seen.has(k))return false;seen.add(k);return true;});return {total:rows.length,correct:rows.filter(h=>h.result==='correct'&&h.recall==='remember').length};}
const api={begin,assess,queue,metrics,RETRY_MS};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ReviewLearning=api;
})(globalThis);
