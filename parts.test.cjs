// 파트(parts.js)와 파트별 점검 모드(part-check.js + app.js)를 확인한다.
// 1) 파트 규칙(5문제 → 틀리면 3문제씩 더 → 통과·다시 볼 파트)  2) 파트 범위: 모든 문제가 정확히 한 파트에
// 3) 앱을 가짜 DOM 위에서 돌려 19강 파트별 점검(모두 맞힘 = 5×파트 수 · 하나 틀리면 +3 · 바닥나면 다시 볼 파트 · 새로고침 뒤 이어짐)
// 4) 파트별 상태 화면의 수(문제·외움·복습 판정·안 푼 문제 · 한국사 기출 첫 풀이)가 기록과 같다. 4-3) 복습 판정(v184): 하루 이상 지나 다시 푼 풀이만.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const PartCheck=require('./part-check.js');

// ── 1) 규칙
{
 const C='correct',W='wrong',U='unsure',ev=PartCheck.evaluate;
 assert.equal(ev(12,[]).status,'todo');
 assert.deepEqual([ev(12,[C,C]).status,ev(12,[C,C]).inBatch,ev(12,[C,C]).batchSize],['active',2,5]);
 assert.equal(ev(12,[C,C,C,C,C]).status,'pass','5문제 모두 맞히면 통과');
 const miss=ev(12,[C,W,C,C,C]);assert.deepEqual([miss.status,miss.batch,miss.batchSize,miss.inBatch],['active',2,3,0],'하나 틀리면 3문제 더');
 assert.equal(ev(12,[C,W,C,C,C,C,C,C]).status,'pass','추가 3문제를 모두 맞히면 통과(8문제)');
 assert.equal(ev(12,[C,W,C,C,C,C,U,C]).status,'active','설명 보고 맞힘은 정답이 아니다 → 또 3문제');
 assert.equal(ev(12,[C,W,C,C,C,C,U,C,C,C,C]).status,'pass','세 번째 묶음을 모두 맞히면 통과(11문제)');
 assert.equal(ev(8,[W,W,W,W,W,W,W,W]).status,'weak','8문제 파트를 다 틀리면 5+3에서 바닥 → 다시 볼 파트');
 const tail=ev(6,[W,C,C,C,C]);assert.deepEqual([tail.status,tail.batchSize],['active',1],'남은 문제가 1개면 1문제만 더');
 assert.equal(ev(6,[W,C,C,C,C,C]).status,'pass');
 assert.equal(ev(6,[W,C,C,C,C,W]).status,'weak');
 assert.deepEqual([ev(3,[]).batchSize,ev(3,[C,C,C]).status],[3,'pass'],'3문제뿐인 파트는 3문제로 판정');
 assert.equal(ev(0,[]).status,'skip');
 // 고르기: 바로 앞과 같은 내용은 피하고, 안 푼 문제 → 복습일 문제 → 나머지, 덜 나온 사실 먼저
 const key=id=>id.split(':')[0],pick=(c,used,last)=>PartCheck.pick(c,new Map(Object.entries(used||{})),last,key).id;
 assert.equal(pick([{id:'a:1',fresh:true},{id:'b:1',fresh:false,due:true}],{},null),'a:1','안 푼 문제 먼저');
 assert.equal(pick([{id:'a:1',fresh:true},{id:'b:1',fresh:false,due:true}],{},'a'),'b:1','바로 앞과 같은 내용이면 다른 내용 먼저');
 assert.equal(pick([{id:'a:1',fresh:true},{id:'a:2',fresh:true}],{},'a'),'a:1','같은 내용뿐이면 그래도 낸다(막다른 화면 없음)');
 assert.equal(pick([{id:'a:1',fresh:true},{id:'b:1',fresh:true}],{a:2},null),'b:1','이 판에 덜 나온 내용 먼저');
 assert.equal(pick([{id:'a:1',fresh:false,solves:5},{id:'b:1',fresh:false,solves:1}],{},null),'b:1','v195: 이미 푼 문제끼리는 푼 횟수 적은 것 먼저');
 assert.equal(pick([{id:'a:1',fresh:false,due:true,solves:9},{id:'b:1',fresh:false,solves:0}],{},null),'a:1','대조군: 복습일이 된 문제가 먼저인 규칙은 그대로');
 assert.equal(pick([{id:'a:1',fresh:false,due:false},{id:'b:1',fresh:false,due:true}],{},null),'b:1','복습일이 된 문제가 나머지보다 먼저');
 const r=PartCheck.round([{id:'p1',ids:['x1','x2']},{id:'p2',ids:['y1','y2','y3']}],new Map([['x1',{result:C,at:'1'}],['x2',{result:C,at:'2'}]]),()=>true);
 assert.deepEqual([r.parts[0].status,r.current,r.done],['pass',1,false],'2문제 파트는 2문제로 통과하고 다음 파트로');
}

// ── 1-2) 복습 판정(v184, 2026-09-29 사용자: "자체문제 풀때 해설을 보면 뒤에 문제 풀때 맞히기 쉬워지니까")
// 판정에 넣는 풀이 = 바로 앞 노출(풀이 · 해설 펼침)이 이전 날인 퀴즈 풀이. 문제마다 가장 최근 판정 풀이. 'unsure'는 틀림.
{
 const T=(d,hm)=>Date.parse('2026-09-'+d+'T'+hm+':00Z'),row=(id,card,d,hm,result,mode='quiz')=>({id,cardId:card,date:'2026-09-'+d,at:new Date(T(d,hm)).toISOString(),result,mode});
 const dayOf=ms=>new Date(ms).toISOString().slice(0,10);
 const history=[
  row('a1','A','20','09:00','wrong'),row('a2','A','20','09:05','correct'),            // A: 같은 날 해설 보고 다시 맞힘 → 연습(판정 없음)
  row('b1','B','20','09:00','wrong'),row('b2','B','21','10:00','correct'),            // B: 다음 날 맞힘 → 판정 정답
  row('c1','C','20','09:00','correct'),row('c2','C','21','09:00','wrong'),row('c3','C','23','09:00','correct'), // C: 가장 최근 판정 풀이(23일 정답)가 이긴다
  row('d1','D','20','09:00','correct'),row('d2','D','23','09:00','correct'),row('d3','D','23','09:30','wrong'), // D: 23일 두 번째 풀이는 같은 날 → 23일 첫 풀이(정답)가 남는다
  row('e1','E','20','09:00','wrong'),row('e2','E','21','09:00','correct'),            // E: 21일 풀기 전에 20일 풀이의 해설을 21일에 펼침 → 같은 날 노출 → 연습
  row('f1','F','20','09:00','correct'),row('f2','F','22','09:00','unsure'),           // F: 설명 보고 맞힘 = 틀림
  row('g1','G','20','09:00','wrong','legacy'),row('g2','G','21','09:00','wrong'),     // G: 옛 기록도 노출로 센다 → 21일 풀이는 판정(틀림)
  row('h1','H','20','09:00','correct'),                                                // H: 한 번만 푼 문제 → 판정 없음
 ];
 const views=[{id:'a1',openedAt:T('20','09:01')},{id:'e1',openedAt:T('21','08:00')},{id:'zz',openedAt:T('21','08:00')}];
 const got=PartCheck.delayed(history,views,dayOf);
 assert.deepEqual(Object.fromEntries([...got].sort()),{B:'correct',C:'correct',D:'correct',F:'unsure',G:'wrong'},'복습 판정: 같은 날 해설 뒤 풀이 · 처음 풀이는 빠지고, 다음 날 풀이는 들어간다');
 // 기록 순서가 섞여 있어도 같다(동기화로 다른 기기 기록이 뒤에 붙는 경우)
 assert.deepEqual(Object.fromEntries([...PartCheck.delayed([...history].reverse(),views,dayOf)].sort()),Object.fromEntries([...got].sort()));
 // 해설을 안 봤으면 E의 21일 풀이는 판정에 들어간다
 assert.equal(PartCheck.delayed(history,views.filter(v=>v.id!=='e1'),dayOf).get('E'),'correct');
 const j=PartCheck.judge(['A','B','C','D','E','F','G','H'],got);
 assert.deepEqual([j.n,j.reviewed,j.right,j.wrong],[8,5,3,2]);
 assert.equal(j.weak,false,'8문제 파트에서 판정 5문제는 min(20, 8) = 8에 못 미친다');
 // 약함 문턱: min(20, 파트 문제 수) 이상 판정 · 30% 이상 틀림
 const res=(ok,bad)=>new Map([...Array.from({length:ok},(_,i)=>['o'+i,'correct']),...Array.from({length:bad},(_,i)=>['x'+i,i%2?'unsure':'wrong'])]);
 const ids=n=>[...Array.from({length:n},(_,i)=>'o'+i),...Array.from({length:n},(_,i)=>'x'+i)];
 const judgeN=(n,ok,bad)=>PartCheck.judge(ids(n).slice(0,0).concat([...res(ok,bad).keys()],Array.from({length:Math.max(0,n-ok-bad)},(_,i)=>'u'+i)),res(ok,bad));
 assert.equal(judgeN(8,5,3).weak,true,'8문제 파트: 8문제 모두 판정 · 3/8 = 37.5% 틀림 → 약함');
 assert.equal(judgeN(8,5,2).weak,false,'8문제 파트: 7문제만 판정이면 아직(파트 전부 필요)');
 assert.equal(judgeN(30,14,6).weak,true,'30문제 파트: 판정 20문제 · 6/20 = 30% → 약함');
 assert.equal(judgeN(30,0,19).weak,false,'30문제 파트: 판정 19문제면 모두 틀려도 아직');
 assert.equal(judgeN(30,15,5).weak,false,'30문제 파트: 5/20 = 25% → 약함 아님');
 assert.equal(PartCheck.WEAK_MIN,20);assert.equal(PartCheck.WEAK_RATE,0.3);
 // 개념 단위(v184 부모 검토): 같은 날 쌍둥이(같은 개념)를 풀었거나 그 해설을 봤으면 이 문제의 풀이도 연습. 쌍둥이를 어제 봤으면 상관없다.
 {const concept=h=>({P:'k',Q:'k'})[h.cardId]||h.cardId;
  const base=[row('p1','P','20','09:00','correct'),row('q1','Q','21','09:00','wrong'),row('p2','P','21','09:10','correct')];
  assert.equal(PartCheck.delayed(base,[],dayOf).get('P'),'correct','문제마다 따로 보면 21일 P 풀이는 판정');
  assert.equal(PartCheck.delayed(base,[],dayOf,concept).has('P'),false,'같은 날 앞서 쌍둥이 Q를 풀었으면 P 풀이는 연습');
  const viewOnly=[row('p1','P','20','09:00','correct'),row('q1','Q','20','09:00','wrong'),row('p2','P','21','09:10','correct')];
  assert.equal(PartCheck.delayed(viewOnly,[{id:'q1',openedAt:T('21','09:05')}],dayOf,concept).has('P'),false,'쌍둥이 해설을 같은 날 읽고 푼 풀이 → 연습');
  assert.equal(PartCheck.delayed(viewOnly,[{id:'q1',openedAt:T('20','09:05')}],dayOf,concept).get('P'),'correct','쌍둥이 해설을 어제 읽었으면 → 판정');
  assert.equal(PartCheck.delayed(viewOnly,[{id:'q1',openedAt:T('21','09:20')}],dayOf,concept).get('P'),'correct','쌍둥이 해설을 풀이 뒤에 읽었으면 → 판정');
  assert.equal(PartCheck.delayed(viewOnly,[],dayOf,h=>h.cardId==='Q'?'k':h.cardId).get('P'),'correct','다른 개념이면 상관없다');}
}

// ── 2) 파트 범위
require('./study-review-catalog.js');require('./practice-bank.js');require('./quiz-options.js');const PARTS=require('./parts.js');
const CAT=globalThis.STUDY_REVIEW_CATALOG,BANK=globalThis.PRACTICE_BANK,QO=globalThis.QUIZ_OPTIONS;
const counts={};
// 정보보호론 · 컴퓨터일반(2026-09-25~): 자체 제작 문제가 없어 9급 기출(gichul-<회차>-NN)을 주제로 나눈 파트. 과목의 앱 기출 전부가 정확히 한 파트에.
require('./gichul-index.js');
const GICHUL_SUBJECTS=['정보보호론','컴퓨터일반'];
const gichulIdsOf=subject=>{const idx=globalThis.GICHUL_INDEX,code=Object.entries(idx.subjects).find(([,v])=>v===subject)[0],ids=[];
 for(const row of idx.papers.filter(p=>p.id.endsWith('-'+code))){const skip=row.skip||[];for(let n=1;n<=20;n++)if(!skip.includes(n))ids.push('gichul-'+row.id+'-'+String(n).padStart(2,'0'));}return ids;};
