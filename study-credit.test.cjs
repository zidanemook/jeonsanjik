const assert=require('node:assert/strict'),C=require('./study-credit.js'),sync=require('./sync-core.js');
const row=(id,date,result,mode='quiz')=>({id,cardId:'grammar-card',date,at:date+'T09:00:00+09:00',result,mode});
const correct=row('correct','2026-09-10','correct'),wrong=row('wrong','2026-09-10','wrong'),assisted=row('assisted','2026-09-10','unsure'),yesterday=row('yesterday','2026-09-09','correct'),legacy=row('legacy','2026-09-10','correct','legacy');
const before=JSON.stringify([correct,wrong,assisted,yesterday,legacy]);
const stats=C.summary([correct,wrong,assisted,yesterday,legacy,correct],'2026-09-10');
assert.equal(stats.totalMinutes,4);assert.equal(stats.todayMinutes,3);assert.equal(stats.attempts,4);assert.equal(stats.excluded,1);assert.equal(JSON.stringify([correct,wrong,assisted,yesterday,legacy]),before);
assert.deepEqual(stats.days,[{date:'2026-09-10',attempts:3,minutes:3},{date:'2026-09-09',attempts:1,minutes:1}]);
assert.equal(C.summary([], '2026-09-10').totalMinutes,0);
// Two offline devices, including replayed data, derive the same totals from the event union.
const a=[correct,yesterday],b=[wrong,assisted,yesterday];assert.deepEqual(C.summary(sync.union(a,b),'2026-09-10'),C.summary(sync.union(b,a),'2026-09-10'));
assert.equal(C.summary(sync.union(sync.union(a,b),b),'2026-09-10').totalMinutes,4);
assert.equal(C.summary([correct,{...correct,id:'separate-attempt'}],'2026-09-10').totalMinutes,2);
assert.equal(C.summary([correct],'2026-09-11').todayMinutes,0);assert.equal(C.summary([correct],'2026-09-11').totalMinutes,1);
assert.equal(C.format(0),'0분');assert.equal(C.format(60),'1시간');assert.equal(C.format(125),'2시간 5분');
assert.throws(()=>C.summary([correct,{...correct,result:'wrong'}],'2026-09-10'),/Conflicting/);
console.log('PASS credited time: correct/wrong/assisted attempts, legacy exclusion, historical dates, immutable source, offline union, replay deduplication and separate attempts');
