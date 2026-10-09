// 기호만 바뀐 문제의 기록 이어 붙이기(2026-10-09). 가운뎃점을 다른 기호로 바꾸며 발문, 정답 글이 달라진 문제는 문제 id의 끝 마디(내용 지문)가 바뀌었다.
// 뜻은 그대로이므로 사용자의 첫 시도 통계, 예상 점수, 뱃지, 파트 상태가 움직이면 안 된다: Practice.canonical(옛 id) = 새 id, 풀이 기록의 문제 id를 견주는 곳은 모두 이것을 거친다.
//  1 표가 온전한가(가리키는 곳이 지금 있는 문제, 열쇠가 지금 문제의 끝 마디와 겹치지 않음)
//  2 44일 상태(v246 앱으로 만든 진짜 모양의 기록, 옛 id): 새 판이 읽은 풀이 갈래(first, repeat, practice, unknown)와 통계가 옛 방식(표 없이 글자 그대로 견줌)과 같다
//  3 그 상태에서 바뀐 문제를 새 판으로 다시 풀면(새 id로 적힘) '다시 푼 것'으로 세어지고 첫 시도 통계는 그대로다. 대조군: 표가 없다고 치면 첫 시도가 늘어난다
//  4 바뀐 문제가 있는 과목마다(국어, 한국사, 컴퓨터일반 등 — 영어는 발문과 정답이 영어라 바뀐 문제가 거의 없다) 바뀐 문제를 골라 옛 id로 한 번, 새 id로 한 번 푼 기록 → first 다음 repeat
'use strict';
const assert=require('node:assert/strict');
const Practice=require('./practice.js'),Policy=require('./review-policy.js'),audit=require('./content-audit.cjs'),Heavy=require('./fixtures/heavy-state.cjs');
const tail=id=>id.slice(id.lastIndexOf('-')+1),head=id=>id.slice(0,id.lastIndexOf('-'));
const items=audit.catalog(),current=new Map(items.map(i=>[i.exercise.exerciseId,i]));
// ── 1 표
assert.ok(Practice.aliasCount>=2000,'표가 채워져 있다: '+Practice.aliasCount);
const currentTails=new Set([...current.keys()].map(tail));
// 표를 거꾸로: 지금 문제 가운데 옛 id가 따로 있는 것. 옛 끝 마디는 표의 열쇠에서만 알 수 있으므로 canonical로 거꾸로 표를 만든다.
const source=require('node:fs').readFileSync(__dirname+'/practice.js','utf8');
const table=JSON.parse(/\/\*EXERCISE-ALIAS\*\/(\{[^}]*\})/.exec(source)[1]);
const byNewTail=new Map();for(const [o,n] of Object.entries(table)){assert.ok(!currentTails.has(o),'옛 끝 마디가 지금 문제의 끝 마디와 겹친다: '+o);assert.ok(currentTails.has(n),'가리키는 문제가 없다: '+n);assert.ok(!byNewTail.has(n),'두 옛 id가 한 문제로: '+n);byNewTail.set(n,o);}
const oldIdOf=id=>byNewTail.has(tail(id))?head(id)+'-'+byNewTail.get(tail(id)):null;
const changed=[...current.keys()].filter(oldIdOf);
assert.ok(changed.length>=Practice.aliasCount,'표의 줄마다 지금 문제가 있다(글이 같은 문제 둘은 끝 마디도 같다)');
for(const id of changed.slice(0,200))assert.equal(Practice.canonical(oldIdOf(id)),id,'옛 id → 새 id');
assert.equal(Practice.canonical('ko-logic1-01-zzzzzzzz'),'ko-logic1-01-zzzzzzzz','표에 없는 id는 그대로');assert.equal(Practice.canonical(undefined),undefined);
// ── 2 44일 상태: 옛 id 그대로 읽은 갈래 = 글자 그대로 견준 갈래
const base=JSON.parse(Heavy.baseRaw()),history=base.history;
const rawClassify=rows=>{ // 표 없이(옛 판 방식): 같은 줄을 canonical로 미리 바꾼 뒤 견주는 것과 결과가 같아야 한다
 const mapped=rows.map(r=>r.detail?{...r,detail:{...r.detail,exerciseId:'raw:'+r.detail.exerciseId}}:r);return Policy.classify(mapped);};
