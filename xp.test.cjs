const assert=require('assert'),X=require('./xp.js');
const row=(id,cardId,date,result,mode='quiz')=>({id,cardId,date,at:date+'T0'+id.slice(-1)+':00:00.000Z',result,mode});
// 풀면 언제나 보상 — 틀려도 0보다 크다.
for(const r of ['wrong','unsure','correct'])assert.ok(X.award([],r).xp>0,'every solve earns XP: '+r);
assert.equal(X.award(['correct'],'wrong').xp,X.XP.wrong);
// 처음 맞힘과 틀렸던 문제 맞힘이 가장 크다.
assert.equal(X.award([],'correct').xp,X.XP.correct+X.XP.first);
assert.equal(X.award(['wrong'],'correct').xp,X.XP.correct+X.XP.recover);
assert.equal(X.award(['unsure'],'correct').xp,X.XP.correct+X.XP.recover);
assert.equal(X.award(['wrong','correct'],'correct').xp,X.XP.correct,'already recovered → plain correct');
assert.ok(X.award([],'correct').xp>X.award(['correct'],'correct').xp&&X.award(['wrong'],'correct').xp>X.award(['correct'],'correct').xp);
// 레벨 경계.
assert.deepEqual(X.level(0),{level:1,into:0,need:100});
assert.deepEqual(X.level(100),{level:2,into:0,need:120});
assert.deepEqual(X.level(219),{level:2,into:119,need:120});
assert.equal(X.level(220).level,3);
// 요약: 날짜·연속일·목표. 퀴즈 풀이가 아닌 기록은 세지 않는다.
const h=[row('a1','c1','2026-09-19','wrong'),row('a2','c1','2026-09-20','correct'),row('a3','c2','2026-09-20','correct'),row('a4','c3','2026-09-21','correct'),row('a5','c3','2026-09-21','correct'),row('a6','c9','2026-09-21','correct','legacy')];
const s=X.summary(h,[],'2026-09-21');
assert.equal(s.total,5+25+25+25+10);assert.equal(s.todayXp,35);assert.equal(s.todaySolves,2);assert.equal(s.streak,3);assert.equal(s.goal,null);assert.equal(s.goalDone,false);
assert.equal(X.summary(h,[],'2026-09-22').streak,3,'today not solved yet keeps yesterday streak');
assert.equal(X.summary(h,[],'2026-09-23').streak,0,'a missed day breaks the streak');
assert.equal(X.summary(h,[],'2026-09-21',2).goalDone,true);assert.equal(X.summary(h,[],'2026-09-21',3).goalDone,false);
assert.equal(X.summary(h,[],'2026-09-21',0).goal,null,'no goal unless the user sets a positive one');
assert.equal(X.summary(h,[{id:'a4',openedAt:Date.parse('2026-09-21T03:00:00Z')}],'2026-09-21').todayXp,35+X.XP.explanation);
// 순서가 뒤섞여 들어와도(동기화) 같은 결과.
assert.deepEqual(X.summary([...h].reverse(),[],'2026-09-21'),s);
const last=X.lastAward(h,[],'a2');assert.equal(last.xp,25);assert.equal(last.parts[1].label,'틀렸던 문제 맞힘');assert.equal(last.levelBefore,1);assert.equal(last.levelAfter,1);
const many=Array.from({length:4},(_,i)=>row('b'+i,'k'+i,'2026-09-21','correct'));assert.equal(X.lastAward(many,[],'b3').levelAfter,2);assert.equal(X.lastAward(many,[],'b3').levelBefore,1);
console.log('PASS xp: every solve rewarded, first/recovery bonuses, levels, streak, optional goal');
