'use strict';
// Korean history practice topics in chronological order. Summary-pack questions join a topic by their catalog section;
// official Hanneung questions join by the reviewed map in hanneung-topics.js.
(function(root){
 const list=[
  {id:'prehistory',title:'선사 시대',sections:['선사 시대 · 기본','선사']},
  {id:'gojoseon',title:'고조선·여러 나라',sections:['고조선·여러 나라 · 기본','고조선·여러 나라','여러 나라']},
  {id:'goguryeo-gaya',title:'고구려·가야',sections:['고구려·가야 · 기본','고구려·가야']},
  {id:'baekje-silla',title:'백제·신라·삼국 통일',sections:['백제·신라 · 기본','백제·신라·통일','백제','신라']},
  {id:'three-kingdoms',title:'삼국 공통·비교',sections:['삼국 공통·비교']},
  {id:'unified-silla',title:'통일 신라',sections:['통일 신라']},
  {id:'balhae',title:'발해',sections:['발해']},
  {id:'later-three',title:'후삼국',sections:['후삼국']},
  {id:'compare',title:'헷갈리는 내용 비교',sections:['헷갈리는 내용 비교']},
  {id:'goryeo',title:'고려',sections:['고려 초기 정치','고려 문벌 사회','고려 무신 정권','고려 대외 관계','고려 후기 사회 변동','고려의 멸망','고려 경제','고려 사회','고려 문화']},
  {id:'joseon-early',title:'조선 전기 (건국~16세기)',sections:['조선 건국·통치 기반','사림과 사화','붕당의 형성','조선 중앙 정치 조직','조선 지방 행정 조직','조선 관리 선발 방식','조선 군사 조직','조선 초기 대외 관계','조선 전기 토지 제도','조선 전기 수취 체제','조선 전기 신분 제도','조선 전기 사회 제도와 법률','조선 전기 교육 기관','조선 전기 성리학의 발달','조선 전기 불교와 도교','조선 전기 편찬 사업']},
  {id:'joseon-late',title:'조선 후기 (양난~1863)',sections:['임진왜란의 전개','광해군의 정책','호란의 전개']},
  {id:'opening',title:'개항·개화기 (1863~1894)',sections:[]},
  {id:'korean-empire',title:'갑오개혁·대한제국 (1894~1910)',sections:[]},
  {id:'colonial',title:'일제 강점기',sections:[]},
  {id:'contemporary',title:'현대',sections:[]},
  {id:'integrated',title:'여러 시대 통합·지역사',sections:[]}
 ];
 const bySection=new Map(list.flatMap(t=>t.sections.map(s=>[s,t.id]))),ids=new Set(list.map(t=>t.id));
 function byCard(catalog,papers={}){
  const out=new Map();
  for(const [id,q]of Object.entries(catalog.questions)){const topic=bySection.get(q.section);if(!topic)throw Error('No topic for section '+q.section);out.set(id,topic);}
  for(const [id,topic]of Object.entries(papers)){if(!ids.has(topic))throw Error('Unknown topic '+topic+' for '+id);out.set(id,topic);}
  return out;
 }
 const title=id=>list.find(t=>t.id===id)?.title||'';
 const api={list,byCard,title};root.StudyTopics=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
