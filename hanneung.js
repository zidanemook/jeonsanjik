'use strict';
(function(root){
 const rows=typeof module!=='undefined'&&module.exports?require('./hanneung-data.js'):root.HANNEUNG_DATA;
 const byId=new Map(rows.map(r=>[r.id,r]));
 const rounds=[...new Set(rows.map(r=>r.round))].sort((a,b)=>b-a),symbols=['①','②','③','④','⑤'];
 function title(r){return '한능검 심화 '+r.round+'회 '+r.number+'번 · '+r.points+'점';}
 function install(cards,options){
  for(const r of rows){
   if(r.answer===null)continue;
   const explanation='국사편찬위원회 공식 정답: '+symbols[r.answer-1]+' · 배점 '+r.points+'점.\n이 문항은 공식 문제와 정답표를 수록했으며, 상세 해설은 아직 제공하지 않습니다.';
   const question=title(r)+'\n원문을 읽고 답을 고르세요.';
   cards.push({id:r.id,subject:'한국사',question,answer:symbols[r.answer-1],explanation,source:'국사편찬위원회 공개 심화 기출 · '+r.round+'회 '+r.number+'번 (원문 '+r.page+'쪽).'});
   options[r.id]={question,choices:symbols.slice(),correctIndex:r.answer-1,explanation,fixedOrder:true,image:r.image,imageWidth:r.width,imageHeight:r.height};
  }
 }
 function stats(round,history){
  const questions=rows.filter(r=>r.round===Number(round)),gradable=questions.filter(r=>r.answer!==null),ids=new Set(gradable.map(r=>r.id)),first=new Map();
  for(const h of history.filter(h=>h.mode==='quiz'&&ids.has(h.cardId)).slice().sort((a,b)=>(a.at||a.date).localeCompare(b.at||b.date)||a.id.localeCompare(b.id)))if(!first.has(h.cardId))first.set(h.cardId,h);
  const bonus=questions.filter(r=>r.answer===null).reduce((s,r)=>s+r.points,0),earned=gradable.filter(r=>first.get(r.id)?.result==='correct').reduce((s,r)=>s+r.points,0);
  return {answered:first.size,total:gradable.length,points:earned+bonus,bonus,complete:first.size===gradable.length&&gradable.length>0};
 }
 const imageMarker=/\n원문 이미지: (assets\/hanneung\/\d{2}-\d{2}-[a-f0-9]{10}\.webp)$/;
 function recorded(id,detail){const row=byId.get(id),image=detail?.question?.match(imageMarker)?.[1];return row&&{...row,image:image||row.image};}
 const api={rows,rounds,get:id=>byId.get(id),title,install,stats,recorded,cleanQuestion:s=>s.replace(imageMarker,'')};
 root.Hanneung=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else install(root.CORE_REVIEW_PACK,root.QUIZ_OPTIONS);
})(globalThis);
