const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const practice=require('./practice.js'),bank=require('./practice-bank.js'),policy=require('./review-policy.js'),record=require('./review-record.js');
function catalog(){const ctx={};vm.createContext(ctx);for(const f of ['core-review-pack.js','quiz-options.js','hanneung-data.js','hanneung.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);const cards=[...ctx.CORE_REVIEW_PACK];for(const [id,l]of Object.entries(bank))if(!cards.some(c=>c.id===id))cards.push({id,subject:'영어',question:l.variants[0].question,explanation:l.variants[0].explanation});
 for(const id of Object.keys(ctx.QUIZ_OPTIONS))assert(cards.some(c=>c.id===id),'Orphan MCQ: '+id);
 const ids=new Set(),items=[];
 for(const c of cards){assert(!ids.has(c.id),'Duplicate card');ids.add(c.id);const n=(ctx.QUIZ_OPTIONS[c.id]?1:0)+(bank[c.id]?.variants.length||0);assert(n>0);for(let i=0;i<n;i++){const exercise=practice.select(c,Array.from({length:i},()=>({cardId:c.id})),bank,ctx.QUIZ_OPTIONS);items.push({card:c,lesson:bank[c.id],exercise,conceptId:policy.concept(c.id)});}}
 return items;
}
function digest(item){return crypto.createHash('sha256').update(JSON.stringify([item.exercise,item.lesson||null,item.conceptId])).digest('hex');}
function structural(items){const seen=new Set();for(const item of items){const e=item.exercise;assert(e.question.trim()&&e.explanation.trim(),'Missing question/explanation');assert(!seen.has(e.exerciseId),'Duplicate exercise identity');seen.add(e.exerciseId);
 if(e.type==='choice'){assert(e.choices.length>=2&&e.choices.length<=6);assert(Number.isInteger(e.correctIndex)&&e.correctIndex>=0&&e.correctIndex<e.choices.length);assert.equal(new Set(e.choices.map(practice.normalize)).size,e.choices.length,'Duplicate normalized options');}
 else{assert(e.answers.length>0);assert.equal(new Set(e.answers.map(practice.normalize)).size,e.answers.length,'Duplicate accepted answer');for(const answer of e.answers)assert(practice.grade(e,answer),'Accepted answer rejected');}
 record.create(item.card,e,e.type==='choice'?e.correctIndex:e.answers[0],item.lesson,item.conceptId);
 if(item.card.id==='grammar-agreement-identity')assert(/한 명|두 명/.test(e.question),'Person count context required');
 }
}
function coverage(items,policy=JSON.parse(fs.readFileSync(__dirname+'/content-coverage.json','utf8'))){
 assert.equal(policy.schema,1);const byCard=new Map();for(const item of items){if(!byCard.has(item.card.id))byCard.set(item.card.id,[]);byCard.get(item.card.id).push(item);if(item.exercise.type==='choice'){const official=item.card.id.startsWith('hanneung-');assert.equal(item.exercise.choices.length,official?5:4,(official?'Five options required: ':'Four options required: ')+item.card.id);if(official)assert(item.exercise.fixedOrder&&item.exercise.image,'Original choices and image required');}}
 for(const [rule,id]of Object.entries(policy.requiredRules))assert(byCard.has(id),'Missing coverage: '+rule+' / '+id);
 for(const [id,rows]of byCard){if(rows[0].card.subject!=='영어'||policy.englishNonGrammar.includes(id))continue;const typed=rows.filter(x=>x.exercise.type==='text');assert(typed.length>=2,'At least two written variants required: '+id);assert(rows.some(x=>x.exercise.type==='choice'),'MCQ required: '+id);assert(new Set(typed.map(x=>practice.normalize(x.exercise.question))).size>=2,'Distinct written variants required: '+id);assert(rows[0].lesson,'Grammar lesson required: '+id);}
}
function verify(items,ledger){structural(items);coverage(items);assert.equal(ledger.schema,1);assert.equal(Object.keys(ledger.items).length,items.length,'Unreviewed addition/deletion');for(const item of items)assert.equal(ledger.items[item.exercise.exerciseId],digest(item),'Content changed: review meaning, alternatives and context before updating ledger: '+item.exercise.exerciseId);}
module.exports={catalog,digest,structural,coverage,verify};
if(require.main===module){const items=catalog();verify(items,JSON.parse(fs.readFileSync(__dirname+'/content-review.json','utf8')));console.log('PASS content audit: '+items.length+' reviewed exercises; structure, answer acceptance, context regression and review fingerprints');}
