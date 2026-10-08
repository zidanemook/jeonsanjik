// 가운뎃점 금지(2026-10-08 사용자: "· <== 글자사용 금지한다."). 자체 제작 글에 · (U+00B7) ‧ (U+2027) ・ (U+30FB) ㆍ (U+318D)가 다시 들어오면 실패한다.
// 지금 검사하는 곳: 기초 개념 상자(basics.js boxes) 전부 · 대입(basics.js apply) · 외울 것(memorize.js)
//   + (2026-10-09) 이름: 파트 · 단원(parts.js) · 한국사 주제(topics.js) · 요약 묶음과 강(study-review-catalog.js) · 문법 공식 영역 · 외울 것 묶음 제목 · 색인(content-index.js)의 같은 칸
//   + (2026-10-09) 화면 글: 배포되는 스크립트(pages.yml의 Stage app 목록)의 문자열 · 템플릿 · 정규식(주석은 보지 않는다)과 index.html · style.css · manifest.json.
// 아직 고치지 않은 곳(해설 · 보기 · 문제 글)은 PENDING에 적어 두고 고칠 때마다 이 파일에서 한 줄씩 지운다 — 지우면 그 범위도 바로 검사된다.
// 예외는 아래 ALLOW 한 곳에만 둔다(사용자 답을 기다리는 것들 · 원장 지문에 묶여 이번에 못 고친 것들 — 풀리면 여기서 지운다. 지우면 그 자리도 바로 검사된다).
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const DOT=/[·‧・ㆍ]/;
const ALLOW={
 // (한국사만) 시험지가 가운뎃점으로 적는 날짜 이름: 3·1 운동, 6·25 전쟁 …
 dates:['3·1','6·10','4·19','5·16','5·18','6·25','6·15','7·4','4·3','10·26','12·12','2·8','1·4','5·10','8·15','6·29','10·4','10·19','3·15','6·3','8·3','7·7','4·13','5·4','1·21','9·28','5·30','4·27','2·28','12·28','8·18','5·17','6·8','7·29','4·18','10·1','9·19','6·23'],
 // (한국사만) 나라 이름 한 글자씩: 조·미, 한·일, 러·일, 나·당, 부·마 …
 nations:'조한러청중미소남북나당여몽영일프독불명부마원',
 // (한국사만) 이름 둘로 된 조약 · 동맹 이름
 names:['가쓰라 ?· ?태프트','(?<![가-힣])나 ?· ?제(?![가-힣])'],
 // 상자 통째: 국어 공문서 2장 문장 부호 — 가운뎃점 자체를 가르치는 상자
 boxes:['kdoc-d2-mid','kdoc-d2-end'],
 // 외울 것 묶음 통째: 영어 공식(문제 해설 끝 블록과 글자까지 같아야 한다 — 해설을 고칠 때 함께) · 내가 만든 외우는 낱말(사용자가 만든 낱말 묶음)
 memorizeSets:['english-grammar-formulas','history-mnemonics'],
 // 이름 칸 가운데 이번에 그대로 둔 것(2026-10-09). 한 줄을 지우면 그 칸도 바로 검사된다.
 left:[
  'bankLesson',   // practice-bank.js 연습 문제의 title · point · srcLine — 원장(content-review.json) 지문이 lesson 통째를 묶는다. 해설 · 보기를 고치며 원장을 다시 승인할 때 함께.
  'formulaRules', // 문법 공식 규칙 이름(ENGLISH_FORMULAS rules[].title) — 문법 공식 훈련 문제의 lesson.title과 같은 글이라 원장 지문에 든다. 영역 이름은 고쳤다.
  'sections',     // topics.js sections = study-review-catalog.js 문제의 section — 주제를 찾는 열쇠일 뿐 화면에 나오지 않는다(양쪽이 글자까지 같아야 한다).
 ],
 // 배포 스크립트 안에 그대로 둔 조각: [파일, 조각, 나오는 횟수]. 횟수가 달라지면(고쳤거나 늘었으면) 실패한다 — 고쳤으면 그 줄을 지운다.
 code:[
  ['app.js',"words.join(' · ')!==b.hook",1],                 // 사용자가 만든 외우는 낱말의 hook(' · '로 이어 적은 원문)과 견주는 비교. 화면에 쓰는 글이 아니다.
  ['hanneung.js',"'번 · '+r.points+'점'",1],                  // 한능검 문제 제목(한능검 심화 80회 12번 · 2점) — 원장 지문에 든다.
  ['hanneung.js',"' · 배점 '",1],                             // 한능검 해설 머리(공식 정답 · 배점) — 해설 글, 원장 지문.
  ['hanneung.js',"'확인한 자료 · '",1],                        // 한능검 해설 끝 줄 — 해설 글, 원장 지문.
  ['hanneung.js',"'정리한 날 · '",1],
  ['hanneung.js',"'국사편찬위원회 공개 심화 기출 · '",1],        // 출처 줄 — 원장 지문.
  ['gichul.js',"' (이용허락범위 제한 없음) · '",1],            // 9급 기출 출처 줄 — 원장 지문.
  ['gichul.js',"'번 원문 전사 · 공식 정답 '",1],
  ['gichul.js',"' · '+paper.title",1],                        // 9급 기출 해설 머리(공식 정답 · 시험 이름) — 해설 글, 원장 지문.
  ['gichul-index.js','시·도 지방공무원 9급 등 임용 필기시험',4], // 공식 시험 이름 그대로(2019~2022 지방직 표지).
 ],
 // 통째로 다음 묶음(해설 · 보기 · 문제 글)에서 고칠 배포 파일
 codeFiles:['content-corrections.js'],
};
// 아직 고치지 않아 검사에서 빼 둔 범위(고치면 지운다)
const PENDING=['해설 · 보기 · 문제 글(practice-bank.js · core-review-pack.js · quiz-options.js · hanneung-explanations.js · study-review-catalog.js의 coverage · content-corrections.js)'];
const DATE_RE=new RegExp('(?<![0-9])(?:'+ALLOW.dates.map(d=>d.replace('·',' ?· ?')).join('|')+')(?![0-9])','g');
const NATION_RE=new RegExp('(?<![가-힣])['+ALLOW.nations+'] ?· ?['+ALLOW.nations+'](?:(?![가-힣])|(?=(?:이|가|은|는|의|과|와|을|를|에|도|로)(?![가-힣])))','g');
const NAMES_RE=new RegExp(ALLOW.names.join('|'),'g');
// 한국사 글: 날짜 · 나라 · 이름 예외와 고리 속 사용자 낱말(‘…’)을 뺀 뒤 본다. 다른 과목은 예외가 없다.
function bad(text,history){let s=String(text);if(history){s=s.replace(/ → 고리: (?:‘[^’‘]+’(?:, (?=‘))?)+/g,'');for(const r of [DATE_RE,NATION_RE,NAMES_RE])s=s.replace(r,'');}return DOT.test(s);}
// ── 대조군: 검사가 실제로 걸리는가
assert.ok(bad('용정촌 · 명동촌',true)&&bad('용정촌·명동촌',true)&&bad('A‧B',false)&&bad('A・B',false)&&bad('AㆍB',false),'가운뎃점 네 가지를 잡는다');
assert.ok(!bad('3·1 운동과 6 · 25 전쟁, 한 · 일 협정, 나·당 전쟁, 가쓰라 · 태프트 밀약',true),'예외 이름은 지나간다');
assert.ok(bad('3·1 운동',false)&&bad('0 · 1',true)&&bad('한 · 일',false),'예외는 한국사 글에서만, 목록에 있는 것만');
assert.ok(!bad('뜻 → 고리: ‘고생 강화천도함 · 팔만대장경 노동 고생’',true)&&bad('뜻 → 고리: ‘가’ · ‘나’',true),'고리 속 사용자 낱말은 지나가고 고리 사이의 가운뎃점은 잡는다');
assert.ok(!bad('서간도 = 삼원보. 북간도 = 용정촌, 명동촌, 대종교.',true),'고친 글은 지나간다');
// ── 기초 개념 상자
const B=require('./basics.js');const fails=[];let fields=0,kept=0;
const walk=(o,where,history)=>{if(typeof o==='string'){fields++;if(bad(o,history))fails.push(where+': '+o.slice(0,70));else if(DOT.test(o))kept++;return;}
 if(Array.isArray(o)){o.forEach((x,i)=>walk(x,where+'['+i+']',history));return;}
 if(o&&typeof o==='object')for(const k of Object.keys(o))if(k!=='id'&&k!=='rowIds'&&k!=='mnemonics')walk(o[k],where+'.'+k,history);};
