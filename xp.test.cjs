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
assert.deepEqual(X.level(100),{level:2,into:0,need:315});
assert.deepEqual(X.level(414),{level:2,into:314,need:315});
assert.equal(X.level(415).level,3);
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
// 과목 레벨: 과목마다 따로, 해설 경험치는 그 풀이의 과목으로. 뱃지 등급은 레벨 구간.
{const subj=id=>id.startsWith('en')?'영어':id.startsWith('k')?'국어':null;
 const hs=[row('a1','en1','2026-09-21','correct'),row('a2','en2','2026-09-21','wrong'),row('a3','k1','2026-09-21','correct'),row('a4','zz','2026-09-21','correct')];
 const b=X.bySubject(hs,[{id:'a2',openedAt:1}],subj);assert.equal(b['영어'].xp,25+5+X.XP.explanation);assert.equal(b['국어'].xp,25);assert.equal(Object.keys(b).length,2);
 assert.deepEqual(X.subjectLevel(99),{level:1,into:99,need:100});assert.equal(X.subjectLevel(100).level,2);
 // 다이아(30)까지 누적 약 9만 XP = 하루 1,500 XP로 약 60일.
 let cum=0;for(let l=1;l<30;l++)cum+=X.subjectNeed(l);assert.equal(X.subjectLevel(cum).level,30);assert.equal(X.subjectLevel(cum-1).level,29);assert.ok(Math.abs(cum/1500-60)<2,'about two months: '+cum);
 const ids=[[1,'iron'],[2,'bronze'],[3,'silver'],[4,'gold'],[5,'platinum'],[7,'emerald'],[9,'ruby'],[11,'diamond'],[13,'master'],[15,'grandmaster'],[17,'challenger'],[20,'legend'],[9999,'legend']];
 for(const [l,id] of ids)assert.equal(X.tier(l).id,id,'tier at '+l);assert.equal(X.level(1e9).level>100,true,'no level cap');}
// v130 뱃지 = 레벨 문턱 + 외운 비율(장기기억 확인된 규칙 ÷ 전체 규칙).
assert.equal(X.tier(11,80).id,'diamond');assert.equal(X.tier(11,79.9).id,'ruby');assert.equal(X.tier(11,79.9).blocked.id,'diamond');assert.equal(X.tier(11,79.9).blocked.pct,80);
assert.equal(X.tier(10,40).id,'bronze');assert.equal(X.tier(1,100).id,'iron','level still gates');assert.equal(X.tier(20,95).id,'legend');assert.equal(X.tier(20,90).id,'challenger');assert.equal(X.tier(11,80).blocked,undefined);
{const d=n=>new Date(Date.parse('2026-08-01T00:00:00Z')+n*86400000).toISOString().slice(0,10);let k=0;const R=(card,day,result)=>({id:'L'+String(k++).padStart(5,'0'),cardId:card,date:d(day),at:d(day)+'T01:00:00.000Z',result,mode:'quiz'});
 const rs=[R('a',0,'correct'),R('a',3,'correct'),R('b',0,'wrong'),R('b',7,'correct'),R('c',0,'correct'),R('c',10,'wrong'),R('e',0,'correct'),R('e',8,'unsure')];
 // 7일 → 14일 → 30일 세 번 맞혀야 외움. 짧은 간격 정답은 단계 그대로, 틀리면 0단계.
 const full=[R('m',0,'correct'),R('m',7,'correct'),R('m',21,'correct'),R('m',51,'correct')];
 assert.deepEqual(X.mastered(X.ledger(full),id=>id).stages,[0,0,0,1],'7·14·30 days → mastered');
 assert.deepEqual(X.mastered(X.ledger(full.slice(0,3)),id=>id).stages,[0,0,1,0]);
 assert.deepEqual(X.mastered(X.ledger([R('m',0,'correct'),R('m',3,'correct'),R('m',7,'correct'),R('m',15,'correct')]),id=>id).stages,[0,1,0,0],'gaps count from the last stage-up; day 15 is only 8 days after day 7');
 assert.deepEqual(X.mastered(X.ledger([...full,R('m',52,'wrong')]),id=>id).stages,[1,0,0,0],'a wrong answer after mastery resets to 0');
 assert.deepEqual(X.mastered(X.ledger([...full,R('m',52,'unsure')]),id=>id).stages,[1,0,0,0],'answered with help counts as wrong');
 assert.deepEqual(X.mastered(X.ledger([R('m',0,'wrong'),R('m',6,'correct'),R('m',7,'correct')]),id=>id).stages,[1,0,0,0],'after a miss the clock starts when it is answered right again');
 assert.deepEqual(X.mastered(X.ledger([R('m',0,'wrong'),R('m',8,'correct')]),id=>id).stages,[1,0,0,0],'relearning day itself is not a check');
 assert.deepEqual(X.mastered(X.ledger([R('m',0,'wrong'),R('m',1,'correct'),R('m',8,'correct')]),id=>id).stages,[0,1,0,0]);
 assert.deepEqual(X.mastered(X.ledger(rs),id=>id),{done:0,checked:0,stages:[4,0,0,0]},'none has a 7-day recall after a right answer');
 // 쌍둥이 둘(b, b2)은 한 규칙: 하나만 외워도 그 규칙은 외운 것.
 const twin=id=>id==='t2'?'t':id;assert.deepEqual(X.mastered(X.ledger([...full.map(r=>({...r,cardId:'t'})),R('t2',60,'correct')]),twin).done,1,'twins share the rule stage');
 assert.deepEqual(X.mastered(X.ledger([...full.map(r=>({...r,cardId:'t'})),R('t2',60,'wrong')]),twin).done,0,'a wrong twin resets the rule');
 const s=X.bySubject(full,[],()=>'영어',id=>id,{'영어':10})['영어'];assert.equal(s.done,1);assert.equal(s.all,10);assert.equal(s.pct,10);
 assert.equal(X.overallTier(full,20,id=>id,1).tier.id,'legend','1 of 1 rules');assert.equal(X.overallTier(full,20,id=>id,2).tier.id,'silver','50%');
 assert.equal(X.mastered(X.ledger([R('x',0,'correct')]),id=>id).checked,0,'first attempts alone confirm nothing');}
console.log('PASS xp: every solve rewarded, first/recovery bonuses, levels, streak, optional goal');
