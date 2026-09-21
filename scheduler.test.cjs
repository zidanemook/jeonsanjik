const assert = require('node:assert/strict');
const {schedule,migrate,plus,MASTER_STREAK}=require('./scheduler.js');
// v131 사용자 규칙: 맞히면 7일 → 또 맞히면 14일 → 또 맞히면 30일 → 그 뒤 외운 문제(30일마다). 제때(due 이후) 맞힌 것만 단계가 오른다.
let card={ease:2.5,interval:0,streak:0};
const gaps=[];let today='2026-09-08';
for(let i=0;i<6;i++){card=schedule(card,'correct',today);gaps.push(card.interval);today=card.due;}
assert.deepEqual(gaps,[7,14,30,30,30,30]);assert.ok(card.streak>=MASTER_STREAK&&MASTER_STREAK===4);
{const first=schedule({ease:2.5,interval:0,streak:0},'correct','2026-09-08'),early=schedule(first,'correct','2026-09-10');
 assert.deepEqual(early,{ease:first.ease,interval:7,streak:1,due:'2026-09-15'},'a right answer before the due date changes nothing');
 assert.equal(schedule(first,'correct','2026-09-15').interval,14);}
assert.equal(schedule(card,'wrong','2026-09-08').due,'2026-09-09');assert.equal(schedule(card,'wrong','2026-09-08').streak,0);
assert.equal(schedule(card,'unsure').interval,3);
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
const relearning=schedule(schedule(card,'wrong','2026-09-08'),'correct','2026-09-09');
assert.equal(relearning.interval,7,'relearned: seven days again');assert.equal(relearning.streak,1);
console.log('PASS: 7/14/30-day stages, early answers do not advance, mastered every 30 days, relearning restarts at 7, caps, leap day, migration preservation and idempotence');
