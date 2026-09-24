const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const practice=require('./practice.js'),bank=require('./practice-bank.js'),ctx={};vm.createContext(ctx);
for(const f of ['core-review-pack.js','quiz-options.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
// 문제 하나 = 항목 하나(v57). 예전에는 카드마다 변형 2개 이상을 요구하고 다시 풀면 다른 문장이 나오는지 검사했다(한 카드가 여러 문제를 돌려 냄).
// 이제는 각 항목이 문제 하나다: 연습 문장 1개이거나, 문장 없이 그 규칙의 4지선다(quiz-options.js) 하나만 가진다.
for(const [id,lesson]of Object.entries(bank)){
 assert.ok(lesson.rule&&lesson.hook&&lesson.examples.length&&lesson.ruleId&&lesson.topic,id);
 assert.equal(lesson.variants.length+(ctx.QUIZ_OPTIONS[id]?1:0),1,'one question per practice entry: '+id);
 for(const e of lesson.variants){assert.ok(e.question&&e.explanation);if(e.type==='text'){assert.ok(e.answers.length);for(const a of e.answers){assert.ok(practice.grade(e,'  '+a.toUpperCase()+' .  '));}assert.equal(practice.grade(e,'incorrect answer'),false);}else{assert.equal(e.type,'choice');assert.equal(e.choices.length,4);assert.ok(e.choices[e.correctIndex]);}}
 const c=ctx.CORE_REVIEW_PACK.find(c=>c.id===id)||{id,question:'',explanation:''};
 const first=practice.select(c,[],bank,ctx.QUIZ_OPTIONS),second=practice.select(c,[{cardId:id}],bank,ctx.QUIZ_OPTIONS);
 // 다시 풀면 같은 문제가 다시 나온다. 다른 문장으로 바뀌지 않고, 객관식은 정답 번호만 직전과 다른 자리로 옮긴다.
 assert.equal(first.variantCount,1);assert.equal(first.exerciseId,second.exerciseId);assert.equal(first.question,second.question);
 if(first.type==='choice'){assert.notEqual(first.correctIndex,second.correctIndex);assert.equal(first.choices[first.correctIndex],second.choices[second.correctIndex]);}
 // 나뉜 문제는 원래 규칙의 정리를 그대로 들고 있어 해설 화면이 규칙을 가르친다.
 if(bank[lesson.ruleId]&&lesson.ruleId!==id)for(const k of ['title','rule','hook','examples','topic'])assert.deepEqual(lesson[k],bank[lesson.ruleId][k],id+' '+k);
}
// 영어 범위별 문제 수: 문제집 Day 1·Day 2는 각각 준비된 60문제(4지선다 40 · 직접 쓰기 20), Day 3은 178문제(4지선다 116 · 직접 쓰기 62), Day 4는 152문제(4지선다 102 · 직접 쓰기 50), Day 5는 196문제(4지선다 130 · 직접 쓰기 66), Day 6은 220문제(4지선다 137 · 직접 쓰기 83), Day 7은 240문제(4지선다 150 · 직접 쓰기 90), 문법 공식 훈련은 364문제(4지선다 238 · 직접 쓰기 126), 수일치 95문제, 그 밖의 문법 60문제이고 모두 한 문제씩이다.
{const count=(topic,type)=>Object.entries(bank).filter(([id,l])=>l.topic===topic&&(!type||(l.variants[0]?.type||'choice')===type)).length;
 assert.equal(count('Day 1'),60);assert.equal(count('Day 1','choice'),40);assert.equal(count('Day 1','text'),20);assert.equal(count('수일치'),95);assert.equal(count('영문법'),60);
 assert.equal(count('Day 2'),60);assert.equal(count('Day 2','choice'),40);assert.equal(count('Day 2','text'),20);
 assert.equal(count('Day 3'),178);assert.equal(count('Day 3','choice'),116);assert.equal(count('Day 3','text'),62);
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='Day 3').sort(),Array.from({length:178},(_,i)=>'en-day3-'+String(i+1).padStart(3,'0')),'Day 3는 en-day3-001~178');
 assert.equal(count('Day 4'),152);assert.equal(count('Day 4','choice'),102);assert.equal(count('Day 4','text'),50);
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='Day 4').sort(),Array.from({length:152},(_,i)=>'en-day4-'+String(i+1).padStart(3,'0')),'Day 4는 en-day4-001~152');
 assert.equal(count('Day 5'),196);assert.equal(count('Day 5','choice'),130);assert.equal(count('Day 5','text'),66);
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='Day 5').sort(),Array.from({length:196},(_,i)=>'en-day5-'+String(i+1).padStart(3,'0')),'Day 5는 en-day5-001~196');
 // Day 6·7은 자체 제작만 싣는다(교재 문장 151~230은 앱에 넣지 않는다 — Day 5 방침).
 for(const [day,n,nc,nt] of [[6,220,137,83],[7,240,150,90]]){const t='Day '+day;assert.equal(count(t),n);assert.equal(count(t,'choice'),nc);assert.equal(count(t,'text'),nt);
  assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic===t).sort(),Array.from({length:n},(_,i)=>'en-day'+day+'-'+String(i+1).padStart(3,'0')),t+'는 en-day'+day+'-001~'+n);}
 assert.equal(Object.keys(bank).filter(id=>/^en-day[67]-b/.test(id)).length,0,'교재 문장 문제 없음');
 assert.equal(count('문법 공식 훈련'),364);assert.equal(count('문법 공식 훈련','choice'),238);assert.equal(count('문법 공식 훈련','text'),126);
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='문법 공식 훈련').sort(),Array.from({length:364},(_,i)=>'en-formula-'+String(i+1).padStart(3,'0')),'문법 공식 훈련은 en-formula-001~364');
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='Day 2').sort(),Array.from({length:60},(_,i)=>'en-day2-'+String(i+1).padStart(2,'0')),'Day 2는 en-day2-01~60');
 assert.equal(Object.keys(bank).filter(id=>id.startsWith('grammar-verb-')).length,0,'Day 1 규칙 묶음 카드는 없어졌다');
 assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='Day 1').map(l=>l.point)).size,24);
 assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='Day 2').map(l=>l.point)).size,30);assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='Day 2').map(l=>l.ruleId)).size,11);
 {const d1=new Set(Object.values(bank).filter(l=>l.topic==='Day 1').map(l=>l.point));assert.ok(Object.values(bank).filter(l=>l.topic==='Day 2').every(l=>!d1.has(l.point)),'Day 2 문법 포인트는 Day 1 포인트와 이름이 겹치지 않는다');}
 assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='Day 3').map(l=>l.point)).size,28);assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='Day 3').map(l=>l.ruleId)).size,6);
 {const d12=new Set(Object.values(bank).filter(l=>l.topic==='Day 1'||l.topic==='Day 2').map(l=>l.point));assert.ok(Object.values(bank).filter(l=>l.topic==='Day 3').every(l=>!d12.has(l.point)),'Day 3 문법 포인트는 Day 1·Day 2 포인트와 이름이 겹치지 않는다');}
 assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='Day 4').map(l=>l.point)).size,23);assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='Day 4').map(l=>l.ruleId)).size,6);
 {const d123=new Set(Object.values(bank).filter(l=>['Day 1','Day 2','Day 3'].includes(l.topic)).map(l=>l.point));assert.ok(Object.values(bank).filter(l=>l.topic==='Day 4').every(l=>!d123.has(l.point)),'Day 4 문법 포인트는 Day 1~3 포인트와 이름이 겹치지 않는다');}
 assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='Day 5').map(l=>l.point)).size,29);assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='Day 5').map(l=>l.ruleId)).size,10);
 {const d1234=new Set(Object.values(bank).filter(l=>['Day 1','Day 2','Day 3','Day 4'].includes(l.topic)).map(l=>l.point));assert.ok(Object.values(bank).filter(l=>l.topic==='Day 5').every(l=>!d1234.has(l.point)),'Day 5 문법 포인트는 Day 1~4 포인트와 이름이 겹치지 않는다');}
 assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='Day 6').map(l=>l.point)).size,27);assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='Day 6').map(l=>l.ruleId)).size,10);
 assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='Day 7').map(l=>l.point)).size,30);assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='Day 7').map(l=>l.ruleId)).size,7);
 {const before=new Set(Object.values(bank).filter(l=>['Day 1','Day 2','Day 3','Day 4','Day 5'].includes(l.topic)).map(l=>l.point)),d6=new Set(Object.values(bank).filter(l=>l.topic==='Day 6').map(l=>l.point));
  assert.ok([...d6].every(p=>!before.has(p)),'Day 6 문법 포인트는 Day 1~5 포인트와 이름이 겹치지 않는다');assert.ok(Object.values(bank).filter(l=>l.topic==='Day 7').every(l=>!before.has(l.point)&&!d6.has(l.point)),'Day 7 문법 포인트는 Day 1~6 포인트와 이름이 겹치지 않는다');}
 // Day 6·7(v151): 해설 끝은 그 포인트의 외우는 공식 4줄(공식 **색칠** · ✗ · 예), 기억 연결·꿀팁 없음. 포인트마다 자체 제작 8문제 이상.
 for(const t of ['Day 6','Day 7']){const rows=Object.entries(bank).filter(([,l])=>l.topic===t),per=new Map(),blocks=new Map();
  for(const [id,l] of rows){const v=l.variants[0],paras=v.explanation.split('\n\n'),last=paras[paras.length-1],ls=last.split('\n');
   assert.ok(ls[0]==='외우는 공식'&&ls.length>=4&&ls.length<=5&&ls.some(x=>x.startsWith('✗ '))&&ls[ls.length-1].startsWith('예) ')&&last.includes('**')&&!/꿀팁|입으로 외우기|함정:|기억 연결:/.test(v.explanation),'외우는 공식 4줄: '+id);
   if(!blocks.has(l.point))blocks.set(l.point,last);assert.equal(blocks.get(l.point),last,'같은 포인트는 같은 공식: '+id);assert.ok(!/카드|문항|변형/.test(v.question+v.explanation),'내부 용어 없음: '+id);
   assert.ok(!v.sentence,'교재 문장 고침 상자 없음: '+id);per.set(l.point,(per.get(l.point)||0)+1);}
  assert.ok([...per.values()].every(n=>n>=8)&&per.size===blocks.size,t+' 포인트마다 자체 제작 8문제 이상');}
 // 문법 공식 훈련(v98): Day 1~4 문제는 모두 공식(formula) 하나에 속하고, 해설의 마지막 문단은 그 공식의 외우기 블록이다(기억 연결 문단은 남지 않는다).
 {const F=globalThis.ENGLISH_FORMULAS,days=Object.entries(bank).filter(([id])=>/^en-day[1-4]-/.test(id)),drill=Object.entries(bank).filter(([id])=>id.startsWith('en-formula-'));
  const ruleIds=F.areas.flatMap(a=>a.rules.map(r=>r.id));assert.equal(F.areas.length,11);assert.equal(ruleIds.length,89);assert.equal(new Set(ruleIds).size,89);
  assert.equal(days.length,450);assert.ok(days.every(([,l])=>ruleIds.includes(l.formula)),'모든 Day 문제가 공식에 속한다');
  assert.ok(drill.every(([,l])=>ruleIds.includes(l.formula)&&l.point===F.title(l.formula)&&l.title===F.title(l.formula)&&l.ruleId.startsWith('grammar-formula-')),'새 문제의 point·title은 공식 이름');
  const blockOf=id=>bank['en-formula-001'].variants[0].explanation;
  for(const [id,l] of [...days,...drill]){const text=l.variants[0].explanation,paras=text.split('\n\n'),last=paras[paras.length-1];const lines=last.split('\n');assert.ok(lines[0]==='외우는 공식'&&lines.length>=4&&lines.length<=5&&lines.some(x=>x.startsWith('✗ '))&&lines[lines.length-1].startsWith('예) ')&&last.includes('**')&&!/꿀팁|입으로 외우기|함정:/.test(last),'외우기 블록(v119: 공식·✗·예 4~5줄, 핵심 색칠): '+id);assert.ok(!text.includes('기억 연결:'),'기억 연결 문단이 남지 않는다: '+id);assert.ok(!/[①②③④]/.test(last),'블록에 원문자 없음: '+id);}
  const sameRule=[...days,...drill].filter(([,l])=>l.formula==='so-such').map(([,l])=>l.variants[0].explanation.split('\n\n').pop());assert.ok(sameRule.length>=10&&new Set(sameRule).size===1,'같은 공식은 같은 블록');
  {const marked=Object.entries(bank).filter(([,l])=>l.variants[0]?.type==='choice'&&l.variants[0].marks);assert.ok(marked.length>=660);
   for(const [id,l] of marked){const v=l.variants[0];assert.ok(Array.isArray(v.fixes)&&v.fixes.length===v.choices.length,'보기별 올바른 문장: '+id);
    v.choices.forEach((c,i)=>{const list=v.fixes[i],en=c.includes(' → ')?c.slice(c.indexOf(' → ')+3):c;assert.ok(Array.isArray(list)&&list.length>=1&&list.every(x=>typeof x==='string'&&x.trim()),'보기 '+(i+1)+' 문장 없음: '+id);
     if(!v.marks[i])assert.ok(list.includes(en),'옳은 보기는 원래 문장 포함: '+id+' '+(i+1));}); }}
  const per=new Map();for(const [,l] of [...days,...drill])per.set(l.formula,(per.get(l.formula)||0)+1);assert.ok(ruleIds.every(r=>per.get(r)>=8),'공식마다 8문제 이상: '+ruleIds.filter(r=>!(per.get(r)>=8)));
  assert.equal(bank['en-day2-34'].formula,'so-such');assert.equal(bank['en-day3-014'].formula,'so-such');assert.equal(bank['en-day1-43'].formula,'transitive-no-prep');}
 // 국어 사고의 힘 논리: 1장 31문제 · 2장 179문제 · 3장 181문제 · 4장 147문제 · 5장 128문제 · 6장 329문제, 모두 4지선다(직접 쓰기 없음)이고 과목은 국어다. id는 ko-logic1-01~31, ko-logic2-001~179, ko-logic3-001~181, ko-logic4-001~147, ko-logic5-001~128, ko-logic6-001~329.
 assert.equal(count('논리 1장'),31);assert.equal(count('논리 1장','choice'),31);assert.equal(count('논리 1장','text'),0);
 assert.equal(count('논리 2장'),179);assert.equal(count('논리 2장','choice'),179);assert.equal(count('논리 2장','text'),0);
 assert.equal(count('논리 3장'),181);assert.equal(count('논리 3장','choice'),181);assert.equal(count('논리 3장','text'),0);
 assert.equal(count('논리 4장'),147);assert.equal(count('논리 4장','choice'),147);assert.equal(count('논리 4장','text'),0);
 assert.equal(count('논리 5장'),128);assert.equal(count('논리 5장','choice'),128);assert.equal(count('논리 5장','text'),0);
 assert.equal(count('논리 6장'),329);assert.equal(count('논리 6장','choice'),329);assert.equal(count('논리 6장','text'),0);
 // 국어 사고의 힘 논리 제2편 독해 1장(독해의 원리): 444문제, 모두 4지선다, id는 ko-read1-001~444.
 assert.equal(count('독해 1장'),444);assert.equal(count('독해 1장','choice'),444);assert.equal(count('독해 1장','text'),0);
 // 제2편 독해 2장(독해와 논증) 122문제 · 3장(실전 독해 훈련) 354문제(자체 제작 354 · 교재 문장은 싣지 않음), 모두 4지선다.
 assert.equal(count('독해 2장'),122);assert.equal(count('독해 2장','choice'),122);assert.equal(count('독해 3장'),354);assert.equal(count('독해 3장','choice'),354);
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='논리 1장').sort(),Array.from({length:31},(_,i)=>'ko-logic1-'+String(i+1).padStart(2,'0')),'논리 1장은 ko-logic1-01~31');
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='논리 2장').sort(),Array.from({length:179},(_,i)=>'ko-logic2-'+String(i+1).padStart(3,'0')),'논리 2장은 ko-logic2-001~179');
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='논리 3장').sort(),Array.from({length:181},(_,i)=>'ko-logic3-'+String(i+1).padStart(3,'0')),'논리 3장은 ko-logic3-001~181');
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='논리 4장').sort(),Array.from({length:147},(_,i)=>'ko-logic4-'+String(i+1).padStart(3,'0')),'논리 4장은 ko-logic4-001~147');
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='논리 5장').sort(),Array.from({length:128},(_,i)=>'ko-logic5-'+String(i+1).padStart(3,'0')),'논리 5장은 ko-logic5-001~128');
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='논리 6장').sort(),Array.from({length:329},(_,i)=>'ko-logic6-'+String(i+1).padStart(3,'0')),'논리 6장은 ko-logic6-001~329');
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='독해 1장').sort(),Array.from({length:444},(_,i)=>'ko-read1-'+String(i+1).padStart(3,'0')),'독해 1장은 ko-read1-001~444');
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='독해 2장').sort(),["ko-read2-001","ko-read2-002","ko-read2-003","ko-read2-004","ko-read2-005","ko-read2-006","ko-read2-007","ko-read2-008","ko-read2-009","ko-read2-010","ko-read2-011","ko-read2-012","ko-read2-013","ko-read2-014","ko-read2-015","ko-read2-016","ko-read2-017","ko-read2-018","ko-read2-019","ko-read2-020","ko-read2-021","ko-read2-022","ko-read2-023","ko-read2-024","ko-read2-025","ko-read2-026","ko-read2-027","ko-read2-028","ko-read2-029","ko-read2-030","ko-read2-031","ko-read2-032","ko-read2-033","ko-read2-034","ko-read2-035","ko-read2-036","ko-read2-037","ko-read2-038","ko-read2-039","ko-read2-040","ko-read2-041","ko-read2-042","ko-read2-043","ko-read2-044","ko-read2-045","ko-read2-046","ko-read2-047","ko-read2-048","ko-read2-049","ko-read2-050","ko-read2-051","ko-read2-052","ko-read2-053","ko-read2-054","ko-read2-055","ko-read2-056","ko-read2-057","ko-read2-058","ko-read2-059","ko-read2-060","ko-read2-061","ko-read2-062","ko-read2-063","ko-read2-064","ko-read2-065","ko-read2-066","ko-read2-067","ko-read2-068","ko-read2-069","ko-read2-070","ko-read2-071","ko-read2-072","ko-read2-073","ko-read2-074","ko-read2-075","ko-read2-076","ko-read2-077","ko-read2-078","ko-read2-079","ko-read2-080","ko-read2-081","ko-read2-082","ko-read2-083","ko-read2-084","ko-read2-085","ko-read2-086","ko-read2-087","ko-read2-088","ko-read2-089","ko-read2-090","ko-read2-091","ko-read2-092","ko-read2-093","ko-read2-094","ko-read2-095","ko-read2-096","ko-read2-097","ko-read2-098","ko-read2-099","ko-read2-100","ko-read2-101","ko-read2-102","ko-read2-103","ko-read2-104","ko-read2-105","ko-read2-106","ko-read2-107","ko-read2-108","ko-read2-109","ko-read2-110","ko-read2-111","ko-read2-112","ko-read2-113","ko-read2-114","ko-read2-116","ko-read2-117","ko-read2-118","ko-read2-119","ko-read2-121","ko-read2-122","ko-read2-123","ko-read2-124"],'독해 2장은 ko-read2-001~124');
 assert.deepEqual(Object.keys(bank).filter(id=>bank[id].topic==='독해 3장').sort(),["ko-read3-001","ko-read3-002","ko-read3-003","ko-read3-004","ko-read3-005","ko-read3-006","ko-read3-007","ko-read3-008","ko-read3-009","ko-read3-010","ko-read3-011","ko-read3-012","ko-read3-013","ko-read3-014","ko-read3-015","ko-read3-016","ko-read3-017","ko-read3-018","ko-read3-019","ko-read3-020","ko-read3-021","ko-read3-022","ko-read3-023","ko-read3-024","ko-read3-025","ko-read3-026","ko-read3-027","ko-read3-028","ko-read3-029","ko-read3-030","ko-read3-031","ko-read3-032","ko-read3-033","ko-read3-034","ko-read3-035","ko-read3-036","ko-read3-037","ko-read3-038","ko-read3-039","ko-read3-040","ko-read3-041","ko-read3-042","ko-read3-043","ko-read3-044","ko-read3-045","ko-read3-046","ko-read3-047","ko-read3-048","ko-read3-049","ko-read3-050","ko-read3-051","ko-read3-052","ko-read3-053","ko-read3-054","ko-read3-055","ko-read3-056","ko-read3-057","ko-read3-058","ko-read3-059","ko-read3-060","ko-read3-061","ko-read3-062","ko-read3-063","ko-read3-064","ko-read3-065","ko-read3-066","ko-read3-067","ko-read3-068","ko-read3-069","ko-read3-070","ko-read3-071","ko-read3-072","ko-read3-073","ko-read3-074","ko-read3-075","ko-read3-076","ko-read3-077","ko-read3-078","ko-read3-079","ko-read3-080","ko-read3-081","ko-read3-082","ko-read3-083","ko-read3-084","ko-read3-085","ko-read3-086","ko-read3-087","ko-read3-088","ko-read3-089","ko-read3-090","ko-read3-091","ko-read3-092","ko-read3-093","ko-read3-094","ko-read3-095","ko-read3-096","ko-read3-097","ko-read3-098","ko-read3-099","ko-read3-100","ko-read3-101","ko-read3-102","ko-read3-103","ko-read3-104","ko-read3-105","ko-read3-106","ko-read3-107","ko-read3-108","ko-read3-109","ko-read3-110","ko-read3-111","ko-read3-112","ko-read3-113","ko-read3-114","ko-read3-115","ko-read3-116","ko-read3-117","ko-read3-118","ko-read3-119","ko-read3-120","ko-read3-121","ko-read3-122","ko-read3-123","ko-read3-124","ko-read3-125","ko-read3-126","ko-read3-127","ko-read3-128","ko-read3-129","ko-read3-130","ko-read3-131","ko-read3-132","ko-read3-133","ko-read3-134","ko-read3-135","ko-read3-136","ko-read3-137","ko-read3-138","ko-read3-139","ko-read3-140","ko-read3-141","ko-read3-142","ko-read3-143","ko-read3-144","ko-read3-145","ko-read3-146","ko-read3-147","ko-read3-148","ko-read3-149","ko-read3-150","ko-read3-151","ko-read3-152","ko-read3-153","ko-read3-154","ko-read3-155","ko-read3-156","ko-read3-157","ko-read3-158","ko-read3-159","ko-read3-160","ko-read3-161","ko-read3-162","ko-read3-163","ko-read3-164","ko-read3-165","ko-read3-166","ko-read3-167","ko-read3-168","ko-read3-169","ko-read3-170","ko-read3-171","ko-read3-172","ko-read3-173","ko-read3-174","ko-read3-175","ko-read3-176","ko-read3-177","ko-read3-178","ko-read3-179","ko-read3-180","ko-read3-181","ko-read3-182","ko-read3-183","ko-read3-184","ko-read3-185","ko-read3-186","ko-read3-187","ko-read3-188","ko-read3-189","ko-read3-190","ko-read3-191","ko-read3-192","ko-read3-193","ko-read3-194","ko-read3-195","ko-read3-196","ko-read3-197","ko-read3-198","ko-read3-199","ko-read3-200","ko-read3-201","ko-read3-202","ko-read3-203","ko-read3-204","ko-read3-205","ko-read3-206","ko-read3-207","ko-read3-208","ko-read3-209","ko-read3-210","ko-read3-211","ko-read3-212","ko-read3-213","ko-read3-214","ko-read3-215","ko-read3-216","ko-read3-217","ko-read3-218","ko-read3-219","ko-read3-220","ko-read3-221","ko-read3-222","ko-read3-223","ko-read3-224","ko-read3-225","ko-read3-226","ko-read3-227","ko-read3-228","ko-read3-229","ko-read3-230","ko-read3-231","ko-read3-232","ko-read3-233","ko-read3-234","ko-read3-235","ko-read3-236","ko-read3-237","ko-read3-238","ko-read3-239","ko-read3-240","ko-read3-241","ko-read3-242","ko-read3-243","ko-read3-244","ko-read3-245","ko-read3-246","ko-read3-247","ko-read3-248","ko-read3-249","ko-read3-250","ko-read3-251","ko-read3-252","ko-read3-253","ko-read3-254","ko-read3-255","ko-read3-256","ko-read3-257","ko-read3-258","ko-read3-259","ko-read3-260","ko-read3-261","ko-read3-262","ko-read3-263","ko-read3-264","ko-read3-265","ko-read3-266","ko-read3-267","ko-read3-268","ko-read3-269","ko-read3-270","ko-read3-271","ko-read3-272","ko-read3-273","ko-read3-274","ko-read3-275","ko-read3-276","ko-read3-277","ko-read3-278","ko-read3-279","ko-read3-280","ko-read3-281","ko-read3-282","ko-read3-283","ko-read3-284","ko-read3-285","ko-read3-286","ko-read3-287","ko-read3-288","ko-read3-289","ko-read3-290","ko-read3-291","ko-read3-292","ko-read3-293","ko-read3-294","ko-read3-295","ko-read3-296","ko-read3-297","ko-read3-298","ko-read3-299","ko-read3-300","ko-read3-301","ko-read3-302","ko-read3-303","ko-read3-304","ko-read3-305","ko-read3-306","ko-read3-307","ko-read3-308","ko-read3-309","ko-read3-310","ko-read3-311","ko-read3-312","ko-read3-313","ko-read3-314","ko-read3-315","ko-read3-316","ko-read3-317","ko-read3-318","ko-read3-319","ko-read3-320","ko-read3-321","ko-read3-322","ko-read3-323","ko-read3-324","ko-read3-325","ko-read3-326","ko-read3-327","ko-read3-328","ko-read3-329","ko-read3-330","ko-read3-331","ko-read3-332","ko-read3-333","ko-read3-334","ko-read3-335","ko-read3-336","ko-read3-337","ko-read3-338","ko-read3-339","ko-read3-340","ko-read3-341","ko-read3-342","ko-read3-343","ko-read3-344","ko-read3-345","ko-read3-346","ko-read3-347","ko-read3-348","ko-read3-349","ko-read3-350","ko-read3-351","ko-read3-352","ko-read3-353","ko-read3-354"].sort(),'독해 3장은 ko-read3-001~354');
 // 교재 문장은 싣지 않는다(--book=none): 교재 문제(ko-read3b-*)와 p.143 예제 제시문을 쓴 문제(ko-read2-115·120)가 없고, 교재 제시문에만 나오는 낱말도 없다.
 {const r=Object.entries(bank).filter(([id])=>id.startsWith('ko-read'));assert.ok(!r.some(([id])=>/^ko-read3b-/.test(id)),'교재 문제 없음');assert.ok(!('ko-read2-115' in bank)&&!('ko-read2-120' in bank),'예제 제시문 문제 없음');
  const text=r.map(([,l])=>JSON.stringify(l)).join('');for(const w of ['사피어','허무두','스톤헨지','방각본','마시멜로','로빈 후드','이육사','권력 거리','아이젠버거','기유조약'])assert.ok(!text.includes(w),'교재 제시문 낱말 '+w);assert.ok(!/교재 문장 그대로|교재 예제의 제시문/.test(text),'교재 출처 줄 없음');}
 assert.ok(Object.values(bank).every(l=>(l.subject==='국어')===/^(논리 [1-6]장|독해 [1-3]장)$/.test(l.topic)),'국어 교재 문제만 subject가 국어이고, 영어 문제에는 subject가 없다');
 assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='논리 1장').map(l=>l.point)).size,11);assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='논리 2장').map(l=>l.point)).size,45);assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='논리 3장').map(l=>l.point)).size,27);
 assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='논리 4장').map(l=>l.point)).size,14);assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='논리 5장').map(l=>l.point)).size,14);
 assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='논리 6장').map(l=>l.point)).size,43);assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='논리 6장').map(l=>l.ruleId)).size,8);
 assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='독해 1장').map(l=>l.point)).size,61);assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='독해 1장').map(l=>l.ruleId)).size,15);
 assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='독해 2장').map(l=>l.point)).size,18);assert.equal(new Set(Object.values(bank).filter(l=>l.topic==='독해 3장').map(l=>l.point)).size,59);
 {const p12=new Set(Object.values(bank).filter(l=>l.topic==='논리 1장'||l.topic==='논리 2장').map(l=>l.point));assert.ok(Object.values(bank).filter(l=>l.topic==='논리 3장').every(l=>!p12.has(l.point)),'3장 개념은 1·2장 개념과 이름이 겹치지 않는다');}
 {const p123=new Set(Object.values(bank).filter(l=>/^논리 [123]장$/.test(l.topic)).map(l=>l.point)),p4=new Set(Object.values(bank).filter(l=>l.topic==='논리 4장').map(l=>l.point));assert.ok(Object.values(bank).filter(l=>l.topic==='논리 4장').every(l=>!p123.has(l.point)),'4장 개념은 1~3장 개념과 이름이 겹치지 않는다');assert.ok(Object.values(bank).filter(l=>l.topic==='논리 5장').every(l=>!p123.has(l.point)&&!p4.has(l.point)),'5장 개념은 1~4장 개념과 이름이 겹치지 않는다');}
 {const p15=new Set(Object.values(bank).filter(l=>/^논리 [1-5]장$/.test(l.topic)).map(l=>l.point));assert.ok(Object.values(bank).filter(l=>l.topic==='논리 6장').every(l=>!p15.has(l.point)),'6장 개념은 1~5장 개념과 이름이 겹치지 않는다');}
 {const p16=new Set(Object.values(bank).filter(l=>/^논리 [1-6]장$/.test(l.topic)).map(l=>l.point));assert.ok(Object.values(bank).filter(l=>l.topic==='독해 1장').every(l=>!p16.has(l.point)),'독해 1장 개념은 논리 1~6장 개념과 이름이 겹치지 않는다');}
 {const old=new Set(Object.values(bank).filter(l=>/^(논리 [1-6]장|독해 1장)$/.test(l.topic)).map(l=>l.point));assert.ok(Object.values(bank).filter(l=>/^독해 [23]장$/.test(l.topic)).every(l=>!old.has(l.point)),'독해 2·3장 개념은 앞 장 개념과 이름이 겹치지 않는다');}
 assert.ok(Object.entries(bank).filter(([id])=>/^ko-(logic|read)/.test(id)).every(([,l])=>!/문항|카드/.test(JSON.stringify([l.title,l.rule,l.hook,l.examples,l.variants]))),'국어 교재 문제의 문제·보기·해설·정리에 문항/카드라는 말이 없다');}
