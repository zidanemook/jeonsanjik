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
{const day2=list.filter(x=>x.card.id.startsWith('en-day2-'));assert.equal(day2.length,60);assert.equal(new Set(day2.map(x=>x.conceptId)).size,30);assert.ok(day2.every(x=>x.lesson.topic==='Day 2'&&x.conceptId.startsWith('grammar-day2-')));}
// Day 2 keeps the same bars: one written + one four-option question per rule (subjunctive has one written: en-day2-46), one grammar point = one concept.
assert.equal(list.filter(x=>ofRule(x,'grammar-part02-subjunctive')&&x.exercise.type==='text').length,1);
assert.throws(()=>audit.coverage(list.filter(x=>x.card.id!=='en-day2-46')),/At least 1 written questions required: grammar-part02-subjunctive/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-part02-noun')||x.exercise.type!=='choice')),/MCQ required: grammar-part02-noun/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-part02-inversion-negation'))),/Missing coverage/);
assert.throws(()=>audit.concepts(list.map(x=>x.card.id==='en-day2-42'?{...x,lesson:{...x.lesson,point:list.find(y=>y.card.id==='en-day2-41').lesson.point}}:x)),/One grammar point, one concept/);
{const day3=list.filter(x=>x.card.id.startsWith('en-day3-'));assert.equal(day3.length,178);assert.equal(new Set(day3.map(x=>x.conceptId)).size,28);assert.equal(new Set(day3.map(x=>x.lesson.ruleId)).size,6);
 assert.ok(day3.every(x=>x.lesson.topic==='Day 3'&&x.lesson.ruleId.startsWith('grammar-day3-rule-')&&x.conceptId.startsWith('grammar-day3-')&&!x.conceptId.startsWith('grammar-day3-rule-')));
 // A wrong Day 3 answer brings back the same grammar point: its four-option (001) and written (117) questions share a concept; another point (005) does not.
 assert.equal(policy.concept('en-day3-001'),policy.concept('en-day3-117'));assert.notEqual(policy.concept('en-day3-001'),policy.concept('en-day3-005'));}
// Day 3 keeps the same bars: every rule needs a written and a four-option question, listed rules must exist, one grammar point = one concept.
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-day3-rule-infinitive-use')||x.exercise.type!=='text')),/At least 1 written questions required: grammar-day3-rule-infinitive-use/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-day3-rule-verbal-idiom')||x.exercise.type!=='choice')),/MCQ required: grammar-day3-rule-verbal-idiom/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-day3-rule-participle-clause'))),/Missing coverage/);
assert.throws(()=>audit.concepts(list.map(x=>x.card.id==='en-day3-005'?{...x,lesson:{...x.lesson,point:list.find(y=>y.card.id==='en-day3-001').lesson.point}}:x)),/One grammar point, one concept/);
{const day4=list.filter(x=>x.card.id.startsWith('en-day4-'));assert.equal(day4.length,152);assert.equal(new Set(day4.map(x=>x.conceptId)).size,23);assert.equal(new Set(day4.map(x=>x.lesson.ruleId)).size,6);
 assert.ok(day4.every(x=>x.lesson.topic==='Day 4'&&x.lesson.ruleId.startsWith('grammar-day4-rule-')&&x.conceptId.startsWith('grammar-day4-')&&!x.conceptId.startsWith('grammar-day4-rule-')));
 // A wrong Day 4 answer brings back the same grammar point: its four-option (001) and written (103) questions share a concept; another point (006) does not.
 assert.equal(policy.concept('en-day4-001'),policy.concept('en-day4-103'));assert.notEqual(policy.concept('en-day4-001'),policy.concept('en-day4-006'));}
