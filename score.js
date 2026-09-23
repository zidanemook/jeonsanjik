'use strict';
// 예상점수(v121). 실제 시험 점수는 공무원 9급 기출을 "처음 풀었을 때"의 정답률로만 추정한다.
// 자체제작 문제는 같은 규칙을 여러 번 풀고 해설도 보므로 정답률이 부풀어 점수에 넣지 않고 참고로만 보여 준다.
// 표본이 적으면 한 숫자가 크게 흔들리므로 80% 범위를 함께 낸다(베타 사후분포의 정규 근사, 사전 1/1).
// 기본 목표는 국가직 전산9급 95(가산 포함) · 가산 5(사용자 지정, 2026-09-21). 2027년부터 순위는 국어·영어·컴퓨터일반·정보보호론 4과목 평균(한국사는 한능검 대체) + 가산점으로 본다.
(function(root){
 const RANKED=['국어','영어','컴퓨터일반','정보보호론'],MIN=10,Z80=1.2816;
 const DEFAULT_TARGET={name:'국가직 전산9급',cutoff:95,bonus:5};
 const official=id=>/^gichul-/.test(id),hanneung=id=>/^hanneung-/.test(id);
 function target(t){
  const ok=t&&typeof t.name==='string'&&t.name.trim().length>0&&t.name.length<=40&&Number.isFinite(t.cutoff)&&t.cutoff>0&&t.cutoff<=110&&Number.isFinite(t.bonus)&&t.bonus>=0&&t.bonus<=10;
  return ok?{name:t.name.trim(),cutoff:t.cutoff,bonus:t.bonus}:{...DEFAULT_TARGET};
 }
 // 문제마다 처음 푼 기록 하나. 'unsure'(설명을 보고 맞힘)는 시험에선 못 받는 도움이라 틀린 것으로 센다.
 function firstAttempts(history){
  const first=new Map();
  for(const r of history||[]){if(!r||r.mode!=='quiz'||typeof r.cardId!=='string')continue;const k=String(r.at||r.date),p=first.get(r.cardId);if(!p||k<p.k||(k===p.k&&String(r.id)<String(p.id)))first.set(r.cardId,{k,id:r.id,ok:r.result==='correct'});}
  return first;
 }
 function estimate(k,n){
  const m=(k+1)/(n+2),sd=Math.sqrt(m*(1-m)/(n+3)),clip=x=>Math.max(0,Math.min(100,x*100));
  return {score:Math.round(clip(m)),low:Math.round(clip(m-Z80*sd)),high:Math.round(clip(m+Z80*sd)),raw:n?Math.round(k/n*100):0};
 }
 // subjectOf(cardId) → 과목 이름(없으면 null). 과목마다 기출 첫 풀이 k/n과 자체제작 첫 풀이 정답률.
 function summary(history,subjectOf,t){
  const first=firstAttempts(history),per=new Map(),get=s=>{if(!per.has(s))per.set(s,{subject:s,n:0,k:0,selfN:0,selfK:0,hN:0,hK:0});return per.get(s);};
  for(const [id,a] of first){const s=subjectOf(id);if(!s)continue;const x=get(s);if(official(id)){x.n++;if(a.ok)x.k++;}else if(hanneung(id)){x.hN++;if(a.ok)x.hK++;}else{x.selfN++;if(a.ok)x.selfK++;}}
  const subjects=[...new Set([...RANKED,...per.keys()])].map(s=>{const x=per.get(s)||{subject:s,n:0,k:0,selfN:0,selfK:0,hN:0,hK:0};
   return {subject:s,ranked:RANKED.includes(s),n:x.n,correct:x.k,ready:x.n>=MIN,need:Math.max(0,MIN-x.n),...(x.n>=MIN?estimate(x.k,x.n):{}),self:x.selfN?{n:x.selfN,rate:Math.round(x.selfK/x.selfN*100)}:null,
    // 한능검 심화 기출 첫 풀이(v146 · 2027년부터 9급 한국사는 한능검 3급 대체라 한국사 기출 뱃지는 이것으로 매긴다). 순위 점수에는 넣지 않는다.
    hanneung:{subject:s,source:'한능검 심화',n:x.hN,correct:x.hK,ready:x.hN>=MIN,need:Math.max(0,MIN-x.hN),...(x.hN>=MIN?estimate(x.hK,x.hN):{})}};});
  const goal=target(t),ranked=subjects.filter(s=>s.ranked),ready=ranked.filter(s=>s.ready);
  let total=null;
  if(ready.length===RANKED.length){
   const avg=f=>ready.reduce((a,s)=>a+s[f],0)/ready.length,score=avg('score')+goal.bonus;
   total={raw:Math.round(avg('score')*10)/10,score:Math.round(score*10)/10,low:Math.round((avg('low')+goal.bonus)*10)/10,high:Math.round((avg('high')+goal.bonus)*10)/10,gap:Math.round((score-goal.cutoff)*10)/10};
  }
  return {target:goal,subjects,total,missing:ranked.filter(s=>!s.ready).map(s=>({subject:s.subject,need:s.need}))};
 }
 const api={RANKED,MIN,DEFAULT_TARGET,target,firstAttempts,estimate,summary};
 root.ExamScore=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