const itCounts={};
{
 const seen=new Map(),partIds=new Set();
 for(const s of GICHUL_SUBJECTS){const us=PARTS.unitsFor(s).filter(u=>!u.scope.topic);if(!us.length)continue;const all=gichulIdsOf(s),inParts=us.flatMap(u=>u.parts.flatMap(p=>p.ids));
  assert.deepEqual([...inParts].sort(),[...all].sort(),s+': 앱 기출 전부가 정확히 한 파트에');assert.equal(new Set(inParts).size,inParts.length,s+' 기출이 두 파트에');
  for(const u of us){assert.deepEqual(u.scope,{topic:'',round:''},u.id+' 단원 범위는 비움(파트 · 과목 전체로만 연다)');
   for(const p of u.parts){assert.match(p.id,/^[a-z0-9-]+$/);assert.ok(!partIds.has(p.id),'파트 id 중복 '+p.id);partIds.add(p.id);assert.ok(p.ids.length,'빈 파트 '+p.id);assert.ok(!/기타/.test(p.title),'기타 파트 없음: '+p.title);
    for(const id of p.ids){assert.ok(!seen.has(id));seen.set(id,p.id);assert.equal(PARTS.partOf(id),p.id);assert.match(id,/^gichul-/);}}}
  itCounts[s]=us.reduce((n,u)=>n+u.parts.length,0)+'파트 '+inParts.length+'문제';}
 for(const u of PARTS.units){
  if(GICHUL_SUBJECTS.includes(u.subject)&&!u.scope.topic)continue;
  assert.ok(['한국사','영어','국어','컴퓨터일반'].includes(u.subject),u.id);
  const expected=u.subject==='한국사'?CAT.lectures.find(l=>'lecture-'+l.id===u.scope.round).ids:Object.keys(BANK).filter(id=>BANK[id].topic===u.scope.topic);
  assert.ok(expected.length,u.id+' 범위가 비어 있다');
  const inParts=u.parts.flatMap(p=>p.ids);
  for(const p of u.parts){
   assert.match(p.id,/^[a-z0-9-]+$/);assert.ok(!partIds.has(p.id),'파트 id 중복 '+p.id);partIds.add(p.id);
   assert.ok(('part-'+p.id).length<=80,'범위 이름이 동기화 한도(80자) 안');assert.ok(p.ids.length,'빈 파트 '+p.id);
   assert.ok(!/기타/.test(p.title),'기타 파트 없음: '+p.title);
   for(const id of p.ids){assert.ok(!seen.has(id),id+' 가 두 파트에 있다: '+seen.get(id)+' · '+p.id);seen.set(id,p.id);assert.equal(PARTS.partOf(id),p.id);
    assert.ok(QO[id]||BANK[id]?.variants.length===1,id+'는 문제 하나');}
  }
  assert.deepEqual([...inParts].sort(),[...expected].sort(),u.id+': 범위의 모든 문제가 정확히 한 파트에');
  counts[u.short]=u.parts.length;
 }
 for(const l of CAT.lectures)assert.ok(PARTS.units.some(u=>u.scope.round==='lecture-'+l.id),'한국사 '+l.title+'에 파트가 있다');
 for(const t of ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7','Day 8','Day 9','Day 10','Day 11','Day 12','Day 13','Day 14','Day 15','문법 공식 훈련','논리 1장','논리 2장','논리 3장','논리 4장','논리 5장','논리 6장','독해 1장','독해 2장','독해 3장','문법 1장','문법 2장','문법 3장','공문서 1장','공문서 2장','공문서 3장','어휘 1장','어휘 2장'])assert.ok(PARTS.units.some(u=>u.scope.topic===t),t+'에 파트가 있다');
 // 2026-10-05 국어 문법(핵심 20): 규칙 정리 하나가 파트 하나(장마다 5파트), 독해 3장 다음에 장 순서대로. 2026-10-07 더 풀기를 더해 89 · 91문제(파트는 그대로).
 {const g1=PARTS.units.find(u=>u.id==='ko-kg1'),g2=PARTS.units.find(u=>u.id==='ko-kg2');
  assert.deepEqual(g1.parts.map(p=>p.title),['음운과 음절','국어 음운의 체계','음운 변동의 갈래와 개수','교체','탈락 · 축약 · 첨가']);
  assert.deepEqual(g2.parts.map(p=>p.title),['형태소 · 단어 · 어절','품사 분류와 체언 · 수식언','용언','조사와 품사의 통용','단어의 형성']);
  for(const [u,k] of [[g1,89],[g2,91]]){assert.equal(u.parts.reduce((n,p)=>n+p.ids.length,0),k,u.id+' 문제 수');assert.ok(u.parts.every(p=>p.ids.length>=8),u.id+' 파트마다 8문제 이상');}
  const ids=PARTS.units.map(u=>u.id);assert.equal(ids.indexOf('ko-kg1'),ids.indexOf('ko-kr3')+1,'독해 3장 다음에 문법 1장');assert.equal(ids.indexOf('ko-kg2'),ids.indexOf('ko-kg1')+1,'문법 1장 다음에 2장');
  // 2026-10-07 국어 묶음: 문법 2장 다음에 문법 3장 · 공문서 수정 1~3장 · 어휘 1~2장, 규칙 정리 하나가 파트 하나.
  {let prev='ko-kg2';for(const s of [{"unit":"ko-kg3","n":149,"parts":["문장 성분","서술어의 자릿수","홑문장과 겹문장","사동 표현과 피동 표현","높임 표현"]},{"unit":"ko-kd1","n":103,"parts":["문장 성분의 호응","성분의 생략과 대등한 연결","꾸미는 말 · 명사화 · 번역 투","조사 · 어미와 피동 · 사동","원칙에 따라 공문서 고치기"]},{"unit":"ko-kd2","n":87,"parts":["마침표 · 물음표 · 느낌표","쉼표 · 가운뎃점 · 쌍점 · 빗금","따옴표와 괄호","낫표 · 화살괄호와 그 밖의 부호"]},{"unit":"ko-kd3","n":184,"parts":["두음 법칙의 표기","사이시옷의 표기","준말의 표기","꼴이 비슷한 어미와 조사","띄어쓰기","외래어 표기와 다듬은 말","중의적 표현과 잉여적 표현"]},{"unit":"ko-kv1","n":112,"parts":["발음이 비슷한 한자어 ①","발음이 비슷한 한자어 ②","발음이 비슷한 한자어 ③","문맥에 맞는 낱말 ①","문맥에 맞는 낱말 ②","문맥에 맞는 낱말 ③"]},{"unit":"ko-kv2","n":205,"parts":["한자 어휘 ① 각광 ~ 난마","한자 어휘 ② 난항 ~ 미봉책","한자 어휘 ③ 미상불 ~ 사족","한자 어휘 ④ 서광 ~ 유기","한자 어휘 ⑤ 유명세 ~ 천착","한자 어휘 ⑥ 초미 ~ 흉금","지문 속 낱말 바꿔 쓰기"]}]){const u=PARTS.units.find(x=>x.id===s.unit);assert.ok(u,s.unit);assert.deepEqual(u.parts.map(p=>p.title),s.parts,s.unit+' 파트');
    assert.equal(u.parts.reduce((n,p)=>n+p.ids.length,0),s.n,s.unit+' 문제 수');assert.ok(u.parts.every(p=>p.ids.length>=8),s.unit+' 파트마다 8문제 이상');assert.equal(ids.indexOf(s.unit),ids.indexOf(prev)+1,prev+' 다음에 '+s.unit);prev=s.unit;}}}
 const h19=PARTS.units.find(u=>u.id==='hist-19');assert.equal(h19.parts.length,8);assert.equal(h19.parts.reduce((n,p)=>n+p.ids.length,0),115);
 // 2026-09-23 20강 조선 전기(문화 I): facts.cjs 묶음 15개 → 8파트, 99문제. 파트마다 8문제 이상이고 문제는 정답이 묻는 사실(첫 사실)의 묶음을 따른다.
 const h20=PARTS.units.find(u=>u.id==='hist-20');assert.equal(h20.title,'20강 조선 전기(문화 I)');
 // 2026-09-24 보충 파트 '이름이 비슷한 향교·유향소·향약·향도'(9문제, 여러 강 사실을 가르는 문제라 따로)를 교육 기관 파트 뒤에 둔다.
 assert.deepEqual(h20.parts.map(p=>p.title),['성균관·4부 학당·향교','서원·서당','이름이 비슷한 향교·유향소·향약·향도','성리학의 발달과 이황','이이·학파와 붕당','불교와 도교','역사서·실록·승정원일기','지도·지리서','의례서·법전·음악']);
 assert.equal(h20.parts.reduce((n,p)=>n+p.ids.length,0),108);assert.ok(h20.parts.every(p=>p.ids.length>=8),'20강 파트마다 8문제 이상');
 // 2026-09-24 21강 조선 전기(문화 II): facts.cjs 묶음 11개 → 8파트, 94문제(8문제 미만 묶음은 이웃과 합침). 문제는 정답이 묻는 사실(첫 사실)의 묶음을 따른다.
 const h21=PARTS.units.find(u=>u.id==='hist-21');assert.equal(h21.title,'21강 조선 전기(문화 II)');
 assert.deepEqual(h21.parts.map(p=>p.title),['인쇄술·제지술과 병서·무기','천문학과 과학 기구','역법·의학·농서','훈민정음','궁궐·종묘·장경판전·원각사지','서원 건축과 대표 서원','분청사기·백자와 그림','문학과 글씨']);
 assert.equal(h21.parts.reduce((n,p)=>n+p.ids.length,0),94);assert.ok(h21.parts.every(p=>p.ids.length>=8),'21강 파트마다 8문제 이상');
 // 2026-09-27 22강 조선 후기(정치): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 6개를 2파트로(파트 점검 5 + 3 = 8문제가 되게 파트마다 8문제 이상). 21강 다음 · 특강 앞.
 const h22=PARTS.units.find(u=>u.id==='hist-22');assert.equal(h22.title,'22강 조선 후기(정치)');assert.equal(h22.scope.round,'lecture-22');
 assert.deepEqual(h22.parts.map(p=>p.id),['h22-1','h22-2']);assert.deepEqual(h22.parts.map(p=>p.title),['붕당 정치와 예송·환국','탕평 정치와 세도 정치']);
 assert.deepEqual(h22.parts.map(p=>p.ids.length),[8,12]);assert.ok(h22.parts.every(p=>p.ids.length>=8),'22강 파트마다 8문제 이상');
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-22'),hi.indexOf('hist-21')+1);assert.equal(hi.indexOf('hist-23'),hi.indexOf('hist-22')+1);}
 // 2026-09-28 23강 조선 후기(조직, 외교): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 7개를 2파트로(파트마다 8문제 이상). 22강 다음 · 특강 앞.
 const h23=PARTS.units.find(u=>u.id==='hist-23');assert.equal(h23.title,'23강 조선 후기(조직, 외교)');assert.equal(h23.scope.round,'lecture-23');
 assert.deepEqual(h23.parts.map(p=>p.id),['h23-1','h23-2']);assert.deepEqual(h23.parts.map(p=>p.title),['비변사와 군사 제도','청·일본과의 관계와 간도·독도']);
 assert.deepEqual(h23.parts.map(p=>p.ids.length),[8,12]);assert.ok(h23.parts.every(p=>p.ids.length>=8),'23강 파트마다 8문제 이상');
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-24'),hi.indexOf('hist-23')+1);}
 // 2026-09-28 24강 조선 후기(경제): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 6개를 2파트로(파트마다 8문제 이상). 23강 다음 · 특강 앞.
 const h24=PARTS.units.find(u=>u.id==='hist-24');assert.equal(h24.title,'24강 조선 후기(경제)');assert.equal(h24.scope.round,'lecture-24');
 assert.deepEqual(h24.parts.map(p=>p.id),['h24-1','h24-2']);assert.deepEqual(h24.parts.map(p=>p.title),['수취 체제와 농촌 경제','상업·화폐·수공업과 광업']);
 assert.deepEqual(h24.parts.map(p=>p.ids.length),[8,12]);assert.ok(h24.parts.every(p=>p.ids.length>=8),'24강 파트마다 8문제 이상');
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-25'),hi.indexOf('hist-24')+1);}
 // 2026-09-28 25강 조선 후기(사회): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 8개를 2파트로(파트마다 8문제 이상). 24강 다음 · 특강 앞.
 const h25=PARTS.units.find(u=>u.id==='hist-25');assert.equal(h25.title,'25강 조선 후기(사회)');assert.equal(h25.scope.round,'lecture-25');
 assert.deepEqual(h25.parts.map(p=>p.id),['h25-1','h25-2']);assert.deepEqual(h25.parts.map(p=>p.title),['신분제의 동요와 향촌 질서','천주교·동학과 농민 봉기']);
 assert.deepEqual(h25.parts.map(p=>p.ids.length),[8,12]);assert.ok(h25.parts.every(p=>p.ids.length>=8),'25강 파트마다 8문제 이상');
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-26'),hi.indexOf('hist-25')+1);}
 // 2026-09-30 26강 조선 후기(문화 1): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 8개를 2파트로(파트마다 8문제 이상). 25강 다음 · 특강 앞.
 const h26=PARTS.units.find(u=>u.id==='hist-26');assert.equal(h26.title,'26강 조선 후기(문화 1)');assert.equal(h26.scope.round,'lecture-26');
 assert.deepEqual(h26.parts.map(p=>p.id),['h26-1','h26-2']);assert.deepEqual(h26.parts.map(p=>p.title),['성리학·양명학과 농업 중심 개혁론','상공업 중심 개혁론과 국학']);
 assert.deepEqual(h26.parts.map(p=>p.ids.length),[8,12]);assert.ok(h26.parts.every(p=>p.ids.length>=8),'26강 파트마다 8문제 이상');
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-27'),hi.indexOf('hist-26')+1);}
 // 2026-09-30 27강 조선 후기(문화 2): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 7개를 2파트로(파트마다 8문제 이상). 26강 다음 · 특강 앞.
 const h27=PARTS.units.find(u=>u.id==='hist-27');assert.equal(h27.title,'27강 조선 후기(문화 2)');assert.equal(h27.scope.round,'lecture-27');
 assert.deepEqual(h27.parts.map(p=>p.id),['h27-1','h27-2']);assert.deepEqual(h27.parts.map(p=>p.title),['서양 문물·과학 기술과 공예·건축','서민 문화와 예술']);
 assert.deepEqual(h27.parts.map(p=>p.ids.length),[8,12]);assert.ok(h27.parts.every(p=>p.ids.length>=8),'27강 파트마다 8문제 이상');
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-28'),hi.indexOf('hist-27')+1);}
 // 2026-09-30 28강 개항기(흥선 대원군): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 5개를 2파트로(파트마다 8문제 이상). 27강 다음 · 특강 앞.
 const h28=PARTS.units.find(u=>u.id==='hist-28');assert.equal(h28.title,'28강 개항기(흥선 대원군)');assert.equal(h28.scope.round,'lecture-28');
 assert.deepEqual(h28.parts.map(p=>p.id),['h28-1','h28-2']);assert.deepEqual(h28.parts.map(p=>p.title),['흥선 대원군의 개혁 정치','통상 수교 거부 정책과 양요']);
 assert.deepEqual(h28.parts.map(p=>p.ids.length),[11,9]);assert.ok(h28.parts.every(p=>p.ids.length>=8),'28강 파트마다 8문제 이상');
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-29'),hi.indexOf('hist-28')+1);}
 // 2026-09-30 29강 개항기(개항 ~ 갑신정변): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 5개를 2파트로(파트마다 8문제 이상). 28강 다음 · 특강 앞.
 const h29=PARTS.units.find(u=>u.id==='hist-29');assert.equal(h29.title,'29강 개항기(개항 ~ 갑신정변)');assert.equal(h29.scope.round,'lecture-29');
 assert.deepEqual(h29.parts.map(p=>p.id),['h29-1','h29-2']);assert.deepEqual(h29.parts.map(p=>p.title),['강화도 조약과 개화 정책','위정척사 운동 · 임오군란 · 갑신정변']);
 assert.deepEqual(h29.parts.map(p=>p.ids.length),[8,12]);assert.ok(h29.parts.every(p=>p.ids.length>=8),'29강 파트마다 8문제 이상');
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-30'),hi.indexOf('hist-29')+1);}
 // 2026-09-30 30강 개항기(동학 농민 운동 ~ 대한 제국): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 6개를 2파트로(파트마다 8문제 이상). 29강 다음 · 특강 앞.
 const h30=PARTS.units.find(u=>u.id==='hist-30');assert.equal(h30.title,'30강 개항기(동학 농민 운동 ~ 대한 제국)');assert.equal(h30.scope.round,'lecture-30');
 assert.deepEqual(h30.parts.map(p=>p.id),['h30-1','h30-2']);assert.deepEqual(h30.parts.map(p=>p.title),['동학 농민 운동과 갑오개혁','을미개혁 · 독립 협회 · 대한 제국']);
 assert.deepEqual(h30.parts.map(p=>p.ids.length),[9,11]);assert.ok(h30.parts.every(p=>p.ids.length>=8),'30강 파트마다 8문제 이상');
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-31'),hi.indexOf('hist-30')+1);}
 // 2026-09-30 31강 국권 피탈과 저항: 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 4개를 2파트로(파트마다 8문제 이상). 30강 다음 · 특강 앞.
 const h31=PARTS.units.find(u=>u.id==='hist-31');assert.equal(h31.title,'31강 국권 피탈과 저항');assert.equal(h31.scope.round,'lecture-31');
 assert.deepEqual(h31.parts.map(p=>p.id),['h31-1','h31-2']);assert.deepEqual(h31.parts.map(p=>p.title),['일제의 국권 침탈 과정','애국 계몽 운동 · 의병 · 의거']);
 assert.deepEqual(h31.parts.map(p=>p.ids.length),[9,11]);assert.ok(h31.parts.every(p=>p.ids.length>=8),'31강 파트마다 8문제 이상');
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-32'),hi.indexOf('hist-31')+1);}
 // 2026-10-05 38강 현대(광복 ~ 6·25 전쟁): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 4개를 2파트로(파트마다 8문제 이상). 교재 번호 순서 자리(31강 다음 · 특강 앞).
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-32'),hi.indexOf('hist-31')+1);assert.equal(hi.indexOf('hist-39'),hi.indexOf('hist-38')+1);}
 // 2026-10-05 39강 현대(민주주의의 발전): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 4개를 2파트로(파트마다 8문제 이상). 교재 번호 순서 자리(38강 다음 · 특강 앞).
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-39'),hi.indexOf('hist-38')+1);assert.equal(hi.indexOf('hist-40'),hi.indexOf('hist-39')+1);}
 // 2026-10-05 40강 현대(경제 발전과 통일 정책): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 3개를 2파트로(파트마다 8문제 이상). 교재 번호 순서 자리(39강 다음 · 특강 앞).
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-40'),hi.indexOf('hist-39')+1);assert.equal(hi.indexOf('hist-28-40'),hi.indexOf('hist-40')+1);}
 // 2026-10-05 28~40강 근대 순서 훈련: 30문제(28~40강 사건 순서) → 3파트(① 흥선 대원군 ~ 국권 피탈 · ② 일제 강점기 · ③ 광복 이후, 파트마다 8문제 이상). 40강 다음 · 특강 앞.
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-28-40'),hi.indexOf('hist-40')+1);assert.equal(hi.indexOf('hist-250'),hi.indexOf('hist-28-40')+1);}
 const h2840=PARTS.units.find(u=>u.id==='hist-28-40');assert.equal(h2840.title,'28~40강 근대 순서 훈련');assert.equal(h2840.scope.round,'lecture-28-40');
 assert.deepEqual(h2840.parts.map(p=>p.id),['h2840-1','h2840-2','h2840-3']);assert.deepEqual(h2840.parts.map(p=>p.title),['근대 사건 순서 ① 흥선 대원군 ~ 국권 피탈','근대 사건 순서 ② 일제 강점기','근대 사건 순서 ③ 광복 이후']);
 assert.deepEqual(h2840.parts.map(p=>p.ids.length),[13,9,8]);assert.ok(h2840.parts.every(p=>p.ids.length>=8),'근대 순서 훈련 파트마다 8문제 이상');
 const h40=PARTS.units.find(u=>u.id==='hist-40');assert.equal(h40.title,'40강 현대(경제 발전과 통일 정책)');assert.equal(h40.scope.round,'lecture-40');
 assert.deepEqual(h40.parts.map(p=>p.id),['h40-1','h40-2']);assert.deepEqual(h40.parts.map(p=>p.title),['경제 성장과 사회 변화','통일을 위한 노력']);
 assert.deepEqual(h40.parts.map(p=>p.ids.length),[12,8]);assert.ok(h40.parts.every(p=>p.ids.length>=8),'40강 파트마다 8문제 이상');
 const h39=PARTS.units.find(u=>u.id==='hist-39');assert.equal(h39.title,'39강 현대(민주주의의 발전)');assert.equal(h39.scope.round,'lecture-39');
 assert.deepEqual(h39.parts.map(p=>p.id),['h39-1','h39-2']);assert.deepEqual(h39.parts.map(p=>p.title),['이승만 · 장면 · 박정희 정부','신군부와 민주화 이후']);
 assert.deepEqual(h39.parts.map(p=>p.ids.length),[12,8]);assert.ok(h39.parts.every(p=>p.ids.length>=8),'39강 파트마다 8문제 이상');
 // 2026-10-05 32강 개항기(경제): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 4개를 2파트로(파트마다 8문제 이상). 교재 번호 순서 자리(31강 다음 · 38강 앞).
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-32'),hi.indexOf('hist-31')+1);assert.equal(hi.indexOf('hist-33'),hi.indexOf('hist-32')+1);}
 // 2026-10-05 33강 개항기(문화): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 4개를 2파트로(파트마다 8문제 이상). 교재 번호 순서 자리(32강 다음 · 38강 앞).
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-33'),hi.indexOf('hist-32')+1);assert.equal(hi.indexOf('hist-34'),hi.indexOf('hist-33')+1);}
 // 2026-10-05 34강 일제 강점기(식민 통치): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 3개를 2파트로(파트마다 8문제 이상). 교재 번호 순서 자리(33강 다음 · 38강 앞).
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-34'),hi.indexOf('hist-33')+1);assert.equal(hi.indexOf('hist-35'),hi.indexOf('hist-34')+1);}
 // 2026-10-05 35강 일제 강점기(1910년대 저항): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 3개를 2파트로(파트마다 8문제 이상). 교재 번호 순서 자리(34강 다음 · 38강 앞).
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-35'),hi.indexOf('hist-34')+1);assert.equal(hi.indexOf('hist-36'),hi.indexOf('hist-35')+1);}
 // 2026-10-05 36강 일제 강점기(1920년대 저항): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 4개를 2파트로(파트마다 8문제 이상). 교재 번호 순서 자리(35강 다음 · 38강 앞).
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-36'),hi.indexOf('hist-35')+1);assert.equal(hi.indexOf('hist-37'),hi.indexOf('hist-36')+1);}
 // 2026-10-05 37강 일제 강점기(1930년대 이후 저항): 기출 빈도 상위 20문제(사용자 요청) → facts.cjs 묶음 4개를 2파트로(파트마다 8문제 이상). 교재 번호 순서 자리(36강 다음 · 38강 앞).
 {const hi=PARTS.units.map(u=>u.id);assert.equal(hi.indexOf('hist-37'),hi.indexOf('hist-36')+1);assert.equal(hi.indexOf('hist-38'),hi.indexOf('hist-37')+1);}
 const h37=PARTS.units.find(u=>u.id==='hist-37');assert.equal(h37.title,'37강 일제 강점기(1930년대 이후 저항)');assert.equal(h37.scope.round,'lecture-37');
 assert.deepEqual(h37.parts.map(p=>p.id),['h37-1','h37-2']);assert.deepEqual(h37.parts.map(p=>p.title),['의열 투쟁과 무장 독립 전쟁','민족 문화 수호와 건국 준비']);
 assert.deepEqual(h37.parts.map(p=>p.ids.length),[8,12]);assert.ok(h37.parts.every(p=>p.ids.length>=8),'37강 파트마다 8문제 이상');
 const h36=PARTS.units.find(u=>u.id==='hist-36');assert.equal(h36.title,'36강 일제 강점기(1920년대 저항)');assert.equal(h36.scope.round,'lecture-36');
 assert.deepEqual(h36.parts.map(p=>p.id),['h36-1','h36-2']);assert.deepEqual(h36.parts.map(p=>p.title),['실력 양성 · 사회 운동과 신간회','의열 투쟁 · 민족 문화와 무장 독립 전쟁']);
 assert.deepEqual(h36.parts.map(p=>p.ids.length),[11,9]);assert.ok(h36.parts.every(p=>p.ids.length>=8),'36강 파트마다 8문제 이상');
 const h35=PARTS.units.find(u=>u.id==='hist-35');assert.equal(h35.title,'35강 일제 강점기(1910년대 저항)');assert.equal(h35.scope.round,'lecture-35');
 assert.deepEqual(h35.parts.map(p=>p.id),['h35-1','h35-2']);assert.deepEqual(h35.parts.map(p=>p.title),['국외 독립운동 기지와 비밀 결사','3·1 운동과 대한민국 임시 정부']);
 assert.deepEqual(h35.parts.map(p=>p.ids.length),[9,11]);assert.ok(h35.parts.every(p=>p.ids.length>=8),'35강 파트마다 8문제 이상');
 const h34=PARTS.units.find(u=>u.id==='hist-34');assert.equal(h34.title,'34강 일제 강점기(식민 통치)');assert.equal(h34.scope.round,'lecture-34');
 assert.deepEqual(h34.parts.map(p=>p.id),['h34-1','h34-2']);assert.deepEqual(h34.parts.map(p=>p.title),['무단 통치와 문화 통치','민족 말살 통치와 전시 수탈']);
 assert.deepEqual(h34.parts.map(p=>p.ids.length),[12,8]);assert.ok(h34.parts.every(p=>p.ids.length>=8),'34강 파트마다 8문제 이상');
 const h33=PARTS.units.find(u=>u.id==='hist-33');assert.equal(h33.title,'33강 개항기(문화)');assert.equal(h33.scope.round,'lecture-33');
 assert.deepEqual(h33.parts.map(p=>p.id),['h33-1','h33-2']);assert.deepEqual(h33.parts.map(p=>p.title),['언론과 근대 문물','근대 교육과 국학 · 종교']);
 assert.deepEqual(h33.parts.map(p=>p.ids.length),[9,11]);assert.ok(h33.parts.every(p=>p.ids.length>=8),'33강 파트마다 8문제 이상');
 const h32=PARTS.units.find(u=>u.id==='hist-32');assert.equal(h32.title,'32강 개항기(경제)');assert.equal(h32.scope.round,'lecture-32');
 assert.deepEqual(h32.parts.map(p=>p.id),['h32-1','h32-2']);assert.deepEqual(h32.parts.map(p=>p.title),['열강의 경제 침탈','경제적 구국 운동']);
 assert.deepEqual(h32.parts.map(p=>p.ids.length),[12,8]);assert.ok(h32.parts.every(p=>p.ids.length>=8),'32강 파트마다 8문제 이상');
 const h38=PARTS.units.find(u=>u.id==='hist-38');assert.equal(h38.title,'38강 현대(광복 ~ 6·25 전쟁)');assert.equal(h38.scope.round,'lecture-38');
 assert.deepEqual(h38.parts.map(p=>p.id),['h38-1','h38-2']);assert.deepEqual(h38.parts.map(p=>p.title),['광복과 대한민국 정부 수립','제헌 국회의 활동과 6·25 전쟁']);
 assert.deepEqual(h38.parts.map(p=>p.ids.length),[10,10]);assert.ok(h38.parts.every(p=>p.ids.length>=8),'38강 파트마다 8문제 이상');
 // 2026-09-24 주제 특강(250쪽 세시 풍속 · 252~256쪽 근·현대 인물): facts.cjs 묶음 13개 = 13파트, 552문제. 문제는 정답이 묻는 사실(첫 사실)의 묶음을 따른다.
 // 2026-09-27 두 강으로 나눔(hist-250 세시 풍속 2파트 · hist-252-256 근·현대 인물 11파트) — 파트 id는 옛 h250256-1~13 그대로.
 const hss=PARTS.units.find(u=>u.id==='hist-250'),hpp=PARTS.units.find(u=>u.id==='hist-252-256');assert.ok(!PARTS.units.some(u=>u.id==='hist-250-256'));
 assert.equal(hss.title,'특강 세시 풍속');assert.equal(hpp.title,'특강 근·현대 인물');assert.equal(hss.scope.round,'lecture-250');assert.equal(hpp.scope.round,'lecture-252-256');
 assert.equal(hss.parts.reduce((n,p)=>n+p.ids.length,0),134);assert.equal(hpp.parts.reduce((n,p)=>n+p.ids.length,0),418);
 const hsp={parts:[...hss.parts,...hpp.parts]};assert.deepEqual(hsp.parts.map(p=>p.id),Array.from({length:13},(_,i)=>'h250256-'+(i+1)));
 assert.deepEqual(hsp.parts.map(p=>p.title),['세시 풍속 ① 설날~유두','세시 풍속 ② 칠석~섣달그믐','개화파와 개항기 인물','동학·위정척사·의병','독립 협회·애국 계몽·헤이그 특사','한국을 도운 외국인','국외 독립운동 기지','의거와 의열 투쟁','독립군과 한국 광복군','여성 독립운동가','임시 정부와 광복 전후','국학·역사학·민족 종교','문학·예술·문화 운동']);
 assert.equal(hsp.parts.reduce((n,p)=>n+p.ids.length,0),552);assert.ok(hsp.parts.every(p=>p.ids.length>=8),'주제 특강 파트마다 8문제 이상');
 // 2026-09-24 영어 Day 6·7(v151): 규칙 정리 10개·7개 → 8파트·7파트, 자체 제작만(교재 문장 문제 없음). 파트마다 8문제 이상.
 const d6=PARTS.units.find(u=>u.id==='en-day6'),d7=PARTS.units.find(u=>u.id==='en-day7');
 assert.deepEqual(d6.parts.map(p=>p.title),['문장 구조와 동사','보어·목적격보어와 태','조동사','명사·대명사와 도치','준동사','분사구문','비교','접속사·관계사']);
 assert.deepEqual(d7.parts.map(p=>p.title),['동사 뒤의 형태','시제와 가정법','수 일치와 명사','꾸미는 말','간접의문문·관계사절','강조와 병렬','비교·부정·차이']);
 assert.equal(d6.parts.reduce((n,p)=>n+p.ids.length,0),220);assert.equal(d7.parts.reduce((n,p)=>n+p.ids.length,0),240);
 assert.ok([...d6.parts,...d7.parts].every(p=>p.ids.length>=8),'Day 6·7 파트마다 8문제 이상');
 assert.ok([...d6.parts,...d7.parts].every(p=>p.ids.every(id=>/^en-day[67]-\d{3}$/.test(id))),'Day 6·7 파트는 자체 제작 문제만');
 {const u=PARTS.units.map(u=>u.id),i=u.indexOf('en-day5');assert.deepEqual(u.slice(i,i+12),['en-day5','en-day6','en-day7','en-day8','en-day9','en-day10','en-day11','en-day12','en-day13','en-day14','en-day15','en-formula'],'Day 5 → Day 6 → Day 7 → Day 8 · 9 · 10 → 공식 훈련 순서');}
 // 2026-10-07 영어 Day 15(WEEK 03 실전문제 연습): 규칙 정리 하나가 파트 하나(5파트), 93문제(핵심 20 + 더 풀기 73), 자체 제작만.
 {const u=PARTS.units.find(x=>x.id==='en-day15');assert.deepEqual(u.parts.map(p=>p.title),["태와 동사 꼴","시제와 조동사","어순과 절","수 일치와 병렬","부정과 관용 표현"],'en-day15 파트');assert.equal(u.parts.reduce((n,p)=>n+p.ids.length,0),93,'en-day15 문제 수');
  assert.ok(u.parts.every(p=>p.ids.length>=2&&p.ids.every(id2=>/^en-day15-\d{3}$/.test(id2))),'en-day15 파트는 자체 제작 문제만');}
 // 2026-10-07 영어 Day 14(WEEK 03 실전문제 연습): 규칙 정리 하나가 파트 하나(5파트), 91문제(핵심 20 + 더 풀기 71), 자체 제작만.
 {const u=PARTS.units.find(x=>x.id==='en-day14');assert.deepEqual(u.parts.map(p=>p.title),["태와 시제","동사 뒤의 꼴","관용 표현","어순과 절","수 일치와 분사"],'en-day14 파트');assert.equal(u.parts.reduce((n,p)=>n+p.ids.length,0),91,'en-day14 문제 수');
  assert.ok(u.parts.every(p=>p.ids.length>=2&&p.ids.every(id2=>/^en-day14-\d{3}$/.test(id2))),'en-day14 파트는 자체 제작 문제만');}
 // 2026-10-07 영어 Day 13(WEEK 03 실전문제 연습): 규칙 정리 하나가 파트 하나(5파트), 80문제(핵심 20 + 더 풀기 60), 자체 제작만.
 {const u=PARTS.units.find(x=>x.id==='en-day13');assert.deepEqual(u.parts.map(p=>p.title),["to부정사의 쓰임","비교와 가정","어순","전치사 꼴과 수동태","한정사와 부사"],'en-day13 파트');assert.equal(u.parts.reduce((n,p)=>n+p.ids.length,0),80,'en-day13 문제 수');
  assert.ok(u.parts.every(p=>p.ids.length>=2&&p.ids.every(id2=>/^en-day13-\d{3}$/.test(id2))),'en-day13 파트는 자체 제작 문제만');}
 // 2026-10-07 영어 Day 12(WEEK 03 실전문제 연습): 규칙 정리 하나가 파트 하나(5파트), 83문제(핵심 20 + 더 풀기 63), 자체 제작만.
 {const u=PARTS.units.find(x=>x.id==='en-day12');assert.deepEqual(u.parts.map(p=>p.title),["시제와 때 표현","가정법과 조동사","동사와 목적어","수동태와 준동사","수량 표현과 절"],'en-day12 파트');assert.equal(u.parts.reduce((n,p)=>n+p.ids.length,0),83,'en-day12 문제 수');
  assert.ok(u.parts.every(p=>p.ids.length>=2&&p.ids.every(id2=>/^en-day12-\d{3}$/.test(id2))),'en-day12 파트는 자체 제작 문제만');}
 // 2026-10-07 영어 Day 11(WEEK 03 실전문제 연습): 규칙 정리 하나가 파트 하나(5파트), 83문제(핵심 20 + 더 풀기 63), 자체 제작만.
 {const u=PARTS.units.find(x=>x.id==='en-day11');assert.deepEqual(u.parts.map(p=>p.title),["동사 자리와 대동사","조동사와 가정법","동명사와 to부정사","접속사와 관계부사","형용사·대명사·보어"],'en-day11 파트');assert.equal(u.parts.reduce((n,p)=>n+p.ids.length,0),83,'en-day11 문제 수');
  assert.ok(u.parts.every(p=>p.ids.length>=2&&p.ids.every(id2=>/^en-day11-\d{3}$/.test(id2))),'en-day11 파트는 자체 제작 문제만');}
 // 2026-10-05 영어 Day 8 · 9 · 10(v204, 핵심 20): 규칙 정리 하나가 파트 하나(5 · 6 · 6파트), 자체 제작만. 2026-10-07 더 풀기를 더해 단원마다 89 · 88 · 86문제(파트는 그대로).
 {const want={'en-day8':['동사 뒤의 꼴','시제','어순','비교','꾸미는 말과 수 일치'],'en-day9':['동사와 태','가정과 당위','절','분사','수 일치와 명사','비교'],'en-day10':['목적격보어와 수동','준동사','시제와 도치','관계사와 대명사','비교와 부정','수량과 used to']};
  for(const [id,titles] of Object.entries(want)){const u=PARTS.units.find(x=>x.id===id);assert.deepEqual(u.parts.map(p=>p.title),titles,id+' 파트');assert.equal(u.parts.reduce((n,p)=>n+p.ids.length,0),{'en-day8':89,'en-day9':88,'en-day10':86}[id],id+' 문제 수');
   assert.ok(u.parts.every(p=>p.ids.length>=2&&p.ids.every(id2=>(id2.startsWith(id+'-')&&id2.length===id.length+4))),id+' 파트는 자체 제작 문제만');}}
}

// ── 3) 앱
function el(tag='div'){
 const node={tag,children:[],attrs:{},dataset:{},classes:new Set(),_text:'',hidden:false,disabled:false,open:false,
  get textContent(){return node._text+node.children.map(c=>c.textContent).join('');},set textContent(v){node._text=String(v);node.children=[];},
  append(...k){node.children.push(...k);},replaceChildren(...k){node.children=k;},
  classList:{add:c=>node.classes.add(c),remove:c=>node.classes.delete(c),toggle:(c,on)=>on?node.classes.add(c):node.classes.delete(c),contains:c=>node.classes.has(c)},
  setAttribute(k,v){node.attrs[k]=v;},getAttribute(k){return node.attrs[k];},focus(){},setSelectionRange(){},addEventListener(){},
  querySelector(sel){return sel==='summary'?el('summary'):null;},querySelectorAll(){return [];},
  get all(){const out=[];(function walk(n){for(const c of n.children){out.push(c);walk(c);}})(node);return out;}};
 return node;
}
const FILES=['scheduler.js','learning.js','core-review-pack.js','quiz-options.js','hanneung-data.js','hanneung-explanations.js','hanneung.js','gichul-index.js','gichul.js','practice-bank.js','practice.js','content-corrections.js','review-record.js','review-policy.js','sync-core.js','study-credit.js','xp.js','score.js','study-review-catalog.js','hanneung-topics.js','topics.js','parts.js','part-check.js','memorize.js','basics.js','core-units.js','app.js'];
const SRC=new Map(FILES.map(f=>[f,fs.readFileSync(__dirname+'/'+f,'utf8')]));
// store를 넘기면 같은 저장소로 앱을 다시 연다(= 새로고침).
function boot(store=new Map()){
 const nodes=new Map();
 const doc={createElement:tag=>el(tag),createTextNode(t){const n=el('#text');n._text=String(t);return n;},body:el('body'),activeElement:null,
  querySelector(sel){if(!nodes.has(sel))nodes.set(sel,el(sel));return nodes.get(sel);},querySelectorAll(){return [];},addEventListener(){}};
 let uid=0;
 const ctx={document:doc,console,
  localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
  crypto:{randomUUID:()=>'id-'+(++uid)+'-'+Math.random().toString(16).slice(2)},
  history:{state:{depth:0},pushState(s){this.state=s;},replaceState(s){this.state=s;}},
  navigator:{},setInterval:()=>1,clearInterval(){},setTimeout:()=>1,clearTimeout(){},structuredClone,addEventListener(){},dispatchEvent(){},scrollTo(){},
  fetch:()=>Promise.reject(Error('no fetch')),
  Date,JSON,Math,Set,Map,Number,String,Object,Array,Error,RegExp,Intl,Promise,Event:class{constructor(t){this.type=t;}}};
 ctx.window=ctx;ctx.self=ctx;vm.createContext(ctx);
 for(const f of FILES)vm.runInContext(SRC.get(f),ctx,{filename:f});
 const run=code=>vm.runInContext(code,ctx);
 const text=sel=>nodes.get(sel)?.textContent||'';
 return {ctx,run,nodes,store,text};
}
const tick=()=>{const t=Date.now();while(Date.now()===t){}};
let app=boot();
const {run}=app;
const R=code=>app.run(code);
// 지금 화면의 문제를 맞히거나(wrong=false) 틀리고, 해설 화면에서 다음 문제로 넘어간다. 푼 문제 id를 돌려준다.
function answer(wrong){
 const quiz=R('data.activePractice.exercise'),id=R('data.activePractice.cardId');
 const input=quiz.type==='choice'?(wrong?(quiz.correctIndex+1)%quiz.choices.length:quiz.correctIndex):(wrong?'zzz':quiz.answers[0]);
 R('answerPractice('+JSON.stringify(id)+','+JSON.stringify(input)+')');
 assert.equal(R('data.quizFeedback.result'),wrong?'wrong':'correct');
 const line=app.text('#orderStatus');
 R("(()=>{const s=structuredClone(data);delete s.quizFeedback;delete s.activePractice;commit(s);render();})()");
 return {id,line};
}
const partOfCard=id=>PARTS.partOf(id);
const onQuestion=()=>R("!!document.querySelector('#card').all.find(n=>n.className==='question')");
const cardText=()=>app.text('#card');
const lecture19=PARTS.units.find(u=>u.id==='hist-19');

// 3-1) 19강 · 파트별 점검 · 모두 맞힘 → 파트마다 5문제, 8파트 = 40문제
// v179: 19강은 '이 강 문제 더 풀기'를 켠 상태로(핵심 20만이면 파트가 1~4문제라 5문제 · 3문제 규칙을 검사할 수 없다 — 접힘 자체는 core20.test).
R("setLectureOpen('19',true)");
R("openScope({subject:'한국사',round:'lecture-19'})");
const countBefore=R("countLine(data.cards.filter(c=>isPlayable(c)&&inCurrent(c)))");
R("setQueueMode('parts')");
assert.equal(R('queueMode()'),'parts');
assert.equal(R("countLine(data.cards.filter(c=>isPlayable(c)&&inCurrent(c)))"),countBefore,'파트별 점검을 골라도 "풀어야 할 문제" 수는 그대로');
assert.match(app.text('#orderStatus'),/^파트 1\/8 · 과전법·수신전·휼양전 · 1\/5$/,'진행 줄: '+app.text('#orderStatus'));
const historyBefore=R('data.history.length');
const served=[];
while(onQuestion()){served.push(answer(false).id);assert.ok(served.length<=200);}
assert.equal(served.length,5*lecture19.parts.length,'모두 맞히면 파트마다 5문제: '+served.length);
lecture19.parts.forEach((p,i)=>assert.ok(served.slice(i*5,i*5+5).every(id=>partOfCard(id)===p.id),'교재 순서대로 한 파트씩: '+p.title));
assert.equal(new Set(served).size,served.length,'한 판에서 같은 문제를 두 번 내지 않는다');
assert.equal(R('data.history.length')-historyBefore,40,'답은 평소처럼 풀이 기록에 남는다');
assert.ok(R("data.history.slice(-40).every(h=>h.mode==='quiz'&&h.result==='correct'&&h.detail)"),'기록 형식은 다른 모드와 같다');
assert.ok(R("data.cards.filter(c=>"+JSON.stringify(served)+".includes(c.id)).every(c=>c.streak===1&&c.due>day())"),'복습 일정도 평소대로(처음 맞힘 → 7일 뒤)');
// 같은 내용이 바로 이어 나오지 않는다(파트 안에 다른 내용이 있을 때)
{const key=id=>R('partKeyOf('+JSON.stringify(id)+')');let back=0;for(let i=1;i<served.length;i++)if(partOfCard(served[i])===partOfCard(served[i-1])&&key(served[i])===key(served[i-1]))back++;assert.ok(back<=2,'같은 사실 연속 '+back);}
let card=cardText();
assert.match(card,/19강 파트 점검 끝/);assert.match(card,/8파트 중 통과 8 · 모두 통과했어요/);assert.match(card,/이번 점검에서 푼 문제 40개 · 맞힌 문제 40개/);
assert.match(card,/나머지 문제는 기본 순서로 이어 풀기/,'끝 화면에서 막히지 않는다');

// 3-2) 새 판 · 첫 파트에서 하나 틀림 → 같은 파트에서 3문제 더 → 모두 맞혀 통과(8문제) → 다음 파트
tick();R("startPartRound(scopeOf(),null)");
const first=lecture19.parts[0].id,round2=[];
round2.push(answer(false),answer(true),answer(false),answer(false));
const fifth=answer(false);round2.push(fifth);
assert.match(fifth.line,/틀린 문제가 있어 3문제 더 풀어요/,'5문제째 해설 화면: '+fifth.line);
assert.match(app.text('#orderStatus'),/^파트 1\/8 · 과전법·수신전·휼양전 · 1\/3 \(틀린 문제가 있어 3문제 더\)$/,app.text('#orderStatus'));
round2.push(answer(false),answer(false));
const eighth=answer(false);round2.push(eighth);
assert.match(eighth.line,/✓ 통과 · 다음 파트: 직전법~녹봉/,eighth.line);
assert.ok(round2.every(x=>partOfCard(x.id)===first),'8문제 모두 첫 파트에서');
assert.equal(partOfCard(R('data.activePractice.cardId')),lecture19.parts[1].id,'통과하면 다음 파트로');
assert.ok(onQuestion(),'틀린 문제가 5분 재시도 대기여도 다음 문제가 바로 나온다');

// 3-3) 새로고침: 같은 저장소로 앱을 다시 열어도 판이 이어진다
answer(false);answer(false);
const store=app.store;app=boot(store);
R("go('quiz','한국사')");
assert.equal(R('storageOK'),true,'모드를 바꾼 뒤 새로고침해도 저장소를 읽는다(v144까지는 QUEUE_MODES 초기화 전 참조로 저장이 멈췄다)');
assert.equal(R('queueMode()'),'parts');
assert.match(app.text('#orderStatus'),/^파트 2\/8 · 직전법~녹봉 · 3\/5$/,'새로고침 뒤 이어서: '+app.text('#orderStatus'));

// 3-4) 파트 하나 범위 · 모두 틀림 → 5 + 3 = 8문제에서 바닥 → 다시 볼 파트 · 끝 화면에 버튼
const weakPart=lecture19.parts.find(p=>p.title==='지대·수취 제도의 문란');assert.equal(weakPart.ids.length,8);
R("openScope({subject:'한국사',round:'part-"+weakPart.id+"'})");tick();R("startPartRound(scopeOf(),null)");
assert.match(R("scopeLabel(scopeOf())"),/^한국사 · 19강 · 지대·수취 제도의 문란$/);
const wrongs=[];while(onQuestion()){const a=answer(true);wrongs.push(a);assert.ok(wrongs.length<=8,'파트 문제 수보다 많이 내지 않는다');}
assert.equal(wrongs.length,8,'모두 틀리면 5 + 3 = 8문제로 파트가 바닥난다');
assert.match(wrongs.at(-1).line,/다시 볼 파트로 표시 · 다음: 점검 결과/);
card=cardText();
assert.match(card,/19강 지대·수취 제도의 문란 파트 점검 끝/);assert.match(card,/1파트 중 통과 0 · 다시 볼 파트: 지대·수취 제도의 문란/);assert.match(card,/다시 볼 파트만 다시 점검하기 \(1파트\)/);
assert.match(card,/다시 보기 · 지대·수취 제도의 문란 · 8문제 중 0개 정답 · 복습 판정 아직/,'점검 결과에 복습 판정(같은 날 풀이뿐이라 아직)');assert.match(card,/복습 판정은 하루 이상 지나 다시 푼 문제만 센 파트 전체 기록이고\(같은 날 해설 보고 푼 건 연습이라 안 넣어요\)/);
// 다시 볼 파트만 다시 점검 → 5문제 모두 맞혀 통과
tick();R("startPartRound(scopeOf(),["+JSON.stringify(weakPart.id)+"])");
let again=0;while(onQuestion()){answer(false);again++;assert.ok(again<=8);}
assert.equal(again,5);assert.match(cardText(),/1파트 중 통과 1 · 모두 통과했어요/);
// 기본 순서로 이어 풀기 → 기본 모드
R("setQueueMode('default')");assert.equal(R('queueMode()'),'default');

// 3-5) 파트가 없는 범위(영어 수일치): 모드는 기본처럼 돌고 알린다 · 파트 모드 선택지는 흐려진다
R("openScope({subject:'영어',topic:'수일치'})");R("setQueueMode('parts')");
assert.equal(app.text('#orderStatus'),'이 범위는 파트가 없어 기본 순서로 풀어요');assert.ok(onQuestion(),'파트가 없어도 문제는 나온다');
assert.equal(R('partsOption.disabled'),true);
// 과목 전체(영어): 교재 순서대로 Day 1 첫 파트부터
R("openScope({subject:'영어'})");
assert.equal(partOfCard(R('data.activePractice.cardId')),'en1-1');assert.match(app.text('#orderStatus'),/^파트 1\/\d+ · Day 1 문장 구조·동사 유형 · 1\/5$/,app.text('#orderStatus'));
assert.equal(R('partsOption.disabled'),false);
// 동기화용 위치 기록(session)은 파트 범위도 규격 안
R("openScope({subject:'한국사',round:'part-"+weakPart.id+"'})");R('stampSession()');assert.equal(R('data.session.round'),'part-'+weakPart.id);R('ProgressSync.session(data.session)');

// ── 4) 파트별 상태 화면
R("go('parts','한국사')");
const body=app.nodes.get('#partsBody');
const fold=body.all.find(n=>n.dataset?.unit==='hist-19');assert.ok(fold?.open,'지금 풀던 강(19강)은 펼쳐 둔다');
assert.ok(body.all.filter(n=>n.dataset?.unit&&n.dataset.unit!=='hist-19').every(n=>!n.open),'다른 강은 접어 둔다');
// v184: 복습 판정 = 하루 이상 지나 다시 푼 풀이만. 이 검사의 풀이는 모두 같은 날이라 판정 0 → 약한 파트도 없다(같은 날 연습은 판정에 안 넣는다).
const histApply=Object.entries(R('STUDY_BASICS.apply')).filter(([id,a])=>/^(hanneung|gichul)-/.test(id)&&/^hist-/.test(a.box));
const gichulOf=pid=>histApply.filter(([,a])=>a.box==='hist-'+pid).length;
const expect=p=>{const s=R("(()=>{const ids="+JSON.stringify(p.ids)+",seen=new Set(data.history.map(h=>h.cardId)),cards=data.cards.filter(c=>ids.includes(c.id)&&isPlayable(c));return {n:cards.length,m:cards.filter(c=>c.streak>=4).length,f:cards.filter(c=>!seen.has(c.id)).length};})()");return s;};
for(const p of lecture19.parts){
 const item=body.all.find(n=>n.dataset?.part===p.id),e=expect(p),spans=item.children.map(c=>c.textContent),k=gichulOf(p.id);
 assert.equal(spans[1],e.n+'문제 · 외움 '+e.m+' · 복습 판정 아직 · 안 푼 문제 '+e.f+(k?' · 이 파트 기출 '+k+'문제 — 아직 안 풂':''),p.title);
 assert.ok(!/⚠ 약함/.test(spans[0]),p.title+' 같은 날 푼 것만으로는 약함이 아니다');
}
{const item=body.all.find(n=>n.dataset?.part===weakPart.id);assert.equal(item.children[0].textContent,'지대·수취 제도의 문란','8문제를 모두 틀렸어도 같은 날 연습이라 약함 판정 아님');assert.match(item.children[1].textContent,/^8문제 · 외움 0 · 복습 판정 아직 · 안 푼 문제 0/);}
// 범례(v184 부모 검토): 한 줄에 하나 — 긴 문단 대신
{const legend=body.children[0];assert.equal(legend.tag,'ul');assert.deepEqual(legend.children.map(li=>li.textContent),[
 '파트 = 한 강에서 같은 내용을 묻는 문제 묶음 (누르면 그 파트만 풀어요)','외움 = 7·14·30일 뒤에 다시 맞힌 문제',
 '복습 판정 = 하루 이상 지나 다시 푼 문제 중 맞힌 수 (같은 날 해설 보고 푼 건 빼요)','⚠ 약함 = 복습 판정 20문제(파트가 작으면 전부) 중 30% 이상 틀림',
 '기출 첫 풀이 = 이 파트 기출을 처음 풀어 맞힌 수 · 5문제 이상 70% 미만이면 기출 약함']);}
assert.equal(fold.children[0].textContent,'19강 조선 전기(경제, 사회) · 8파트 · 115문제');
// 파트를 누르면 그 파트만 푸는 범위가 열린다
const second=lecture19.parts[1];body.all.find(n=>n.dataset?.part===second.id).onclick();
assert.equal(R('scopeOf().round'),'part-'+second.id);assert.ok(R("data.cards.filter(inCurrent).every(c=>STUDY_PARTS.partOf(c.id)==="+JSON.stringify(second.id)+")"));
assert.equal(R("data.cards.filter(inCurrent).length"),second.ids.length,'파트 범위의 문제 수 = 상태 화면의 수');
// 4-2) 정보보호론 · 컴퓨터일반(기출만, 파트가 생긴 과목): 파트별 상태에 단원 · 파트, 수 = 파트 기출 수(회차 파일을 받기 전에도), 누르면 그 파트 기출만 푸는 범위.
for(const s of GICHUL_SUBJECTS){const us=PARTS.unitsFor(s).filter(u=>!u.scope.topic);if(!us.length)continue;
 R("go('parts',"+JSON.stringify(s)+")");const b=app.nodes.get('#partsBody');
 assert.deepEqual(b.children[0].children.map(li=>li.textContent).slice(0,1).concat(b.children[0].children.length),[s==='컴퓨터일반'?'파트 = 같은 주제를 묻는 문제 묶음 · 9급 기출과 자체 제작 (누르면 그 파트만 풀어요)':'파트 = 같은 주제를 묻는 9급 기출 묶음 (누르면 그 파트만 풀어요)',4],s+' 범례(기출 줄은 한국사만)');
 assert.deepEqual(b.all.filter(n=>n.dataset?.unit).map(n=>n.dataset.unit),PARTS.unitsFor(s).map(u=>u.id),s+' 단원 묶음(기출 단원 뒤에 자체 제작 단원)');
 for(const p of us.flatMap(u=>u.parts)){const item=b.all.find(n=>n.dataset?.part===p.id);assert.ok(item,s+' 파트 줄: '+p.id);assert.match(item.children[1].textContent,new RegExp('^'+p.ids.length+'문제 · 외움 0 · '),s+' 파트 수: '+p.id);}
 const p0=us[0].parts[0];b.all.find(n=>n.dataset?.part===p0.id).onclick();
 assert.equal(R('scopeOf().round'),'part-'+p0.id);assert.equal(R("data.cards.filter(inCurrent).length"),p0.ids.length,s+' 파트 범위 = 파트 기출');
 assert.ok(R("data.cards.filter(inCurrent).every(c=>c.subject==="+JSON.stringify(s)+"&&STUDY_PARTS.partOf(c.id)==="+JSON.stringify(p0.id)+")"));
 assert.equal(R("scopeLabel(scopeOf())"),s+' · '+us[0].short+' · '+p0.title);
 R("go('subject',"+JSON.stringify(s)+")");assert.equal(app.nodes.get('#openParts').hidden,false,s+' 파트별 상태 버튼');}
// 과목 화면에 파트별 상태 버튼(파트가 있는 과목만)
R("go('subject','한국사')");assert.equal(app.nodes.get('#openParts').hidden,false);
if(!PARTS.unitsFor('컴퓨터일반').length){R("go('subject','컴퓨터일반')");assert.equal(app.nodes.get('#openParts').hidden,true);}


assert.deepEqual([R('WEAK_MIN'),R('WEAK_RATE')],[PartCheck.WEAK_MIN,PartCheck.WEAK_RATE],'안내 문구의 20 · 30% = 판정 규칙');
// ── 4-3) 복습 판정(v184)을 앱 위에서: 이 강 문제 더 풀기를 끈 새 앱(v179 접힘 — 핵심 20 밖 문제는 판정에도 안 센다)
{
 const a=boot(),Q=code=>a.run(code);
 const T=(d,h,m=0)=>Q('new Date(2026,8,'+d+','+h+','+m+').getTime()'),row=(id,card,d,h,m,result)=>({id,cardId:card,date:'2026-09-'+String(d).padStart(2,'0'),at:new Date(T(d,h,m)).toISOString(),result,mode:'quiz'});
 const visOf=p=>p.ids.filter(id=>Q('isPlayable(data.cards.find(c=>c.id==='+JSON.stringify(id)+'))'));
 const p19=lecture19.parts.find(p=>visOf(p).length>=2&&visOf(p).length<p.ids.length);
 const vis=visOf(p19),hid=p19.ids.filter(id=>!vis.includes(id));
 assert.ok(vis.length>=2&&hid.length>=1,'19강 이 파트에 핵심 문제와 접힌 문제가 둘 다 있다: '+vis.length+'/'+hid.length);
 const [v1,v2]=vis,h1=hid[0];
 const hist=[
  row('r1',v1,20,9,0,'correct'),row('r2',v1,21,9,0,'wrong'),                           // v1: 다음 날 틀림 → 판정 틀림
  row('r3',v2,20,9,0,'wrong'),row('r4',v2,20,9,5,'correct'),                           // v2: 같은 날 해설 보고 맞힘 → 연습
  row('r5',h1,20,9,0,'correct'),row('r6',h1,22,9,0,'wrong'),                           // 접힌 문제: 판정 틀림이지만 보이지 않으니 안 센다
 ];
 // 한국사 02~05강 '구석기·신석기' 파트 기출(기초 개념 대입이 이 파트 상자를 가리키는 한능검 심화)
 const hp='h0205-1',hIds=Object.entries(Q('STUDY_BASICS.apply')).filter(([id,x])=>/^hanneung-/.test(id)&&x.box==='hist-'+hp).map(([id])=>id);
 assert.ok(hIds.length>=6,'구석기·신석기 파트 기출 '+hIds.length);
 const hTotal=Object.entries(Q('STUDY_BASICS.apply')).filter(([id,x])=>/^(hanneung|gichul)-/.test(id)&&x.box==='hist-'+hp).length;assert.ok(hTotal>hIds.length,'9급 한국사 기출도 이 파트에 든다');
 hist.push(row('k1',hIds[0],19,8,0,'correct'),row('k2',hIds[1],19,8,1,'unsure'),row('k3',hIds[2],19,8,2,'wrong'),row('k4',hIds[2],19,8,3,'correct'));
 Q("(()=>{const s=structuredClone(data);s.history="+JSON.stringify(hist)+";s.explanationViews=[{id:'r3',openedAt:"+T(20,9,1)+"}];commit(s);})()");
 const j=Q('reviewJudge('+JSON.stringify(p19.ids.filter(id=>vis.includes(id)))+')');
 assert.deepEqual([j.reviewed,j.right],[1,0],'보이는 문제 중 판정은 v1 하나(틀림)');
 const stats=()=>Q("(()=>{const byId=new Map(data.cards.filter(c=>isPlayable(c)&&c.subject==='한국사').map(c=>[c.id,c]));return partStats(STUDY_PARTS.part("+JSON.stringify(p19.id)+"),byId);})()");
 let x=stats();assert.deepEqual([x.n,x.reviewed,x.right,x.weak],[vis.length,1,0,vis.length<=1],'접힌 문제는 수에도 판정에도 안 들어간다');
 // 기출 첫 풀이 1/3 (unsure = 틀림, 첫 풀이만)
 const g=()=>JSON.parse(Q("JSON.stringify(partStats(STUDY_PARTS.part('"+hp+"'),new Map(data.cards.filter(c=>isPlayable(c)&&c.subject==='한국사').map(c=>[c.id,c]))).gichul)"));
 assert.deepEqual(g(),{total:hTotal,n:3,k:1,weak:false},'기출 첫 풀이 1/3 — 5문제 미만이라 기출 약함은 아직');
 Q("go('parts','한국사')");let b=a.nodes.get('#partsBody');
 const line=pid=>b.all.find(n=>n.dataset?.part===pid).children[1].textContent;
 assert.match(line(hp),/ · 기출 첫 풀이 1\/3$/,line(hp));
 assert.match(line(p19.id),new RegExp('^'+vis.length+'문제 · 외움 0 · 복습 판정 0/1 · 안 푼 문제 '+(vis.length-2)),line(p19.id));
 // 기출 5문제 이상 · 70% 미만 → '· 기출 약함'
 hist.push(row('k5',hIds[3],19,8,4,'correct'),row('k6',hIds[4],19,8,5,'correct'));
 Q("(()=>{const s=structuredClone(data);s.history="+JSON.stringify(hist)+";commit(s);render();})()");
 assert.deepEqual(g(),{total:hTotal,n:5,k:3,weak:true});
 Q("go('parts','한국사')");b=a.nodes.get('#partsBody');assert.match(line(hp),/ · 기출 첫 풀이 3\/5 · 기출 약함$/);
 assert.ok(!/⚠ 약함/.test(b.all.find(n=>n.dataset?.part===hp).children[0].textContent),'기출 약함은 ⚠ 약함과 따로');
 // 파트 범위 화면의 한 줄
 Q("openScope({subject:'한국사',topic:'',round:'part-"+hp+"'})");assert.match(a.text('#roundScore'),/ · 복습 판정 아직 · 기출 첫 풀이 3\/5 · 기출 약함$/,a.text('#roundScore'));
 // 이 강 문제 더 풀기를 켜면 접힌 문제도 보이고 판정에 들어간다
 Q("setLectureOpen('19',true)");x=stats();assert.deepEqual([x.reviewed,x.right],[2,0],'펼치면 접혔던 문제의 판정도 센다');
 // 다음 날 v2를 맞히면 판정에 들어간다(20일엔 연습이었지만 23일 풀이의 바로 앞 노출은 20일)
 hist.push(row('r7',v2,23,9,0,'correct'));Q("(()=>{const s=structuredClone(data);s.history="+JSON.stringify(hist)+";commit(s);})()");
 x=stats();assert.deepEqual([x.reviewed,x.right],[3,1]);
 // 같은 날 v1 해설을 다시 보고 또 맞혀도(21일 풀이 뒤) 판정은 21일 틀림 그대로 → 23일 풀이 먼저 해설: 23일 해설 뒤 23일 정답은 연습
 hist.push(row('r8',v1,23,10,0,'correct'));Q("(()=>{const s=structuredClone(data);s.history="+JSON.stringify(hist)+";s.explanationViews=[...s.explanationViews,{id:'r2',openedAt:"+T(23,9,50)+"}];commit(s);})()");
 x=stats();assert.deepEqual([x.reviewed,x.right],[3,1],'같은 날 해설을 펼친 뒤 푼 풀이는 판정을 바꾸지 않는다');
 // 앱이 넘기는 개념(ReviewPolicy.concept): 실제 쌍둥이 한 쌍 — 같은 날 쌍둥이 해설을 읽고 푼 풀이는 연습, 어제 읽었으면 판정
 const pair=Q("(()=>{const g=new Map();for(const c of data.cards){if(!isPlayable(c)||!STUDY_PARTS.partOf(c.id))continue;const k=ReviewPolicy.concept(c.id);if(k===c.id)continue;if(!g.has(k))g.set(k,[]);g.get(k).push(c.id);}return [...g.values()].find(v=>v.length>=2).slice(0,2);})()");
 const [tw,tq]=pair,twin=[row('t1',tw,20,9,0,'correct'),row('t2',tq,20,9,0,'wrong'),row('t3',tw,21,9,10,'correct')];
 const judged=viewAt=>{Q("(()=>{const s=structuredClone(data);s.history="+JSON.stringify(twin)+";s.explanationViews=[{id:'t2',openedAt:"+viewAt+"}];commit(s);})()");return Q('reviewJudge('+JSON.stringify([tw])+').reviewed');};
 assert.equal(judged(T(21,9,5)),0,'같은 날 쌍둥이 해설을 읽고 푼 풀이 → 연습');
 assert.equal(judged(T(20,9,5)),1,'쌍둥이 해설을 어제 읽었으면 → 판정');
}
// 컴퓨터일반 자체 제작 단원(research/computer-20261007): 교재의 장 하나가 단원 하나('comq-<기출 파트 id>', 범위 topic '컴일 <파트>'), 요점이 파트. 기출 단원(com-u1~) 뒤에 들어온 차례로 선다.
{const SPEC=/*COMQ-SPEC*/[{"part":"cg01","unit":"comq-cg01","parent":"com-u1","topic":"컴일 cg01","title":"컴퓨터 구성 · 정보 단위 · 문자 코드 (자체 제작)","short":"컴퓨터 구성 · 정보 단위 · 문자 코드","pre":"comq-cg01-","box":"com-cg01","n":211,"core":20,"folded":true,"points":14,"parts":[["cq01-1","하드웨어의 구성 장치",20,1],["cq01-2","하드웨어 · 소프트웨어 · 펌웨어 가르기",9,1],["cq01-3","시스템 소프트웨어와 응용 소프트웨어",20,1],["cq01-4","초기 계산 도구와 컴퓨터의 역사",17,2],["cq01-5","컴퓨터 세대별 소자 · 언어 · 사건",19,1],["cq01-6","컴퓨터의 분류 기준과 종류",13,1],["cq01-7","정보 표현 단위의 길이와 쓰임",16,2],["cq01-8","기억 용량 단위의 접두어와 크기 순서",12,2],["cq01-9","표준 BCD 코드",9,1],["cq01-10","ASCII 코드",17,2],["cq01-11","문자 코드의 비트 수와 문자 수 비교",10,2],["cq01-12","입출력장치 · 주변장치 · 포트",22,1],["cq01-13","프로그래밍 언어 수준과 번역기",19,2],["cq01-14","컴퓨터의 기능과 동작 과정",8,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nat9","nat10","nat11","nat12","nat13","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nbt8","nbt9","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","nct9","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","nar1","nar2","nar3","nar4","nar5","nar6","nbr1","nbr2","nbr3","nbr4","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ndr1","ndr2","nax1","nbx1","nbx2","nbx3","ncx1","ncx2","ncx3","ncx4","ncx5","ndx1","naa","naa1","naa2","naa3","naa4","nab","nab1","nab2","nab3","nac","nac1","nac2","nad","nad1","nad2","nad3","nad4","nad5","nad6","nad7","nad8","nba","nba1","nba2","nba3","nba4","nbb","nbb1","nbb2","nbb3","nbb4","nbc","nbc1","nbc2","nbc3","nbc4","nbd","nbd1","nbd2","nbd3","nbd4","nbe","nbe1","nbe2","nbe3","nbe4","nca","nca1","nca2","nca3","nca4","nca5","nca6","nca7","nca8","nca9","ncb","ncb1","ncb2","ncb3","ncb4","ncc","ncc1","ncc2","ncc3","ncc4","ncc5","ncd","ncd1","ncd2","ncd3","nce","nce1","nce2","nce3","nce4","nce5","ncf","ncf1","ncf2","nda","nda1","nda2","nda3","nda4","nda5","nda6","nda7","nda8","nda9","ndb","ndb1","ndb2","ndb3","ndb4","ndb5","ndc","ndc1","ndc2","ndc3","ndd","ndd1","ndd2","ndd3","ndd4","nde","nde1","nde2","nde3","ndf","ndf1","ndf2","ndf3","ndg","ndg1","ndg2","ndg3","ndg4","ndg5","ndh","ndh1","ndh2","ndh3","ndh4","ndh5","ndh6","ndi","ndi1","ndi2","ndi3","ndi4"],"boxLines":220},{"part":"cg02","unit":"comq-cg02","parent":"com-u1","topic":"컴일 cg02","title":"진법 변환과 수의 표현(보수 · 부동소수점) (자체 제작)","short":"진법 변환과 수의 표현(보수 · 부동소수점)","pre":"comq-cg02-","box":"com-cg02","n":310,"core":20,"folded":true,"points":19,"parts":[["cq02-1","진법의 자릿값과 2 · 8 · 16진 숫자",17,1],["cq02-2","10진 정수를 2 · 8 · 16진수로",10,1],["cq02-3","2진 · 8진 · 16진 사이의 변환(소수점 포함)",20,1],["cq02-4","진법이 섞인 계산과 크기 비교",11,1],["cq02-5","r의 보수와 (r−1)의 보수",18,1],["cq02-6","보수로 하는 뺄셈(부호 없는 수)",12,1],["cq02-7","부호 있는 2진 정수의 표현 방식",20,1],["cq02-8","2의 보수 만들기와 읽기",19,1],["cq02-9","n비트 정수의 표현 범위와 비트 수 늘리기",23,1],["cq02-10","소수점 있는 수의 진법 변환",18,1],["cq02-11","고정 · 부동소수점과 정규화",19,1],["cq02-12","바이어스된 지수와 비표준 형식",10,1],["cq02-13","IEEE 754 단정도 · 배정도",23,1],["cq02-14","2의 보수 덧셈 · 뺄셈과 오버플로",23,1],["cq02-15","2진 정수의 곱셈과 나눗셈",11,1],["cq02-16","부동소수점 수의 연산",17,1],["cq02-17","비트를 골라 세트하기 · 지우기 · 넣기",12,1],["cq02-18","비트 뒤집기와 두 데이터 비교",10,1],["cq02-19","시프트의 종류와 움직임",17,2]],"lines":["nat1","nat2","nbt1","nbt2","nbt3","nct1","nct2","ndt1","ndt2","ndt3","ndt4","ndt5","net1","net2","net3","net4","net5","nft1","nft2","nft3","nar1","nar2","nar3","nar4","nar5","nbr1","nbr2","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ncr7","ncr8","ncr9","ncr10","ncr11","ndr1","ndr2","ndr3","ndr4","ndr5","ner1","ner2","ner3","ner4","ner5","ner6","ner7","ner8","ner9","ner10","ner11","ner12","ner13","nfr1","nfr2","nfr3","nfr4","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","ncx1","ncx4","ndx1","ndx2","ndx3","nex1","nex2","nex3","nex4","nfx1","nfx2","nfx3","nfx4","naa","naa1","naa2","naa3","nab","nab1","nab2","nab3","nab4","nab5","nab6","nba","nba1","nba2","nba3","nba4","nba5","nba6","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbc","nbc1","nbc2","nbc3","nbc4","nca","nca1","nca2","nca3","nca4","nca5","ncb","ncb1","ncb2","ncb3","ncb4","nda","nda1","nda2","nda3","nda4","ndb","ndb1","ndb2","ndb3","ndc","ndc1","ndc2","ndc3","ndc4","ndd","ndd1","ndd2","ndd3","ndd4","nea","nea1","nea2","nea3","nea4","nea5","neb","neb1","neb2","neb3","neb4","nec","nec1","nec2","nec3","nfa","nfa1","nfa2","nfa3","nfa4","nfb","nfb1","nfb2","nfb3","nfb4","nfb5","nfc","nfc1","nfc2","nfc3","nfc4"],"boxLines":205},{"part":"cg03","unit":"comq-cg03","parent":"com-u1","topic":"컴일 cg03","title":"논리 회로(부울 대수 · 게이트 · 플립플롭) (자체 제작)","short":"논리 회로(부울 대수 · 게이트 · 플립플롭)","pre":"comq-cg03-","box":"com-cg03","n":272,"core":20,"folded":true,"points":17,"parts":[["cq03-1","기본 게이트의 진리표와 출력 계산",26,1],["cq03-2","범용 게이트와 3상 게이트",10,1],["cq03-3","부울 대수의 기본 법칙과 등식",27,1],["cq03-4","부울식 간소화(법칙 적용)",25,2],["cq03-5","부울 함수의 표준형 표현",15,1],["cq03-6","카르노 맵의 규칙",17,1],["cq03-7","카르노 맵으로 식 읽기와 간소화",14,1],["cq03-8","래치와 플립플롭의 개념 · R-S 래치",11,1],["cq03-9","플립플롭 종류별 특성표와 다음 상태",23,2],["cq03-10","조합 논리회로와 순차 논리회로 가르기",11,2],["cq03-11","반가산기 · 전가산기 · 병렬 가산기",13,1],["cq03-12","감산기와 병렬 가감산기 · 오버플로",10,1],["cq03-13","비교기와 패리티 발생기",10,1],["cq03-14","인코더와 디코더",13,1],["cq03-15","멀티플렉서와 디멀티플렉서",14,1],["cq03-16","레지스터와 시프트 레지스터",15,1],["cq03-17","카운터의 종류와 계수",18,1]],"lines":["nat1","nat2","nat3","nat4","nbt1","nbt2","nct1","nct2","nct3","nct4","nct5","nct6","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","net1","net2","net3","net4","net5","net6","net7","net8","net9","nft1","nft2","nft3","nft4","nft5","nft6","nar1","nar2","nar3","nar5","nar4","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","nbr8","ncr1","ncr2","ncr3","ndr1","ndr2","ndr3","ndr4","ner1","ner2","ner3","ner4","ner5","ner6","ner7","nfr1","nfr2","nfr3","nfr4","nfr5","nfr6","nfr7","nfr8","nfr9","nfr10","nfr11","nax1","nax2","nax3","nbx1","nbx2","nbx3","nbx4","ncx1","ncx2","ncx3","ndx1","ndx2","ndx3","ndx4","nfx1","nfx2","nfx3","nfx4","naa","naa1","naa2","naa3","naa4","naa5","naa6","naa7","nab","nab1","nab2","nab3","nba","nba1","nba2","nba3","nba4","nba5","nba6","nba7","nbb","nbb1","nbb2","nbb3","nbb4","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncb5","ncb6","ncc","ncc1","ncc2","ncc3","ncc4","ncc5","ncc6","ncc7","nda","nda1","nda2","nda3","nda4","ndb","ndb1","ndb2","ndb3","ndb4","ndc","ndc1","ndc2","ndc3","ndc4","nea","nea1","nea2","neb","neb1","neb2","neb3","neb4","neb5","neb6","nec","nec1","nec2","nec3","nec4","nfa","nfa1","nfa2","nfa3","nfa4","nfb","nfb1","nfb2","nfc","nfc1","nfc2","nfc3","nfc4","nfc5","nfc6","nfd","nfd1","nfd2","nfd3","nbw1","nbw2"],"boxLines":206},{"part":"cg04","unit":"comq-cg04","parent":"com-u2","topic":"컴일 cg04","title":"CPU · 레지스터 · 명령어 · 주소 지정 · 성능 (자체 제작)","short":"CPU · 레지스터 · 명령어 · 주소 지정 · 성능","pre":"comq-cg04-","box":"com-cg04","n":429,"core":20,"folded":true,"points":19,"parts":[["cq04-1","CPU의 구성과 내부 버스",22,1],["cq04-2","ALU의 구성과 연산 회로",35,1],["cq04-3","ALU의 상태 비트와 조건 코드",13,1],["cq04-4","CPU 레지스터의 종류와 역할",27,1],["cq04-5","CPU와 제어장치의 동작 단계",14,1],["cq04-6","CPU 처리 속도의 단위와 성능 요소",19,1],["cq04-7","명령어 사이클의 기본 흐름",23,1],["cq04-8","저급 언어와 어셈블리 프로그램",26,1],["cq04-9","명령어 집합 · 분기 · 서브루틴 호출",25,1],["cq04-10","주소 수에 따른 명령어와 프로그램 길이",22,1],["cq04-11","명령어의 필드와 비트 수",21,1],["cq04-12","RISC와 CISC",23,1],["cq04-13","주소 지정 방식(기본)",32,1],["cq04-14","변위 주소 지정 방식",19,1],["cq04-15","명령어 사이클의 부 사이클과 마이크로 연산",24,1],["cq04-16","제어장치의 구현 방식",14,1],["cq04-17","마이크로 프로그램 제어장치의 구성과 동작",27,1],["cq04-18","마이크로 명령어의 형식과 필드",20,1],["cq04-19","암달의 법칙과 CPU 실행 시간 계산",23,2]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","ndt9","ndt10","ndt11","net1","net2","net3","net4","net5","net6","net7","net8","nft1","nft2","nft3","nft4","nft5","ngt1","ngt2","ngt3","ngt4","ngt5","ngt6","ngt7","ngt8","ngt9","ngt10","nht1","nht2","nht3","nht4","nht5","nht6","nht7","nht8","nht9","nht10","nit1","nit2","nit3","nit4","nit5","nit6","nar1","nar2","nar3","nar4","nar5","nar6","nar7","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ncr7","ncr8","ncr9","ndr1","ndr2","ndr3","ner1","ner2","ner3","ner4","ner5","nfr1","nfr2","nfr3","ngr1","ngr2","ngr3","ngr4","ngr5","ngr6","ngr7","nhr1","nhr2","nhr3","nhr4","nhr5","nhr6","nhr7","nhr8","nhr9","nir1","nir2","nir3","nir4","nir5","nir6","nir7","nir8","nir9","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","ncx1","ncx2","ncx3","nex1","nex2","nex3","nex4","nfx1","nfx2","nfx3","ngx1","ngx2","ngx3","ngx4","nhx1","nhx2","nhx3","nhx4","nix1","nix2","nix3","nix4","nix5","nix6","naa","naa1","naa2","naa3","naa4","nab","nab1","nab2","nab3","nab4","nac","nac1","nac2","nac3","nad","nad1","nad2","nad3","nad4","nae","nae1","nae2","nae3","nae4","nba","nba1","nba2","nba3","nba4","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbc","nbc1","nbc2","nbc3","nbc4","nbc5","nbc6","nbc7","nbc8","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncb5","ncc","ncc1","ncc2","ncc3","ncc4","ncd","ncd1","ncd2","ncd3","ncd4","nce","nce1","nce2","nce3","ncf","ncf1","ncf2","ncf3","ncg","ncg1","ncg2","ncg3","ncg4","ncg5","ncg6","nch","nch1","nch2","nch3","nch4","nda","nda1","nda2","nda3","nda4","nda5","ndb","ndb1","ndb2","ndb3","ndb4","ndb5","ndc","ndc1","ndc2","ndc3","ndc4","ndd","ndd1","ndd2","ndd3","ndd4","nde","nde1","nde2","nde3","nde4","ndf","ndf1","ndf2","ndf3","ndg","ndg1","ndg2","ndg3","ndh","ndh1","ndh2","ndh3","ndh4","nea","nea1","nea2","nea3","nea4","neb","neb1","neb2","neb3","neb4","neb5","neb6","neb7","neb8","neb9","nec","nec1","nec2","nec3","nec4","nec5","nfa","nfa1","nfa2","nfa3","nfa4","nfa5","nfa6","nfa7","nfa8","nfa9","nfa10","nfa11","nfb","nfb1","nfb2","nfb3","nfb4","nfb5","nfb6","nga","nga1","nga2","nga3","nga4","nga5","nga6","ngb","ngb1","ngb2","ngb3","ngb4","ngc","ngc1","ngc2","ngc3","nha","nha1","nha2","nha3","nha4","nha5","nhb","nhb1","nhb2","nhb3","nhb4","nhb5","nhc","nhc1","nhc2","nhc3","nia","nia1","nia2","nib","nib1","nib2","nib3","nib4","nbw1","nbw2","nbw3"],"boxLines":406},{"part":"cg05","unit":"comq-cg05","parent":"com-u2","topic":"컴일 cg05","title":"파이프라인과 병렬 처리 (자체 제작)","short":"파이프라인과 병렬 처리","pre":"comq-cg05-","box":"com-cg05","n":140,"core":20,"folded":true,"points":9,"parts":[["cq05-1","명령어를 겹쳐 실행하는 기법의 뜻과 효과",13,3],["cq05-2","파이프라인 단계 구성",16,1],["cq05-3","파이프라인의 걸림돌과 해결",24,4],["cq05-4","파이프라인 실행 시간과 속도 향상",16,3],["cq05-5","명령어 여러 개를 한꺼번에 처리하는 구조",9,2],["cq05-6","플린(Flynn) 분류",22,3],["cq05-7","병렬 처리와 다중 프로세서 구조",17,2],["cq05-8","여러 컴퓨터를 묶은 시스템",17,1],["cq05-9","컴퓨터를 묶는 범위와 방식 견주기",6,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nar1","nar2","nar3","nar4","nar5","nar6","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","ncr1","ncr2","ncr3","nax1","nax4","nbx1","nbx2","nbx3","nbx4","nbx5","ncx1","ncx2","ncx3","naa","naa1","naa2","naa3","naa4","nab","nab1","nab2","nab3","nab4","nab5","nab6","nac","nac1","nac2","nac3","nad","nad1","nad2","nad3","nba","nba1","nba2","nba3","nba4","nbb","nbb1","nbb2","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncc","ncc1","ncc2","ncc3","ncc4","ncd","ncd1","ncd2","ncd3","ncd4"],"boxLines":123},{"part":"cg06","unit":"comq-cg06","parent":"com-u2","topic":"컴일 cg06","title":"기억장치 · 캐시 (자체 제작)","short":"기억장치 · 캐시","pre":"comq-cg06-","box":"com-cg06","n":364,"core":20,"folded":true,"points":19,"parts":[["cq06-1","기억장치의 성능 요소와 접근 방식",20,1],["cq06-2","기억장치 계층 구조와 속도 순서",19,1],["cq06-3","주기억장치의 구조 · MAR/MBR 동작 · 영역 구분",12,1],["cq06-4","주기억장치 할당과 적합 알고리즘",17,1],["cq06-5","기억장치 용량과 주소선 · 데이터선 수",18,1],["cq06-6","RAM의 종류와 특성",27,1],["cq06-7","RAM 칩의 내부 조직과 주소 비트",12,1],["cq06-8","ROM의 쓰임 · 구조 · 종류",23,1],["cq06-9","플래시 메모리의 특성과 종류",21,1],["cq06-10","기억장치 확장: 칩 개수와 연결 방식",23,1],["cq06-11","캐시의 원리와 동작",20,1],["cq06-12","평균 기억장치 접근 시간과 적중률 계산",20,1],["cq06-13","캐시 크기 · 인출 방식 · 블록 크기",11,1],["cq06-14","캐시 사상 방식과 주소 필드 계산",40,1],["cq06-15","캐시 교체 알고리즘",20,2],["cq06-16","캐시 쓰기 정책",16,1],["cq06-17","다단계 캐시와 평균 접근 시간",18,1],["cq06-18","캐시를 두는 위치와 용도별 구성",9,1],["cq06-19","멀티프로세서의 캐시 불일치와 일관성 유지",18,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nat9","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nct1","nct2","nct3","nct4","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","net1","net2","net3","net4","net5","net6","net7","nft1","nft2","nft3","nft4","nft5","nft6","nft7","nft8","nft9","nar1","nar2","nar3","nar4","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","ncr1","ncr2","ncr3","ncr4","ndr1","ndr2","ndr3","ndr4","ndr5","ner1","ner2","ner3","ner4","ner5","ner6","nfr1","nfr2","nfr3","nfr4","nax1","nax2","nax3","nax4","nax5","nbx1","nbx2","nbx3","nbx4","nbx5","ncx2","ndx1","ndx2","ndx3","nex1","nex2","nex3","nex4","nfx1","naa","naa1","naa2","naa3","naa4","naa5","naa6","nab","nab1","nab2","nab3","nab4","nac","nac1","nac2","nac3","nac4","nad","nad1","nad2","nad3","nad4","nae","nae1","nae2","nae3","naf","naf1","naf2","naf3","nba","nba1","nba2","nba3","nba4","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbc","nbc1","nbc2","nbc3","nbd","nbd1","nbd2","nbd3","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncb5","ncb6","ncb7","ncc","ncc1","ncc2","ncc3","ncc4","ncc5","ncd","ncd1","ncd2","ncd3","ncd4","nda","nda1","nda2","nda3","nda4","nda5","nea","nea1","nea2","nea3","nea4","nea5","neb","neb1","neb2","neb3","neb4","neb5","nec","nec1","nec2","nec3","nfa","nfa1","nfa2","nfa3","nfb","nfb1","nfb2","nfb3","nfc","nfc1","nfc2","nfc3","naw1","naw2","naw3","naw4","ncw1"],"boxLines":234},{"part":"cg07","unit":"comq-cg07","parent":"com-u2","topic":"컴일 cg07","title":"보조기억장치 · RAID · 입출력 · 버스 · 인터럽트 (자체 제작)","short":"보조기억장치 · RAID · 입출력 · 버스 · 인터럽트","pre":"comq-cg07-","box":"com-cg07","n":339,"core":20,"folded":true,"points":17,"parts":[["cq07-1","보조기억장치의 자리와 부팅 순서",16,1],["cq07-2","RAID의 뜻과 기본 구성",34,1],["cq07-3","RAID 검사 정보와 패리티 계산",23,1],["cq07-4","RAID 패리티 배치와 용량",22,2],["cq07-5","결합 RAID의 구성과 용량",15,1],["cq07-6","SSD의 구조와 관리 기능",12,1],["cq07-7","입출력 모듈이 필요한 까닭과 하는 일",19,1],["cq07-8","입출력장치의 연결과 주소 지정",17,1],["cq07-9","입출력 비동기 전송의 제어 신호",18,1],["cq07-10","입출력 제어 방식의 비교",19,1],["cq07-11","인터럽트의 종류와 처리 순서",21,2],["cq07-12","인터럽트를 요구한 장치 찾기",28,1],["cq07-13","DMA 방식의 동작과 제어기",31,1],["cq07-14","입출력 프로세서와 채널",17,1],["cq07-15","시스템 버스의 구성과 폭",23,2],["cq07-16","버스 제어 신호와 동작 시간 · 확장 버스",15,1],["cq07-17","임베디드 시스템",9,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","net1","net2","net3","net4","net5","net6","net7","net8","net9","nft1","nft2","nft3","nft4","nft5","nft6","nft7","nft8","nft9","nft10","nft11","nft12","nft13","nft14","nft15","nft16","nar1","nar2","nar3","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","ncr1","ncr2","ncr3","ncr4","ndr1","ndr2","ndr3","ndr4","ndr5","ndr6","ner1","ner2","ner3","ner4","ner5","ner6","ner7","nfr1","nfr2","nfr3","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","nbx5","ncx1","ncx2","ncx3","ncx4","ndx1","ndx4","nex1","nex2","nex3","nex4","nfx1","nfx4","nfx5","naa","naa1","naa2","naa3","naa4","naa5","nab","nab1","nab2","nab3","nab4","nab5","nab6","nba","nba1","nba2","nba3","nba4","nba5","nba6","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","ncb5","ncb6","ncb7","ncb8","ncb9","ncc","ncc1","ncc2","ncc3","ncc4","ncd","ncd1","ncd2","ncd3","ncd4","ncd5","nce","nce1","nce2","nce3","nce4","nda","nda1","nda2","nda3","nda4","ndb","ndb1","ndb2","ndb3","ndb4","ndc","ndc1","ndc2","ndc3","ndc4","ndc5","ndc6","nea","nea1","nea2","nea3","nea4","neb","neb1","neb2","neb3","nec","nec1","nec2","nec3","nec4","ned","ned1","ned2","ned3","nfa","nfa1","nfa2","nfa3","nfb","nfb1","nfb2","nfb3","nfb4"],"boxLines":234},{"part":"cg17","unit":"comq-cg17","parent":"com-u6","topic":"컴일 cg17","title":"OSI · TCP/IP 계층 모델 (자체 제작)","short":"OSI · TCP/IP 계층 모델","pre":"comq-cg17-","box":"com-cg17","n":268,"core":20,"folded":true,"points":15,"parts":[["cq17-1","OSI 모델의 틀과 계층 묶음",19,1],["cq17-2","헤더와 트레일러 붙이고 떼기",11,1],["cq17-3","OSI 계층별 기능",88,5],["cq17-4","프로토콜의 요소와 일반 기능",12,1],["cq17-5","프로토콜은 어느 계층인가(OSI)",29,1],["cq17-6","장비는 어느 OSI 계층인가",15,2],["cq17-7","TCP/IP 계층과 OSI의 대응",27,2],["cq17-8","IP와 보조 프로토콜 가르기",21,2],["cq17-9","계층별 전송 단위의 이름",14,2],["cq17-10","계층마다 쓰는 주소의 갈래",21,2],["cq17-11","라우터의 길 찾기와 라우팅 프로토콜",11,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nct1","nct2","nct3","nct4","nct5","nct6","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","ndt9","ndt10","ndt11","ndt12","ndt13","nar1","nar2","nar3","nbr1","nbr2","nbr3","nbr4","nbr6","nbr5","ncr1","ncr2","ncr3","ncr4","ncr5","ndr1","ndr2","ndr3","ndr4","ndr5","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","ncx1","ncx2","ncx3","ncx4","ndx1","ndx2","ndx3","ndx4","ndx5","naa","naa1","naa2","naa3","naa4","naa5","nab","nab1","nab2","nab3","nab4","nac","nac1","nac2","nac3","nac4","nac5","nac6","nac7","nac8","nad","nad1","nad2","nad3","nad4","nad5","nad6","nad7","nad8","nba","nba1","nba2","nba3","nba4","nba5","nba6","nba7","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbc","nbc1","nbc2","nbc3","nbd","nbd1","nbd2","nbd3","nbd4","nbd5","nbd6","nbd7","nbe","nbe1","nbe2","nbe3","nbe4","nbe5","nbe6","nbe7","nca","nca1","nca2","nca3","nca4","nca5","ncb","ncb1","ncb2","ncb3","ncb4","ncc","ncc1","ncc2","ncc3","ncc4","nda","nda1","nda2","nda3","nda4","nda5","ndb","ndb1","ndb2","ndb3","ndb4","ndb5","ndc","ndc1","ndc2","ndc3"],"boxLines":190},{"part":"cg18","unit":"comq-cg18","parent":"com-u6","topic":"컴일 cg18","title":"응용 · 전송 계층 프로토콜과 오류 · 흐름 제어 (자체 제작)","short":"응용 · 전송 계층 프로토콜과 오류 · 흐름 제어","pre":"comq-cg18-","box":"com-cg18","n":333,"core":20,"folded":true,"points":18,"parts":[["cq18-1","응용 계층 프로토콜과 TCP · UDP 위의 서비스",18,1],["cq18-2","전송 계층 프로토콜 견주기",22,1],["cq18-3","TCP · UDP 헤더의 필드",26,1],["cq18-4","TCP 헤더의 플래그 비트",13,1],["cq18-5","TCP의 전송률 조절과 그 기법",20,1],["cq18-6","TCP의 수신 측 맞춤 전송과 타이머",14,1],["cq18-7","전송 오류의 종류와 검출의 바탕",12,1],["cq18-8","패리티로 하는 오류 검출",24,1],["cq18-9","덧셈으로 하는 오류 검출",13,1],["cq18-10","오류 검출 방식의 절차와 계산",21,2],["cq18-11","오류를 바로잡는 방법과 부호",16,1],["cq18-12","해밍 코드 계산",28,1],["cq18-13","데이터 링크 제어: 세 기능과 보낼 차례",18,1],["cq18-14","데이터 링크 제어: 보내는 양 다루기",21,1],["cq18-15","데이터 링크 제어: 오류 다루기와 프레임",14,1],["cq18-16","정지-대기 방식의 재전송과 확인응답",12,1],["cq18-17","슬라이딩 윈도우 ARQ의 재전송 방식",24,2],["cq18-18","데이터 링크 프로토콜의 갈래",17,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","ndt9","net1","net2","net3","net4","net5","net6","net7","net8","nft1","nft2","nft3","nft4","nft5","nar1","nar2","nar3","nar4","nar5","nar6","nbr1","nbr2","nbr3","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ncr7","ncr8","ncr9","ncr10","ncr11","ncr12","ncr13","ndr1","ndr2","ndr3","ndr4","ndr5","ndr6","ndr8","ndr7","ner1","ner2","ner3","ner4","ner5","nfr1","nfr2","nfr3","nfr4","nfr5","nax1","nax4","nbx1","nbx2","ncx1","ncx2","ncx3","ndx1","ndx2","ndx3","ndx4","nex1","nex2","nex3","nex4","nfx1","nfx2","nfx3","nfx4","naa","naa1","naa2","naa3","naa4","naa5","naa6","nab","nab1","nab2","nab3","nab4","nab5","nab6","nac","nac1","nac2","nac3","nac4","nba","nba1","nba2","nba3","nba4","nba5","nba6","nba7","nbb","nbb1","nbb2","nbb3","nbb4","nca","nca1","nca2","nca3","nca4","nca5","nda","nda1","nda2","nda3","ndb","ndb1","ndb2","ndb3","ndb4","ndc","ndc1","ndc2","ndc3","ndc4","ndd","ndd1","ndd2","ndd3","ndd4","nea","nea1","nea2","nea3","neb","neb1","neb2","neb3","neb4","nec","nec1","nec2","nec3","nfa","nfa1","nfa2","nfa3","nfb","nfb1","nfb2","nfb3","nfb4","nfc","nfc1","nfc2","nfc3","nfd","nfd1","nfd2","nfe","nfe1","nfe2"],"boxLines":213},{"part":"cg19","unit":"comq-cg19","parent":"com-u6","topic":"컴일 cg19","title":"IP 주소와 서브네팅 (자체 제작)","short":"IP 주소와 서브네팅","pre":"comq-cg19-","box":"com-cg19","n":285,"core":20,"folded":true,"points":13,"parts":[["cq19-1","주소의 종류와 길이",21,2],["cq19-2","서브넷 마스크와 접두사 길이",28,2],["cq19-3","호스트 수와 서브넷 수 계산",35,2],["cq19-4","서브넷의 주소 범위 구하기",27,2],["cq19-5","접두사 길이와 주소 묶기",14,1],["cq19-6","IPv4 헤더의 필드",27,1],["cq19-7","데이터그램 쪼개기와 오프셋 계산",28,1],["cq19-8","IP 프로토콜의 특징",11,1],["cq19-9","IPv4 클래스 판별과 크기",35,2],["cq19-10","IPv6의 주소 · 헤더 · 특징",22,3],["cq19-11","IPv6 주소 표기와 IPv4 주소 담기",15,1],["cq19-12","IPv6 전환 기술",8,1],["cq19-13","IPv6 주소의 종류와 받는 대상",14,1]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nbt1","nbt2","nbt3","nbt4","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","nar1","nar2","nar3","nar4","nar5","nar6","nar7","nar8","nar9","nar10","nar11","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","nbr8","ncr1","ncr2","ncr3","ncr4","ncr5","ncr6","ncr7","ncr8","ncr9","ndr1","ndr2","ndr3","ndr4","ndr5","ndr6","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","nbx5","ncx1","ncx2","ncx3","ndx1","ndx2","naa","naa1","naa2","naa3","naa4","nab","nab1","nab2","nab3","nab4","nab5","nab6","nab7","nab8","nab9","nac","nac1","nac2","nac3","nac4","nac5","nac6","nac7","nac8","nac9","nac10","nac11","nac12","nac13","nac14","nac15","nac16","nac17","nac18","nac19","nac20","nad","nad1","nad2","nad3","nad4","nad5","nad6","nad7","nad8","nad9","nad10","nad11","nad12","nad13","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbb6","nbb7","nbc","nbc1","nbc2","nbc3","nbc4","nbc5","nba","nba1","nba2","nba3","nba4","nba5","nba6","nba7","nba8","nba9","nba10","nba11","nbd","nbd1","nbd2","nbd3","nbd4","nbd5","nbd6","nca","nca1","nca2","nca3","nca4","ncb","ncb1","ncb2","ncb3","ncb4","nda","nda1","nda2","nda3","nda4","nda5","ndb","ndb1","ndb2","ndb3","ndc","ndc1","ndc2","ndc3","ndd","ndd1","ndd2","ndd3","nde","nde1","nde2","nde3"],"boxLines":206},{"part":"cg20","unit":"comq-cg20","parent":"com-u6","topic":"컴일 cg20","title":"네트워크 장비 · 토폴로지 · 전송 · 매체 접근 · 무선 (자체 제작)","short":"네트워크 장비 · 토폴로지 · 전송 · 매체 접근 · 무선","pre":"comq-cg20-","box":"com-cg20","n":321,"core":20,"folded":true,"points":19,"parts":[["cq20-1","회선 구성: 점-대-점 · 다중점 · 교환",9,1],["cq20-2","토폴로지의 모양과 회선 수",24,1],["cq20-3","토폴로지별 장단점 비교",26,1],["cq20-4","두 장치가 주고받는 전송 방식",10,1],["cq20-5","규모로 나눈 네트워크와 인터넷",15,1],["cq20-6","이더넷 표준과 MAC 주소 · 부계층",20,1],["cq20-7","이더넷의 매체 접근과 충돌 처리",20,1],["cq20-8","이더넷 프레임의 필드와 길이",19,1],["cq20-9","이더넷의 발전과 충돌 영역",13,1],["cq20-10","교환의 뜻과 전화망의 교환 방식",13,1],["cq20-11","데이터를 나눠 보내는 교환의 갈래",16,1],["cq20-12","교환 방식 견주기와 프레임 전달",13,1],["cq20-13","무선 랜의 매체 접근과 단말 문제",22,1],["cq20-14","무선 LAN 802.11 규격 비교",23,1],["cq20-15","기반 시설 없는 무선망의 특성",15,1],["cq20-16","기반 시설 없는 무선망의 라우팅",6,1],["cq20-17","무선 PAN 기술 비교",19,1],["cq20-18","디지털 데이터 전송 방식의 갈래",7,1],["cq20-19","네트워크 장비와 동작 계층 — 계층별 스위치",31,2]],"lines":["nat1","nat2","nat3","nat4","nat5","nat6","nat7","nat8","nat9","nat10","nat11","nbt1","nbt2","nbt3","nbt4","nbt5","nbt6","nbt7","nct1","nct2","nct3","nct4","nct5","nct6","nct7","nct8","ndt1","ndt2","ndt3","ndt4","ndt5","ndt6","ndt7","ndt8","ndt9","ndt10","ndt11","ndt12","ndt13","ndt14","ndt15","net1","net2","net3","net4","net5","nft1","nft2","nft3","nft4","nft5","nft6","nft7","nft8","nar1","nar2","nar3","nar4","nbr1","nbr2","nbr3","nbr4","nbr5","nbr6","nbr7","nbr9","nbr8","ncr1","ncr2","ncr3","ncr4","ndr1","ndr2","ndr3","ndr4","ndr5","ner1","ner2","ner3","nfr1","nfr2","nfr3","nfr4","nfr5","nfr6","nax1","nax2","nax3","nax4","nbx1","nbx2","nbx3","nbx4","ncx1","ncx2","ncx3","ncx4","ndx1","ndx2","ndx3","ndx4","nex1","nex2","nex3","nex4","nfx1","nfx2","nfx3","nfx4","naa","naa1","naa2","naa3","naa4","naa5","nab","nab1","nab2","nab3","nab4","nab5","nba","nba1","nba2","nba3","nbb","nbb1","nbb2","nbb3","nbb4","nbb5","nbc","nbc1","nbc2","nbd","nbd1","nbd2","nbd3","nca","nca1","nca2","nca3","nca4","nca5","nca6","nca7","ncb","ncb1","ncb2","ncb3","ncb4","ncc","ncc1","ncc2","ncc3","ncc4","ncd","ncd1","ncd2","ncd3","ncd4","ncd5","ncd6","ncd7","nda","nda1","nda2","nda3","ndb","ndb1","ndb2","ndb3","ndb4","ndb5","ndc","ndc1","ndc2","nea","nea1","nea2","nea3","nea4","nea5","neb","neb1","neb2","neb3","neb4","nec","nec1","nec2","nec3","nec4","nec5","nec6","nec7","nec8","nec9","ned","ned1","ned2","ned3","nfa","nfa1","nfa2","nfa3","nfb","nfb1","nfb2","nfb3","nfb4","nfc","nfc1","nfc2","nfc3","nfc4","nfc5","nfd","nfd1","nfd2","nfd3","nfd4","nfe","nfe1","nfe2","nfe3","nfe4"],"boxLines":261}]/*END-COMQ-SPEC*/,ids=PARTS.units.map(u=>u.id);let prev=PARTS.unitsFor('컴퓨터일반').filter(u=>!u.scope.topic).at(-1).id;
 assert.deepEqual(PARTS.unitsFor('컴퓨터일반').filter(u=>u.scope.topic).map(u=>u.id),SPEC.map(s=>s.unit),'컴퓨터일반 자체 제작 단원');
 for(const s of SPEC){const u=PARTS.units.find(x=>x.id===s.unit);assert.ok(u,s.unit);assert.deepEqual([u.subject,u.title,u.short,u.scope.topic,u.scope.round],['컴퓨터일반',s.title,s.short,s.topic,''],s.unit+' 단원');
  assert.deepEqual(u.parts.map(p=>[p.id,p.title,p.ids.length]),s.parts.map(p=>p.slice(0,3)),s.unit+' 파트');assert.equal(u.parts.reduce((n,p)=>n+p.ids.length,0),s.n,s.unit+' 문제 수');
  assert.ok(u.parts.every(p=>p.ids.every(id=>id.startsWith(s.pre)&&BANK[id].topic===s.topic)),s.unit+' 파트는 그 단원의 자체 제작 문제만');
  assert.equal(PARTS.unitOf(s.part)?.id,s.parent,s.unit+': 같은 주제의 기출 파트 '+s.part+'가 '+s.parent+'에 있다(범위 목록이 이 단원 아래에 묶는다)');assert.equal(u.short,PARTS.part(s.part).title,s.unit+' 이름 = 기출 파트 제목');
  assert.equal(ids.indexOf(s.unit),ids.indexOf(prev)+1,prev+' 다음에 '+s.unit);prev=s.unit;}}
console.log('PASS parts: '+PARTS.units.length+'단위 · '+Object.entries(itCounts).map(([k,v])=>k+' '+v+' · ').join('')+PARTS.units.reduce((n,u)=>n+u.parts.length,0)+'파트, 모든 문제가 정확히 한 파트(기타 0) — '+Object.entries(counts).map(([k,v])=>k+' '+v).join(' · ')+
 '; 파트별 점검: 19강 모두 맞힘 = 5×8 = 40문제, 하나 틀리면 같은 파트 3문제 더(8문제로 통과), 8문제 파트를 모두 틀리면 5+3에서 다시 볼 파트, 다시 볼 파트만 다시 점검, 새로고침 뒤 이어짐, 파트 없는 범위는 기본 순서, 기록·일정은 평소대로; 파트별 상태 수 = 기록; 복습 판정: 하루 이상 지나 다시 푼 풀이만(같은 날 그 문제·쌍둥이를 풀었거나 해설을 봤으면 연습) · 문제마다 가장 최근 판정 · 약함 min(20, n) · 접힌 문제 제외 · 한국사 파트 기출 첫 풀이 M/N(unsure = 틀림) · 기출 약함 5문제 이상 70% 미만');