// Day 4 keeps the same bars: every rule needs a written and a four-option question, listed rules must exist, one grammar point = one concept.
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-day4-rule-verb-form')||x.exercise.type!=='text')),/At least 1 written questions required: grammar-day4-rule-verb-form/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-day4-rule-comparison-form')||x.exercise.type!=='choice')),/MCQ required: grammar-day4-rule-comparison-form/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-day4-rule-comparison-parallel'))),/Missing coverage/);
assert.throws(()=>audit.concepts(list.map(x=>x.card.id==='en-day4-006'?{...x,lesson:{...x.lesson,point:list.find(y=>y.card.id==='en-day4-001').lesson.point}}:x)),/One grammar point, one concept/);
{const day5=list.filter(x=>x.card.id.startsWith('en-day5-'));assert.equal(day5.length,196);assert.equal(new Set(day5.map(x=>x.conceptId)).size,29);assert.equal(new Set(day5.map(x=>x.lesson.ruleId)).size,10);
 assert.ok(day5.every(x=>x.lesson.topic==='Day 5'&&x.lesson.ruleId.startsWith('grammar-day5-rule-')&&x.conceptId.startsWith('grammar-day5-')&&!x.conceptId.startsWith('grammar-day5-rule-')));
 // A wrong Day 5 answer brings back the same grammar point: its four-option (001) and written (131) questions share a concept; another point (005) does not.
 assert.equal(policy.concept('en-day5-001'),policy.concept('en-day5-131'));assert.notEqual(policy.concept('en-day5-001'),policy.concept('en-day5-005'));}
