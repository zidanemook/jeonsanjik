const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const practice=require('./practice.js'),bank=require('./practice-bank.js'),ctx={};vm.createContext(ctx);
for(const f of ['core-review-pack.js','quiz-options.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
for(const [id,lesson]of Object.entries(bank)){
 assert.ok(lesson.rule&&lesson.hook&&lesson.examples.length&&lesson.variants.length>=2,id);
 for(const e of lesson.variants){assert.ok(e.question&&e.explanation);if(e.type==='text'){assert.ok(e.answers.length);for(const a of e.answers){assert.ok(practice.grade(e,'  '+a.toUpperCase()+' .  '));}assert.equal(practice.grade(e,'incorrect answer'),false);}else{assert.equal(e.type,'choice');assert.equal(e.choices.length,4);assert.ok(e.choices[e.correctIndex]);}}
 const c=ctx.CORE_REVIEW_PACK.find(c=>c.id===id)||{id,question:lesson.variants[0].question};
 const first=practice.select(c,[],bank,ctx.QUIZ_OPTIONS),second=practice.select(c,[{cardId:id}],bank,ctx.QUIZ_OPTIONS);
 assert.notEqual(first.key,second.key);assert.notEqual(first.question,second.question);
}
const c=ctx.CORE_REVIEW_PACK[0],options=ctx.QUIZ_OPTIONS;
const picks=Array.from({length:8},(_,i)=>practice.select(c,Array.from({length:i},()=>({cardId:c.id})),bank,options));
for(const e of picks)assert.equal(e.choices[e.correctIndex],options[c.id].choices[options[c.id].correctIndex]);
assert.ok(new Set(picks.map(e=>e.correctIndex)).size>1);
// Choice variants inside a lesson keep their own key/explanation through shuffle and refresh.
for(const [id,lesson]of Object.entries(bank)){
 const card=ctx.CORE_REVIEW_PACK.find(c=>c.id===id)||{id,question:lesson.variants[0].question};
 for(const row of lesson.variants.filter(e=>e.type==='choice')){
  const n=lesson.variants.length+(options[id]?1:0);
  const shown=Array.from({length:n*2},(_,i)=>practice.select(card,Array.from({length:i},()=>({cardId:id})),bank,options)).filter(e=>e.question===row.question);
  assert.equal(shown.length,2);for(const e of shown){assert.equal(e.choices[e.correctIndex],row.choices[row.correctIndex]);assert.equal(e.explanation,row.explanation);const fresh=practice.refresh(card,e,bank,options);assert.equal(fresh.exerciseId,e.exerciseId);assert.deepEqual(fresh.choices,e.choices);}
 }
}
assert.equal(practice.grade(bank['en-session-20260909-help'].variants[0],'to learn'),true);
assert.equal(practice.grade(bank['en-session-20260909-help'].variants[0],'learning'),false);
// Adversarial review: valid forms must not be marked wrong; future-tense distractors still fail.
const time=bank['en-session-20260909-time-clause'].variants;
assert.equal(practice.grade(time[0],'has arrived'),true);
assert.equal(practice.grade(time[1],'has stopped'),true);
assert.equal(practice.grade(time[0],'will arrive'),false);
assert.equal(practice.grade(time[1],'will stop'),false);
assert.equal(practice.grade(bank['en-session-20260909-difficulty'].variants[1],'in understanding'),true);
assert.equal(practice.grade(bank['en-session-20260909-difficulty'].variants[1],'in understand'),false);
// Updating an explanation refreshes an unfinished item without changing its shuffled options.
const stale=structuredClone(picks[3]);stale.explanation='old explanation';
const refreshed=practice.refresh(c,stale,bank,options);
assert.deepEqual(refreshed.choices,stale.choices);assert.equal(refreshed.correctIndex,stale.correctIndex);
assert.equal(refreshed.explanation,c.explanation);
assert.notEqual(refreshed.explanation,stale.explanation);
// Adding a new leading exercise preserves an already open typed variant by identity.
const typedCard={id:'test-stable',question:'base',explanation:'base explanation'};
const typedBank={'test-stable':{variants:[{type:'text',question:'Write the form: old example.',answers:['old'],explanation:'Old example.'}]}};
const savedTyped=practice.select(typedCard,[],typedBank,{});
const insertedOptions={'test-stable':{question:'Choose a new example.',choices:['a','b','c','d'],correctIndex:2,explanation:'Dedicated MCQ explanation.'}};
const sameTyped=practice.refresh(typedCard,savedTyped,typedBank,insertedOptions);
assert.equal(sameTyped.exerciseId,savedTyped.exerciseId);assert.equal(sameTyped.variantIndex,1);
const newMcq=practice.select(typedCard,[],typedBank,insertedOptions);assert.equal(newMcq.explanation,'Dedicated MCQ explanation.');
for(const suffix of ['collective','none']){const variant=bank['grammar-agreement-'+suffix].variants[1];assert.equal(practice.grade(variant,'is'),true);assert.equal(practice.grade(variant,'are'),true);assert.equal(practice.grade(variant,'be'),false);}
assert.equal(practice.normalize(" HADN’T   MISSED. "),"hadn't missed");
const sync=require('./sync-core.js');const state={cards:[{id:'a',ease:2.5,interval:0,streak:0}],history:[]};
const merged=sync.merge(state,[{id:'event1',cardId:'a',date:'2026-09-09',at:'2026-09-09T10:00:00Z',result:'unsure',mode:'quiz'}]);
assert.equal(merged.cards[0].due,'2026-09-10');assert.equal(merged.cards[0].retryAt,undefined);assert.equal(merged.cards[0].streak,0);
console.log('PASS practice: answer normalization, alternative valid answers, contrasting variants, shuffled answer mapping, assisted progress on another device');
