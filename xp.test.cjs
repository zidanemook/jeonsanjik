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
// 외운 규칙(7·14·30일) 단계 — 복습 일정과 같은 ReviewSchedule.step. v146 뱃지 둘(기출 · 자체제작)도 여기서.
{const d=n=>new Date(Date.parse('2026-08-01T00:00:00Z')+n*86400000).toISOString().slice(0,10);let k=0;const R=(card,day,result)=>({id:'L'+String(k++).padStart(5,'0'),cardId:card,date:d(day),at:d(day)+'T01:00:00.000Z',result,mode:'quiz'});
 const rs=[R('a',0,'correct'),R('a',3,'correct'),R('b',0,'wrong'),R('b',7,'correct'),R('c',0,'correct'),R('c',10,'wrong'),R('e',0,'correct'),R('e',8,'unsure')];
 // 7일 → 14일 → 30일 세 번 맞혀야 외움. 짧은 간격 정답은 단계 그대로, 틀리면 0단계.
 const full=[R('m',0,'correct'),R('m',7,'correct'),R('m',21,'correct'),R('m',51,'correct')];
 assert.deepEqual(X.mastered(X.ledger(full),id=>id).stages,[0,0,0,1],'7·14·30 days → mastered');
 assert.deepEqual(X.mastered(X.ledger(full.slice(0,3)),id=>id).stages,[0,0,1,0]);
 assert.deepEqual(X.mastered(X.ledger([R('m',0,'correct'),R('m',3,'correct'),R('m',7,'correct'),R('m',15,'correct')]),id=>id).stages,[0,1,0,0],'gaps count from the last stage-up; day 15 is only 8 days after day 7');
 assert.deepEqual(X.mastered(X.ledger([...full,R('m',52,'wrong')]),id=>id).stages,[0,0,0,1],'v139: first miss after mastery uses the chance');
 assert.deepEqual(X.mastered(X.ledger([...full,R('m',52,'wrong'),R('m',53,'wrong')]),id=>id).stages,[0,0,1,0],'second miss drops one stage, not to 0');
 assert.deepEqual(X.mastered(X.ledger([...full,R('m',52,'wrong'),R('m',53,'correct')]),id=>id).stages,[0,0,0,1],'answered right on the chance: still mastered');
 assert.deepEqual(X.mastered(X.ledger([...full,R('m',52,'unsure')]),id=>id).stages,[0,0,0,1],'answered with help is a miss — it uses the chance');
 assert.deepEqual(X.mastered(X.ledger([R('m',0,'wrong'),R('m',6,'correct'),R('m',7,'correct')]),id=>id).stages,[1,0,0,0],'after a miss the clock starts when it is answered right again');
 assert.deepEqual(X.mastered(X.ledger([R('m',0,'wrong'),R('m',8,'correct')]),id=>id).stages,[1,0,0,0],'relearning day itself is not a check');
 assert.deepEqual(X.mastered(X.ledger([R('m',0,'wrong'),R('m',1,'correct'),R('m',8,'correct')]),id=>id).stages,[0,1,0,0]);
 assert.deepEqual(X.mastered(X.ledger(rs),id=>id),{done:0,checked:0,stages:[4,0,0,0]},'none has a 7-day recall after a right answer');
 // 쌍둥이 둘(b, b2)은 한 규칙: 하나만 외워도 그 규칙은 외운 것.
 const twin=id=>id==='t2'?'t':id;assert.deepEqual(X.mastered(X.ledger([...full.map(r=>({...r,cardId:'t'})),R('t2',60,'correct')]),twin).done,1,'twins share the rule stage');
 assert.deepEqual(X.mastered(X.ledger([...full.map(r=>({...r,cardId:'t'})),R('t2',60,'wrong')]),twin).done,1,'a first wrong twin uses the rule chance');
 assert.deepEqual(X.mastered(X.ledger([...full.map(r=>({...r,cardId:'t'})),R('t2',60,'wrong'),R('t',61,'wrong')]),twin).done,0,'a second miss on the rule drops it one stage');
 // v146: 과목 레벨은 경험치만(뱃지는 examBadge · selfBadge로 따로).
 assert.deepEqual(Object.keys(X.bySubject(full,[],()=>'영어')['영어']).sort(),['into','level','need','xp']);
 // v146 자체제작 뱃지 = 파트마다 외운 비율의 평균(파트마다 같은 무게, 문제 수 무관).
 {const M=card=>[R(card,0,'correct'),R(card,7,'correct'),R(card,21,'correct'),R(card,51,'correct')];
  const h=[...M('a1'),...M('a2'),...M('b1'),R('c1',0,'correct'),R('g1',0,'correct')];
  const st=X.conceptStates(X.ledger(h),id=>id);
  const P=(id,ids)=>({id,title:'파트 '+id,ids,scope:{subject:'한국사',topic:'',round:'part-'+id}});
  const groups=[P('p1',['a1','a2']),P('p2',['b1','b2','b3','b4']),P('p3',['c1','c2','c3','c4','c5']),P('p4',['d1','d2'])];
  const b=X.selfBadge(st,groups);
  assert.deepEqual(b.groups.map(g=>g.pct),[100,25,0,0]);
  assert.equal(b.pct,31.2,'(100+25+0+0)/4 = 31.25 → 31.2 (버림)');assert.equal(b.tier.id,'bronze');
  assert.deepEqual(b.next,{id:'silver',name:'실버',pct:50,gap:18.8});
  assert.deepEqual(b.weakest.map(g=>g.id),['p3','p4'],'가장 약한 파트: 0% 중 풀어 본 파트 먼저, 그다음 교재 순서');
  // 같은 0%면 지금 틀려 있는 비율이 높은 파트가 먼저(맞힌 문제만 있는 파트 · 안 푼 파트보다)
  const st3=X.conceptStates(X.ledger([...h,R('d1',5,'wrong'),R('e1',5,'wrong'),R('e2',5,'correct')]),id=>id);
  assert.deepEqual(X.selfBadge(st3,[...groups,P('p5',['e1','e2','e3'])]).weakest.map(g=>g.id),['p4','p5'],'p4: 1/2 틀려 있음 > p5: 1/3 > p3: 0');
  // 약한 파트 하나가 끌어내린다: 100 · 100 · 0 → 66.6 플래티넘, 약한 파트를 채우면 100 레전드
  assert.equal(X.selfBadge(st,[P('x',['a1']),P('y',['a2']),P('z',['d1'])]).pct,66.6);
  assert.equal(X.selfBadge(st,[P('x',['a1']),P('y',['a2']),P('z',['d1'])]).tier.id,'platinum');
  const top=X.selfBadge(st,[P('x',['a1','a2']),P('y',['b1'])]);assert.equal(top.tier.id,'legend');assert.equal(top.next,null);assert.deepEqual(top.weakest,[],'모두 외운 파트는 약한 파트로 안 보인다');
  // 큰 파트가 덮지 않는다: 1문제 파트(외움) + 9문제 파트(0) = 50% 실버 (모아 세면 1/10 = 10% 아이언)
  assert.equal(X.selfBadge(st,[P('s',['a1']),P('l',['q1','q2','q3','q4','q5','q6','q7','q8','q9'])]).tier.id,'silver');
  // 쌍둥이(같은 규칙)는 파트 안에서 한 번만 센다 · 기출 문제는 자체제작 파트에 넣어도 세지 않는다
  const twin=id=>id.replace(/-t\d$/,'');
  const st2=X.conceptStates(X.ledger(M('r-t1')),twin);
  assert.deepEqual(X.selfBadge(st2,[P('t',['r-t1','r-t2','s-t1'])],twin).groups[0],{id:'t',title:'파트 t',scope:{subject:'한국사',topic:'',round:'part-t'},all:2,done:1,tried:1,missed:0,pct:50,order:0});
  assert.equal(X.selfBadge(st,[P('e',['gichul-local9-2025-computer-01','a1'])]).groups[0].all,1);
  // 파트도 대체 묶음도 없으면(자체제작 문제가 없는 과목) '아직'
  assert.deepEqual([X.selfBadge(st,[]).ready,X.selfBadge(st,[]).tier],[false,null]);
  assert.equal(X.selfBadge(st,[P('only-exam',['gichul-local9-2025-computer-02'])]).ready,false);
  // 틀려서 외움에서 한 단계 내려가면 그 파트도 내려간다(단계 규칙은 ReviewSchedule.step 하나)
  const lapsed=X.conceptStates(X.ledger([...M('a1'),R('a1',60,'wrong'),R('a1',61,'wrong')]),id=>id);
  assert.equal(X.selfBadge(lapsed,[P('x',['a1'])]).pct,0);
  // 설명 문장(쉬운 말, 다음 등급까지 남은 차이, 가장 약한 파트)
  const e=X.explainBadge(b);
  assert.equal(e.title,'자체제작 뱃지 · 브론즈');
  assert.deepEqual(e.lines,['파트별로 외운 비율의 평균: 31.2%','다음 등급(실버 50%)까지 18.8% 남았어요']);
  assert.equal(e.weakLabel,'가장 약한 파트');assert.deepEqual(e.weak.map(w=>[w.title,w.pct,w.scope.round]),[['파트 p3',0,'part-p3'],['파트 p4',0,'part-p4']]);
  assert.ok(!/카드|변형|스코프|streak|stage|규칙|쌍둥이/.test(JSON.stringify(e)));assert.match(e.note,/7일 · 14일 · 30일/);assert.match(e.note,/같은 무게/);
  assert.equal(X.explainBadge(top).lines[1],'가장 높은 등급(레전드)이에요');
  assert.deepEqual(X.explainBadge(X.selfBadge(st,[])),{title:'자체제작 뱃지 · 아직',lines:['이 과목은 아직 자체제작 문제가 없어요.'],weakLabel:'',weak:[],note:''});}
 // v146 기출 뱃지 = 예상 점수(score.js 기출 첫 풀이)를 등급표에. 10문제 미만이면 '아직'.
 {const S=require('./score.js'),row=(i,ok)=>({id:'x'+String(i).padStart(3,'0'),cardId:'gichul-local9-2025-computer-'+String(i).padStart(2,'0'),date:'2026-09-01',at:'2026-09-01T00:00:'+String(i).padStart(2,'0')+'Z',result:ok?'correct':'wrong',mode:'quiz'});
  const subj=()=>'컴퓨터일반',sum=h=>S.summary(h,subj).subjects.find(s=>s.subject==='컴퓨터일반');
  const nine=Array.from({length:9},(_,i)=>row(i+1,true));
  const not=X.examBadge(sum(nine));assert.deepEqual([not.ready,not.tier,not.n,not.need],[false,null,9,1],'9문제는 아직 — 만점이어도 등급 없음');
  const ten=[...nine,row(10,false)],r10=sum(ten),b10=X.examBadge(r10);
  assert.equal(b10.ready,true);assert.equal(b10.score,r10.score);assert.equal(b10.tier.id,X.tier(r10.score).id,'예상 점수를 %로 보고 같은 문턱');
  for(const [score,id] of [[0,'iron'],[24,'iron'],[25,'bronze'],[58,'silver'],[60,'gold'],[64,'gold'],[65,'platinum'],[95,'legend']])assert.equal(X.examBadge({n:20,correct:10,ready:true,need:0,score}).tier.id,id,'score '+score);
  const e=X.explainBadge(X.examBadge({n:24,correct:14,ready:true,need:0,score:58}));
  assert.equal(e.title,'기출 뱃지 · 실버');assert.deepEqual(e.lines,['기출을 처음 풀었을 때 기준 예상 점수: 58점','다음 등급(골드 60점)까지 2점 남았어요']);
  assert.equal(e.note,'처음 푼 기출 24문제 기준이에요. 다시 풀어서 맞힌 건 점수에 넣지 않아요.');assert.deepEqual(e.weak,[]);
  const e3=X.explainBadge(X.examBadge({n:3,correct:2,ready:false,need:7}));
  assert.equal(e3.title,'기출 뱃지 · 아직');assert.deepEqual(e3.lines,['기출을 처음 풀었을 때 기준 예상 점수로 등급을 매겨요.','지금까지 처음 푼 기출 3문제 — 7문제 더 풀면 등급이 나와요.']);
  assert.equal(X.explainBadge(X.examBadge(undefined)).lines[1],'아직 푼 기출이 없어요 — 10문제를 풀면 등급이 나와요.');
  // 전체 뱃지(홈 카드) = 과목 뱃지의 평균(과목마다 같은 무게), 등급 없는 과목은 빼고 알려 준다
  const o=X.overallBadges({'국어':{exam:X.examBadge({n:20,ready:true,score:62}),self:{kind:'self',ready:true,pct:40}},'영어':{exam:X.examBadge({n:12,ready:true,score:54}),self:{kind:'self',ready:true,pct:61}},'정보보호론':{exam:X.examBadge({n:3,ready:false,need:7}),self:X.selfBadge(new Map(),[])}});
  assert.deepEqual([o.exam.score,o.exam.tier.id,o.self.pct,o.self.tier.id],[58,'silver',50.5,'silver']);
  const oe=X.explainBadge(o.exam);assert.equal(oe.title,'전체 기출 뱃지 · 실버');assert.deepEqual(oe.lines,['과목마다 기출 예상 점수의 평균: 58점','국어 62점 · 영어 54점','다음 등급(골드 60점)까지 2점 남았어요']);assert.equal(oe.note,'아직 등급이 없는 과목: 정보보호론(7문제 더)');
  assert.deepEqual(X.explainBadge(o.self).lines,['과목마다 자체제작 뱃지 비율의 평균: 50.5%','국어 40% · 영어 61%','다음 등급(골드 60%)까지 9.5% 남았어요']);
  assert.equal(X.explainBadge(X.overallBadges({'컴퓨터일반':{exam:X.examBadge(null),self:X.selfBadge(new Map(),[])}}).exam).title,'전체 기출 뱃지 · 아직');
  // 설명에 앱 속 용어가 나오지 않는다
  for(const x of [e,e3,oe])assert.ok(!/카드|변형|스코프|streak|stage|규칙|쌍둥이/.test(JSON.stringify(x)),JSON.stringify(x));}
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
 assert.deepEqual(X.ledger(farm).slice(4).map(r=>r.xp),[1,2,2,2,2],'a deliberate miss on a mastered question: chance answer gives base XP only');
 assert.ok(X.ledger(farm).slice(4).reduce((a,r)=>a+r.xp,0)<=5*X.award(['correct'],'correct').xp,'farming never beats plain answering');}
console.log('PASS xp: every solve rewarded, first/recovery bonuses, levels, streak, optional goal; v146 badges — 자체제작 = equal-weight part average, 기출 = 예상 점수 tier (<10 → 아직), explanations');

// 한국사 기출 뱃지는 한능검 심화 기출 기준 — 설명에 출처와 3급 기준이 나온다.
{const X=require('./xp.js');const b=X.examBadge({source:'한능검 심화',n:12,correct:9,ready:true,need:0,score:71});assert.equal(b.source,'한능검 심화');
 const t=JSON.stringify(X.explainBadge(b,'한국사'));assert.ok(t.includes('한능검 심화 기출을 처음 풀었을 때 기준 예상 점수: 71점'),t);assert.ok(t.includes('3급은 60점 이상'),t);
 const e=JSON.stringify(X.explainBadge(X.examBadge({source:'한능검 심화',n:3,ready:false,need:7}),'한국사'));assert.ok(e.includes('처음 푼 한능검 심화 기출 3문제 — 7문제 더'),e);}
