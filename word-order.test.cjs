'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const W=require('./word-order.js'),P=require('./practice.js'),bank=require('./practice-bank.js');
const quiz=bank['en-day7-048'].variants[0],snapshot=JSON.stringify(quiz),items=W.collect(quiz);
assert.equal(items.length,1);
assert.deepEqual(items[0].words,['effort','it','takes']);
assert.equal(items[0].before,'However much ');
assert.equal(items[0].after,', learning a language is worth it.');
assert.equal(W.target({wrong:'He are happy',fix:'He is happy'},'He is happy.'),null);
assert.equal(W.target({wrong:'i h g f e d c b a',fix:'a b c d e f g h i'},'a b c d e f g h i.'),null);
assert.equal(W.target({wrong:'it takes effort',fix:'it takes effort'},'it takes effort.'),null);
assert.equal(W.target({wrong:'it takes effort',fix:'effort it takes'},'another sentence'),null);
assert.equal(W.target({wrong:'a a b',fix:'a b b'},'a b b'),null);
assert.deepEqual(W.target({wrong:'TAKES effort, it',fix:'effort it takes'},'effort it takes.').words,['effort','it','takes']);
assert.equal(W.collect({...quiz,type:'text'}).length,0);
for(const random of [()=>0,()=>0.999999,Math.random])for(let i=0;i<30;i++){
 const a=['effort','it','takes'],shuffled=W.shuffle(a,random);
 assert.notDeepEqual(shuffled,a);assert.deepEqual([...shuffled].sort(),[...a].sort());assert.deepEqual(a,['effort','it','takes']);
 assert.notDeepEqual(W.shuffle(['a','a','b'],random),['a','a','b']);
}
assert.deepEqual(W.grade(items[0].words,['effort','it','takes']),{correct:true,slots:[true,true,true]});
assert.deepEqual(W.grade(items[0].words,['it','effort','takes']),{correct:false,slots:[false,false,true]});
assert.equal(W.grade(items[0].words,['effort']).correct,false);
assert.equal(W.grade(['a','a','b'],['a','b','a']).correct,false);
for(let n=0;n<8;n++){
 const selected=P.select({id:'en-day7-048'},Array.from({length:n},()=>({cardId:'en-day7-048'})),bank,{});
 assert.deepEqual(W.collect(selected)[0].words,items[0].words);
}
assert.equal(JSON.stringify(quiz),snapshot);
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8'),ci=fs.readFileSync('.github/workflows/pages.yml','utf8');
assert.match(html,/word-order\.js\?v=\d+/);assert.match(sw,/word-order\.js\?v=\d+/);assert.match(ci,/node word-order\.test\.cjs/);assert.match(ci,/cp .*word-order\.js/);
console.log('PASS word-order: eligibility, unchanged context, duplicates, shuffled choices, shuffle fallback, grading, no source mutations, offline and CI wiring');
