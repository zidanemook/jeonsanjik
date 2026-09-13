'use strict';
// "이 범위 전부 풀기" — 고른 범위의 모든 문항을 복습 일정과 상관없이 한 번에 푸는 모드.
// 1회차는 범위의 모든 문항을 정해진 순서대로 한 번씩, 2회차부터는 그 회차에서 틀린 문항만 같은 순서로 다시.
// 틀린 문항이 없어지면 끝난다. 이 상태는 저장하지 않는다(세션 한정). 답안 기록은 평소와 완전히 같다.
(function(root){
 function scopeOf(scope){return {subject:scope?.subject||'',topic:scope?.topic||'',round:scope?.round||''};}
 function sameScope(a,b){const x=scopeOf(a),y=scopeOf(b);return x.subject===y.subject&&x.topic===y.topic&&x.round===y.round;}
 // 카드 하나가 가진 모든 변형(주관식 변형 + 객관식)을 index 0..size-1로 펼친다.
 // Practice.select는 "그 카드를 몇 번 풀었나"로 변형을 고르므로, index만 알면 그 변형을 다시 꺼낼 수 있다.
 function items(cards,size){
  const out=[];
  for(const card of cards){const n=size(card.id)|0;for(let index=0;index<n;index++)out.push({cardId:card.id,index,size:n,key:card.id+':'+index});}
  return out;
 }
 function create(scope,cards,size){
  const order=items(cards,size);
  return {scope:scopeOf(scope),order,queue:[...order],wrong:[],round:1,done:0,roundTotal:order.length,total:order.length};
 }
 function current(state){return state&&state.queue.length?state.queue[0]:null;}
 function finished(state){return !!state&&!state.queue.length&&!state.wrong.length;}
 function matches(state,cardId,index){const item=current(state);return !!item&&item.cardId===cardId&&item.index===index;}
 // 한 문항을 채점한 뒤 부르는 유일한 진행 함수. 회차가 끝나면 그 회차에서 틀린 문항만 남긴다.
 function answer(state,cardId,index,correct){
  if(!matches(state,cardId,index))return state;
  const next={...state,queue:state.queue.slice(1),wrong:[...state.wrong],done:state.done+1};
  if(!correct)next.wrong.push(state.queue[0]);
  if(!next.queue.length&&next.wrong.length){next.round=state.round+1;next.queue=next.wrong;next.wrong=[];next.roundTotal=next.queue.length;next.done=0;}
  return next;
 }
 // Practice.select에 넘길 "지금까지 푼 횟수". 같은 변형이라도 회차마다 보기 순서가 새로 섞인다.
 function attempts(state,item){return item.index+((state?.round||1)-1)*(item.size||1);}
 function progress(state){
  if(!state)return null;
  return {round:state.round,done:state.done,roundTotal:state.roundTotal,total:state.total,finished:finished(state),left:state.queue.length};
 }
 function label(state){
  if(!state)return '';
  if(finished(state))return '전부 풀기 완료 · '+state.total+'문제를 모두 맞혔어요';
  return state.round+'회차 '+Math.min(state.done+1,state.roundTotal)+'/'+state.roundTotal+(state.round>1?' · 틀린 문제만':' · 이 범위 전부 풀기');
 }
 // 같은 날 두 번째부터의 답은 복습 간격을 다시 올리지 않는다. 틀리면 내려가기만 한다.
 // (동기화의 ProgressSync.merge도 하루의 시도를 한 번으로 접는다 — 같은 규칙이다.)
 function assess(card,history,result,now=new Date()){
  const out=ReviewLearning.assess(card,history,result,now);
  const today=ReviewSchedule.day(now);
  if(!history.some(h=>h.cardId===card.id&&h.date===today&&h.mode==='quiz'))return out;
  const next={...card};delete next.pendingAttempt;delete next.retryAt;
  if(result!=='correct'){next.interval=1;next.due=ReviewSchedule.plus(today,1);next.streak=0;if(out.card.retryAt)next.retryAt=out.card.retryAt;}
  return {card:next,entry:{...out.entry,interval:next.interval,ease:next.ease}};
 }
 const api={sameScope,items,create,current,finished,matches,answer,attempts,progress,label,assess};
 root.StudyDrill=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
