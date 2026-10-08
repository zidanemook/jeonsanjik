'use strict';
(function(root){
 const rows=typeof module!=='undefined'&&module.exports?require('./hanneung-data.js'):root.HANNEUNG_DATA;
 // 해설: Node(검사 · 감사)는 hanneung-explanations.js 전체를, 브라우저는 전체 방식이면 전역 전체를, 받는 방식이면 회차 조각(chunks/h-<회>.json)을 받은 만큼만 가진다.
 // 그래서 해설은 쓸 때마다 찾는다. 아직 받지 않은 회차라도 해설이 있는지는 색인(HANNEUNG_EXPLAINED)으로 안다.
 const loadedExplanations=typeof module!=='undefined'&&module.exports?require('./hanneung-explanations.js'):null;
 const explanationOf=id=>(loadedExplanations||root.HANNEUNG_EXPLANATIONS)?.[id];
 const byId=new Map(rows.map(r=>[r.id,r]));
 const rounds=[...new Set(rows.map(r=>r.round))].sort((a,b)=>b-a),symbols=['①','②','③','④','⑤'];
 function title(r){return '한능검 심화 '+r.round+'회 '+r.number+'번 · '+r.points+'점';}
 function explanation(id){
  const r=byId.get(id);if(!r||r.answer===null)return null;
  const intro='국사편찬위원회 공식 정답: '+symbols[r.answer-1]+' · 배점 '+r.points+'점.',e=explanationOf(id);
  if(!e)return intro+'\n이 문제는 공식 문제와 정답표를 수록했으며, 상세 해설은 아직 제공하지 않습니다.';
  // 출처 링크가 아직 없는 해설도 그대로 보여 준다. 없는 것을 있는 척하지 않고 정리한 날만 밝힌다.
  const closing=e.sources?.length?'확인한 자료 · '+e.reviewedOn+'\n'+e.sources.map(s=>s.title+'\n'+s.url).join('\n\n'):'정리한 날 · '+e.reviewedOn+'\n출처 링크는 아직 붙이지 않았습니다.';
  return [intro,'지문에서 잡을 단서\n'+e.clue,'왜 정답인가\n'+e.reason,'보기별 풀이\n'+e.choices.join('\n\n'),'기억 연결\n'+e.hook,closing].join('\n\n');
 }
 let installed=null;
 function install(cards,options){
  installed={cards:new Map(),options};
  for(const r of rows){
   if(r.answer===null)continue;
   const text=explanation(r.id);
   const question=title(r)+'\n원문을 읽고 답을 고르세요.';
   const card={id:r.id,subject:'한국사',question,answer:symbols[r.answer-1],explanation:text,source:'국사편찬위원회 공개 심화 기출 · '+r.round+'회 '+r.number+'번 (원문 '+r.page+'쪽).'};
   cards.push(card);installed.cards.set(r.id,card);
   options[r.id]={question,choices:symbols.slice(),correctIndex:r.answer-1,explanation:text,fixedOrder:true,image:r.image,imageWidth:r.width,imageHeight:r.height};
  }
 }
 // 회차 조각을 받은 뒤: 그 문제들의 해설을 설치해 둔 카드와 보기에 다시 채운다(기출 회차 파일의 fill과 같은 일).
 function refill(ids){if(!installed)return;for(const id of ids){const text=explanation(id),card=installed.cards.get(id);if(text===null||!card)continue;card.explanation=text;if(installed.options[id])installed.options[id].explanation=text;}}
 function stats(round,history){
  const questions=rows.filter(r=>r.round===Number(round)),gradable=questions.filter(r=>r.answer!==null),ids=new Set(gradable.map(r=>r.id)),first=new Map();
  for(const h of history.filter(h=>h.mode==='quiz'&&ids.has(h.cardId)).slice().sort((a,b)=>(a.at||a.date).localeCompare(b.at||b.date)||a.id.localeCompare(b.id)))if(!first.has(h.cardId))first.set(h.cardId,h);
  const bonus=questions.filter(r=>r.answer===null).reduce((s,r)=>s+r.points,0),earned=gradable.filter(r=>first.get(r.id)?.result==='correct').reduce((s,r)=>s+r.points,0);
  return {answered:first.size,total:gradable.length,points:earned+bonus,bonus,complete:first.size===gradable.length&&gradable.length>0};
 }
 const imageMarker=/\n원문 이미지: (assets\/hanneung\/\d{2}-\d{2}-[a-f0-9]{10}\.webp)$/;
 function recorded(id,detail){const row=byId.get(id),image=detail?.question?.match(imageMarker)?.[1];return row&&{...row,image:image||row.image};}
 const api={rows,rounds,get:id=>byId.get(id),title,install,stats,recorded,explanation,refill,hasExplanation:id=>!!explanationOf(id)||!!root.HANNEUNG_EXPLAINED?.has(id),cleanQuestion:s=>s.replace(imageMarker,'')};
 root.Hanneung=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else install(root.CORE_REVIEW_PACK,root.QUIZ_OPTIONS);
})(globalThis);