for(const [id,b] of Object.entries(B.boxes)){if(ALLOW.boxes.includes(id))continue;walk(b,id,/^hist-/.test(id));}
// ── 대입: 한국사는 상자가 hist-이거나 한국사 기출(한능검 · 9급 한국사). 예외 상자(문장 부호)의 문제에 붙은 대입은 그대로 둔다.
require('./practice-bank.js');const ruleOf=id=>(globalThis.PRACTICE_BANK[id]||{}).ruleId||'';
const boxFields=fields;let applySkipped=0;
for(const [id,a] of Object.entries(B.apply)){if(ALLOW.boxes.includes(a.box||ruleOf(id))){applySkipped++;continue;}walk(a.blocks,'대입 '+id,/^hist-/.test(a.box||'')||/^(hanneung-|gichul-[^-]+-[^-]+-history)/.test(id)||/-hist-/.test(id));}
const applyFields=fields-boxFields;assert.ok(applySkipped>0&&applySkipped<100,'문장 부호 상자의 대입만 예외: '+applySkipped);
// ── 외울 것
const M=require('./memorize.js');let memo=0;
for(const set of M.sets){if(ALLOW.memorizeSets.includes(set.id))continue;const before=fields;walk(set,'외울 것 '+set.id,set.subject==='한국사');memo+=fields-before;}