const kindsNew=Policy.classify(history),kindsRaw=rawClassify(history);
assert.deepEqual([...kindsNew],[...kindsRaw],'기존 기록의 풀이 갈래가 표 때문에 달라지지 않는다');
const withDetail=history.filter(h=>h.detail),touched=withDetail.filter(h=>Practice.canonical(h.detail.exerciseId)!==h.detail.exerciseId);
assert.ok(withDetail.length>=700&&touched.length>=20,'44일 상태에 기호가 바뀐 문제의 풀이가 들어 있다: '+touched.length+'/'+withDetail.length);
const ids=new Set(base.cards.map(c=>c.id)),m0=Policy.metrics(history,ids);
// ── 3 바뀐 문제를 새 판으로 다시 푼다
const later=(h,n)=>({...h,id:'again-'+n,date:'2026-12-01',at:Date.parse('2026-12-01T09:00:00+09:00')+n*1000});
const again=touched.map((h,n)=>({...later(h,n),detail:{...h.detail,exerciseId:Practice.canonical(h.detail.exerciseId),assisted:false}}));
const k1=Policy.classify([...history,...again]);
for(const r of again)assert.equal(k1.get(r.id),'repeat','새 id로 다시 푼 풀이는 다시 푼 것으로 센다: '+r.cardId);
const m1=Policy.metrics([...history,...again],ids);
assert.deepEqual(m1.counts.first,m0.counts.first,'첫 시도 통계는 그대로');assert.equal(m1.counts.repeat.total,m0.counts.repeat.total+again.length);
// 대조군: 표가 없다고 치면(새 id 대신 표에 없는 다른 id) 첫 시도로 잘못 센다
{const bogus=again.map(r=>({...r,detail:{...r.detail,exerciseId:r.cardId+'-nomap'}}));const k=Policy.classify([...history,...bogus]);
 assert.ok(bogus.some(r=>k.get(r.id)==='first'),'대조군: 이어 붙이지 않으면 첫 시도로 센다');}
// ── 4 과목마다
const bySubject=new Map();for(const id of changed){const it=current.get(id),s=it.card.subject||'?';if(!bySubject.has(s))bySubject.set(s,[]);if(bySubject.get(s).length<40)bySubject.get(s).push(it);}
for(const s of ['국어','한국사','컴퓨터일반'])assert.ok((bySubject.get(s)||[]).length>=5,'바뀐 문제가 있는 과목: '+s+' '+(bySubject.get(s)||[]).length);
let pairs=0;
for(const [s,list] of bySubject){const rows=[];list.forEach((it,n)=>{const d={exerciseId:oldIdOf(it.exercise.exerciseId),conceptId:it.conceptId||it.card.id,assisted:false};
  rows.push({id:s+'-a-'+n,cardId:it.card.id,mode:'quiz',result:'correct',date:'2026-10-01',at:Date.parse('2026-10-01T09:00:00+09:00')+n*60000,detail:d});
  rows.push({id:s+'-b-'+n,cardId:it.card.id,mode:'quiz',result:'correct',date:'2026-10-20',at:Date.parse('2026-10-20T09:00:00+09:00')+n*60000,detail:{...d,exerciseId:it.exercise.exerciseId}});});
 const k=Policy.classify(rows);list.forEach((it,n)=>{assert.notEqual(k.get(s+'-a-'+n),'repeat');assert.equal(k.get(s+'-b-'+n),'repeat',s+': 옛 id로 푼 뒤 새 id로 푼 풀이 = 다시 푼 것 ('+it.card.id+')');pairs++;});}
console.log('PASS exercise-alias: 기호만 바뀐 문제 '+Practice.aliasCount+'개의 옛 id → 새 id 표(겹침 0), 44일 상태 풀이 '+withDetail.length+'건의 갈래와 통계 그대로(바뀐 문제의 풀이 '+touched.length+'건), 그 문제를 다시 풀어도 첫 시도 통계 그대로, 과목 '+bySubject.size+'개 '+pairs+'쌍 first 다음 repeat, 대조군 1종');
