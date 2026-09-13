const assert=require('node:assert/strict'),policy=require('./review-policy.js'),record=require('./review-record.js'),sync=require('./sync-core.js'),audit=require('./content-audit.cjs');
const a='en-session-20260909-both-whom',b='en-session-20260909-all-whom',c='en-session-20260909-neither';const now=Date.parse('2026-09-09T10:00:00Z');
const make=(id,cardId,exerciseId,minutes,result='correct')=>({id,cardId,date:'2026-09-09',at:new Date(now+minutes*60000).toISOString(),result,mode:'quiz',detail:record.validate({schema:1,presentation:'text',assisted:false,exerciseId,conceptId:policy.concept(cardId),title:'문법',subject:'영어',question:'I met two people, both of ___ were kind.',options:'',submittedAnswer:'whom',correctAnswer:'whom',explanation:'of의 목적어는 whom이다.'})});
const e=make('e1',a,'example-1',0),ready=policy.separate([{id:a},{id:b},{id:c}],[e],now+60000);
assert.deepEqual(ready.ready.map(c=>c.id),[a,c]);assert.equal(ready.waiting[0].card.id,b);assert.equal(ready.nextAt,now+policy.GAP_MS);assert.equal(policy.separate([{id:b}],[e],now+policy.GAP_MS).ready.length,1);
const rows=[e,make('e2',a,'example-2',5),make('e3',a,'example-3',20),make('e4',a,'example-1',40,'wrong')];
assert.deepEqual([...policy.classify(rows).values()],['first','practice','first','repeat']);
const counts=policy.metrics(rows).counts;assert.equal(counts.first.correct,2);assert.equal(counts.repeat.correct,0);assert.equal(counts.practice.total,1);
const old={...e,id:'legacy',at:new Date(now-86400000).toISOString(),date:'2026-09-08'};delete old.detail;assert.equal(policy.classify([old,e]).get(e.id),'unknown');
const plain={...e};delete plain.detail;assert.deepEqual(sync.union([plain],[e]),sync.union([e],[plain]));assert.deepEqual(sync.union([plain],[e])[0].detail,record.validate(e.detail));assert.throws(()=>sync.union([e],[{...e,detail:{...e.detail,submittedAnswer:'who'}}]),/Conflicting/);
assert.throws(()=>record.validate({...e.detail,submittedAnswer:'x'.repeat(2001)}));assert.throws(()=>record.validate({...e.detail,extra:'field'}));
const list=audit.catalog(),ledger={schema:1,items:Object.fromEntries(list.map(x=>[x.exercise.exerciseId,audit.digest(x)]))};audit.verify(list,ledger);const changed=structuredClone(list);changed[0].exercise.question+=' modified';assert.throws(()=>audit.verify(changed,ledger),/Content changed/);
// Coverage checks catch missing formats/rules even if someone were to regenerate the hashes.
// v57: a card is one question, so the same checks now apply per rule (practice-bank.js ruleId) instead of per card.
const provided='en-session-20260909-provided',ofRule=(x,id)=>x.lesson?.ruleId===id;
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,provided)||x.exercise.type!=='text')),/written questions required: en-session-20260909-provided/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-agreement-pair')||x.exercise.type!=='choice')),/MCQ required: grammar-agreement-pair/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-agreement-both'))),/Missing coverage/);
// The pre-existing bar stays: 수일치·그 밖의 문법 rules still need two distinct written questions (as-well has exactly two).
assert.throws(()=>audit.coverage(list.filter(x=>x.card.id!=='en-session-20260909-as-well-v1')),/At least 2 written questions required: en-session-20260909-as-well/);
// Day 1 rules need at least one written and one four-option question (no-passive has one written: en-day1-48).
assert.equal(list.filter(x=>ofRule(x,'grammar-verb-no-passive')&&x.exercise.type==='text').length,1);
assert.throws(()=>audit.coverage(list.filter(x=>x.card.id!=='en-day1-48')),/At least 1 written questions required: grammar-verb-no-passive/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-verb-it-takes')||x.exercise.type!=='choice')),/MCQ required: grammar-verb-it-takes/);
// One card = one question: a card that yields a second question fails the audit (catalog() asserts the same on the source files).
audit.single(list);
assert.throws(()=>audit.single([...list,list.find(x=>x.card.id==='grammar-agreement-each')]),/exactly one question/);
// Concept groups survive the split: a split question must share its rule's concept, and one Day 1 grammar point is one concept.
audit.concepts(list);
assert.equal(policy.concept('grammar-agreement-each-v4'),policy.concept('grammar-agreement-each'));
assert.equal(policy.concept('grammar-agreement-both-v1'),'grammar-agreement-identity','an existing cross-rule group (both ↔ identity) carries over to split questions');
assert.equal(policy.concept('en-session-20260909-while-short-v2'),policy.concept('en-session-20260909-while'));
assert.throws(()=>audit.concepts(list.map(x=>x.card.id==='grammar-agreement-each-v2'?{...x,conceptId:x.card.id}:x)),/keep its rule concept/);
assert.throws(()=>audit.concepts(list.map(x=>x.card.id==='en-day1-43'?{...x,lesson:{...x.lesson,point:list.find(y=>y.card.id==='en-day1-42').lesson.point}}:x)),/One grammar point, one concept/);
{const day1=list.filter(x=>x.card.id.startsWith('en-day1-'));assert.equal(day1.length,60);assert.equal(new Set(day1.map(x=>x.conceptId)).size,24);}
// The learning behaviour the bundles used to give: a wrong answer brings back the other questions on the same rule after the sibling gap,
// even when they are not due. Runs app.js's real review queue (reviewQueue) against the real concept groups.
{
 const fs=require('node:fs'),vm=require('node:vm');global.ReviewSchedule=require('./scheduler.js');const learning=require('./learning.js'),bank=require('./practice-bank.js');
 const src=fs.readFileSync(__dirname+'/app.js','utf8'),from=src.indexOf('// A wrong answer today'),to=src.indexOf('let creditHistoryLimit');assert.ok(from>0&&to>from,'reviewQueue block not found in app.js');
 const clock=Date.now(),stamp=ReviewSchedule.day(new Date(clock)),later=ReviewSchedule.plus(stamp,5),yesterday=ReviewSchedule.plus(stamp,-1);
 const rule='grammar-agreement-each',missed=rule+'-v3',family=Object.keys(bank).filter(id=>bank[id].ruleId===rule),other=Object.keys(bank).filter(id=>bank[id].ruleId==='grammar-agreement-number');
 assert.equal(family.length,7,'each 규칙: 4지선다 1 + 연습 문장 6');
 const deck=[...family,...other].map(id=>({id,subject:'영어',question:'q',answer:'a',created:'2026-09-01',ease:2.5,interval:5,streak:2,due:later}));
 const seen=deck.map((c,i)=>({id:'y'+i,cardId:c.id,date:yesterday,at:yesterday+'T09:00:00+09:00',result:'correct',mode:'quiz'}));
 const queueAfter=(impl,minutesAgo)=>{
  const at=clock-minutesAgo*60000,box={ReviewLearning:learning,ReviewPolicy:impl,day:()=>stamp,data:{history:[...seen,{id:'w',cardId:missed,date:stamp,at:new Date(at).toISOString(),result:'wrong',mode:'quiz'}]}};
  vm.createContext(box);vm.runInContext(src.slice(from,to),box);
  return box.reviewQueue(deck.map(c=>c.id===missed?{...c,interval:1,due:ReviewSchedule.plus(stamp,1),retryAt:new Date(at+learning.RETRY_MS).toISOString()}:c));
 };
 const siblings=family.filter(id=>id!==missed);
 const soon=queueAfter(policy,1);
 assert.deepEqual(soon.ready.map(c=>c.id),[],'1분 뒤: 아직 낼 문제가 없다');
 assert.deepEqual(soon.waiting.map(w=>w.card.id),siblings,'같은 규칙의 나머지 6문제가 5일 뒤 일정과 상관없이 불려 와 형제 간격을 기다린다');
 const gap=queueAfter(policy,11);
 assert.deepEqual(gap.ready.map(c=>c.id),[missed,...siblings],'11분 뒤: 틀린 문제의 재시도와 같은 규칙의 6문제가 이어서 나온다');
 assert.ok(!gap.ready.some(c=>other.includes(c.id)),'다른 규칙(the number)의 문제는 일정대로 쉰다');
 // Control: without concept groups the six sibling questions would stay hidden until their own due date.
 const bare={concept:id=>id,separate:due=>({ready:due,waiting:[],nextAt:null})};
 assert.deepEqual([...queueAfter(bare,11).ready].map(c=>c.id),[missed],'대조군: 개념 묶음이 없으면 틀린 문제 하나만 돌아온다');
}
const twoChoice=structuredClone(list);twoChoice.find(x=>x.exercise.type==='choice').exercise.choices.splice(2);assert.throws(()=>audit.coverage(twoChoice),/Four options required/);
console.log('PASS review: one question per card (audit control), per-rule English coverage with the 수일치/영문법 two-written floor kept, split questions keep their concept, a wrong answer brings back the other questions on the same rule after the gap (with a no-groups control), sibling cooldown, boundary, first/repeat/practice/unknown, richer legacy merge, immutable snapshots, size validation, unreviewed-content gate');