// ── 이름(2026-10-09): 화면에 제목 · 범위 이름으로 나오는 칸. 한국사 이름만 날짜 · 나라 예외를 받는다.
const titleFails=[];let titles=0,titleKept=0;
const name=(text,where,history)=>{titles++;if(typeof text!=='string'){titleFails.push(where+': 글이 아니다');return;}if(bad(text,history))titleFails.push(where+': '+text.slice(0,70));else if(DOT.test(text))titleKept++;};
const left=k=>ALLOW.left.includes(k);
function nameUnits(units,from,out=name){for(const u of units){const h=u.subject==='한국사';out(u.title,from+' 단원 '+u.id,h);out(u.short,from+' 단원 줄임 '+u.id,h);for(const p of u.parts)out(p.title,from+' 파트 '+p.id,h);}}
function nameCatalog(c,from){for(const s of c.sets)name(s.title,from+' 묶음 '+s.number,true);for(const l of c.lectures||[])name(l.title,from+' 강 '+l.id,true);}
function nameAreas(areas,from){for(const a of areas){name(a.title,from+' 공식 영역 '+a.id,false);if(!left('formulaRules'))for(const r of a.rules)name(r.title,from+' 공식 '+r.id,false);}}
// 대조군: 이름 검사가 실제로 걸리는가(가짜 단원)
{const got=[];const probe=(t,w,h)=>{if(bad(t,h))got.push(w);};
 nameUnits([{id:'x1',subject:'국어',title:'탈락 · 축약 · 첨가',short:'문법 1장',parts:[{id:'p1',title:'형태소·단어'},{id:'p2',title:'탈락, 축약, 첨가'}]},
  {id:'x2',subject:'한국사',title:'38강 현대(광복 ~ 6·25 전쟁)',short:'38강',parts:[{id:'p3',title:'3·1 운동과 대한민국 임시 정부'},{id:'p4',title:'구석기·신석기'}]},
  {id:'x3',subject:'영어',title:'Day 1',short:'3·1',parts:[]}],'대조',probe);
 assert.deepEqual(got,['대조 단원 x1','대조 파트 p1','대조 파트 p4','대조 단원 줄임 x3'],'이름 대조군: 가운뎃점이 든 단원 · 파트 이름만 잡고, 한국사 예외 이름과 고친 이름은 지나간다');}
