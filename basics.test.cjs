// 기초 개념(basics.js, v155 논리 · v156 독해): 국어 『사고의 힘 논리』 1~6장과 제2편 독해 1~3장 모든 문제에 규칙별 기초 개념 상자가 붙는지,
// 상자의 절 순서·용어 풀이·표기 규칙·교재 문장 겹침, 그리고 파트별 상태의 '기초 개념 보기' 화면을 확인한다.
// 절 순서: 1. 먼저 알아 둘 말 → (표) → 규칙 → 비교 예문 → 이 문제에 대입. 표는 선택이다 — 외울 표가 없는 규칙도 있어서
// 넣지 않고, 번호는 빠짐없이 이어 매긴다(표가 없으면 규칙이 2번). 파트 화면에는 '이 문제에 대입'을 넣지 않는다.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');

// ── 1) 데이터: 모든 논리 문제 → 규칙 상자 + 문제별 대입
const bank=require('./practice-bank.js');
const bctx={};vm.createContext(bctx);vm.runInContext(fs.readFileSync(__dirname+'/basics.js','utf8'),bctx,{filename:'basics.js'});
const B=bctx.STUDY_BASICS;assert.ok(B&&B.boxes&&B.apply,'basics.js가 STUDY_BASICS를 내놓는다');
const logic=Object.keys(bank).filter(id=>/^ko-logic\d/.test(id));
const byChapter=n=>logic.filter(id=>id.startsWith('ko-logic'+n+'-')).length;
assert.deepEqual([1,2,3,4,5,6].map(byChapter),[31,179,181,147,128,329],'논리 1~6장 문제 수');
assert.equal(logic.length,995);
const rules=new Set();
for(const id of logic){
 const q=bank[id];assert.ok(/^logic-ch[1-6]-/.test(q.ruleId||''),'논리 규칙 id: '+id);assert.equal(q.variants.length,1,'문제 하나: '+id);rules.add(q.ruleId);
 assert.ok(B.box(q.ruleId),'규칙 상자가 없다: '+q.ruleId+' ('+id+')');
 const a=B.forQuestion(id);assert.ok(a&&Array.isArray(a.blocks)&&a.blocks.length,'이 문제에 대입이 없다: '+id);
}
assert.equal(rules.size,33,'논리 1~6장 규칙 33개');
// 독해 1~3장: 1장 444 · 2장 122 · 3장 354문제, 규칙 29개(1장 15 · 2장 3 · 3장 11). ruleId = 'reading-' + 문제의 lesson.
const reading=Object.keys(bank).filter(id=>/^ko-read[1-3]-/.test(id));
assert.deepEqual([1,2,3].map(n=>reading.filter(id=>id.startsWith('ko-read'+n+'-')).length),[444,122,354],'독해 1~3장 문제 수');
const rrules=new Set();
for(const id of reading){
 const q=bank[id];assert.ok(/^reading-read[1-3]-/.test(q.ruleId||''),'독해 규칙 id: '+id);assert.equal(q.variants.length,1,'문제 하나: '+id);rrules.add(q.ruleId);
 assert.ok(B.box(q.ruleId),'규칙 상자가 없다: '+q.ruleId+' ('+id+')');
 const a=B.forQuestion(id);assert.ok(a&&Array.isArray(a.blocks)&&a.blocks.length,'이 문제에 대입이 없다: '+id);
}
assert.equal(rrules.size,29,'독해 1~3장 규칙 29개');
assert.deepEqual([1,2,3].map(n=>[...rrules].filter(r=>r.startsWith('reading-read'+n+'-')).length),[15,3,11],'독해 장별 규칙 수');
// 영어(v159): parts.js의 영어 단원(Day 1~7 · 문법 공식 훈련) 1470문제, 규칙 73개 — v204 Day 8 · 9 · 10(핵심 20씩, 규칙 17 · 파트 17)을 더해 1530문제 · 규칙 90 · 파트 68, 2026-10-07 Day 8~10 더 풀기 203문제를 더해 1733문제(규칙 · 파트 · 상자 글은 그대로). 대입이 쓰는 줄은 그 문제 파트 안 상자의 줄이어야 한다.
const PS={};new Function('globalThis','module',fs.readFileSync(__dirname+'/parts.js','utf8'))(PS,{});
const enParts=PS.STUDY_PARTS.units.filter(u=>/^en-/.test(u.id)).flatMap(u=>u.parts),english=[...new Set(enParts.flatMap(p=>p.ids))];
assert.equal(enParts.length,93,'영어 파트 93개(Day 1~7 40 · Day 8~10 17 · Day 11 5 · Day 12 5 · Day 13 5 · Day 14 5 · Day 15 5 · 공식 훈련 11)');assert.equal(english.length,2163,'영어 파트 문제 2163');
const lineIdsOf=b=>new Set([...b.terms.map(t=>t.id),...(b.table?[b.table.id,b.table.key?.id]:[]),...b.rules.items.map(r=>r.id),b.rules.key?.id,...b.examples.map(x=>x.id)].filter(Boolean));
const erules=new Set();let enUse=0;
for(const p of enParts){const inPart=new Set(p.ids.map(id=>bank[id].ruleId));
 for(const id of p.ids){const q=bank[id];assert.ok(/^grammar-/.test(q.ruleId||''),'영어 규칙 id: '+id);assert.equal(q.variants.length,1,'문제 하나: '+id);erules.add(q.ruleId);
  assert.ok(B.box(q.ruleId),'규칙 상자가 없다: '+q.ruleId+' ('+id+')');
  const a=B.forQuestion(id);assert.ok(a&&Array.isArray(a.blocks)&&a.blocks.length&&a.use.length,'이 문제에 대입이 없다: '+id);
  for(const u of a.use){const [r,l]=u.includes(':')?u.split(':'):[q.ruleId,u];assert.ok(inPart.has(r),'대입 줄이 파트 밖 상자: '+id+' '+u);assert.ok(lineIdsOf(B.box(r)).has(l),'대입 줄이 상자에 없다: '+id+' '+u);enUse++;}}}
assert.equal(erules.size,115,'영어 규칙 115개(Day 1~7 · 공식 73 + Day 8~10 17 + Day 11 5 + Day 12 5 + Day 13 5 + Day 14 5 + Day 15 5)');
// 국어 문법(선재국어 제3편, 장마다 핵심 20 + 2026-10-07 더 풀기): 규칙 정리 5개씩. ruleId = 'kgrammar-g<장>-<lesson>', 대입 줄은 그 규칙 상자의 줄.
const grammar=Object.keys(bank).filter(id=>/^ko-(gram[123]|doc[123]|voc[12])-/.test(id));   // 2026-10-07: 문법 3장 · 공문서 수정 · 어휘도 같은 틀
assert.deepEqual(['ko-gram1-','ko-gram2-','ko-gram3-','ko-doc1-','ko-doc2-','ko-doc3-','ko-voc1-','ko-voc2-'].map(p=>grammar.filter(id=>id.startsWith(p)).length),[89,91,149,103,87,184,112,205],'국어 문법 · 공문서 수정 · 어휘 단원별 문제 수');
const grules=new Set();
for(const id of grammar){const q=bank[id];assert.ok(/^(kgrammar-g[123]|kdoc-d[123]|kvocab-v[12])-/.test(q.ruleId||''),'국어 문법 · 공문서 · 어휘 규칙 id: '+id);assert.equal(q.variants.length,1,'문제 하나: '+id);grules.add(q.ruleId);
 assert.ok(B.box(q.ruleId),'규칙 상자가 없다: '+q.ruleId);const a=B.forQuestion(id);assert.ok(a&&Array.isArray(a.blocks)&&a.blocks.length,'이 문제에 대입이 없다: '+id);
 for(const u of a.use)assert.ok(lineIdsOf(B.box(q.ruleId)).has(u),'대입 줄이 상자에 없다: '+id+' '+u);}
assert.equal(grules.size,44,'국어 문법 1 · 2장 규칙 10 + 2026-10-07 묶음 34');
// 한국사(v161~, 강별로 늘어난다): parts.js의 한국사 파트마다 상자 하나(id 'hist-<파트>', split 'lines', 표는 tables 여럿 · 줄마다 rowIds).
//   HIST_UNITS에 든 단원의 파트는 모두 상자가 있고, 그 파트 문제마다 대입(box = 그 파트 상자 · use = 그 상자의 줄 · blocks)이 있다.
const HIST_UNITS=['hist-02-05','hist-06','hist-07','hist-08','hist-09','hist-10','hist-11','hist-12','hist-13','hist-14','hist-15','hist-16','hist-17','hist-18','hist-19','hist-20','hist-21','hist-22','hist-23','hist-24','hist-25','hist-26','hist-27','hist-28','hist-29','hist-30','hist-31','hist-32','hist-33','hist-34','hist-35','hist-36','hist-37','hist-38','hist-39','hist-40','hist-28-40','hist-250','hist-252-256'];
const hUnits=PS.STUDY_PARTS.units.filter(u=>u.subject==='한국사'),hDone=hUnits.filter(u=>HIST_UNITS.includes(u.id)).flatMap(u=>u.parts);
assert.deepEqual(hUnits.filter(u=>HIST_UNITS.includes(u.id)).map(u=>u.id),HIST_UNITS,'상자를 붙인 한국사 단원');
const hLines=b=>new Set([...b.terms.map(t=>t.id),...(b.tables||[]).flatMap(t=>[t.id,...t.rowIds,t.key?.id]),...b.rules.items.map(r=>r.id),...b.examples.map(x=>x.id)].filter(Boolean));
const history=[],hrules=new Set();let hUse=0;
for(const p of hDone){const r='hist-'+p.id,box=B.box(r);assert.ok(box,'한국사 파트 상자: '+r);hrules.add(r);
 assert.equal(box.split,'lines','한국사 상자는 줄 단위로 접는다: '+r);assert.ok(!box.table&&box.tables.length,'한국사 상자는 tables: '+r);
 for(const t of box.tables)assert.equal(t.rowIds.length,t.rows.length,'표 줄마다 id: '+r+' '+t.id);
 const lines=hLines(box);
 for(const id of p.ids){history.push(id);assert.ok(!bank[id],'한국사 문제는 practice-bank 밖(quiz-options): '+id);
  const a=B.forQuestion(id);assert.ok(a&&a.box===r&&a.use.length&&a.blocks.length,'한국사 대입: '+id);
  for(const u of a.use){assert.ok(lines.has(u),'대입 줄이 그 파트 상자에 없다: '+id+' '+u);hUse++;}}}
assert.equal(history.length,2585,'02~31강 + 특강 2585문제(22~31강 20문제씩 · 2파트씩, 2026-09-27 · 28 · 30) + 근대 순서 훈련 30');assert.equal(hrules.size,156,'02~31강 + 특강 156파트 = 156상자 + 근대 순서 훈련 3파트');
// 정보보호론 · 컴퓨터일반(v165~, 배치로 늘어난다): 자체 제작 문제가 없어 9급 기출을 주제로 나눈 parts.js 파트마다 상자 하나
//   (id 'sec-<파트>' · 'com-<파트>', split 'lines', tables 여럿). IT_DONE의 파트는 상자가 있고, 그 파트 기출(gichul-<회차>-NN)마다 대입이 있다.
const IT_DONE={'정보보호론':['is01','is02','is03','is04','is05','is06','is07','is08','is09','is10','is11','is12','is13','is14','is15','is16','is17','is18','is19','is20','is21'],'컴퓨터일반':['cg01','cg02','cg03','cg04','cg05','cg06','cg07','cg08','cg09','cg10','cg11','cg12','cg13','cg14','cg15','cg16','cg17','cg18','cg19','cg20','cg21','cg22','cg23','cg24','cg25','cg26']},IT_PREFIX={'정보보호론':'sec','컴퓨터일반':'com'};
const itDone=[],itQuestions=[],itRules=new Set();let itUse=0;
for(const [s,list] of Object.entries(IT_DONE)){const all=PS.STUDY_PARTS.units.filter(u=>u.subject===s).flatMap(u=>u.parts);
 for(const pid of list){const p=all.find(x=>x.id===pid);assert.ok(p,s+' 파트: '+pid);itDone.push({...p,subject:s});const r=IT_PREFIX[s]+'-'+pid,box=B.box(r);assert.ok(box,s+' 파트 상자: '+r);itRules.add(r);
  assert.equal(box.split,'lines','전공 과목 상자는 줄 단위로 접는다: '+r);assert.ok(!box.table&&box.tables.length,'전공 과목 상자는 tables: '+r);
  for(const t of box.tables)assert.equal(t.rowIds.length,t.rows.length,'표 줄마다 id: '+r+' '+t.id);
  const lines=hLines(box);
  for(const id of p.ids){itQuestions.push(id);assert.match(id,/^gichul-/,'전공 과목 파트는 기출만: '+id);
   const a=B.forQuestion(id);assert.ok(a&&a.box===r&&a.use.length&&a.blocks.length,s+' 대입: '+id);
   for(const u of a.use){assert.ok(lines.has(u),'대입 줄이 그 파트 상자에 없다: '+id+' '+u);itUse++;}}}}
assert.deepEqual(Object.keys(B.boxes).sort(),[...rules,...rrules,...grules,...erules,...hrules,...itRules].sort(),'상자는 논리 · 독해 · 영어 규칙마다, 한국사 · 정보보호론 · 컴퓨터일반 파트마다 하나(남는 상자 없음)');
// 국어 · 영어 · 한국사 기출(v170~): 과목별 기출 대응 원고(research/basics-*/gichul*)가 짝지은 기출마다 대입 — box = 그 기출이 쓰는 상자(규칙 상자 또는 한국사 파트 상자),
//   use = 그 상자의 줄, blocks = 화면에 보이는 '이 문제에 대입'. 대응하지 않은 기출(제외)은 대입이 없다. 마지막 '→ 번호'(부정 발문은 'N 틀림')가 공식 정답.
const GICHUL_BASICS={'국어':327,'영어':102,'한국사':277,'한능검':548};
const GOWN=/^(?:gichul-[a-z0-9]+-\d{4}b?-(korean|english|history)-(\d{2})|hanneung-\d+-\d{2})$/;
const gichulBasics=Object.keys(B.apply).filter(id=>GOWN.test(id));let gUse=0;
{const GF=require('./gichul-files.cjs'),HC={};vm.createContext(HC);vm.runInContext(fs.readFileSync(__dirname+'/hanneung-data.js','utf8'),HC,{filename:'hanneung-data.js'});
 const hans=new Map(HC.HANNEUNG_DATA.map(r=>[r.id,r])),C='①②③④⑤',n={'국어':0,'영어':0,'한국사':0,'한능검':0};
 const TOK=/(?<![A-Za-z0-9_])([a-z]{1,2}\d{1,2}k?)(?![A-Za-z0-9])/g,plain=t=>String(t).replace(/\{[spmqr]\|([^{}|]*)\}/g,'$1');
 for(const id of gichulBasics){const a=B.forQuestion(id),m=id.match(GOWN),box=B.box(a.box);
  assert.ok(box&&a.use.length&&a.blocks.length&&a.blocks.every(b=>typeof b==='string'&&b.trim()),'기출 대입 뼈대: '+id);
  const lines=box.split==='lines'?hLines(box):lineIdsOf(box);for(const u of a.use){assert.ok(lines.has(u),'기출 대입 줄이 상자에 없다: '+id+' '+u);gUse++;}
  let ans,own='';if(m[1]){const paper=id.slice(7,-3),q=GF.read(paper).questions.find(q=>q.n===+m[2]);assert.ok(q,'기출 문제가 있다: '+id);ans=q.a;own=q.q+' '+(q.c||[]).join(' ');n[{korean:'국어',english:'영어',history:'한국사'}[m[1]]]++;
   assert.ok({korean:/^(logic|reading)-/,english:/^grammar-/,history:/^hist-/}[m[1]].test(a.box),'기출 과목과 상자가 맞다: '+id+' '+a.box);}
  else{const r=hans.get(id);assert.ok(r,'한능검 문제가 있다: '+id);ans=r.answer;n['한능검']++;assert.match(a.box,/^hist-/,'한능검은 한국사 상자: '+id);}
  const all=a.blocks.map(plain).join('\n'),ms=[...all.matchAll(/→\s*([①-⑤])|([①-⑤])\s*(?:이\s*|은\s*|는\s*)?(?:틀림|옳지 않음|적절하지 않음)/g)].map(x=>x[1]||x[2]);
  assert.ok(ms.includes(C[ans-1]),'기출 대입에 공식 정답 번호: '+id+' (공식 '+C[ans-1]+')');
  for(const b of a.blocks){const p=plain(b);assert.ok(!/두문자|비결|(?<![가-힣])상자|공통 줄/.test(p),'기출 대입에 두문자 · 비결 · 내부 말: '+id);assert.ok(!/\(\s*\)/.test(p),'기출 대입에 빈 괄호: '+id);
   for(const t of p.matchAll(TOK))assert.ok(!lines.has(t[1]),'기출 대입에 줄 id: '+id+' '+t[1]);
   if(box.split==='lines'&&m[1])for(const y of p.match(/(?<!\d)\d{3,4}(?!\d)/g)||[])assert.ok(own.includes(y),'한국사 기출 대입의 연도는 문제에 나온 것만: '+id+' '+y);}}
 assert.deepEqual(n,GICHUL_BASICS,'과목별 기출 대입 수');}
