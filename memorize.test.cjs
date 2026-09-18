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
// 왕에 걸린 앞머리: 인물 101 · 책 22. 나머지(인물 31 · 책 17)는 왕이 하나로 정해지지 않아 시기만 적었다(고조선·가야, 일본 전파, 승려·학자 등).
// 15강(2026-09-16)으로 책 6(초조대장경 현종·『상정고금예문』 인종·팔만대장경 고종·『직지심체요절』 우왕 + 교장·『향약구급방』은 시기만)과 인물 1(혜허, 시기만)을 더했다.
// 2026-09-18 왕 고리 넓히기: 최충 → 문종, 이규보 「동명왕편」 → 명종, 각훈 『해동고승전』 → 고종, 이제현 『사략』 → 공민왕(이제현은 충선왕과 함께 둘).
assert.deepEqual(anchoredCards,{'history-people':101,'history-books':22});
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
// 문화유산(03~15강): 앞머리 "왕(나라)"가 붙은 칸은 그 왕의 사실에 이름이 들어 있어야 한다. 나머지는 나라·시기(고려 초기·중기·후기 등)만 적었다.
// 2026-09-18: 고려만 담던 목록을 삼국·남북국까지 넓히고, 칸마다 재질(금동불·마애불·철불·소조불·석탑·모전 석탑·전탑·승탑·대리석·청자·청동·목판 등)을 적었다.
{const set=M.get('history-heritage');assert(set&&set.groups&&set.subject==='한국사','history-heritage set');
 assert.deepEqual(set.groups.map(g=>g.title),['불상','탑·승탑','무덤·비석','회화·불화','청자·금속 공예','건축','과학 기술·인쇄']);assert.equal(M.size(set),58);
 let anchored=0;const fronts=new Set();for(const [front,backText] of set.groups.flatMap(g=>g.cards)){assert(!fronts.has(front),'no duplicate front: '+front);fronts.add(front);const a=anchorsOf(backText);if(a.length)anchored++;for(const {king,country} of a)assert(factsOf(country,king).some(f=>f.includes(front)),'history-heritage: '+king+'('+country+') facts name '+front);}
 assert.equal(anchored,21,'왕에 걸린 문화유산 21(석굴암 본존불·미륵사지 석탑·분황사 모전 석탑·황룡사 9층 목탑·감은사지 3층 석탑·불국사 3층 석탑·다보탑·경천사지 10층 석탑·무령왕릉·광개토 대왕릉비·단양 적성비·순수비·정혜 공주 묘·천산대렵도·칠지도·상원사 동종·성덕대왕 신종·무구정광대다라니경·초조대장경·팔만대장경·화통도감)');
 // 재질·유형이 빠진 칸이 없어야 "왕 — 문화유산 — 재질" 묶음으로 외울 수 있다.
 assert(set.groups.flatMap(g=>g.cards).every(([,b])=>/불|탑|무덤|벽화|벽돌|비석|그림|청자|공예|칼|범종|옻칠|목조|주심포|다포|공포|목판|관청|건물|역법/.test(b)),'every heritage card names its material or type');
 assert(back('history-heritage','개성 경천사지 10층 석탑').includes('원의 영향')&&back('history-heritage','안동 봉정사 극락전').includes('가장 오래된'));}
