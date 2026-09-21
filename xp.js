'use strict';
// 경험치·레벨·연속 학습일(v120). 사용자 결정(2026-09-21): 문제를 풀면 맞든 틀리든 언제나 보상이 있고, 강도만 다르다 —
// 처음 맞힌 문제와 틀렸던 문제를 맞힌 경우가 가장 크다. 하루 목표는 기본값이 없고 사용자가 직접 정했을 때만 쓴다.
// 풀이 기록(history)과 해설 기록에서 매번 다시 계산하므로 따로 저장·동기화할 것이 없다(기기마다 같은 레벨).
(function(root){
 const XP={wrong:5,unsure:7,correct:10,first:15,recover:15,explanation:2};
 const day=(ms=Date.now())=>new Date(ms+9*3600000).toISOString().slice(0,10);
 const prevDay=d=>new Date(Date.parse(d+'T00:00:00Z')-86400000).toISOString().slice(0,10);
 // prev: 이 문제의 앞선 결과들(오래된 것부터). 기본 점수는 틀려도 0보다 크다.
 function award(prev,result){
  const parts=[{label:result==='correct'?'정답':result==='unsure'?'풀이':'도전',xp:XP[result]||XP.wrong}];
  if(result==='correct'){
   if(!prev.length)parts.push({label:'처음 맞힘',xp:XP.first});
   else if(prev[prev.length-1]!=='correct')parts.push({label:'틀렸던 문제 맞힘',xp:XP.recover});
  }
  return {xp:parts.reduce((a,p)=>a+p.xp,0),parts};
 }
 // 레벨 L에서 L+1로 가는 데 필요한 경험치. 처음엔 빨리 오르고 조금씩 길어진다.
 const need=level=>100+20*(level-1);
 function level(total){let l=1,rest=total;while(rest>=need(l)){rest-=need(l);l++;}return {level:l,into:rest,need:need(l)};}
 function rows(history){
  return (history||[]).filter(r=>r&&r.mode==='quiz'&&typeof r.cardId==='string'&&typeof r.date==='string')
   .slice().sort((a,b)=>String(a.at||a.date).localeCompare(String(b.at||b.date))||String(a.id).localeCompare(String(b.id)));
 }
 // 기록 전체를 한 번 훑어 행마다 받은 경험치를 매긴다.
 function ledger(history){
  const byCard=new Map(),out=[];
  for(const r of rows(history)){const prev=byCard.get(r.cardId)||[];const a=award(prev,r.result);out.push({id:r.id,cardId:r.cardId,date:r.date,result:r.result,...a});prev.push(r.result);byCard.set(r.cardId,prev);}
  return out;
 }
 function summary(history,views=[],today=day(),goal=null){
  const list=ledger(history),perDay=new Map();let total=0;
  const bump=(d,xp,solve)=>{const x=perDay.get(d)||{date:d,xp:0,solves:0};x.xp+=xp;x.solves+=solve;perDay.set(d,x);};
  for(const r of list){total+=r.xp;bump(r.date,r.xp,1);}
  for(const v of views||[]){if(!Number.isSafeInteger(v?.openedAt))continue;total+=XP.explanation;bump(day(v.openedAt),XP.explanation,0);}
  // 연속 학습일: 하루에 한 문제라도 풀면 이어진다. 오늘 아직 안 풀었으면 어제까지의 연속을 살려 둔다.
  let streak=0,d=perDay.get(today)?.solves?today:prevDay(today);
  while(perDay.get(d)?.solves){streak++;d=prevDay(d);}
  const t=perDay.get(today)||{xp:0,solves:0};
  const g=Number.isInteger(goal)&&goal>0?goal:null;
  return {total,...level(total),todayXp:t.xp,todaySolves:t.solves,streak,solvedToday:t.solves>0,goal:g,goalDone:g?t.solves>=g:false,days:[...perDay.values()].sort((a,b)=>b.date.localeCompare(a.date))};
 }
 // 방금 푼 기록(reviewId)이 받은 경험치와 그 풀이로 레벨이 올랐는지.
 function lastAward(history,views,reviewId){
  const list=ledger(history),i=list.findIndex(r=>r.id===reviewId);if(i<0)return null;
  const viewXp=(views||[]).filter(v=>Number.isSafeInteger(v?.openedAt)).length*XP.explanation;
  const after=list.slice(0,i+1).reduce((a,r)=>a+r.xp,0)+viewXp,before=after-list[i].xp;
  return {...list[i],levelBefore:level(before).level,levelAfter:level(after).level};
 }
 // 과목 레벨(v124): 그 과목 문제에서 받은 경험치(해설 경험치는 그 풀이의 과목으로)만 센다.
 // v125 밸런스(사용자: "한 과목만 다이아까지 2달 걸리는 정도"): 한 과목 하루 약 100문제 × 평균 약 15 XP ≈ 1,500 XP 기준으로
 // 실버(5) 약 1일 · 골드(10) 약 6일 · 플래티넘(20) 약 26일 · 다이아(30) 약 60일(누적 90,190 XP).
 const subjectNeed=l=>100+215*(l-1);
 function subjectLevel(total){let l=1,rest=total;while(rest>=subjectNeed(l)){rest-=subjectNeed(l);l++;}return {level:l,into:rest,need:subjectNeed(l)};}
 // 뱃지 등급: 레벨이 오를수록 색이 바뀐다.
 const TIERS=[[30,'diamond','다이아'],[20,'platinum','플래티넘'],[10,'gold','골드'],[5,'silver','실버'],[1,'bronze','브론즈']];
 const tier=l=>{const t=TIERS.find(([min])=>l>=min);return {id:t[1],name:t[2]};};
 function bySubject(history,views,subjectOf){
  const list=ledger(history),total=new Map(),cardOf=new Map(list.map(r=>[r.id,r.cardId]));
  const add=(cardId,xp)=>{const s=cardId&&subjectOf(cardId);if(!s)return;total.set(s,(total.get(s)||0)+xp);};
  for(const r of list)add(r.cardId,r.xp);
  for(const v of views||[])if(Number.isSafeInteger(v?.openedAt))add(cardOf.get(v.id),XP.explanation);
  const out={};for(const [s,xp] of total){const l=subjectLevel(xp);out[s]={xp,...l,tier:tier(l.level)};}
  return out;
 }
 const api={XP,award,need,level,ledger,summary,lastAward,day,subjectNeed,subjectLevel,tier,bySubject};
 root.StudyXp=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