const PARTS=require('./parts.js');nameUnits(PARTS.units,'parts.js');
const TOPICS=require('./topics.js');for(const t of TOPICS.list){name(t.title,'topics.js 주제 '+t.id,true);if(!left('sections'))for(const s of t.sections)name(s,'topics.js sections '+t.id,true);}
require('./study-review-catalog.js');const CATALOG=globalThis.STUDY_REVIEW_CATALOG;nameCatalog(CATALOG,'study-review-catalog.js');
if(!left('sections'))for(const [id,q] of Object.entries(CATALOG.questions))name(q.section,'study-review-catalog.js section '+id,true);
nameAreas(globalThis.ENGLISH_FORMULAS.areas,'practice-bank.js');
if(!left('bankLesson'))for(const [id,l] of Object.entries(globalThis.PRACTICE_BANK)){const h=l.subject==='한국사';name(l.title,'practice-bank.js title '+id,h);if(l.point!==undefined)name(l.point,'practice-bank.js point '+id,h);if(l.srcLine!==undefined)name(l.srcLine,'practice-bank.js srcLine '+id,h);}
for(const set of M.sets)name(set.title,'memorize.js 묶음 제목 '+set.id,set.subject==='한국사');
// 단원 목록(core-units.js) · 한능검 주제 표(hanneung-topics.js)는 id뿐이다 — 글이 들어오면 여기서 걸린다.
{const before=fields;walk(require('./core-units.js'),'core-units.js',false);const ht=require('./hanneung-topics.js');walk(ht,'hanneung-topics.js',true);titles+=fields-before;fields=before;}
// 브라우저가 실제로 읽는 색인(content-index.js — build-chunks.cjs가 원본에서 만든다)의 같은 칸
{const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'content-index.js'),'utf8'),ctx);const I=ctx.CONTENT_INDEX;assert.ok(I&&I.catalog&&I.english&&I.memo,'색인을 읽었다');
 nameCatalog(I.catalog,'content-index.js');nameAreas(I.english.areas,'content-index.js');for(const m of I.memo)name(m.title,'content-index.js 외울 것 '+m.id,m.subject==='한국사');
 for(const s of I.subjects)name(s,'content-index.js 과목',false);for(const t of I.topics)name(t,'content-index.js 범위 열쇠',false);
 if(!left('sections'))for(const s of I.catalog.sections)name(s,'content-index.js sections',true);}

