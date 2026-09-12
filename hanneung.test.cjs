const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const h=require('./hanneung.js'),practice=require('./practice.js'),record=require('./review-record.js'),sync=require('./sync-core.js'),schedule=require('./scheduler.js');
const keys=JSON.parse(fs.readFileSync(__dirname+'/docs/hanneung-answer-keys.json','utf8'));
assert.equal(h.rows.length,1150);assert.equal(new Set(h.rows.map(r=>r.id)).size,1150);
assert.equal(h.rounds.length,23);
const cards=[],options={};h.install(cards,options);assert.equal(cards.length,1149);assert(!options['hanneung-63-42']);
const explanations=require('./hanneung-explanations.js');
const completeRounds=[79,78,77];
assert.deepEqual(Object.keys(explanations).sort(),completeRounds.flatMap(n=>Array.from({length:50},(_,i)=>'hanneung-'+n+'-'+String(i+1).padStart(2,'0'))).sort());
for(const [id,e]of Object.entries(explanations)){
 assert.equal(e.choices.length,5,id);assert(e.clue&&e.reason&&e.hook&&e.reviewedOn);
 assert(e.sources.length>0);for(const s of e.sources){assert(s.title);const url=new URL(s.url);assert.equal(url.protocol,'https:');assert(['contents.history.go.kr','www.heritage.go.kr','www.museum.go.kr','cl.mofa.go.kr','www.kookje.co.kr','www.kmdb.or.kr'].includes(url.hostname));}
 assert(!options[id].explanation.includes('아직 제공하지 않습니다'));assert(options[id].explanation.length<8000);
 const c=cards.find(c=>c.id===id),e2=practice.select(c,[],{},options),detail=record.create(c,e2,e2.correctIndex,null,id);assert.equal(detail.explanation,h.explanation(id));
}
assert(options['hanneung-76-01'].explanation.includes('아직 제공하지 않습니다'));
assert.equal(h.explanation('hanneung-63-42'),null);
for(const n of h.rounds){const rows=h.rows.filter(r=>r.round===n);assert.deepEqual(rows.map(r=>r.number),Array.from({length:50},(_,i)=>i+1));assert.equal(rows.reduce((s,r)=>s+r.points,0),100);}
for(const r of h.rows){
 assert.equal(r.answer,keys[r.round].answers[r.number-1]==='0'?null:Number(keys[r.round].answers[r.number-1]));
 assert.equal(r.points,Number(keys[r.round].points[r.number-1]));
 assert.match(r.source,/^https:\/\/www\.historyexam\.go\.kr\/atchFile\/FileDown\.do\?/);
 assert.match(r.image,/^assets\/hanneung\/\d{2}-\d{2}-[a-f0-9]{10}\.webp$/);
 const bytes=fs.readFileSync(__dirname+'/'+r.image);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert(r.image.includes(crypto.createHash('sha256').update(bytes).digest('hex').slice(0,10)));
 if(r.answer===null)continue;
 const card=cards.find(c=>c.id===r.id);
 for(const count of [0,1,3]){const e=practice.select(card,Array.from({length:count},()=>({cardId:r.id})),{},options);assert.deepEqual(e.choices,['①','②','③','④','⑤']);assert.equal(e.correctIndex,r.answer-1);assert.equal(practice.refresh(card,e,{},options).correctIndex,r.answer-1);}
}
const card=cards[0],exercise=practice.select(card,[],{},options),detail=record.create(card,exercise,exercise.correctIndex,null,card.id);
assert.equal(h.recorded(card.id,detail).image,exercise.image);assert.equal(h.cleanQuestion(detail.question),exercise.question);
const at='2026-09-10T11:00:00.000Z',base={version:2,cards:[{...card,created:'2026-09-10',due:'2026-09-10',ease:2.5,interval:0,streak:0}],history:[]};
const first={id:'paper-wrong',cardId:card.id,date:'2026-09-10',at,result:'wrong',mode:'quiz',detail};
const retry={...first,id:'paper-correct',at:'2026-09-10T12:00:00.000Z',result:'correct'};
const merged=sync.merge(base,[retry,first]);assert.equal(merged.history.length,2);assert.equal(merged.history[0].detail.question,detail.question);assert.equal(h.stats(79,merged.history).points,0);assert.equal(h.stats(79,merged.history).answered,1);
assert.deepEqual(sync.merge(merged,[first,retry]).history,merged.history);
assert.equal(h.stats(63,[]).bonus,2);assert.equal(h.stats(63,[]).total,49);
const all=h.rows.filter(r=>r.round===63&&r.answer!==null).map((r,i)=>({...first,id:'full-'+i,cardId:r.id,result:'correct'}));assert.equal(h.stats(63,all).points,100);assert.equal(h.stats(63,all).complete,true);

