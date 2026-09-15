const assert=require('node:assert/strict'),M=require('./memorize.js');
// 외울 것 목록의 형태를 지킨다: 외우는 글자와 이름이 어긋나거나, 연도가 들어가거나, 빈 칸이 생기면 멈춘다.
const ids=new Set();
for(const set of M.sets){
 assert(set.id&&!ids.has(set.id),'set id unique: '+set.id);ids.add(set.id);
 assert(set.title&&set.subject&&set.hint,'set has title, subject and hint: '+set.id);
 assert.equal([set.lines,set.pairs,set.groups].filter(Boolean).length,1,'a set is an ordered list, a pair list or term cards: '+set.id);
 const texts=[set.title,set.hint];
 if(set.lines){
  for(const line of set.lines){
   assert(line.items.length>0,'line has items');
   // 외우는 글자 한 자 = 이름 첫 글자 한 자. 첫 글자가 겹치는 왕(충렬왕~충정왕)은 item.letter를 적고, 그 글자가 이름 안에 있어야 한다.
   assert.equal([...line.chant].length,line.items.length,'chant length matches items: '+line.chant);
   line.items.forEach((item,i)=>{assert(item.name,'item has a name');
    if('letter' in item){assert.equal([...item.letter].length,1,'letter is one character: '+item.name);assert([...item.name].slice(1).includes(item.letter),'letter comes from inside the name (not its first letter): '+item.name);}
    assert.equal('letter' in item?item.letter:[...item.name][0],[...line.chant][i],'chant letter '+(i+1)+' of '+line.chant+' matches '+item.name);assert(Array.isArray(item.facts));for(const f of item.facts){assert(typeof f==='string'&&f.trim(),'fact text');texts.push(f);}texts.push(item.name);});
  }
 }else if(set.groups){
  for(const g of set.groups){assert(g.title&&g.cards.length,'group has a title and cards: '+set.id);texts.push(g.title);for(const c of g.cards){assert.equal(c.length,2,'card = [front, back]');c.forEach(t=>{assert(typeof t==='string'&&t.trim());texts.push(t);});}}
 }else{
  for(const p of set.pairs){assert.equal(p.length,4,'pair = [left, left detail, right, right detail]');p.forEach(t=>{assert(typeof t==='string'&&t.trim());texts.push(t);});}
 }
 assert(M.size(set)>0);
 // 연도 금지는 한국사 목록의 규칙이다(논리의 ‘256가지’ 같은 수는 연도가 아니다).
 if(set.subject==='한국사')for(const t of texts)assert(!/\d{3,4}\s*년|\b[1-9]\d{2,3}\b/.test(t),'no years in memorize text: '+t);
 // 한자는 한글 바로 뒤 괄호 안에만 쓴다: 정언(定言), 정(定, 정할 정). 한자만 따로 쓰거나 한자를 앞에 두지 않는다.
 for(const t of texts)for(const m of t.matchAll(/[\u4e00-\u9fff]+/g)){const open=t.lastIndexOf('(',m.index),close=t.lastIndexOf(')',m.index);assert(open>close&&/[가-힣]/.test(t[open-1]||''),'한글(한자) 순서: '+t);}
}
// 고려 왕 순서는 태조부터 공양왕까지 34명이며(12강까지 공부), 공부한 범위의 왕에만 사건이 붙는다.
const kings=M.get('goryeo-kings').lines.flatMap(l=>l.items);
assert.equal(kings.length,34);assert.equal(kings[0].name,'태조');assert.equal(kings.at(-1).name,'공양왕');
assert.deepEqual(M.get('goryeo-kings').lines.map(l=>l.chant),['태혜정광경성목','현덕정문순선헌','숙예인의명신희','강고원','렬선숙혜목정','공우창공']);
assert.deepEqual(kings.slice(21).map(k=>k.name),['강종','고종','원종','충렬왕','충선왕','충숙왕','충혜왕','충목왕','충정왕','공민왕','우왕','창왕','공양왕']);
// 첫 글자가 같은 충- 왕 여섯은 모두 letter를 갖고, 그 밖의 왕은 letter를 갖지 않는다.
assert.deepEqual(kings.filter(k=>'letter' in k).map(k=>k.name),['충렬왕','충선왕','충숙왕','충혜왕','충목왕','충정왕']);
for(const name of ['태조','정종','광종','경종','성종','현종','숙종','예종','인종','의종','명종','신종','희종','고종','원종','충렬왕','충선왕','충목왕','공민왕','우왕','창왕','공양왕'])assert(kings.some(k=>k.name===name&&k.facts.length),'studied king has facts: '+name);
for(const name of ['덕종','문종','순종','선종','헌종','강종','충숙왕','충혜왕','충정왕'])assert(kings.find(k=>k.name===name).facts.length===0,'unstudied king stays blank: '+name);
assert.deepEqual(M.get('military-rulers').lines[0].items.map(i=>i.name),['이의방','정중부','경대승','이의민','최충헌','최우']);
// 정언 논리(국어 논리 3장): 용어 뜻 21개, 알파벳 10개(A·E·I·O · S·P·M · 식 읽기), 핵심 30개.
assert.equal(M.size(M.get('logic-categorical-terms')),21);assert.equal(M.size(M.get('logic-categorical-letters')),10);assert.equal(M.size(M.get('logic-categorical-core')),30);
console.log('PASS memorize: '+M.sets.length+' sets, chant letters match names, no years, studied range only');