// 컴퓨터일반 자체 제작(comq-<파트>-NNN, research/computer-20261007): 9급 기출과 같은 파트 상자 'com-<파트>'를 쓴다 — 문제의 ruleId = 상자 id, 대입 {box,use,blocks}의 줄은 그 상자의 줄,
// 원고가 덧붙인 줄(boxAdd)이 상자에 있고(기존 줄은 위 기출 대입 검사가 그대로 지킨다), 대입 글에 줄 id · 두문자가 보이지 않는다. 해설 화면의 줄 접기는 아래 5-1의 한국사 · 전공 과목 검사에 함께 넣는다.
const COMQ=/*COMQ-SPEC*/[{"part":"cg01","unit":"comq-cg01","parent":"com-u1","topic":"컴일 cg01","title":"컴퓨터 구성, 정보 단위, 문자 코드 (자체 제작)","short":"컴퓨터 구성, 정보 단위, 문자 코드","pre":"comq-cg01-","box":"com-cg01","n":211,"core":20,"folded":true,"points":14,"parts":[["cq01-1","하드웨어의 구성 장치",20,1],["cq01-2","하드웨어, 소프트웨어, 펌웨어 가르기",9,1],["cq01-3","시스템 소프트웨어와 응용 소프트웨어",20,1],["cq01-4","초기 계산 도구와 컴퓨터의 역사",17,2],["cq01-5","컴퓨터 세대별 소자, 언어, 사건",19,1],["cq01-6","컴퓨터의 분류 기준과 종류",13,1],["cq01-7","정보 표현 단위의 길이와 쓰임",16,2],["cq01-8","기억 용량 단위의 접두어와 크기 순서",12,2],["cq01-9","표준 BCD 코드",9,1],["cq01-10","ASCII 코드",17,2],["cq01-11","문자 코드의 비트 수와 문자 수 비교",10,2],["cq01-12","입출력장치, 주변장치, 포트",22,1],["cq01-13","프로그래밍 언어 수준과 번역기",19,2],["cq01-14","컴퓨터의 기능과 동작 과정",8,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nat9","nat10","nat11","nat12","nat13","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nbt8","nbt9","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","nct9","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","nar1","nar2","nar3","nar4","nar5","nar6","nbr1","nbr2","nbr3","nbr4","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ndr1","ndr2","nax1","nbx1","nbx2","nbx3","ncx1","ncx2","ncx3","ncx4","ncx5","ndx1","naa","naa1","naa2","naa3","naa4","nab","nab1","nab2","nab3","nac","nac1","nac2","nad","nad1","nad2","nad3","nad4","nad5","nad6","nad7","nad8","nba","nba1","nba2","nba3","nba4","nbb","nbb1","nbb2","nbb3","nbb4","nbc","nbc1","nbc2","nbc3","nbc4","nbd","nbd1","nbd2","nbd3","nbd4","nbe","nbe1","nbe2","nbe3","nbe4","nca","nca1","nca2","nca3","nca4","nca5","nca6","nca7","nca8","nca9","ncb","ncb1","ncb2","ncb3","ncb4","ncc","ncc1","ncc2","ncc3","ncc4","ncc5","ncd","ncd1","ncd2","ncd3","nce","nce1","nce2","nce3","nce4","nce5","ncf","ncf1","ncf2","nda","nda1","nda2","nda3","nda4","nda5","nda6","nda7","nda8","nda9","ndb","ndb1","ndb2","ndb3","ndb4","ndb5","ndc","ndc1","ndc2","ndc3","ndd","ndd1","ndd2","ndd3","ndd4","nde","nde1","nde2","nde3","ndf","ndf1","ndf2","ndf3","ndg","ndg1","ndg2","ndg3","ndg4","ndg5","ndh","ndh1","ndh2","ndh3","ndh4","ndh5","ndh6","ndi","ndi1","ndi2","ndi3","ndi4"],"boxLines":220},{"part":"cg02","unit":"comq-cg02","parent":"com-u1","topic":"컴일 cg02","title":"진법 변환과 수의 표현(보수, 부동소수점) (자체 제작)","short":"진법 변환과 수의 표현(보수, 부동소수점)","pre":"comq-cg02-","box":"com-cg02","n":310,"core":20,"folded":true,"points":19,"parts":[["cq02-1","진법의 자릿값과 2진, 8진, 16진 숫자",17,1],["cq02-2","10진 정수를 2진수, 8진수, 16진수로",10,1],["cq02-3","2진, 8진, 16진 사이의 변환(소수점 포함)",20,1],["cq02-4","진법이 섞인 계산과 크기 비교",11,1],["cq02-5","r의 보수와 (r−1)의 보수",18,1],["cq02-6","보수로 하는 뺄셈(부호 없는 수)",12,1],["cq02-7","부호 있는 2진 정수의 표현 방식",20,1],["cq02-8","2의 보수 만들기와 읽기",19,1],["cq02-9","n비트 정수의 표현 범위와 비트 수 늘리기",23,1],["cq02-10","소수점 있는 수의 진법 변환",18,1],["cq02-11","고정소수점, 부동소수점과 정규화",19,1],["cq02-12","바이어스된 지수와 비표준 형식",10,1],["cq02-13","IEEE 754 단정도와 배정도",23,1],["cq02-14","2의 보수 덧셈, 뺄셈과 오버플로",23,1],["cq02-15","2진 정수의 곱셈과 나눗셈",11,1],["cq02-16","부동소수점 수의 연산",17,1],["cq02-17","비트를 골라 세트하기, 지우기, 넣기",12,1],["cq02-18","비트 뒤집기와 두 데이터 비교",10,1],["cq02-19","시프트의 종류와 움직임",17,2]],"lines":["nat1","nat2","nbt1","nbt2","nbt3","nct1","nct2","ndt1","ndt2","ndt3","ndt4","ndt5","net1","net2","net3","net4","net5","nft1","nft2","nft3","nar1","nar2","nar3","nar4","nar5","nbr1","nbr2","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ncr7","ncr8","ncr9","ncr10","ncr11","ndr1","ndr2","ndr3","ndr4","ndr5","ner1","ner2","ner3","ner4","ner5","ner6","ner7","ner8","ner9","ner10","ner11","ner12","ner13","nfr1","nfr2","nfr3","nfr4","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","ncx1","ncx4","ndx1","ndx2","ndx3","nex1","nex2","nex3","nex4","nfx1","nfx2","nfx3","nfx4","naa","naa1","naa2","naa3","nab","nab1","nab2","nab3","nab4","nab5","nab6","nba","nba1","nba2","nba3","nba4","nba5","nba6","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbc","nbc1","nbc2","nbc3","nbc4","nca","nca1","nca2","nca3","nca4","nca5","ncb","ncb1","ncb2","ncb3","ncb4","nda","nda1","nda2","nda3","nda4","ndb","ndb1","ndb2","ndb3","ndc","ndc1","ndc2","ndc3","ndc4","ndd","ndd1","ndd2","ndd3","ndd4","nea","nea1","nea2","nea3","nea4","nea5","neb","neb1","neb2","neb3","neb4","nec","nec1","nec2","nec3","nfa","nfa1","nfa2","nfa3","nfa4","nfb","nfb1","nfb2","nfb3","nfb4","nfb5","nfc","nfc1","nfc2","nfc3","nfc4"],"boxLines":205},{"part":"cg03","unit":"comq-cg03","parent":"com-u1","topic":"컴일 cg03","title":"논리 회로(부울 대수, 게이트, 플립플롭) (자체 제작)","short":"논리 회로(부울 대수, 게이트, 플립플롭)","pre":"comq-cg03-","box":"com-cg03","n":272,"core":20,"folded":true,"points":17,"parts":[["cq03-1","기본 게이트의 진리표와 출력 계산",26,1],["cq03-2","범용 게이트와 3상 게이트",10,1],["cq03-3","부울 대수의 기본 법칙과 등식",27,1],["cq03-4","부울식 간소화(법칙 적용)",25,2],["cq03-5","부울 함수의 표준형 표현",15,1],["cq03-6","카르노 맵의 규칙",17,1],["cq03-7","카르노 맵으로 식 읽기와 간소화",14,1],["cq03-8","래치와 플립플롭의 개념, R-S 래치",11,1],["cq03-9","플립플롭 종류별 특성표와 다음 상태",23,2],["cq03-10","조합 논리회로와 순차 논리회로 가르기",11,2],["cq03-11","반가산기, 전가산기, 병렬 가산기",13,1],["cq03-12","감산기와 병렬 가감산기, 오버플로",10,1],["cq03-13","비교기와 패리티 발생기",10,1],["cq03-14","인코더와 디코더",13,1],["cq03-15","멀티플렉서와 디멀티플렉서",14,1],["cq03-16","레지스터와 시프트 레지스터",15,1],["cq03-17","카운터의 종류와 계수",18,1]],"lines":["nat1","nat2","nat3","nat4","nbt1","nbt2","nct1","nct2","nct3","nct4","nct5","nct6","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","net1","net2","net3","net4","net5","net6","net7","net8","net9","nft1","nft2","nft3","nft4","nft5","nft6","nar1","nar2","nar3","nar5","nar4","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","nbr8","ncr1","ncr2","ncr3","ndr1","ndr2","ndr3","ndr4","ner1","ner2","ner3","ner4","ner5","ner6","ner7","nfr1","nfr2","nfr3","nfr4","nfr5","nfr6","nfr7","nfr8","nfr9","nfr10","nfr11","nax1","nax2","nax3","nbx1","nbx2","nbx3","nbx4","ncx1","ncx2","ncx3","ndx1","ndx2","ndx3","ndx4","nfx1","nfx2","nfx3","nfx4","naa","naa1","naa2","naa3","naa4","naa5","naa6","naa7","nab","nab1","nab2","nab3","nba","nba1","nba2","nba3","nba4","nba5","nba6","nba7","nbb","nbb1","nbb2","nbb3","nbb4","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncb5","ncb6","ncc","ncc1","ncc2","ncc3","ncc4","ncc5","ncc6","ncc7","nda","nda1","nda2","nda3","nda4","ndb","ndb1","ndb2","ndb3","ndb4","ndc","ndc1","ndc2","ndc3","ndc4","nea","nea1","nea2","neb","neb1","neb2","neb3","neb4","neb5","neb6","nec","nec1","nec2","nec3","nec4","nfa","nfa1","nfa2","nfa3","nfa4","nfb","nfb1","nfb2","nfc","nfc1","nfc2","nfc3","nfc4","nfc5","nfc6","nfd","nfd1","nfd2","nfd3","nbw1","nbw2"],"boxLines":206},{"part":"cg04","unit":"comq-cg04","parent":"com-u2","topic":"컴일 cg04","title":"CPU, 레지스터, 명령어, 주소 지정, 성능 (자체 제작)","short":"CPU, 레지스터, 명령어, 주소 지정, 성능","pre":"comq-cg04-","box":"com-cg04","n":429,"core":20,"folded":true,"points":19,"parts":[["cq04-1","CPU의 구성과 내부 버스",22,1],["cq04-2","ALU의 구성과 연산 회로",35,1],["cq04-3","ALU의 상태 비트와 조건 코드",13,1],["cq04-4","CPU 레지스터의 종류와 역할",27,1],["cq04-5","CPU와 제어장치의 동작 단계",14,1],["cq04-6","CPU 처리 속도의 단위와 성능 요소",19,1],["cq04-7","명령어 사이클의 기본 흐름",23,1],["cq04-8","저급 언어와 어셈블리 프로그램",26,1],["cq04-9","명령어 집합, 분기, 서브루틴 호출",25,1],["cq04-10","주소 수에 따른 명령어와 프로그램 길이",22,1],["cq04-11","명령어의 필드와 비트 수",21,1],["cq04-12","RISC와 CISC",23,1],["cq04-13","주소 지정 방식(기본)",32,1],["cq04-14","변위 주소 지정 방식",19,1],["cq04-15","명령어 사이클의 부 사이클과 마이크로 연산",24,1],["cq04-16","제어장치의 구현 방식",14,1],["cq04-17","마이크로 프로그램 제어장치의 구성과 동작",27,1],["cq04-18","마이크로 명령어의 형식과 필드",20,1],["cq04-19","암달의 법칙과 CPU 실행 시간 계산",23,2]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","ndt9","ndt10","ndt11","net1","net2","net3","net4","net5","net6","net7","net8","nft1","nft2","nft3","nft4","nft5","ngt1","ngt2","ngt3","ngt4","ngt5","ngt6","ngt7","ngt8","ngt9","ngt10","nht1","nht2","nht3","nht4","nht5","nht6","nht7","nht8","nht9","nht10","nit1","nit2","nit3","nit4","nit5","nit6","nar1","nar2","nar3","nar4","nar5","nar6","nar7","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ncr7","ncr8","ncr9","ndr1","ndr2","ndr3","ner1","ner2","ner3","ner4","ner5","nfr1","nfr2","nfr3","ngr1","ngr2","ngr3","ngr4","ngr5","ngr6","ngr7","nhr1","nhr2","nhr3","nhr4","nhr5","nhr6","nhr7","nhr8","nhr9","nir1","nir2","nir3","nir4","nir5","nir6","nir7","nir8","nir9","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","ncx1","ncx2","ncx3","nex1","nex2","nex3","nex4","nfx1","nfx2","nfx3","ngx1","ngx2","ngx3","ngx4","nhx1","nhx2","nhx3","nhx4","nix1","nix2","nix3","nix4","nix5","nix6","naa","naa1","naa2","naa3","naa4","nab","nab1","nab2","nab3","nab4","nac","nac1","nac2","nac3","nad","nad1","nad2","nad3","nad4","nae","nae1","nae2","nae3","nae4","nba","nba1","nba2","nba3","nba4","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbc","nbc1","nbc2","nbc3","nbc4","nbc5","nbc6","nbc7","nbc8","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncb5","ncc","ncc1","ncc2","ncc3","ncc4","ncd","ncd1","ncd2","ncd3","ncd4","nce","nce1","nce2","nce3","ncf","ncf1","ncf2","ncf3","ncg","ncg1","ncg2","ncg3","ncg4","ncg5","ncg6","nch","nch1","nch2","nch3","nch4","nda","nda1","nda2","nda3","nda4","nda5","ndb","ndb1","ndb2","ndb3","ndb4","ndb5","ndc","ndc1","ndc2","ndc3","ndc4","ndd","ndd1","ndd2","ndd3","ndd4","nde","nde1","nde2","nde3","nde4","ndf","ndf1","ndf2","ndf3","ndg","ndg1","ndg2","ndg3","ndh","ndh1","ndh2","ndh3","ndh4","nea","nea1","nea2","nea3","nea4","neb","neb1","neb2","neb3","neb4","neb5","neb6","neb7","neb8","neb9","nec","nec1","nec2","nec3","nec4","nec5","nfa","nfa1","nfa2","nfa3","nfa4","nfa5","nfa6","nfa7","nfa8","nfa9","nfa10","nfa11","nfb","nfb1","nfb2","nfb3","nfb4","nfb5","nfb6","nga","nga1","nga2","nga3","nga4","nga5","nga6","ngb","ngb1","ngb2","ngb3","ngb4","ngc","ngc1","ngc2","ngc3","nha","nha1","nha2","nha3","nha4","nha5","nhb","nhb1","nhb2","nhb3","nhb4","nhb5","nhc","nhc1","nhc2","nhc3","nia","nia1","nia2","nib","nib1","nib2","nib3","nib4","nbw1","nbw2","nbw3"],"boxLines":406},{"part":"cg05","unit":"comq-cg05","parent":"com-u2","topic":"컴일 cg05","title":"파이프라인과 병렬 처리 (자체 제작)","short":"파이프라인과 병렬 처리","pre":"comq-cg05-","box":"com-cg05","n":140,"core":20,"folded":true,"points":9,"parts":[["cq05-1","명령어를 겹쳐 실행하는 기법의 뜻과 효과",13,3],["cq05-2","파이프라인 단계 구성",16,1],["cq05-3","파이프라인의 걸림돌과 해결",24,4],["cq05-4","파이프라인 실행 시간과 속도 향상",16,3],["cq05-5","명령어 여러 개를 한꺼번에 처리하는 구조",9,2],["cq05-6","플린(Flynn) 분류",22,3],["cq05-7","병렬 처리와 다중 프로세서 구조",17,2],["cq05-8","여러 컴퓨터를 묶은 시스템",17,1],["cq05-9","컴퓨터를 묶는 범위와 방식 견주기",6,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nar1","nar2","nar3","nar4","nar5","nar6","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","ncr1","ncr2","ncr3","nax1","nax4","nbx1","nbx2","nbx3","nbx4","nbx5","ncx1","ncx2","ncx3","naa","naa1","naa2","naa3","naa4","nab","nab1","nab2","nab3","nab4","nab5","nab6","nac","nac1","nac2","nac3","nad","nad1","nad2","nad3","nba","nba1","nba2","nba3","nba4","nbb","nbb1","nbb2","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncc","ncc1","ncc2","ncc3","ncc4","ncd","ncd1","ncd2","ncd3","ncd4"],"boxLines":123},{"part":"cg06","unit":"comq-cg06","parent":"com-u2","topic":"컴일 cg06","title":"기억장치와 캐시 (자체 제작)","short":"기억장치와 캐시","pre":"comq-cg06-","box":"com-cg06","n":364,"core":20,"folded":true,"points":19,"parts":[["cq06-1","기억장치의 성능 요소와 접근 방식",20,1],["cq06-2","기억장치 계층 구조와 속도 순서",19,1],["cq06-3","주기억장치의 구조, MAR/MBR 동작, 영역 구분",12,1],["cq06-4","주기억장치 할당과 적합 알고리즘",17,1],["cq06-5","기억장치 용량과 주소선, 데이터선 수",18,1],["cq06-6","RAM의 종류와 특성",27,1],["cq06-7","RAM 칩의 내부 조직과 주소 비트",12,1],["cq06-8","ROM의 쓰임, 구조, 종류",23,1],["cq06-9","플래시 메모리의 특성과 종류",21,1],["cq06-10","기억장치 확장: 칩 개수와 연결 방식",23,1],["cq06-11","캐시의 원리와 동작",20,1],["cq06-12","평균 기억장치 접근 시간과 적중률 계산",20,1],["cq06-13","캐시 크기, 인출 방식, 블록 크기",11,1],["cq06-14","캐시 사상 방식과 주소 필드 계산",40,1],["cq06-15","캐시 교체 알고리즘",20,2],["cq06-16","캐시 쓰기 정책",16,1],["cq06-17","다단계 캐시와 평균 접근 시간",18,1],["cq06-18","캐시를 두는 위치와 용도별 구성",9,1],["cq06-19","멀티프로세서의 캐시 불일치와 일관성 유지",18,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nat9","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nct1","nct2","nct3","nct4","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","net1","net2","net3","net4","net5","net6","net7","nft1","nft2","nft3","nft4","nft5","nft6","nft7","nft8","nft9","nar1","nar2","nar3","nar4","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","ncr1","ncr2","ncr3","ncr4","ndr1","ndr2","ndr3","ndr4","ndr5","ner1","ner2","ner3","ner4","ner5","ner6","nfr1","nfr2","nfr3","nfr4","nax1","nax2","nax3","nax4","nax5","nbx1","nbx2","nbx3","nbx4","nbx5","ncx2","ndx1","ndx2","ndx3","nex1","nex2","nex3","nex4","nfx1","naa","naa1","naa2","naa3","naa4","naa5","naa6","nab","nab1","nab2","nab3","nab4","nac","nac1","nac2","nac3","nac4","nad","nad1","nad2","nad3","nad4","nae","nae1","nae2","nae3","naf","naf1","naf2","naf3","nba","nba1","nba2","nba3","nba4","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbc","nbc1","nbc2","nbc3","nbd","nbd1","nbd2","nbd3","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncb5","ncb6","ncb7","ncc","ncc1","ncc2","ncc3","ncc4","ncc5","ncd","ncd1","ncd2","ncd3","ncd4","nda","nda1","nda2","nda3","nda4","nda5","nea","nea1","nea2","nea3","nea4","nea5","neb","neb1","neb2","neb3","neb4","neb5","nec","nec1","nec2","nec3","nfa","nfa1","nfa2","nfa3","nfb","nfb1","nfb2","nfb3","nfc","nfc1","nfc2","nfc3","naw1","naw2","naw3","naw4","ncw1"],"boxLines":234},{"part":"cg07","unit":"comq-cg07","parent":"com-u2","topic":"컴일 cg07","title":"보조기억장치, RAID, 입출력, 버스, 인터럽트 (자체 제작)","short":"보조기억장치, RAID, 입출력, 버스, 인터럽트","pre":"comq-cg07-","box":"com-cg07","n":339,"core":20,"folded":true,"points":17,"parts":[["cq07-1","보조기억장치의 자리와 부팅 순서",16,1],["cq07-2","RAID의 뜻과 기본 구성",34,1],["cq07-3","RAID 검사 정보와 패리티 계산",23,1],["cq07-4","RAID 패리티 배치와 용량",22,2],["cq07-5","결합 RAID의 구성과 용량",15,1],["cq07-6","SSD의 구조와 관리 기능",12,1],["cq07-7","입출력 모듈이 필요한 까닭과 하는 일",19,1],["cq07-8","입출력장치의 연결과 주소 지정",17,1],["cq07-9","입출력 비동기 전송의 제어 신호",18,1],["cq07-10","입출력 제어 방식의 비교",19,1],["cq07-11","인터럽트의 종류와 처리 순서",21,2],["cq07-12","인터럽트를 요구한 장치 찾기",28,1],["cq07-13","DMA 방식의 동작과 제어기",31,1],["cq07-14","입출력 프로세서와 채널",17,1],["cq07-15","시스템 버스의 구성과 폭",23,2],["cq07-16","버스 제어 신호와 동작 시간, 확장 버스",15,1],["cq07-17","임베디드 시스템",9,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","net1","net2","net3","net4","net5","net6","net7","net8","net9","nft1","nft2","nft3","nft4","nft5","nft6","nft7","nft8","nft9","nft10","nft11","nft12","nft13","nft14","nft15","nft16","nar1","nar2","nar3","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","ncr1","ncr2","ncr3","ncr4","ndr1","ndr2","ndr3","ndr4","ndr5","ndr6","ner1","ner2","ner3","ner4","ner5","ner6","ner7","nfr1","nfr2","nfr3","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","nbx5","ncx1","ncx2","ncx3","ncx4","ndx1","ndx4","nex1","nex2","nex3","nex4","nfx1","nfx4","nfx5","naa","naa1","naa2","naa3","naa4","naa5","nab","nab1","nab2","nab3","nab4","nab5","nab6","nba","nba1","nba2","nba3","nba4","nba5","nba6","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncb5","ncb6","ncb7","ncb8","ncb9","ncc","ncc1","ncc2","ncc3","ncc4","ncd","ncd1","ncd2","ncd3","ncd4","ncd5","nce","nce1","nce2","nce3","nce4","nda","nda1","nda2","nda3","nda4","ndb","ndb1","ndb2","ndb3","ndb4","ndc","ndc1","ndc2","ndc3","ndc4","ndc5","ndc6","nea","nea1","nea2","nea3","nea4","neb","neb1","neb2","neb3","nec","nec1","nec2","nec3","nec4","ned","ned1","ned2","ned3","nfa","nfa1","nfa2","nfa3","nfb","nfb1","nfb2","nfb3","nfb4"],"boxLines":234},{"part":"cg17","unit":"comq-cg17","parent":"com-u6","topic":"컴일 cg17","title":"OSI와 TCP/IP 계층 모델 (자체 제작)","short":"OSI와 TCP/IP 계층 모델","pre":"comq-cg17-","box":"com-cg17","n":268,"core":20,"folded":true,"points":15,"parts":[["cq17-1","OSI 모델의 틀과 계층 묶음",19,1],["cq17-2","헤더와 트레일러 붙이고 떼기",11,1],["cq17-3","OSI 계층별 기능",88,5],["cq17-4","프로토콜의 요소와 일반 기능",12,1],["cq17-5","프로토콜은 어느 계층인가(OSI)",29,1],["cq17-6","장비는 어느 OSI 계층인가",15,2],["cq17-7","TCP/IP 계층과 OSI의 대응",27,2],["cq17-8","IP와 보조 프로토콜 가르기",21,2],["cq17-9","계층별 전송 단위의 이름",14,2],["cq17-10","계층마다 쓰는 주소의 갈래",21,2],["cq17-11","라우터의 길 찾기와 라우팅 프로토콜",11,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nct1","nct2","nct3","nct4","nct5","nct6","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","ndt9","ndt10","ndt11","ndt12","ndt13","nar1","nar2","nar3","nbr1","nbr2","nbr3","nbr4","nbr6","nbr5","ncr1","ncr2","ncr3","ncr4","ncr5","ndr1","ndr2","ndr3","ndr4","ndr5","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","ncx1","ncx2","ncx3","ncx4","ndx1","ndx2","ndx3","ndx4","ndx5","naa","naa1","naa2","naa3","naa4","naa5","nab","nab1","nab2","nab3","nab4","nac","nac1","nac2","nac3","nac4","nac5","nac6","nac7","nac8","nad","nad1","nad2","nad3","nad4","nad5","nad6","nad7","nad8","nba","nba1","nba2","nba3","nba4","nba5","nba6","nba7","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbc","nbc1","nbc2","nbc3","nbd","nbd1","nbd2","nbd3","nbd4","nbd5","nbd6","nbd7","nbe","nbe1","nbe2","nbe3","nbe4","nbe5","nbe6","nbe7","nca","nca1","nca2","nca3","nca4","nca5","ncb","ncb1","ncb2","ncb3","ncb4","ncc","ncc1","ncc2","ncc3","ncc4","nda","nda1","nda2","nda3","nda4","nda5","ndb","ndb1","ndb2","ndb3","ndb4","ndb5","ndc","ndc1","ndc2","ndc3"],"boxLines":190},{"part":"cg18","unit":"comq-cg18","parent":"com-u6","topic":"컴일 cg18","title":"응용 계층과 전송 계층 프로토콜, 오류 제어와 흐름 제어 (자체 제작)","short":"응용 계층과 전송 계층 프로토콜, 오류 제어와 흐름 제어","pre":"comq-cg18-","box":"com-cg18","n":333,"core":20,"folded":true,"points":18,"parts":[["cq18-1","응용 계층 프로토콜과 TCP, UDP 위의 서비스",18,1],["cq18-2","전송 계층 프로토콜 견주기",22,1],["cq18-3","TCP와 UDP 헤더의 필드",26,1],["cq18-4","TCP 헤더의 플래그 비트",13,1],["cq18-5","TCP의 전송률 조절과 그 기법",20,1],["cq18-6","TCP의 수신 측 맞춤 전송과 타이머",14,1],["cq18-7","전송 오류의 종류와 검출의 바탕",12,1],["cq18-8","패리티로 하는 오류 검출",24,1],["cq18-9","덧셈으로 하는 오류 검출",13,1],["cq18-10","오류 검출 방식의 절차와 계산",21,2],["cq18-11","오류를 바로잡는 방법과 부호",16,1],["cq18-12","해밍 코드 계산",28,1],["cq18-13","데이터 링크 제어: 세 기능과 보낼 차례",18,1],["cq18-14","데이터 링크 제어: 보내는 양 다루기",21,1],["cq18-15","데이터 링크 제어: 오류 다루기와 프레임",14,1],["cq18-16","정지-대기 방식의 재전송과 확인응답",12,1],["cq18-17","슬라이딩 윈도우 ARQ의 재전송 방식",24,2],["cq18-18","데이터 링크 프로토콜의 갈래",17,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","ndt9","net1","net2","net3","net4","net5","net6","net7","net8","nft1","nft2","nft3","nft4","nft5","nar1","nar2","nar3","nar4","nar5","nar6","nbr1","nbr2","nbr3","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ncr7","ncr8","ncr9","ncr10","ncr11","ncr12","ncr13","ndr1","ndr2","ndr3","ndr4","ndr5","ndr6","ndr8","ndr7","ner1","ner2","ner3","ner4","ner5","nfr1","nfr2","nfr3","nfr4","nfr5","nax1","nax4","nbx1","nbx2","ncx1","ncx2","ncx3","ndx1","ndx2","ndx3","ndx4","nex1","nex2","nex3","nex4","nfx1","nfx2","nfx3","nfx4","naa","naa1","naa2","naa3","naa4","naa5","naa6","nab","nab1","nab2","nab3","nab4","nab5","nab6","nac","nac1","nac2","nac3","nac4","nba","nba1","nba2","nba3","nba4","nba5","nba6","nba7","nbb","nbb1","nbb2","nbb3","nbb4","nca","nca1","nca2","nca3","nca4","nca5","nda","nda1","nda2","nda3","ndb","ndb1","ndb2","ndb3","ndb4","ndc","ndc1","ndc2","ndc3","ndc4","ndd","ndd1","ndd2","ndd3","ndd4","nea","nea1","nea2","nea3","neb","neb1","neb2","neb3","neb4","nec","nec1","nec2","nec3","nfa","nfa1","nfa2","nfa3","nfb","nfb1","nfb2","nfb3","nfb4","nfc","nfc1","nfc2","nfc3","nfd","nfd1","nfd2","nfe","nfe1","nfe2"],"boxLines":213},{"part":"cg19","unit":"comq-cg19","parent":"com-u6","topic":"컴일 cg19","title":"IP 주소와 서브네팅 (자체 제작)","short":"IP 주소와 서브네팅","pre":"comq-cg19-","box":"com-cg19","n":285,"core":20,"folded":true,"points":13,"parts":[["cq19-1","주소의 종류와 길이",21,2],["cq19-2","서브넷 마스크와 접두사 길이",28,2],["cq19-3","호스트 수와 서브넷 수 계산",35,2],["cq19-4","서브넷의 주소 범위 구하기",27,2],["cq19-5","접두사 길이와 주소 묶기",14,1],["cq19-6","IPv4 헤더의 필드",27,1],["cq19-7","데이터그램 쪼개기와 오프셋 계산",28,1],["cq19-8","IP 프로토콜의 특징",11,1],["cq19-9","IPv4 클래스 판별과 크기",35,2],["cq19-10","IPv6의 주소, 헤더, 특징",22,3],["cq19-11","IPv6 주소 표기와 IPv4 주소 담기",15,1],["cq19-12","IPv6 전환 기술",8,1],["cq19-13","IPv6 주소의 종류와 받는 대상",14,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nbt1","nbt2","nbt3","nbt4","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","nar1","nar2","nar3","nar4","nar5","nar6","nar7","nar8","nar9","nar10","nar11","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","nbr8","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ncr7","ncr8","ncr9","ndr1","ndr2","ndr3","ndr4","ndr5","ndr6","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","nbx5","ncx1","ncx2","ncx3","ndx1","ndx2","naa","naa1","naa2","naa3","naa4","nab","nab1","nab2","nab3","nab4","nab5","nab6","nab7","nab8","nab9","nac","nac1","nac2","nac3","nac4","nac5","nac6","nac7","nac8","nac9","nac10","nac11","nac12","nac13","nac14","nac15","nac16","nac17","nac18","nac19","nac20","nad","nad1","nad2","nad3","nad4","nad5","nad6","nad7","nad8","nad9","nad10","nad11","nad12","nad13","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbb7","nbc","nbc1","nbc2","nbc3","nbc4","nbc5","nba","nba1","nba2","nba3","nba4","nba5","nba6","nba7","nba8","nba9","nba10","nba11","nbd","nbd1","nbd2","nbd3","nbd4","nbd5","nbd6","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","nda","nda1","nda2","nda3","nda4","nda5","ndb","ndb1","ndb2","ndb3","ndc","ndc1","ndc2","ndc3","ndd","ndd1","ndd2","ndd3","nde","nde1","nde2","nde3"],"boxLines":206},{"part":"cg20","unit":"comq-cg20","parent":"com-u6","topic":"컴일 cg20","title":"네트워크 장비, 토폴로지, 전송, 매체 접근, 무선 (자체 제작)","short":"네트워크 장비, 토폴로지, 전송, 매체 접근, 무선","pre":"comq-cg20-","box":"com-cg20","n":321,"core":20,"folded":true,"points":19,"parts":[["cq20-1","회선 구성: 점-대-점, 다중점, 교환",9,1],["cq20-2","토폴로지의 모양과 회선 수",24,1],["cq20-3","토폴로지별 장단점 비교",26,1],["cq20-4","두 장치가 주고받는 전송 방식",10,1],["cq20-5","규모로 나눈 네트워크와 인터넷",15,1],["cq20-6","이더넷 표준과 MAC 주소, 부계층",20,1],["cq20-7","이더넷의 매체 접근과 충돌 처리",20,1],["cq20-8","이더넷 프레임의 필드와 길이",19,1],["cq20-9","이더넷의 발전과 충돌 영역",13,1],["cq20-10","교환의 뜻과 전화망의 교환 방식",13,1],["cq20-11","데이터를 나눠 보내는 교환의 갈래",16,1],["cq20-12","교환 방식 견주기와 프레임 전달",13,1],["cq20-13","무선 랜의 매체 접근과 단말 문제",22,1],["cq20-14","무선 LAN 802.11 규격 비교",23,1],["cq20-15","기반 시설 없는 무선망의 특성",15,1],["cq20-16","기반 시설 없는 무선망의 라우팅",6,1],["cq20-17","무선 PAN 기술 비교",19,1],["cq20-18","디지털 데이터 전송 방식의 갈래",7,1],["cq20-19","네트워크 장비와 동작 계층 — 계층별 스위치",31,2]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nat9","nat10","nat11","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","ndt9","ndt10","ndt11","ndt12","ndt13","ndt14","ndt15","net1","net2","net3","net4","net5","nft1","nft2","nft3","nft4","nft5","nft6","nft7","nft8","nar1","nar2","nar3","nar4","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","nbr9","nbr8","ncr1","ncr2","ncr3","ncr4","ndr1","ndr2","ndr3","ndr4","ndr5","ner1","ner2","ner3","nfr1","nfr2","nfr3","nfr4","nfr5","nfr6","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","ncx1","ncx2","ncx3","ncx4","ndx1","ndx2","ndx3","ndx4","nex1","nex2","nex3","nex4","nfx1","nfx2","nfx3","nfx4","naa","naa1","naa2","naa3","naa4","naa5","nab","nab1","nab2","nab3","nab4","nab5","nba","nba1","nba2","nba3","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbc","nbc1","nbc2","nbd","nbd1","nbd2","nbd3","nca","nca1","nca2","nca3","nca4","nca5","nca6","nca7","ncb","ncb1","ncb2","ncb3","ncb4","ncc","ncc1","ncc2","ncc3","ncc4","ncd","ncd1","ncd2","ncd3","ncd4","ncd5","ncd6","ncd7","nda","nda1","nda2","nda3","ndb","ndb1","ndb2","ndb3","ndb4","ndb5","ndc","ndc1","ndc2","nea","nea1","nea2","nea3","nea4","nea5","neb","neb1","neb2","neb3","neb4","nec","nec1","nec2","nec3","nec4","nec5","nec6","nec7","nec8","nec9","ned","ned1","ned2","ned3","nfa","nfa1","nfa2","nfa3","nfb","nfb1","nfb2","nfb3","nfb4","nfc","nfc1","nfc2","nfc3","nfc4","nfc5","nfd","nfd1","nfd2","nfd3","nfd4","nfe","nfe1","nfe2","nfe3","nfe4"],"boxLines":261}]/*END-COMQ-SPEC*/;const comq=Object.keys(bank).filter(id=>bank[id].subject==='컴퓨터일반');let comqUse=0;
assert.equal(comq.length,COMQ.reduce((n,s)=>n+s.n,0),'컴퓨터일반 자체 제작 문제 수');
{const plain=t=>String(t).replace(/\{[spmqr]\|([^{}|]*)\}/g,'$1'),TOK=/(?<![A-Za-z0-9_])([a-z]{1,2}\d{1,2}k?)(?![A-Za-z0-9])/g;
 for(const s of COMQ){const box=B.box(s.box);assert.ok(box&&itRules.has(s.box),'컴퓨터일반 파트 상자: '+s.box);const lines=hLines(box);assert.equal(lines.size,s.boxLines,s.box+' 줄 수(기존 + 덧붙인 줄)');for(const id of s.lines)assert.ok(lines.has(id),'덧붙인 줄이 상자에 있다: '+s.box+' '+id);}
 for(const id of comq){const q=bank[id],s=COMQ.find(x=>id.startsWith(x.pre));assert.ok(s&&q.ruleId===s.box,'컴퓨터일반 자체 제작 문제의 ruleId = 파트 상자: '+id);assert.equal(q.variants.length,1,'문제 하나: '+id);
  const a=B.forQuestion(id),lines=hLines(B.box(s.box));assert.ok(a&&a.box===s.box&&a.use.length&&Array.isArray(a.blocks)&&a.blocks.length,'컴퓨터일반 자체 제작 대입: '+id);
  for(const u of a.use){assert.ok(lines.has(u),'대입 줄이 그 파트 상자에 없다: '+id+' '+u);comqUse++;}
  for(const b of a.blocks){const p=plain(b);assert.ok(!/두문자|비결/.test(p),'대입에 두문자 · 비결: '+id);for(const m of p.matchAll(TOK))assert.ok(!lines.has(m[1]),'대입에 줄 id: '+id+' '+m[1]);}}}
const covered=new Set([...logic,...reading,...grammar,...english,...history,...itQuestions,...gichulBasics,...comq]);
for(const id of Object.keys(B.apply))assert.ok(covered.has(id),'대입이 있는데 논리 · 독해 · 영어 파트 문제가 아니다: '+id);

// ── 2) 상자 모양: 용어는 뜻 + 예), 한자가 있으면 원뜻, 규칙·비교 예문(✓와 ✗ 둘 다)
const texts=[];const push=(where,t)=>{if(typeof t==='string')texts.push([where,t]);};
function applyTexts(where,blocks){for(const b of blocks){if(typeof b==='string')push(where,b);else if(b.table){b.table.head.forEach(t=>push(where,t));b.table.rows.flat().forEach(t=>push(where,t));}else{(function walk(ns){for(const n of ns){push(where,n.label);push(where,n.text);walk(n.kids||[]);}})(b.boxes);}}}
let withTable=0;
for(const [rule,box] of Object.entries(B.boxes)){
 assert.ok(box.title&&box.terms.length&&box.rules.items.length&&box.examples.length,'상자 뼈대: '+rule);push(rule,box.title);
 for(const t of box.terms){assert.ok(t.word&&t.mean&&t.ex,'용어는 낱말·뜻·예): '+rule+' '+t.id);if(t.hanja)assert.ok(t.origin,'한자를 달면 원뜻도: '+rule+' '+t.id);
  [t.word,t.origin,t.mean,t.ex,...(t.rows||[])].forEach(x=>push(rule,x));}
 if(box.table){withTable++;assert.ok(box.table.title&&box.table.head.length&&box.table.rows.length,'표: '+rule);push(rule,box.table.title);box.table.head.forEach(x=>push(rule,x));box.table.rows.flat().forEach(x=>push(rule,x));if(box.table.key)push(rule,box.table.key.text);}
 for(const t of box.tables||[]){assert.ok(t.id&&t.title&&t.head.length&&t.head.length<=3&&t.rows.length&&t.rows.every(r=>r.length===t.head.length),'한국사 표(칸 셋까지 · 줄 너비): '+rule+' '+t.id);push(rule,t.title);t.head.forEach(x=>push(rule,x));t.rows.flat().forEach(x=>push(rule,x));if(t.key)push(rule,t.key.text);}
 push(rule,box.rules.title);for(const r of box.rules.items){assert.ok(r.name&&r.text,'규칙은 이름·내용: '+rule);push(rule,r.name);push(rule,r.text);}if(box.rules.key)push(rule,box.rules.key.text);
 assert.ok(box.examples.some(x=>x.ok)&&box.examples.some(x=>!x.ok),'비교 예문은 ✓와 ✗를 함께: '+rule);
 for(const x of box.examples){assert.ok(x.text&&x.why,'비교 예문은 문장과 한 줄 까닭: '+rule);push(rule,x.text);push(rule,x.why);}
}
for(const [id,a] of Object.entries(B.apply))applyTexts(id+' 대입',a.blocks);
for(const id of [...logic,...reading,...grammar]){const e=bank[id].variants[0].explanation;push(id+' 해설',e);
 const ps=e.split('\n\n');assert.equal(ps.length,3,'해설은 세 문단: '+id);
 assert.ok(ps[0].startsWith('정답 근거: ')&&ps[1].startsWith('보기 비교: ')&&ps[2].startsWith('기억 연결: '),'해설 짜임(정답 근거 · 보기 비교 · 기억 연결): '+id);
 assert.ok(!/\*\*|\{[spmqr]\|/.test(e),'해설은 앱에서 글자 그대로 보이니 **·{x| 표시 금지: '+id);}
// 영어 해설: 정답 근거 · 보기 비교 · (외우는 공식 | 기억 연결). 셋째 문단(외우는 공식)은 앱이 굵게 그리므로 ** 허용, 앞 두 문단은 글자 그대로.
for(const id of english){const e=bank[id].variants[0].explanation,ps=e.split('\n\n');
 assert.ok(ps.length>=3&&ps[0].startsWith('정답 근거: ')&&ps[1].startsWith('보기 비교: ')&&(ps[2].startsWith('외우는 공식\n')||ps[2].startsWith('기억 연결: ')),'영어 해설 짜임: '+id);
 assert.ok(!/\*\*|\{[spmqr]\|/.test(ps.slice(0,2).join(' ')),'영어 해설 앞 두 문단에 **·{x| 금지: '+id);push(id+' 해설',ps.slice(0,2).join('\n\n'));}

// 카드 · 문항 · 변형은 앱 내부 용어라 금지 — 단 스마트카드 · 신용카드 · IC카드 · 카드 결제처럼 기술 · 일상 용어의 '카드'는 허용(정보보호론 v165~).
const TECH_CARD=/스마트 ?카드|신용 ?카드|IC ?카드|카드 ?결제|카드 ?번호|카드사|랜카드|천공 ?카드|그래픽 ?카드|인터페이스 ?카드|확장 ?카드|메모리 ?카드|LAN ?카드|사운드 ?카드|비디오 ?카드/g,noTech=t=>String(t).replace(TECH_CARD,'');
// ── 3) 표기: 카드·문항·변형 금지, 한자는 한글 뒤 괄호 안에만, 날 HTML 없음
for(const [where,t] of texts){
 assert.ok(!/카드|문항|변형/.test(noTech(t)),'카드·문항·변형이라는 말: '+where+' — '+t.slice(0,60));
 assert.ok(!/<\/?[a-z][^>]*>/i.test(t),'날 HTML: '+where);
 for(const m of t.matchAll(/[㐀-鿿]+/g)){const open=t.lastIndexOf('(',m.index),close=t.indexOf(')',m.index);
  assert.ok(open>=0&&close>m.index&&t.lastIndexOf(')',m.index)<open,'한자는 괄호 안에만: '+where+' — '+m[0]);
  assert.ok(/[가-힣]/.test(t[open-1]||''),'한자 괄호 앞에는 한글: '+where+' — '+t.slice(Math.max(0,open-6),close+1));}
}

// 3-2) 한국사: 두문자 · 비결 없음, 글에 줄 id(a1 · r3 …)가 보이지 않음(화면에는 id가 없다), 연도는 'y'로 시작하는 줄(그 파트 문제가 연도를 직접 물을 때)에만,
//      대입의 연도는 그 문제의 발문 · 보기에 나온 것만. 연도로 줄 세우지 않고 왕 순서로 푸는 상자여야 한다.
// 3-3) 정보보호론 · 컴퓨터일반: 두문자 · 비결 없음, 글에 그 상자의 줄 id(t3 · a12 · r4 · x2 …)가 보이지 않음. 연도 규칙은 없다(표준 · 버전 · 포트 숫자가 본문).
{const plain=t=>String(t).replace(/\{[spmqr]\|([^{}|]*)\}/g,'$1'),TOK=/(?<![A-Za-z0-9_])([a-z]{1,2}\d{1,2}k?)(?![A-Za-z0-9])/g;
 for(const r of itRules){const b=B.box(r),ids=hLines(b),texts=[b.title,...b.terms.flatMap(t=>[t.word,t.origin,t.mean,t.ex]),...b.tables.flatMap(t=>[t.title,...t.head,...t.rows.flat(),t.key?.text]),...b.rules.items.flatMap(x=>[x.name,x.text]),...b.examples.flatMap(x=>[x.text,x.why])].filter(Boolean);
  for(const t of texts){const p=plain(t);assert.ok(!/두문자|비결|앞 ?글자만/.test(p),'두문자 · 비결: '+r);for(const m of p.matchAll(TOK))assert.ok(!ids.has(m[1]),'글에 줄 id: '+r+' '+m[1]+' — '+p.slice(0,50));}}
 for(const id of itQuestions){const a=B.forQuestion(id),ids=hLines(B.box(a.box));for(const b of a.blocks){const p=plain(b);assert.ok(!/두문자|비결/.test(p),'대입에 두문자 · 비결: '+id);for(const m of p.matchAll(TOK))assert.ok(!ids.has(m[1]),'대입에 줄 id: '+id+' '+m[1]);}}}
// 3-4) 상자를 붙인 전공 과목 기출의 해설(gichul/*.json)도 같은 화면에 나오므로 카드 · 문항 · 변형이라는 말이 없어야 한다(기술 용어 스마트카드 등은 허용, v166).
{const GF=require('./gichul-files.cjs'),code={'정보보호론':'security','컴퓨터일반':'computer'};
 for(const [s,list] of Object.entries(IT_DONE)){if(!list.length)continue;for(const id of GF.ids().filter(x=>x.endsWith('-'+code[s])))for(const q of GF.read(id).questions)
  assert.ok(!/카드|문항|변형/.test(noTech(q.e||'')),'기출 해설에 카드 · 문항 · 변형: '+id+' '+q.n);}}
let hYearLines=0;
{const HC={};vm.createContext(HC);for(const f of ['core-review-pack.js','quiz-options.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),HC,{filename:f});
 const card=new Map(HC.CORE_REVIEW_PACK.map(c=>[c.id,c]));
 const YEAR=/\d{3,4}\s*년|기원전|\d+\s*만\s*년|\d+\s*세기|(?<!\d)\d{3,4}(?!\d)/,ID=/(?<![A-Za-z])[a-z]\d{0,2}[a-z]?(?:\s*표)?\)|(?<![A-Za-z])[a-z]\d{1,2}[a-z]?(?![A-Za-z0-9])/,plain=t=>String(t).replace(/\{[spmqr]\|([^{}|]*)\}/g,'$1');
 for(const r of hrules){const b=B.box(r);
  const lines=[['title',[b.title]],...b.terms.map(t=>[t.id,[t.word,t.origin,t.mean,t.ex]]),...b.tables.flatMap(t=>[[t.id,[t.title,...t.head]],...t.rows.map((row,i)=>[t.rowIds[i],row])]),...b.rules.items.map(x=>[x.id,[x.name,x.text]]),...b.examples.map(x=>[x.id,[x.text,x.why]])];
  for(const [id,ts] of lines){if(id.startsWith('y'))hYearLines++;for(const t of ts.filter(Boolean)){const p=plain(t);
   assert.ok(!/두문자|비결|앞 ?글자만/.test(p),'두문자 · 비결: '+r+' '+id);assert.ok(!ID.test(p),'글에 줄 id: '+r+' '+id+' — '+p.slice(0,50));
   if(!id.startsWith('y'))assert.ok(!YEAR.test(p),'연도는 y 줄에만: '+r+' '+id+' — '+p.slice(0,60));}}}
 for(const id of history){const o=HC.QUIZ_OPTIONS[id],own=(o.question||card.get(id).question)+' '+o.choices.join(' ');
  for(const b of B.forQuestion(id).blocks){const p=plain(b);assert.ok(!ID.test(p),'대입에 줄 id: '+id+' — '+p.slice(0,50));assert.ok(!/두문자|비결/.test(p),'대입에 두문자 · 비결: '+id);
   for(const y of p.match(/(?<!\d)\d{3,4}(?!\d)/g)||[])assert.ok(own.includes(y),'대입의 연도는 문제에 나온 것만: '+id+' '+y);}}}

// ── 4) 교재 문장 겹침: 교재 옮겨 적기 노트(저장소 밖 research/korean-logic)가 있을 때만. 공백·문장부호를 뺀 16자 이상이 같으면 실패.
const NOTES=path.join(__dirname,'..','research','korean-logic');
let overlapChecked='건너뜀(교재 노트 없음)';
if(fs.existsSync(NOTES)){
 const norm=s=>s.replace(/[^가-힣A-Za-z0-9]/g,'');const book=[];
 for(const f of fs.readdirSync(NOTES).filter(f=>/source-notes\.md$/.test(f))){const s=fs.readFileSync(path.join(NOTES,f),'utf8');for(const m of s.matchAll(/「([^」]{8,})」|〔([^〕]{8,})〕/g))book.push(norm(m[1]||m[2]));}
 const grams=new Set();for(const b of book)for(let i=0;i+16<=b.length;i++)grams.add(b.slice(i,i+16));
 for(const [where,t] of texts){const n=norm(t);for(let i=0;i+16<=n.length;i++)assert.ok(!grams.has(n.slice(i,i+16)),'교재 문장과 16자 이상 겹침: '+where+' — '+n.slice(i,i+16));}
 overlapChecked='교재 문장 '+book.length+'개와 16자 겹침 0';
 // 대조군: 교재 문장 하나를 그대로 넣으면 걸려야 한다.
 const sample=book.find(b=>b.length>=16);assert.ok(sample&&grams.has(sample.slice(0,16)),'겹침 검사 대조군');
}

// 4-2) 독해: 교재 2 · 3장 전사본(저장소 밖 research/korean-reading-ch2-3-20260924/transcript)과 16자 겹침 0,
//      교재 예문 낱말(research/korean-reading · korean-reading-ch2-3-20260924의 check.py BANNED)은 상자에 0개,
//      해설 · 대입에는 그 문제 자신의 발문 · 보기에 나온 낱말만. 둘 다 있을 때만 검사한다(공개 저장소에는 교재가 없다).
const RROOT=path.join(__dirname,'..','research'),TR=path.join(RROOT,'korean-reading-ch2-3-20260924','transcript');
let readingOverlap='건너뜀(독해 전사본 없음)';
if(fs.existsSync(TR)){
 const norm=s=>String(s).replace(/\{[spmqr]\|([^{}|]*)\}/g,'$1').replace(/\*\*/g,'').replace(/[^가-힣A-Za-z0-9]/g,'').toLowerCase();
 const lines=[];for(const f of fs.readdirSync(TR).filter(f=>f.endsWith('.txt')))for(const l of fs.readFileSync(path.join(TR,f),'utf8').split(/\r?\n/)){const t=l.trim();if(!t||/^(#|===|\[자체 풀이\]|\[손글씨)/.test(t))continue;const n=norm(t);if(n.length>=16)lines.push(n);}
 const grams=new Set();for(const b of lines)for(let i=0;i+16<=b.length;i++)grams.add(b.slice(i,i+16));
 const rt=[];const add=(where,t,own)=>{if(typeof t==='string')rt.push([where,t,own]);};
 const walk=(where,v,own)=>{if(typeof v==='string')add(where,v,own);else if(Array.isArray(v))v.forEach(x=>walk(where,x,own));else if(v&&typeof v==='object')for(const [k,x] of Object.entries(v))if(!['id','c','ok','use'].includes(k))walk(where,x,own);};
 for(const r of rrules)walk(r,B.boxes[r],null);
 for(const id of reading){const v=bank[id].variants[0],own=v.question+' '+v.choices.join(' ');walk(id+' 대입',B.forQuestion(id).blocks,own);add(id+' 해설',v.explanation,own);}
 for(const [where,t] of rt){const n=norm(t);for(let i=0;i+16<=n.length;i++)assert.ok(!grams.has(n.slice(i,i+16)),'독해 교재 문장과 16자 이상 겹침: '+where+' — '+n.slice(i,i+16));}
 const sample=lines.find(b=>b.length>=16);assert.ok(sample&&grams.has(sample.slice(0,16)),'독해 겹침 검사 대조군');
 const banned=new Set();for(const f of [path.join(RROOT,'korean-reading','check.py'),path.join(RROOT,'korean-reading-ch2-3-20260924','check.py')]){if(!fs.existsSync(f))continue;const m=/BANNED = \[([\s\S]*?)\n\]/.exec(fs.readFileSync(f,'utf8'));if(m)for(const w of m[1].matchAll(/"([^"]+)"/g))banned.add(w[1]);}
 for(const [where,t,own] of rt)for(const w of banned)assert.ok(!t.includes(w)||(own!==null&&own.includes(w)),'교재 예문 낱말: '+where+' — '+w);
 readingOverlap='전사본 '+lines.length+'줄과 16자 겹침 0 · 교재 예문 낱말 '+banned.size+'개 0';
}

// 4-3) 영어: 교재 전사본(저장소 밖 research/english-days)이 있을 때만, 영어 상자 · 대입과 16자 겹침 0(research/basics-english-20260924/overlap.cjs의 전사본 목록).
const EOV=path.join(RROOT,'basics-english-20260924','overlap.cjs');
let englishOverlap='건너뜀(영어 전사본 없음)';
if(fs.existsSync(EOV)&&fs.existsSync(path.join(RROOT,'english-days'))){
 const ov=require(EOV),T=[];const walk=(where,v)=>{if(typeof v==='string')T.push({where,t:v});else if(Array.isArray(v))v.forEach(x=>walk(where,x));else if(v&&typeof v==='object')for(const [k,x] of Object.entries(v))if(!['id','c','ok','use'].includes(k))walk(where,x);};
 for(const r of erules)walk(r,B.boxes[r]);for(const id of english)walk(id+' 대입',B.forQuestion(id).blocks);
 const r=ov.check(12,16,T);assert.equal(r.fails.length,0,'영어 교재 문장과 16자 이상 겹침: '+JSON.stringify(r.fails.slice(0,3)));
 englishOverlap='전사본 '+r.sources+'줄과 16자 겹침 0';
 // v160: 상자 밖 영어 글(lesson · 예문 · 해설 · 발문 · 보기 · 외울 것)도 허용 목록(공식 표기 등) 말고는 16자 겹침 0.
 const OS=path.join(RROOT,'basics-english-20260924','overlap-spans.cjs');
 if(fs.existsSync(OS)){const s=require(OS).scan();assert.equal(s.out.length,0,'영어 문제 글에 교재 조각: '+JSON.stringify(s.out.slice(0,3)));englishOverlap+=' · 문제 글 16자 겹침 0(허용 목록 '+new Set(s.allowed.map(a=>a.sub)).size+'구절)';}
}

// ── 5) 앱: 해설 화면의 상자 절 순서, 파트별 상태의 '기초 개념 보기'
function el(tag='div'){
 const node={tag,children:[],attrs:{},dataset:{},classes:new Set(),_text:'',hidden:false,disabled:false,open:false,
  get textContent(){return node._text+node.children.map(c=>c.textContent).join('');},set textContent(v){node._text=String(v);node.children=[];},
  append(...k){node.children.push(...k);},replaceChildren(...k){node.children=k;},
  classList:{add:c=>node.classes.add(c),remove:c=>node.classes.delete(c),toggle:(c,on)=>on?node.classes.add(c):node.classes.delete(c),contains:c=>node.classes.has(c)},
  setAttribute(k,v){node.attrs[k]=v;},getAttribute(k){return node.attrs[k];},focus(){},setSelectionRange(){},addEventListener(){},
  querySelector(sel){return sel==='summary'?el('summary'):null;},querySelectorAll(){return [];},
  get all(){const out=[];(function walk(n){for(const c of n.children){out.push(c);walk(c);}})(node);return out;}};
 return node;
}
const FILES=['scheduler.js','learning.js','core-review-pack.js','quiz-options.js','hanneung-data.js','hanneung-explanations.js','hanneung.js','gichul-index.js','gichul.js','practice-bank.js','practice.js','content-corrections.js','review-record.js','review-policy.js','sync-core.js','study-credit.js','xp.js','score.js','study-review-catalog.js','hanneung-topics.js','topics.js','parts.js','part-check.js','memorize.js','basics.js','core-units.js','content-store.js','app.js'];
const nodes=new Map(),store=new Map();
const doc={createElement:tag=>el(tag),createTextNode(t){const n=el('#text');n._text=String(t);return n;},body:el('body'),activeElement:null,
 querySelector(sel){if(!nodes.has(sel))nodes.set(sel,el(sel));return nodes.get(sel);},querySelectorAll(){return [];},addEventListener(){}};
const ctx={document:doc,console,localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
 crypto:{randomUUID:()=>'id-'+Math.random().toString(16).slice(2)},history:{state:{depth:0},pushState(s){this.state=s;},replaceState(s){this.state=s;}},
 navigator:{},setInterval:()=>1,clearInterval(){},setTimeout:()=>1,clearTimeout(){},structuredClone,addEventListener(){},dispatchEvent(){},scrollTo(){},
 fetch:()=>Promise.reject(Error('no fetch')),Date,JSON,Math,Set,Map,Number,String,Object,Array,Error,RegExp,Intl,Promise,Event:class{constructor(t){this.type=t;}}};
ctx.window=ctx;ctx.self=ctx;vm.createContext(ctx);
for(const f of FILES)vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx,{filename:f});
const run=code=>{const v=vm.runInContext(code,ctx);return Array.isArray(v)?Array.from(v):v;};
const eqJ=(x,y,m)=>assert.deepEqual(JSON.parse(JSON.stringify(x)),JSON.parse(JSON.stringify(y)),m);
const cls=n=>String(n.className||'').split(' ');
// 5-1) 논리 995 · 독해 920문제 모두: 상자를 그려 절 제목이 1부터 이어지고 순서가 맞는지.
let tableSections=0;
for(const id of [...logic,...reading,...grammar]){
 const heads=run(`(()=>{const q=PRACTICE_BANK[${JSON.stringify(id)}];const d=basicsDetails('기초 개념',BASICS.box(q.ruleId),BASICS.forQuestion(${JSON.stringify(id)}));const out=[];(function w(n){for(const c of n.children){if(c.className==='b-h')out.push(c._text);w(c);}})(d);return out;})()`);
 const box=B.box(bank[id].ruleId),want=['먼저 알아 둘 말',...(box.table?[box.table.title]:[]),'규칙 — '+box.rules.title,'비교 예문','이 문제에 대입'];
 if(box.table)tableSections++;
 eqJ(heads,want.map((t,i)=>(i+1)+'. '+t),'절 순서: '+id);
}
// 5-1-2) 영어 2163문제. (가) 모두 보기에서 절 순서. (나) 해설 화면(fold, 그 문제의 파트)에서 번호가 이어지고, 규칙 · 비교 예문이
//   빠짐없이 한 번씩 있다. (다) 공식(규칙 id 앞머리, 'm-' 줄은 줄마다)이 넷 이상인 상자는 대입이 쓰는 공식의 규칙 · 예문만 제자리,
//   나머지 공식은 닫힌 '이 정리의 다른 공식 N개 더 보기' 하나에. 그런 상자는 용어도 대입이 쓰는 것만 제자리(쓰는 용어가 없으면
//   제자리 규칙 글에 나오는 용어), 나머지는 닫힌 '이 정리의 다른 용어 N개 더 보기'. 기대값은 여기서 따로 계산한다.
const enRes=run(`(()=>{const out=[],walk=(n,f)=>{for(const c of n.children){f(c);walk(c,f);}},grp=id=>id.startsWith('m-')||!id.includes('-')?id:id.slice(0,id.lastIndexOf('-'));
 const names=(d,top)=>{const r=[];(top?d.children:(()=>{const a=[];walk(d,c=>a.push(c));return a;})()).forEach(c=>{if(c.className==='b-rule')r.push(c.children[0]._text);});return r;};
 const exs=(d,top)=>{let k=0;(top?d.children:(()=>{const a=[];walk(d,c=>a.push(c));return a;})()).forEach(c=>{if(c.tag==='p'&&String(c.className).startsWith('b-ex')&&c.children[0]?.tag==='span'&&/^[✓✗]$/.test(c.children[0]._text))k++;});return k;};
 for(const id of ${JSON.stringify(english)}){const q=PRACTICE_BANK[id],rule=q.ruleId,box=BASICS.box(rule),a=BASICS.forQuestion(id),part=PARTS.partOf(id);
  const all=basicsDetails('기초 개념',box,a),fold=basicsDetails('기초 개념',box,a,'fold',null,part),heads=d=>{const h=[];walk(d,c=>{if(c.className==='b-h')h.push(c._text);});return h;};
  const own=box.rules.items.filter(r=>!basicsShared(r,rule,part)),groups=[...new Set(own.map(r=>grp(r.id)))];
  const used=new Set(a.use.map(u=>{const [x,y]=u.split(':');return y===undefined?x:x===rule?y:null;}).filter(Boolean).map(grp)),kept=groups.filter(g=>used.has(g));
  const split=own.every(r=>r.id.includes('-'))&&groups.length>=4&&kept.length>0&&kept.length<groups.length;
  const tf=fold.children.find(c=>c.className==='b-terms-fold'),tbox=tf||fold,more=fold.children.filter(c=>c.className==='b-more'),mt=tbox.children.filter(c=>c.className==='b-more-terms');
  const chips=(d,top)=>{const r=[];(top?d.children:(()=>{const x=[];walk(d,c=>x.push(c));return x;})()).forEach(c=>{if(c.className==='b-term')r.push(c.children[0]._text);});return r;};
  const ownT=box.terms.filter(t=>!basicsShared(t,rule,part)),tid=new Set(a.use.map(u=>{const [x,y]=u.split(':');return y===undefined?x:x===rule?y:null;}).filter(Boolean));
  let keepT=ownT.filter(t=>tid.has(t.id));if(split&&!keepT.length){const txt=own.filter(r=>kept.includes(grp(r.id))).map(r=>r.name+' '+r.text).join(' ');keepT=ownT.filter(t=>txt.includes(t.word.replace(/ *[(][^)]*[)]$/,'')));}
  const label=t=>t.word+(t.hanja?'('+t.hanja+')':'');
  out.push({id,rule,heads:heads(all),fheads:heads(fold),allRules:names(all).length,foldRules:names(fold).length,allEx:exs(all),foldEx:exs(fold),
   more:more.length,moreOpen:more[0]?more[0].open:false,moreSummary:more[0]?.children[0]._text||'',
   wantMore:split?groups.length-kept.length:0,topRules:names(fold,true),wantTop:split?own.filter(r=>kept.includes(grp(r.id))).map(r=>r.name):own.map(r=>r.name),
   inMore:more[0]?names(more[0]).length:0,wantInMore:split?own.filter(r=>!kept.includes(grp(r.id))).length:0,
   allTerms:chips(all).length,foldTerms:chips(fold).length,topTerms:chips(tbox,true),tf:!!tf,tfOpen:tf?tf.open:false,tfSummary:tf?.children[0]._text||'',ownTerms:ownT.length,bareTop:chips(fold,true).length,wantTopTerms:(split?keepT:ownT).map(label),
   mt:mt.length,mtOpen:mt[0]?mt[0].open:false,mtSummary:mt[0]?.children[0]._text||'',wantMt:split?ownT.length-keepT.length:0});}
 return out;})()`);
let splitBoxes=0,termSplit=0;const splitSeen=new Set();
for(const r of enRes){const box=B.box(r.rule),want=['먼저 알아 둘 말',...(box.table?[box.table.title]:[]),'규칙'+(box.rules.title?' — '+box.rules.title:''),'비교 예문','이 문제에 대입'].map((t,i)=>(i+1)+'. '+t);
 eqJ(r.heads,want,'영어 절 순서: '+r.id);eqJ(r.fheads,want,'해설 화면에서도 번호가 이어진다: '+r.id);
 assert.equal(r.foldRules,r.allRules,'규칙이 빠지거나 겹치지 않는다: '+r.id);assert.equal(r.foldEx,r.allEx,'비교 예문이 빠지거나 겹치지 않는다: '+r.id);
 eqJ(r.topRules,r.wantTop,'제자리에 두는 규칙 = 대입이 쓰는 공식의 규칙: '+r.id);
 // v194 사용자 "문법 용어설명은 기본은 접혀잇도록": 해설 화면의 용어 풀이는 닫힌 'b-terms-fold' 하나 안에(바로 보이는 용어 0).
 if(r.ownTerms){assert.ok(r.tf,'용어 접기 있음: '+r.id);assert.equal(r.tfOpen,false,'용어 접기는 닫혀 있다: '+r.id);assert.equal(r.tfSummary,'문법 용어 풀이 '+r.ownTerms+'개 보기');}else assert.ok(!r.tf,'용어 없으면 접기 없음: '+r.id);
 assert.equal(r.bareTop,0,'바로 펼쳐진 용어 없음: '+r.id);
 assert.equal(r.foldTerms,r.allTerms,'용어가 빠지거나 겹치지 않는다: '+r.id);eqJ(r.topTerms,r.wantTopTerms,'제자리에 두는 용어: '+r.id);
 if(r.wantMt){termSplit++;assert.equal(r.mt,1,'다른 용어 모음 하나: '+r.id);assert.equal(r.mtOpen,false);assert.equal(r.mtSummary,'이 정리의 다른 용어 '+r.wantMt+'개 더 보기');}else assert.equal(r.mt,0,'용어 모음 없음: '+r.id);
 if(!r.wantMore)assert.equal(r.wantMt,0,'공식을 안 나눈 상자는 용어도 그대로: '+r.id);
 if(r.wantMore){splitBoxes++;splitSeen.add(r.rule);assert.equal(r.more,1,'다른 공식 모음 하나: '+r.id);assert.equal(r.moreOpen,false,'닫혀 있다: '+r.id);
  assert.equal(r.moreSummary,'이 정리의 다른 공식 '+r.wantMore+'개 더 보기');assert.equal(r.inMore,r.wantInMore,'나머지 공식의 규칙은 모두 모음 안에: '+r.id);}
 else assert.equal(r.more,0,'공식이 적은 상자는 그대로: '+r.id);}
assert.ok(splitBoxes>500&&splitSeen.has('grammar-formula-structure')&&splitSeen.has('grammar-formula-verbal'),'공식 훈련 큰 상자는 나뉜다: '+splitBoxes);
assert.ok(termSplit>500,'나눈 상자의 용어도 나뉜다: '+termSplit);
// 5-1-3) 국어 상자(규칙 id에 '-' 없음)는 공식 나누기를 하지 않는다.
assert.equal(run(`${JSON.stringify([...logic,...reading,...grammar])}.filter(id=>{const q=PRACTICE_BANK[id];return basicsDetails('기초 개념',BASICS.box(q.ruleId),BASICS.forQuestion(id),'fold',null,PARTS.partOf(id)).children.some(c=>c.className==='b-more');}).length`),0,'국어 상자에는 다른 공식 모음이 없다');
// 5-1-4) '함께 보는 정리'로 접는 줄 = 같은 파트의 다른 상자에 똑같이 있는 줄(모든 과목 · 모든 파트). 파트 밖 상자와만 같은 줄은 접지 않는다.
{const r=run(`(()=>{let checked=0,shared=0,crossOnly=0;const bad=[];const keys=b=>[...b.terms,...b.rules.items,b.table].filter(Boolean);
 for(const u of PARTS.units)for(const p of u.parts){const rs=[...new Set(p.ids.map(id=>PRACTICE_BANK[id]?.ruleId).filter(r=>r&&BASICS.box(r)))];
  for(const r of rs)for(const x of keys(BASICS.box(r))){const k=JSON.stringify(x),want=rs.some(o=>o!==r&&keys(BASICS.box(o)).some(y=>JSON.stringify(y)===k)),got=basicsShared(x,r,p.id);checked++;if(got)shared++;
   if(!want&&Object.entries(BASICS.boxes).some(([o,b])=>o!==r&&keys(b).some(y=>JSON.stringify(y)===k)))crossOnly++;if(want!==got)bad.push(p.id+' '+r+' '+(x.id||''));}}
 return {checked,shared,crossOnly,bad:bad.slice(0,5)};})()`);
 eqJ(r.bad,[],'공통 판정은 같은 파트 안에서만');assert.ok(r.crossOnly>1000,'파트 밖 상자와만 같은 줄이 많다(영어 공식 · Day) — 이것들은 접히지 않는다: '+r.crossOnly);
 assert.equal(run("basicsShared(BASICS.box('reading-read1-dev-time').table,'reading-read1-dev-time','kr1-8')"),true,'전개 방식 표는 kr1-8에서 공통');
 const dn=run("JSON.stringify(BASICS.box('grammar-formula-structure').rules.items.find(r=>r.id==='dn-1'))");
 assert.ok(run(`Object.entries(BASICS.boxes).some(([k,b])=>k!=='grammar-formula-structure'&&b.rules.items.some(r=>JSON.stringify(r)===${JSON.stringify(dn)}))`),'dn-1은 Day 상자에도 있다');
 assert.equal(run(`basicsShared(${dn},'grammar-formula-structure',PARTS.partOf('en-formula-001')||'enf-1')`),false,'공식 훈련 상자의 dn-1은 파트 밖 Day 상자 때문에 접히지 않는다');}

// 5-1-5) 한국사: (가) 모두 보기(파트 화면과 같은 방식)는 절 = 먼저 알아 둘 말 → 표마다 제목 → 규칙 → 비교 예문 → 이 문제에 대입.
//   (나) 해설 화면(fold): 대입이 쓰는 줄(용어 · 표 줄 · 규칙 · 예문, 표 id면 표 전체)만 제자리, 나머지는 닫힌 '이 정리의 나머지 더 보기 — …' 하나.
//   제자리에 둘 줄이 없는 절은 제목 없이 번호를 당기고, 줄은 빠지거나 겹치지 않는다. 기대값은 여기서 따로 센다.
let hSplit=0,hTopLines=0,hAllLines=0;
// v177: 한국사 상자 끝에 '외울 것'(줄이 있으면) · '암기법'(블록이 있으면) — 대입 뒤, 번호 이어 매김.
const memoHeads=box=>[...(box.memorize?.length?['외울 것']:[]),...(box.mnemonics?.length?['암기법']:[])];
{const res=run(`(()=>{const out=[],walk=(n,f)=>{for(const c of n.children){f(c);walk(c,f);}};
 const count=(d,top)=>{const xs=[];if(top)xs.push(...d.children);else walk(d,c=>xs.push(c));
  return {terms:xs.filter(c=>c.className==='b-term').length,rules:xs.filter(c=>c.className==='b-rule').length,ex:xs.filter(c=>c.tag==='p'&&String(c.className).startsWith('b-ex')&&c.children[0]?.tag==='span').length,rows:xs.filter(c=>c.tag==='table').reduce((s,t)=>s+t.children.length-1,0)};};
 const heads=d=>{const h=[];walk(d,c=>{if(c.className==='b-h')h.push(c._text);});return h;};
 for(const id of ${JSON.stringify([...history,...itQuestions,...comq])}){const a=BASICS.forQuestion(id),box=BASICS.box(a.box),all=basicsDetails('기초 개념',box,a),fold=basicsDetails('기초 개념',box,a,'fold',null,PARTS.partOf(id));
  const more=fold.children.filter(c=>String(c.className).split(' ').includes('b-rest'));
  out.push({id,heads:heads(all),fheads:heads(fold),all:count(all),top:count(fold,true),inMore:more[0]?count(more[0]):{terms:0,rules:0,ex:0,rows:0},more:more.length,moreOpen:more[0]?more[0].open:false,moreSummary:more[0]?.children[0]._text||''});}
 return out;})()`);
 for(const r of res){const a=B.forQuestion(r.id),box=B.box(a.box),use=new Set(a.use),num=xs=>xs.map((t,i)=>(i+1)+'. '+t);
  const rowsOf=t=>use.has(t.id)?t.rows.length:t.rowIds.filter(x=>use.has(x)).length;
  const want={terms:box.terms.filter(t=>use.has(t.id)).length,rules:box.rules.items.filter(x=>use.has(x.id)).length,ex:box.examples.filter(x=>use.has(x.id)).length,rows:box.tables.reduce((s,t)=>s+rowsOf(t),0)};
  const total={terms:box.terms.length,rules:box.rules.items.length,ex:box.examples.length,rows:box.tables.reduce((s,t)=>s+t.rows.length,0)};
  eqJ(r.heads,num(['먼저 알아 둘 말',...box.tables.map(t=>t.title),'규칙'+(box.rules.title?' — '+box.rules.title:''),'비교 예문','이 문제에 대입',...memoHeads(box)]),'한국사 모두 보기 절 순서: '+r.id);
  eqJ(r.all,total,'모두 보기는 줄 전부: '+r.id);
  eqJ(r.fheads,num([...(want.terms?['먼저 알아 둘 말']:[]),...box.tables.filter(t=>rowsOf(t)||(t.key&&use.has(t.key.id))).map(t=>t.title),...(want.rules?['규칙'+(box.rules.title?' — '+box.rules.title:'')]:[]),...(want.ex?['비교 예문']:[]),'이 문제에 대입',...memoHeads(box)]),'해설 화면 절 = 제자리에 둔 줄이 있는 절만, 번호 이어 매김: '+r.id);
  eqJ(r.top,want,'제자리 = 대입이 쓰는 줄: '+r.id);
  for(const k of Object.keys(total))assert.equal(r.top[k]+r.inMore[k],total[k],'줄이 빠지거나 겹치지 않는다('+k+'): '+r.id);
  const rest=Object.keys(total).some(k=>total[k]>want[k]);
  assert.equal(r.more,rest?1:0,'나머지 모음 하나: '+r.id);if(rest){hSplit++;assert.equal(r.moreOpen,false,'나머지 모음은 닫혀 있다: '+r.id);assert.match(r.moreSummary,/^이 정리의 나머지 더 보기 — /,'모음 제목: '+r.id);}
  hTopLines+=want.terms+want.rules+want.ex+want.rows;hAllLines+=total.terms+total.rules+total.ex+total.rows;}
 assert.ok(hSplit>200,'한국사 상자는 해설 화면에서 거의 다 접힌다: '+hSplit);}
// 5-1-6) 한국사 표만(v162): 표에 b-hist, 첫 칸이 6자까지면 b-nowrap(한 줄), 둘째 칸부터 20자 넘으면 b-long(왼쪽 맞춤). 다른 과목 표에는 붙이지 않는다.
{const r=run(`(()=>{const len=t=>String(t).split('\\n')[0].replace(/\\{[spmqr]\\|([^{}|]*)\\}/g,'$1').replace(/\\*\\*/g,'').length;let bad=[],nowrap=0,long=0,other=0;
 for(const [k,b] of Object.entries(BASICS.boxes)){const d=basicsDetails('기초 개념',b,null);const tables=[];(function w(n){for(const c of n.children){if(c.tag==='table')tables.push(c);w(c);}})(d);
  if(!/^(hist|sec|com)-/.test(k)){other+=tables.filter(t=>t.classes.has('b-hist')).length;continue;}
  const src=b.tables;if(tables.length!==src.length){bad.push(k+' 표 수');continue;}
  tables.forEach((t,ti)=>{if(!t.classes.has('b-hist'))bad.push(k+' b-hist');t.children.slice(1).forEach((tr,ri)=>tr.children.forEach((td,ci)=>{const L=len(src[ti].rows[ri][ci]),nw=td.classes.has('b-nowrap'),lg=td.classes.has('b-long');nowrap+=nw;long+=lg;
   if(nw!==(ci===0&&L<=6)||lg!==(ci>0&&L>20))bad.push(k+' '+src[ti].rowIds[ri]+' '+ci);}));});}
 return {bad:bad.slice(0,5),nowrap,long,other};})()`);
 eqJ(r.bad,[],'한국사 · 전공 과목 표 칸 표시');assert.equal(r.other,0,'다른 과목 표에는 b-hist 없음');assert.ok(r.nowrap>30&&r.long>30,'짧은 첫 칸 · 긴 칸이 있다: '+JSON.stringify(r));}
// 5-1-7) 한국사 상자 끝의 외울 것 · 암기법(v177, 사용자 "기초개념에 외울것을 정리하고 창의적암기법도 같이 표시").
//   (가) 데이터: 한국사 상자마다 외울 것 1~12줄("**대상** → …"), 대상은 외울 것 목록(memorize.js)의 카드 앞면 · 짝 이름 · 왕 · 순서 목록 이름,
//        연도 · 카드/문항/변형 · 두문자/비결 없음. 암기법은 HISTORY_MNEMONICS에 있는 블록 id + 부르는 낱말. 다른 과목 상자에는 둘 다 없다.
//   (나) 화면: 해설 화면(fold)과 파트 화면 모두 대입 뒤에 외울 것 줄 수 그대로, 암기법 블록 수 그대로(블록 넷 이상이면 이 문제 대입에
//        부르는 낱말이 나오는 블록만 제자리, 나머지는 닫힌 '이 파트의 다른 암기법 N개 더 보기'). 블록 글은 풀이 줄 · 상상 장면 · '소리만' 주의만.
let memoLines=0,memoBoxes=0,mnBoxes=0;const mnUsed=new Set();
{const MC={};vm.createContext(MC);for(const f of ['quiz-options.js','memorize.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),MC,{filename:f});
 const MN=MC.HISTORY_MNEMONICS,MEM=MC.STUDY_MEMORIZE||require('./memorize.js');
 const fronts=new Set();for(const set of MEM.sets){if(set.subject!=='한국사')continue;
  if(set.groups)for(const g of set.groups)for(const c of g.cards)fronts.add(c[0]);
  if(set.pairs)for(const p of set.pairs){fronts.add(p[0]);fronts.add(p[2]);}
  if(set.lines){fronts.add(set.title);for(const l of set.lines)for(const it of l.items)fronts.add(it.name);}}
 const YEARS=/\d{3,4}\s*년|\b[1-9]\d{2,3}\b/;
 for(const [r,b] of Object.entries(B.boxes)){
  if(!/^hist-/.test(r)){assert.ok(!b.memorize&&!b.mnemonics,'외울 것 · 암기법은 한국사 상자에만: '+r);continue;}
  assert.ok(Array.isArray(b.memorize)&&b.memorize.length>=1&&b.memorize.length<=12,'한국사 상자마다 외울 것 1~12줄: '+r);memoBoxes++;
  assert.equal(new Set(b.memorize).size,b.memorize.length,'외울 것 줄이 겹치지 않는다: '+r);
  for(const l of b.memorize){memoLines++;const m=/^\*\*([^*]+)\*\* → \S/.exec(l);assert.ok(m,'외울 것 줄 꼴: '+r+' — '+l);assert.ok(fronts.has(m[1]),'외울 것 대상이 외울 것 목록에 있다: '+r+' — '+m[1]);
   const p2=/\n헷갈리는 짝: \*\*([^*]+)\*\* → /.exec(l);if(p2)assert.ok(fronts.has(p2[1]),'헷갈리는 짝 오른쪽도 외울 것 목록에: '+r+' — '+p2[1]);
   assert.ok(!l.includes('↔'),'외울 것에 ↔ 없음(사용자가 \'서로 반대\'로 읽음): '+r+' — '+l);
   const t=l.replace(/\*\*/g,'');assert.ok(!YEARS.test(t),'외울 것에 연도 없음: '+r+' — '+t);assert.ok(!/카드|문항|변형|두문자|비결/.test(t),'외울 것 금지어: '+r+' — '+t);
   assert.ok(!/[㐀-鿿]/.test(t.replace(/\([^()]*\)/g,'')),'외울 것 한자는 괄호 안: '+r+' — '+t);}
  assert.ok(Array.isArray(b.mnemonics),'암기법 목록(비어도 됨): '+r);if(b.mnemonics.length)mnBoxes++;
  assert.equal(new Set(b.mnemonics.map(x=>x.id)).size,b.mnemonics.length,'암기법 블록이 겹치지 않는다: '+r);
  for(const x of b.mnemonics){const blk=MN.get(x.id);assert.ok(blk,'암기법은 HISTORY_MNEMONICS 블록: '+r+' '+x.id);mnUsed.add(x.id);
   assert.ok(Array.isArray(x.keys)&&x.keys.length&&x.keys.every(k=>typeof k==='string'&&k.length>=2),'암기법을 부르는 낱말: '+r+' '+x.id);
   const t=MN.back(blk);assert.ok(!YEARS.test(t),'암기법 글에 연도 없음: '+x.id);assert.ok(!/카드|문항|변형/.test(t),'암기법 글 금지어: '+x.id);}}
 assert.equal(memoBoxes,hrules.size,'한국사 상자 모두 외울 것');
 for(const id of mnUsed)assert.ok(MN.get(id));
 // 대조군: 연도가 든 줄 · 목록에 없는 대상은 걸려야 한다.
 assert.ok(YEARS.test('**훈련도감** → 선조 · 1593년 설치')&&!fronts.has('없는 대상'),'외울 것 검사 대조군');
 // (나) 화면
 const R=run(`(()=>{const out=[],walk=(n,f)=>{for(const c of n.children){f(c);walk(c,f);}};
  const stat=d=>{const heads=[],memo=[],mnTop=[],mnRest=[],rest=[];let text='';walk(d,c=>{if(c.className==='b-h')heads.push(c._text);if(c.className==='b-memo-line')memo.push(c);});
   for(const c of d.children){if(c.className==='b-mn')mnTop.push(c.dataset.mn);if(String(c.className).includes('b-mn-rest')){rest.push({open:c.open,summary:c.children[0]._text});for(const k of c.children)if(k.className==='b-mn')mnRest.push(k.dataset.mn);}}
   const mnText=[];walk(d,c=>{if(c.className==='b-mn')mnText.push(c.textContent);});
   return {heads,memo:memo.length,memoText:memo.map(m=>m.textContent),mnTop,mnRest,rest,mnText};};
  for(const [r,b] of Object.entries(BASICS.boxes)){if(!/^hist-/.test(r))continue;
   const id=Object.keys(BASICS.apply).find(k=>BASICS.apply[k].box===r&&!/^(gichul|hanneung)-/.test(k)),a=BASICS.forQuestion(id);
   out.push({r,id,fold:stat(basicsDetails('기초 개념',b,a,'fold',null,PARTS.partOf(id))),part:stat(basicsDetails(b.title,b,null,'skip',new Set()))});}
  return out;})()`);
 for(const x of R){const b=B.box(x.r),a=B.forQuestion(x.id),mns=b.mnemonics.map(m=>m.id);
  for(const v of [x.fold,x.part]){assert.equal(v.memo,b.memorize.length,'외울 것 줄 전부: '+x.r);
   const h=v.heads.map(s=>s.replace(/^\d+\. /,''));const i=h.indexOf('외울 것');assert.ok(i>=0&&i===h.length-(b.mnemonics.length?2:1),'외울 것 · 암기법은 상자 끝: '+x.r+' '+h.join(' / '));
   if(b.mnemonics.length)assert.equal(h[h.length-1],'암기법','암기법 절: '+x.r);
   eqJ([...v.mnTop,...v.mnRest].sort(),[...mns].sort(),'암기법 블록 전부(제자리 + 모음): '+x.r);
   for(const t of [...v.mnText,...v.memoText])assert.ok(!/카드|문항|변형|두문자|비결|덧붙임/.test(t),'암기법 · 외울 것 화면 글 금지어: '+x.r);}
  eqJ(x.part.mnRest,[],'파트 화면은 암기법 모두 제자리: '+x.r);
  const pl=s=>typeof s==='string'?s.replace(/\{[spmqr]\|([^{}|]*)\}/g,'$1').replace(/\*\*/g,''):'',first=pl(a.blocks[0]),others=a.blocks.slice(1).map(pl).join(' ');
  const sc=m=>2*m.keys.filter(k=>first.includes(k)).length+m.keys.filter(k=>others.includes(k)).length;
  const ranked=b.mnemonics.map((m,i)=>[m,i,sc(m)]).filter(z=>z[2]>0).sort((p,q)=>q[2]-p[2]||p[1]-q[1]).slice(0,3).map(z=>z[0].id);
  const want=mns.length>3?mns.filter(id=>ranked.includes(id)):mns;
  assert.ok(want.length<=3||mns.length<=3,'해설 화면 제자리 암기법은 셋까지(블록 넷 이상 상자): '+x.r);
  eqJ(x.fold.mnTop,want,'해설 화면 제자리 암기법 = 블록 셋까지는 모두, 넷 이상이면 대입에 부르는 낱말이 가장 많이 나오는 셋(정답 줄 2점 · 다른 줄 1점): '+x.r+' '+x.id);
  if(want.length<mns.length){assert.equal(x.fold.rest.length,1,'나머지 암기법 모음 하나: '+x.r);assert.equal(x.fold.rest[0].open,false,'모음은 닫혀 있다: '+x.r);assert.match(x.fold.rest[0].summary,/^이 파트의 (다른 )?암기법 \d+개 (더 )?보기$/,'모음 제목: '+x.r);}
  else assert.equal(x.fold.rest.length,0,'모음 없음: '+x.r);}
 // 블록 글: 풀이 줄 · 상상 장면 · '소리만 빌린 말' 주의가 그대로 보이고, 덧붙임(tip)은 안 보인다.
 const w=run(`(()=>{const d=basicsMnemonic('l22-hwanguk-winner');return d.textContent;})()`);
 assert.ok(/서남서 바람/.test(w)&&/경신환국 서인 집권 → 기사환국 남인 집권 → 갑술환국 서인 집권/.test(w)&&/상상 장면: 숙종이 풍향계/.test(w)&&/주의: 소리만 빌린 말이다/.test(w),'서남서 바람 블록 글: '+w);
 const t2=run(`basicsMnemonic('king-word-injong').textContent`);assert.ok(/인지상정/.test(t2)&&!/삼국사기/.test(t2)&&!/주의/.test(t2),'덧붙임 · 소리 아닌 주의는 안 보인다: '+t2);}
// 5-1-8) 줄 안 고리(2026-10-06, 사용자 "연결고리도 블록마다 넣자. 연결고리를 따로 블록화하지말고"): 고리는 상자 줄(\n으로 나눈 한 줄) 맨 끝
//   ' → 고리: ‘…’'(여럿이면 ', ' — 2026-10-08 가운뎃점 금지), 고리마다 공백 빼고 14자까지 · 연도 · 세 자리 숫자 없음(한 자리 숫자는 됨: 균일가 1필). 고리가 든 상자는 끝의 '암기법' 칸이 없다(블록 데이터 HISTORY_MNEMONICS는 그대로).
//   사용자가 만든 낱말은 그 사실의 고리로 나온다.
let hookBoxes=0,hookCount=0;
{const HK=/ → 고리: ((?:‘[^’‘]+’(?:, (?=‘))?)+)$/;
 for(const [r,b] of Object.entries(B.boxes)){if(!/^hist-/.test(r))continue;
  const texts=[...b.terms.map(t=>t.mean),...b.tables.flatMap(t=>t.rows.flat()),...b.rules.items.map(x=>x.text),...b.examples.map(x=>x.why)];let n=0;
  for(const t of texts)for(const line of String(t).split('\n'))if(line.includes('고리:')){const m=HK.exec(line);assert.ok(m,'고리 꼴(줄 끝): '+r+' — '+line.slice(-50));
   for(const h of m[1].split(', ‘').map((x,i)=>i?'‘'+x:x)){n++;const w=h.slice(1,-1);assert.ok(!/\d{3}/.test(w)&&w.replace(/\s/g,'').length<=14,'고리는 짧게 · 연도 · 세 자리 숫자 없음: '+r+' '+w);}}
  for(const t of [b.title,...b.terms.flatMap(t=>[t.word,t.ex])])assert.ok(!/고리:/.test(t),'고리는 뜻 · 표 칸 · 규칙 · 까닭 줄에만: '+r);
  if(n){hookBoxes++;hookCount+=n;assert.equal(b.mnemonics.length,0,'고리가 줄 안에 든 상자는 암기법 칸이 없다: '+r);}}
 assert.ok(hookBoxes>=156&&hookCount>=850,'줄 안 고리(한국사 기초 개념 상자 전부): 상자 '+hookBoxes+' · 고리 '+hookCount);
 const all=JSON.stringify(B.boxes);for(const w of ['보아와 무지','보안사령부','농촌에 삼으리랏다 32','쌈박질 치고박고','쌀을 이고 가는 모습','싹 팔아 총동원','병제병오신','뻐큐수','순순히 공노비 해방','현자의 대비','선동서','신동기서','한전은 이익 많이 나는 기업','안정된 강목','북한에서는 박제해버려','마을밭에서 일하는 용','화려한 의상','인지상정','현기증 초조함','고생','우직하다','우왕 화통이다','경종을 울려 시정','쑥이든 주전자','쑥을 해동','수양계 유정란','성사림','연무갑','중기묘','명을사','무김조','조현량','신동기서','선동서','중임 명상','월급 받는 삼수생','속옷군','몰빵했다 털리고 원위치','광 내는 기름은 약간만','서인 대반전','북벌 대장이 이완','성동구','현악','수간경','문고리사','중이 백 번 종 치고 운동한다','황도','이이는 집요하다','양지','거동','숙주나물 해동','조선건국전'])assert.ok(all.includes('‘'+w+'’'),'사용자 낱말이 고리로: '+w);
 for(const [r,b] of Object.entries(B.boxes))if(/^hist-/.test(r))assert.ok(!JSON.stringify(b).includes('↔'),'한국사 상자에 ↔ 없음(사용자가 서로 반대로 읽음): '+r);
 assert.ok(!HK.test('뜻 → 고리: 따옴표 없음')&&!HK.test('뜻 → 고리: ‘가’ 뒤에 글')&&HK.test('뜻 → 고리: ‘가’, ‘나’')&&!HK.test('뜻 → 고리: ‘가’ · ‘나’'),'고리 꼴 대조군');}

// 5-2) 파트별 상태: 논리 문제가 있는 파트마다 '기초 개념 보기'가 있고, 누르면 그 파트의 상자를 모두 펼쳐 한 화면에(대입 없이).
const P=run('PARTS');
const logicParts=P.units.flatMap(u=>u.parts).filter(p=>p.ids.some(id=>/^ko-logic\d/.test(id)));
assert.equal(logicParts.length,27,'논리 1~6장 파트 27개');
const readingParts=P.units.flatMap(u=>u.parts).filter(p=>p.ids.some(id=>/^ko-read[1-3]-/.test(id)));
assert.equal(readingParts.length,23,'독해 1~3장 파트 23개(1장 9 · 2장 3 · 3장 11)');
assert.ok(readingParts.every(p=>p.ids.every(id=>/^ko-read[1-3]-/.test(id))),'독해 파트에는 독해 문제만');
const grammarParts=P.units.flatMap(u=>u.parts).filter(p=>p.ids.some(id=>/^ko-(gram[123]|doc[123]|voc[12])-/.test(id)));
assert.equal(grammarParts.length,44,'국어 문법 1 · 2장 파트 10 + 2026-10-07 묶음 34');assert.ok(grammarParts.every(p=>p.ids.every(id=>/^ko-(gram[123]|doc[123]|voc[12])-/.test(id))),'문법 · 공문서 · 어휘 파트에는 그 단원 문제만');
logicParts.push(...readingParts,...grammarParts);
for(const p of logicParts){const want=[...new Set(p.ids.map(id=>bank[id].ruleId))];eqJ(run('partBasics(PARTS.part('+JSON.stringify(p.id)+'))'),want,'파트 상자 = 파트 문제들의 규칙 전부: '+p.id);}
run("go('parts','국어')");
const entries=nodes.get('#partsBody').all.filter(n=>cls(n).includes('part-basics'));
eqJ(entries.map(n=>n.dataset.basics).sort(),logicParts.map(p=>p.id).sort(),'기초 개념 보기 버튼 = 논리 파트 27개 + 독해 파트 23개 + 국어 문법 파트');
for(const n of entries)assert.equal(n.children[0]._text,'기초 개념 보기');
for(const p of logicParts){
 const entry=entries.find(n=>n.dataset.basics===p.id);entry.onclick();
 assert.equal(run('view'),'basics','기초 개념 화면으로: '+p.id);assert.equal(run('history.state.part'),p.id,'뒤로 가기용 기록에 파트가 남는다');
 assert.equal(nodes.get('#basicsTitle')._text,'기초 개념: '+p.title);
 const body=nodes.get('#basicsBody'),boxes=body.children.filter(n=>n.tag==='details');
 eqJ(boxes.map(d=>d.dataset.rule),[...new Set(p.ids.map(id=>bank[id].ruleId))],'파트의 상자 전부: '+p.id);
 assert.ok(boxes.every(d=>d.open),'모두 펼쳐져 있다: '+p.id);
 assert.ok(!body.all.some(n=>n.className==='b-h'&&/이 문제에 대입/.test(n._text)),'파트 화면에는 이 문제에 대입이 없다: '+p.id);
 const solve=body.children.find(n=>cls(n).includes('basics-solve'));assert.ok(solve&&solve._text==='이 파트 문제 풀기','막다른 화면이 아니다 — 문제 풀기로 이어진다: '+p.id);
 assert.ok(!/카드|문항|변형/.test(body.textContent),'파트 화면에 카드·문항·변형 없음');
 run("history.replaceState({depth:0},'');goBack()");assert.equal(run('view'),'parts','뒤로 = 파트별 상태: '+p.id);
}
// 5-2-2) 영어 파트 51개도 같다: 파트별 상태(영어)에 '기초 개념 보기', 누르면 파트 상자를 모두 펼쳐(대입 없이, 다른 공식 모음 없이 규칙 전부).
for(const p of enParts)eqJ(run('partBasics(PARTS.part('+JSON.stringify(p.id)+'))'),[...new Set(p.ids.map(id=>bank[id].ruleId))],'영어 파트 상자: '+p.id);
run("go('parts','영어')");
{const en=nodes.get('#partsBody').all.filter(n=>cls(n).includes('part-basics'));
 eqJ(en.map(n=>n.dataset.basics).sort(),enParts.map(p=>p.id).sort(),'영어 기초 개념 보기 버튼 = 영어 파트 51개');
 for(const p of enParts){en.find(n=>n.dataset.basics===p.id).onclick();assert.equal(run('view'),'basics');
  const body=nodes.get('#basicsBody'),boxes=body.children.filter(n=>n.tag==='details');
  eqJ(boxes.map(d=>d.dataset.rule),[...new Set(p.ids.map(id=>bank[id].ruleId))],'영어 파트의 상자 전부: '+p.id);assert.ok(boxes.every(d=>d.open));
  assert.ok(!body.all.some(n=>n.className==='b-more'),'파트 화면은 공식을 나누지 않는다: '+p.id);
  const shownRules=body.all.filter(n=>n.className==='b-rule').length,noted=body.all.filter(n=>n.className==='b-shared-note').length;
  const total=boxes.reduce((s,d)=>s+B.box(d.dataset.rule).rules.items.length,0);assert.ok(shownRules<=total&&(shownRules===total||noted>0),'파트 화면 규칙: 모두, 또는 앞 상자에 있다는 안내: '+p.id);
  assert.ok(!/카드|문항|변형/.test(body.textContent));
  run("history.replaceState({depth:0},'');goBack()");assert.equal(run('view'),'parts');}}
// 5-2-3) 한국사: 상자를 붙인 파트마다 '기초 개념 보기'(아직 상자가 없는 강의 파트엔 없음), 누르면 상자 하나를 모두 펼쳐(대입 · 나머지 모음 없이) → 이 파트 문제 풀기.
run("go('parts','한국사')");
{const hs=nodes.get('#partsBody').all.filter(n=>cls(n).includes('part-basics'));
 eqJ(hs.map(n=>n.dataset.basics).sort(),hDone.map(p=>p.id).sort(),'한국사 기초 개념 보기 버튼 = 상자를 붙인 파트');
 for(const p of hDone){eqJ(run('partBasics(PARTS.part('+JSON.stringify(p.id)+'))'),['hist-'+p.id],'한국사 파트 상자: '+p.id);
  hs.find(n=>n.dataset.basics===p.id).onclick();assert.equal(run('view'),'basics');
  const body=nodes.get('#basicsBody'),boxes=body.children.filter(n=>n.tag==='details');
  eqJ(boxes.map(d=>d.dataset.rule),['hist-'+p.id],'파트의 상자: '+p.id);assert.ok(boxes[0].open,'펼쳐져 있다: '+p.id);
  assert.ok(!body.all.some(n=>n.className==='b-h'&&/이 문제에 대입/.test(n._text))&&!body.all.some(n=>String(n.className).includes('b-rest')),'파트 화면은 대입 · 나머지 모음 없이 모두: '+p.id);
  const box=B.box('hist-'+p.id);assert.equal(body.all.filter(n=>n.tag==='table').length,box.tables.length,'표 전부: '+p.id);
  assert.ok(body.children.some(n=>cls(n).includes('basics-solve')),'문제 풀기로 이어진다: '+p.id);assert.ok(!/카드|문항|변형/.test(body.textContent));
  run("history.replaceState({depth:0},'');goBack()");assert.equal(run('view'),'parts');}}
// 5-2-4) 정보보호론 · 컴퓨터일반: 상자를 붙인 파트마다 '기초 개념 보기', 누르면 상자 하나를 모두 펼쳐(대입 · 나머지 모음 없이) → 이 파트 문제 풀기.
for(const s of Object.keys(IT_DONE)){const done=itDone.filter(p=>p.subject===s);if(!PS.STUDY_PARTS.units.some(u=>u.subject===s))continue;
 run("go('parts',"+JSON.stringify(s)+")");const hs=nodes.get('#partsBody').all.filter(n=>cls(n).includes('part-basics')&&!/^cq\d\d-/.test(n.dataset.basics));
 eqJ(hs.map(n=>n.dataset.basics).sort(),done.map(p=>p.id).sort(),s+' 기초 개념 보기 버튼 = 상자를 붙인 파트');
 for(const p of done){const r=IT_PREFIX[s]+'-'+p.id;eqJ(run('partBasics(PARTS.part('+JSON.stringify(p.id)+'))'),[r],s+' 파트 상자: '+p.id);
  hs.find(n=>n.dataset.basics===p.id).onclick();assert.equal(run('view'),'basics');
  const body=nodes.get('#basicsBody'),boxes=body.children.filter(n=>n.tag==='details');
  eqJ(boxes.map(d=>d.dataset.rule),[r],'파트의 상자: '+p.id);assert.ok(boxes[0].open,'펼쳐져 있다: '+p.id);
  assert.ok(!body.all.some(n=>n.className==='b-h'&&/이 문제에 대입/.test(n._text))&&!body.all.some(n=>String(n.className).includes('b-rest')),'파트 화면은 대입 · 나머지 모음 없이 모두: '+p.id);
  assert.equal(body.all.filter(n=>n.tag==='table').length,B.box(r).tables.length,'표 전부: '+p.id);
  assert.ok(body.children.some(n=>cls(n).includes('basics-solve')),'문제 풀기로 이어진다: '+p.id);assert.ok(!/카드|문항|변형/.test(noTech(body.textContent)));
  run("history.replaceState({depth:0},'');goBack()");assert.equal(run('view'),'parts');}}
run("go('parts','국어')");
// 5-3) 없는 파트로 들어와도 안내 문장을 보인다(빈 화면 아님).
run("openBasics('no-such-part')");assert.equal(run('view'),'basics');assert.ok(/파트를 찾지 못했어요/.test(nodes.get('#basicsBody').textContent));
run("history.replaceState({depth:0},'');goBack()");assert.equal(run('view'),'parts');
// 5-4) 한 파트 문제 풀기로 이어지는지(버튼 동작).
{const p=logicParts[0];run('openBasics('+JSON.stringify(p.id)+')');nodes.get('#basicsBody').children.find(n=>cls(n).includes('basics-solve')).onclick();
 assert.equal(run('view'),'quiz','이 파트 문제 풀기 → 문제 화면');assert.equal(run('scopeOf().round'),'part-'+p.id);}

// ── 6) 배포: 화면이 basics.js를 app.js보다 먼저 읽고, 서비스 워커가 같은 판을 담고, 배포가 파일을 올리고 이 검사를 돌린다.
{const html=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8'),yml=fs.readFileSync(__dirname+'/.github/workflows/pages.yml','utf8');
 // v247: basics.js는 저작 원본이고 브라우저는 상자를 조각(chunks/*.json — build-chunks.cjs가 basics.js에서 만든다)으로 받는다. 색인 · 내용 창고를 app.js 앞에서 읽는다(조각이 원본과 같은지는 lazy.test.cjs).
 const v=/app\.js\?v=(\d+)/.exec(html)[1],bi=html.indexOf('content-store.js?v='+v),ai=html.indexOf('app.js?v='+v);
 assert.ok(bi>0&&bi<ai&&html.indexOf('content-index.js?v='+v)>0,'index.html: 색인 · 내용 창고(같은 판)를 app.js 앞에서 읽는다');
 assert.ok(sw.includes("'./content-index.js?v="+v+"'")&&sw.includes("'./content-store.js?v="+v+"'")&&sw.includes('chunk-manifest.json'),'sw.js가 색인 · 내용 창고를 담고 조각 목록을 받는다');
 assert.ok(yml.includes('cp -r chunks _site/')&&/node basics\.test\.cjs/.test(yml)&&/node lazy\.test\.cjs/.test(yml),'pages.yml이 조각을 올리고 basics.test.cjs · lazy.test.cjs를 돌린다');
 assert.ok(/id="basicsView"/.test(html)&&/id="basicsBody"/.test(html),'index.html에 기초 개념 화면');}
console.log('PASS basics(영어): Day 1~15 · 문법 공식 훈련 2163문제(규칙 115 · 파트 93) 모두 상자 + 대입(쓴 줄 '+enUse+'개가 모두 파트 안 상자의 줄), 절 순서 · 번호, 해설 짜임, 해설 화면의 공식 나누기 '+splitBoxes+'문제 · 용어 나누기 '+termSplit+'문제(규칙 · 예문 · 용어 빠짐 · 겹침 0), 공통 정리는 같은 파트 안에서만, 교재 '+englishOverlap+', 파트별 상태 영어 51파트');
console.log('PASS basics:논리 1~6장 995문제(규칙 33) + 독해 1~3장 920문제(규칙 29 — 1장 15 · 2장 3 · 3장 11) 모두 규칙 상자(표 있는 상자 '+withTable+'개 — 표는 선택, 번호는 이어 매김) + 문제별 대입, 1915문제 절 순서(먼저 알아 둘 말 → 표 → 규칙 → 비교 예문 → 이 문제에 대입), 용어 뜻·예)·한자 원뜻, ✓/✗ 비교 예문, 해설 세 문단, 카드·문항·변형 0, 한자는 한글 뒤 괄호 안에만, 논리 '+overlapChecked+' · 독해 '+readingOverlap+'; 파트별 상태 50파트(논리 27 · 독해 23) 모두 기초 개념 보기 → 상자 전부 펼침(대입 없음) → 이 파트 문제 풀기, 뒤로 = 파트별 상태');
console.log('PASS basics(컴퓨터일반 자체 제작): '+COMQ.length+'단원 '+comq.length+'문제 — 파트 상자 그대로(ruleId = com-<파트>) + 문제마다 대입(쓴 줄 '+comqUse+'개 모두 그 상자의 줄, 덧붙인 줄 '+COMQ.reduce((n,s)=>n+s.lines.length,0)+'개), 줄 id 노출 · 두문자 0, 해설 화면은 쓰는 줄만 제자리');
console.log('PASS basics(정보보호론 · 컴퓨터일반): '+Object.entries(IT_DONE).map(([s,l])=>s+' '+l.length+'파트').join(' · ')+' '+itQuestions.length+'문제(9급 기출) — 파트마다 상자 하나 + 기출마다 대입(쓴 줄 '+itUse+'개 모두 그 파트 상자의 줄), 줄 id 노출 · 두문자 0, 해설 화면은 쓰는 줄만 제자리, 파트별 상태 기초 개념 보기');
console.log('PASS basics(한국사): '+HIST_UNITS.join(' · ')+' '+hDone.length+'파트 '+history.length+'문제 — 파트마다 상자 하나 + 문제마다 대입(쓴 줄 '+hUse+'개 모두 그 파트 상자의 줄), 표 칸 셋까지, 두문자 · 비결 · 줄 id 노출 0, 연도는 y 줄 '+hYearLines+'개에만, 해설 화면은 쓰는 줄만 제자리('+hTopLines+'/'+hAllLines+'줄) + 나머지 모음 '+hSplit+'문제(빠짐 · 겹침 0), 파트별 상태 한국사 '+hDone.length+'파트 기초 개념 보기, 상자 끝 외울 것 '+memoBoxes+'상자 '+memoLines+'줄 · 암기법 '+mnBoxes+'상자(블록 '+mnUsed.size+'개) · 줄 안 고리 '+hookBoxes+'상자 '+hookCount+'개');
console.log('PASS basics(국어 · 영어 · 한국사 기출): 기출 대응 원고가 짝지은 '+gichulBasics.length+'문제(국어 '+GICHUL_BASICS['국어']+' · 영어 '+GICHUL_BASICS['영어']+' · 9급 한국사 '+GICHUL_BASICS['한국사']+' · 한능검 '+GICHUL_BASICS['한능검']+')마다 대입 — 상자 줄 '+gUse+'개 모두 그 상자의 줄, 공식 정답 번호 · 줄 id 노출 0 · 한국사 연도는 문제에 나온 것만');