// 경제·사회 제도(07·13강 중심) → 왕·한 줄. 왕이 붙은 칸은 그 왕의 사실에 제도 이름이 들어 있어야 한다.
{const set=M.get('history-economy');assert(set&&set.groups&&set.subject==='한국사','history-economy set');
 assert.deepEqual(set.groups.map(g=>g.title),['삼국·남북국 경제','고려 토지·수취','고려 상업·화폐·농업','고려 사회']);assert.equal(M.size(set),41);
 let anchored=0;const fronts=new Set();for(const [front,backText] of set.groups.flatMap(g=>g.cards)){assert(!fronts.has(front),'no duplicate front: '+front);fronts.add(front);const a=anchorsOf(backText);if(a.length)anchored++;for(const {king,country} of a)assert(factsOf(country,king).some(f=>f.includes(front)),'history-economy: '+king+'('+country+') facts name '+front);}
 assert.equal(anchored,22,'왕에 걸린 제도 22, 나머지 19는 왕이 하나로 정해지지 않아 나라·시기만');
 for(const [front,king] of [['진대법','고국천왕(고구려)'],['관료전','신문왕(신라)'],['정전','성덕왕(신라)'],['녹읍 부활','경덕왕(신라)'],['역분전','태조(고려)'],['시정 전시과','경종(고려)'],['개정 전시과','목종(고려)'],['경정 전시과','문종(고려)'],['과전법','공양왕(고려)'],['건원중보','성종(고려)'],['은병·해동통보','숙종(고려)'],['흑창','태조(고려)'],['의창·상평창','성종(고려)'],['제위보','광종(고려)']])assert(back('history-economy',front).startsWith(king),front+' → '+king);
 // 여러 왕에 걸치거나 기록이 갈리는 제도는 왕을 붙이지 않는다(공음전·녹과전·경시서·벽란도·민정 문서·구제 기관).
 for(const front of ['공음전','녹과전','경시서','벽란도','민정 문서(신라 촌락 문서)','동·서 대비원','혜민국','구제도감·구급도감'])assert(anchorsOf(back('history-economy',front)).length===0,'no forced king: '+front);}
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
// 영어 어법 공식(v98): 문제 해설의 외우기 블록과 같은 공식 89개를 영역 11개로. 앞면 = 공식 이름(문제 화면 제목과 같음), 뒷면 = 공식 + 꿀팁 + 입으로 외울 말.
// 연도 금지는 한국사 목록만의 규칙이라 영어 예문의 숫자(1990 등)는 막지 않는다.
{const set=M.get('english-grammar-formulas'),F=(require('./practice-bank.js'),globalThis.ENGLISH_FORMULAS);assert(set&&set.subject==='영어'&&set.groups,'english-grammar-formulas set');
 assert.deepEqual(set.groups.map(g=>g.title),F.areas.map(a=>a.title));assert.equal(M.size(set),89);
 set.groups.forEach((g,i)=>assert.deepEqual(g.cards.map(c=>c[0]),F.areas[i].rules.map(r=>r.title),'앞면은 공식 이름: '+g.title));
 for(const [front,back] of set.groups.flatMap(g=>g.cards)){assert(/\n꿀팁: /.test(back)&&/\n입으로: [A-Za-z]/.test(back)&&/\([가-힣 ,?]+\)/.test(back),'공식·꿀팁·입으로: '+front);assert(!/카드|문항|변형/.test(front+back),'no internal words: '+front);assert(!/[①②③④]/.test(back));}
 assert(set.groups.flatMap(g=>g.cards).some(c=>/\b(19|20)\d\d\b/.test(c[1])),'영어 목록에는 연도 같은 숫자가 있어도 된다(한국사 연도 규칙과 무관)');
 assert(M.get('english-grammar-formulas').groups.flatMap(g=>g.cards).find(c=>c[0].startsWith('such·so 어순'))[1].includes('서치(such)는 관사(a/an)를 품에 안고 다니고'));}
