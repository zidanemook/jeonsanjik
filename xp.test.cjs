const assert=require('assert'),X=require('./xp.js');
const row=(id,cardId,date,result,mode='quiz')=>({id,cardId,date,at:date+'T0'+id.slice(-1)+':00:00.000Z',result,mode});
// 풀면 언제나 보상 — 틀려도 0보다 크다.
for(const r of ['wrong','unsure','correct'])assert.ok(X.award([],r).xp>0,'every solve earns XP: '+r);
assert.equal(X.award(['correct'],'wrong').xp,X.XP.wrong);
// 처음 맞힘과 틀렸던 문제 맞힘이 가장 크다.
assert.equal(X.award([],'correct').xp,X.XP.correct+X.XP.first);
assert.equal(X.award(['wrong'],'correct').xp,X.XP.correct+X.XP.recover);assert.equal(X.award(['wrong'],'correct').xp+X.XP.wrong,X.award([],'correct').xp,'deliberate miss + recovery never beats answering right the first time');
assert.equal(X.award(['unsure'],'correct').xp,X.XP.correct+X.XP.recover);
assert.equal(X.award(['wrong','correct'],'correct').xp,X.XP.correct,'already recovered → plain correct');
assert.ok(X.award([],'correct').xp>X.award(['correct'],'correct').xp&&X.award(['wrong'],'correct').xp>X.award(['correct'],'correct').xp);
// 레벨 경계.
assert.deepEqual(X.level(0),{level:1,into:0,need:20});
assert.deepEqual(X.level(20),{level:2,into:0,need:63});
assert.deepEqual(X.level(82),{level:2,into:62,need:63});
assert.equal(X.level(83).level,3);
// 요약: 날짜·연속일·목표. 퀴즈 풀이가 아닌 기록은 세지 않는다.
const h=[row('a1','c1','2026-09-19','wrong'),row('a2','c1','2026-09-20','correct'),row('a3','c2','2026-09-20','correct'),row('a4','c3','2026-09-21','correct'),row('a5','c3','2026-09-21','correct'),row('a6','c9','2026-09-21','correct','legacy')];
const s=X.summary(h,[],'2026-09-21');
assert.equal(s.total,1+3+4+4+2);assert.equal(s.todayXp,6);assert.equal(s.todaySolves,2);assert.equal(s.streak,3);assert.equal(s.goal,null);assert.equal(s.goalDone,false);
assert.equal(X.summary(h,[],'2026-09-22').streak,3,'today not solved yet keeps yesterday streak');
assert.equal(X.summary(h,[],'2026-09-23').streak,0,'a missed day breaks the streak');
assert.equal(X.summary(h,[],'2026-09-21',2).goalDone,true);assert.equal(X.summary(h,[],'2026-09-21',3).goalDone,false);
assert.equal(X.summary(h,[],'2026-09-21',0).goal,null,'no goal unless the user sets a positive one');
assert.equal(X.summary(h,[{id:'a4',openedAt:Date.parse('2026-09-21T03:00:00Z')}],'2026-09-21').todayXp,6+X.XP.explanation);
// 순서가 뒤섞여 들어와도(동기화) 같은 결과.
assert.deepEqual(X.summary([...h].reverse(),[],'2026-09-21'),s);
const last=X.lastAward(h,[],'a2');assert.equal(last.xp,3);assert.equal(last.parts[1].label,'틀렸던 문제 맞힘');assert.equal(last.levelBefore,1);assert.equal(last.levelAfter,1);
const many=Array.from({length:5},(_,i)=>row('b'+i,'k'+i,'2026-09-21','correct'));assert.equal(X.lastAward(many,[],'b4').levelAfter,2);assert.equal(X.lastAward(many,[],'b4').levelBefore,1);
// 과목 레벨: 과목마다 따로, 해설 경험치는 그 풀이의 과목으로. 뱃지 등급은 레벨 구간.
{const subj=id=>id.startsWith('en')?'영어':id.startsWith('k')?'국어':null;
 const hs=[row('a1','en1','2026-09-21','correct'),row('a2','en2','2026-09-21','wrong'),row('a3','k1','2026-09-21','correct'),row('a4','zz','2026-09-21','correct')];
 const b=X.bySubject(hs,[{id:'a2',openedAt:1}],subj);assert.equal(b['영어'].xp,4+1+X.XP.explanation);assert.equal(b['국어'].xp,4);assert.equal(Object.keys(b).length,2);
 assert.deepEqual(X.subjectLevel(19),{level:1,into:19,need:20});assert.equal(X.subjectLevel(20).level,2);
 // 레전드 레벨 20까지 누적 약 7,700 XP = 하루 약 300 XP(한 과목 100문제)로 약 26일.
 let cum=0;for(let l=1;l<20;l++)cum+=X.subjectNeed(l);assert.equal(X.subjectLevel(cum).level,20);assert.equal(X.subjectLevel(cum-1).level,19);assert.ok(Math.abs(cum/300-26)<1.5,'about 26 days: '+cum);
 for(const [p,id] of [[0,'iron'],[24.9,'iron'],[25,'bronze'],[50,'silver'],[60,'gold'],[65,'platinum'],[70,'emerald'],[75,'ruby'],[80,'diamond'],[85,'master'],[88,'grandmaster'],[90,'challenger'],[95,'legend'],[100,'legend']])assert.equal(X.tier(p).id,id,'tier at '+p+'%');
 assert.equal(X.level(1e9).level>100,true,'no level cap');}
