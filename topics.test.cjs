const assert=require('node:assert/strict');
require('./study-review-catalog.js');const topics=require('./topics.js'),catalog=globalThis.STUDY_REVIEW_CATALOG;
const byCard=topics.byCard(catalog);
// Every summary question belongs to exactly one topic, and every topic has questions.
assert.equal(byCard.size,Object.keys(catalog.questions).length);
for(const t of topics.list.filter(t=>t.sections.length))assert([...byCard.values()].includes(t.id),'Empty topic '+t.id);
assert.equal(new Set(topics.list.map(t=>t.id)).size,topics.list.length);
for(const t of topics.list)assert.match(t.id,/^[a-z-]+$/);
// Earlier short sets stay inside the matching era topic.
assert.equal(byCard.get(catalog.sets[0].ids[0]),'prehistory');
assert.equal(byCard.get(catalog.sets[4].ids[0]),'compare');
// v30: Three-Kingdoms-wide comparisons from 07·08강 form their own topic right after 백제·신라·삼국 통일; official papers never map there.
assert.equal(topics.list.findIndex(t=>t.id==='three-kingdoms'),topics.list.findIndex(t=>t.id==='baekje-silla')+1);
assert.equal(topics.title('three-kingdoms'),'삼국 공통·비교');
assert.equal(byCard.get('lecture-hist-20260911-001'),'three-kingdoms');
assert([...byCard.values()].filter(t=>t==='three-kingdoms').length>=10);
assert.throws(()=>topics.byCard({questions:{x:{section:'없는 단원'}}}),/No topic/);
// Every official paper question has a reviewed era topic; eras run in order within a round.
require('./hanneung-data.js');require('./hanneung-explanations.js');require('./hanneung.js');
const papers=require('./hanneung-topics.js'),all=topics.byCard(catalog,papers),rows=globalThis.Hanneung.rows;
assert.equal(Object.keys(papers).length,rows.length);
for(const r of rows)assert(all.get(r.id),'No topic for '+r.id);
assert.throws(()=>topics.byCard(catalog,{x:'nowhere'}),/Unknown topic/);
assert.equal(all.get('hanneung-79-01'),'prehistory');assert.equal(all.get('hanneung-79-45'),'contemporary');
const order=['prehistory','gojoseon','goguryeo-gaya','baekje-silla','three-kingdoms','unified-silla','balhae','later-three','compare','goryeo','joseon-early','joseon-late','opening','korean-empire','colonial','contemporary'];
for(const round of globalThis.Hanneung.rounds){const first=rows.filter(r=>r.round===round&&r.number<=3).map(r=>order.indexOf(papers[r.id]));assert(first.every(i=>i>=0&&i<=3),'round '+round+' opens in early eras');}
const counts={};for(const t of Object.values(papers))counts[t]=(counts[t]||0)+1;
console.log('topics passed: '+byCard.size+' summary + '+rows.length+' paper questions in '+topics.list.length+' topics',JSON.stringify(counts));
