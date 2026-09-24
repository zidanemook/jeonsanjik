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
// 영어(v159): parts.js의 영어 단원(Day 1~7 · 문법 공식 훈련) 1470문제, 규칙 73개. 대입이 쓰는 줄은 그 문제 파트 안 상자의 줄이어야 한다.
const PS={};new Function('globalThis','module',fs.readFileSync(__dirname+'/parts.js','utf8'))(PS,{});
const enParts=PS.STUDY_PARTS.units.filter(u=>/^en-/.test(u.id)).flatMap(u=>u.parts),english=[...new Set(enParts.flatMap(p=>p.ids))];
assert.equal(enParts.length,51,'영어 파트 51개(Day 1~7 40 · 공식 훈련 11)');assert.equal(english.length,1470,'영어 파트 문제 1470');
const lineIdsOf=b=>new Set([...b.terms.map(t=>t.id),...(b.table?[b.table.id,b.table.key?.id]:[]),...b.rules.items.map(r=>r.id),b.rules.key?.id,...b.examples.map(x=>x.id)].filter(Boolean));
const erules=new Set();let enUse=0;
for(const p of enParts){const inPart=new Set(p.ids.map(id=>bank[id].ruleId));
 for(const id of p.ids){const q=bank[id];assert.ok(/^grammar-/.test(q.ruleId||''),'영어 규칙 id: '+id);assert.equal(q.variants.length,1,'문제 하나: '+id);erules.add(q.ruleId);
  assert.ok(B.box(q.ruleId),'규칙 상자가 없다: '+q.ruleId+' ('+id+')');
  const a=B.forQuestion(id);assert.ok(a&&Array.isArray(a.blocks)&&a.blocks.length&&a.use.length,'이 문제에 대입이 없다: '+id);
  for(const u of a.use){const [r,l]=u.includes(':')?u.split(':'):[q.ruleId,u];assert.ok(inPart.has(r),'대입 줄이 파트 밖 상자: '+id+' '+u);assert.ok(lineIdsOf(B.box(r)).has(l),'대입 줄이 상자에 없다: '+id+' '+u);enUse++;}}}
assert.equal(erules.size,73,'영어 규칙 73개');
// 한국사(v161~, 강별로 늘어난다): parts.js의 한국사 파트마다 상자 하나(id 'hist-<파트>', split 'lines', 표는 tables 여럿 · 줄마다 rowIds).
//   HIST_UNITS에 든 단원의 파트는 모두 상자가 있고, 그 파트 문제마다 대입(box = 그 파트 상자 · use = 그 상자의 줄 · blocks)이 있다.
const HIST_UNITS=['hist-02-05','hist-06','hist-07','hist-08','hist-09','hist-10','hist-11','hist-12','hist-13','hist-14','hist-15','hist-16','hist-17','hist-18','hist-19','hist-20','hist-21','hist-250-256'];
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
assert.equal(history.length,2175,'02~21강 + 특강 2175문제');assert.equal(hrules.size,115,'02~21강 + 특강 115파트 = 115상자');
// 정보보호론 · 컴퓨터일반(v165~, 배치로 늘어난다): 자체 제작 문제가 없어 9급 기출을 주제로 나눈 parts.js 파트마다 상자 하나
//   (id 'sec-<파트>' · 'com-<파트>', split 'lines', tables 여럿). IT_DONE의 파트는 상자가 있고, 그 파트 기출(gichul-<회차>-NN)마다 대입이 있다.
const IT_DONE={'정보보호론':['is01','is02','is03','is04','is05','is06','is07','is08','is09','is10','is11','is12'],'컴퓨터일반':[]},IT_PREFIX={'정보보호론':'sec','컴퓨터일반':'com'};
const itDone=[],itQuestions=[],itRules=new Set();let itUse=0;
for(const [s,list] of Object.entries(IT_DONE)){const all=PS.STUDY_PARTS.units.filter(u=>u.subject===s).flatMap(u=>u.parts);
 for(const pid of list){const p=all.find(x=>x.id===pid);assert.ok(p,s+' 파트: '+pid);itDone.push({...p,subject:s});const r=IT_PREFIX[s]+'-'+pid,box=B.box(r);assert.ok(box,s+' 파트 상자: '+r);itRules.add(r);
  assert.equal(box.split,'lines','전공 과목 상자는 줄 단위로 접는다: '+r);assert.ok(!box.table&&box.tables.length,'전공 과목 상자는 tables: '+r);
  for(const t of box.tables)assert.equal(t.rowIds.length,t.rows.length,'표 줄마다 id: '+r+' '+t.id);
  const lines=hLines(box);
  for(const id of p.ids){itQuestions.push(id);assert.match(id,/^gichul-/,'전공 과목 파트는 기출만: '+id);
   const a=B.forQuestion(id);assert.ok(a&&a.box===r&&a.use.length&&a.blocks.length,s+' 대입: '+id);
   for(const u of a.use){assert.ok(lines.has(u),'대입 줄이 그 파트 상자에 없다: '+id+' '+u);itUse++;}}}}