// Day 5 keeps the same bars: every rule needs a written and a four-option question, listed rules must exist, one grammar point = one concept.
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-day5-rule-subjunctive')||x.exercise.type!=='text')),/At least 1 written questions required: grammar-day5-rule-subjunctive/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-day5-rule-inversion')||x.exercise.type!=='choice')),/MCQ required: grammar-day5-rule-inversion/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-day5-rule-emphasis'))),/Missing coverage/);
assert.throws(()=>audit.concepts(list.map(x=>x.card.id==='en-day5-005'?{...x,lesson:{...x.lesson,point:list.find(y=>y.card.id==='en-day5-001').lesson.point}}:x)),/One grammar point, one concept/);
{const d=list.filter(x=>x.card.id.startsWith('en-day6-'));assert.equal(d.length,220);assert.equal(new Set(d.map(x=>x.conceptId)).size,27);assert.equal(new Set(d.map(x=>x.lesson.ruleId)).size,10);
 assert.ok(d.every(x=>x.lesson.topic==='Day 6'&&x.lesson.ruleId.startsWith('grammar-day6-rule-')&&x.conceptId.startsWith('grammar-day6-')&&!x.conceptId.startsWith('grammar-day6-rule-')));
 // 한 포인트의 4지선다(en-day6-001)·직접 쓰기(en-day6-138)는 같은 개념이고 다른 포인트(en-day6-006)는 다르다.
 assert.equal(policy.concept('en-day6-001'),policy.concept('en-day6-138'));assert.notEqual(policy.concept('en-day6-001'),policy.concept('en-day6-006'));}
{const d=list.filter(x=>x.card.id.startsWith('en-day7-'));assert.equal(d.length,240);assert.equal(new Set(d.map(x=>x.conceptId)).size,30);assert.equal(new Set(d.map(x=>x.lesson.ruleId)).size,7);
 assert.ok(d.every(x=>x.lesson.topic==='Day 7'&&x.lesson.ruleId.startsWith('grammar-day7-rule-')&&x.conceptId.startsWith('grammar-day7-')&&!x.conceptId.startsWith('grammar-day7-rule-')));
 // 한 포인트의 4지선다(en-day7-001)·직접 쓰기(en-day7-151)는 같은 개념이고 다른 포인트(en-day7-006)는 다르다.
 assert.equal(policy.concept('en-day7-001'),policy.concept('en-day7-151'));assert.notEqual(policy.concept('en-day7-001'),policy.concept('en-day7-006'));}
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-day6-rule-clause')||x.exercise.type!=='text')),/At least 1 written questions required: grammar-day6-rule-clause/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-day7-rule-tense-mood')||x.exercise.type!=='choice')),/MCQ required: grammar-day7-rule-tense-mood/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-day7-rule-modifier'))),/Missing coverage/);
assert.throws(()=>audit.concepts(list.map(x=>x.card.id==='en-day7-006'?{...x,lesson:{...x.lesson,point:list.find(y=>y.card.id==='en-day7-001').lesson.point}}:x)),/One grammar point, one concept/);
// 문법 공식 훈련(v98): 공식 하나가 개념 하나(grammar-formula-<공식>), 규칙 묶음은 영역 11개(grammar-formula-<영역>), 영역마다 4지선다와 직접 쓰기가 있다.
{const f=list.filter(x=>x.card.id.startsWith('en-formula-'));assert.equal(f.length,364);assert.equal(new Set(f.map(x=>x.conceptId)).size,88,'공식 89개 중 완료형 준동사는 이미 19문제라 새 문제가 없다');assert.equal(new Set(f.map(x=>x.lesson.ruleId)).size,11);
 assert.ok(f.every(x=>x.lesson.topic==='문법 공식 훈련'&&x.conceptId==='grammar-formula-'+x.lesson.formula&&x.lesson.ruleId.startsWith('grammar-formula-')));
 assert.equal(policy.concept('en-formula-001'),policy.concept('en-formula-004'));assert.notEqual(policy.concept('en-formula-001'),policy.concept('en-formula-006'));}
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-formula-inversion')||x.exercise.type!=='text')),/At least 1 written questions required: grammar-formula-inversion/);
assert.throws(()=>audit.coverage(list.filter(x=>!ofRule(x,'grammar-formula-voice'))),/Missing coverage/);
assert.throws(()=>audit.concepts(list.map(x=>x.card.id==='en-formula-006'?{...x,lesson:{...x.lesson,point:list.find(y=>y.card.id==='en-formula-001').lesson.point}}:x)),/One grammar point, one concept/);
// 국어 사고의 힘 논리: 개념(point) 하나가 개념 묶음 하나(1·2장 56개 + 3장 27개 + 4장 14개 + 5장 14개 + 6장 43개 = 154개)다. 영어의 직접쓰기 하한은 걸리지 않고, 장별 문제 수 하한·필수 개념·4지선다만을 요구한다.
{const ko=list.filter(x=>x.card.id.startsWith('ko-logic'));assert.equal(ko.length,995);assert.ok(ko.every(x=>x.card.subject==='국어'&&x.exercise.type==='choice'&&x.exercise.choices.length===4&&x.conceptId.startsWith('korean-logic-')));assert.equal(new Set(ko.map(x=>x.conceptId)).size,154);
 assert.equal(policy.concept('ko-logic6-017'),'korean-logic-spot-denying-antecedent');assert.equal(policy.concept('ko-logic6-017'),policy.concept('ko-logic6-018'),'전건 부정 판별 문제끼리 같은 개념');assert.notEqual(policy.concept('ko-logic6-018'),policy.concept('ko-logic6-027'),'전건 부정과 후건 긍정은 다른 개념');
 {const kr=list.filter(x=>x.card.id.startsWith('ko-read1-'));assert.equal(kr.length,444);assert.ok(kr.every(x=>x.card.subject==='국어'&&x.exercise.type==='choice'&&x.exercise.choices.length===4&&x.conceptId.startsWith('korean-reading-')));assert.equal(new Set(kr.map(x=>x.conceptId)).size,61);
  assert.equal(policy.concept('ko-read1-015'),'korean-reading-but-type');assert.equal(policy.concept('ko-read1-015'),policy.concept('ko-read1-022'),'A but B 유형 문제끼리 같은 개념');assert.notEqual(policy.concept('ko-read1-022'),policy.concept('ko-read1-023'),'A but B 유형과 물론·그러나 유형은 다른 개념');
  assert.equal(policy.concept('ko-read1-266'),'korean-reading-option-intent');assert.notEqual(policy.concept('ko-read1-266'),policy.concept('ko-read1-273'),'의도의 오류와 원인·결과 뒤바꾸기는 다른 개념');
  assert.equal(policy.concept('ko-read1-356'),policy.concept('ko-read1-362'),'정의의 구조 문제끼리 같은 개념');assert.notEqual(policy.concept('ko-read1-362'),policy.concept('ko-read1-363'),'정의의 구조와 정의의 규칙은 다른 개념');}
 assert.equal(policy.concept('ko-logic6-322'),'korean-logic-fallacy-aliases');assert.equal(policy.concept('ko-logic6-322'),policy.concept('ko-logic6-329'),'딴 이름 문제끼리 같은 개념');assert.notEqual(policy.concept('ko-logic6-329'),policy.concept('ko-logic6-153'),'딴 이름과 흑백 사고는 다른 개념');
 assert.equal(policy.concept('ko-logic4-094'),'korean-logic-existential-first');assert.equal(policy.concept('ko-logic4-094'),policy.concept('ko-logic4-102'),'존재 명제 먼저 활용 문제끼리 같은 개념');assert.notEqual(policy.concept('ko-logic4-102'),policy.concept('ko-logic4-103'),'존재 명제 먼저 활용과 존재 명제마다 다른 이름은 다른 개념');
 assert.equal(policy.concept('ko-logic5-074'),'korean-logic-method-agreement');assert.equal(policy.concept('ko-logic5-074'),policy.concept('ko-logic5-083'),'일치법 문제끼리 같은 개념');assert.notEqual(policy.concept('ko-logic5-083'),policy.concept('ko-logic5-084'),'일치법과 차이법은 다른 개념');
 assert.equal(policy.concept('ko-logic2-087'),policy.concept('ko-logic2-091'),'대우 문제끼리 같은 개념');assert.notEqual(policy.concept('ko-logic2-087'),policy.concept('ko-logic2-082'),'대우와 드모르간은 다른 개념');
 assert.equal(policy.concept('ko-logic2-069'),'korean-logic-affirming-consequent');assert.equal(policy.concept('ko-logic2-035'),'korean-logic-conditional-truth');
 assert.equal(policy.concept('ko-logic2-138'),'korean-logic-if-vs-only-if');assert.equal(policy.concept('ko-logic2-138'),policy.concept('ko-logic2-145'),'경우·경우에만 문제끼리 같은 개념');assert.notEqual(policy.concept('ko-logic2-016'),policy.concept('ko-logic2-113'),'2장 보강 충분조건의 뜻은 기존 필요조건과 충분조건과 다른 개념');
 assert.equal(policy.concept('ko-logic3-106'),'korean-logic-undistributed-middle');assert.equal(policy.concept('ko-logic3-106'),policy.concept('ko-logic3-112'),'매개념 부주연 문제끼리 같은 개념');assert.notEqual(policy.concept('ko-logic3-106'),policy.concept('ko-logic3-113'),'매개념 부주연과 대개념 부당 주연은 다른 개념');assert.equal(policy.concept('ko-logic3-079'),'korean-logic-conversion');}
