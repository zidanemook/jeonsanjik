// v403 컴퓨터일반 기계 사진(app.js COMPUTER_PHOTOS, assets/computer)을 검사한다.
// 1) 앱이 가리키는 사진 파일이 모두 있고, 작은 webp(가로 480px 이하, 60KB 이하)다.
// 2) 파일마다 assets/computer/CREDITS.md 표에 한 줄이 있고, 라이선스는 퍼블릭 도메인, CC0, CC BY, CC BY-SA만이다(NC, ND 금지).
//    앱의 출처 줄(작성자, 라이선스)과 Commons 주소가 대장과 같다.
// 3) 사진은 이미 있는 줄에만 붙는다: 열쇠 '줄 id|첫 칸 글'(표)이나 '용어 id|낱말'(용어)이 com-cg01 상자에 그대로 있다.
// 4) 상자의 id와 차례는 바뀌지 않았다(앱이 펼침, 읽음 상태를 id로 저장하고 기기끼리 맞춘다): v402 때의 id 목록이 지금 목록 안에 같은 차례로 다 있다.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
const m=/const COMPUTER_PHOTOS=(\{[\s\S]*?\n\});/.exec(app);assert.ok(m,'app.js에 COMPUTER_PHOTOS가 있다');
const PHOTOS=vm.runInNewContext('('+m[1]+')');
const box=JSON.parse(fs.readFileSync(path.join(__dirname,'chunks/b-com-u1.json'),'utf8')).boxes['com-cg01'];assert.ok(box,'com-cg01 상자');
// ── 1) 파일
const dir=path.join(__dirname,'assets/computer'),used=new Map();
for(const [key,list] of Object.entries(PHOTOS)){assert.ok(Array.isArray(list)&&list.length>=1&&list.length<=3,'사진 1~3장: '+key);
 for(const x of list){assert.equal(x.length,4,'[파일, 설명, 출처, 페이지]: '+key);const [file,cap,credit,page]=x;
  assert.match(file,/^[a-z0-9-]+$/,'파일 이름 꼴: '+file);assert.ok(!used.has(file),'사진 하나는 한 곳에만: '+file);used.set(file,{key,cap,credit,page});
  const p=path.join(dir,file+'.webp');assert.ok(fs.existsSync(p),'사진 파일이 있다: '+file);const b=fs.readFileSync(p);
  assert.equal(b.slice(0,4).toString('latin1'),'RIFF');assert.equal(b.slice(8,12).toString('latin1'),'WEBP','webp 파일: '+file);
  assert.ok(b.length<=60000,'60KB 이하: '+file+' '+b.length);
  // VP8/VP8L/VP8X 머리에서 가로 크기를 읽는다.
  const kind=b.slice(12,16).toString('latin1');let w=0;
  if(kind==='VP8 ')w=b.readUInt16LE(26)&0x3fff;else if(kind==='VP8L')w=1+((b[21]|(b[22]<<8))&0x3fff);else if(kind==='VP8X')w=1+(b[24]|(b[25]<<8)|(b[26]<<16));
  assert.ok(w>0&&w<=480,'가로 480px 이하: '+file+' '+w);
  assert.match(cap,/^[^:]+: \S/,'설명은 "이름: 한 줄" 꼴: '+cap);assert.ok(cap.length<=70&&!cap.includes('\n'),'설명은 짧은 한 줄: '+cap);
  assert.match(page,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/,'Commons 파일 페이지: '+page);}}
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.webp')))assert.ok(used.has(f.slice(0,-5)),'쓰지 않는 사진 파일이 없다: '+f);
assert.ok(used.size>=20,'사진 수: '+used.size);
// ── 2) 출처 대장
const ALLOWED=/^(퍼블릭 도메인|CC0|CC BY \d\.\d|CC BY-SA \d\.\d(?: [a-z]{2})?)$/;
const credits=fs.readFileSync(path.join(dir,'CREDITS.md'),'utf8'),rows=new Map();
for(const line of credits.split('\n')){const c=line.split('|').map(s=>s.trim());if(c.length===8&&/\.webp$/.test(c[1]))rows.set(c[1].slice(0,-5),{subject:c[2],place:c[3],author:c[4],license:c[5],page:c[6]});}
for(const [file,u] of used){const r=rows.get(file);assert.ok(r,'CREDITS.md에 줄이 있다: '+file);
 assert.match(r.license,ALLOWED,'허용한 라이선스만: '+file+' '+r.license);assert.ok(!/NC|ND|fair use/i.test(r.license),'비영리, 변경 금지 아님: '+file);
 assert.equal(r.page,u.page,'대장과 앱의 Commons 주소가 같다: '+file);
 assert.ok(u.credit.endsWith(', '+r.license),'앱 출처 줄의 라이선스가 대장과 같다: '+file+' / '+u.credit);
 const id=u.key.split('|')[0];assert.ok(r.place.split(/[ ()]/).includes(id),'대장의 붙은 곳에 줄 id: '+file+' '+id);}