// 인사혁신처 9급 기출: 공식 정답표를 그대로 옮긴 표와 문항별로 대조한다. 앱이 정답을 스스로 판단하지 않는다.
const gichul=require('./gichul.js'),gichulKeys=JSON.parse(fs.readFileSync(__dirname+'/docs/gichul-answer-keys.json','utf8'));
const gCards=[],gOptions={};gichul.install(gCards,gOptions);
assert.equal(gichul.papers.length,Object.keys(gichulKeys.keys).length,'정답표에 없는 회차를 싣지 않는다');
let gTotal=0,gSkipped=0;
for(const paper of gichul.papers){
 const key=gichulKeys.keys[paper.id];assert(key,'정답표 없는 회차: '+paper.id);
 assert.equal(key.answers.length,20,'9급 필기는 과목당 20문항이다: '+paper.id);
 const numbers=paper.questions.map(q=>q.n),skipped=paper.skipped.map(x=>x.n);
 assert.deepEqual([...numbers,...skipped].sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i+1),'수록 문항과 제외 문항을 합치면 원문 20문항이어야 한다: '+paper.id);
 assert.equal(new Set(numbers).size,numbers.length,'문항 번호 중복: '+paper.id);
 assert.deepEqual(numbers,[...numbers].sort((a,b)=>a-b),'원문 문항 번호 순서로 담는다: '+paper.id);
 for(const x of paper.skipped)assert(x.why&&x.why.length>=10,'제외 사유를 남겨야 한다: '+paper.id+' '+x.n);
 for(const q of paper.questions){
  gTotal++;
  const id=gichul.cardId(paper,q.n),card=gCards.find(c=>c.id===id),options=gOptions[id];
  assert.equal(q.a,Number(key.answers[q.n-1]),'공식 정답과 다르다: '+id);
  assert.equal(options.correctIndex,q.a-1);
  assert.equal(options.fixedOrder,true,'공식 보기는 순서를 섞지 않는다: '+id);
  assert.equal(options.image,undefined,'9급 기출은 이미지가 아니라 원문 텍스트다: '+id);
  assert.equal(options.choices.length,4,'9급 필기는 4지선다다: '+id);
  options.choices.forEach((choice,i)=>assert(choice.startsWith(['①','②','③','④'][i]),'원문 보기 번호를 그대로 단다: '+id));
  assert.equal(card.answer,options.choices[q.a-1]);
  assert.equal(card.subject,paper.subject);
  assert(card.question.trim()&&card.explanation.includes('공식 정답: '),'해설은 공식 정답을 먼저 밝힌다: '+id);
  assert(card.source.includes('data.go.kr')&&card.source.includes('인사혁신처')&&card.source.includes(q.n+'번'),'출처 줄에 발행 기관·데이터셋·문항 번호가 있어야 한다: '+id);
  // 보기 순서는 몇 번을 다시 풀어도 원문 그대로다.
  for(const count of [0,1,3]){const e=practice.select(card,Array.from({length:count},()=>({cardId:id})),{},gOptions);assert.equal(e.correctIndex,q.a-1);assert.deepEqual(e.choices,options.choices);}
 }
 gSkipped+=skipped.length;
}
assert.equal(gTotal,gCards.length);
assert.equal(new Set(gCards.map(c=>c.id)).size,gCards.length,'카드 id 중복');
assert(gCards.every(c=>c.id.startsWith('gichul-')),'공식 기출은 gichul- 접두사로만 식별한다');
// 접두사는 content-audit.cjs의 보기 길이 편향 면제 기준이기도 하다. 둘이 어긋나면 면제가 조용히 풀린다.
assert(fs.readFileSync(__dirname+'/content-audit.cjs','utf8').includes('VERBATIM_OFFICIAL=/^(?:hanneung|gichul)-/'),'길이 편향 면제가 hanneung-·gichul- 접두사에 걸려 있어야 한다');
console.log('PASS hanneung: official keys, 1,150 immutable images, 1,149 fixed-order quizzes, annulment, weighted first scores and sync snapshots; 인사혁신처 9급 기출 '+gichul.papers.length+'회차 '+gTotal+'문항이 공식 정답표와 일치하고 '+gSkipped+'문항은 사유와 함께 제외됐다');
