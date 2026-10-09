// 가운뎃점 금지(2026-10-09 사용자: "이 기호 전부 강제 삭제한다. 모두 예외없이 다른기호로 대체한다").
// 1) 배포하는 파일 전부(pages.yml의 Stage app 목록 + chunks, gichul, assets의 글 파일)에 U+00B7, U+2027, U+30FB, U+318D가 한 글자도 없다. 예외 없음(주석 포함).
// 2) 구분되는 내용은 ' / '로 가른다(사용자: "구분되는 내용은 확실하게 슬래시 또는 표로 만들어서 분리할것"). 기계로 잡을 수 있는 부분:
//    기초 개념 상자, 대입, 외울 것의 한 줄(줄 바꿈으로 나눈 것)을 ' / '와 문장 끝으로 나눈 토막 하나에
//    화살표(→)가 둘 이상이면서 쉼표가 있거나(사슬 A → B → C는 쉼표가 없다), ' = '가 둘 이상이면 실패.
// 이 파일 자체에도 그 글자를 쓰지 않는다(아래는 모두 \u 꼴).
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const CODES=[0xB7,0x2027,0x30FB,0x318D];const DOT=new RegExp('['+CODES.map(c=>String.fromCharCode(c)).join('')+']');
// ── 1) 배포 파일
const yml=fs.readFileSync(path.join(__dirname,'.github/workflows/pages.yml'),'utf8');
const staged=new Set();
for(const m of yml.matchAll(/^\s*cp (-r )?(.+?) _site\/\s*$/gm))for(const f of m[2].trim().split(/\s+/))staged.add(f);
assert.ok(staged.has('app.js')&&staged.has('chunks')&&staged.has('gichul')&&staged.size>=30,'pages.yml의 Stage app 목록을 읽었다: '+staged.size);
const TEXT=/\.(js|json|html|css|svg|txt|md|webmanifest)$/;
const files=[];const walk=p=>{const st=fs.statSync(p);if(st.isDirectory()){for(const f of fs.readdirSync(p))walk(path.join(p,f));}else if(TEXT.test(p))files.push(p);};
for(const f of staged){const p=path.join(__dirname,f);assert.ok(fs.existsSync(p),'배포 목록의 파일이 있다: '+f);walk(p);}
// 배포 묶음에는 없지만 내용의 원본인 파일(조각은 여기서 만들어진다), 검사 파일도 같이 본다.
for(const f of fs.readdirSync(__dirname))if(/\.(js|cjs|json)$/.test(f)&&!files.includes(path.join(__dirname,f)))files.push(path.join(__dirname,f));
const hits=[];let chars=0;
for(const p of files){const s=fs.readFileSync(p,'utf8');chars+=s.length;const m=DOT.exec(s);if(m)hits.push(path.relative(__dirname,p)+': '+JSON.stringify(s.slice(Math.max(0,m.index-25),m.index+25)));}
assert.equal(hits.length,0,'가운뎃점이 든 파일 '+hits.length+'개:\n'+hits.slice(0,20).join('\n'));
// 대조군: 네 글자를 모두 잡는다
for(const c of CODES.map(c=>String.fromCharCode(c)))assert.ok(DOT.test('가'+c+'나'),'잡는다: U+'+c.codePointAt(0).toString(16));
assert.ok(!DOT.test('3.1 운동, 한일 협정, 가 / 나, A, B'),'바꾼 글은 지나간다');
// ── 2) 묶음 사이는 ' / '
// 토막: 줄 → ' / ' → 문장 끝(. ? ! 뒤 공백) → ' — ' → 쌍점 머리('이름: ')로 나눈 것. 괄호, 따옴표 안은 따로 본다.
const INNER=/\(([^()]*)\)|\[([^\[\]]*)\]|‘([^‘’]*)’|“([^“”]*)”/;
function segments(line){const out=[];let t=line;for(let g=0;g<200;g++){const m=INNER.exec(t);if(!m)break;out.push(m.slice(1).find(x=>x!==undefined));t=t.slice(0,m.index)+'□'+t.slice(m.index+m[0].length);}
 out.push(t);return out.flatMap(s=>s.split(/ \/ |(?<=[.?!])\s+| — |;\s/));}
