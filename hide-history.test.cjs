// app.js를 가짜 DOM 위에서 실제로 돌려, 화면, 기록, 복습 일정이 어떻게 맞물리는지 확인한다.
// 문제 하나가 카드 하나다. v386부터 모든 범위를 번호 순서로 낸다(앱이 차례를 고르지 않는다): 회차가 아니면 안 푼 첫 문제부터, 기출 회차는 원문 순서로 풀던 곳부터.
// 건너뛰기, 이전, 번호 고르기로 자리만 옮긴다. 화면의 모든 수는 "문제" 한 단위다.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function el(tag='div'){
 const node={tag,children:[],attrs:{},dataset:{},classes:new Set(),_text:'',hidden:false,disabled:false,open:false,
  get ownerDocument(){return doc;},
  get textContent(){return node._text;},set textContent(v){node._text=String(v);node.children=[];},
  append(...k){node.children.push(...k);},replaceChildren(...k){node.children=k;},
  classList:{add:c=>node.classes.add(c),remove:c=>node.classes.delete(c),toggle:(c,on)=>on?node.classes.add(c):node.classes.delete(c),contains:c=>node.classes.has(c)},
  setAttribute(k,v){node.attrs[k]=v;},getAttribute(k){return node.attrs[k];},focus(){},setSelectionRange(){},addEventListener(){},
  querySelector(sel){return sel==='summary'?el('summary'):null;},querySelectorAll(){return [];},
  get all(){const out=[];(function walk(n){for(const c of n.children){out.push(c);walk(c);}})(node);return out;}};
 return node;
}
const nodes=new Map(),store=new Map();
const doc={createElement:tag=>el(tag),createTextNode(t){const n=el('#text');n._text=String(t);return n;},body:el('body'),activeElement:null,
 querySelector(sel){if(!nodes.has(sel))nodes.set(sel,el(sel));return nodes.get(sel);},querySelectorAll(){return [];},addEventListener(){}};
const ctx={document:doc,console,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
 crypto:{randomUUID:()=>'id-'+(store.size+Math.random()).toString(16).replace('.','-')},
 history:{state:{depth:0},pushState(s){this.state=s;},replaceState(s){this.state=s;}},
 navigator:{},setInterval:()=>1,clearInterval(){},clearTimeout(){},structuredClone,addEventListener(){},dispatchEvent(){},scrollTo(){},
 Date,JSON,Math,Set,Map,Number,String,Object,Array,Error,RegExp,Intl,Promise,Event:class{constructor(t){this.type=t;}}};
ctx.window=ctx;ctx.self=ctx;
vm.createContext(ctx);
// 기출 회차 파일은 앱이 필요할 때 fetch로 받는다. 가짜 fetch는 저장소의 gichul/<id>.json을 돌려주고, 받은 주소를 모두 남긴다.
const fetched=[];let failNextFetch=false;
ctx.fetch=url=>{fetched.push(url);if(failNextFetch){failNextFetch=false;return Promise.resolve({ok:false,status:503,json:()=>Promise.reject(Error('no body'))});}
 const m=/^gichul\/([a-z0-9-]+)\.json$/.exec(url);if(!m)return Promise.reject(Error('unexpected fetch '+url));
 return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(require('./gichul-files.cjs').read(m[1]))});};
const flush=()=>new Promise(r=>setImmediate(r));
// v177: 한국사 상자는 '이 문제에 대입' 뒤에 '외울 것', '암기법'이 올 수 있다(그 둘만, 이 순서로). 다른 상자는 대입이 마지막.
const applyLast=hs=>{const t=hs.map(h=>h.replace(/^\d+\. /,'')),i=t.lastIndexOf('이 문제에 대입');return i>=0&&JSON.stringify(t.slice(i+1))===JSON.stringify(['외울 것','암기법'].slice(0,t.length-i-1));};
for(const f of ['scheduler.js','learning.js','core-review-pack.js','quiz-options.js','hanneung-data.js','hanneung-explanations.js','hanneung.js','gichul-index.js','gichul.js','practice-bank.js','practice.js','word-order.js','content-corrections.js','review-record.js','review-policy.js','sync-core.js','study-credit.js','xp.js','score.js','study-review-catalog.js','hanneung-topics.js','topics.js','parts.js','concept-map.js','part-check.js','memorize.js','basics.js','core-units.js','gichul-hits.js','content-store.js','app.js'])
 vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx,{filename:f});
