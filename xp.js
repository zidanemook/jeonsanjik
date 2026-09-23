'use strict';
// 경험치·레벨·연속 학습일(v120). 사용자 결정(2026-09-21): 문제를 풀면 맞든 틀리든 언제나 보상이 있고, 강도만 다르다 —
// 처음 맞힌 문제와 틀렸던 문제를 맞힌 경우가 가장 크다. 하루 목표는 기본값이 없고 사용자가 직접 정했을 때만 쓴다.
// 풀이 기록(history)과 해설 기록에서 매번 다시 계산하므로 따로 저장·동기화할 것이 없다(기기마다 같은 레벨).
(function(root){
 const RS=typeof module!=='undefined'&&module.exports?require('./scheduler.js'):root.ReviewSchedule;
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
 function award(prev,result,step,recovered){
  const parts=[{label:result==='correct'?'정답':result==='unsure'?'풀이':'도전',xp:XP[result]||XP.wrong}];
  if(result==='correct'){
   if(!prev.length)parts.push({label:'처음 맞힘',xp:XP.first});
   // 틀렸던 문제 맞힘: 한 단계 내려가거나 처음부터 다시 익힌 뒤의 정답(기회로 맞힌 것은 기본 점수만 — 일부러 틀려 얻는 이득 없음).
   else if(recovered===undefined?prev[prev.length-1]!=='correct':recovered)parts.push({label:'틀렸던 문제 맞힘',xp:XP.recover});
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
  const lastDate=new Map(),state=new Map(),best=new Map(); // best: 문제마다 도달했던 가장 높은 단계(보너스는 처음 도달할 때만)
  for(const r of rows(history)){const prev=byCard.get(r.cardId)||[],before=lastDate.get(r.cardId);
   // 문제마다 복습 일정과 같은 단계 규칙(ReviewSchedule.step): 기회 · 한 단계 내림 · 다시 익힘.
   const mv=RS.step(state.get(r.cardId),r.result,r.date);let step=null;
   if(mv.event!=='early')state.set(r.cardId,mv.state);
   if(mv.event==='advance'){const stg=RS.stageOf(mv.state.streak),top=best.get(r.cardId)||0;if(stg>top){step=stg;best.set(r.cardId,stg);}}
   const recovered=mv.event==='relearned';
   const a=award(prev,r.result,step,recovered);
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
 // 등급표(뱃지 색). v138에는 과목마다 뱃지 하나(자체제작·기출 외운 비율 반반)였고, v146부터 과목마다 뱃지 둘(아래 examBadge · selfBadge).
 // 레벨(노력)은 과목마다 숫자 하나로 그대로 — 육각형 안의 숫자. 등급 문턱은 두 뱃지가 같이 쓴다(기출은 예상 점수, 자체제작은 %).
 // 외운 규칙은 7일 → 14일 → 30일에 세 번 맞힌 규칙(아래 mastered) — 사용자가 이 엄격함을 그대로 두기로 했다(2026-09-22).
 const TIERS=[[95,'legend','레전드'],[90,'challenger','챌린저'],[88,'grandmaster','그랜드마스터'],[85,'master','마스터'],[80,'diamond','다이아'],[75,'ruby','루비'],[70,'emerald','에메랄드'],[65,'platinum','플래티넘'],[60,'gold','골드'],[50,'silver','실버'],[25,'bronze','브론즈'],[0,'iron','아이언']];
 const LONG_DAYS=7,STAGE_GAPS=[7,14,30];
 const daysBetween=(a,b)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
 const pack=t=>({id:t[1],name:t[2],pct:t[0]});
 function tier(pct=0){return pack(TIERS.find(t=>pct>=t[0]));}
 const isExam=id=>/^(gichul|hanneung)-/.test(id);
 // 외운 규칙(v131, 사용자: "장기기억 기준은 7일·14일·1달 3번에 걸쳐 맞춘 문제", "틀리게 되면 장기기억이었던 문제라도 다시 틀린 문제").
 // 규칙(쌍둥이 묶음)마다 복습 일정과 같은 단계 규칙(ReviewSchedule.step)을 돌린다 — streak ≥ MASTER_STREAK(7·14·30일 통과)면 외움.
 function conceptStates(list,conceptOf){const state=new Map();
  for(const r of list){const k=conceptOf(r.cardId),out=RS.step(state.get(k),r.result,r.date);if(out.event!=='early')state.set(k,out.state);}
  return state;}
 function mastered(list,conceptOf){const state=conceptStates(list,conceptOf);
  const stages=[0,0,0,0];for(const st of state.values())stages[RS.stageOf(st.streak)]++;
  return {done:stages[3],checked:stages[1]+stages[2]+stages[3],stages};}
 const pctOf=(done,total)=>total?Math.floor(done/total*1000)/10:0;
 const round1=x=>Math.round(x*10)/10;
 // 다음 등급과 남은 차이(뱃지 설명). 가장 높은 등급이면 null.
 function nextTier(value){const i=TIERS.findIndex(t=>value>=t[0]),n=TIERS[i-1];return n?{id:n[1],name:n[2],pct:n[0],gap:round1(n[0]-value)}:null;}
 // ── 뱃지(v146, 사용자 결정 2026-09-23): 과목마다 레벨(노력, 숫자 하나)과 뱃지 둘.
 //  · 기출 뱃지 = 예상 점수(score.js: 공무원 9급 기출을 처음 풀었을 때의 정답률)를 0~100%로 보고 같은 12등급에 댄다. 10문제 미만이면 등급 없음('아직').
 //  · 자체제작 뱃지 = 파트마다 외운 비율(외운 규칙 / 파트의 규칙 수)의 평균. 파트는 문제 수와 상관없이 같은 무게 — 큰 파트가 덮지 않고 약한 파트가 끌어내린다.
 //    파트가 없는 자체제작 문제는 앱이 범위(연습 주제)마다 한 파트로, 그것도 없으면 과목마다 '그 밖의 문제' 한 파트로 묶어 넘긴다(app.js selfGroups).
 //    TODO(모의고사): 자체제작 문제로 만든 모의고사(docs/MOCK-EXAM-PLAN-2026-09-20.md, 아직 없음)가 생기면 그 결과도 여기서 센다 — 아직은 아무것도 하지 않는다.
 // examBadge(row): row = ExamScore.summary(...).subjects의 한 과목({n, ready, need, score}).
 function examBadge(row){
  const n=row?.n||0;
  if(!row||!row.ready||!Number.isFinite(row.score))return {kind:'exam',ready:false,n,need:Math.max(0,(row?.need??10)),score:null,tier:null,next:null};
  return {kind:'exam',ready:true,n,correct:row.correct,score:row.score,tier:tier(row.score),next:nextTier(row.score)};
 }
 // states: conceptStates(자체제작 풀이 행) · groups: [{id,title,ids,scope}] — 과목의 파트(+대체 묶음).
 // 약한 파트: 외운 비율이 낮은 순. 같으면 지금 틀려 있는(마지막에 틀리고 아직 다시 못 맞힌) 비율이 높은 파트 먼저,
 // 그다음 풀어 본 파트(안 푼 파트가 0%인 건 당연하니), 그다음 교재 순서.
 function selfBadge(states,groups,conceptOf=id=>id,weakCount=2){
  const out=[];
  groups.forEach((g,order)=>{const keys=new Set(g.ids.filter(id=>!isExam(id)).map(conceptOf));if(!keys.size)return;let done=0,tried=0,missed=0;
   for(const k of keys){const st=states.get(k);if(!st)continue;tried++;if(RS.stageOf(st.streak)>=3)done++;if(st.relearn||st.chance)missed++;}
   out.push({id:g.id,title:g.title,scope:g.scope||null,all:keys.size,done,tried,missed,pct:pctOf(done,keys.size),order});});
  if(!out.length)return {kind:'self',ready:false,pct:null,tier:null,next:null,groups:[],weakest:[]};
  const pct=Math.floor(out.reduce((a,g)=>a+g.pct,0)/out.length*10)/10;
  const weakest=out.filter(g=>g.pct<100).sort((a,b)=>a.pct-b.pct||b.missed/b.all-a.missed/a.all||Number(b.tried>0)-Number(a.tried>0)||a.order-b.order).slice(0,weakCount);
  return {kind:'self',ready:true,pct,tier:tier(pct),next:nextTier(pct),groups:out,weakest};
 }
 // 전체 뱃지(홈 카드): 과목 뱃지의 평균(과목마다 같은 무게). 등급이 있는 과목만.
 function overallBadges(per){
  const list=Object.entries(per||{});
  const exam=list.filter(([,b])=>b.exam?.ready).map(([s,b])=>({subject:s,value:b.exam.score}));
  const waiting=list.filter(([,b])=>b.exam&&!b.exam.ready).map(([s,b])=>({subject:s,need:b.exam.need}));
  const self=list.filter(([,b])=>b.self?.ready).map(([s,b])=>({subject:s,value:b.self.pct}));
  const avg=xs=>xs.length?round1(xs.reduce((a,x)=>a+x.value,0)/xs.length):null;
  const e=avg(exam),m=avg(self);
  return {exam:{kind:'exam',overall:true,ready:e!==null,score:e,tier:e===null?null:tier(e),next:e===null?null:nextTier(e),subjects:exam,waiting},
   self:{kind:'self',overall:true,ready:m!==null,pct:m,tier:m===null?null:tier(m),next:m===null?null:nextTier(m),subjects:self}};
 }
 const num=x=>Number.isInteger(x)?String(x):x.toFixed(1);
 // 뱃지를 눌렀을 때의 짧은 설명(쉬운 말만). {title, lines, weakLabel, weak:[{title,pct,scope}], note}
 function explainBadge(b){
  const exam=b.kind==='exam',label=(b.overall?'전체 ':'')+(exam?'기출':'자체제작')+' 뱃지',unit=exam?'점':'%';
  const title=label+' · '+(b.ready?b.tier.name:'아직'),lines=[];let note='',weak=[];
  const nextLine=()=>b.next?'다음 등급('+b.next.name+' '+b.next.pct+unit+')까지 '+num(b.next.gap)+unit+' 남았어요':'가장 높은 등급('+b.tier.name+')이에요';
  if(exam&&!b.overall){
   if(b.ready){lines.push('기출을 처음 풀었을 때 기준 예상 점수: '+b.score+'점',nextLine());note='처음 푼 기출 '+b.n+'문제 기준이에요. 다시 풀어서 맞힌 건 점수에 넣지 않아요.';}
   else{lines.push('기출을 처음 풀었을 때 기준 예상 점수로 등급을 매겨요.',b.n?'지금까지 처음 푼 기출 '+b.n+'문제 — '+b.need+'문제 더 풀면 등급이 나와요.':'아직 푼 기출이 없어요 — '+b.need+'문제를 풀면 등급이 나와요.');}
  }else if(exam){
   if(b.ready){lines.push('과목마다 기출 예상 점수의 평균: '+num(b.score)+'점',b.subjects.map(x=>x.subject+' '+x.value+'점').join(' · '),nextLine());}
   else lines.push('기출을 10문제 이상 처음 푼 과목이 생기면 등급이 나와요.');
   if(b.waiting.length)note='아직 등급이 없는 과목: '+b.waiting.map(x=>x.subject+'('+x.need+'문제 더)').join(' · ');
  }else if(!b.overall){
   if(b.ready){lines.push('파트별로 외운 비율의 평균: '+num(b.pct)+'%',nextLine());weak=b.weakest.map(g=>({title:g.title,pct:g.pct,scope:g.scope}));
    note='외운 문제 = 맞힌 뒤 7일 · 14일 · 30일 뒤에 다시 맞힌 문제예요. 파트마다 문제 수와 상관없이 같은 무게로 평균을 내서, 약한 파트가 있으면 등급이 내려가요.';}
   else lines.push('이 과목은 아직 자체제작 문제가 없어요.');
  }else{
   if(b.ready)lines.push('과목마다 자체제작 뱃지 비율의 평균: '+num(b.pct)+'%',b.subjects.map(x=>x.subject+' '+num(x.value)+'%').join(' · '),nextLine());
   else lines.push('자체제작 문제가 있는 과목이 없어요.');
  }
  return {title,lines,weakLabel:weak.length?'가장 약한 파트':'',weak,note};
 }
 // 과목 레벨(노력). 뱃지(실력)는 따로 — examBadge · selfBadge.
 function bySubject(history,views,subjectOf){
  const list=ledger(history),total=new Map(),cardOf=new Map(list.map(r=>[r.id,r.cardId]));
  const add=(cardId,xp)=>{const s=cardId&&subjectOf(cardId);if(!s)return null;total.set(s,(total.get(s)||0)+xp);return s;};
  for(const r of list)add(r.cardId,r.xp);
  for(const v of views||[])if(Number.isSafeInteger(v?.openedAt))add(cardOf.get(v.id),XP.explanation);
  const out={};for(const [s,xp] of total)out[s]={xp,...subjectLevel(xp)};
  return out;
 }
 // 과목별 하루 목표(v135): 오늘 과목마다 푼 횟수(전체 목표와 같은 셈 — 퀴즈 풀이 한 번 = 한 문제).
 function solvesBySubject(history,subjectOf,today=day()){const out={};for(const r of rows(history)){if(r.date!==today)continue;const s=subjectOf(r.cardId);if(s)out[s]=(out[s]||0)+1;}return out;}
 const api={solvesBySubject,XP,TIERS,LONG_DAYS,STAGE_GAPS,award,need,level,ledger,summary,lastAward,day,subjectNeed,subjectLevel,tier,isExam,conceptStates,mastered,nextTier,examBadge,selfBadge,overallBadges,explainBadge,bySubject};
 root.StudyXp=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
