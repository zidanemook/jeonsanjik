const assert=require('node:assert/strict'),M=require('./memorize.js');
// 외울 것 목록의 형태를 지킨다: 외우는 글자와 이름이 어긋나거나, 연도가 들어가거나, 빈 칸이 생기면 멈춘다.
const ids=new Set();
for(const set of M.sets){
 assert(set.id&&!ids.has(set.id),'set id unique: '+set.id);ids.add(set.id);
 assert(set.title&&set.subject&&set.hint,'set has title, subject and hint: '+set.id);
 assert(!!set.lines!==!!set.pairs,'a set is either an ordered list or a pair list: '+set.id);
 const texts=[set.title,set.hint];
 if(set.lines){
  for(const line of set.lines){
   assert(line.items.length>0,'line has items');
   // 외우는 글자 한 자 = 이름 첫 글자 한 자.
   assert.equal([...line.chant].length,line.items.length,'chant length matches items: '+line.chant);
   line.items.forEach((item,i)=>{assert(item.name,'item has a name');assert.equal([...item.name][0],[...line.chant][i],'chant letter '+(i+1)+' of '+line.chant+' matches '+item.name);assert(Array.isArray(item.facts));for(const f of item.facts){assert(typeof f==='string'&&f.trim(),'fact text');texts.push(f);}texts.push(item.name);});
  }
 }else{
  for(const p of set.pairs){assert.equal(p.length,4,'pair = [left, left detail, right, right detail]');p.forEach(t=>{assert(typeof t==='string'&&t.trim());texts.push(t);});}
 }
 assert(M.size(set)>0);
 for(const t of texts)assert(!/\d{3,4}\s*년|\b[1-9]\d{2,3}\b/.test(t),'no years in memorize text: '+t);
}
// 고려 왕 순서는 태조부터 희종까지 21명이며, 공부한 범위의 왕에만 사건이 붙는다.
const kings=M.get('goryeo-kings').lines.flatMap(l=>l.items);
assert.equal(kings.length,21);assert.equal(kings[0].name,'태조');assert.equal(kings.at(-1).name,'희종');
for(const name of ['태조','정종','광종','경종','성종','인종','의종','명종','신종','희종'])assert(kings.some(k=>k.name===name&&k.facts.length),'studied king has facts: '+name);
for(const name of ['현종','덕종','문종','순종','선종','헌종','숙종','예종'])assert(kings.find(k=>k.name===name).facts.length===0,'unstudied king stays blank: '+name);
assert.deepEqual(M.get('military-rulers').lines[0].items.map(i=>i.name),['이의방','정중부','경대승','이의민','최충헌','최우']);
console.log('PASS memorize: '+M.sets.length+' sets, chant letters match names, no years, studied range only');