// v138 뱃지 = 외운 비율만(레벨 조건 없음). 자체제작·기출 비율의 평균.
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
 const s=X.bySubject(full,[],()=>'영어',id=>id,{'영어':{self:10,exam:0}})['영어'];assert.equal(s.done,1);assert.equal(s.all,10);assert.equal(s.pct,10,'only self-made pool exists');
 assert.equal(X.overallTier(full,id=>id,{self:1,exam:0}).tier.id,'legend','1 of 1 rules');assert.equal(X.overallTier(full,id=>id,{self:2,exam:0}).tier.id,'silver','50%');
 // 자체제작과 기출은 비율끼리 반반: 자체제작 1/2(50%) + 기출 0/100(0%) → 25% 브론즈. 합쳐 세면 1/102라 아이언이었을 것.
 const ex=full.map(r=>({...r,cardId:'gichul-local9-2025-computer-01'}));const both=[...full,...ex];
 const m=X.overallTier(both,id=>id,{self:2,exam:100});assert.equal(m.self.pct,50);assert.equal(m.exam.pct,1);assert.equal(m.pct,25.5);assert.equal(m.tier.id,'bronze');
 assert.equal(X.overallTier(full,id=>id,{self:2,exam:100}).pct,25,'exam pool at 0% still counts half');
 assert.equal(X.mastered(X.ledger([R('x',0,'correct')]),id=>id).checked,0,'first attempts alone confirm nothing');}
{const hs=[row('g1','en1','2026-09-21','correct'),row('g2','en2','2026-09-21','wrong'),row('g3','k1','2026-09-21','correct'),row('g4','en1','2026-09-20','correct'),row('g5','zz','2026-09-21','correct','legacy')];
 assert.deepEqual(X.solvesBySubject(hs,id=>id.startsWith('en')?'영어':id.startsWith('k')?'국어':null,'2026-09-21'),{'영어':2,'국어':1},'today only, quiz rows only, per subject');}
// v137 단계 보너스: 7일 +4 · 14일 +6 · 30일(외움) +10, 문제마다 처음 도달할 때 한 번만. 외운 뒤·다시 오른 단계는 기본 점수만.
{const d=n=>new Date(Date.parse('2026-08-01T00:00:00Z')+n*86400000).toISOString().slice(0,10);let k=0;const R=(card,day,result)=>({id:'S'+String(k++).padStart(5,'0'),cardId:card,date:d(day),at:d(day)+'T01:00:00.000Z',result,mode:'quiz'});
 const xs=h=>X.ledger(h).map(r=>r.xp);
 assert.deepEqual(xs([R('m',0,'correct'),R('m',3,'correct'),R('m',7,'correct'),R('m',21,'correct'),R('m',51,'correct'),R('m',81,'correct'),R('m',90,'correct')]),[4,2,6,8,12,2,2],'first, early, 7d, 14d, 30d mastered, then base only');
 assert.deepEqual(xs([R('w',0,'wrong'),R('w',1,'correct'),R('w',8,'correct')]),[1,3,6],'wrong → recovered 3 → 7 days after relearning 2+4');
 assert.deepEqual(xs([R('v',0,'correct'),R('v',7,'wrong'),R('v',8,'correct'),R('v',14,'correct')]),[4,1,3,2],'a miss restarts the clock; 6 days after relearning is not yet 7');
 const L=X.ledger([R('m',0,'correct'),R('m',7,'correct')]);assert.equal(L[1].parts.at(-1).label,'7일 뒤 다시 맞힘');}
// 일부러 틀려서 외운 문제의 단계 보너스를 다시 받을 수 없다.
{const d=n=>new Date(Date.parse('2026-08-01T00:00:00Z')+n*86400000).toISOString().slice(0,10);let k=0;const R=(card,day,result)=>({id:'F'+String(k++).padStart(5,'0'),cardId:card,date:d(day),at:d(day)+'T01:00:00.000Z',result,mode:'quiz'});
 const honest=[R('m',0,'correct'),R('m',7,'correct'),R('m',21,'correct'),R('m',51,'correct')],farm=[...honest,R('m',52,'wrong'),R('m',53,'correct'),R('m',60,'correct'),R('m',74,'correct'),R('m',104,'correct')];
 assert.deepEqual(X.ledger(farm).slice(4).map(r=>r.xp),[1,3,2,2,2],'after a deliberate miss the stages give base XP only');
 assert.ok(X.ledger(farm).slice(4).reduce((a,r)=>a+r.xp,0)<=5*X.award(['correct'],'correct').xp,'farming never beats plain answering');}
console.log('PASS xp: every solve rewarded, first/recovery bonuses, levels, streak, optional goal');
