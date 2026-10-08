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
assert.deepEqual(M.get('goryeo-kings').lines.map(l=>l.chant),['태혜정광경성목','현덕정문순선헌','숙예인의명신희','강고원','렬선숙혜목정','공우창양']);
assert.deepEqual(kings.slice(21).map(k=>k.name),['강종','고종','원종','충렬왕','충선왕','충숙왕','충혜왕','충목왕','충정왕','공민왕','우왕','창왕','공양왕']);
// 첫 글자가 같은 충- 왕 여섯은 모두 letter를 갖고, 공양왕도 '공'이 공민왕과 겹쳐 '양'을 쓴다(2026-09-29 사용자: 공우창공 → 공우창양). 그 밖의 왕은 letter를 갖지 않는다.
assert.deepEqual(kings.filter(k=>'letter' in k).map(k=>k.name),['충렬왕','충선왕','충숙왕','충혜왕','충목왕','충정왕','공양왕']);
for(const name of ['태조','정종','광종','경종','성종','현종','숙종','예종','인종','의종','명종','신종','희종','고종','원종','충렬왕','충선왕','충목왕','공민왕','우왕','창왕','공양왕'])assert(kings.some(k=>k.name===name&&k.facts.length),'studied king has facts: '+name);
// 13강(고려 경제·사회)을 공부하면서 목종(개정 전시과)·문종(경정 전시과)에도 공부한 사실이 생겼다. 그래서 문종은 "비움" 목록에서 "사실 있음" 목록으로 옮겼다(2026-09-16).
for(const name of ['목종','문종'])assert(kings.some(k=>k.name===name&&k.facts.length),'studied king has facts (13강 전시과): '+name);
for(const name of ['덕종','순종','선종','헌종','강종','충숙왕','충혜왕','충정왕'])assert(kings.find(k=>k.name===name).facts.length===0,'unstudied king stays blank: '+name);
// 조선 왕 순서(16강 범위): 태조부터 선조까지 14명. 아직 사실을 배우지 않은 왕은 사건이 비어 있다.
// 2026-09-21 18강(조선 전기 외교): 광해군·인조를 공부해 '광인효' 줄을 이었다. 효종은 봉림 대군(병자호란 뒤 볼모)으로만 나와 사실 하나뿐이다.
{const jk=M.get('joseon-kings').lines.flatMap(l=>l.items);
 assert.deepEqual(jk.map(k=>k.name),['태조','정종','태종','세종','문종','단종','세조','예종','성종','연산군','중종','인종','명종','선조','광해군','인조','효종','현종','숙종','경종','영조','정조','순조','헌종','철종']);
 assert.deepEqual(M.get('joseon-kings').lines.map(l=>l.chant),['태정','태세문단','세예성','연중인명선','광인효현숙','경영정','순헌철']);
 // 2026-09-27 22강 조선 후기(정치): 현종 · 숙종 · 영조 · 정조 · 순조 · 헌종 · 철종에 요약 면 사실, 경종은 아직 비움. 선조 · 광해군 · 인조에 붕당 사실을 보탬.
 for(const [king,needle] of [['선조','기축옥사'],['선조','남인(온건)과 북인(강경)'],['광해군','북인이 서인과 남인을 배제'],['인조','남인 일부와 연합'],['현종','기해예송'],['현종','갑인예송'],['현종','자의 대비'],['숙종','경신환국'],['숙종','기사환국'],['숙종','갑술환국'],['숙종','노론(강경)과 소론(온건)'],['영조','완론 탕평'],['영조','이인좌'],['영조','탕평비'],['영조','균역법'],['영조','준천사'],['영조','『속대전』'],['영조','『동국문헌비고』'],['정조','준론 탕평'],['정조','초계문신제'],['정조','장용영'],['정조','수원 화성'],['정조','신해통공'],['정조','검서관'],['정조','『대전통편』'],['정조','『무예도보통지』'],['순조','세도 정치'],['헌종','세도 정치'],['철종','삼정의 문란']])assert(jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),king+' facts include '+needle+' (22강)');
 for(const [king,needle] of [['영조','장용영'],['영조','『대전통편』'],['정조','균역법'],['정조','『속대전』'],['현종','경신환국'],['숙종','기해예송']])assert(!jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),'대조군(22강): '+king+' facts do not include '+needle);
 assert.equal(M.get('joseon-kings').lines.flatMap(l=>l.items).filter(i=>'letter' in i).length,0,'조선 왕은 줄을 갈라 첫 글자 겹침을 피했다');
 for(const line of M.get('joseon-kings').lines){const firsts=line.items.map(i=>[...i.name][0]);assert.equal(new Set(firsts).size,firsts.length,'한 줄 안에서 첫 글자가 겹치지 않는다: '+line.chant);}
 for(const name of ['태조','정종','태종','세종','세조','성종','연산군','중종','명종','선조','광해군','인조','효종','현종','숙종','영조','정조','순조','헌종','철종'])assert(jk.some(k=>k.name===name&&k.facts.length),'studied Joseon king has facts: '+name);
 // 2026-09-23 20강 조선 전기(문화 I): 문종(조선)은 『고려사』·『고려사절요』 완성으로 처음 사실이 생겼다. 20강 편찬 사업은 왕마다 책이 다르게 적혀야 한다.
 assert.deepEqual(jk.find(k=>k.name==='문종').facts[0],'『고려사』(기전체, 정인지 등)·『고려사절요』(편년체) 완성','문종 = 『고려사』·『고려사절요』');
 // 2026-09-24 21강 조선 전기(문화 II): 과학 기구·활자·역법·의학서·농서·병서·훈민정음 책·그림·문학이 왕마다 다르게 적혀야 한다(문종은 『진법』·『동국병감』이 더해졌다).
 for(const [king,needle] of [['태조','천상열차분야지도'],['태종','계미자'],['태종','거북선'],['세종','갑인자'],['세종','측우기'],['세종','앙부일구'],['세종','자격루'],['세종','혼천의·간의'],['세종','『칠정산』'],['세종','『의방유취』'],['세종','『향약집성방』'],['세종','『농사직설』'],['세종','『용비어천가』'],['세종','『동국정운』'],['세종','몽유도원도'],['문종','『진법』'],['문종','『동국병감』'],['세조','서울 원각사지 10층 석탑'],['성종','『금양잡록』'],['성종','『동문선』'],['선조','「관동별곡」'],['선조','「사미인곡」'],['선조','도산 서원']])assert(jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),king+' facts include '+needle+' (21강)');
 for(const [king,needle] of [['태종','갑인자'],['세종','계미자'],['성종','『농사직설』'],['세종','『금양잡록』']])assert(!jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),'대조군: '+king+' facts do not include '+needle);
 for(const [king,needle] of [['태조','『고려국사』'],['태조','『경제육전』'],['태종','혼일강리역대국도지도'],['세종','『석보상절』'],['세종','『삼강행실도』'],['세종','팔도도'],['세종','정간보'],['세조','간경도감'],['성종','『동국통감』'],['성종','『동국여지승람』'],['성종','『악학궤범』'],['성종','『해동제국기』'],['중종','백운동 서원'],['중종','『신증동국여지승람』'],['명종','소수 서원'],['선조','『성학십도』'],['선조','『성학집요』']])assert(jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),king+' facts include '+needle+' (20강)');
 // 18강 왕 사실: 여러 왕에 걸친 제도는 왕마다 단계가 다르게 적혀야 한다(비변사 설치/상설화, 약조 둘, 호란 둘).
 for(const [king,needle] of [['세종','계해약조'],['중종','임시 기구로 비변사'],['명종','비변사 상설'],['선조','임진왜란'],['광해군','기유약조'],['광해군','경기도에서 처음'],['광해군','강홍립'],['인조','정묘호란'],['인조','남한산성'],['효종','볼모']])assert(jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),king+' facts include '+needle);
 assert(!jk.find(k=>k.name==='효종').facts.some(f=>/하멜/.test(f)),'효종은 18강(볼모) · 23강(북벌 · 나선 정벌)에 나온 사실만 — 하멜은 아직 공부 전');
 // 2026-09-28 23강 조선 후기(조직, 외교): 선조 회답 겸 쇄환사 · 인조 세 군영 · 효종 북벌과 나선 정벌 · 숙종 금위영 · 백두산정계비 · 안용복 · 정조 『북학의』.
 for(const [king,needle] of [['선조','회답 겸 쇄환사'],['선조','두모포'],['인조','어영청'],['인조','총융청'],['인조','수어청'],['효종','북벌'],['효종','나선 정벌'],['효종','신류'],['숙종','금위영'],['숙종','백두산정계비'],['숙종','목극등'],['숙종','안용복'],['숙종','윤휴 · 허적 등 남인이 북벌론'],['정조','『북학의』']])assert(jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),king+' facts include '+needle+' (23강)');
 for(const [king,needle] of [['효종','백두산정계비'],['효종','금위영'],['숙종','나선 정벌'],['광해군','회답 겸 쇄환사'],['인조','금위영'],['선조','기유약조']])assert(!jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),'대조군(23강): '+king+' facts do not include '+needle);
 // 2026-09-28 24강 조선 후기(경제): 광해군 선혜청 · 인조 영정법 · 효종 설점수세제 · 김육 · 숙종 상평통보 · 대동법 전국 · 영조 결작 · 선무군관포.
 for(const [king,needle] of [['광해군','선혜청'],['광해군','이원익'],['인조','영정법'],['효종','설점수세제'],['효종','김육'],['숙종','상평통보'],['숙종','대동법을 평안도'],['영조','결작'],['영조','선무군관포']])assert(jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),king+' facts include '+needle+' (24강)');
 for(const [king,needle] of [['인조','상평통보'],['숙종','영정법'],['영조','설점수세제'],['효종','결작'],['광해군','균역법']])assert(!jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),'대조군(24강): '+king+' facts do not include '+needle);
 // 2026-09-28 25강 조선 후기(사회): 선조 공명첩 · 영조 노비종모법 · 정조 신해박해 · 순조 공노비 해방 · 신유박해 · 홍경래의 난 · 철종 동학 창시 · 소청 운동 · 임술 농민 봉기.
 for(const [king,needle] of [['선조','공명첩'],['영조','노비종모법'],['정조','윤지충'],['순조','공노비 해방'],['순조','황사영'],['순조','홍경래'],['철종','최제우'],['철종','소청 운동'],['철종','유계춘'],['철종','삼정이정청']])assert(jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),king+' facts include '+needle+' (25강)');
 for(const [king,needle] of [['정조','황사영'],['순조','윤지충'],['철종','홍경래'],['순조','유계춘'],['영조','공노비 해방']])assert(!jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),'대조군(25강): '+king+' facts do not include '+needle);
 // 2026-09-30 26강 조선 후기(문화 1): 광해군 지봉유설 · 동국지리지, 현종 반계수록, 숙종 사변록 · 정제두, 영조 우서 · 성호사설 · 의산문답 · 택리지 · 동국지도, 정조 열하일기 · 발해고 · 동사강목 · 여전론, 순조 경세유표 · 금석과안록 · 자산어보, 철종 대동여지도.
 for(const [king,needle] of [['광해군','『지봉유설』'],['광해군','한백겸'],['현종','유형원'],['숙종','박세당'],['숙종','정제두'],['영조','유수원'],['영조','이익'],['영조','홍대용'],['영조','이중환'],['영조','정상기'],['정조','박지원'],['정조','『발해고』'],['정조','안정복'],['정조','여전론'],['순조','『경세유표』'],['순조','김정희'],['순조','정약전'],['철종','김정호']])assert(jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),king+' facts include '+needle+' (26강)');
 for(const [king,needle] of [['정조','김정희'],['순조','박지원'],['영조','김정호'],['철종','정상기'],['숙종','유형원'],['현종','정제두']])assert(!jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),'대조군(26강): '+king+' facts do not include '+needle);
 // 2026-09-30 27강 조선 후기(문화 2): 선조 곤여만국전도, 인조 정두원 · 침구경험방 · 팔상전, 효종 시헌력 · 농가집성, 숙종 색경 · 각황전, 영조 정선 · 강세황, 정조 배다리 · 거중기 · 마과회통 · 김홍도, 헌종 세한도.
 for(const [king,needle] of [['선조','곤여만국전도'],['인조','정두원'],['인조','『침구경험방』'],['인조','보은 법주사 팔상전'],['효종','시헌력'],['효종','『농가집성』'],['숙종','『색경』'],['숙종','구례 화엄사 각황전'],['영조','인왕제색도'],['영조','영통동구도'],['정조','거중기'],['정조','배다리'],['정조','『마과회통』'],['정조','김홍도'],['헌종','세한도']])assert(jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),king+' facts include '+needle+' (27강)');
 for(const [king,needle] of [['영조','김홍도'],['정조','인왕제색도'],['순조','세한도'],['인조','시헌력'],['숙종','팔상전']])assert(!jk.find(k=>k.name===king).facts.some(f=>f.includes(needle)),'대조군(27강): '+king+' facts do not include '+needle);
 for(const name of ['단종','예종','인종','경종'])assert.equal(jk.find(k=>k.name===name).facts.length,0,'unstudied Joseon king stays blank: '+name);}
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
assert.deepEqual(M.get('history-people').groups.map(g=>g.title),['고조선~삼국','통일 신라·발해·후삼국','고려 전기','고려 무신~원 간섭기','고려 말','조선 전기','조선 후기','근·현대 인물']);
assert.deepEqual(M.get('history-books').groups.map(g=>g.title),['삼국','통일 신라','고려 전기','고려 무신~원 간섭기','고려 말','조선 전기','조선 후기','근·현대']);
// 2026-09-24 주제 특강: 인물 80명(252~256쪽 교재 순서, 뒷면 = 시기 · 문제 해설의 기억 연결 요약)과 책·글·잡지 28을 '근·현대' 묶음으로 더했다.
// 2026-09-30 28강 개항기(흥선 대원군): 인물 6(흥선 대원군 · 남종삼 · 오페르트 · 한성근 · 양헌수 · 어재연)을 '근·현대 인물' 끝에, 책 2(『대전회통』 · 『육전조례』)를 '근·현대' 끝에 더했다. 모두 '개항기'로 시작(고종은 조선 왕 목록 밖이라 왕 고리 없음).
// 2026-09-30 29강 개항기(개항 ~ 갑신정변): 인물 6(이항로 · 이만손 · 김기수 · 김윤식 · 민영익 · 묄렌도르프)을 '근·현대 인물' 끝에(『조선책략』은 이미 있음), 개화 기구 · 사절단 6을 '조선 후기 제도' 끝에 '개항기'로.
// 2026-09-30 30강 개항기(동학 농민 운동 ~ 대한 제국): 인물 3(조병갑 · 이용태 · 부들러), 제도 10(집강소 · 교정청 · 군국기무처 · 홍범 14조 · 교육 입국 조서 · 단발령 · 헌의 6조 · 대한국 국제 · 원수부 · 지계), 문화유산 1(독립문).
// 2026-09-30 31강 국권 피탈과 저항: 인물 8(장지연 · 민영환 · 유인석 · 민종식 · 이인영 · 안규홍 · 스티븐스 · 메가타), 책 1(「시일야방성대곡」), 제도 8(국권 침탈 조약 다섯 · 보안회 · 대한 자강회 · 신민회).
// 2026-10-05 38강 현대(광복 ~ 6·25 전쟁): 인물 3(이승만 · 애치슨 · 맥아더), 책 1(「삼천만 동포에게 읍고함」), 새 묶음 '현대 제도·사건' 13(조선 건국 준비 위원회 ~ 국민 방위군 사건), 짝 5.
// 2026-10-05 32강 개항기(경제): 인물 2(서상돈 · 김광제), 제도 12(개항 초기 조약 넷 · 방곡령 · 상회소 · 황국 중앙 총상회 · 농광 회사 · 화폐 정리 사업 · 국채 보상 운동 · 동양 척식 주식회사 · 대한 천일 은행), 짝 3.
// 2026-10-05 33강 개항기(문화): 인물 6(남궁억 · 이종일 · 알렌 · 지석영 · 이인직 · 안국선), 책 3(『혈의 누』 · 『금수회의록』 · 「유교 구신론」), 제도 12(신문 · 근대 시설 · 학교 · 국학 · 종교), 짝 3.
// 2026-10-05 34강 일제 강점기(식민 통치): 인물 1(사이토 마코토), 새 묶음 '일제 강점기 정책' 13(헌병 경찰 ~ 국가 총동원법), 짝 4.
// 2026-10-05 35강 일제 강점기(1910년대 저항): 인물 2(임병찬 · 박용만), 새 묶음 '일제 강점기 민족 운동' 17(경학사 ~ 국민 대표 회의), 짝 5.
// 2026-10-05 36강 일제 강점기(1920년대 저항): 인물 2(조만식 · 김상옥), '일제 강점기 민족 운동'에 19(물산 장려 운동 ~ 미쓰야 협정), 짝 5.
// 2026-10-05 37강 일제 강점기(1930년대 이후 저항): 인물 2(김두봉 · 이병도), '일제 강점기 민족 운동'에 14(한인 애국단 ~ 조선 건국 동맹), 짝 4.
// 2026-10-05 39강 현대(민주주의의 발전): 인물 5(조봉암 ~ 김영삼), '현대 제도·사건'에 18(발췌 개헌 ~ 역사 바로 세우기), 짝 4.
// 2026-10-05 40강 현대(경제 발전과 통일 정책): 인물 1(전태일), '현대 제도·사건'에 15(삼백 산업 ~ 10·4 남북 공동 선언), 짝 4.
assert.equal(M.size(M.get('history-people')),350);assert.equal(M.size(M.get('history-books')),155);
{const g=M.get('history-people').groups.at(-1);assert.equal(g.cards.length,127);for(const [f,b] of g.cards){assert(/^(개항기|대한 제국 시기|한국을 도운 외국인|일제 강점기|일제 강점기·광복 전후|광복 전후|현대) · /.test(b),'근·현대 인물 뒷면은 시기부터: '+f);assert(!/[{}]/.test(b),'왕 표시 남음: '+f);}}
// 왕에 걸린 앞머리: 인물 101 · 책 22. 나머지(인물 31 · 책 17)는 왕이 하나로 정해지지 않아 시기만 적었다(고조선·가야, 일본 전파, 승려·학자 등).
// 15강(2026-09-16)으로 책 6(초조대장경 현종·『상정고금예문』 인종·팔만대장경 고종·『직지심체요절』 우왕 + 교장·『향약구급방』은 시기만)과 인물 1(혜허, 시기만)을 더했다.
// 2026-09-18 왕 고리 넓히기: 최충 → 문종, 이규보 「동명왕편」 → 명종, 각훈 『해동고승전』 → 고종, 이제현 『사략』 → 공민왕(이제현은 충선왕과 함께 둘).
// 2026-09-19 16강(조선 전기 정치): 인물 17(정도전·최윤덕·김종서·이종무·이징옥·성삼문·이시애·김종직·김일손·한명회·김굉필·조광조·윤임·윤원형·이언적·김효원·심의겸)과 책 7(『조선경국전』·『경제문감』·『불씨잡변』·『경국대전』·『국조오례의』·「조의제문」·『소학』)이 조선 왕에 걸렸다.
// 2026-09-23 20강 조선 전기(문화 I): 인물 9(조준·박연·정인지·서거정·신숙주·성현·주세붕·이황·이이)과 책 14(『고려국사』·『경제육전』·『석보상절』·『삼강행실도』·『고려사』·『고려사절요』·『동국통감』·『팔도지리지』·『동국여지승람』·『해동제국기』·『악학궤범』·『신증동국여지승람』·『성학십도』·『성학집요』)이 조선 왕에 걸렸다. 개인 저술(이황·이이·박상·김장생의 책, 『동몽선습』·『동몽수지』)과 기대승·박상·김장생은 시기만 둔다.
// 2026-09-24 21강 조선 전기(문화 II): 인물 7(장영실·이순지·정초·안견·안평 대군·강희맹·정철)과 책 14(『칠정산』·『의방유취』·『향약집성방』·『농사직설』·『총통등록』·『용비어천가』·『동국정운』·『훈민정음 해례본』·『진법』·『동국병감』·『금양잡록』·『동문선』·「관동별곡」·「사미인곡」)이 조선 왕에 걸렸다. 강희안·김시습·박팽년·신사임당·이상좌·한호와 『금오신화』는 시기만 둔다.
// 2026-09-27 22강 조선 후기(정치): 인물 9(정여립 · 송시열 · 허적 · 윤휴 · 희빈 장씨 · 인현 왕후 · 이인좌 · 박제가 · 유득공)와 책 7(『속대전』 · 『속오례의』 · 『동국문헌비고』 · 『대전통편』 · 『동문휘고』 · 『탁지지』 · 『무예도보통지』)이 조선 왕에 걸렸다(정철은 뒷면만 보탬).
// 2026-09-28 23강 조선 후기(조직, 외교): 인물 5(이완 · 변급 · 신류 · 목극등 · 안용복)와 책 1(『북학의』)이 조선 왕에 걸렸다. 이범윤은 대한 제국 시기만 둔다(고종은 조선 왕 목록 밖). 박제가는 뒷면만 보탬.
// 2026-09-28 24강 조선 후기(경제): 인물 2(이원익 광해군 · 김육 효종)가 조선 왕에 걸렸다. 허적은 뒷면만 보탬(상평통보).
// 2026-09-28 25강 조선 후기(사회): 인물 4(윤지충 정조 · 황사영 · 홍경래 순조 · 유계춘 철종)가 조선 왕에 걸렸다. 최시형은 동학 2대 교주로만(고종은 조선 왕 목록 밖), 책 『정감록』은 '조선 후기'.
// 2026-09-30 26강 조선 후기(문화 1): 인물 15(박세당 · 정제두 숙종 · 유형원 현종 · 이익 · 유수원 · 홍대용 · 이중환 · 정상기 영조 · 정약용 정조·순조 · 박지원 · 안정복 정조 · 김정희 순조 · 이수광 · 한백겸 광해군 · 김정호 철종)와 책 15가 조선 왕에 걸렸다. 『곽우록』 · 『해동역사』 · 『연려실기술』 · 『언문지』는 '조선 후기'. 유득공 · 박제가는 뒷면만 보탬.
// 2026-09-30 27강 조선 후기(문화 2): 인물 7(정두원 · 허임 인조 · 허준 광해군 · 신속 효종 · 정선 · 강세황 영조 · 김홍도 정조)과 책 5(『동의보감』 · 『침구경험방』 · 『마과회통』 · 『농가집성』 · 『색경』)가 조선 왕에 걸렸다. 이제마 · 『동의수세보원』은 조선 말(고종은 조선 왕 목록 밖), 신윤복 · 김득신 · 허균 · 신재효 · 『홍길동전』 등은 '조선 후기'. 김육 · 박세당 · 김정희는 뒷면만 보탬(김정희는 순조·헌종).
assert.deepEqual(anchoredCards,{'history-people':176,'history-books':85});
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
 // 2026-09-24 21강: 원각사지 10층 석탑(세조)·그림 5(몽유도원도 세종, 나머지는 시기만)·새 묶음 '분청사기·백자'(시기만)·과학 기술 7(천상열차분야지도 태조·계미자 태종·갑인자·측우기·앙부일구·자격루·혼천의·간의 세종)을 더했다.
 assert.deepEqual(set.groups.map(g=>g.title),['불상','탑·승탑','무덤·비석','회화·불화','청자·금속 공예','분청사기·백자','건축','과학 기술·인쇄']);assert.equal(M.size(set),92);
 let anchored=0;const fronts=new Set();for(const [front,backText] of set.groups.flatMap(g=>g.cards)){assert(!fronts.has(front),'no duplicate front: '+front);fronts.add(front);const a=anchorsOf(backText);if(a.length)anchored++;for(const {king,country} of a)assert(factsOf(country,king).some(f=>f.includes(front)),'history-heritage: '+king+'('+country+') facts name '+front);}
 // 2026-09-30 27강: 인왕제색도 · 금강전도 · 영통동구도(영조) · 서당 · 씨름 · 거중기(정조) · 세한도(헌종) · 보은 법주사 팔상전(인조) · 구례 화엄사 각황전(숙종) · 곤여만국전도(선조) 9개가 더 걸림 → 46. 단오풍정 · 월하정인 · 파적도 · 까치와 호랑이 · 청화 백자 · 김제 금산사 미륵전은 '조선 후기'.
 assert.equal(anchored,46,'왕에 걸린 문화유산 28(2026-09-19 경복궁 태조·종묘 태조·창덕궁 태종 + 석굴암 본존불·미륵사지 석탑·분황사 모전 석탑·황룡사 9층 목탑·감은사지 3층 석탑·불국사 3층 석탑·다보탑·경천사지 10층 석탑·무령왕릉·광개토 대왕릉비·단양 적성비·순수비·정혜 공주 묘·천산대렵도·칠지도·상원사 동종·성덕대왕 신종·무구정광대다라니경·초조대장경·팔만대장경·화통도감 + 2026-09-19 관촉사 석조 미륵보살 입상 광종·정토사지 홍법국사탑 현종·사천대 현종·수덕사 대웅전 충렬왕)');
 // 재질·유형이 빠진 칸이 없어야 "왕 — 문화유산 — 재질" 묶음으로 외울 수 있다.
 assert(set.groups.flatMap(g=>g.cards).every(([,b])=>/불|탑|무덤|벽화|벽돌|비석|그림|청자|공예|칼|범종|옻칠|목조|주심포|다포|공포|목판|관청|건물|역법|활자|기구|시계/.test(b)),'every heritage card names its material or type');
 assert(back('history-heritage','개성 경천사지 10층 석탑').includes('원의 영향')&&back('history-heritage','안동 봉정사 극락전').includes('가장 오래된'));}
