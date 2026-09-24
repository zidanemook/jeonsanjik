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
assert.deepEqual(Object.keys(B.boxes).sort(),[...rules,...rrules,...erules].sort(),'상자는 논리 · 독해 · 영어 규칙마다 하나(남는 상자 없음)');
const covered=new Set([...logic,...reading,...english]);
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

// ── 3) 표기: 카드·문항·변형 금지, 한자는 한글 뒤 괄호 안에만, 날 HTML 없음
for(const [where,t] of texts){
 assert.ok(!/카드|문항|변형/.test(t),'카드·문항·변형이라는 말: '+where+' — '+t.slice(0,60));
 assert.ok(!/<\/?[a-z][^>]*>/i.test(t),'날 HTML: '+where);
 for(const m of t.matchAll(/[㐀-鿿]+/g)){const open=t.lastIndexOf('(',m.index),close=t.indexOf(')',m.index);
  assert.ok(open>=0&&close>m.index&&t.lastIndexOf(')',m.index)<open,'한자는 괄호 안에만: '+where+' — '+m[0]);
  assert.ok(/[가-힣]/.test(t[open-1]||''),'한자 괄호 앞에는 한글: '+where+' — '+t.slice(Math.max(0,open-6),close+1));}
}

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
//   나머지 공식은 닫힌 '이 정리의 다른 공식 N개 더 보기' 하나에. 기대값은 여기서 따로 계산한다.
const enRes=run(`(()=>{const out=[],walk=(n,f)=>{for(const c of n.children){f(c);walk(c,f);}},grp=id=>id.startsWith('m-')||!id.includes('-')?id:id.slice(0,id.lastIndexOf('-'));
 const names=(d,top)=>{const r=[];(top?d.children:(()=>{const a=[];walk(d,c=>a.push(c));return a;})()).forEach(c=>{if(c.className==='b-rule')r.push(c.children[0]._text);});return r;};
 const exs=(d,top)=>{let k=0;(top?d.children:(()=>{const a=[];walk(d,c=>a.push(c));return a;})()).forEach(c=>{if(c.tag==='p'&&String(c.className).startsWith('b-ex')&&c.children[0]?.tag==='span'&&/^[✓✗]$/.test(c.children[0]._text))k++;});return k;};
 for(const id of ${JSON.stringify(english)}){const q=PRACTICE_BANK[id],rule=q.ruleId,box=BASICS.box(rule),a=BASICS.forQuestion(id),part=PARTS.partOf(id);
  const all=basicsDetails('기초 개념',box,a),fold=basicsDetails('기초 개념',box,a,'fold',null,part),heads=d=>{const h=[];walk(d,c=>{if(c.className==='b-h')h.push(c._text);});return h;};
  const own=box.rules.items.filter(r=>!basicsShared(r,rule,part)),groups=[...new Set(own.map(r=>grp(r.id)))];
  const used=new Set(a.use.map(u=>{const [x,y]=u.split(':');return y===undefined?x:x===rule?y:null;}).filter(Boolean).map(grp)),kept=groups.filter(g=>used.has(g));
  const split=own.every(r=>r.id.includes('-'))&&groups.length>=4&&kept.length>0&&kept.length<groups.length;
  const more=fold.children.filter(c=>c.className==='b-more');
  out.push({id,rule,heads:heads(all),fheads:heads(fold),allRules:names(all).length,foldRules:names(fold).length,allEx:exs(all),foldEx:exs(fold),
   more:more.length,moreOpen:more[0]?more[0].open:false,moreSummary:more[0]?.children[0]._text||'',
   wantMore:split?groups.length-kept.length:0,topRules:names(fold,true),wantTop:split?own.filter(r=>kept.includes(grp(r.id))).map(r=>r.name):own.map(r=>r.name),
   inMore:more[0]?names(more[0]).length:0,wantInMore:split?own.filter(r=>!kept.includes(grp(r.id))).length:0});}
 return out;})()`);
let splitBoxes=0;const splitSeen=new Set();
for(const r of enRes){const box=B.box(r.rule),want=['먼저 알아 둘 말',...(box.table?[box.table.title]:[]),'규칙'+(box.rules.title?' — '+box.rules.title:''),'비교 예문','이 문제에 대입'].map((t,i)=>(i+1)+'. '+t);
 eqJ(r.heads,want,'영어 절 순서: '+r.id);eqJ(r.fheads,want,'해설 화면에서도 번호가 이어진다: '+r.id);
 assert.equal(r.foldRules,r.allRules,'규칙이 빠지거나 겹치지 않는다: '+r.id);assert.equal(r.foldEx,r.allEx,'비교 예문이 빠지거나 겹치지 않는다: '+r.id);
 eqJ(r.topRules,r.wantTop,'제자리에 두는 규칙 = 대입이 쓰는 공식의 규칙: '+r.id);
 if(r.wantMore){splitBoxes++;splitSeen.add(r.rule);assert.equal(r.more,1,'다른 공식 모음 하나: '+r.id);assert.equal(r.moreOpen,false,'닫혀 있다: '+r.id);
  assert.equal(r.moreSummary,'이 정리의 다른 공식 '+r.wantMore+'개 더 보기');assert.equal(r.inMore,r.wantInMore,'나머지 공식의 규칙은 모두 모음 안에: '+r.id);}
 else assert.equal(r.more,0,'공식이 적은 상자는 그대로: '+r.id);}
assert.ok(splitBoxes>500&&splitSeen.has('grammar-formula-structure')&&splitSeen.has('grammar-formula-verbal'),'공식 훈련 큰 상자는 나뉜다: '+splitBoxes);
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
console.log('PASS basics(영어): Day 1~7 · 문법 공식 훈련 1470문제(규칙 73 · 파트 51) 모두 상자 + 대입(쓴 줄 '+enUse+'개가 모두 파트 안 상자의 줄), 절 순서 · 번호, 해설 짜임, 해설 화면의 공식 나누기 '+splitBoxes+'문제(규칙 · 예문 빠짐 · 겹침 0), 공통 정리는 같은 파트 안에서만, 교재 '+englishOverlap+', 파트별 상태 영어 51파트');
console.log('PASS basics:논리 1~6장 995문제(규칙 33) + 독해 1~3장 920문제(규칙 29 — 1장 15 · 2장 3 · 3장 11) 모두 규칙 상자(표 있는 상자 '+withTable+'개 — 표는 선택, 번호는 이어 매김) + 문제별 대입, 1915문제 절 순서(먼저 알아 둘 말 → 표 → 규칙 → 비교 예문 → 이 문제에 대입), 용어 뜻·예)·한자 원뜻, ✓/✗ 비교 예문, 해설 세 문단, 카드·문항·변형 0, 한자는 한글 뒤 괄호 안에만, 논리 '+overlapChecked+' · 독해 '+readingOverlap+'; 파트별 상태 50파트(논리 27 · 독해 23) 모두 기초 개념 보기 → 상자 전부 펼침(대입 없음) → 이 파트 문제 풀기, 뒤로 = 파트별 상태');
