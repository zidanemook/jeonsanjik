const fs=require('node:fs'),assert=require('node:assert/strict'),M=require('./memorize.js');
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
  for(const g of set.groups){assert(g.title&&g.cards.length,'group has a title and cards: '+set.id);texts.push(g.title);for(const c of g.cards){assert(c.length===2||c.length===3,'card = [front, back] 또는 [front, back, 사진]');c.forEach(t=>{assert(typeof t==='string'&&t.trim());});texts.push(c[0],c[1]);if(c.length===3)assert(/^assets\/heritage\/[a-z0-9-]+\.webp$/.test(c[2])&&fs.existsSync(__dirname+'/'+c[2]),'사진 파일이 있어야 한다: '+c[2]);}}
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
// 조선 왕 순서(16강 범위): 태조부터 선조까지 14명. 아직 사실을 배우지 않은 왕은 사건이 비어 있다.
// 2026-09-21 18강(조선 전기 외교): 광해군·인조를 공부해 '광인효' 줄을 이었다. 효종은 봉림 대군(병자호란 뒤 볼모)으로만 나와 사실 하나뿐이다.
{const jk=M.get('joseon-kings').lines.flatMap(l=>l.items);
 assert.deepEqual(jk.map(k=>k.name),['태조','정종','태종','세종','문종','단종','세조','예종','성종','연산군','중종','인종','명종','선조','광해군','인조','효종']);
 assert.deepEqual(M.get('joseon-kings').lines.map(l=>l.chant),['태정','태세문단','세예성','연중인명선','광인효']);
 assert.equal(M.get('joseon-kings').lines.flatMap(l=>l.items).filter(i=>'letter' in i).length,0,'조선 왕은 줄을 갈라 첫 글자 겹침을 피했다');
 for(const line of M.get('joseon-kings').lines){const firsts=line.items.map(i=>[...i.name][0]);assert.equal(new Set(firsts).size,firsts.length,'한 줄 안에서 첫 글자가 겹치지 않는다: '+line.chant);}
 for(const name of ['태조','정종','태종','세종','세조','성종','연산군','중종','명종','선조','광해군','인조','효종'])assert(jk.some(k=>k.name===name&&k.facts.length),'studied Joseon king has facts: '+name);
 // 2026-09-23 20강 조선 전기(문화 I): 문종(조선)은 『고려사』·『고려사절요』 완성으로 처음 사실이 생겼다. 20강 편찬 사업은 왕마다 책이 다르게 적혀야 한다.
 assert.deepEqual(jk.find(k=>k.name==='문종').facts,['『고려사』(기전체, 정인지 등)·『고려사절요』(편년체) 완성'],'문종 = 『고려사』·『고려사절요』');
 for(const [king,needle] of [['태조','『고려국사』'],['태조','『경제육전』'],['태종','혼일강리역대국도지도'],['세종','『석보상절』'],['세종','『삼강행실도』'],['세종','팔도도'],['세종','정간보'],['세조','간경도감'],['성종','『동국통감』'],['성종','『동국여지승람』'],['성종','『악학궤범』'],['성종','『해동제국기』'],['중종','백운동 서원'],['중종','『신증동국여지승람』'],['명종','소수 서원'],['선조','『성학십도』'],['선조','『성학집요』']])assert(jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),king+' facts include '+needle+' (20강)');
 // 18강 왕 사실: 여러 왕에 걸친 제도는 왕마다 단계가 다르게 적혀야 한다(비변사 설치/상설화, 약조 둘, 호란 둘).
 for(const [king,needle] of [['세종','계해약조'],['중종','임시 기구로 비변사'],['명종','비변사 상설'],['선조','임진왜란'],['광해군','기유약조'],['광해군','경기도에서 처음'],['광해군','강홍립'],['인조','정묘호란'],['인조','남한산성'],['효종','볼모']])assert(jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),king+' facts include '+needle);
 assert(!jk.find(k=>k.name==='효종').facts.some(f=>/어영청|나선|하멜/.test(f)),'효종은 18강에 나온 사실(볼모)만');
 for(const name of ['단종','예종','인종'])assert.equal(jk.find(k=>k.name===name).facts.length,0,'unstudied Joseon king stays blank: '+name);}
