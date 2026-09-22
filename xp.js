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
 // v127 리밸런스: 전체 레벨도 과목 레벨과 같은 계단(100+215(L-1))을 쓴다. 상한은 두지 않는다(9999는 평생 못 닿는다).
 const need=level=>100+215*(level-1);
 function level(total){let l=1,rest=total;while(rest>=need(l)){rest-=need(l);l++;}return {level:l,into:rest,need:need(l)};}
 function rows(history){
  return (history||[]).filter(r=>r&&r.mode==='quiz'&&typeof r.cardId==='string'&&typeof r.date==='string')
   .slice().sort((a,b)=>String(a.at||a.date).localeCompare(String(b.at||b.date))||String(a.id).localeCompare(String(b.id)));
 }
 // 기록 전체를 한 번 훑어 행마다 받은 경험치를 매긴다.
 function ledger(history){
  const byCard=new Map(),out=[];
  const lastDate=new Map();
  for(const r of rows(history)){const prev=byCard.get(r.cardId)||[];const a=award(prev,r.result),before=lastDate.get(r.cardId);
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
 // 뱃지 등급(v127 세분화, 하루 1,500 XP 기준 도달): 아이언 0 · 브론즈 3(반나절) · 실버 5(1일) · 골드 8(3.5일) · 플래티넘 12(9일)
 // · 에메랄드 17(18일) · 루비 23(35일) · 다이아 30(60일) · 마스터 40(3.6달) · 그랜드마스터 55(7달) · 챌린저 75(13달) · 레전드 100(23달).
 // 뱃지(v130) = 레벨 문턱과 "외운 비율"을 둘 다 채운 가장 높은 등급.
 // 외운 비율 = 장기기억이 확인된 규칙 ÷ 그 과목(전체 레벨이면 모든 과목)의 전체 규칙(사용자: "맞춘 문제/모든 기출·자체제작 문제 비율").
 // 규칙 = 자체제작은 쌍둥이 묶음 하나, 기출은 문제 하나(쌍둥이를 건너뛰므로 문제 단위로 세면 비율이 영영 못 오른다).
 // 외운 규칙(사용자: "장기기억으로 넘어간 상태임이 확인되면 맞춘 걸로"): 7일 → 14일 → 30일 간격으로 세 번 맞힌 규칙(아래 mastered).
 // 레벨은 "이만큼은 풀었다"는 문턱만(사용자: "레벨 기준은 완화 — 1달 만에 95% 다 외우는 사람도 나올 수 있으니"): 하루 1,500 XP면 레전드 레벨 20까지 약 26일.
 const TIERS=[[20,'legend','레전드',95],[17,'challenger','챌린저',90],[15,'grandmaster','그랜드마스터',88],[13,'master','마스터',85],[11,'diamond','다이아',80],[9,'ruby','루비',75],[7,'emerald','에메랄드',70],[5,'platinum','플래티넘',65],[4,'gold','골드',60],[3,'silver','실버',50],[2,'bronze','브론즈',0],[1,'iron','아이언',0]];
 const LONG_DAYS=7,STAGE_GAPS=[7,14,30];
 const daysBetween=(a,b)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
 const pack=t=>({id:t[1],name:t[2],level:t[0],pct:t[3]});
 // pct가 없으면(외운 비율 모름) 레벨만 본다 — 등급표용.
 function tier(l,pct){
  const byLevel=TIERS.find(([min])=>l>=min);if(pct===undefined)return pack(byLevel);
  const got=TIERS.find(t=>l>=t[0]&&(t[3]===0||pct>=t[3]));const out=pack(got);
  if(byLevel!==got)out.blocked=pack(byLevel);
  return out;
 }
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
 // totals: 과목 → 전체 규칙 수.
 function bySubject(history,views,subjectOf,conceptOf=id=>id,totals={}){
  const list=ledger(history),total=new Map(),rowsOf=new Map(),cardOf=new Map(list.map(r=>[r.id,r.cardId]));
  const add=(cardId,xp)=>{const s=cardId&&subjectOf(cardId);if(!s)return null;total.set(s,(total.get(s)||0)+xp);return s;};
  for(const r of list){const s=add(r.cardId,r.xp);if(s){if(!rowsOf.has(s))rowsOf.set(s,[]);rowsOf.get(s).push(r);}}
  for(const v of views||[])if(Number.isSafeInteger(v?.openedAt))add(cardOf.get(v.id),XP.explanation);
  const out={};for(const [s,xp] of total){const l=subjectLevel(xp),m=mastered(rowsOf.get(s)||[],conceptOf),all=totals[s]||0,pct=pctOf(m.done,all);out[s]={xp,...l,...m,all,pct,tier:tier(l.level,pct)};}
  return out;
 }
 // 전체 레벨 뱃지: 모든 과목의 외운 규칙 ÷ 전체 규칙.
 function overallTier(history,lvl,conceptOf=id=>id,all=0){const m=mastered(ledger(history),conceptOf),pct=pctOf(m.done,all);return {...m,all,pct,tier:tier(lvl,pct)};}
 // 과목별 하루 목표(v135): 오늘 과목마다 푼 횟수(전체 목표와 같은 셈 — 퀴즈 풀이 한 번 = 한 문제).
 function solvesBySubject(history,subjectOf,today=day()){const out={};for(const r of rows(history)){if(r.date!==today)continue;const s=subjectOf(r.cardId);if(s)out[s]=(out[s]||0)+1;}return out;}
 const api={solvesBySubject,XP,TIERS,LONG_DAYS,STAGE_GAPS,award,need,level,ledger,summary,lastAward,day,subjectNeed,subjectLevel,tier,mastered,bySubject,overallTier};
 root.StudyXp=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
