'use strict';
(function(root){
 // Product policy, not an experimentally established optimal delay.
 const GAP_MS=10*60*1000;
 const groups={
  'grammar-agreement-both':'grammar-agreement-identity',
  'en-session-20260909-while':'grammar-while-during','en-session-20260909-while-short':'grammar-while-during',
  'en-session-20260909-both-whom':'grammar-of-whom','en-session-20260909-all-whom':'grammar-of-whom',
  'core-en-2026national-14':'grammar-voice','en-session-20260909-rage':'grammar-voice',
  'core-en-2026national-13':'grammar-relative-slot',
  'en-session-20260909-knowledge':'grammar-head-agreement','en-session-20260909-debate-head':'grammar-head-agreement'
 };
 // BEGIN STUDY REVIEW GROUPS
 Object.assign(groups,{
  "study-hist-20260910-01": "history-prehistoric-agriculture",
  "study-hist-20260910-02": "history-prehistoric-bronze-artifacts",
  "study-hist-20260910-03": "history-prehistoric-songgukri",
  "study-hist-20260910-04": "history-prehistoric-spindle-whorl",
  "study-hist-20260910-05": "history-prehistoric-dolmen",
  "study-hist-20260910-06": "history-prehistoric-bronze-artifacts",
  "study-hist-20260910-07": "history-prehistoric-sites",
  "study-hist-20260910-08": "history-prehistoric-agriculture-tools",
  "study-hist-20260910-09": "history-gojoseon-wiman-trade",
  "study-hist-20260910-10": "history-buyeo-yeonggo-sado",
  "study-hist-20260910-11": "history-ancient-states-marriage-customs",
  "study-hist-20260910-12": "history-ancient-states-marriage-customs",
  "study-hist-20260910-13": "history-dongye-chaekhwa",
  "study-hist-20260910-14": "history-samhan-political-religious-separation",
  "study-hist-20260910-15": "history-ancient-states-ritual-festivals",
  "study-hist-20260910-16": "history-gojoseon-eight-laws",
  "study-hist-20260910-17": "history-goguryeo-sosurim",
  "study-hist-20260910-18": "history-goguryeo-gogukcheon",
  "study-hist-20260910-19": "history-goguryeo-micheon",
  "study-hist-20260910-20": "history-goguryeo-gwanggaeto",
  "study-hist-20260910-21": "history-goguryeo-jangsu",
  "study-hist-20260910-22": "history-gaya-centres",
  "study-hist-20260910-23": "history-goguryeo-sui-tang",
  "study-hist-20260910-24": "history-fall-of-three-kingdoms",
  "study-hist-20260910-25": "history-baekje-geunchogo",
  "study-hist-20260910-26": "history-buddhism-kings",
  "study-hist-20260910-27": "history-baekje-muryeong",
  "study-hist-20260910-28": "history-baekje-capitals",
  "study-hist-20260910-29": "history-baekje-seong",
  "study-hist-20260910-30": "history-silla-jijeung",
  "study-hist-20260910-31": "history-gaya-annexation",
  "study-hist-20260910-32": "history-silla-jinheung",
  "study-hist-20260910-33": "history-restoration-movements",
  "study-hist-20260910-34": "history-naje-alliance",
  "study-hist-20260910-35": "history-gaya-annexation",
  "study-hist-20260910-36": "history-fall-of-three-kingdoms",
  "study-hist-20260910-37": "history-silla-tang-war",
  "study-hist-20260910-38": "history-baekje-mu",
  "study-hist-20260910-39": "history-silla-steles",
  "study-hist-20260910-40": "history-unification-assessment"
});
 // END STUDY REVIEW GROUPS
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
