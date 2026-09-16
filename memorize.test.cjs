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
// 13강(고려 경제·사회)을 공부하면서 목종(개정 전시과)·문종(경정 전시과)에도 공부한 사실이 생겼다. 그래서 문종은 "비움" 목록에서 "사실 있음" 목록으로 옮겼다(2026-09-16).
for(const name of ['목종','문종'])assert(kings.some(k=>k.name===name&&k.facts.length),'studied king has facts (13강 전시과): '+name);
for(const name of ['덕종','순종','선종','헌종','강종','충숙왕','충혜왕','충정왕'])assert(kings.find(k=>k.name===name).facts.length===0,'unstudied king stays blank: '+name);
assert.deepEqual(M.get('military-rulers').lines[0].items.map(i=>i.name),['이의방','정중부','경대승','이의민','최충헌','최우']);
// 정언 논리(국어 논리 3장): 용어 뜻 21개, 알파벳 10개(A·E·I·O · S·P·M · 식 읽기), 핵심 30개.
assert.equal(M.size(M.get('logic-categorical-terms')),21);assert.equal(M.size(M.get('logic-categorical-letters')),10);assert.equal(M.size(M.get('logic-categorical-core')),30);

// ── 왕 하나를 고리로: 고대 왕 목록 + 인물·책·나라 뒤집기 묶음 (2026-09-16) ──
const KING_SETS={고구려:'goguryeo-kings',백제:'baekje-kings',신라:'silla-kings',발해:'balhae-kings',고려:'goryeo-kings'};
const names=id=>M.get(id).lines.flatMap(l=>l.items.map(i=>i.name));
// 시험에 나오는 왕만, 순서대로. 첫 글자가 한 줄 안에서 겹치는 왕만 letter를 쓴다.
assert.deepEqual(names('goguryeo-kings'),['유리왕','고국천왕','동천왕','미천왕','고국원왕','소수림왕','광개토 대왕','장수왕','영양왕','보장왕']);
assert.deepEqual(M.get('goguryeo-kings').lines.map(l=>l.chant),['유천동미원소','광장영보']);
assert.deepEqual(names('baekje-kings'),['온조','고이왕','근초고왕','침류왕','비유왕','개로왕','문주왕','삼근왕','동성왕','무령왕','성왕','무왕','의자왕']);
assert.deepEqual(M.get('baekje-kings').lines.map(l=>l.chant),['온고근침비개','문삼동무','성무의']);
assert.deepEqual(names('silla-kings'),['내물 마립간','눌지 마립간','소지 마립간','지증왕','법흥왕','진흥왕','진평왕','선덕 여왕','진덕 여왕','무열왕','문무왕','신문왕','효소왕','성덕왕','경덕왕','혜공왕','원성왕','헌덕왕','흥덕왕','문성왕','진성 여왕','경애왕','경순왕']);
assert.deepEqual(M.get('silla-kings').lines.map(l=>l.chant),['내눌소지법진평선덕','무문신효성경혜','원헌흥문진애순']);
assert.deepEqual(names('balhae-kings'),['대조영','무왕','문왕','선왕']);
for(const [id,withLetter] of [['goguryeo-kings',['고국천왕','고국원왕']],['baekje-kings',[]],['silla-kings',['진평왕','진덕 여왕','경애왕','경순왕']],['balhae-kings',[]]]){
 const set=M.get(id);assert.equal(set.subject,'한국사');
 assert.deepEqual(set.lines.flatMap(l=>l.items).filter(i=>'letter' in i).map(i=>i.name),withLetter,'letters only where first letters collide: '+id);
 for(const line of set.lines){const firsts=line.items.map(i=>[...i.name][0]),chant=[...line.chant];line.items.forEach((item,i)=>{if('letter' in item)assert(firsts.filter(f=>f===firsts[i]).length>1,'letter only when the first letter collides: '+item.name);else assert.equal(chant.filter(c=>c===firsts[i]).length,1,'chant letter repeats inside a line, needs letter: '+item.name);});}
 // 고대 왕은 모두 공부한 범위다: 사실이 비어 있으면 화면에 "아직 공부하지 않은 범위"가 떠서 틀린 안내가 된다.
 for(const item of set.lines.flatMap(l=>l.items))assert(item.facts.length>0,'ancient king has studied facts: '+item.name);
}
// 뒤집기 묶음의 앞머리(첫 " · " 앞)에 적힌 "왕(나라)"는 그 나라 왕 목록에 있어야 하고, 그 왕의 사실에 앞면 이름이 들어 있어야 한다.
const KING_TOKEN=/((?:[가-힣]+(?: 여왕| 마립간| 대왕)?)(?:·[가-힣]+(?: 여왕| 마립간| 대왕)?)*)\((고구려|백제|신라|발해|고려)\)/g;
const anchorsOf=back=>[...back.split(' · ')[0].matchAll(KING_TOKEN)].flatMap(m=>m[1].split('·').map(king=>({king,country:m[2]})));
const factsOf=(country,king)=>{const items=M.get(KING_SETS[country]).lines.flatMap(l=>l.items).filter(i=>i.name===king);assert(items.length,'anchor king is in the '+country+' king list: '+king);return items.map(i=>i.facts.join(' | '));};
const anchoredCards={};
for(const id of ['history-people','history-books']){
 const set=M.get(id);assert(set&&set.groups,'set exists: '+id);
 const fronts=new Set();anchoredCards[id]=0;
 for(const g of set.groups)for(const [front,back] of g.cards){
  assert(!fronts.has(front),'no duplicate front: '+front);fronts.add(front);
  const name=front.replace(/\([^)]*\)/g,'').trim();
  if(anchorsOf(back).length)anchoredCards[id]++;
  for(const {king,country} of anchorsOf(back)){assert(factsOf(country,king).some(f=>f.includes(name)),id+': '+king+'('+country+') facts name '+name);}
 }
}
assert.deepEqual(M.get('history-people').groups.map(g=>g.title),['고조선~삼국','통일 신라·발해·후삼국','고려 전기','고려 무신~원 간섭기','고려 말']);
assert.deepEqual(M.get('history-books').groups.map(g=>g.title),['삼국','통일 신라','고려 전기','고려 무신~원 간섭기','고려 말']);
assert.equal(M.size(M.get('history-people')),132);assert.equal(M.size(M.get('history-books')),39);
// 왕에 걸린 앞머리: 인물 98 · 책 19. 나머지(인물 34 · 책 20)는 왕이 하나로 정해지지 않아 시기만 적었다(고조선·가야, 일본 전파, 승려·학자 등).
// 15강(2026-09-16)으로 책 6(초조대장경 현종·『상정고금예문』 인종·팔만대장경 고종·『직지심체요절』 우왕 + 교장·『향약구급방』은 시기만)과 인물 1(혜허, 시기만)을 더했다.
assert.deepEqual(anchoredCards,{'history-people':98,'history-books':19});
// 대조군: 없는 왕·사실에 없는 인물은 잡혀야 한다.
assert.throws(()=>factsOf('고려','없는왕'));
assert(!factsOf('신라','진흥왕').some(f=>f.includes('이사부')),'control: 이사부 is 지증왕, not in 진흥왕 facts');
assert.deepEqual(anchorsOf('보장왕(고구려)·문무왕(신라) 멸망 뒤 · x'),[{king:'보장왕',country:'고구려'},{king:'문무왕',country:'신라'}]);
assert.deepEqual(anchorsOf('명종·희종(고려) · x'),[{king:'명종',country:'고려'},{king:'희종',country:'고려'}]);
assert.deepEqual(anchorsOf('고려 무신 집권기 · 인종(고려) 뒤쪽은 보지 않음'),[]);
// 인물·책의 핵심 고리 몇 개를 못 박는다(시험이 인물·책을 단서로 왕을 묻는 짝).
const back=(id,front)=>M.get(id).groups.flatMap(g=>g.cards).find(c=>c[0]===front)[1];
for(const [front,king] of [['거칠부','진흥왕(신라)'],['이사부','지증왕(신라)'],['을파소','고국천왕(고구려)'],['장문휴','무왕(발해)'],['김헌창','헌덕왕(신라)'],['쌍기','광종(고려)'],['서희','성종(고려)'],['최우','고종(고려)'],['안향','충렬왕(고려)'],['최무선','우왕(고려)']])assert(back('history-people',front).startsWith(king),front+' → '+king);
for(const [front,king] of [['초조대장경','현종(고려)'],['『상정고금예문』','인종(고려)'],['팔만대장경(재조대장경)','고종(고려)'],['『직지심체요절』','우왕(고려)'],['『국사』','진흥왕(신라)'],['『서기』','근초고왕(백제)'],['『신집』','영양왕(고구려)'],['『삼국사기』','인종(고려)'],['『삼국유사』','충렬왕(고려)'],['『제왕운기』','충렬왕(고려)'],['「화왕계」','신문왕(신라)']])assert(back('history-books',front).startsWith(king),front+' → '+king);
// 나라·시대 묶음: 괄호 속 왕 이름은 그 왕의 사실과 맞아야 한다(발해 연호, 가야 병합 등). 발해 카드는 발해 왕 목록에서만 찾는다(백제 무왕과 구별).
const countries=M.get('history-countries');assert(countries&&countries.groups);
const allKings=[...new Set(Object.values(KING_SETS).flatMap(names))].sort((a,b)=>b.length-a.length);
const PAREN=new RegExp('([^\\s,:()·][^\\s,:()]*)\\(('+allKings.join('|')+')\\)','g');
let parenChecks=0;
for(const [front,backText] of countries.groups.flatMap(g=>g.cards)){
 const scope=front==='발해'?['balhae-kings']:Object.values(KING_SETS);
 for(const m of backText.matchAll(PAREN)){
  const items=scope.flatMap(id=>M.get(id).lines.flatMap(l=>l.items)).filter(i=>i.name===m[2]);
  assert(items.length,front+': king in scope '+m[2]);parenChecks++;
  assert(items.some(i=>i.facts.some(f=>f.includes(m[1]))),front+': '+m[2]+' facts include '+m[1]);
 }
}
assert(parenChecks>=40,'country cards cross-check kings: '+parenChecks);
for(const [front,king,needle] of [['금관가야','법흥왕','금관가야'],['대가야','진흥왕','대가야']]){assert(back('history-countries',front).includes('('+king+')'));assert(M.get('silla-kings').lines.flatMap(l=>l.items).find(i=>i.name===king).facts.some(f=>f.includes(needle)),king+' facts name '+needle);}
for(const [token,king] of [['인안','무왕'],['대흥','문왕'],['건흥','선왕']])assert(back('history-countries','발해').includes(token+'('+king+')')&&M.get('balhae-kings').lines[0].items.find(i=>i.name===king).facts.some(f=>f.includes(token)),'발해 연호 '+token+' = '+king);
assert.deepEqual(countries.groups.map(g=>g.title),['선사 시대','고조선·여러 나라','삼국·가야','남북국','고려 경제·사회','고려 정치·문화']);
assert.equal(M.size(countries),30);
// 고려 문화유산(15강, 2026-09-16 공부): 앞머리 "왕(고려)"가 붙은 칸은 그 왕의 사실에 이름이 들어 있어야 한다. 나머지는 고려 안의 시기(초기·중기·후기)만 적었다.
{const set=M.get('history-heritage');assert(set&&set.groups&&set.subject==='한국사','history-heritage set');
 assert.deepEqual(set.groups.map(g=>g.title),['불상','회화','석탑·승탑','청자·공예','건축','과학 기술']);assert.equal(M.size(set),28);
 let anchored=0;const fronts=new Set();for(const [front,backText] of set.groups.flatMap(g=>g.cards)){assert(!fronts.has(front),'no duplicate front: '+front);fronts.add(front);const a=anchorsOf(backText);if(a.length)anchored++;for(const {king,country} of a)assert(factsOf(country,king).some(f=>f.includes(front)),'history-heritage: '+king+'('+country+') facts name '+front);}
 assert.equal(anchored,2,'천산대렵도(공민왕)·화통도감(우왕)');
 assert(back('history-heritage','개성 경천사지 10층 석탑').includes('원의 영향')&&back('history-heritage','안동 봉정사 극락전').includes('가장 오래된'));}
