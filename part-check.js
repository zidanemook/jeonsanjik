'use strict';
// 파트별 점검(대기열 모드 'parts')의 규칙. 화면, 저장과 떨어진 순수 함수라 node 검사에서 그대로 부른다.
// 한 판 = 고른 범위의 파트를 교재 순서대로 하나씩.
// , 파트마다 먼저 5문제. 모두 맞히면 통과.
// , 하나라도 틀리면(설명 보고 맞힘 포함) 같은 파트에서 3문제 더. 그 3문제를 모두 맞히면 통과, 아니면 또 3문제 …
// , 파트 문제가 바닥나도 통과 못 하면 '다시 볼 파트'(weak)로 두고 다음 파트로.
// , 파트 문제가 모자라면 있는 만큼만 낸다(5 대신 남은 수, 3 대신 남은 수).
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
 // c: {id, fresh, due, solves} / keyOf(id): 고르게 섞을 기준(사실, 개념 묶음) / lastKey: 이 판에서 바로 앞에 푼 문제의 기준.
 const less=(a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]<b[i];return false;};
 function pick(cands,used,lastKey,keyOf){
  let best=null,bestScore=null;
  // v195: 같은 칸(안 푼, 복습일, 나머지)과 같은 사실 안에서는 푼 횟수(c.solves, 모든 기록)가 적은 문제 먼저.
  cands.forEach((c,i)=>{const k=keyOf(c.id),score=[lastKey!==null&&k===lastKey?1:0,c.fresh?0:c.due?1:2,used.get(k)||0,c.solves||0,i];
   if(!bestScore||less(score,bestScore)){best=c;bestScore=score;}});
  return best;
 }
 // 복습 판정(v184, 2026-09-29 사용자: "자체문제 풀때 해설을 보면 뒤에 문제 풀때 맞히기 쉬워지니까").
 // 노출 = 풀이 기록(history 한 줄, 어느 모드든) 또는 해설 펼침(explanationViews {id: 그 풀이 기록 id, openedAt} — 그 풀이의 문제, 개념).
 // 판정에 넣는 퀴즈 풀이 = ① 그 문제를 이전 날에 본 적이 있고 ② 같은 날 이 풀이보다 앞서 같은 개념(쌍둥이 포함, conceptOf)의 어느 문제에도 노출이 없던 풀이.
 // 같은 날 그 문제나 쌍둥이를 풀었거나 해설을 봤으면 연습이라 뺀다(부모 검토: 쌍둥이 해설을 읽고 푼 풀이도 연습). 처음 푼 풀이는 ①에서 빠진다.
 // 날짜: 풀이는 기록의 date(앱의 day(), 복습 일정과 같은 날), 해설은 dayOf(openedAt)(앱이 같은 day()를 넘긴다). 같은 날 안의 앞뒤는 시각(at, openedAt)으로.
 // conceptOf(기록 한 줄) → 개념 키(앱: detail.conceptId || ReviewPolicy.concept(cardId)). 없으면 문제마다 따로.
 // 돌려주는 값: Map(문제 id → 판정에 넣는 가장 최근 풀이의 결과 'correct'|'unsure'|'wrong').
 function delayed(history,views,dayOf,conceptOf=h=>h.cardId){
  const list=[],owner=new Map();
  for(const h of history||[]){if(!h||typeof h.cardId!=='string'||typeof h.date!=='string')continue;const t=Date.parse(h.at||h.date),group=String(conceptOf(h)??h.cardId);
   if(typeof h.id==='string')owner.set(h.id,{card:h.cardId,group});list.push({card:h.cardId,group,day:h.date,t:Number.isFinite(t)?t:0,o:0,k:String(h.id),result:h.mode==='quiz'?h.result:null});}
  for(const v of views||[]){const w=owner.get(v?.id);if(!w||!Number.isFinite(v.openedAt))continue;list.push({...w,day:dayOf(v.openedAt),t:v.openedAt,o:1,k:String(v.id),result:null});}
  list.sort((a,b)=>a.t-b.t||a.o-b.o||(a.k<b.k?-1:a.k>b.k?1:0));
  const out=new Map(),seen=new Set(),first=new Map();
  for(const e of list){const key=e.group+'|'+e.day;if(!first.has(key))first.set(key,e);
   if(e.result&&seen.has(e.card)&&first.get(key)===e)out.set(e.card,e.result);seen.add(e.card);}
  return out;
 }
 // ⚠ 약함: 판정에 넣은 문제가 min(WEAK_MIN, 파트 문제 수) 이상이고 그중 가장 최근 판정 풀이가 틀림(설명 보고 맞힘 포함)인 비율이 WEAK_RATE 이상.
 const WEAK_MIN=20,WEAK_RATE=0.3;
 function judge(ids,results){let reviewed=0,right=0;for(const id of ids){const r=results.get(id);if(!r)continue;reviewed++;if(r==='correct')right++;}
  const n=ids.length,wrong=reviewed-right;return {n,reviewed,right,wrong,weak:reviewed>0&&reviewed>=Math.min(WEAK_MIN,n)&&wrong/reviewed>=WEAK_RATE};}
 const api={FIRST,MORE,WEAK_MIN,WEAK_RATE,evaluate,round,pick,delayed,judge};root.PartCheck=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