// 쉼표로 나눈 마디 가운데 화살표가 든 마디가 둘 이상이거나 ' = ' 등식이 든 마디가 둘 이상이면 짝 둘이 쉼표로 붙은 것이다.
// (단서, 단서 → 판단 → 답 같은 한 줄기 추론은 화살표 마디가 하나뿐이라 지나간다. 가운데 마디에 나열이 든 사슬은 middle-dot-allow.json에 적힌 줄만.)
function badSegment(seg){const cl=seg.split(', ');
 if(cl.filter(c=>/ = /.test(c)).length>=2)return '등식 둘이 쉼표로 붙음';
 if(cl.filter(c=>/→/.test(c)).length>=2)return '화살표 짝 둘이 쉼표로 붙음';
 return '';}
const check=text=>String(text).split('\n').flatMap(segments).map(badSegment).find(Boolean)||'';
// 대조군
assert.ok(check('참새, 까치, 비둘기 → 새, 빛깔, 향, 맛 → 시각, 후각, 미각'),'짝 둘이 쉼표로 붙으면 잡는다');
assert.ok(!check('참새, 까치, 비둘기 → 새 / 빛깔, 향, 맛 → 시각, 후각, 미각'),"' / '로 가르면 지나간다");
assert.ok(!check('경학사 → 부민단 → 한족회')&&!check('단군왕검, 환웅, 웅녀 → 고조선 → 전국 7웅의 연과 맞섬 → ⑤')&&!check('신라 = 조선술, 축제술 → 한인의 연못'),'한 줄기 사슬, 단서 나열 뒤의 화살표는 지나간다');
assert.ok(check('권업회 = 연해주, 서전서숙 = 북간도'),'등식 둘이 쉼표로 붙으면 잡는다');
assert.ok(!check('권업회 = 연해주 / 서전서숙 = 북간도')&&!check('권업회 = 연해주\n서전서숙 = 북간도')&&!check('단서 = 뜻 → 정답'),'가른 등식, 등식 하나와 화살표 하나는 지나간다');
const B=require('./basics.js'),M=require('./memorize.js');
const ALLOW_LINES=new Set(require('./middle-dot-allow.json'));
const bad=[];let lines=0;
const scan=(o,where)=>{if(typeof o==='string'){lines++;const why=check(o);if(why&&!ALLOW_LINES.has(o))bad.push(where+' — '+why+': '+o.slice(0,90).replace(/\n/g,' ⏎ '));return;}
 if(Array.isArray(o)){o.forEach((x,i)=>scan(x,where+'['+i+']'));return;}
 if(o&&typeof o==='object')for(const k of Object.keys(o))if(k!=='id'&&k!=='rowIds'&&k!=='use'&&k!=='box'&&k!=='mnemonics')scan(o[k],where+'.'+k);};
for(const [id,b] of Object.entries(B.boxes))scan(b,id);
for(const [id,a] of Object.entries(B.apply))scan(a.blocks,'대입 '+id);
for(const set of M.sets)scan(set,'외울 것 '+set.id);
assert.equal(bad.length,0,"묶음이 ' / ' 없이 붙은 줄 "+bad.length+'곳:\n'+bad.slice(0,20).join('\n'));
console.log('PASS middle-dot: 배포, 원본, 검사 파일 '+files.length+'개('+Math.round(chars/1e6)+'MB)에 가운뎃점 0(예외 없음), 상자, 대입, 외울 것 '+lines+"칸에서 묶음 사이는 ' / '(화살표 짝이나 등식 둘이 쉼표로 붙은 줄 0, 가운데 마디에 나열이 든 사슬로 적어 둔 줄 "+ALLOW_LINES.size+'줄), 대조군 10종');
