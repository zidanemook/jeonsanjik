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
assert.deepEqual(Object.keys(B.boxes).sort(),[...rules,...rrules].sort(),'상자는 논리 · 독해 규칙마다 하나(남는 상자 없음)');
const covered=new Set([...logic,...reading]);
for(const id of Object.keys(B.apply))assert.ok(covered.has(id),'대입이 있는데 논리 · 독해 문제가 아니다: '+id);

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
console.log('PASS basics:논리 1~6장 995문제(규칙 33) + 독해 1~3장 920문제(규칙 29 — 1장 15 · 2장 3 · 3장 11) 모두 규칙 상자(표 있는 상자 '+withTable+'개 — 표는 선택, 번호는 이어 매김) + 문제별 대입, 1915문제 절 순서(먼저 알아 둘 말 → 표 → 규칙 → 비교 예문 → 이 문제에 대입), 용어 뜻·예)·한자 원뜻, ✓/✗ 비교 예문, 해설 세 문단, 카드·문항·변형 0, 한자는 한글 뒤 괄호 안에만, 논리 '+overlapChecked+' · 독해 '+readingOverlap+'; 파트별 상태 50파트(논리 27 · 독해 23) 모두 기초 개념 보기 → 상자 전부 펼침(대입 없음) → 이 파트 문제 풀기, 뒤로 = 파트별 상태');
