'use strict';
// Product convention: one completed quiz attempt equals one credited minute.
// This is a count-based display, not a measurement of time or attention.
(function(root){
 const sync=typeof module!=='undefined'&&module.exports?require('./sync-core.js'):root.ProgressSync;
 const MINUTES_PER_ATTEMPT=1,MINUTES_PER_EXPLANATION=1;
 const day=(ms=Date.now())=>new Date(ms+9*3600000).toISOString().slice(0,10);
 function explanation(row){
  if(!row||typeof row.id!=='string'||!/^[-\w]{1,160}$/.test(row.id)||!Number.isSafeInteger(row.openedAt)||row.openedAt<0||row.openedAt>8640000000000000-9*3600000)throw Error('Invalid explanation view');
  return {id:row.id,openedAt:row.openedAt};
 }
 function unionExplanations(local,remote){
  const byId=new Map();for(const input of [...local,...remote]){const row=explanation(input),prior=byId.get(row.id);if(!prior||row.openedAt<prior.openedAt)byId.set(row.id,row);}
  return [...byId.values()].sort((a,b)=>a.openedAt-b.openedAt||a.id.localeCompare(b.id));
 }
 function summary(history,today,views=[]){
  const days=new Map(),eligible=new Set();let attempts=0,explanations=0,excluded=0;
  const bucket=date=>{if(!days.has(date))days.set(date,{date,attempts:0,explanations:0,minutes:0});return days.get(date);};
  // Replayed sync events are counted once. Separate submitted attempts remain separate.
  for(const row of sync.union([],history)){
   if(row.mode!=='quiz'){excluded++;continue;}
   attempts++;eligible.add(row.id);const b=bucket(row.date);b.attempts++;b.minutes+=MINUTES_PER_ATTEMPT;
  }
  for(const view of unionExplanations([],views)){if(!eligible.has(view.id))continue;explanations++;const b=bucket(day(view.openedAt));b.explanations++;b.minutes+=MINUTES_PER_EXPLANATION;}
  return {attempts,explanations,todayAttempts:days.get(today)?.attempts||0,todayExplanations:days.get(today)?.explanations||0,totalMinutes:attempts*MINUTES_PER_ATTEMPT+explanations*MINUTES_PER_EXPLANATION,todayMinutes:days.get(today)?.minutes||0,excluded,days:[...days.values()].sort((a,b)=>b.date.localeCompare(a.date))};
 }
 function format(minutes){const h=Math.floor(minutes/60),m=minutes%60;return h?h+'시간'+(m?' '+m+'분':''):m+'분';}
 const api={MINUTES_PER_ATTEMPT,MINUTES_PER_EXPLANATION,day,explanation,unionExplanations,summary,format};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.StudyCredit=api;
})(globalThis);