const c=ctx.CORE_REVIEW_PACK[0],options=ctx.QUIZ_OPTIONS;
const picks=Array.from({length:8},(_,i)=>practice.select(c,Array.from({length:i},()=>({cardId:c.id})),bank,options));
for(const e of picks)assert.equal(e.choices[e.correctIndex],options[c.id].choices[options[c.id].correctIndex]);
assert.ok(new Set(picks.map(e=>e.correctIndex)).size>1);
// Choice variants inside a lesson keep their own key/explanation through shuffle and refresh.
for(const [id,lesson]of Object.entries(bank)){
 const card=ctx.CORE_REVIEW_PACK.find(c=>c.id===id)||{id,question:'',explanation:''};
 for(const row of lesson.variants.filter(e=>e.type==='choice')){
  const n=lesson.variants.length+(options[id]?1:0);
  const shown=Array.from({length:n*2},(_,i)=>practice.select(card,Array.from({length:i},()=>({cardId:id})),bank,options)).filter(e=>e.question===row.question);
  assert.equal(shown.length,2);for(const e of shown){assert.equal(e.choices[e.correctIndex],row.choices[row.correctIndex]);assert.equal(e.explanation.replace(/[①②③④]/g,'#'),row.explanation.replace(/[①②③④]/g,'#'));const fresh=practice.refresh(card,e,bank,options);assert.equal(fresh.exerciseId,e.exerciseId);assert.deepEqual(fresh.choices,e.choices);}
 }
}
assert.equal(practice.grade(bank['en-session-20260909-help-v1'].variants[0],'to learn'),true);
assert.equal(practice.grade(bank['en-session-20260909-help-v1'].variants[0],'learning'),false);
// Adversarial review: valid forms must not be marked wrong; future-tense distractors still fail.
const time=[bank['en-session-20260909-time-clause-v1'].variants[0],bank['en-session-20260909-time-clause-v2'].variants[0]];
assert.equal(practice.grade(time[0],'has arrived'),true);
assert.equal(practice.grade(time[1],'has stopped'),true);
assert.equal(practice.grade(time[0],'will arrive'),false);
assert.equal(practice.grade(time[1],'will stop'),false);
assert.equal(practice.grade(bank['en-session-20260909-difficulty-v2'].variants[0],'in understanding'),true);
assert.equal(practice.grade(bank['en-session-20260909-difficulty-v2'].variants[0],'in understand'),false);
// Updating an explanation refreshes an unfinished item without changing its shuffled options.
const stale=structuredClone(picks[3]);stale.explanation='old explanation';
const refreshed=practice.refresh(c,stale,bank,options);
assert.deepEqual(refreshed.choices,stale.choices);assert.equal(refreshed.correctIndex,stale.correctIndex);
assert.equal(refreshed.explanation,c.explanation);
assert.notEqual(refreshed.explanation,stale.explanation);
// Adding a new leading exercise preserves an already open typed variant by identity.
const typedCard={id:'test-stable',question:'base',explanation:'base explanation'};
const typedBank={'test-stable':{variants:[{type:'text',question:'Write the form: old example.',answers:['old'],explanation:'Old example.'}]}};
const savedTyped=practice.select(typedCard,[],typedBank,{});
const insertedOptions={'test-stable':{question:'Choose a new example.',choices:['a','b','c','d'],correctIndex:2,explanation:'Dedicated MCQ explanation.'}};
const sameTyped=practice.refresh(typedCard,savedTyped,typedBank,insertedOptions);
assert.equal(sameTyped.exerciseId,savedTyped.exerciseId);assert.equal(sameTyped.variantIndex,1);
const newMcq=practice.select(typedCard,[],typedBank,insertedOptions);assert.equal(newMcq.explanation,'Dedicated MCQ explanation.');
for(const suffix of ['collective','none']){const variant=bank['grammar-agreement-'+suffix+'-v2'].variants[0];assert.equal(practice.grade(variant,'is'),true);assert.equal(practice.grade(variant,'are'),true);assert.equal(practice.grade(variant,'be'),false);}
assert.equal(practice.normalize(" HADN’T   MISSED. "),"hadn't missed");
const sync=require('./sync-core.js');const state={cards:[{id:'a',ease:2.5,interval:0,streak:0}],history:[]};
const merged=sync.merge(state,[{id:'event1',cardId:'a',date:'2026-09-09',at:'2026-09-09T10:00:00Z',result:'unsure',mode:'quiz'}]);
assert.equal(merged.cards[0].due,'2026-09-10');assert.equal(merged.cards[0].retryAt,undefined);assert.equal(merged.cards[0].streak,0);
// 사진 보기 문항. 보기 글자는 화면에 나오지 않고 사진만 나오지만, 섞기·정답 추적·기록은 글자 보기와 똑같아야 한다.
const record=require('./review-record.js');
// 엔진(practice.js)은 사진을 전혀 모른다. 글자 문항의 동작이 바뀔 수 없다는 뜻이고, 이 불변식을 코드로 못 박는다.
assert.equal(/choiceImages|photo/.test(fs.readFileSync(__dirname+'/practice.js','utf8')),false,'The exercise engine must stay unaware of image options');
const photoCard=ctx.CORE_REVIEW_PACK.find(c=>c.id==='photo-hist-20260912-03');
const photoOptions=options['photo-hist-20260912-03'],photoAnswer=photoOptions.choices[photoOptions.correctIndex];
const photoPicks=Array.from({length:8},(_,i)=>practice.select(photoCard,Array.from({length:i},()=>({cardId:photoCard.id})),bank,options));
for(const e of photoPicks){
 assert.equal(e.choices[e.correctIndex],photoAnswer,'Shuffle must keep pointing at the correct photo');
 assert.equal(e.choices.length,4);assert.equal(Object.keys(e.choiceImages).length,4);
 assert.equal(e.exerciseId,photoPicks[0].exerciseId,'Shuffling must not change the exercise identity');
 for(const name of e.choices)assert(e.choiceImages[name].src.startsWith('assets/heritage/'),'Every option keeps its photo through the shuffle');
}
assert(new Set(photoPicks.map(e=>e.correctIndex)).size>1,'Photo options must shuffle');
for(let i=1;i<photoPicks.length;i++)assert.notEqual(photoPicks[i].correctIndex,photoPicks[i-1].correctIndex,'A retry must move the correct photo');
// 풀던 문항을 다시 그릴 때 사진 보기의 순서도 그대로 유지된다.
const photoSaved=photoPicks[2],photoFresh=practice.refresh(photoCard,photoSaved,bank,options);
assert.deepEqual(photoFresh.choices,photoSaved.choices);assert.equal(photoFresh.correctIndex,photoSaved.correctIndex);
assert.deepEqual(photoFresh.choiceImages,photoSaved.choiceImages);
// 채점: 정답 번호를 고르면 맞고, 다른 번호는 틀린다(앱의 input===correctIndex 비교와 같은 규칙).
for(let i=0;i<4;i++)assert.equal(i===photoSaved.correctIndex,photoSaved.choices[i]===photoAnswer);
// 기록 스냅샷: 지난 기록에서도 어떤 사진을 골랐는지 남아야 한다.
const photoDetail=record.create(photoCard,photoSaved,(photoSaved.correctIndex+1)%4,null,'history-unified-silla-pagodas');
assert.equal(photoDetail.presentation,'choice');
assert.equal(photoDetail.options.split(String.fromCharCode(10)).length,4);
for(const name of photoSaved.choices)assert(photoDetail.options.includes(photoSaved.choiceImages[name].src),'History must record the photo shown for '+name);
assert(photoDetail.correctAnswer.includes(photoAnswer)&&photoDetail.correctAnswer.includes('assets/heritage/'),'The stored correct answer must still render as a photo');
assert(photoDetail.submittedAnswer.includes('assets/heritage/'));
assert.notEqual(photoDetail.submittedAnswer,photoDetail.correctAnswer);
// 글자 문항의 기록은 한 글자도 달라지지 않는다.
const plainCard={id:'plain',subject:'한국사',question:'q',explanation:'e'};
const plainChoice={type:'choice',question:'q',choices:['가','나','다','라'],correctIndex:2,explanation:'e',exerciseId:'plain-1'};
const plainDetail=record.create(plainCard,plainChoice,0,null,'concept-plain');
assert.equal(plainDetail.options,['1. 가','2. 나','3. 다','4. 라'].join(String.fromCharCode(10)));
assert.equal(plainDetail.submittedAnswer,'1. 가');assert.equal(plainDetail.correctAnswer,'3. 다');
const plainText={type:'text',question:'q',answers:['ans'],explanation:'e',exerciseId:'plain-2'};
const textDetail=record.create(plainCard,plainText,'ans',null,'concept-plain');
assert.equal(textDetail.options,'');assert.equal(textDetail.submittedAnswer,'ans');assert.equal(textDetail.correctAnswer,'ans');
console.log('PASS practice: one question per practice entry (Day 1 60, Day 2 60, Day 3 178, Day 4 152, Day 5 196, Day 6 220, Day 7 240, 문법 공식 훈련 364, 수일치 95, 영문법 60, 국어 논리 1장 31 · 2장 179 · 3장 181 four-option), same question on retry with a moved answer number, split questions keep their rule text, answer normalization, alternative valid answers, contrasting variants, shuffled answer mapping, photo options (shuffle, grading, history snapshot), unchanged text records, assisted progress on another device');
// 보기를 섞어도 해설의 ①~④와 보기별 틀린 곳 표시는 화면에 보이는 순서를 따라간다(이어 풀기로 저장된 순서도 같다).
{
 const choices=['Alpha one.','Bravo two.','Charlie three.','Delta four.'],marks=[null,[{wrong:'Bravo',fix:'B'}],null,[{wrong:'four',fix:'4'}]];
 const opt={'t-order':{question:'q',choices,correctIndex:1,explanation:'① Alpha ② Bravo ③ Charlie ④ Delta',marks}};
 const check=(e,what)=>{for(const m of e.explanation.matchAll(/([①②③④]) (\w+)/g))assert.ok(e.choices['①②③④'.indexOf(m[1])].startsWith(m[2]),what+': '+e.explanation+' / '+e.choices);e.choices.forEach((c,i)=>assert.deepEqual(e.marks[i],marks[choices.indexOf(c)],what));};
 for(let n=0;n<8;n++){
  const e=practice.select({id:'t-order'},Array.from({length:n},()=>({cardId:'t-order'})),{},opt);check(e,'해설 번호가 섞인 보기 자리를 가리킨다');
  const saved={...e,choices:[...e.choices].reverse()},r=practice.refresh({id:'t-order'},saved,{},opt);
  assert.deepEqual(r.choices,saved.choices);check(r,'이어 풀기 순서에서도 해설 번호가 맞는다');
 }
 assert.deepEqual(opt['t-order'].choices,choices,'원본 보기는 바뀌지 않는다');
 for(const [id,l] of Object.entries(bank))for(const v of l.variants)if(v.marks){
  assert.equal(v.marks.length,v.choices.length,id);
  v.marks.forEach((ms,i)=>{if(ms)for(const m of ms){assert.ok(m.wrong&&m.fix&&m.wrong!==m.fix,id);assert.equal(v.choices[i].split(m.wrong).length,2,'틀린 곳 표시는 보기 문장 안에 한 번만 나온다: '+id);}});
  assert.equal(new Set(v.choices).size,v.choices.length,'표시가 있는 문제의 보기는 서로 다르다: '+id);
 }
}
console.log('practice: option numbers in explanations and error marks follow the shuffled order');
// 영어 보기 문제(어법상 옳은/옳지 않은 · 대괄호 · 수일치 · 우리말→영어 옮기기)는 틀린 보기마다, 틀린 보기에만 표시가 있어야 한다(v100: 옮기기 106문제가 빠져 있었다).
{
 const TYPE=/어법|옮긴|옮길 때|대괄호|밑줄|수일치/,stem=v=>v.question.split(String.fromCharCode(10))[0];
 const gaps=b=>{const out=[];for(const [id,l] of Object.entries(b))for(const v of l.variants){
  if(v.type!=='choice'||!TYPE.test(stem(v))||!v.choices.some(c=>/[A-Za-z]{2,}/.test(c)))continue;
  if(!v.marks||v.marks.length!==v.choices.length){out.push(id+': 보기별 틀린 곳 표시가 없다');continue;}
  const negative=/옳지 않은|틀린/.test(stem(v));
  v.marks.forEach((ms,i)=>{const wrongOption=negative?i===v.correctIndex:i!==v.correctIndex;
   if(!!ms!==wrongOption)out.push(id+' '+(i+1)+': '+(ms?'옳은 보기에 표시':'틀린 보기에 표시 없음'));
   const arrow=v.choices[i].indexOf(' → ');for(const m of ms||[])if(arrow>=0&&v.choices[i].indexOf(m.wrong)<arrow+3)out.push(id+' '+(i+1)+': 옮기기 문제의 표시는 영어 부분에');
  });}return out;};
 assert.deepEqual(gaps(bank),[],'영어 보기 문제의 표시 누락');
 const translation=Object.entries(bank).filter(([,l])=>l.variants.some(v=>/옳게 옮긴/.test(v.question)));
 assert.equal(translation.length,196,'우리말→영어로 옳게 옮긴 것은? 196문제(Day 2 2 · Day 3 25 · Day 4 23 · Day 5 29 · Day 6 27 · Day 7 34 · 문법 공식 훈련 56)');
 for(const [id,l] of translation){const v=l.variants[0];assert.ok(v.marks,'옮기기 문제 표시: '+id);assert.equal(v.marks[v.correctIndex],null,id);assert.equal(v.marks.filter(Boolean).length,v.choices.length-1,id);}
 // 대조군: 표시 하나 빼기 · 표시 통째로 빼기 · 옳은 보기에 표시 · 우리말 쪽에 표시 — 모두 잡혀야 한다.
 const [cid,cl]=translation.find(([id])=>id==='en-day3-009'),v0=cl.variants[0],wrongAt=v0.marks.findIndex(Boolean);
 const variant=marks=>({[cid]:{...cl,variants:[{...v0,marks}]}});
 assert.equal(gaps(variant(v0.marks.map((m,i)=>i===wrongAt?null:m))).length,1,'대조군: 틀린 보기 표시 하나를 빼면 잡힌다');
 assert.equal(gaps(variant(undefined)).length,1,'대조군: 표시를 통째로 빼면 잡힌다');
 assert.equal(gaps(variant(v0.marks.map((m,i)=>i===v0.correctIndex?[{wrong:'injured',fix:'injuring'}]:m))).length,1,'대조군: 옳은 보기에 표시하면 잡힌다');
 assert.equal(gaps(variant(v0.marks.map((m,i)=>i===wrongAt?[{wrong:'학생들은',fix:'x'}]:m))).length,1,'대조군: 우리말 쪽 표시는 잡힌다');
}
console.log('practice: every English grammar/translation choice question marks exactly its wrong options (controls: one mark removed, all marks removed, answer marked, Korean side marked)');
// 해설을 보기별로 나눈다: 보기 문장마다 그 보기의 설명(정답은 정답 근거, 나머지는 보기 비교의 해당 번호)이 섞인 순서를 따라 붙는다.
{
 let split=0;
 for(const [id,l] of Object.entries(bank))for(const v of l.variants){
  if(v.type!=='choice'||!/보기 비교: [①②③④]/.test(v.explanation))continue;
  const authored=practice.explainByChoice(v);assert.ok(authored,'보기별로 나뉜다: '+id);split++;
  assert.equal(authored.per[v.correctIndex],v.explanation.split('\n\n')[0].replace('정답 근거:','').trim(),id);
  for(let n=0;n<3;n++){const e=practice.select({id,question:'',explanation:''},Array.from({length:n},()=>({cardId:id})),bank,{}),r=practice.explainByChoice(e);
   assert.ok(r,id);e.choices.forEach((c,i)=>assert.equal(r.per[i],authored.per[v.choices.indexOf(c)],'섞인 보기에 맞는 설명: '+id));assert.deepEqual(r.rest,authored.rest);}
 }
 assert.equal(split,953,'영어 문장형 953문제(Day 1 40 · Day 2 40 · Day 3 116 · Day 4 102 · Day 5 130 · Day 6 137 · Day 7 150 · 문법 공식 훈련 238)가 보기별 해설로 나뉜다');
 // 번호 없이 서술한 해설(국어 논리 등)과 번호가 모자라거나 겹치는 해설은 나누지 않고 원래대로 보여 준다.
 assert.equal(practice.explainByChoice(bank['ko-logic1-01'].variants[0]),null);
 const base={type:'choice',choices:['a','b','c','d'],correctIndex:0};
 assert.equal(practice.explainByChoice({...base,explanation:'정답 근거: x\n\n보기 비교: ② y ③ z'}),null,'빠진 번호');
 assert.equal(practice.explainByChoice({...base,explanation:'정답 근거: x\n\n보기 비교: ② y ② z ④ w'}),null,'겹친 번호');
 assert.deepEqual(practice.explainByChoice({...base,explanation:'정답 근거: x\n\n보기 비교: ② y ③ z ④ w\n\n기억 연결: m'}),{per:['x','y','z','w'],rest:['기억 연결: m']});
}
console.log('practice: explanations split per option and follow the shuffled order');