// 경제·사회 제도(07·13강 중심) → 왕·한 줄. 왕이 붙은 칸은 그 왕의 사실에 제도 이름이 들어 있어야 한다.
{const set=M.get('history-economy');assert(set&&set.groups&&set.subject==='한국사','history-economy set');
 assert.deepEqual(set.groups.map(g=>g.title),['삼국·남북국 경제','고려 토지·수취','고려 상업·화폐·농업','고려 사회','조선 전기 제도·향촌','조선 후기 제도','일제 강점기 정책','일제 강점기 민족 운동','현대 제도·사건']);assert.equal(M.size(set),268);
 let anchored=0;const fronts=new Set();for(const [front,backText] of set.groups.flatMap(g=>g.cards)){assert(!fronts.has(front),'no duplicate front: '+front);fronts.add(front);const a=anchorsOf(backText);if(a.length)anchored++;for(const {king,country} of a)assert(factsOf(country,king).some(f=>f.includes(front)),'history-economy: '+king+'('+country+') facts name '+front);}
 // 2026-09-28 23강: 비변사(중종·명종) · 훈련도감 · 속오군(선조) · 어영청 · 총융청 · 수어청(인조) · 금위영(숙종) 7개가 더 걸림 → 44.
 // 2026-09-28 24강: 영정법(인조) · 대동법(광해군·숙종) · 결작 · 선무군관포(영조) · 설점수세제(효종) · 상평통보(숙종) 6개가 더 걸림 → 50. 공인 · 도고 · 송상 · 보부상 · 덕대 등 14개는 '조선 후기'.
 // 2026-09-28 25강: 공명첩(선조) · 노비종모법(영조) · 공노비 해방(순조) · 소청 운동 · 삼정이정청(철종) 5개가 더 걸림 → 55. 납속 · 통청 운동 · 시사 · 향전은 '조선 후기'.
 // 2026-09-30 26강: 균전론(현종) · 여전론(정조) 2개가 더 걸림 → 57. 한전론 · 정전제는 '조선 후기'.
 assert.equal(anchored,57,'왕에 걸린 제도 31(2026-09-19 호패법·신문고 태종, 직전법·유향소 세조 / 2026-09-23 19강 공법 세종·관수관급제 성종·직전법 폐지와 『구황촬요』 명종·경재소 선조), 나머지 28은 왕이 하나로 정해지지 않아 나라·시기만');
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
// 22강(조선 후기 정치)을 공부하면서 '조선 후기'가 범위 안으로 들어왔다(2026-09-27) — 인물 · 책 · 제도 묶음 제목.
// 26강(조선 후기 문화 1)을 공부하면서 『발해고』가 범위 안으로 들어왔다(2026-09-30).
const OUT_OF_RANGE=['입학도설'];
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
 assert(day5.length>=3&&day5.every(g=>/^Day ([5-9]|1[0-5]) /.test(g.title)));
 // Day 6·7(v151): 포인트마다 한 칸, 뒷면은 그 포인트 문제의 해설 끝 외우는 공식 블록과 같은 글.
 // Day 8 · 9 · 10(v204)도 포인트마다 한 칸(규칙 정리마다 한 묶음).
 for(const day of [6,7,8,9,10,11,12,13,14,15]){const gs=day5.filter(g=>g.title.startsWith('Day '+day+' ')),pts=new Map();for(const [k,l] of Object.entries(bank))if(k.startsWith('en-day'+day+'-'))pts.set(l.point,l.variants[0].explanation.split('\n\n').pop());
  assert(gs.length>=3);assert.deepEqual(new Set(gs.flatMap(g=>g.cards.map(c=>c[0]))),new Set(pts.keys()),'Day '+day+' 포인트 전부');for(const [f,b] of gs.flatMap(g=>g.cards))assert.equal('외우는 공식\n'+b,pts.get(f),'해설 블록과 같은 글: '+f);}
 const points=new Set(Object.entries(bank).filter(([k])=>k.startsWith('en-day5-')).map(([,l])=>l.point));assert.deepEqual(new Set(day5.filter(g=>g.title.startsWith('Day 5')).flatMap(g=>g.cards.map(c=>c[0]))),points,'Day 5 포인트 전부');
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
  '성동구 · 성종 때 성현 · 현악 · 완성 담당 성종','문고리사 · 문종고려사','수간경','불씨 잡는 소방관 정도전 · 조선건국전','숙주나물 해동 해례','거동','이이는 집요하다 · 황도','양지','기어이 축출','북받친 북인 · 남 일 같은 남인','서인 대반전','서로 같은 서인 · 남다른 남인','현자의 대비 · 현타','기선 잡은 기해 서인 · 갑질 갑인 남인','경기 갑!','서남서 바람','허락 없이 적(가져)간 천막','노발대발 노론 · 소심한 소론','장희빈 기사회생','인현 왕후 갑(甲) 탈환','영속(永續)','영문학','영차영차 청계천','2인자가 왕좌를 노린 난','탕! 평!','영조 마트 균일가 1필','정통(正統)','정규직','정동','장용영 교과서','안김 풍조','누렁이·해골·이웃·족보','비대위가 회사를 먹었다 · 중임 명상','월급 받는 삼수생','어영부영 총 수비 인조','숙종의 금메달','속옷군','몰빵했다 털리고 원위치','북벌 대장이 이완','나선형 총알','유수처럼 홍수처럼 박박 긁어 배워 오자','숙종의 숙제','토론 문제의 강','간도 호랑이 이범윤','간 떼어 판 협약','싹 환수사','광 내는 기름은 약간만','조선 아이돌 월드투어','안 용서해 독도','41 = 사수 1호','전쟁 틈 도둑질','인조의 영정 사진','쌀로 대동단결','땅·바다·가짜 장교','이앙하니 이모가 광나게 왔다','담배 한 대, 고추 한 입, 인삼 한 뿌리, 솜이불','반띵 타조 · 도장 도조','공개 개시 · 뒷거래 후시','만주 만상 · 동래 내상 · 가운데 송상','여관 은행 객주','돈 가뭄','선불 선대제','광산 대리 사장 덕대','이름 빈칸 임명장','잔반 처리된 양반','서러운 얼굴 서얼, 정규직 되다','철종 철벽 소청','엄마 따라 양인 · 순순히 공노비 해방','구세대 구향 vs 신세대 신향','정씨가 감(感)으로 본 예언','정조 신해 · 순조 신유 · 흰 비단 편지','인내천 — 참으면 사람이 하늘','서북 차별에 홍당무 된 홍경래','진주 백낙신 백 번 뜯다','쑥이든 주전자 · 쑥을 해동','○조면 조선 · 충○왕이면 고려','최승로 말 잘 듣는 고려 성종 · 완성 담당 조선 성종','현기증 초조함 · 현자의 대비','고려 문종 경정 · 조선 문종 문고리사','스님은 해동 · 희빈은 상평','난리 둘 고려 인종 · 금방 끝난 조선 인종','명종 때 명학소 · 명을사','경종을 울려 시정 · 목종 목에 개목걸이 · 문종이 문 닫고 경정','김장 담그듯 가례 집합','윤휴의 휴일 독서 · 박세당 사변','강화도 정제 두부 양념','신분 따라 반계탕','한전은 이익 많이 나는 기업 · 좀벌레 여섯 마리 · 이익인데 돈이 싫은 선생','마을밭에서 일하는 용 · 우물 파는 용 · 흠흠 헛기침 재판관','사농공상 모두 우대하는 우서','홍대 클럽 용이 지구본을 돌린다','열 받아 호되게 질책한 박지원','북한에서는 박제해버려 · 제가 쓸게요 — 우물은 퍼야 찬다','발해로 득점 골! 남북국 더비','안정된 강목 · 사건 파일 · 해외 직구 역사 · 만주까지','돌 감정사 김정희 — 무학 비? 진흥왕 비!','정상까지 백 리 · 대동 접이 지도','지붕 위 천주님','살 동네 택하는 이중환','김육 시험 달력 · 충청도 대동','두 눈으로 원거리 정두원','만국 박람회 지도','이제 말(馬)은 네 체질','허준 보감 · 허리에 침 허임 · 약용 홍역','약용 크레인 · 정조 배다리','색색 채소 색경 · 신속하게 모내기','팔(8) 장면 걸린 5층 나무탑','흰 도화지에 파란 볼펜 그림','단원은 단체전 · 혜원은 헤어 감기','정선 아리랑 부르며 진짜 산 그리기','3D 안경 쓴 강세황','고양이가 병아리 득템','추워서 추사 · 소나무 세한도','이름 없는 까치호랑이','신재효 신곡 여섯 마당 · 탈 쓰고 탈탈 털기','허! 균형 없는 서얼 차별','사람 오디오북 전기수 · 책 대여점 세책가','흥! 선 넘는 아버지','원망하며 내는 원납전 · 백 배 뻥튀기 당백전','공자가 살아와도 용서 안 해 · 만동묘 문 닫아','숨은 결 찾기 · 양반도 호되게 호포 · 마을 사설 창고 사창','와인병 프랑스 · 신(新)미국','뻐큐수 · 법규수 박규수 · 대동강 불쇼','오! 파헤쳐 오페르트','척하면 척 — 화친 반대','병제병오신 · 그리고 척!','몽골에 고생 고려 고종 · 아버지 등쌀 조선 고종','화려한 의상 · 의천은 천태종','중이 백 번 종 치고 운동한다','운요호로 운 떼고 부원인 개항 · 측량도 재판도 일본 맘대로','쌀 퍼 가는 무관세 · 엔화 들고 10리 산책','통째로 리모컨 쥔 기무아문 · 별난 신식 별기군','수신 문자 일본 · 몰카 시찰 · 영선이 톈진 총 · 보빙사 미국 빙수','김홍집이 집어 온 책 · 영남 만 명이 빡침','항로 차단 이항로 · 왜나 양이나 한 패 최익현 · 만 명이 만손','모래 쌀에 빡친 구식 군인 · 대원군 컴백 후 납치','우체국 개업 파티에서 갑자기 신나게 정변 · 3일 천하','제물포에 군대 · 한성에 공사비 · 톈진은 파병 전 문자','몸은 동양 기술만 서양 · 싹 다 갈아엎자','영국이 거머쥔 거문도 · 부들부들 중립','조병갑의 갑질 · 이용태가 이용 · 서면 백산 앉으면 죽산 · 전주 비빔밥 화약','남북 합체 논산 · 우금치에서 울다','군기 잡는 군국기무처 · 홍범 14조 23부 · 교육으로 나라 세우기','을씨년스러운 미용실','절영도 절대 못 줘 · 헌의 6조 중추원 · 보부상에 박살','광나는 황제 · 옛것 본체 새것 참고 · 원수는 황제 · 지계는 땅 계약서','개가 건방져 광분','의자 고르고 외제차 사면 병남','오늘 목 놓아 운다 · 헤이그에 이 셋','미 · 영 · 러가 다 눈감음','황무지 보안 요원 · 퇴위 반대 자강회 · 비밀 공화국 신민회','머리 잘려 을미 · 돌 던지는 평민 을사 · 군인 합류 정미','샌프란 전장 · 하얼빈 안중근 · 명동 이재명','미국은 미관상 최고 · 청 상인 안방 침투 · 일본 장정에 방곡 버튼','메가 타격 백동화','동척이 척척 먹는 땅 · 나석주 폭탄 배달','셔터 내린 시전 · 황제 간판 총상회 · 하늘 아래 첫째 천일 은행','방에 곡식 가두고 한 달 전 문자 깜빡','보안 요원이 막고 농광이 직접 갈아엎다','대구에서 서서 상 돈 걷기 · 담배 끊고 비녀 빼고 · 양기탁에 횡령 누명','열흘에 한 번 한성 · 서재필 한글 영어 · 남궁 황성 통곡 · 베델 방패 · 제국 아줌마 신문','기기 총 · 박문 인쇄 · 전환 돈 · 알렌 병원 · 콜브란 전차 · 영은문 헐고 독립문','원산 주민 셀프 학교 · 양반 영어 육영 공원 · 고종 조서로 교육 입국 · 아펜 배재 스크랜 이화','국문 연구 주지 · 독사 물린 신채호 · 유교 고쳐 박은식 · 단군 모신 나철 · 원각사 은세계','칼 찬 선생님 · 한국인만 곤장 · 허락받고 회사 · 신고 안 하면 땅 뺏김','사이좋은 척 사이토 · 옷만 갈아입은 경찰 · 문관 총독은 말뿐 · 쌀을 이고 가는 모습','쌈박질 치고박고 · 일왕 쪽 보고 절 · 이름까지 갈아엎기 · 미리 가두는 예방 구금 · 열 집 묶어 애국반','싹 팔아 총동원 · 지원 → 학도 → 징병 · 쌀 공출 숟가락 공출 · 농촌에 삼으리랏다 32','서쪽 경신 · 북쪽 서명하고 중광 · 연해주 권광 · 미국 흥사단 · 하와이 군단 · 멕시코 숭무','임금님 복귀 임병찬 · 박차고 공화국 박상진','윌슨이 던진 자결 · 도쿄 이팔 · 고종 장례 앞두고 태화관 · 제암리 교회 방화','연통 교통 비밀 연락 · 공채 팔아 돈 · 구미 당기는 외교 · 새로 짓자 vs 고쳐 쓰자','조선 사람 조선 것 · 자본가 배만 불린다 · 이상재 대학 모금 · 경성 제대로 맞불','섬에서 소작료 싸움 · 저울처럼 평평 · 방정환 어린이 · 근우는 여자 신간회','이광수의 타협 꼬드김 → 정우회가 내민 손 → 순종 장례 6 · 10 → 신간회 → 광주로 진상 조사단 → 해소','부산서 박살 박재혁 · 총독부 익힌 김익상 · 종로서 상옥 · 궁지에 몬 김지섭 · 동척 나와라 나석주','봉오동 홍 → 청산리 김 → 간도 참변 → 밀산 모여 자유시 참변 → 참 · 정 · 신 → 미쓰야 → 남 국민 · 북 혁신','혼을 지킨 박은식 · 아와 비아 신채호 · 가갸 거겨 연구회 · 나운규 아리랑','김구가 만든 애국단 · 이봉창 일왕 겨냥 · 물통 폭탄 윤봉길 · 장제스가 감동','쌍대사 지청천 · 영흥한 양세봉','김구 빠진 혁명당 → 전선 연맹 군대 의용대 → 화북 가서 의용군 · 남은 원봉 광복군','맞춤법 학회 · 민중 속으로 동아 · 얼빠지지 마 정인보 · 진단은 이병도 · 백남운 경제 법칙','충칭 주석 김구 · 광복군 총사령 지청천 · 삼균 조소앙 · 국내 건국 여운형 · 화북 독립 김두봉','건준이 치안 · 모스크바 5년 신탁 · 우익 반탁 좌익 지지 · 정읍 단독 발언 · 좌우 합작 여 · 김','총회는 남북 다 · 소련이 문 잠금 · 소총회는 되는 데만 · 38선 베고 쓰러질지언정 · 5 · 10 첫 보통 선거','친일파 잡는 반민특위 · 경찰이 특위 습격 · 돈 내고 3정보 · 북은 공짜','애치슨 선 밖 → 낙동강 버티기 → 맥아더 인천 뒤통수 → 중국군 오자 흥남 금순아 → 포로 풀어 버린 이승만','발췌 직선 → 사사오입 초대만 → 허정 내각제 → 박정희 3선 → 유신 체육관 6년 → 선거인단 7년 → 6월 항쟁 5년 직선','조봉암 사형 · 경향 폐간 · 이기붕 부통령 만들기 · 김주열 마산 · 장면 양원제 · 5 · 16 최고 회의 · 김종필 메모 6 · 3','명동 성당 구국 선언 · YH 농성 김영삼 제명 · 부산 마산 10 · 26 · 계엄 확대 광주 · 탁 치니 억 · 4 · 13 호헌','전두환 삼청 · 노태우 3당 합당 · 김영삼 하나회 해체 · 김대중 노사정 · 노무현 과거사','하얀 셋 삼백 · 경공업 → 중화학 · 사채 얼린 8 · 3 · 전태일 분신 · 기름 달러 금리 3저 · 실명제 → 외환 위기 · 금 모으기','자 · 평 · 민 7 · 4 · 첫 이산가족 상봉 · 7 · 7 → 유엔 → 기본 합의 → 비핵화 · 햇볕 소 떼 6 · 15 · 10 · 4는 노무현'];
 assert.deepEqual(H.blocks.map(b=>b.hook).sort(),[...USER_WORDS].sort(),'사용자가 만든 낱말만 남는다');
 assert.equal(H.blocks.length,204);assert.equal(M.size(set),204);
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
