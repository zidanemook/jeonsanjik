'use strict';
// Korean history practice topics in chronological order. Summary-pack questions join a topic by their catalog section.
(function(root){
 const list=[
  {id:'prehistory',title:'선사 시대',sections:['선사 시대 · 기본','선사']},
  {id:'gojoseon',title:'고조선·여러 나라',sections:['고조선·여러 나라 · 기본','고조선·여러 나라','여러 나라']},
  {id:'goguryeo-gaya',title:'고구려·가야',sections:['고구려·가야 · 기본','고구려·가야']},
  {id:'baekje-silla',title:'백제·신라·삼국 통일',sections:['백제·신라 · 기본','백제·신라·통일','백제','신라']},
  {id:'unified-silla',title:'통일 신라',sections:['통일 신라']},
  {id:'balhae',title:'발해',sections:['발해']},
  {id:'later-three',title:'후삼국',sections:['후삼국']},
  {id:'compare',title:'헷갈리는 내용 비교',sections:['헷갈리는 내용 비교']}
 ];
 const bySection=new Map(list.flatMap(t=>t.sections.map(s=>[s,t.id])));
 function byCard(catalog){
  const out=new Map();
  for(const [id,q]of Object.entries(catalog.questions)){const topic=bySection.get(q.section);if(!topic)throw Error('No topic for section '+q.section);out.set(id,topic);}
  return out;
 }
 const title=id=>list.find(t=>t.id===id)?.title||'';
 const api={list,byCard,title};root.StudyTopics=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
