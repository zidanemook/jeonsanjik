// 가운뎃점 금지(2026-10-08 사용자: "· <== 글자사용 금지한다."). 자체 제작 글에 · (U+00B7) ‧ (U+2027) ・ (U+30FB) ㆍ (U+318D)가 다시 들어오면 실패한다.
// 지금 검사하는 곳: 기초 개념 상자(basics.js boxes) 전부 · 대입(basics.js apply) · 외울 것(memorize.js). 아직 고치지 않은 곳(파트 · 단원 이름, 화면 글, 해설 · 보기)은
// PENDING에 적어 두고 고칠 때마다 이 파일에서 한 줄씩 지운다 — 지우면 그 범위도 바로 검사된다.
// 예외는 아래 ALLOW 한 곳에만 둔다(사용자 답을 기다리는 것들 — 답이 오면 여기서 지운다).
'use strict';
const assert=require('node:assert/strict');
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
};
// 아직 고치지 않아 검사에서 빼 둔 범위(고치면 지운다)
const PENDING=['파트 · 단원 · 범위 이름(parts.js · core-units.js · topics.js)','화면 글(app.js · index.html)','해설 · 보기(practice-bank.js · core-review-pack.js · quiz-options.js · hanneung-explanations.js · study-review-catalog.js)'];
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
assert.equal(fails.length,0,'가운뎃점이 든 글 '+fails.length+'곳:\n'+fails.slice(0,20).join('\n'));
for(const id of ALLOW.boxes)assert.ok(B.boxes[id],'예외 상자가 있다: '+id);
for(const id of ALLOW.memorizeSets)assert.ok(M.get(id),'예외 묶음이 있다: '+id);
console.log('PASS middle-dot: 기초 개념 상자 '+(Object.keys(B.boxes).length-ALLOW.boxes.length)+'개 · 대입 '+(Object.keys(B.apply).length-applySkipped)+'문제 · 외울 것 '+(M.sets.length-ALLOW.memorizeSets.length)+'묶음의 글 '+fields+'칸에 가운뎃점 없음(대입 '+applyFields+'칸 · 외울 것 '+memo+'칸 포함), 예외 이름으로 남긴 칸 '+kept+', 대조군 5종. 아직 검사 밖: '+PENDING.join(' / '));