assert.throws(()=>audit.coverage(list.filter(x=>!x.card.id.startsWith('ko-logic1-')||Number(x.card.id.slice(-2))<=24)),/Korean textbook floor: 논리 1장 has 24, needs 25/);
assert.throws(()=>audit.coverage(list.filter(x=>x.lesson?.point!=='대우')),/Missing Korean coverage: 논리 2장 \/ 대우/);
assert.throws(()=>audit.coverage(list.filter(x=>!x.card.id.startsWith('ko-logic2-')||Number(x.card.id.slice(-3))<=139)),/Korean textbook floor: 논리 2장 has 139, needs 140/);
assert.throws(()=>audit.coverage(list.filter(x=>!x.card.id.startsWith('ko-logic3-')||Number(x.card.id.slice(-3))<=144)),/Korean textbook floor: 논리 3장 has 144, needs 145/);
assert.throws(()=>audit.coverage(list.filter(x=>!x.card.id.startsWith('ko-logic4-')||Number(x.card.id.slice(-3))<=117)),/Korean textbook floor: 논리 4장 has 117, needs 118/);
assert.throws(()=>audit.coverage(list.filter(x=>!x.card.id.startsWith('ko-logic5-')||Number(x.card.id.slice(-3))<=102)),/Korean textbook floor: 논리 5장 has 102, needs 103/);
assert.throws(()=>audit.coverage(list.filter(x=>!x.card.id.startsWith('ko-logic6-')||Number(x.card.id.slice(-3))<=262)),/Korean textbook floor: 논리 6장 has 262, needs 263/);
assert.throws(()=>audit.coverage(list.filter(x=>x.lesson?.point!=='오류의 딴 이름')),/Missing Korean coverage: 논리 6장 \/ 오류의 딴 이름/);
assert.throws(()=>audit.coverage(list.filter(x=>!x.card.id.startsWith('ko-read1-')||Number(x.card.id.slice(-3))<=354)),/Korean textbook floor: 독해 1장 has 354, needs 355/);
assert.throws(()=>audit.coverage(list.filter(x=>x.lesson?.point!=='‘물론 B, 그러나 C’ 유형')),/Missing Korean coverage: 독해 1장 \/ ‘물론 B, 그러나 C’ 유형/);
assert.throws(()=>audit.coverage(list.filter(x=>x.lesson?.point!=='존재 명제 먼저 활용')),/Missing Korean coverage: 논리 4장 \/ 존재 명제 먼저 활용/);
assert.throws(()=>audit.coverage(list.filter(x=>x.lesson?.point!=='잉여법')),/Missing Korean coverage: 논리 5장 \/ 잉여법/);
assert.throws(()=>audit.coverage(list.filter(x=>x.lesson?.point!=='환위')),/Missing Korean coverage: 논리 3장 \/ 환위/);
assert.throws(()=>audit.coverage(list.filter(x=>x.lesson?.point!=='조건 관계의 연결과 뒤집기')),/Missing Korean coverage: 논리 2장 \/ 조건 관계의 연결과 뒤집기/);
assert.throws(()=>audit.coverage(list.map(x=>x.card.id==='ko-logic3-001'?{...x,exercise:{...x.exercise,type:'text',answers:['정언 논리']}}:x)),/four-option only: ko-logic3-001/);
assert.throws(()=>audit.concepts(list.map(x=>x.card.id==='ko-logic3-107'?{...x,lesson:{...x.lesson,point:list.find(y=>y.card.id==='ko-logic3-113').lesson.point}}:x)),/One grammar point, one concept/);
assert.throws(()=>audit.coverage(list.map(x=>x.card.id==='ko-logic2-001'?{...x,exercise:{...x.exercise,type:'text',answers:['명제 논리']}}:x)),/four-option only: ko-logic2-001/);
assert.throws(()=>audit.concepts(list.map(x=>x.card.id==='ko-logic2-088'?{...x,lesson:{...x.lesson,point:list.find(y=>y.card.id==='ko-logic2-082').lesson.point}}:x)),/One grammar point, one concept/);
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
  const at=clock-minutesAgo*60000,box={ReviewLearning:learning,ReviewSchedule,ReviewPolicy:impl,day:()=>stamp,data:{history:[...seen,{id:'w',cardId:missed,date:stamp,at:new Date(at).toISOString(),result:'wrong',mode:'quiz'}]}};
  vm.createContext(box);vm.runInContext(src.slice(from,to),box);
  return box.reviewQueue(deck.map(c=>c.id===missed?{...c,interval:1,due:ReviewSchedule.plus(stamp,1),retryAt:new Date(at+learning.RETRY_MS).toISOString()}:c));
 };
 const siblings=family.filter(id=>id!==missed);
 const soon=queueAfter(policy,1);
 assert.deepEqual(Array.from(soon.ready,c=>c.id),siblings,'1분 뒤: 풀 문제가 같은 규칙뿐이면 형제 간격으로 막지 않고 바로 이어서 낸다');
 assert.equal(soon.waiting.length,0,'같은 규칙의 나머지 6문제가 5일 뒤 일정과 상관없이 불려 오고, 다른 문제가 없으니 기다리지 않는다');
 const gap=queueAfter(policy,11);
 assert.deepEqual(gap.ready.map(c=>c.id),[missed,...siblings],'11분 뒤: 틀린 문제의 재시도와 같은 규칙의 6문제가 이어서 나온다');
 assert.ok(!gap.ready.some(c=>other.includes(c.id)),'다른 규칙(the number)의 문제는 일정대로 쉰다');
 // Control: without concept groups the six sibling questions would stay hidden until their own due date.
 const bare={concept:id=>id,skipTwins:o=>({cards:o,skipped:0}),separate:due=>({ready:due,waiting:[],nextAt:null})};
 assert.deepEqual([...queueAfter(bare,11).ready].map(c=>c.id),[missed],'대조군: 개념 묶음이 없으면 틀린 문제 하나만 돌아온다');
}
{const fiveChoice=structuredClone(list);const e=fiveChoice.find(x=>x.exercise.type==='choice'&&x.exercise.choices.length===4).exercise;e.choices=[...e.choices,'다른 시대에서 가져온 참인 사실'];audit.coverage(fiveChoice);}
const twoChoice=structuredClone(list);twoChoice.find(x=>x.exercise.type==='choice').exercise.choices.splice(2);assert.throws(()=>audit.coverage(twoChoice),/Four or five options required/);
// 쌍둥이 건너뛰기(v126): 같은 개념에서 서로 다른 문제를 TWIN_MIN(3)개 맞히고 마지막 풀이가 정답이면 안 푼 쌍둥이는 뺀다. 틀리면 다시 열리고, 쌍둥이만 남으면 그대로 낸다.
{global.window=global;require('./practice-bank.js');const grp=new Map();for(const id of Object.keys(globalThis.PRACTICE_BANK)){const k=policy.concept(id);if(k!==id)grp.set(k,[...(grp.get(k)||[]),id]);}
 const ids=[...grp.values()].find(v=>v.length>=6),other='gichul-local9-2025-computer-01';assert.equal(policy.TWIN_MIN,3);
 const r=(id,cardId,m,result='correct')=>({id,cardId,date:'2026-09-21',at:new Date(Date.parse('2026-09-21T01:00:00Z')+m*60000).toISOString(),result,mode:'quiz'});
 const cards=[...ids,other].map(id=>({id})),pick=h=>policy.skipTwins(cards,h).cards.map(c=>c.id);
 assert.equal(pick([r('1',ids[0],0),r('2',ids[1],20)]).length,cards.length,'2 solved: twins still served');
 const three=[r('1',ids[0],0),r('2',ids[1],20),r('3',ids[2],40)];
 assert.deepEqual(pick(three),[ids[0],ids[1],ids[2],other],'3 solved, last correct: unseen twins skipped, solved ones and ungrouped stay');
 assert.equal(policy.skipTwins(cards,three).skipped,ids.length-3);
 assert.equal(pick([...three,r('4',ids[0],60,'wrong')]).length,cards.length,'a wrong answer reopens the twins');
 assert.equal(pick([...three,r('4',ids[0],60,'unsure')]).length,cards.length,'answered with help reopens the twins');
 const onlyTwins=ids.slice(3).map(id=>({id}));assert.deepEqual(policy.skipTwins(onlyTwins,three).cards,onlyTwins,'never a dead end');}
console.log('PASS review: one question per card (audit control), per-rule English coverage with the 수일치/영문법 two-written floor kept, split questions keep their concept, a wrong answer brings back the other questions on the same rule after the gap (with a no-groups control), sibling cooldown, boundary, first/repeat/practice/unknown, richer legacy merge, immutable snapshots, size validation, unreviewed-content gate');
