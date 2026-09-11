const assert=require('node:assert/strict');
require('./study-review-catalog.js');const topics=require('./topics.js'),catalog=globalThis.STUDY_REVIEW_CATALOG;
const byCard=topics.byCard(catalog);
// Every summary question belongs to exactly one topic, and every topic has questions.
assert.equal(byCard.size,Object.keys(catalog.questions).length);
for(const t of topics.list)assert([...byCard.values()].includes(t.id),'Empty topic '+t.id);
assert.equal(new Set(topics.list.map(t=>t.id)).size,topics.list.length);
for(const t of topics.list)assert.match(t.id,/^[a-z-]+$/);
// Earlier short sets stay inside the matching era topic.
assert.equal(byCard.get(catalog.sets[0].ids[0]),'prehistory');
assert.equal(byCard.get(catalog.sets[4].ids[0]),'compare');
assert.throws(()=>topics.byCard({questions:{x:{section:'없는 단원'}}}),/No topic/);
console.log('topics passed: '+byCard.size+' questions in '+topics.list.length+' topics');
