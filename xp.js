'use strict';
// 경험치·레벨·연속 학습일(v120). 사용자 결정(2026-09-21): 문제를 풀면 맞든 틀리든 언제나 보상이 있고, 강도만 다르다 —
// 처음 맞힌 문제와 틀렸던 문제를 맞힌 경우가 가장 크다. 하루 목표는 기본값이 없고 사용자가 직접 정했을 때만 쓴다.
// 풀이 기록(history)과 해설 기록에서 매번 다시 계산하므로 따로 저장·동기화할 것이 없다(기기마다 같은 레벨).
(function(root){
 // v136 사용자: "틀렸다 다음에 맞추는 거를 점수를 더 주고, 7일 지나면 좀 더 주고, 14일 지나서 맞추면 좀 더 주고".
 // 단계는 복습 일정·외운 규칙과 같다: 맞힌 날부터 7일 → 그 뒤 14일 → 그 뒤 30일(외움), 틀리면 처음부터. 외운 문제를 다시 맞히면 기본 점수만(사용자: "노력한 만큼 — 외운 상태인 거를 맞추는 거는 기본 경험치만").
 // v137 리밸런스(사용자: "점수가 너무 큰 거 아냐 — 적당한 값", "인플레이션이 있으면 안 되는디", "일부러 틀리거나 하지는 않겠지?"):
 // 작은 고정값. 일부러 틀려도 이득이 없게 — 틀림 1 + 다시 맞힘 3 = 처음 맞힘 4, 단계 보너스는 문제마다 처음 도달할 때 한 번만.
 const XP={wrong:1,unsure:1,correct:2,first:2,recover:1,stage:[4,6,10],explanation:1};
 const STAGE_LABELS=['7일 뒤 다시 맞힘','14일 뒤 다시 맞힘','30일 뒤 다시 맞힘 · 외움'];
 const day=(ms=Date.now())=>new Date(ms+9*3600000).toISOString().slice(0,10);
 const prevDay=d=>new Date(Date.parse(d+'T00:00:00Z')-86400000).toISOString().slice(0,10);
 // prev: 이 문제의 앞선 결과들(오래된 것부터). step: 이번 정답으로 오른 단계(1~3) 또는 없음.
 // 기본 점수는 틀려도 0보다 크다.
 function award(prev,result,step){
  const parts=[{label:result==='correct'?'정답':result==='unsure'?'풀이':'도전',xp:XP[result]||XP.wrong}];
  if(result==='correct'){
   if(!prev.length)parts.push({label:'처음 맞힘',xp:XP.first});
   else if(prev[prev.length-1]!=='correct')parts.push({label:'틀렸던 문제 맞힘',xp:XP.recover});
   if(step)parts.push({label:STAGE_LABELS[step-1],xp:XP.stage[step-1]});
  }
  return {xp:parts.reduce((a,p)=>a+p.xp,0),parts};
 }
 // 레벨 L에서 L+1로 가는 데 필요한 경험치. 처음엔 빨리 오르고 조금씩 길어진다.
 // v127 리밸런스: 전체 레벨도 과목 레벨과 같은 계단(100+215(L-1))을 쓴다. 상한은 두지 않는다(9999는 평생 못 닿는다).
 // v137: XP를 약 1/5로 줄이면서 계단도 같이 줄여 오르는 속도는 그대로(한 과목 하루 약 100문제 ≈ 300 XP 기준 레전드 Lv20 약 26일).
 const need=level=>20+43*(level-1);
 function level(total){let l=1,rest=total;while(rest>=need(l)){rest-=need(l);l++;}return {level:l,into:rest,need:need(l)};}
 function rows(history){
  return (history||[]).filter(r=>r&&r.mode==='quiz'&&typeof r.cardId==='string'&&typeof r.date==='string')
   .slice().sort((a,b)=>String(a.at||a.date).localeCompare(String(b.at||b.date))||String(a.id).localeCompare(String(b.id)));
 }
 // 기록 전체를 한 번 훑어 행마다 받은 경험치를 매긴다.
 function ledger(history){
  const byCard=new Map(),out=[];
  const lastDate=new Map(),stage=new Map(),best=new Map(); // best: 문제마다 도달했던 가장 높은 단계(보너스는 처음 도달할 때만)
  for(const r of rows(history)){const prev=byCard.get(r.cardId)||[],before=lastDate.get(r.cardId);
   // 문제마다 단계(mastered와 같은 규칙): 맞힌 날이 기준점, 기준점에서 7·14·30일 이상 지나 맞히면 한 단계.
   let step=null;const st=stage.get(r.cardId);
   if(r.result!=='correct')stage.set(r.cardId,{stage:0,anchor:null});
   else if(!st||!st.anchor)stage.set(r.cardId,{stage:0,anchor:r.date});
   else if(st.stage<STAGE_GAPS.length&&daysBetween(st.anchor,r.date)>=STAGE_GAPS[st.stage]){st.stage++;st.anchor=r.date;const top=best.get(r.cardId)||0;if(st.stage>top){step=st.stage;best.set(r.cardId,st.stage);}}
   const a=award(prev,r.result,step);
   // 장기기억 확인: 앞선 풀이에서 LONG_DAYS일 이상 지나 다시 푼 풀이.
   const check=!!before&&daysBetween(before,r.date)>=LONG_DAYS;
   out.push({id:r.id,cardId:r.cardId,date:r.date,result:r.result,first:!prev.length,check,...a});prev.push(r.result);byCard.set(r.cardId,prev);lastDate.set(r.cardId,r.date);}
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
 const subjectNeed=need;
 function subjectLevel(total){let l=1,rest=total;while(rest>=subjectNeed(l)){rest-=subjectNeed(l);l++;}return {level:l,into:rest,need:subjectNeed(l)};}
 // 뱃지(v138) = 실력. 레벨(노력)과 역할을 나눈다 — 육각형 안의 숫자는 레벨, 색은 외운 비율로 정한 등급(레벨 조건 없음).
 // 외운 비율 = 자체제작 외운 비율과 기출 외운 비율의 평균(규칙 수가 아니라 비율끼리 반반; 한쪽이 없는 과목은 있는 쪽만).
 // 기출 = 공무원 9급 기출(gichul-)·한능검 기출(hanneung-). 규칙 = 자체제작은 쌍둥이 묶음 하나, 기출은 문제 하나.
 // 외운 규칙은 7일 → 14일 → 30일에 세 번 맞힌 규칙(아래 mastered), 틀리면 0단계 — 사용자가 이 엄격함을 그대로 두기로 했다(2026-09-22).
 const TIERS=[[95,'legend','레전드'],[90,'challenger','챌린저'],[88,'grandmaster','그랜드마스터'],[85,'master','마스터'],[80,'diamond','다이아'],[75,'ruby','루비'],[70,'emerald','에메랄드'],[65,'platinum','플래티넘'],[60,'gold','골드'],[50,'silver','실버'],[25,'bronze','브론즈'],[0,'iron','아이언']];
 const LONG_DAYS=7,STAGE_GAPS=[7,14,30];
 const daysBetween=(a,b)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
 const pack=t=>({id:t[1],name:t[2],pct:t[0]});
 function tier(pct=0){return pack(TIERS.find(t=>pct>=t[0]));}
 const isExam=id=>/^(gichul|hanneung)-/.test(id);
 // 외운 규칙(v131, 사용자: "장기기억 기준은 7일·14일·1달 3번에 걸쳐 맞춘 문제", "틀리게 되면 장기기억이었던 문제라도 다시 틀린 문제").
 // 규칙마다 단계 0~3. 맞힌 날(처음, 또는 틀린 뒤 다시 맞힌 날)이 기준점이고, 기준점에서 STAGE_GAPS[단계]일 이상 지나 맞히면 한 단계 오르고 그날이 새 기준점.
 // 3단계(7일 → 14일 → 30일)가 외운 규칙이다. 짧은 간격의 정답은 단계를 바꾸지 않고, 틀리면(설명 보고 맞힘 포함) 언제든 0단계.
 function mastered(list,conceptOf){const state=new Map();
  for(const r of list){const k=conceptOf(r.cardId),st=state.get(k);
   if(r.result!=='correct'){state.set(k,{stage:0,anchor:null});continue;}
   // 처음 맞힌 날(틀린 뒤 다시 맞힌 날)이 기준점 — 거기서부터 7일을 잰다.
   if(!st||!st.anchor){state.set(k,{stage:0,anchor:r.date});continue;}
   if(st.stage<STAGE_GAPS.length&&daysBetween(st.anchor,r.date)>=STAGE_GAPS[st.stage]){st.stage++;st.anchor=r.date;}}
  const stages=[0,0,0,0];for(const st of state.values())stages[st.stage]++;
  return {done:stages[3],checked:stages[1]+stages[2]+stages[3],stages};}
 const pctOf=(done,total)=>total?Math.floor(done/total*1000)/10:0;
 // rows(ledger 행)와 전체 규칙 수 {self,exam}로 외운 비율. 자체제작·기출을 따로 세고 평균.
 function mastery(list,conceptOf,totals={}){
  const self=mastered(list.filter(r=>!isExam(r.cardId)),conceptOf),exam=mastered(list.filter(r=>isExam(r.cardId)),conceptOf);
  const t={self:totals.self||0,exam:totals.exam||0},pSelf=pctOf(self.done,t.self),pExam=pctOf(exam.done,t.exam);
  const pools=[t.self?pSelf:null,t.exam?pExam:null].filter(x=>x!==null),pct=pools.length?Math.floor(pools.reduce((a,b)=>a+b,0)/pools.length*10)/10:0;
  return {pct,done:self.done+exam.done,checked:self.checked+exam.checked,stages:self.stages.map((n,i)=>n+exam.stages[i]),all:t.self+t.exam,
   self:{done:self.done,all:t.self,pct:pSelf},exam:{done:exam.done,all:t.exam,pct:pExam},tier:tier(pct)};
 }
 // totals: 과목 → {self: 자체제작 규칙 수, exam: 기출 규칙 수}.
 function bySubject(history,views,subjectOf,conceptOf=id=>id,totals={}){
  const list=ledger(history),total=new Map(),rowsOf=new Map(),cardOf=new Map(list.map(r=>[r.id,r.cardId]));
  const add=(cardId,xp)=>{const s=cardId&&subjectOf(cardId);if(!s)return null;total.set(s,(total.get(s)||0)+xp);return s;};
  for(const r of list){const s=add(r.cardId,r.xp);if(s){if(!rowsOf.has(s))rowsOf.set(s,[]);rowsOf.get(s).push(r);}}
  for(const v of views||[])if(Number.isSafeInteger(v?.openedAt))add(cardOf.get(v.id),XP.explanation);
  const out={};for(const [s,xp] of total)out[s]={xp,...subjectLevel(xp),...mastery(rowsOf.get(s)||[],conceptOf,totals[s])};
  return out;
 }
 // 전체 뱃지: 모든 과목을 합친 자체제작·기출 외운 비율의 평균.
 function overallTier(history,conceptOf=id=>id,totals={}){return mastery(ledger(history),conceptOf,totals);}
 // 과목별 하루 목표(v135): 오늘 과목마다 푼 횟수(전체 목표와 같은 셈 — 퀴즈 풀이 한 번 = 한 문제).
 function solvesBySubject(history,subjectOf,today=day()){const out={};for(const r of rows(history)){if(r.date!==today)continue;const s=subjectOf(r.cardId);if(s)out[s]=(out[s]||0)+1;}return out;}
 const api={solvesBySubject,XP,TIERS,LONG_DAYS,STAGE_GAPS,award,need,level,ledger,summary,lastAward,day,subjectNeed,subjectLevel,tier,isExam,mastered,mastery,bySubject,overallTier};
 root.StudyXp=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
