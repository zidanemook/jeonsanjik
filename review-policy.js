'use strict';
(function(root){
 // Product policy, not an experimentally established optimal delay.
 const GAP_MS=10*60*1000;
 const groups={
  'en-session-20260909-while':'grammar-while-during','en-session-20260909-while-short':'grammar-while-during',
  'en-session-20260909-both-whom':'grammar-of-whom','en-session-20260909-all-whom':'grammar-of-whom',
  'core-en-2026national-14':'grammar-voice','en-session-20260909-rage':'grammar-voice',
  'core-en-2026national-13':'grammar-relative-slot',
  'en-session-20260909-knowledge':'grammar-head-agreement','en-session-20260909-debate-head':'grammar-head-agreement'
 };
 const concept=id=>groups[id]||id;
 const order=(a,b)=>at(a)-at(b)||a.id.localeCompare(b.id);
 const at=row=>Date.parse(row.at||row.date+'T12:00:00+09:00');
 function separate(due,history,now=Date.now()){
  const latest=new Map();for(const row of history){const group=row.detail?.conceptId||concept(row.cardId),prev=latest.get(group);if(!prev||order(row,prev)>0)latest.set(group,row);}
  const ready=[],waiting=[];for(const card of due){const last=latest.get(concept(card.id));const until=last&&last.cardId!==card.id?at(last)+GAP_MS:0;if(until>now)waiting.push({card,until});else ready.push(card);}
  return {ready,waiting,nextAt:waiting.length?Math.min(...waiting.map(w=>w.until)):null};
 }
 function classify(history){
  const rows=[...history].sort(order),seen=new Set(),legacyCards=new Set(),latest=new Map(),kinds=new Map();
  for(const row of rows){const d=row.detail,group=d?.conceptId||concept(row.cardId),prior=latest.get(group);let kind='unknown';
   if(d){const recent=prior&&at(row)-at(prior)<GAP_MS;
    if(d.assisted||recent)kind='practice';else if(seen.has(d.exerciseId))kind='repeat';else if(legacyCards.has(row.cardId))kind='unknown';else kind='first';
    seen.add(d.exerciseId);
   }else legacyCards.add(row.cardId);
   kinds.set(row.id,kind);latest.set(group,row);
  }
  return kinds;
 }
 function metrics(history,ids){const kinds=classify(history),result={first:{correct:0,total:0},repeat:{correct:0,total:0},practice:{correct:0,total:0},unknown:{correct:0,total:0}};for(const row of history){if(ids&&!ids.has(row.cardId))continue;const bucket=result[kinds.get(row.id)];bucket.total++;if(row.result==='correct')bucket.correct++;}return {counts:result,kinds};}
 const api={GAP_MS,groups,concept,separate,classify,metrics};root.ReviewPolicy=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
