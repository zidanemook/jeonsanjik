'use strict';
// 영작 연습(english-writing-day<N>, memorize.js) 검사. 원고 research/english-writing-vocab-20261024/writing-cards.json, 규칙은 같은 폴더 PLAN.md.
// 1) 카드마다 우리말, 재료, 답, 규칙이 있고 가운뎃점이 없다.
// 2) 재료의 영어 낱말은 모두 답 문장에 있다(동사는 원형이라 -s, -ed, -ing, 불규칙 꼴도 인정). 'A, B 중 하나'는 둘 중 하나만 있으면 된다.
// 3) 규칙 줄은 그 Day 연습 문제의 포인트(point) 이름 그대로이고, 그 Day의 포인트는 모두 카드가 있으며 포인트당 3장을 넘지 않는다.
const assert=require('node:assert/strict');
const M=require('./memorize.js'),{loadSources}=require('./build-chunks.cjs');
const bank=loadSources().PRACTICE_BANK;
const DOT=new RegExp('['+[0xB7,0x2027,0x30FB,0x318D].map(c=>String.fromCharCode(c)).join('')+']');
const IRREGULAR={be:['is','are','was','were','been','being','am'],have:['has','had'],lie:['lay','lain','lying'],lay:['laid'],rise:['rose','risen'],take:['took','taken'],find:['found'],see:['saw','seen'],make:['made'],cut:['cut'],ride:['rode','ridden'],know:['knew','known'],leave:['left'],lose:['lost'],say:['said'],tell:['told'],break:['broke','broken'],fall:['fell','fallen'],ring:['rang','rung'],eat:['ate','eaten'],catch:['caught'],give:['gave','given'],keep:['kept'],buy:['bought'],think:['thought'],stand:['stood'],come:['came'],get:['got','gotten'],can:['cannot','can’t','could'],run:['ran'],speak:['spoke','spoken'],read:['read'],put:['put'],let:['let'],hear:['heard'],begin:['began','begun'],steal:['stole','stolen'],hold:['held'],write:['wrote','written'],choose:['chose','chosen'],grow:['grew','grown'],go:['went','gone'],send:['sent'],become:['became'],build:['built'],will:['would'],do:['did','done','does'],meet:['met'],sleep:['slept'],hide:['hid','hidden'],teach:['taught'],spend:['spent']};
const forms=w=>{const s=new Set([w,w+'s',w+'es',w+'ed',w+'d',w+'ing',w.replace(/e$/,'')+'ing',w.replace(/y$/,'ies'),w.replace(/y$/,'ied'),...(IRREGULAR[w]||[])]);
 if(/[^aeiou][aeiou][bdgmnprt]$/.test(w)){s.add(w+w.slice(-1)+'ed');s.add(w+w.slice(-1)+'ing');}return s;};
const words=t=>(t.toLowerCase().match(/[a-z0-9’']+/g)||[]);
const inAnswer=(w,answerWords)=>[...forms(w)].some(f=>answerWords.has(f));
const sets=M.sets.filter(s=>s.id.startsWith('english-writing-'));
assert.ok(sets.length>=6,'영작 연습 목록이 있다(Day 1 ~ Day 6)');
let total=0;
for(const set of sets){
 const day=+set.id.match(/^english-writing-day(\d+)$/)[1],topic='Day '+day;
 assert.equal(set.subject,'영어');assert.ok(set.title.includes('영작 연습'),'제목: '+set.title);
 const points=new Set(Object.values(bank).filter(l=>l.topic===topic).map(l=>l.point));assert.ok(points.size>0,topic+' 포인트');
 const perPoint=new Map();
 for(const g of set.groups)for(const card of g.cards){total++;
  assert.equal(card.length,2,'카드 = [앞면, 뒷면]');const [front,back]=card;
  for(const t of [front,back,g.title,set.title,set.hint])assert.ok(!DOT.test(t),'가운뎃점 없음: '+t);
  const fl=front.split('\n'),bl=back.split('\n');
  const ko=fl[0],parts=fl.find(l=>l.startsWith('재료: ')),answer=bl[0],rule=bl.find(l=>l.startsWith('규칙: '));
  assert.ok(/[가-힣]/.test(ko)&&/[.?!]$/.test(ko),'우리말 문장: '+ko);
  assert.ok(parts&&parts.length>4,'재료 줄: '+front);
  assert.ok(fl.slice(1).every(l=>l.startsWith('재료: ')||l.startsWith('꼴: ')),'앞면은 우리말, 재료, 꼴 줄만: '+front);
  assert.ok(/^[A-Z]/.test(answer)&&/[.?!]$/.test(answer)&&!/[가-힣]/.test(answer),'답 문장은 영어 한 문장: '+answer);
  assert.ok(rule,'규칙 줄: '+back);assert.ok(bl.slice(1).every(l=>l.startsWith('또는: ')||l.startsWith('규칙: ')),'뒷면은 답, 또는, 규칙 줄만: '+back);
  const point=rule.slice(4);assert.ok(points.has(point),topic+' 포인트 이름 그대로: '+point);perPoint.set(point,(perPoint.get(point)||0)+1);
  const aw=new Set(words(answer));
  for(const chip of parts.slice(4).split(' / ')){
   const latin=words(chip.replace(/[가-힣]+/g,' '));assert.ok(latin.length,'재료 묶음에 영어 낱말: '+chip);
   if(chip.endsWith('중 하나'))assert.ok(latin.some(w=>inAnswer(w,aw)),'둘 중 하나가 답에 있다: '+chip+' → '+answer);
   else for(const w of latin)assert.ok(inAnswer(w,aw),'재료 낱말 '+w+'이 답에 있다: '+answer);
  }
 }
 for(const p of points)assert.ok(perPoint.has(p),topic+' 포인트에 카드가 있다: '+p);
 for(const [p,n] of perPoint)assert.ok(n<=3,'포인트당 3장 이하: '+p+' '+n);
}
// 대조군: 낱말 꼴 맞추기
assert.ok(inAnswer('lie',new Set(['lay']))&&inAnswer('stop',new Set(['stopped']))&&inAnswer('found',new Set(['founded']))&&!inAnswer('refer',new Set(['regard'])),'대조군: 낱말 꼴');
console.log('PASS writing: 영작 연습 '+sets.length+'개 목록 '+total+'장, 우리말, 재료, 답, 규칙이 다 있고 재료 낱말은 답에 있음, 포인트 전부 덮음(포인트당 3장 이하), 가운뎃점 0');
