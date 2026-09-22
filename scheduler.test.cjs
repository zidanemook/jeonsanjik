const assert = require('node:assert/strict');
const {schedule,migrate,plus,MASTER_STREAK}=require('./scheduler.js');
// v131 사용자 규칙: 맞히면 7일 → 또 맞히면 14일 → 또 맞히면 30일 → 그 뒤 외운 문제(30일마다). 제때(due 이후) 맞힌 것만 단계가 오른다.
let card={ease:2.5,interval:0,streak:0};
const gaps=[];let today='2026-09-08';
for(let i=0;i<6;i++){card=schedule(card,'correct',today);gaps.push(card.interval);today=card.due;}
assert.deepEqual(gaps,[7,14,30,30,30,30]);assert.ok(card.streak>=MASTER_STREAK&&MASTER_STREAK===4);
{const first=schedule({ease:2.5,interval:0,streak:0},'correct','2026-09-08'),early=schedule(first,'correct','2026-09-10');
 assert.deepEqual(early,{ease:first.ease,interval:7,streak:1,due:'2026-09-15',chance:false,relearn:false},'a right answer before the due date changes nothing');
 assert.equal(schedule(first,'correct','2026-09-15').interval,14);}
assert.equal(schedule(card,'wrong','2026-09-08').due,'2026-09-09');assert.equal(schedule(card,'wrong','2026-09-08').streak,card.streak,'v139: first miss of a staged card uses its chance');assert.equal(schedule(card,'wrong','2026-09-08').chance,true);
assert.equal(schedule(card,'unsure').interval,1,'v139: answered with help is a miss — next day');
assert.equal(schedule({...card,interval:365},'correct',card.due).interval,30);
assert.equal(schedule({ease:1.3,interval:1,streak:0},'wrong').ease,1.3);
assert.equal(plus('2028-02-28',1),'2028-02-29');
const original={version:1,cards:[{id:'a',stage:2,due:'2026-09-12'},{id:'b',stage:4,due:null}],history:[{cardId:'b',date:'2026-08-15',result:'correct'}]};
const snapshot=JSON.stringify(original), converted=migrate(original,'2026-09-08');
assert.equal(JSON.stringify(original),snapshot);
assert.equal(converted.cards[0].due,'2026-09-12');
assert.equal(converted.cards[1].due,'2026-09-14');
assert.deepEqual(converted.history,original.history);
assert.deepEqual(migrate(converted),converted);
assert.equal(card.streak,MASTER_STREAK,'streak stops at the mastered stage');
const kept=schedule(schedule(card,'wrong','2026-09-08'),'correct','2026-09-09');
assert.equal(kept.interval,30,'right on the chance: stage kept, 30 days again');assert.equal(kept.streak,MASTER_STREAK);
const dropped=schedule(schedule(schedule(card,'wrong','2026-09-08'),'wrong','2026-09-08'),'correct','2026-09-09');
assert.equal(dropped.streak,MASTER_STREAK-1,'two misses: exactly one stage down');assert.equal(dropped.interval,30,'relearned at the 14-day-passed stage → wait 30 days for mastery');
const relearning=schedule(schedule({ease:2.5,interval:7,streak:1,due:'2026-09-08'},'wrong','2026-09-08'),'correct','2026-09-09');
assert.equal(relearning.interval,7,'no stage yet: relearned → seven days');assert.equal(relearning.streak,1);
// v139 기회 한 번 · 한 단계 내림: 단계가 있는 문제(streak ≥ 2)는 첫 오답에 기회, 기회에서 맞히면 단계 유지, 또 틀리면 한 단계만.
{const {step}=require('./scheduler.js');let st;const go=(r,d)=>{const o=step(st,r,d);if(o.event!=='early')st=o.state;return o.event;};
 st=undefined;const ev=[go('correct','2026-01-01'),go('correct','2026-01-08'),go('correct','2026-01-22'),go('correct','2026-02-21')];
 assert.deepEqual(ev,['learned','advance','advance','advance']);assert.equal(st.streak,4,'mastered');
 assert.equal(go('wrong','2026-03-25'),'chance');assert.equal(st.streak,4,'first miss keeps the stage');assert.equal(st.due,'2026-03-26');
 assert.equal(go('correct','2026-03-26'),'kept');assert.equal(st.streak,4);assert.equal(st.due,'2026-04-25','kept: wait the stage again');
 assert.equal(go('wrong','2026-04-25'),'chance');assert.equal(go('wrong','2026-04-25'),'demote');assert.equal(st.streak,3,'second miss drops exactly one stage');
 assert.equal(go('wrong','2026-04-25'),'still');assert.equal(st.streak,3,'more misses while relearning drop no further');
 assert.equal(go('correct','2026-04-26'),'relearned');assert.equal(st.due,'2026-05-26','relearned at the 14-day-passed stage → 30-day wait');
 assert.equal(go('correct','2026-05-26'),'advance');assert.equal(st.streak,4,'mastered again');
 st=undefined;go('correct','2026-01-01');assert.equal(go('wrong','2026-01-03'),'lapse','no stage yet → straight back to relearning');assert.equal(st.streak,0);
 assert.equal(go('correct','2026-01-03'),'relearned');assert.equal(st.streak,1);assert.equal(st.due,'2026-01-10');
 assert.equal(go('unsure','2026-01-10'),'lapse','answered with help counts as a miss');}
console.log('PASS: chance before demotion, one-stage demotion, 7/14/30-day stages, early answers do not advance, mastered every 30 days, relearning restarts at 7, caps, leap day, migration preservation and idempotence');