// ── 화면 글(2026-10-09): 배포되는 스크립트의 문자열 · 템플릿 · 정규식. 주석은 보지 않는다.
// 스크립트 글에서 주석만 빈칸으로 바꾼다(문자열 · 템플릿 · 정규식 안의 // 와 /* 는 주석이 아니다). 줄 수와 글자 수는 그대로다.
function stripComments(src){
 let out='',i=0;const n=src.length;let last='',word='';
 const REGEX_AFTER='(,=:[!&|?{};+-*%<>~^',REGEX_WORDS=new Set(['return','typeof','case','in','of','delete','void','throw','new','do','else','yield','await']);
 const put=s=>{out+=s;},blank=s=>s.replace(/[^\n]/g,' ');
 function code(inTemplate){
  let depth=0;
  while(i<n){
   const c=src[i],d=src[i+1];
   if(c==='/'&&d==='/'){let j=src.indexOf('\n',i);if(j<0)j=n;put(blank(src.slice(i,j)));i=j;continue;}
   if(c==='/'&&d==='*'){let j=src.indexOf('*/',i+2);j=j<0?n:j+2;put(blank(src.slice(i,j)));i=j;continue;}
   if(c==="'"||c==='"'){let j=i+1;while(j<n&&src[j]!==c&&src[j]!=='\n'){if(src[j]==='\\')j++;j++;}put(src.slice(i,j+1));i=j+1;last='x';word='';continue;}
   if(c==='`'){put(c);i++;while(i<n&&src[i]!=='`'){if(src[i]==='\\'){put(src.slice(i,i+2));i+=2;continue;}if(src[i]==='$'&&src[i+1]==='{'){put('${');i+=2;code(true);continue;}put(src[i]);i++;}put('`');i++;last='x';word='';continue;}
   if(c==='/'){const isRegex=word?REGEX_WORDS.has(word):(last===''||REGEX_AFTER.includes(last));
    if(isRegex){let j=i+1,cls=false;while(j<n&&src[j]!=='\n'){if(src[j]==='\\'){j+=2;continue;}if(src[j]==='[')cls=true;else if(src[j]===']')cls=false;else if(src[j]==='/'&&!cls)break;j++;}j++;while(j<n&&/[a-z]/.test(src[j]))j++;put(src.slice(i,j));i=j;last='x';word='';continue;}
    put(c);i++;last=c;word='';continue;}
   if(c==='{')depth++;
   if(c==='}'){if(inTemplate&&depth===0){put(c);i++;return;}depth--;}
   put(c);i++;
   if(/[A-Za-z0-9_$]/.test(c)){word=/[A-Za-z0-9_$]/.test(src[i-2]||'')?word+c:c;last=c;}
   else if(!/\s/.test(c)){last=c;word='';}
  }
 }
 code(false);return out;
}
const stripHtml=s=>s.replace(/<!--[\s\S]*?-->/g,m=>m.replace(/[^\n]/g,' '));
const stripCss=s=>s.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' '));
// 파일 하나: 주석을 지우고, ALLOW.code의 조각(횟수까지 맞아야 한다)을 지운 뒤 가운뎃점이 남은 줄을 돌려준다.
function codeFails(file,text,allow=ALLOW.code){
 let s=/\.html$/.test(file)?stripHtml(text):/\.css$/.test(file)?stripCss(text):/\.js$/.test(file)?stripComments(text):text;const out=[];
 if(file==='topics.js'&&left('sections'))s=s.replace(/sections:\[[^\]]*\]/g,m=>m.replace(/[^\n]/g,' '));
 for(const [f,piece,count] of allow){if(f!==file)continue;const have=s.split(piece).length-1;if(have!==count)out.push(file+': 예외 조각이 '+count+'번이어야 하는데 '+have+'번이다(고쳤으면 ALLOW.code에서 지운다) — '+piece);s=s.split(piece).join(' '.repeat(piece.length));}
 s.split('\n').forEach((line,i)=>{if(DOT.test(line)){const at=line.search(DOT);out.push(file+':'+(i+1)+': '+line.slice(Math.max(0,at-30),at+30).trim());}});
 return out;
}
// 대조군: 주석은 지나가고 문자열 · 템플릿 · 정규식 · HTML 글 · CSS content는 잡는다
{const J=x=>codeFails('x.js',x,[]).length;
 assert.equal(J("const a=1; // 지금 풀 차례 · 전체 문제\n/* 여러 줄 · 주석\n 둘째 줄 · */ const b=2;"),0,'주석 속 가운뎃점은 보지 않는다');
 assert.equal(J("el.textContent='20/20 · 더 풀기 69문제';"),1,'문자열 속 가운뎃점을 잡는다');
 assert.equal(J("el.textContent='20/20, 더 풀기 69문제';"),0,'고친 문자열은 지나간다');
 assert.equal(J('const u="http://a.b/c · d"; // 주석 · 뒤'),1,'문자열 속 //는 주석이 아니다');
 assert.equal(J("const t=`${a} · ${b.map(x=>`${x}`).join(', ')}`;"),1,'템플릿 속 가운뎃점을 잡는다');
 assert.equal(J("const t=`${a}, ${f({k:'v'})}`; // 끝 · 주석"),0,'템플릿 뒤의 주석은 보지 않는다');
 assert.equal(J("const parts=s.split(/ · /);"),1,'정규식 속 가운뎃점을 잡는다');
 assert.equal(J("const r=/[/]\\/\\//.test(x)?1:2; // 정규식 뒤 주석 · 가운뎃점"),0,'정규식 속 //는 주석이 아니고 그 뒤 주석은 지운다');
 assert.equal(J("const x=a/b/c; // 나눗셈 · 주석\nconst y=list.join(' · ');"),1,'나눗셈을 정규식으로 잘못 읽지 않는다(둘째 줄만 잡는다)');
 assert.equal(stripComments("a // b\nc").length,"a // b\nc".length,'주석을 지워도 글자 수 · 줄 수는 그대로');
 assert.equal(codeFails('x.html','<!-- 지금 풀 차례 · 전체 -->\n<span>지금 풀 차례, 전체 문제</span>',[]).length,0,'HTML 주석은 보지 않는다');
 assert.equal(codeFails('x.html','<span>지금 풀 차례 · 전체 문제</span>',[]).length,1,'HTML 글의 가운뎃점을 잡는다');
 assert.equal(codeFails('x.css',"/* 목록 · 점 */ li::before{content:'· ';}",[]).length,1,'CSS content의 가운뎃점을 잡는다(주석은 보지 않는다)');
 assert.equal(codeFails('x.js',"const a=w.join(' · ')!==hook;",[['x.js',"w.join(' · ')!==hook",1]]).length,0,'예외 조각은 지나간다');
 assert.equal(codeFails('x.js',"const a=w.join(' · ')!==hook,b=w.join(' · ')!==hook;",[['x.js',"w.join(' · ')!==hook",1]]).length,1,'예외 조각이 늘면 잡는다');
 assert.equal(codeFails('x.js',"const a=w.join(', ')!==hook;",[['x.js',"w.join(' · ')!==hook",1]]).length,1,'예외 조각을 고쳤는데 ALLOW에 남아 있으면 잡는다');
 assert.equal(codeFails('topics.js',"{id:'a',title:'고조선·여러 나라',sections:['고조선·여러 나라']}",[]).length,left('sections')?1:2,'topics.js는 sections만 빼고 본다(제목은 잡는다)');}
