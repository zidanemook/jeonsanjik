const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const h=require('./hanneung.js'),practice=require('./practice.js'),record=require('./review-record.js'),sync=require('./sync-core.js'),schedule=require('./scheduler.js');
const keys=JSON.parse(fs.readFileSync(__dirname+'/docs/hanneung-answer-keys.json','utf8'));
assert.equal(h.rows.length,1150);assert.equal(new Set(h.rows.map(r=>r.id)).size,1150);
assert.equal(h.rounds.length,23);
const cards=[],options={};h.install(cards,options);assert.equal(cards.length,1149);assert(!options['hanneung-63-42']);
const explanations=require('./hanneung-explanations.js');
assert.deepEqual(Object.keys(explanations),Array.from({length:10},(_,i)=>'hanneung-79-'+String(i+1).padStart(2,'0')));
for(const [id,e]of Object.entries(explanations)){
 assert.equal(e.choices.length,5,id);assert(e.clue&&e.reason&&e.hook&&e.reviewedOn);
 assert(e.sources.length>0);for(const s of e.sources){assert(s.title);const url=new URL(s.url);assert.equal(url.protocol,'https:');assert(['contents.history.go.kr','www.heritage.go.kr'].includes(url.hostname));}
 assert(!options[id].explanation.includes('아직 제공하지 않습니다'));assert(options[id].explanation.length<8000);
 const c=cards.find(c=>c.id===id),e2=practice.select(c,[],{},options),detail=record.create(c,e2,e2.correctIndex,null,id);assert.equal(detail.explanation,h.explanation(id));
}
assert(options['hanneung-79-11'].explanation.includes('아직 제공하지 않습니다'));
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
console.log('PASS hanneung: official keys, 1,150 immutable images, 1,149 fixed-order quizzes, annulment, weighted first scores and sync snapshots');
