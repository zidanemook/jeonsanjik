const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);for(const f of ['core-review-pack.js','quiz-options.js','study-review-catalog.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const catalog=ctx.STUDY_REVIEW_CATALOG,ids=new Set(),cards=new Map(ctx.CORE_REVIEW_PACK.map(c=>[c.id,c]));
assert.equal(catalog.schema,1);assert.equal(catalog.total,Object.keys(catalog.questions).length);
for(const [i,set]of catalog.sets.entries()){
 assert.equal(set.number,i+1);assert(set.title);assert(set.ids.length>0&&set.ids.length<=8,'A work-break set must contain at most eight questions');
 for(const id of set.ids){assert(!ids.has(id),'Question in two sets: '+id);ids.add(id);assert(cards.has(id),'Unknown card: '+id);const meta=catalog.questions[id],options=ctx.QUIZ_OPTIONS[id];assert(meta&&meta.section&&meta.sourceSection&&meta.coverage.length,'Missing scope metadata: '+id);assert.equal(options.choices.length,4);assert.equal(cards.get(id).answer,options.choices[options.correctIndex]);}
}
assert.equal(ids.size,catalog.total);for(const id of Object.keys(catalog.questions))assert(ids.has(id),'Unreachable practice question: '+id);
for(const card of cards.values())if(/^(?:(?:study|summary)-hist-20260910-|summary-hist-20260911-|lecture-hist-20260911-|summary-hist-20260912-|(?:heritage|daily|photo|culture|goryeo)-hist-20260912-|goryeomid-hist-20260914-|goryeoforeign-hist-20260914-|goryeostyle-hist-20260915-|ancientstyle-hist-20260915-|nanbukstyle-hist-20260915-|goryeoecon-hist-20260915-)/.test(card.id))assert(ids.has(card.id),'Summary question excluded from scope: '+card.id);
// Textbook lecture ranges: every summary question sits in exactly one lecture, in catalog order.
const lectures=JSON.parse(JSON.stringify(catalog.lectures)),inLecture=new Map();
assert.deepEqual(lectures.map(l=>l.id),['02-05','06','07-08','09','02-03-04-05','05-06','10','11','12','10-12','13']);
assert.deepEqual(lectures.map(l=>l.title),['02~05강 선사 시대~삼국 통일','06강 통일 신라·발해·후삼국','07·08강 고대 경제·사회·문화','09강 고대(문화 2)','선사~삼국·가야 기출형 연습','통일 신라·발해·후삼국 기출형 연습','10강 고려(초기 정치)','11강 고려(중기 정치~무신 정변)','12강 고려(외교)','고려 기출형 연습','13강 고려(경제, 사회)']);
for(const l of lectures){assert(l.ids.length>0,'Empty lecture '+l.id);for(const id of l.ids){assert(!inLecture.has(id),'Question in two lectures: '+id);assert(catalog.questions[id],'Unknown lecture question: '+id);inLecture.set(id,l.id);}const numbers=l.ids.map(id=>catalog.questions[id].number);assert.deepEqual(numbers,[...numbers].sort((a,b)=>a-b),'Lecture keeps catalog order: '+l.id);}
assert.equal(inLecture.size,catalog.total);
const LECTURE_0708=/^(?:lecture-hist-20260911-|heritage-hist-20260912-|photo-hist-20260912-)/;
const LECTURE_09=/^culture-hist-20260912-/,LECTURE_10=/^goryeo-hist-20260912-/,LECTURE_11=/^goryeomid-hist-20260914-/,LECTURE_12=/^goryeoforeign-hist-20260914-/,LECTURE_GORYEO_EXAM=/^goryeostyle-hist-20260915-/,LECTURE_ANCIENT_EXAM=/^ancientstyle-hist-20260915-/,LECTURE_NANBUK_EXAM=/^nanbukstyle-hist-20260915-/,LECTURE_13=/^goryeoecon-hist-20260915-/;
for(const [id,q]of Object.entries(catalog.questions)){const expected=LECTURE_13.test(id)?'13':LECTURE_ANCIENT_EXAM.test(id)?'02-03-04-05':LECTURE_NANBUK_EXAM.test(id)?'05-06':LECTURE_GORYEO_EXAM.test(id)?'10-12':LECTURE_12.test(id)?'12':LECTURE_11.test(id)?'11':LECTURE_10.test(id)?'10':LECTURE_09.test(id)?'09':LECTURE_0708.test(id)?'07-08':['통일 신라','발해','후삼국'].includes(q.section)?'06':'02-05';assert.equal(inLecture.get(id),expected,'Lecture by section: '+id);}
const newIds=Object.keys(catalog.questions).filter(id=>LECTURE_0708.test(id));assert.equal(newIds.length,73);assert.deepEqual(lectures[2].ids,newIds);
assert(newIds.every(id=>catalog.questions[id].number>225),'New questions continue after the earlier catalog numbers');
assert(catalog.sets.filter(s=>s.title.startsWith('07·08강 고대 경제·사회·문화')).length===7);
const ids09=Object.keys(catalog.questions).filter(id=>LECTURE_09.test(id));assert.equal(ids09.length,33,'09강 문항 수');assert.deepEqual(lectures[3].ids,ids09);
const ids10=Object.keys(catalog.questions).filter(id=>LECTURE_10.test(id));assert.equal(ids10.length,52,'10강 문항 수');assert.deepEqual(lectures[6].ids,ids10);
assert([...ids09,...ids10].every(id=>catalog.questions[id].number>320),'09·10강 문항은 기존 catalog 번호 뒤에 이어진다');
// 11강(122~123쪽)은 교재 면의 사실 83개를 모두 덮는 103문제다. 번호는 10강 마지막(405번) 뒤에 이어진다.
const ids11=Object.keys(catalog.questions).filter(id=>LECTURE_11.test(id));assert.equal(ids11.length,103,'11강 문항 수');assert.deepEqual(lectures[7].ids,ids11);
assert(ids11.every(id=>catalog.questions[id].number>405),'11강 문항은 기존 catalog 번호 뒤에 이어진다');
// 12강(134~135쪽)은 교재 면의 사실 95개(판독 불확실 1개 제외)를 덮는 140문제다. 번호는 11강 마지막(508번) 뒤에 이어진다.
const ids12=Object.keys(catalog.questions).filter(id=>LECTURE_12.test(id));assert.equal(ids12.length,140,'12강 문항 수');assert.deepEqual(lectures[8].ids,ids12);
assert(ids12.every(id=>catalog.questions[id].number>508),'12강 문항은 기존 catalog 번호 뒤에 이어진다');
// 고려 기출형 연습은 10~12강 사실을 자료 제시형으로 다시 묻는 48문제다. 강 목록에서 12강 바로 다음에 오고, 번호는 12강 마지막(648번) 뒤에 이어진다.
const idsExam=Object.keys(catalog.questions).filter(id=>LECTURE_GORYEO_EXAM.test(id));assert.equal(idsExam.length,48,'고려 기출형 연습 문항 수');
assert.equal(lectures.findIndex(l=>l.id==='10-12'),lectures.findIndex(l=>l.id==='12')+1,'고려 기출형 연습은 12강 바로 다음');assert.equal(lectures[9].title,'고려 기출형 연습');assert.deepEqual(lectures[9].ids,idsExam);
assert.deepEqual(idsExam.map(id=>catalog.questions[id].number),Array.from({length:48},(_,i)=>649+i),'고려 기출형 연습 번호는 649~696');
assert.deepEqual(idsExam,Array.from({length:48},(_,i)=>'goryeostyle-hist-20260915-'+String(i+1).padStart(3,'0')));
// 선사~삼국·가야 기출형 연습(02~05강 55문제)과 통일 신라·발해·후삼국 기출형 연습(통일 과정과 06강 53문제)은 고대 마지막 강(09강) 바로 다음, 10강 앞에 차례로 온다.
// 강 id는 app.js lectureScope가 숫자와 붙임표만 받으므로 다루는 강 번호로 짓는다. 02-05는 이미 있는 강이라 02-03-04-05로 풀어 쓰고, 통일 과정(05강)과 06강을 묻는 쪽은 05-06이다. 번호는 고려 기출형 연습 마지막(696번) 뒤에 이어진다.
const idsAncientExam=Object.keys(catalog.questions).filter(id=>LECTURE_ANCIENT_EXAM.test(id)),idsNanbukExam=Object.keys(catalog.questions).filter(id=>LECTURE_NANBUK_EXAM.test(id));
assert.equal(idsAncientExam.length,55,'선사~삼국·가야 기출형 연습 문항 수');assert.equal(idsNanbukExam.length,53,'통일 신라·발해·후삼국 기출형 연습 문항 수');
assert.equal(lectures.findIndex(l=>l.id==='02-03-04-05'),lectures.findIndex(l=>l.id==='09')+1,'선사~삼국·가야 기출형 연습은 09강 바로 다음');
assert.equal(lectures.findIndex(l=>l.id==='05-06'),lectures.findIndex(l=>l.id==='02-03-04-05')+1,'통일 신라·발해·후삼국 기출형 연습은 선사~삼국·가야 기출형 연습 바로 다음');
assert.equal(lectures.findIndex(l=>l.id==='10'),lectures.findIndex(l=>l.id==='05-06')+1,'고대 기출형 연습 두 범위는 10강 앞');
assert.equal(lectures[4].title,'선사~삼국·가야 기출형 연습');assert.deepEqual(lectures[4].ids,idsAncientExam);
assert.equal(lectures[5].title,'통일 신라·발해·후삼국 기출형 연습');assert.deepEqual(lectures[5].ids,idsNanbukExam);
assert.deepEqual(idsAncientExam.map(id=>catalog.questions[id].number),Array.from({length:55},(_,i)=>697+i),'선사~삼국·가야 기출형 연습 번호는 697~751');
assert.deepEqual(idsNanbukExam.map(id=>catalog.questions[id].number),Array.from({length:53},(_,i)=>752+i),'통일 신라·발해·후삼국 기출형 연습 번호는 752~804');
assert.deepEqual(idsAncientExam,Array.from({length:55},(_,i)=>'ancientstyle-hist-20260915-'+String(i+1).padStart(3,'0')));
assert.deepEqual(idsNanbukExam,Array.from({length:53},(_,i)=>'nanbukstyle-hist-20260915-'+String(i+1).padStart(3,'0')));
// 선사~삼국·가야 쪽은 02~05강 주제의 열한 단원에만, 통일 신라·발해·후삼국 쪽은 06강 세 단원·헷갈리는 내용 비교·통일 과정(백제·신라·통일)에만 들어가고, 각 단원을 모두 쓴다. 고려 단원이 섞이면 안 된다.
const SECTIONS_ANCIENT_EXAM=['선사','선사 시대 · 기본','고조선·여러 나라','고조선·여러 나라 · 기본','고구려·가야','고구려·가야 · 기본','백제·신라·통일','백제·신라 · 기본','백제','신라','삼국 공통·비교'];
const SECTIONS_NANBUK_EXAM=['통일 신라','발해','후삼국','헷갈리는 내용 비교','백제·신라·통일'];
for(const id of idsAncientExam)assert(SECTIONS_ANCIENT_EXAM.includes(catalog.questions[id].section),'선사~삼국·가야 기출형 연습 question outside its sections: '+id);
for(const id of idsNanbukExam)assert(SECTIONS_NANBUK_EXAM.includes(catalog.questions[id].section),'통일 신라·발해·후삼국 기출형 연습 question outside its sections: '+id);
assert.deepEqual([...new Set(idsAncientExam.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_ANCIENT_EXAM].sort(),'선사~삼국·가야 기출형 연습 covers all eleven sections');
assert.deepEqual([...new Set(idsNanbukExam.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_NANBUK_EXAM].sort(),'통일 신라·발해·후삼국 기출형 연습 covers all five sections');
// 13강(147쪽)은 교재 면의 사실 50개를 모두 덮는 60문제(사실 확인형과 자료 제시 기출형 약 절반씩)다. 강 목록 맨 끝에 오고, 번호는 통일 신라·발해·후삼국 기출형 연습 마지막(804번) 뒤에 이어진다.
const ids13=Object.keys(catalog.questions).filter(id=>LECTURE_13.test(id));assert.equal(ids13.length,60,'13강 문항 수');
assert.equal(lectures.at(-1).id,'13','13강은 강 목록 맨 끝');assert.equal(lectures.at(-1).title,'13강 고려(경제, 사회)');assert.deepEqual(lectures.at(-1).ids,ids13);
assert.deepEqual(ids13.map(id=>catalog.questions[id].number),Array.from({length:60},(_,i)=>805+i),'13강 번호는 805~864');
assert.deepEqual(ids13,Array.from({length:60},(_,i)=>'goryeoecon-hist-20260915-'+String(i+1).padStart(3,'0')));
// 13강은 고려 주제의 두 새 단원(경제·사회)에만 들어가고, 두 단원을 모두 쓴다.
const SECTIONS_13=['고려 경제','고려 사회'];
for(const id of ids13)assert(SECTIONS_13.includes(catalog.questions[id].section),'13강 question outside the 13강 고려 sections: '+id);
assert.deepEqual([...new Set(ids13.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_13].sort(),'13강 covers both columns');
// 10강은 topics.js의 goryeo 주제가 유일하게 연결하는 단원 이름만 써야 한다. 단원 이름이 어긋나면 주제 없는 문항이 된다.
for(const id of ids10)assert.equal(catalog.questions[id].section,'고려 초기 정치','10강 question outside the 고려 section: '+id);
// 09강은 고대 단원 문항이므로 고려 단원 이름이 섞여 들어오면 안 된다.
for(const id of ids09)assert(catalog.questions[id].section!=='고려 초기 정치','09강 question inside the 고려 section: '+id);
// 11강은 고려 주제의 두 새 단원(문벌 사회·무신 정권)에만 들어가고, 두 단원을 모두 쓴다. 10강 단원 이름이 섞이면 안 된다.
const SECTIONS_11=['고려 문벌 사회','고려 무신 정권'];
for(const id of ids11)assert(SECTIONS_11.includes(catalog.questions[id].section),'11강 question outside the 11강 고려 sections: '+id);
assert.deepEqual([...new Set(ids11.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_11].sort(),'11강 covers both pages');
// 12강은 고려 주제의 세 새 단원(대외 관계·후기 사회 변동·멸망)에만 들어가고, 세 단원을 모두 쓴다.
const SECTIONS_12=['고려 대외 관계','고려 후기 사회 변동','고려의 멸망'];
for(const id of ids12)assert(SECTIONS_12.includes(catalog.questions[id].section),'12강 question outside the 12강 고려 sections: '+id);
assert.deepEqual([...new Set(ids12.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_12].sort(),'12강 covers all three blocks');
// 고려 기출형 연습은 고려 주제의 여섯 단원(10강·11강·12강)에만 들어가고, 여섯 단원을 모두 쓴다.
const SECTIONS_GORYEO=['고려 초기 정치','고려 문벌 사회','고려 무신 정권','고려 대외 관계','고려 후기 사회 변동','고려의 멸망'];
for(const id of idsExam)assert(SECTIONS_GORYEO.includes(catalog.questions[id].section),'고려 기출형 연습 question outside the 고려 sections: '+id);
assert.deepEqual([...new Set(idsExam.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_GORYEO].sort(),'고려 기출형 연습 covers all six 고려 sections');
// 단원 이름은 topics.js가 실제로 들고 있는 이름이어야 한다. 주제 제목('백제·신라·삼국 통일')을 단원 이름 자리에 적으면
// 주제에 연결되지 않는 문항이 되어 화면에서 시대 표시가 사라진다. 카탈로그 전체를 대상으로 막는다.
const topics=require(__dirname+'/topics.js'),sectionNames=new Set(topics.list.flatMap(t=>t.sections));
for(const [id,q]of Object.entries(catalog.questions))assert(sectionNames.has(q.section),'Section is not a topics.js section name: '+id+' / '+q.section);
assert(!sectionNames.has('백제·신라·삼국 통일'),'The topic title must never become a section name');
assert.deepEqual(Array.from(topics.list.find(t=>t.id==='goryeo').sections),['고려 초기 정치','고려 문벌 사회','고려 무신 정권','고려 대외 관계','고려 후기 사회 변동','고려의 멸망','고려 경제','고려 사회'],'고려 topic holds the 10강~13강 section names in lecture order');
// 09강이 실제로 여러 시대 단원에 걸쳐 있는지도 확인한다. 한 단원에 몰리면 교재 범위를 다 덮지 못한 것이다.
assert(new Set(ids09.map(id=>catalog.questions[id].section)).size>=5,'09강 covers several ancient sections');
assert.equal(catalog.sets.filter(s=>s.title.startsWith('09강 고대(문화 2)')).length,5);
assert.equal(catalog.sets.filter(s=>s.title.startsWith('10강 고려(초기 정치)')).length,7);
assert.equal(catalog.sets.filter(s=>s.title.startsWith('11강 고려(중기 정치~무신 정변)')).length,13);
assert.equal(catalog.sets.filter(s=>s.title.startsWith('12강 고려(외교)')).length,18);
assert.deepEqual(Array.from(catalog.sets.filter(s=>s.title.startsWith('고려 기출형 연습')),s=>s.number),[87,88,89,90,91,92]);
assert.deepEqual(Array.from(catalog.sets.filter(s=>s.title.startsWith('선사~삼국·가야 기출형 연습')),s=>s.number),[93,94,95,96,97,98,99]);
assert.deepEqual(Array.from(catalog.sets.filter(s=>s.title.startsWith('통일 신라·발해·후삼국 기출형 연습')),s=>s.number),[100,101,102,103,104,105,106]);
// Earlier saved selections retain the same membership after the expansion.
for(let set=1;set<=5;set++)assert.deepEqual(Array.from(catalog.sets[set-1].ids),Array.from({length:8},(_,i)=>'study-hist-20260910-'+String((set-1)*8+i+1).padStart(2,'0')));
// 사진 보기 문항: 네 보기가 모두 사진이고, 저장된 파일을 가리키며, 화면에 띄울 출처표시를 보기마다 들고 있어야 한다.
const photoIds=Object.keys(catalog.questions).filter(id=>id.startsWith('photo-hist-20260912-'));
assert.equal(photoIds.length,7,'Photo-option questions missing from the catalog');
for(const id of photoIds){
 const options=ctx.QUIZ_OPTIONS[id];assert(options.choiceImages,'Photo question without images: '+id);
 assert.equal(Object.keys(options.choiceImages).length,4,'Every option needs a photo: '+id);
 assert(!options.fixedOrder,'Photo options must still shuffle: '+id);
 for(const name of options.choices){const meta=options.choiceImages[name];
  assert(fs.existsSync(__dirname+'/'+meta.src),'Missing photo file: '+meta.src);
  assert(/공공누리 제1유형/.test(meta.credit),'Photo option without its attribution: '+name);
  assert(!meta.alt.includes(name),'Alt text must not name the option: '+name);}}
// 사진은 서비스 워커 프리캐시 목록에 넣지 않는다. 기출 이미지와 같이 문항을 열 때 받아 기기에 캐시된다.
assert(!fs.readFileSync(__dirname+'/sw.js','utf8').includes('assets/heritage'),'Photos must not be precached');
const index=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8'),deploy=fs.readFileSync(__dirname+'/.github/workflows/pages.yml','utf8');
const script=index.match(/study-review-catalog\.js\?v=\d+/)?.[0];assert(script&&sw.includes(script),'Offline cache lacks the same scope catalog as HTML');assert(index.indexOf(script)<index.indexOf('src="app.js'),'Catalog must load before the app');assert(deploy.includes('cp study-review-catalog.js '),'Pages artifact lacks the new runtime file');
console.log('PASS summary practice: '+photoIds.length+' photo-option questions, '+catalog.total+' questions, '+catalog.sets.length+' bounded sets, '+lectures.length+' lecture ranges, complete membership, answer mapping, old scopes and deployment assets');