// 국사 외우는 비결(v99): 문제 해설 끝 블록(quiz-options.js의 HISTORY_MNEMONICS)과 같은 원본. 앞면 = 대상 · 방법, 뒷면 = 외우는 말 + 풀이 + 장면·덧붙임·헷갈림 주의.
// 두문자·새 단어는 외우는 말의 글자가 열쇠 글자와 같고, 열쇠 글자는 실제 사실 안에 차례대로 들어 있다. 한 글자 열쇠는 그 글자를 딴 낱말(w)이 사실 안에 있고, 다른 낱말이 같은 글자로 시작하지 않는다.
// 왕 대상은 풀이의 사실(from)이 위 왕 순서 목록의 그 왕 사실에 그대로 있다. 연도·조선 낱말·내부 용어는 위의 한국사 목록 검사가 같이 막는다.
{const vm=require('node:vm'),fs=require('node:fs'),ctx={};vm.createContext(ctx);for(const f of ['core-review-pack.js','quiz-options.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
 // vm 안에서 만든 배열은 이 파일의 배열과 프로토타입이 달라 deepEqual이 틀리므로 JSON으로 옮겨 비교한다(함수 text·back·get은 그대로 쓴다).
 const H0=ctx.HISTORY_MNEMONICS,J=v=>JSON.parse(JSON.stringify(v)),H={...H0,era:J(H0.era),blocks:J(H0.blocks),attach:J(H0.attach),get:id=>J(H0.get(id))},set=M.get('history-mnemonics');assert(H&&set&&set.subject==='한국사'&&set.groups,'history-mnemonics set');
 const METHODS=['두문자','새 단어','글자 풀이','장면','이야기'];
 assert.deepEqual(set.groups.map(g=>g.title),H.era.filter((_,i)=>H.blocks.some(b=>b.era===i)),'시대 묶음 순서');
 for(const g of set.groups)assert.deepEqual(g.cards,H.blocks.filter(b=>H.era[b.era]===g.title).map(b=>[b.target+' · '+b.method,H.back(b)]),'외울 것 = 해설 블록: '+g.title);
 assert.equal(M.size(set),H.blocks.length);assert(H.blocks.length>=80,'대상 80개 이상: '+H.blocks.length);
 const syl=s=>[...s].filter(ch=>/[가-힣]/.test(ch)).sort().join('');
 const letterProblems=b=>{const out=[];if(!(b.method==='두문자'||b.method==='새 단어'))return out;
  if(!/^[가-힣 ·]+$/.test(b.hook))out.push('hook not Hangul');if(syl(b.hook)!==syl(b.items.map(i=>i[0]).join('')))out.push('hook letters != keys');
  for(const [k,v,o={}] of b.items){let at=0;for(const ch of k.replace(/ /g,'')){const i=v.indexOf(ch,at);if(i<0){out.push(k+' not in '+v);break;}at=i+1;}
   if([...k].length===1){if(!o.w||!v.includes(o.w)||!o.w.includes(k))out.push('word for '+k);for(const [k2,,o2={}] of b.items)if(k2!==k&&o2.w&&o2.w.startsWith(k))out.push('two words start with '+k);}}
  return out;};
 const kingProblems=b=>{const out=[];for(const [k,v,o={}] of b.items){const spec=o.king||b.king;if(!spec)continue;const [country,king]=spec.split(':');let facts;try{facts=factsOf(country,king).join(' | ');}catch{out.push('no king '+spec);continue;}for(const f of [].concat(o.from??v))if(!facts.includes(f))out.push(spec+' lacks '+f);}return out;};
 const ids=new Set(),targets=new Set();
 for(const b of H.blocks){assert(!ids.has(b.id)&&!targets.has(b.target),'unique block: '+b.id);ids.add(b.id);targets.add(b.target);
  assert(METHODS.includes(b.method)&&b.hook&&b.items.length>=1&&b.items.length<=8,'block shape: '+b.id);
  assert.deepEqual(letterProblems(b),[],'글자↔사실: '+b.id);assert.deepEqual(kingProblems(b),[],'왕 사실: '+b.id);
  const text=H.text(b);assert(text.startsWith('외우는 비결 · '+b.target+' · '+b.method+'\n')&&!/\n\s*\n/.test(text)&&!/[①-⑤]/.test(text),'block text: '+b.id);}
 assert(H.blocks.filter(b=>b.king).length>=15,'왕 대상 블록');
 assert.equal(H.get('sosurim').hook,'율불태');assert.equal(H.get('beopheung').hook,'율불병상공건금');assert.equal(H.get('gwangjong').hook,'노과공칭');assert.equal(H.get('gongmin').hook.split(' · ')[0],'기관 몽이 쌍');
 // 대조군: 열쇠 글자를 바꾸거나, 왕 사실에 없는 말을 넣거나, 두 낱말이 같은 글자로 시작하면 잡힌다.
 {const b=H.get('sosurim');assert.notDeepEqual(letterProblems({...b,items:[['법',b.items[0][1],{w:'율령'}],...b.items.slice(1)]}),[]);assert.notDeepEqual(letterProblems({...b,hook:'율불학'}),[]);
  assert.notDeepEqual(kingProblems({...b,items:[['율','율령 반포와 공복 제정',{w:'율령'}],...b.items.slice(1)]}),[]);assert.notDeepEqual(kingProblems({...b,king:'고구려:장수왕'}),[]);
  const g=H.get('gongmin');assert.notDeepEqual(letterProblems({...g,items:g.items.map(i=>i[0]==='전'?['전',i[1],{w:'정방 폐지 전'}]:i)}),[]);}
 // 해설: 붙인 문제는 모두 자체 제작 한국사이고, 해설 끝이 그 블록 문단 하나다. 붙이지 않은 문제·기출에는 블록이 없다.
 const pack=ctx.CORE_REVIEW_PACK,attached=Object.entries(H.attach);assert(attached.length>=600,'붙인 문제 수: '+attached.length);
 for(const [id,bid] of attached){const c=pack.find(x=>x.id===id);assert(c&&c.subject==='한국사'&&!/^(hanneung|gichul|core-hist-79)-/.test(id)&&H.get(bid),'attach target: '+id);
  const e=c.explanation;assert(e.endsWith('\n\n'+H.text(H.get(bid))),'해설 끝 블록: '+id);assert.equal(e.split('외우는 비결 · ').length,2,'블록 하나: '+id);assert(/기억 연결[:\n]/.test(e.slice(0,-H.text(H.get(bid)).length)),'기억 연결은 남는다: '+id);}
 assert.equal(pack.filter(c=>(c.explanation||'').includes('외우는 비결 · ')).length,attached.length,'붙이지 않은 문제에는 블록이 없다');
 assert.equal(new Set(attached.map(([,b])=>b)).size>=80,true,'대부분의 블록이 문제 해설에 쓰인다');
 assert.equal(H.attach['study-hist-20260910-17'],'sosurim');assert.equal(H.attach['goryeoculture2-hist-20260916-036'],'jusimpo-dapo');assert.equal(H.attach['goryeoforeign-hist-20260914-106'],'gongmin');}
console.log('PASS memorize: '+M.sets.length+' sets, chant letters match names, no years, studied range only');