assert.deepEqual(Object.keys(B.boxes).sort(),[...rules,...rrules,...erules,...hrules,...itRules].sort(),'상자는 논리 · 독해 · 영어 규칙마다, 한국사 · 정보보호론 · 컴퓨터일반 파트마다 하나(남는 상자 없음)');
const covered=new Set([...logic,...reading,...english,...history,...itQuestions]);
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
for(const id of [...logic,...reading]){const e=bank[id].variants[0].explanation;push(id+' 해설',e);
 const ps=e.split('\n\n');assert.equal(ps.length,3,'해설은 세 문단: '+id);
 assert.ok(ps[0].startsWith('정답 근거: ')&&ps[1].startsWith('보기 비교: ')&&ps[2].startsWith('기억 연결: '),'해설 짜임(정답 근거 · 보기 비교 · 기억 연결): '+id);
 assert.ok(!/\*\*|\{[spmqr]\|/.test(e),'해설은 앱에서 글자 그대로 보이니 **·{x| 표시 금지: '+id);}
// 영어 해설: 정답 근거 · 보기 비교 · (외우는 공식 | 기억 연결). 셋째 문단(외우는 공식)은 앱이 굵게 그리므로 ** 허용, 앞 두 문단은 글자 그대로.
for(const id of english){const e=bank[id].variants[0].explanation,ps=e.split('\n\n');
 assert.ok(ps.length>=3&&ps[0].startsWith('정답 근거: ')&&ps[1].startsWith('보기 비교: ')&&(ps[2].startsWith('외우는 공식\n')||ps[2].startsWith('기억 연결: ')),'영어 해설 짜임: '+id);
 assert.ok(!/\*\*|\{[spmqr]\|/.test(ps.slice(0,2).join(' ')),'영어 해설 앞 두 문단에 **·{x| 금지: '+id);push(id+' 해설',ps.slice(0,2).join('\n\n'));}

// 카드 · 문항 · 변형은 앱 내부 용어라 금지 — 단 스마트카드 · 신용카드 · IC카드 · 카드 결제처럼 기술 · 일상 용어의 '카드'는 허용(정보보호론 v165~).
const TECH_CARD=/스마트 ?카드|신용 ?카드|IC ?카드|카드 ?결제|카드 ?번호|카드사/g,noTech=t=>String(t).replace(TECH_CARD,'');
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
const FILES=['scheduler.js','learning.js','core-review-pack.js','quiz-options.js','hanneung-data.js','hanneung-explanations.js','hanneung.js','gichul-index.js','gichul.js','practice-bank.js','practice.js','content-corrections.js','review-record.js','review-policy.js','sync-core.js','study-credit.js','xp.js','score.js','study-review-catalog.js','hanneung-topics.js','topics.js','parts.js','part-check.js','memorize.js','basics.js','app.js'];
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
for(const id of [...logic,...reading]){
 const heads=run(`(()=>{const q=PRACTICE_BANK[${JSON.stringify(id)}];const d=basicsDetails('기초 개념',BASICS.box(q.ruleId),BASICS.forQuestion(${JSON.stringify(id)}));const out=[];(function w(n){for(const c of n.children){if(c.className==='b-h')out.push(c._text);w(c);}})(d);return out;})()`);
 const box=B.box(bank[id].ruleId),want=['먼저 알아 둘 말',...(box.table?[box.table.title]:[]),'규칙 — '+box.rules.title,'비교 예문','이 문제에 대입'];
 if(box.table)tableSections++;
 eqJ(heads,want.map((t,i)=>(i+1)+'. '+t),'절 순서: '+id);
}
// 5-1-2) 영어 1470문제. (가) 모두 보기에서 절 순서. (나) 해설 화면(fold, 그 문제의 파트)에서 번호가 이어지고, 규칙 · 비교 예문이
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
  const more=fold.children.filter(c=>c.className==='b-more'),mt=fold.children.filter(c=>c.className==='b-more-terms');
  const chips=(d,top)=>{const r=[];(top?d.children:(()=>{const x=[];walk(d,c=>x.push(c));return x;})()).forEach(c=>{if(c.className==='b-term')r.push(c.children[0]._text);});return r;};
  const ownT=box.terms.filter(t=>!basicsShared(t,rule,part)),tid=new Set(a.use.map(u=>{const [x,y]=u.split(':');return y===undefined?x:x===rule?y:null;}).filter(Boolean));
  let keepT=ownT.filter(t=>tid.has(t.id));if(split&&!keepT.length){const txt=own.filter(r=>kept.includes(grp(r.id))).map(r=>r.name+' '+r.text).join(' ');keepT=ownT.filter(t=>txt.includes(t.word.replace(/ *[(][^)]*[)]$/,'')));}
  const label=t=>t.word+(t.hanja?'('+t.hanja+')':'');
  out.push({id,rule,heads:heads(all),fheads:heads(fold),allRules:names(all).length,foldRules:names(fold).length,allEx:exs(all),foldEx:exs(fold),
   more:more.length,moreOpen:more[0]?more[0].open:false,moreSummary:more[0]?.children[0]._text||'',
   wantMore:split?groups.length-kept.length:0,topRules:names(fold,true),wantTop:split?own.filter(r=>kept.includes(grp(r.id))).map(r=>r.name):own.map(r=>r.name),
   inMore:more[0]?names(more[0]).length:0,wantInMore:split?own.filter(r=>!kept.includes(grp(r.id))).length:0,
   allTerms:chips(all).length,foldTerms:chips(fold).length,topTerms:chips(fold,true),wantTopTerms:(split?keepT:ownT).map(label),
   mt:mt.length,mtOpen:mt[0]?mt[0].open:false,mtSummary:mt[0]?.children[0]._text||'',wantMt:split?ownT.length-keepT.length:0});}
 return out;})()`);
let splitBoxes=0,termSplit=0;const splitSeen=new Set();
for(const r of enRes){const box=B.box(r.rule),want=['먼저 알아 둘 말',...(box.table?[box.table.title]:[]),'규칙'+(box.rules.title?' — '+box.rules.title:''),'비교 예문','이 문제에 대입'].map((t,i)=>(i+1)+'. '+t);
 eqJ(r.heads,want,'영어 절 순서: '+r.id);eqJ(r.fheads,want,'해설 화면에서도 번호가 이어진다: '+r.id);
 assert.equal(r.foldRules,r.allRules,'규칙이 빠지거나 겹치지 않는다: '+r.id);assert.equal(r.foldEx,r.allEx,'비교 예문이 빠지거나 겹치지 않는다: '+r.id);
 eqJ(r.topRules,r.wantTop,'제자리에 두는 규칙 = 대입이 쓰는 공식의 규칙: '+r.id);
 assert.equal(r.foldTerms,r.allTerms,'용어가 빠지거나 겹치지 않는다: '+r.id);eqJ(r.topTerms,r.wantTopTerms,'제자리에 두는 용어: '+r.id);
 if(r.wantMt){termSplit++;assert.equal(r.mt,1,'다른 용어 모음 하나: '+r.id);assert.equal(r.mtOpen,false);assert.equal(r.mtSummary,'이 정리의 다른 용어 '+r.wantMt+'개 더 보기');}else assert.equal(r.mt,0,'용어 모음 없음: '+r.id);
 if(!r.wantMore)assert.equal(r.wantMt,0,'공식을 안 나눈 상자는 용어도 그대로: '+r.id);
 if(r.wantMore){splitBoxes++;splitSeen.add(r.rule);assert.equal(r.more,1,'다른 공식 모음 하나: '+r.id);assert.equal(r.moreOpen,false,'닫혀 있다: '+r.id);
  assert.equal(r.moreSummary,'이 정리의 다른 공식 '+r.wantMore+'개 더 보기');assert.equal(r.inMore,r.wantInMore,'나머지 공식의 규칙은 모두 모음 안에: '+r.id);}
 else assert.equal(r.more,0,'공식이 적은 상자는 그대로: '+r.id);}
assert.ok(splitBoxes>500&&splitSeen.has('grammar-formula-structure')&&splitSeen.has('grammar-formula-verbal'),'공식 훈련 큰 상자는 나뉜다: '+splitBoxes);
assert.ok(termSplit>500,'나눈 상자의 용어도 나뉜다: '+termSplit);
// 5-1-3) 국어 상자(규칙 id에 '-' 없음)는 공식 나누기를 하지 않는다.
assert.equal(run(`${JSON.stringify([...logic,...reading])}.filter(id=>{const q=PRACTICE_BANK[id];return basicsDetails('기초 개념',BASICS.box(q.ruleId),BASICS.forQuestion(id),'fold',null,PARTS.partOf(id)).children.some(c=>c.className==='b-more');}).length`),0,'국어 상자에는 다른 공식 모음이 없다');
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
{const res=run(`(()=>{const out=[],walk=(n,f)=>{for(const c of n.children){f(c);walk(c,f);}};
 const count=(d,top)=>{const xs=[];if(top)xs.push(...d.children);else walk(d,c=>xs.push(c));
  return {terms:xs.filter(c=>c.className==='b-term').length,rules:xs.filter(c=>c.className==='b-rule').length,ex:xs.filter(c=>c.tag==='p'&&String(c.className).startsWith('b-ex')&&c.children[0]?.tag==='span').length,rows:xs.filter(c=>c.tag==='table').reduce((s,t)=>s+t.children.length-1,0)};};
 const heads=d=>{const h=[];walk(d,c=>{if(c.className==='b-h')h.push(c._text);});return h;};
 for(const id of ${JSON.stringify([...history,...itQuestions])}){const a=BASICS.forQuestion(id),box=BASICS.box(a.box),all=basicsDetails('기초 개념',box,a),fold=basicsDetails('기초 개념',box,a,'fold',null,PARTS.partOf(id));
  const more=fold.children.filter(c=>String(c.className).split(' ').includes('b-rest'));
  out.push({id,heads:heads(all),fheads:heads(fold),all:count(all),top:count(fold,true),inMore:more[0]?count(more[0]):{terms:0,rules:0,ex:0,rows:0},more:more.length,moreOpen:more[0]?more[0].open:false,moreSummary:more[0]?.children[0]._text||''});}
 return out;})()`);
 for(const r of res){const a=B.forQuestion(r.id),box=B.box(a.box),use=new Set(a.use),num=xs=>xs.map((t,i)=>(i+1)+'. '+t);
  const rowsOf=t=>use.has(t.id)?t.rows.length:t.rowIds.filter(x=>use.has(x)).length;
  const want={terms:box.terms.filter(t=>use.has(t.id)).length,rules:box.rules.items.filter(x=>use.has(x.id)).length,ex:box.examples.filter(x=>use.has(x.id)).length,rows:box.tables.reduce((s,t)=>s+rowsOf(t),0)};
  const total={terms:box.terms.length,rules:box.rules.items.length,ex:box.examples.length,rows:box.tables.reduce((s,t)=>s+t.rows.length,0)};
  eqJ(r.heads,num(['먼저 알아 둘 말',...box.tables.map(t=>t.title),'규칙'+(box.rules.title?' — '+box.rules.title:''),'비교 예문','이 문제에 대입']),'한국사 모두 보기 절 순서: '+r.id);
  eqJ(r.all,total,'모두 보기는 줄 전부: '+r.id);
  eqJ(r.fheads,num([...(want.terms?['먼저 알아 둘 말']:[]),...box.tables.filter(t=>rowsOf(t)).map(t=>t.title),...(want.rules?['규칙'+(box.rules.title?' — '+box.rules.title:'')]:[]),...(want.ex?['비교 예문']:[]),'이 문제에 대입']),'해설 화면 절 = 제자리에 둔 줄이 있는 절만, 번호 이어 매김: '+r.id);
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

// 5-2) 파트별 상태: 논리 문제가 있는 파트마다 '기초 개념 보기'가 있고, 누르면 그 파트의 상자를 모두 펼쳐 한 화면에(대입 없이).
const P=run('PARTS');
const logicParts=P.units.flatMap(u=>u.parts).filter(p=>p.ids.some(id=>/^ko-logic\d/.test(id)));
assert.equal(logicParts.length,27,'논리 1~6장 파트 27개');
const readingParts=P.units.flatMap(u=>u.parts).filter(p=>p.ids.some(id=>/^ko-read[1-3]-/.test(id)));
assert.equal(readingParts.length,23,'독해 1~3장 파트 23개(1장 9 · 2장 3 · 3장 11)');
assert.ok(readingParts.every(p=>p.ids.every(id=>/^ko-read[1-3]-/.test(id))),'독해 파트에는 독해 문제만');
logicParts.push(...readingParts);
for(const p of logicParts){const want=[...new Set(p.ids.map(id=>bank[id].ruleId))];eqJ(run('partBasics(PARTS.part('+JSON.stringify(p.id)+'))'),want,'파트 상자 = 파트 문제들의 규칙 전부: '+p.id);}
run("go('parts','국어')");
const entries=nodes.get('#partsBody').all.filter(n=>cls(n).includes('part-basics'));
eqJ(entries.map(n=>n.dataset.basics).sort(),logicParts.map(p=>p.id).sort(),'기초 개념 보기 버튼 = 논리 파트 27개 + 독해 파트 23개');
for(const n of entries)assert.equal(n.children[0]._text,'기초 개념 보기');
for(const p of logicParts){
 const entry=entries.find(n=>n.dataset.basics===p.id);entry.onclick();
 assert.equal(run('view'),'basics','기초 개념 화면으로: '+p.id);assert.equal(run('history.state.part'),p.id,'뒤로 가기용 기록에 파트가 남는다');
 assert.equal(nodes.get('#basicsTitle')._text,'기초 개념 · '+p.title);
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
 run("go('parts',"+JSON.stringify(s)+")");const hs=nodes.get('#partsBody').all.filter(n=>cls(n).includes('part-basics'));
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
 const v=/app\.js\?v=(\d+)/.exec(html)[1],bi=html.indexOf('basics.js?v='+v),ai=html.indexOf('app.js?v='+v);
 assert.ok(bi>0&&bi<ai,'index.html: basics.js(같은 판)를 app.js 앞에서 읽는다');
 assert.ok(sw.includes("'./basics.js?v="+v+"'"),'sw.js가 basics.js를 담는다');
 assert.ok(/cp [^\n]*\bbasics\.js\b/.test(yml)&&/node basics\.test\.cjs/.test(yml),'pages.yml이 basics.js를 올리고 basics.test.cjs를 돌린다');
 assert.ok(/id="basicsView"/.test(html)&&/id="basicsBody"/.test(html),'index.html에 기초 개념 화면');}
console.log('PASS basics(영어): Day 1~7 · 문법 공식 훈련 1470문제(규칙 73 · 파트 51) 모두 상자 + 대입(쓴 줄 '+enUse+'개가 모두 파트 안 상자의 줄), 절 순서 · 번호, 해설 짜임, 해설 화면의 공식 나누기 '+splitBoxes+'문제 · 용어 나누기 '+termSplit+'문제(규칙 · 예문 · 용어 빠짐 · 겹침 0), 공통 정리는 같은 파트 안에서만, 교재 '+englishOverlap+', 파트별 상태 영어 51파트');
console.log('PASS basics:논리 1~6장 995문제(규칙 33) + 독해 1~3장 920문제(규칙 29 — 1장 15 · 2장 3 · 3장 11) 모두 규칙 상자(표 있는 상자 '+withTable+'개 — 표는 선택, 번호는 이어 매김) + 문제별 대입, 1915문제 절 순서(먼저 알아 둘 말 → 표 → 규칙 → 비교 예문 → 이 문제에 대입), 용어 뜻·예)·한자 원뜻, ✓/✗ 비교 예문, 해설 세 문단, 카드·문항·변형 0, 한자는 한글 뒤 괄호 안에만, 논리 '+overlapChecked+' · 독해 '+readingOverlap+'; 파트별 상태 50파트(논리 27 · 독해 23) 모두 기초 개념 보기 → 상자 전부 펼침(대입 없음) → 이 파트 문제 풀기, 뒤로 = 파트별 상태');
console.log('PASS basics(정보보호론 · 컴퓨터일반): '+Object.entries(IT_DONE).map(([s,l])=>s+' '+l.length+'파트').join(' · ')+' '+itQuestions.length+'문제(9급 기출) — 파트마다 상자 하나 + 기출마다 대입(쓴 줄 '+itUse+'개 모두 그 파트 상자의 줄), 줄 id 노출 · 두문자 0, 해설 화면은 쓰는 줄만 제자리, 파트별 상태 기초 개념 보기');
console.log('PASS basics(한국사): '+HIST_UNITS.join(' · ')+' '+hDone.length+'파트 '+history.length+'문제 — 파트마다 상자 하나 + 문제마다 대입(쓴 줄 '+hUse+'개 모두 그 파트 상자의 줄), 표 칸 셋까지, 두문자 · 비결 · 줄 id 노출 0, 연도는 y 줄 '+hYearLines+'개에만, 해설 화면은 쓰는 줄만 제자리('+hTopLines+'/'+hAllLines+'줄) + 나머지 모음 '+hSplit+'문제(빠짐 · 겹침 0), 파트별 상태 한국사 '+hDone.length+'파트 기초 개념 보기');