// 배포 목록: pages.yml의 Stage app이 _site로 옮기는 파일(폴더째 옮기는 chunks · gichul · assets · vendor는 내용물 — 조각은 위의 원본 검사가, 기출 원문과 남의 라이브러리는 대상이 아니다).
const yml=fs.readFileSync(path.join(__dirname,'.github/workflows/pages.yml'),'utf8');
const shipped=[...new Set(yml.split('\n').filter(l=>/^\s*cp (?!-r)/.test(l)).flatMap(l=>l.trim().split(/\s+/).slice(1,-1)))];
assert.ok(shipped.includes('app.js')&&shipped.includes('index.html')&&shipped.includes('hanneung.js')&&shipped.includes('gichul.js')&&shipped.length>=25,'배포 목록을 읽었다: '+shipped.length);
// 자료 파일은 위에서 칸으로 봤다(색인 · 파트는 열쇠와 예외 이름이 섞여 있어 글자째 훑지 않는다). 한능검 자료 · 조각 목록은 글자째 훑는다.
const DATA_FILES=['content-index.js','parts.js'];
const codeFiles=shipped.filter(f=>/\.(js|html|css|json)$/.test(f)&&!DATA_FILES.includes(f)&&!ALLOW.codeFiles.includes(f));
for(const f of [...DATA_FILES,...ALLOW.codeFiles])assert.ok(shipped.includes(f),'배포 목록에 있는 파일: '+f);
const codeBad=[];let codeChars=0;
for(const f of codeFiles){const text=fs.readFileSync(path.join(__dirname,f),'utf8').replace(/\r\n/g,'\n');codeChars+=text.length;codeBad.push(...codeFails(f,text));}
for(const [f] of ALLOW.code)assert.ok(codeFiles.includes(f),'예외 조각의 파일이 검사 대상이다: '+f);

assert.equal(fails.length,0,'가운뎃점이 든 글 '+fails.length+'곳:\n'+fails.slice(0,20).join('\n'));
assert.equal(titleFails.length,0,'가운뎃점이 든 이름 '+titleFails.length+'곳:\n'+titleFails.slice(0,30).join('\n'));
assert.equal(codeBad.length,0,'배포 스크립트 · 화면 글에 가운뎃점 '+codeBad.length+'곳:\n'+codeBad.slice(0,30).join('\n'));
for(const id of ALLOW.boxes)assert.ok(B.boxes[id],'예외 상자가 있다: '+id);
for(const id of ALLOW.memorizeSets)assert.ok(M.get(id),'예외 묶음이 있다: '+id);
console.log('PASS middle-dot: 기초 개념 상자 '+(Object.keys(B.boxes).length-ALLOW.boxes.length)+'개 · 대입 '+(Object.keys(B.apply).length-applySkipped)+'문제 · 외울 것 '+(M.sets.length-ALLOW.memorizeSets.length)+'묶음의 글 '+fields+'칸에 가운뎃점 없음(대입 '+applyFields+'칸 · 외울 것 '+memo+'칸 포함), 예외 이름으로 남긴 칸 '+kept
 +'; 이름 '+titles+'칸(파트 '+PARTS.units.reduce((n,u)=>n+u.parts.length,0)+' · 단원 '+PARTS.units.length+' · 주제 '+TOPICS.list.length+' · 요약 묶음 '+CATALOG.sets.length+' · 강 '+(CATALOG.lectures||[]).length+' · 공식 영역 · 외울 것 제목 · 색인)에 없음, 예외 이름 '+titleKept
 +'; 배포 스크립트 · 화면 글 '+codeFiles.length+'개 파일 '+codeChars+'자에 없음(그대로 둔 조각 '+ALLOW.code.length+'가지 · 파일 '+ALLOW.codeFiles.length+'); 대조군 5 + 이름 1 + 화면 글 17종. 그대로 둔 이름 칸: '+ALLOW.left.join(', ')+'. 아직 검사 밖: '+PENDING.join(' / '));
