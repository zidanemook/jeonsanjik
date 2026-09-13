'use strict';
// 공무원 9급 기출문제를 카드·객관식 보기로 설치한다. 한능검(hanneung.js)과 같은 자리를 쓰지만
// 원문이 이미지가 아니라 텍스트라는 점이 다르다. 보기는 원문의 ①②③④를 그대로 달고 있으므로
// 순서를 섞지 않는다(fixedOrder). 정답은 공식 정답표의 값이고 앱이 다시 판단하지 않는다.
//
// 회차 파일은 필요할 때만 받는다.
//  - 시작할 때는 작은 색인(gichul-index.js: 회차·과목·연도·공식 정답·제외 번호)만 싣는다.
//  - 색인만으로 모든 문항의 카드(id·과목·제목·공식 정답·출처)를 만든다. 그래서 과목 문항 수, 복습 일정,
//    회차 첫 시도 점수, 드릴 범위, 동기화 기록은 회차 파일을 받지 않아도 모든 문항을 본다.
//  - 문제 본문과 보기(QUIZ_OPTIONS)는 그 회차의 문항을 처음 낼 때 gichul/<회차 id>.json 하나를 받아 채운다.
//    받은 파일은 색인과 문항 번호·공식 정답이 모두 같아야 붙인다. 서비스 워커는 이 파일을 미리 캐시하지 않고
//    처음 받을 때 기기에 남긴다(다른 자산과 같은 네트워크 우선 캐시).
//  - Node(검사·감사)에서는 모든 회차 파일을 디스크에서 바로 읽는다(gichul-files.cjs).
(function(root){
 const node=typeof module!=='undefined'&&module.exports;
 if(node)require('./gichul-index.js');
 const index=root.GICHUL_INDEX,symbols=['①','②','③','④','⑤'];
 const papers=index.papers.map((row,order)=>{
  const m=/^([a-z0-9]+)-(\d{4})[a-z]?-([a-z]+)$/.exec(row.id);if(!m)throw Error('Bad paper id: '+row.id);
  const sitting=index.sittings[row.id.slice(0,row.id.lastIndexOf('-'))],source=index.sources[m[1]],subject=index.subjects[m[3]];
  if(!sitting||!source||!subject||!/^[0-4]{20}$/.test(row.a))throw Error('Incomplete index row: '+row.id);
  const range=row.range||sitting.range,skip=row.skip||[];
  return {id:row.id,subject,year:Number(m[2]),range,title:range+' '+subject,exam:sitting.exam,book:sitting.book,
   body:source.body,datasetTitle:source.datasetTitle,dataset:source.dataset,answers:row.a,
   numbers:Array.from({length:20},(_,i)=>i+1).filter(n=>!skip.includes(n)),skippedNumbers:skip.slice(),order,
   questions:null,skipped:null,transcription:null,answerKey:null};
 });
 const byPaper=new Map(papers.map(p=>[p.id,p]));
 const id=(paper,n)=>'gichul-'+paper.id+'-'+String(n).padStart(2,'0');
 const byId=new Map();
 for(const paper of papers)for(const n of paper.numbers){
  if(!/^[1-4]$/.test(paper.answers[n-1]))throw Error('Served question without a single official answer: '+paper.id+' '+n);
  byId.set(id(paper,n),{paper,n});
 }
 const questionOf=(paper,n)=>paper.questions?paper.questions.find(q=>q.n===n):{n,a:Number(paper.answers[n-1])};
 function get(cardId){const row=byId.get(cardId);return row?{paper:row.paper,question:questionOf(row.paper,row.n)}:undefined;}
 function title(row){return row?row.paper.title+' '+row.question.n+'번':'';}
 function source(paper,q){
  return '출처: '+paper.body+', 「'+paper.datasetTitle+'」, 공공데이터포털 '+paper.dataset+' (이용허락범위 제한 없음) · '
   +paper.exam+' '+paper.book+' '+paper.subject+' '+q.n+'번 원문 전사 · 공식 정답 '+symbols[q.a-1]+'.';
 }
 function explanation(paper,q){
  const head='공식 정답: '+symbols[q.a-1]+' · '+paper.title+' '+q.n+'번 ('+paper.body+' 공식 정답표).';
  return q.e?head+'\n\n'+q.e:head+'\n\n이 문항은 공식 문제와 정답표를 수록했으며, 상세 해설은 아직 제공하지 않습니다.';
 }
 // 받은 회차 파일이 색인과 어긋나면 붙이지 않는다. 틀린 정답을 가르치느니 문제를 내지 않는다.
 function attach(paper,data){
  if(!data||data.schema!==1||data.id!==paper.id||!Array.isArray(data.questions)||!Array.isArray(data.skipped))throw Error('Paper file mismatch: '+paper.id);
  if(JSON.stringify(data.questions.map(q=>q.n))!==JSON.stringify(paper.numbers))throw Error('Paper questions differ from the index: '+paper.id);
  if(JSON.stringify(data.skipped.map(x=>x.n).sort((a,b)=>a-b))!==JSON.stringify(paper.skippedNumbers))throw Error('Paper skips differ from the index: '+paper.id);
  for(const q of data.questions)if(q.a!==Number(paper.answers[q.n-1])||!Array.isArray(q.c)||q.c.length!==4||typeof q.q!=='string')throw Error('Paper question differs from the index: '+paper.id+' '+q.n);
  paper.questions=data.questions;paper.skipped=data.skipped;paper.transcription=data.transcription||[];paper.answerKey=data.answerKey||'';
 }
 let installed=null;
 function fill(paper){
  if(!installed)return;
  for(const q of paper.questions){
   const key=id(paper,q.n),text=explanation(paper,q),card=installed.cards.get(key);
   if(card)Object.assign(card,{question:q.q,answer:q.c[q.a-1],explanation:text});
   installed.options[key]={question:q.q,choices:q.c.slice(),correctIndex:q.a-1,explanation:text,fixedOrder:true};
  }
 }
 // 받지 않은 회차의 카드도 설치한다: 본문 대신 회차 제목, 보기 대신 공식 정답 번호를 담는다(보기는 받은 뒤 채운다).
 function install(cards,options){
  installed={cards:new Map(),options};
  for(const paper of papers)for(const n of paper.numbers){
   const key=id(paper,n),q={n,a:Number(paper.answers[n-1])};
   const card={id:key,subject:paper.subject,question:paper.title+' '+n+'번',answer:'공식 정답 '+symbols[q.a-1],explanation:'',source:source(paper,q)};
   cards.push(card);installed.cards.set(key,card);
  }
  for(const paper of papers)if(paper.questions)fill(paper);
 }
 const loading=new Map(),failed=new Set();
 function load(paperId){
  const paper=byPaper.get(paperId);
  if(!paper)return Promise.reject(Error('Unknown paper: '+paperId));
  if(paper.questions)return Promise.resolve(paper);
  if(loading.has(paperId))return loading.get(paperId);
  failed.delete(paperId);
  let request;try{request=root.fetch('gichul/'+paperId+'.json');}catch(error){request=Promise.reject(error);}
  const job=Promise.resolve(request).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();})
   .then(data=>{attach(paper,data);fill(paper);loading.delete(paperId);return paper;},error=>{loading.delete(paperId);failed.add(paperId);throw error;});
  loading.set(paperId,job);return job;
 }
 function state(paperId){const p=byPaper.get(paperId);return !p?'unknown':p.questions?'ready':loading.has(paperId)?'loading':failed.has(paperId)?'error':'idle';}
 if(node){
  const files=require('./gichul-files.cjs');
  if(JSON.stringify(files.ids())!==JSON.stringify(papers.map(p=>p.id).sort()))throw Error('gichul/ files differ from gichul-index.js');
  for(const paper of papers)attach(paper,files.read(paper.id));
 }else if(typeof root.GICHUL_READ==='function')for(const paper of papers)attach(paper,root.GICHUL_READ(paper.id));
 // 회차 안에서의 순서는 언제나 원문 문항 번호다. 회차 사이의 순서는 색인 순서(최신 연도부터)를 따른다.
 function rank(cardId){const row=byId.get(cardId);return row?row.paper.order*100+row.n:null;}
 const subjects=[...new Set(papers.map(p=>p.subject))];
 const api={
  schema:index.schema,papers,subjects,get,title,rank,install,load,state,cardId:id,explanation,source,
  paperOf:cardId=>byId.get(cardId)?.paper.id||null,
  paper:paperId=>byPaper.get(paperId)||null,
  has:paperId=>byPaper.has(paperId),
  known:cardId=>byId.has(cardId),
  ready:cardId=>!!byId.get(cardId)?.paper.questions,
  forSubject:subject=>papers.filter(p=>p.subject===subject)
 };
 root.Gichul=api;if(node)module.exports=api;
 else install(root.CORE_REVIEW_PACK,root.QUIZ_OPTIONS);
})(globalThis);
