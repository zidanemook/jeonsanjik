'use strict';
// 파트별 점검(대기열 모드 'parts')의 규칙. 화면·저장과 떨어진 순수 함수라 node 검사에서 그대로 부른다.
// 한 판 = 고른 범위의 파트를 교재 순서대로 하나씩.
//  · 파트마다 먼저 5문제. 모두 맞히면 통과.
//  · 하나라도 틀리면(설명 보고 맞힘 포함) 같은 파트에서 3문제 더. 그 3문제를 모두 맞히면 통과, 아니면 또 3문제 …
//  · 파트 문제가 바닥나도 통과 못 하면 '다시 볼 파트'(weak)로 두고 다음 파트로.
//  · 파트 문제가 모자라면 있는 만큼만 낸다(5 대신 남은 수, 3 대신 남은 수).
// 판의 기록은 따로 없다: 판을 시작한 시각 뒤의 풀이 기록(history)에서 문제마다 첫 답만 읽어 다시 계산한다.
(function(root){
 const FIRST=5,MORE=3;
 // size: 이 판에서 이 파트로 낼 수 있는 문제 수, results: 이 판에서 푼 순서대로의 결과('correct'|'unsure'|'wrong').
 function evaluate(size,results){
  const base={size,answered:results.length,correct:results.filter(r=>r==='correct').length};
  if(!size)return {...base,status:'skip',batch:0,batchSize:0,inBatch:0};
  let pos=0,need=Math.min(FIRST,size),batch=1;
  for(;;){
   const got=results.slice(pos,pos+need);
   if(got.length<need)return {...base,status:pos===0&&!got.length?'todo':'active',batch,batchSize:need,inBatch:got.length};
   if(got.every(r=>r==='correct'))return {...base,status:'pass',batch,batchSize:need,inBatch:need};
   pos+=need;const left=size-pos;
   if(left<=0)return {...base,status:'weak',batch,batchSize:need,inBatch:need};
   need=Math.min(MORE,left);batch++;
  }
 }
 // parts: [{id,title,ids(교재 순서)}], log: Map(cardId → {result,at}) 이 판의 첫 답, eligible(id): 이 판에서 낼 수 있는 문제인가.
 // 판에서 이미 답한 문제는 외운 문제가 되었어도 그대로 센다(판 도중에 수가 줄지 않게).
 function round(parts,log,eligible){
  const out=parts.map(p=>{
   const ids=p.ids.filter(id=>log.has(id)||eligible(id));
   const answered=ids.filter(id=>log.has(id)).sort((a,b)=>log.get(a).at.localeCompare(log.get(b).at)||a.localeCompare(b));
   return {...p,pool:ids,answeredIds:answered,...evaluate(ids.length,answered.map(id=>log.get(id).result))};
  });
  const current=out.findIndex(p=>p.status==='todo'||p.status==='active');
  return {parts:out,current,done:current<0,passed:out.filter(p=>p.status==='pass'),weak:out.filter(p=>p.status==='weak')};
 }
 // 다음 문제: 같은 내용이 바로 이어 나오지 않게 → 안 푼 문제 → 복습일이 된 문제 → 나머지, 그 안에서 이 판에 덜 나온 사실 먼저, 교재 순서.
 // c: {id, fresh, due} · keyOf(id): 고르게 섞을 기준(사실·개념 묶음) · lastKey: 이 판에서 바로 앞에 푼 문제의 기준.
 const less=(a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]<b[i];return false;};
 function pick(cands,used,lastKey,keyOf){
  let best=null,bestScore=null;
  cands.forEach((c,i)=>{const k=keyOf(c.id),score=[lastKey!==null&&k===lastKey?1:0,c.fresh?0:c.due?1:2,used.get(k)||0,i];
   if(!bestScore||less(score,bestScore)){best=c;bestScore=score;}});
  return best;
 }
 const api={FIRST,MORE,evaluate,round,pick};root.PartCheck=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