assert.deepEqual(M.get('military-rulers').lines[0].items.map(i=>i.name),['이의방','정중부','경대승','이의민','최충헌','최우']);
// 정언 논리(국어 논리 3장): 용어 뜻 21개, 알파벳 10개(A·E·I·O · S·P·M · 식 읽기), 핵심 30개.
assert.equal(M.size(M.get('logic-categorical-terms')),21);assert.equal(M.size(M.get('logic-categorical-letters')),10);assert.equal(M.size(M.get('logic-categorical-core')),30);

// ── 왕 하나를 고리로: 고대 왕 목록 + 인물·책·나라 뒤집기 묶음 (2026-09-16) ──
const KING_SETS={고구려:'goguryeo-kings',백제:'baekje-kings',신라:'silla-kings',발해:'balhae-kings',고려:'goryeo-kings',조선:'joseon-kings'};
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
const KING_TOKEN=/((?:[가-힣]+(?: 여왕| 마립간| 대왕)?)(?:·[가-힣]+(?: 여왕| 마립간| 대왕)?)*)\((고구려|백제|신라|발해|고려|조선)\)/g;
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
assert.deepEqual(M.get('history-people').groups.map(g=>g.title),['고조선~삼국','통일 신라·발해·후삼국','고려 전기','고려 무신~원 간섭기','고려 말','조선 전기']);
assert.deepEqual(M.get('history-books').groups.map(g=>g.title),['삼국','통일 신라','고려 전기','고려 무신~원 간섭기','고려 말','조선 전기']);
assert.equal(M.size(M.get('history-people')),161);assert.equal(M.size(M.get('history-books')),68);
// 왕에 걸린 앞머리: 인물 101 · 책 22. 나머지(인물 31 · 책 17)는 왕이 하나로 정해지지 않아 시기만 적었다(고조선·가야, 일본 전파, 승려·학자 등).
// 15강(2026-09-16)으로 책 6(초조대장경 현종·『상정고금예문』 인종·팔만대장경 고종·『직지심체요절』 우왕 + 교장·『향약구급방』은 시기만)과 인물 1(혜허, 시기만)을 더했다.
// 2026-09-18 왕 고리 넓히기: 최충 → 문종, 이규보 「동명왕편」 → 명종, 각훈 『해동고승전』 → 고종, 이제현 『사략』 → 공민왕(이제현은 충선왕과 함께 둘).
// 2026-09-19 16강(조선 전기 정치): 인물 17(정도전·최윤덕·김종서·이종무·이징옥·성삼문·이시애·김종직·김일손·한명회·김굉필·조광조·윤임·윤원형·이언적·김효원·심의겸)과 책 7(『조선경국전』·『경제문감』·『불씨잡변』·『경국대전』·『국조오례의』·「조의제문」·『소학』)이 조선 왕에 걸렸다.
// 2026-09-23 20강 조선 전기(문화 I): 인물 9(조준·박연·정인지·서거정·신숙주·성현·주세붕·이황·이이)과 책 14(『고려국사』·『경제육전』·『석보상절』·『삼강행실도』·『고려사』·『고려사절요』·『동국통감』·『팔도지리지』·『동국여지승람』·『해동제국기』·『악학궤범』·『신증동국여지승람』·『성학십도』·『성학집요』)이 조선 왕에 걸렸다. 개인 저술(이황·이이·박상·김장생의 책, 『동몽선습』·『동몽수지』)과 기대승·박상·김장생은 시기만 둔다.
assert.deepEqual(anchoredCards,{'history-people':127,'history-books':43});
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
// 2026-09-19 왕 고리 넓히기: 관촉사 석조 미륵보살 입상 → 광종(왕명·혜명), 정토사지 홍법국사탑 → 현종(왕명으로 건립), 사천대 → 현종(태복감을 고침), 수덕사 대웅전 → 충렬왕(대들보 먹글씨). 나머지 33칸은 왕이 하나로 정해지지 않아 시기만 둔다.
{const set=M.get('history-heritage');assert(set&&set.groups&&set.subject==='한국사','history-heritage set');
 assert.deepEqual(set.groups.map(g=>g.title),['불상','탑·승탑','무덤·비석','회화·불화','청자·금속 공예','건축','과학 기술·인쇄']);assert.equal(M.size(set),61);
 let anchored=0;const fronts=new Set();for(const [front,backText] of set.groups.flatMap(g=>g.cards)){assert(!fronts.has(front),'no duplicate front: '+front);fronts.add(front);const a=anchorsOf(backText);if(a.length)anchored++;for(const {king,country} of a)assert(factsOf(country,king).some(f=>f.includes(front)),'history-heritage: '+king+'('+country+') facts name '+front);}
 assert.equal(anchored,28,'왕에 걸린 문화유산 28(2026-09-19 경복궁 태조·종묘 태조·창덕궁 태종 + 석굴암 본존불·미륵사지 석탑·분황사 모전 석탑·황룡사 9층 목탑·감은사지 3층 석탑·불국사 3층 석탑·다보탑·경천사지 10층 석탑·무령왕릉·광개토 대왕릉비·단양 적성비·순수비·정혜 공주 묘·천산대렵도·칠지도·상원사 동종·성덕대왕 신종·무구정광대다라니경·초조대장경·팔만대장경·화통도감 + 2026-09-19 관촉사 석조 미륵보살 입상 광종·정토사지 홍법국사탑 현종·사천대 현종·수덕사 대웅전 충렬왕)');
 // 재질·유형이 빠진 칸이 없어야 "왕 — 문화유산 — 재질" 묶음으로 외울 수 있다.
 assert(set.groups.flatMap(g=>g.cards).every(([,b])=>/불|탑|무덤|벽화|벽돌|비석|그림|청자|공예|칼|범종|옻칠|목조|주심포|다포|공포|목판|관청|건물|역법/.test(b)),'every heritage card names its material or type');
 assert(back('history-heritage','개성 경천사지 10층 석탑').includes('원의 영향')&&back('history-heritage','안동 봉정사 극락전').includes('가장 오래된'));}
