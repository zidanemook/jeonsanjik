const assert=require('assert'),S=require('./score.js');
let n=0;const row=(cardId,result,day='2026-09-01')=>({id:'r'+String(n++).padStart(4,'0'),cardId,date:day,at:day+'T00:00:'+String(n%60).padStart(2,'0')+'.'+String(n).padStart(3,'0')+'Z',result,mode:'quiz'});
const subj={computer:'컴퓨터일반',security:'정보보호론',korean:'국어',english:'영어',history:'한국사'};
const subjectOf=id=>{const m=/^gichul-.+-([a-z]+)-\d\d$/.exec(id);if(m)return subj[m[1]];if(id.startsWith('en-'))return '영어';if(id.startsWith('hanneung-'))return '한국사';return null;};
const paper=(s,k,total,day)=>Array.from({length:total},(_,i)=>row('gichul-local9-2025-'+s+'-'+String(i+1).padStart(2,'0'),i<k?'correct':'wrong',day));
// 처음 푼 것만 센다 — 나중에 다시 맞혀도 첫 결과가 남는다. unsure는 틀림.
const h=[...paper('computer',14,20),...paper('computer',20,20,'2026-09-10')];
let s=S.summary(h,subjectOf);let c=s.subjects.find(x=>x.subject==='컴퓨터일반');assert.equal(c.n,20);assert.equal(c.correct,14);assert.equal(c.raw,70);
assert.equal(S.summary([row('gichul-local9-2025-korean-01','unsure')],subjectOf).subjects.find(x=>x.subject==='국어').correct,0);
// 10문항 미만이면 점수를 내지 않고 몇 문제 더 풀어야 하는지만.
s=S.summary(paper('korean',5,6),subjectOf);c=s.subjects.find(x=>x.subject==='국어');assert.equal(c.ready,false);assert.equal(c.need,4);assert.equal(c.score,undefined);
// 범위는 표본이 많을수록 좁다.
const w=(k,t)=>{const e=S.estimate(k,t);assert.ok(e.low<=e.score&&e.score<=e.high);return e.high-e.low;};assert.ok(w(15,20)>w(75,100));
// 자체제작은 점수에 안 들어가고 참고로만. 한능검도 기출 점수에 안 들어간다.
s=S.summary([...paper('english',16,20),...Array.from({length:30},(_,i)=>row('en-day1-'+i,'correct')),row('hanneung-70-01','wrong')],subjectOf);
c=s.subjects.find(x=>x.subject==='영어');assert.equal(c.n,20);assert.deepEqual(c.self,{n:30,rate:100});assert.equal(s.subjects.find(x=>x.subject==='한국사').n,0);
// 4과목이 모두 준비되어야 평균·목표 비교. 한국사는 평균에 없다. 기본 목표는 경기도 전산9급 87 · 가산 5.
const all=[...paper('korean',18,20),...paper('english',16,20),...paper('computer',14,20),...paper('security',12,20),...paper('history',20,20)];
s=S.summary(all,subjectOf);assert.deepEqual(s.target,{name:'경기도 전산9급',cutoff:87,bonus:5});assert.ok(s.total);assert.equal(s.missing.length,0);
const avg=['국어','영어','컴퓨터일반','정보보호론'].map(x=>s.subjects.find(y=>y.subject===x).score).reduce((a,b)=>a+b)/4;
assert.equal(s.total.raw,Math.round(avg*10)/10);assert.equal(s.total.score,Math.round((avg+5)*10)/10);assert.equal(s.total.gap,Math.round((avg+5-87)*10)/10);
assert.equal(S.summary(paper('korean',18,20),subjectOf).total,null);
// 사용자가 정한 목표. 이상한 값이면 기본값.
assert.deepEqual(S.summary(all,subjectOf,{name:'서울 전산9급',cutoff:92,bonus:0}).target,{name:'서울 전산9급',cutoff:92,bonus:0});
assert.deepEqual(S.target({name:'',cutoff:87,bonus:5}),S.DEFAULT_TARGET);assert.deepEqual(S.target({name:'x',cutoff:500,bonus:5}),S.DEFAULT_TARGET);
console.log('PASS score: official first attempts only, 80% range, self-made as reference, 4-subject average + bonus vs custom target');
