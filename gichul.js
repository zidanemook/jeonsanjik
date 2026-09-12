'use strict';
// 공무원 9급 기출문제를 카드·객관식 보기로 설치한다. 한능검(hanneung.js)과 같은 자리를 쓰지만
// 원문이 이미지가 아니라 텍스트라는 점이 다르다. 보기는 원문의 ①②③④를 그대로 달고 있으므로
// 순서를 섞지 않는다(fixedOrder). 정답은 공식 정답표의 값이고 앱이 다시 판단하지 않는다.
(function(root){
 if(typeof module!=='undefined'&&module.exports)require('./gichul-data.js');
 const data=root.GICHUL_DATA,symbols=['①','②','③','④','⑤'];
 const papers=data.papers,byPaper=new Map(papers.map((p,i)=>[p.id,{paper:p,order:i}]));
 const id=(paper,n)=>'gichul-'+paper.id+'-'+String(n).padStart(2,'0');
 const byId=new Map();
 for(const paper of papers)for(const q of paper.questions)byId.set(id(paper,q.n),{paper,question:q});
 function title(row){return row?row.paper.title+' '+row.question.n+'번':'';}
 function source(paper,q){
  return '출처: '+paper.body+', 「'+paper.datasetTitle+'」, 공공데이터포털 '+paper.dataset+' (이용허락범위 제한 없음) · '
   +paper.exam+' '+paper.book+' '+paper.subject+' '+q.n+'번 원문 전사 · 공식 정답 '+symbols[q.a-1]+'.';
 }
 function explanation(paper,q){
  const head='공식 정답: '+symbols[q.a-1]+' · '+paper.title+' '+q.n+'번 ('+paper.body+' 공식 정답표).';
  return q.e?head+'\n\n'+q.e:head+'\n\n이 문항은 공식 문제와 정답표를 수록했으며, 상세 해설은 아직 제공하지 않습니다.';
 }
 function install(cards,options){
  for(const paper of papers)for(const q of paper.questions){
   const key=id(paper,q.n),text=explanation(paper,q);
   cards.push({id:key,subject:paper.subject,question:q.q,answer:q.c[q.a-1],explanation:text,source:source(paper,q)});
   options[key]={question:q.q,choices:q.c.slice(),correctIndex:q.a-1,explanation:text,fixedOrder:true};
  }
 }
 // 회차 안에서의 순서는 언제나 원문 문항 번호다. 회차 사이의 순서는 papers 배열 순서를 따른다.
 function rank(cardId){const row=byId.get(cardId);return row?byPaper.get(row.paper.id).order*100+row.question.n:null;}
 const subjects=[...new Set(papers.map(p=>p.subject))];
 const api={
  schema:data.schema,papers,subjects,
  get:cardId=>byId.get(cardId),
  paperOf:cardId=>byId.get(cardId)?.paper.id||null,
  paper:paperId=>byPaper.get(paperId)?.paper||null,
  has:paperId=>byPaper.has(paperId),
  forSubject:subject=>papers.filter(p=>p.subject===subject),
  title,rank,install,cardId:id,explanation,source
 };
 root.Gichul=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else install(root.CORE_REVIEW_PACK,root.QUIZ_OPTIONS);
})(globalThis);