// 경제·사회 제도(07·13강 중심) → 왕·한 줄. 왕이 붙은 칸은 그 왕의 사실에 제도 이름이 들어 있어야 한다.
{const set=M.get('history-economy');assert(set&&set.groups&&set.subject==='한국사','history-economy set');
 assert.deepEqual(set.groups.map(g=>g.title),['삼국·남북국 경제','고려 토지·수취','고려 상업·화폐·농업','고려 사회','조선 전기 제도·향촌']);assert.equal(M.size(set),59);
 let anchored=0;const fronts=new Set();for(const [front,backText] of set.groups.flatMap(g=>g.cards)){assert(!fronts.has(front),'no duplicate front: '+front);fronts.add(front);const a=anchorsOf(backText);if(a.length)anchored++;for(const {king,country} of a)assert(factsOf(country,king).some(f=>f.includes(front)),'history-economy: '+king+'('+country+') facts name '+front);}
 assert.equal(anchored,31,'왕에 걸린 제도 31(2026-09-19 호패법·신문고 태종, 직전법·유향소 세조 / 2026-09-23 19강 공법 세종·관수관급제 성종·직전법 폐지와 『구황촬요』 명종·경재소 선조), 나머지 28은 왕이 하나로 정해지지 않아 나라·시기만');
 // 19강: 여러 왕에 걸치거나 시작 왕이 교재에 없는 제도(오가작통법·16세기 폐단·신분·의료 기관 묶음)는 왕을 붙이지 않는다.
 for(const front of ['오가작통법','방납·대립·방군수포','신량역천','혜민서·활인서·제생원','수신전·휼양전','타조법(병작반수)','향회'])assert(anchorsOf(back('history-economy',front)).length===0,'no forced king (19강): '+front);
 for(const [front,king] of [['공법','세종(조선)'],['관수관급제','성종(조선)'],['직전법 폐지','명종(조선)'],['『구황촬요』','명종(조선)'],['경재소','선조(조선)']])assert(back('history-economy',front).startsWith(king),front+' → '+king);
 for(const [front,king] of [['진대법','고국천왕(고구려)'],['관료전','신문왕(신라)'],['정전','성덕왕(신라)'],['녹읍 부활','경덕왕(신라)'],['역분전','태조(고려)'],['시정 전시과','경종(고려)'],['개정 전시과','목종(고려)'],['경정 전시과','문종(고려)'],['과전법','공양왕(고려)'],['건원중보','성종(고려)'],['은병·해동통보','숙종(고려)'],['흑창','태조(고려)'],['의창·상평창','성종(고려)'],['제위보','광종(고려)']])assert(back('history-economy',front).startsWith(king),front+' → '+king);
 // 여러 왕에 걸치거나 기록이 갈리는 제도는 왕을 붙이지 않는다(공음전·녹과전·경시서·벽란도·민정 문서·구제 기관).
 for(const front of ['공음전','녹과전','경시서','벽란도','민정 문서(신라 촌락 문서)','동·서 대비원','혜민국','구제도감·구급도감'])assert(anchorsOf(back('history-economy',front)).length===0,'no forced king: '+front);}