assert.equal(rows.size,used.size,'대장의 줄 수 = 앱의 사진 수');
// ── 3) 이미 있는 줄에만
const fronts=new Map();
for(const t of box.terms)fronts.set(t.id+'|'+t.word,'term');
for(const t of box.tables||[])t.rows.forEach((row,i)=>{if(t.rowIds?.[i])fronts.set(t.rowIds[i]+'|'+String(row[0]).split('\n')[0].replace(/\*\*/g,''),'row');});
for(const key of Object.keys(PHOTOS))assert.ok(fronts.has(key),'사진이 붙을 줄이 상자에 그대로 있다(id와 첫 칸 글): '+key);
// 사진 설명에 가운뎃점 없음(middle-dot.test가 배포 파일 전체를 보지만 여기서도 바로 알린다).
for(const u of used.values())assert.ok(!/[\u00B7\u2027\u30FB\u318D]/.test(u.cap+u.credit),'가운뎃점 없음: '+u.cap);
// ── 4) 상자 id, 차례(v402 기준). 새 줄은 더해도 되지만 있던 id는 빠지거나 자리가 바뀌면 안 된다.
const FROZEN={terms:'t1 t2 t3 nat1 nat2 nat3 nat4 nat5 nat6 nat7 nat8 nat9 nat10 nat11 nat12 nat13 nbt1 nbt2 nbt3 nbt4 nbt5 nbt6 nbt7 nbt8 nbt9 nct1 nct2 nct3 nct4 nct5 nct6 nct7 nct8 nct9 ndt1 ndt2 ndt3 ndt4 ndt5 ndt6 ndt7 ndt8 nqt1',
 tables:'a b c naa nab nac nad nadp2 nba nbb nbc nbcp2 nbd nbe nca ncb ncc ncd nce ncf nda ndap2 ndb ndc ndd nde ndf ndg ndh ndi nqa',
 rules:'r1 nbr1 nbr2 nbr3 nbr3b nbr4 nar1 nar4 nar5 nar2 nar3 nar6 nar6b ndr2 ncr1 ncr2 ncr3 r2 ncr4 ncr5 ncr6 ndr1',
 examples:'x1 x2 x3 x4 nax1 nbx1 nbx2 nbx3 ncx1 ncx2 ncx3 ncx4 ncx5 ndx1 nqx1 nqx3 nqx2'};
const FROZEN_ROWS={a:'a1 a2 a3',b:'b1 b2 b3 b4',c:'c1 c2 c3',naa:'naa1 naa2 naa3 naa4',nab:'nab1 nab2 nab3',nac:'nac1 nac2',nad:'nad1 nad2 nad3 nad4 nad5 nad6 nad7',nadp2:'nad8',
 nba:'nba1 nba2 nba3 nba4',nbb:'nbb1 nbb2 nbb3 nbb4',nbc:'nbc1 nbc2 nbc3',nbcp2:'nbc4',nbd:'nbd1 nbd2 nbd3 nbd4',nbe:'nbe1 nbe2 nbe3 nbe4',nca:'nca1 nca2 nca3 nca4 nca5 nca6 nca7 nca8 nca9',
 ncb:'ncb1 ncb2 ncb3 ncb4',ncc:'ncc1 ncc2 ncc3 ncc4 ncc5',ncd:'ncd1 ncd2 ncd3',nce:'nce1 nce2 nce3 nce4 nce5',ncf:'ncf1 ncf2',nda:'nda1 nda2 nda4 nda5 nda6 nda7 nda8 nda9',ndap2:'nda3',
 ndb:'ndb1 ndb2 ndb3 ndb4 ndb5',ndc:'ndc1 ndc2 ndc3',ndd:'ndd1 ndd2 ndd3 ndd4',nde:'nde1 nde2 nde3',ndf:'ndf1 ndf2 ndf3',ndg:'ndg1 ndg2 ndg3 ndg4 ndg5',ndh:'ndh1 ndh2 ndh3 ndh4 ndh5 ndh6',ndi:'ndi1 ndi2 ndi3 ndi4',nqa:'nqa1 nqa2 nqa3 nqa4'};
const inOrder=(frozen,now)=>{let i=0;for(const id of now)if(id===frozen[i])i++;return i===frozen.length;};
const now={terms:box.terms.map(t=>t.id),tables:box.tables.map(t=>t.id),rules:box.rules.items.map(r=>r.id),examples:box.examples.map(x=>x.id)};
for(const k of Object.keys(FROZEN))assert.ok(inOrder(FROZEN[k].split(' '),now[k]),'com-cg01 '+k+' id와 차례가 그대로다');
for(const t of box.tables)if(FROZEN_ROWS[t.id])assert.ok(inOrder(FROZEN_ROWS[t.id].split(' '),t.rowIds||[]),'com-cg01 표 '+t.id+' 줄 id와 차례가 그대로다');
// 대조군: 차례 검사는 바뀐 차례와 빠진 id를 잡는다.
assert.ok(!inOrder(['a','b'],['b','a'])&&!inOrder(['a','b'],['a'])&&inOrder(['a','b'],['a','x','b']),'차례 검사 대조군');
assert.ok(!ALLOWED.test('CC BY-NC-SA 4.0')&&!ALLOWED.test('CC BY-ND 2.0')&&ALLOWED.test('CC BY-SA 2.0 de'),'라이선스 검사 대조군');
console.log('PASS computer photos: '+used.size+' photos on '+Object.keys(PHOTOS).length+' existing lines, credits and licenses checked, com-cg01 ids and order unchanged');