// 15강 왕 사실: 인종 편찬 · 고종 강화도 인쇄 · 우왕 화통도감·직지 · 공민왕 천산대렵도(선종·충숙왕 등 빈 왕은 위에서 비어 있음을 확인한다).
for(const [king,needle] of [['인종','『상정고금예문』'],['고종','『상정고금예문』'],['고종','장경판전'],['우왕','화통도감'],['우왕','『직지심체요절』'],['공민왕','천산대렵도'],['현종','초조대장경']])assert(kings.find(k=>k.name===king).facts.some(f=>f.includes(needle)),king+' facts include '+needle);
// 공부 범위 지키기: 조선은 아직 공부하지 않았다(15강 고려 문화 2 낱말은 2026-09-16에 목록에서 뺐다). 한국사 목록 어디에도 나오면 멈춘다.
const OUT_OF_RANGE=['불씨잡변','입학도설','발해고','경국대전','세종','조선 후기'];
for(const set of M.sets.filter(s=>s.subject==='한국사')){
 const text=JSON.stringify(set);
 for(const word of OUT_OF_RANGE)assert(!text.includes(word),'studied range only ('+word+') in '+set.id);
}
// 사용자에게 보이는 글에 내부 용어를 쓰지 않는다.
for(const set of M.sets.filter(s=>s.subject==='한국사'))for(const t of [set.title,set.hint,...(set.groups||[]).flatMap(g=>[g.title,...g.cards.flat()]),...(set.lines||[]).flatMap(l=>l.items.flatMap(i=>i.facts)),...(set.pairs||[]).flat()])assert(!/카드|문항/.test(t),'no internal words in visible text: '+t);
console.log('PASS memorize: '+M.sets.length+' sets, chant letters match names, no years, studied range only');
