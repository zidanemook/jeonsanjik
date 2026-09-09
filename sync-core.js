'use strict';
(function(root){
 const schedule=typeof module!=='undefined'&&module.exports?require('./scheduler.js'):root.ReviewSchedule;
 const record=typeof module!=='undefined'&&module.exports?require('./review-record.js'):root.ReviewRecord;
 const order=(a,b)=>a.date.localeCompare(b.date)||a.at.localeCompare(b.at)||a.id.localeCompare(b.id);
 function event(row){
  if(!row||typeof row.id!=='string'||!/^[\w-]{1,160}$/.test(row.id)||typeof row.cardId!=='string'||!/^[\w-]{1,160}$/.test(row.cardId)||!/^\d{4}-\d{2}-\d{2}$/.test(row.date)||schedule.plus(row.date,0)!==row.date||!['correct','wrong','unsure'].includes(row.result))throw Error('Invalid review event');
  const at=row.at||row.date+'T12:00:00+09:00';if(!Number.isFinite(Date.parse(at)))throw Error('Invalid event time');
  const out={id:row.id,cardId:row.cardId,date:row.date,at:new Date(at).toISOString(),result:row.result,mode:row.mode==='quiz'?'quiz':'legacy'};if(row.detail!==undefined)out.detail=record.validate(row.detail);return out;
 }
 function union(local,remote){
  const map=new Map();for(const input of [...local,...remote]){const row=event(input),prev=map.get(row.id);if(prev){const {detail:pd,...pb}=prev,{detail:rd,...rb}=row;if(JSON.stringify(pb)!==JSON.stringify(rb)||(pd&&rd&&JSON.stringify(pd)!==JSON.stringify(rd)))throw Error('Conflicting review event');if(pd&&!rd)continue;}map.set(row.id,row);}return [...map.values()].sort(order);
 }
 function merge(state,remote){
  const rows=union(state.history,remote),next=structuredClone(state),byCard=new Map(),derived=new Map();
  for(const row of rows){if(!byCard.has(row.cardId))byCard.set(row.cardId,[]);byCard.get(row.cardId).push(row);}
  next.cards=next.cards.map(card=>{
   const events=byCard.get(card.id);if(!events?.length)return card;
   const days=new Map();for(const row of events){if(!days.has(row.date))days.set(row.date,[]);days.get(row.date).push(row);}
   let progress={ease:2.5,interval:0,streak:0},priorDay=false,retryAt;
   for(const [date,attempts]of days){
    // Concurrent attempts remain in history, but cannot inflate a day's interval.
    const failed=attempts.find(r=>r.result!=='correct'),last=attempts.at(-1);
    progress=schedule.schedule(progress,failed?.result||'correct',date);retryAt=undefined;
    if(failed){progress.interval=1;progress.due=schedule.plus(date,1);progress.streak=0;if(last.result==='wrong')retryAt=new Date(Date.parse(last.at)+300000).toISOString();}
    attempts.forEach((r,i)=>derived.set(r.id,{...r,recall:r.result==='correct'?'remember':'none',delayedFirst:r.mode==='quiz'&&priorDay&&i===0,kind:i?'relearning':'review'}));priorDay=true;
   }
   const updated={...card,...progress};delete updated.pendingAttempt;delete updated.retryAt;if(retryAt)updated.retryAt=retryAt;return updated;
  });
  next.history=rows.map(r=>({...state.history.find(h=>h.id===r.id),...(derived.get(r.id)||r)}));return next;
 }
 const api={event,union,merge};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ProgressSync=api;
})(globalThis);
