'use strict';
// Product convention: one completed quiz attempt equals one credited minute.
// This is a count-based display, not a measurement of time or attention.
(function(root){
 const sync=typeof module!=='undefined'&&module.exports?require('./sync-core.js'):root.ProgressSync;
 const MINUTES_PER_ATTEMPT=1;
 function summary(history,today){
  const days=new Map();let attempts=0,excluded=0;
  // Replayed sync events are counted once. Separate submitted attempts remain separate.
  for(const row of sync.union([],history)){
   if(row.mode!=='quiz'){excluded++;continue;}
   attempts++;days.set(row.date,(days.get(row.date)||0)+1);
  }
  const todayAttempts=days.get(today)||0;
  return {attempts,todayAttempts,totalMinutes:attempts*MINUTES_PER_ATTEMPT,todayMinutes:todayAttempts*MINUTES_PER_ATTEMPT,excluded,days:[...days].sort((a,b)=>b[0].localeCompare(a[0])).map(([date,count])=>({date,attempts:count,minutes:count*MINUTES_PER_ATTEMPT}))};
 }
 function format(minutes){const h=Math.floor(minutes/60),m=minutes%60;return h?h+'시간'+(m?' '+m+'분':''):m+'분';}
 const api={MINUTES_PER_ATTEMPT,summary,format};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.StudyCredit=api;
})(globalThis);