const run=code=>vm.runInContext(code,ctx);
const text=sel=>{const n=nodes.get(sel);return n?[n._text,...n.all.map(x=>x._text)].join(' | '):'';};
const noHistory=(sel)=>assert.doesNotMatch(text(sel),/한국사|한능검/,sel);
assert.doesNotMatch(fs.readFileSync(__dirname+'/index.html','utf8'),/한국사|한능검/,'static HTML also hides history');
const four=['영어','국어','컴퓨터일반','정보보호론'];
const J=code=>JSON.parse(JSON.stringify(run(code)));
assert.deepEqual(J('subjectsList()').sort(),four.slice().sort());
run("go('home','')");noHistory('#subjectList');noHistory('#siteFooter');
for(const s of four)assert.ok(text('#subjectList').includes(s));
const raw=run('data.cards.length');
const hidden=run("data.cards.find(c=>c.subject==='한국사').id");
assert.ok(run("data.cards.some(c=>c.subject==='한국사')"),'content stays installed');
assert.equal(run("data.cards.filter(isPlayable).some(c=>c.subject==='한국사')"),false);
assert.equal(run("reviewQueue(data.cards).ready.some(c=>c.subject==='한국사')"),false);
assert.equal(run("reviewQueue(data.cards).waiting.some(w=>w.card.subject==='한국사')"),false);
for(const s of four){
 run('go("subject",'+JSON.stringify(s)+')');assert.ok(text('#subjectTitle').includes(s));
 run('go("range",'+JSON.stringify(s)+')');noHistory('#rangeList');
 assert.ok(nodes.get('#rangeList').all.some(n=>n.tag==='button'),'ranges remain: '+s);
 run('go("concepts",'+JSON.stringify(s)+')');noHistory('#conceptsBody');
 assert.ok(nodes.get('#conceptsBody').all.some(n=>n.tag==='button'),'concepts remain: '+s);
 run('go("parts",'+JSON.stringify(s)+')');noHistory('#partsBody');
}
assert.equal(run("conceptUnits('한국사').length"),0);
run("go('memorize','')");noHistory('#memorizeBody');
for(const s of four){const titles=J('MEMORIZE.sets.filter(x=>x.subject==='+JSON.stringify(s)+').map(x=>x.title)');for(const title of titles)assert.ok(text('#memorizeBody').includes(title),'memo stays: '+title);}
const hiddenMemo=run("MEMORIZE.sets.find(x=>x.subject==='한국사').id");
for(const target of ['한국사','과목:한국사',hiddenMemo]){run('go("memorize",'+JSON.stringify(target)+')');assert.equal(run('view'),'home');}
for(const v of ['subject','range','parts','concepts','basics']){run('go('+JSON.stringify(v)+',"한국사")');assert.equal(run('view'),'home');}
// Old goals, scores, reads and positions stay saved but do not contribute to visible totals.
run(`data.dailyGoals={'한국사':100,'영어':25};
 data.history=[{id:'hidden-review',cardId:${JSON.stringify(hidden)},mode:'quiz',date:day(),at:new Date().toISOString(),result:'correct'}];
 data.explanationViews=[{id:'hidden-review',openedAt:Date.now()}];
 data.lastScopes={'한국사':{subject:'한국사',round:'lecture-02',card:${JSON.stringify(hidden)},cardAt:Date.now()}};
 data.practiceScope={subject:'한국사',round:'lecture-02'};
 data.memorizeShown=[${JSON.stringify(hiddenMemo)}+':0'];`);
const saved=J('({history:data.history,views:data.explanationViews,lastScopes:data.lastScopes,memo:data.memorizeShown,goals:data.dailyGoals})');
run("go('home','')");noHistory('#xpGoal');assert.ok(text('#xpGoal').includes('영어'));
assert.match(text('#xpText'),/오늘 \+0 XP \(0문제\), 누적 0 XP/);
assert.equal(run("subjectBadges()['한국사']"),undefined);
assert.equal(run("examScore().subjects.some(x=>x.subject==='한국사')"),false);
assert.equal(run('visibleRecords().length'),0);assert.equal(run('visibleViews().length'),0);
run("go('progress','')");for(const sel of ['#subjectStats','#scoreRows','#studyCreditCount'])noHistory(sel);
for(const s of four)assert.ok(text('#subjectStats').includes(s));
assert.match(text('#studyCreditCount'),/오늘 풀이 0회, 해설 0회/);
assert.equal(run('Number($("#done").textContent)'),0);
assert.ok(!run("resumeTarget('한국사').scope?.subject==='한국사'"));
assert.deepEqual(J('({history:data.history,views:data.explanationViews,lastScopes:data.lastScopes,memo:data.memorizeShown,goals:data.dailyGoals})'),saved,'rendering preserves hidden records');
const visibleMemo=run("MEMORIZE.sets.find(x=>x.subject==='영어').id");
run('data.memorizeShown.push('+JSON.stringify(visibleMemo+':0')+');go("memorize","")');
const reset=nodes.get('#memorizeBody').all.find(n=>n.tag==='button'&&n._text.startsWith('외울 것 전체 초기화'));
assert.ok(reset);reset.onclick();
assert.ok(J('data.memorizeShown').includes(hiddenMemo+':0'),'reset preserves hidden confirmations');
assert.ok(!J('data.memorizeShown').includes(visibleMemo+':0'),'reset still clears visible confirmations');
run("openScope({subject:'한국사',round:'lecture-02'},true)");
assert.ok(four.includes(run('scopeOf().subject')));assert.notEqual(run('data.activePractice?.cardId'),hidden);
assert.equal(run('data.cards.length'),raw);
run(`data.history[0].result='wrong';data.guessMarks=[{cardId:${JSON.stringify(hidden)},guess:true,at:Date.now()}];withQueueMode(data,'','wrong');paperWrongOnly=true;openScope({subject:''});`);
assert.equal(run("data.cards.filter(inCurrent).some(c=>c.subject==='한국사')"),false,'mixed scope excludes history');
assert.equal(run("reviewQueue(data.cards).ready.some(c=>c.subject==='한국사')"),false,'wrong queue excludes history');
assert.equal(nodes.get('#paperWrongLabel').hidden,true,'hidden wrong and guessed solves do not count');

// Clearing the one switch restores every history entry point with the same data.
run("HIDDEN_SUBJECTS.clear(); go('home','')");
assert.ok(text('#subjectList').includes('한국사'));
run("go('range','한국사')");assert.ok(text('#rangeList').includes('회'));assert.ok(text('#rangeList').includes('02'));
run("go('memorize','')");assert.ok(text('#memorizeBody').includes('한국사'));
console.log('PASS hidden history: four subjects, ranges, concepts, memo, badges, score, totals, resume, queues, preserved records and restore');
