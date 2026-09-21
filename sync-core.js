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
    // 그날 틀렸다가 마지막에 맞혔으면 그날 다시 익힌 것 — 7일 뒤(v131, learning.assess와 같은 규칙).
    if(failed&&last.result==='correct'){progress.streak=1;progress.interval=schedule.STAGE_DAYS[0];progress.due=schedule.plus(date,progress.interval);}
    else if(failed){progress.interval=1;progress.due=schedule.plus(date,1);progress.streak=0;if(last.result==='wrong')retryAt=new Date(Date.parse(last.at)+300000).toISOString();}
    attempts.forEach((r,i)=>derived.set(r.id,{...r,recall:r.result==='correct'?'remember':'none',delayedFirst:r.mode==='quiz'&&priorDay&&i===0,kind:i?'relearning':'review'}));priorDay=true;
   }
   const updated={...card,...progress};delete updated.pendingAttempt;delete updated.retryAt;if(retryAt)updated.retryAt=retryAt;return updated;
  });
  next.history=rows.map(r=>({...state.history.find(h=>h.id===r.id),...(derived.get(r.id)||r)}));return next;
 }
 // Shared study position: the latest explicit scope and open question across devices.
 function session(row){
  const id=/^[\w-]{1,160}$/,text=v=>typeof v==='string'&&v.length<=80;
  if(!row||!Number.isSafeInteger(row.at)||row.at<=0||!text(row.subject)||!text(row.topic)||!text(row.round))throw Error('Invalid session');
  const out={at:row.at,subject:row.subject,topic:row.topic,round:row.round,cardId:null,exerciseId:null,variantIndex:null,type:null,choices:null};
  if(row.cardId===null||row.cardId===undefined)return out;
  if(typeof row.cardId!=='string'||!id.test(row.cardId)||typeof row.exerciseId!=='string'||!id.test(row.exerciseId)||!Number.isInteger(row.variantIndex)||row.variantIndex<0||row.variantIndex>99||!['choice','text'].includes(row.type))throw Error('Invalid session question');
  if(row.type==='choice'&&(!Array.isArray(row.choices)||!row.choices.length||row.choices.length>10||row.choices.some(c=>typeof c!=='string'||c.length>2000)))throw Error('Invalid session choices');
  return {...out,cardId:row.cardId,exerciseId:row.exerciseId,variantIndex:row.variantIndex,type:row.type,choices:row.type==='choice'?[...row.choices]:null};
 }
 // Feedback the reader leaves on a question. Written once and kept verbatim; the same id is the same note.
 function note(row){
  const id=/^[\w-]{1,160}$/;
  if(!row||typeof row.id!=='string'||!id.test(row.id)||typeof row.cardId!=='string'||!id.test(row.cardId)||typeof row.exerciseId!=='string'||row.exerciseId.length>160||!['question','explanation'].includes(row.stage))throw Error('Invalid note identity');
  if(typeof row.subject!=='string'||row.subject.length>80||typeof row.question!=='string'||row.question.length>6000||typeof row.text!=='string'||!row.text.trim()||row.text.length>2000||!Number.isSafeInteger(row.at)||row.at<=0)throw Error('Invalid note');
  return {id:row.id,cardId:row.cardId,exerciseId:row.exerciseId,stage:row.stage,subject:row.subject,question:row.question,text:row.text,at:row.at};
 }
 function unionNotes(local,remote){
  const map=new Map();for(const input of [...local,...remote]){const row=note(input);if(!map.has(row.id))map.set(row.id,row);}
  return [...map.values()].sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id));
 }
 const api={event,union,merge,session,note,unionNotes};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ProgressSync=api;
})(globalThis);
