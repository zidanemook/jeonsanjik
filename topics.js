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
  {id:'joseon-early',title:'조선 전기 (건국~16세기)',sections:['조선 건국·통치 기반','사림과 사화','붕당의 형성','조선 중앙 정치 조직','조선 지방 행정 조직','조선 관리 선발 방식','조선 군사 조직','조선 초기 대외 관계','조선 전기 토지 제도','조선 전기 수취 체제','조선 전기 신분 제도','조선 전기 사회 제도와 법률','조선 전기 교육 기관','조선 전기 성리학의 발달','조선 전기 불교와 도교','조선 전기 편찬 사업','조선 전기 과학 기술','조선 전기 훈민정음','조선 전기 건축','조선 전기 공예·그림·문학']},
  {id:'joseon-late',title:'조선 후기 (양난~1863)',sections:['임진왜란의 전개','광해군의 정책','호란의 전개','붕당 정치의 전개','예송','환국','영조의 탕평 정치','정조의 탕평 정치','세도 정치','비변사의 변화','조선 후기 군사 제도','북벌과 나선 정벌','북학론','백두산정계비와 간도','일본과의 관계 회복','독도','조선 후기 수취 체제','조선 후기 농촌 경제','사상과 장시·포구 상업','조선 후기 대외 무역','화폐 경제의 발달','조선 후기 수공업과 광업','조선 후기 신분제의 동요','서얼과 중인의 신분 상승','노비의 신분 상승','조선 후기 향촌 질서','예언 사상의 유행','천주교의 전파와 박해','동학의 창시','19세기 농민 봉기','조선 후기 성리학의 변화','양명학의 수용','실학의 등장','농업 중심의 개혁론','상공업 중심의 개혁론','국학의 발달(역사)','국학의 발달(지리서와 지도)','국학의 발달(백과사전과 한글)','서양 문물의 수용','조선 후기 천문학과 역법','조선 후기 의학','조선 후기 농서와 기술','서민 문화의 발달','한문학과 회화·서예','조선 후기 공예와 건축']},
  {id:'opening',title:'개항·개화기 (1863~1894)',sections:['19세기 조선의 정세','흥선 대원군의 왕권 강화','흥선 대원군의 민생 안정','통상 수교 거부 정책','양요와 척화비','강화도 조약과 부속 조약','정부의 개화 정책','위정척사 운동','임오군란','갑신정변','갑신정변 이후의 국내외 정세','동학 농민 운동','개화파와 개항기 인물','동학·위정척사 인물']},
  {id:'korean-empire',title:'갑오개혁·대한제국 (1894~1910)',sections:['갑오개혁','을미개혁','독립 협회','대한 제국과 광무개혁','일제의 국권 침탈 과정','애국 계몽 운동','항일 의병 운동','항일 의거 활동','의병 인물','애국 계몽 운동 인물','국권 피탈 전 의거 인물']},
  {id:'colonial',title:'일제 강점기',sections:['한국을 도운 외국인','국외 독립운동 기지 인물','의열 투쟁 인물','독립군·광복군 인물','여성 독립운동가','임시 정부·광복 전후 인물','국학·민족 종교 인물','문학·예술·사회 운동 인물']},
  {id:'contemporary',title:'현대',sections:['광복과 통일 정부 수립 노력','대한민국 정부 수립','제헌 국회의 활동','6·25 전쟁','광복 이후 인물']},
  {id:'integrated',title:'여러 시대 통합·지역사',sections:['세시 풍속']}
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