// 15강 왕 사실: 인종 편찬 · 고종 강화도 인쇄 · 우왕 화통도감·직지 · 공민왕 천산대렵도(선종·충숙왕 등 빈 왕은 위에서 비어 있음을 확인한다).
for(const [king,needle] of [['인종','『상정고금예문』'],['고종','『상정고금예문』'],['고종','장경판전'],['우왕','화통도감'],['우왕','『직지심체요절』'],['공민왕','천산대렵도'],['현종','초조대장경']])assert(kings.find(k=>k.name===king).facts.some(f=>f.includes(needle)),king+' facts include '+needle);
// 공부 범위 지키기: 조선은 아직 공부하지 않았다(15강 고려 문화 2 낱말은 2026-09-16에 목록에서 뺐다). 한국사 목록 어디에도 나오면 멈춘다.
// 16강(조선 전기 정치)을 공부하면서 『불씨잡변』·『경국대전』·세종이 범위 안으로 들어왔다(2026-09-19). 아직 배우지 않은 낱말만 남긴다.
const OUT_OF_RANGE=['입학도설','발해고','조선 후기'];
for(const set of M.sets.filter(s=>s.subject==='한국사')){
 const text=JSON.stringify(set);
 for(const word of OUT_OF_RANGE)assert(!text.includes(word),'studied range only ('+word+') in '+set.id);
}
// 사용자에게 보이는 글에 내부 용어를 쓰지 않는다.
for(const set of M.sets.filter(s=>s.subject==='한국사'))for(const t of [set.title,set.hint,...(set.groups||[]).flatMap(g=>[g.title,...g.cards.flat()]),...(set.lines||[]).flatMap(l=>l.items.flatMap(i=>i.facts)),...(set.pairs||[]).flat()])assert(!/카드|문항/.test(t),'no internal words in visible text: '+t);
// 영어 어법 공식(v122): Day 1~4 공식 89개(영역 11개, 해설 끝 외우는 공식 블록과 같은 글) + Day 5 포인트 29개(4묶음). 앞면 = 공식·포인트 이름, 뒷면 = 공식 · ✗ 틀리는 형태 · 예) 예문, **핵심** 색칠.
// 꿀팁·입으로 외우기·발음 표기는 없다(2026-09-21 사용자 "너무 장황해 … 핵심은 색칠").
{const set=M.get('english-grammar-formulas'),F=(require('./practice-bank.js'),globalThis.ENGLISH_FORMULAS),bank=globalThis.PRACTICE_BANK;assert(set&&set.subject==='영어'&&set.groups,'english-grammar-formulas set');
 const base=set.groups.slice(0,F.areas.length),day5=set.groups.slice(F.areas.length);
 assert.deepEqual(base.map(g=>g.title),F.areas.map(a=>a.title));assert.equal(base.reduce((n,g)=>n+g.cards.length,0),89);
 base.forEach((g,i)=>assert.deepEqual(g.cards.map(c=>c[0]),F.areas[i].rules.map(r=>r.title),'앞면은 공식 이름: '+g.title));
 const blockOf=new Map();for(const l of Object.values(bank))if(l.formula&&l.variants[0]&&!blockOf.has(l.formula))blockOf.set(l.formula,l.variants[0].explanation.split('\n\n').pop());
 base.forEach((g,i)=>g.cards.forEach((c,j)=>assert.equal('외우는 공식\n'+c[1],blockOf.get(F.areas[i].rules[j].id),'해설 블록과 같은 글: '+c[0])));
 assert(day5.length>=1&&day5.every(g=>g.title.startsWith('Day 5')));
 const points=new Set(Object.entries(bank).filter(([k])=>k.startsWith('en-day5-')).map(([,l])=>l.point));assert.deepEqual(new Set(day5.flatMap(g=>g.cards.map(c=>c[0]))),points,'Day 5 포인트 전부');
 for(const [front,back] of set.groups.flatMap(g=>g.cards)){const lines=back.split('\n');assert(lines.length>=3&&lines.length<=4&&lines.some(x=>x.startsWith('✗ '))&&lines[lines.length-1].startsWith('예) ')&&back.includes('**')&&!/꿀팁|입으로|함정:/.test(back),'공식·✗·예: '+front);
  for(const x of lines)assert.equal((x.match(/\*\*/g)||[]).length%2,0,'색칠 짝: '+front);assert(!/카드|문항|변형/.test(front+back),'no internal words: '+front);assert(!/[①②③④]/.test(back));}}
// 내가 만든 외우는 낱말(2026-09-19): 사용자가 직접 만든 왕+대상 합성 낱말 아홉만 남긴 묶음(quiz-options.js의 HISTORY_MNEMONICS).
// 앞면 = 대상, 뒷면 = 낱말 + 풀이 + 덧붙임·헷갈림 주의. 내가 만든 블록 98개(두문자 32 포함)는 지웠고 문제 해설에도 붙이지 않는다.
// 낱말의 글자는 열쇠 글자와 같고, 열쇠 글자는 실제 사실 안에 차례대로 들어 있다. 왕을 단 항목은 위 왕 순서 목록의 그 왕 사실과 대조한다.
{const vm=require('node:vm'),fs=require('node:fs'),ctx={};vm.createContext(ctx);for(const f of ['core-review-pack.js','quiz-options.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
 // vm 안에서 만든 배열은 이 파일의 배열과 프로토타입이 달라 deepEqual이 틀리므로 JSON으로 옮겨 비교한다(함수 text·back·get은 그대로 쓴다).
 const H0=ctx.HISTORY_MNEMONICS,J=v=>JSON.parse(JSON.stringify(v)),H={...H0,era:J(H0.era),blocks:J(H0.blocks),get:id=>J(H0.get(id))},set=M.get('history-mnemonics');
 assert(H&&set&&set.subject==='한국사'&&set.groups,'history-mnemonics set');assert.equal(set.title,'내가 만든 외우는 낱말');
 assert.equal(H.attach,undefined,'문제 해설에 붙이던 대응표는 없앴다');
 // 남은 것은 사용자가 만든 낱말뿐이다(원본 research/king-word-mnemonics/USER-WORDS.md). 내가 만든 블록이 다시 들어오면 여기서 잡힌다.
 const USER_WORDS=['인지상정','현기증 초조함','고생','화통 우직','성사림','연무갑 · 중기묘 · 명을사','무김조','중종조광조 · 조현량','신동기서 · 선동서','수양계 유정란','숙주나물 해동',
  // 2026-09-23 책 고리 여덟: 내가 후보를 내고 사용자가 채택("웃기든 어쨋든 말이 되게 만들기만 하면"). 성종 후보는 목록만 붙였다고 거절돼 책마다 고리가 있는 판으로 바꿨다.
  '성동구 · 성종 때 성현 · 완성 담당 성종','문고리사 · 문종고려사','수간경','불씨 잡는 소방관 정도전','숙주나물 해동 해례','서쪽 사람 서거정의 책은 전부 동','이이는 집요하다 · 황도','양성지는 땅의 사람'];
 assert.deepEqual(H.blocks.map(b=>b.hook).sort(),[...USER_WORDS].sort(),'사용자가 만든 낱말만 남는다');
 assert.equal(H.blocks.length,19);assert.equal(M.size(set),19);
 const METHODS=['두문자','새 단어','글자 풀이','장면','이야기'];
 assert.deepEqual(set.groups.map(g=>g.title),H.era.filter((_,i)=>H.blocks.some(b=>b.era===i)),'시대 묶음 순서');
 for(const g of set.groups)assert.deepEqual(g.cards,H.blocks.filter(b=>H.era[b.era]===g.title).map(b=>[b.target,H.back(b)]),'외울 것 = 낱말 블록: '+g.title);
 const syl=s=>[...s].filter(ch=>/[가-힣]/.test(ch)).sort().join('');
 const letterProblems=b=>{const out=[];if(!(b.method==='두문자'||b.method==='새 단어'))return out;
  if(!/^[가-힣 ·]+$/.test(b.hook))out.push('hook not Hangul');if(syl(b.hook)!==syl(b.items.map(i=>i[0]).join('')))out.push('hook letters != keys');
  // 사용자 낱말 가운데는 소리만 빌린 말장난이 있다(수양계 유정란 ↔ 계유정난). 그런 항목은 pun으로 표시하고 글자 대조를 건너뛴다 —
  // 대신 왕 사실 대조(kingProblems)와 '소리만 빌렸다'는 헷갈림 주의는 그대로 받는다.
  for(const [k,v,o={}] of b.items){if(o.pun){if(!b.trap||!b.trap.includes('소리만 빌린'))out.push('pun needs trap: '+k);continue;}let at=0;for(const ch of k.replace(/ /g,'')){const i=v.indexOf(ch,at);if(i<0){out.push(k+' not in '+v);break;}at=i+1;}
   if([...k].length===1){if(!o.w||!v.includes(o.w)||!o.w.includes(k))out.push('word for '+k);for(const [k2,,o2={}] of b.items)if(k2!==k&&o2.w&&o2.w.startsWith(k))out.push('two words start with '+k);}}
  return out;};
 const kingProblems=b=>{const out=[];for(const [k,v,o={}] of b.items){const spec=o.king||b.king;if(!spec)continue;const [country,king]=spec.split(':');let facts;try{facts=factsOf(country,king).join(' | ');}catch{out.push('no king '+spec);continue;}for(const f of [].concat(o.from??v))if(!facts.includes(f))out.push(spec+' lacks '+f);}return out;};
 const ids=new Set(),targets=new Set();
 for(const b of H.blocks){assert(!ids.has(b.id)&&!targets.has(b.target),'unique block: '+b.id);ids.add(b.id);targets.add(b.target);
  assert(METHODS.includes(b.method)&&b.hook&&b.items.length>=1&&b.items.length<=8,'block shape: '+b.id);
  assert.deepEqual(letterProblems(b),[],'글자↔사실: '+b.id);assert.deepEqual(kingProblems(b),[],'왕 사실: '+b.id);
  const text=H.text(b);assert(!/\n\s*\n/.test(text)&&!/[①-⑤]/.test(text),'block text: '+b.id);}
 assert(H.blocks.filter(b=>b.king||b.items.some(i=>(i[2]||{}).king)).length>=6,'왕을 단 블록');
 assert.equal(H.get('king-word-gojong').hook,'고생');assert.equal(H.get('sinsukju-haedongjegukgi').hook,'숙주나물 해동'); // 2026-09-23 사용자: 신숙주 → 숙주나물, 『해동제국기』 → 해동assert.equal(H.get('joseon-bungdang').hook,'신동기서 · 선동서');
 // 대조군: 열쇠 글자를 바꾸거나 왕 사실에 없는 말을 넣으면 잡힌다.
 {const b=H.get('muo-sahwa');assert.notDeepEqual(letterProblems({...b,hook:'무김종'}),[]);
  assert.notDeepEqual(kingProblems({...b,king:'조선:중종'}),[]);
  const g=H.get('joseon-bungdang');assert.notDeepEqual(kingProblems({...g,items:g.items.map(i=>[i[0],i[1],{...i[2],from:['성종 때 붕당']}])}),[]);}
 // 해설: 2026-09-19에 '외우는 비결' 문단을 문제 해설에서 전수 뗐다(사용자: 두문자 말고 요약만 보여라).
 const pack=ctx.CORE_REVIEW_PACK;
 const withBlock=list=>list.filter(c=>(c.explanation||'').includes('외우는 비결 · ')).length;
 assert.equal(withBlock(pack),0,'어떤 문제 해설에도 외우는 비결 문단이 없다');
 assert.equal(pack.filter(c=>/(^|\n)(두문자|외우는 말)/.test(c.explanation||'')).length,0,'해설에 두문자 꼬리표가 없다');
 assert.equal(pack.filter(c=>c.subject==='한국사'&&/기억 연결[:\n]/.test(c.explanation||'')).length>=700,true,'한국사 해설의 요약은 그대로 남는다');
 // 붙이던 문단 말고 해설 본문에 직접 써 둔 두문자도 전수로 막는다(2026-09-19 사용자가 세종 '의집경훈개대'를 보고
 // "외우는 비결 삭제하라니까 … 전수조사해서 변경하라했을텐데"). 20문장을 요약 문장으로 고쳤고, 아래가 다시 들어오는 것을 막는다.
 const COINED=['조한경종','직사간호신','의집경훈개대','계부폐이유직','홍경사대오','유서향'];
 const coined=list=>list.filter(c=>c.subject==='한국사'&&COINED.some(w=>(c.explanation||'').includes(w)));
 assert.equal(coined(pack).map(c=>c.id).join(', '),'','해설 본문에 지어낸 두문자가 없다');
 // '<두문자> 가운데 <한 글자> = ' 꼴도 두문자 풀이다.
 const midKey=list=>list.filter(c=>c.subject==='한국사'&&/[가-힣]{3,8} 가운데 [가-힣] = /.test(c.explanation||''));
 assert.equal(midKey(pack).map(c=>c.id).join(', '),'','해설에 두문자 글자 풀이가 없다');
 assert.equal(coined([{subject:'한국사',explanation:'기억 연결: 태종 — 직사간호신.'}]).length,1,'대조군: 지어낸 두문자는 잡힌다');
 assert.equal(midKey([{subject:'한국사',explanation:'기억 연결: 세종 — 의집경훈개대 가운데 훈 = 훈민정음.'}]).length,1,'대조군: 글자 풀이는 잡힌다');
 // 대조군: 문단을 도로 붙인 해설은 위 검사가 잡는다.
 assert.equal(withBlock([{explanation:'기억 연결: 가.'+String.fromCharCode(10,10)+H.text(H.get('muo-sahwa'))}]),1,'대조군: 붙이면 잡힌다');}
console.log('PASS memorize: '+M.sets.length+' sets, chant letters match names, no years, studied range only');
