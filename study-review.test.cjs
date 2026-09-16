const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);for(const f of ['core-review-pack.js','quiz-options.js','study-review-catalog.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const catalog=ctx.STUDY_REVIEW_CATALOG,ids=new Set(),cards=new Map(ctx.CORE_REVIEW_PACK.map(c=>[c.id,c]));
assert.equal(catalog.schema,1);assert.equal(catalog.total,Object.keys(catalog.questions).length);
for(const [i,set]of catalog.sets.entries()){
 assert.equal(set.number,i+1);assert(set.title);assert(set.ids.length>0&&set.ids.length<=8,'A work-break set must contain at most eight questions');
 for(const id of set.ids){assert(!ids.has(id),'Question in two sets: '+id);ids.add(id);assert(cards.has(id),'Unknown card: '+id);const meta=catalog.questions[id],options=ctx.QUIZ_OPTIONS[id];assert(meta&&meta.section&&meta.sourceSection&&meta.coverage.length,'Missing scope metadata: '+id);// 복습용은 4지선다, 대비용(기출형)은 한능검과 같은 5지선다다. 그 밖의 보기 수는 실수다.
assert.ok(options.choices.length===4||options.choices.length===5,'보기는 4개 또는 5개: '+id+' ('+options.choices.length+')');
assert.equal(new Set(options.choices).size,options.choices.length,'같은 보기가 두 번: '+id);
assert.equal(cards.get(id).answer,options.choices[options.correctIndex]);}
}
assert.equal(ids.size,catalog.total);for(const id of Object.keys(catalog.questions))assert(ids.has(id),'Unreachable practice question: '+id);
for(const card of cards.values())if(/^(?:(?:study|summary)-hist-20260910-|summary-hist-20260911-|lecture-hist-20260911-|summary-hist-20260912-|(?:heritage|daily|photo|culture|goryeo)-hist-20260912-|goryeomid-hist-20260914-|goryeoforeign-hist-20260914-|goryeostyle-hist-20260915-|ancientstyle-hist-20260915-|nanbukstyle-hist-20260915-|goryeoecon-hist-20260915-|goryeoculture-hist-20260915-)/.test(card.id))assert(ids.has(card.id),'Summary question excluded from scope: '+card.id);
// Textbook lecture ranges: every summary question sits in exactly one lecture, in catalog order.
// 2026-09-16 사용자 지시: 따로 떠 있던 기출형 연습 범위 셋(선사~삼국·가야 / 통일 신라·발해·후삼국 / 고려)을 없애고 문제마다 실제 소속 강에 넣는다. 07·08강 덩어리도 둘로 나눈다.
const lectures=JSON.parse(JSON.stringify(catalog.lectures)),inLecture=new Map();
assert.deepEqual(lectures.map(l=>l.id),['02-05','06','07','08','09','10','11','12','13','14']);
assert.deepEqual(lectures.map(l=>l.title),['02~05강 선사 시대~삼국 통일','06강 통일 신라·발해·후삼국','07강 고대(경제, 사회)','08강 고대(문화 1)','09강 고대(문화 2)','10강 고려(초기 정치)','11강 고려(중기 정치~무신 정변)','12강 고려(외교)','13강 고려(경제, 사회)','14강 고려(문화 I)']);
for(const l of lectures){assert(l.ids.length>0,'Empty lecture '+l.id);for(const id of l.ids){assert(!inLecture.has(id),'Question in two lectures: '+id);assert(catalog.questions[id],'Unknown lecture question: '+id);inLecture.set(id,l.id);}const numbers=l.ids.map(id=>catalog.questions[id].number);assert.deepEqual(numbers,[...numbers].sort((a,b)=>a-b),'Lecture keeps catalog order: '+l.id);}
assert.equal(inLecture.size,catalog.total);
// 고대 기출형 108문항의 소속 강. 정답 사실과 대상을 알아내는 핵심 단서가 교재 어느 강에서 나오는지로 정했고, 둘이 다르면 뒤 강이다.
// 판정 근거는 research/lecture-merge-20260916/placement.json. 고려 기출형 48문항은 단원이 강과 1:1이라 단원으로 정한다.
const EXAM_PLACEMENT={
 'ancientstyle-hist-20260915-':{'02-05':[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,24,25,26,27,28,30,31,32,33,34,35,36,37,38,39,41,42,43,44,45,46,47,55],'07':[23],'08':[22,29,40],'09':[48,49,50,51,52,53,54]},
 'nanbukstyle-hist-20260915-':{'02-05':[40,41],'06':[1,2,3,4,6,8,9,10,11,12,13,14,15,21,22,24,25,26,27,28,29,30,31,32,34,35,38,42,43,44,45,52],'07':[19,20,33,36,37,39],'08':[16,17,18,23,53],'09':[5,7,46,47,48,49,50,51]}
};
const examLecture=new Map();for(const [prefix,byLecture]of Object.entries(EXAM_PLACEMENT))for(const [lecture,nums]of Object.entries(byLecture))for(const n of nums){const id=prefix+String(n).padStart(3,'0');assert(!examLecture.has(id),'Exam question placed twice: '+id);examLecture.set(id,lecture);}
const GORYEO_EXAM_BY_SECTION={'고려 초기 정치':'10','고려 문벌 사회':'11','고려 무신 정권':'11','고려 대외 관계':'12','고려 후기 사회 변동':'12','고려의 멸망':'12'};
const LECTURE_0708=/^(?:lecture-hist-20260911-|heritage-hist-20260912-|photo-hist-20260912-)/;
const LECTURE_09=/^culture-hist-20260912-/,LECTURE_10=/^goryeo-hist-20260912-/,LECTURE_11=/^goryeomid-hist-20260914-/,LECTURE_12=/^goryeoforeign-hist-20260914-/,LECTURE_GORYEO_EXAM=/^goryeostyle-hist-20260915-/,LECTURE_ANCIENT_EXAM=/^ancientstyle-hist-20260915-/,LECTURE_NANBUK_EXAM=/^nanbukstyle-hist-20260915-/,LECTURE_13=/^goryeoecon-hist-20260915-/,LECTURE_14=/^goryeoculture-hist-20260915-/;
function lecture0708(id){const source=cards.get(id).source;return /^08강 고대\(문화 1\)/.test(source)?'08':/^07강 고대\(경제, 사회\)/.test(source)?'07':'출처 표기 없음';}
for(const [id,q]of Object.entries(catalog.questions)){
 const expected=LECTURE_14.test(id)?'14':LECTURE_13.test(id)?'13':(LECTURE_ANCIENT_EXAM.test(id)||LECTURE_NANBUK_EXAM.test(id))?examLecture.get(id):LECTURE_GORYEO_EXAM.test(id)?GORYEO_EXAM_BY_SECTION[q.section]:LECTURE_12.test(id)?'12':LECTURE_11.test(id)?'11':LECTURE_10.test(id)?'10':LECTURE_09.test(id)?'09':LECTURE_0708.test(id)?lecture0708(id):['통일 신라','발해','후삼국'].includes(q.section)?'06':'02-05';
 assert.equal(inLecture.get(id),expected,'Lecture by section: '+id);
}
// 07·08강: 기존 73문항은 출처 표기로 29·44로 나뉜다.
const ids0708=Object.keys(catalog.questions).filter(id=>LECTURE_0708.test(id));assert.equal(ids0708.length,73);
assert.equal(ids0708.filter(id=>inLecture.get(id)==='07').length,29,'07강 사실형 문항 수');assert.equal(ids0708.filter(id=>inLecture.get(id)==='08').length,44,'08강 사실형 문항 수');
assert(ids0708.every(id=>catalog.questions[id].number>225),'New questions continue after the earlier catalog numbers');
assert(catalog.sets.filter(s=>s.title.startsWith('07·08강 고대 경제·사회·문화')).length===7);
assert.deepEqual(lectures.map(l=>l.ids.length),[209,116,36,52,48,60,116,167,60,43],'강별 문항 수(기출형 포함)');
// 강 안에서는 사실형 문항 뒤에 기출형이 모인다(번호가 그렇게 이어져 있다). 13·14강은 처음부터 섞여 있어 제외한다.
for(const l of lectures.filter(l=>!['13','14'].includes(l.id))){const exam=l.ids.map(id=>/style-hist-20260915-/.test(id)),first=exam.indexOf(true);if(first>=0)assert(exam.slice(first).every(Boolean),'기출형은 강의 끝에 모인다: '+l.id);}
const ids09=Object.keys(catalog.questions).filter(id=>LECTURE_09.test(id));assert.equal(ids09.length,33,'09강 사실형 문항 수');
const ids10=Object.keys(catalog.questions).filter(id=>LECTURE_10.test(id));assert.equal(ids10.length,52,'10강 사실형 문항 수');
assert([...ids09,...ids10].every(id=>catalog.questions[id].number>320),'09·10강 문항은 기존 catalog 번호 뒤에 이어진다');
// 11강(122~123쪽)은 교재 면의 사실 83개를 모두 덮는 103문제다. 번호는 10강 마지막(405번) 뒤에 이어진다.
const ids11=Object.keys(catalog.questions).filter(id=>LECTURE_11.test(id));assert.equal(ids11.length,103,'11강 사실형 문항 수');
assert(ids11.every(id=>catalog.questions[id].number>405),'11강 문항은 기존 catalog 번호 뒤에 이어진다');
// 12강(134~135쪽)은 교재 면의 사실 95개(판독 불확실 1개 제외)를 덮는 140문제다. 번호는 11강 마지막(508번) 뒤에 이어진다.
const ids12=Object.keys(catalog.questions).filter(id=>LECTURE_12.test(id));assert.equal(ids12.length,140,'12강 사실형 문항 수');
assert(ids12.every(id=>catalog.questions[id].number>508),'12강 문항은 기존 catalog 번호 뒤에 이어진다');
// 고려 기출형 48문항은 10강 8 · 11강 13 · 12강 27로 들어가고, 번호는 649~696 그대로다.
const idsExam=Object.keys(catalog.questions).filter(id=>LECTURE_GORYEO_EXAM.test(id));assert.equal(idsExam.length,48,'고려 기출형 문항 수');
assert.deepEqual(['10','11','12'].map(l=>idsExam.filter(id=>inLecture.get(id)===l).length),[8,13,27],'고려 기출형 강별 배정');
assert.deepEqual(idsExam.map(id=>catalog.questions[id].number),Array.from({length:48},(_,i)=>649+i),'고려 기출형 번호는 649~696');
assert.deepEqual(idsExam,Array.from({length:48},(_,i)=>'goryeostyle-hist-20260915-'+String(i+1).padStart(3,'0')));
const idsAncientExam=Object.keys(catalog.questions).filter(id=>LECTURE_ANCIENT_EXAM.test(id)),idsNanbukExam=Object.keys(catalog.questions).filter(id=>LECTURE_NANBUK_EXAM.test(id));
assert.equal(idsAncientExam.length,55,'선사~삼국·가야 기출형 문항 수');assert.equal(idsNanbukExam.length,53,'통일 신라·발해·후삼국 기출형 문항 수');
assert.equal(examLecture.size,108,'고대 기출형 108문항이 모두 배정표에 있다');
assert.deepEqual(idsAncientExam.map(id=>catalog.questions[id].number),Array.from({length:55},(_,i)=>697+i),'선사~삼국·가야 기출형 번호는 697~751');
assert.deepEqual(idsNanbukExam.map(id=>catalog.questions[id].number),Array.from({length:53},(_,i)=>752+i),'통일 신라·발해·후삼국 기출형 번호는 752~804');
assert.deepEqual(idsAncientExam,Array.from({length:55},(_,i)=>'ancientstyle-hist-20260915-'+String(i+1).padStart(3,'0')));
assert.deepEqual(idsNanbukExam,Array.from({length:53},(_,i)=>'nanbukstyle-hist-20260915-'+String(i+1).padStart(3,'0')));
// 선사~삼국·가야 쪽은 02~05강 주제의 열한 단원에만, 통일 신라·발해·후삼국 쪽은 06강 세 단원·헷갈리는 내용 비교·통일 과정(백제·신라·통일)에만 들어가고, 각 단원을 모두 쓴다. 고려 단원이 섞이면 안 된다.
const SECTIONS_ANCIENT_EXAM=['선사','선사 시대 · 기본','고조선·여러 나라','고조선·여러 나라 · 기본','고구려·가야','고구려·가야 · 기본','백제·신라·통일','백제·신라 · 기본','백제','신라','삼국 공통·비교'];
const SECTIONS_NANBUK_EXAM=['통일 신라','발해','후삼국','헷갈리는 내용 비교','백제·신라·통일'];
for(const id of idsAncientExam)assert(SECTIONS_ANCIENT_EXAM.includes(catalog.questions[id].section),'선사~삼국·가야 기출형 question outside its sections: '+id);
for(const id of idsNanbukExam)assert(SECTIONS_NANBUK_EXAM.includes(catalog.questions[id].section),'통일 신라·발해·후삼국 기출형 question outside its sections: '+id);
assert.deepEqual([...new Set(idsAncientExam.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_ANCIENT_EXAM].sort(),'선사~삼국·가야 기출형 covers all eleven sections');
assert.deepEqual([...new Set(idsNanbukExam.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_NANBUK_EXAM].sort(),'통일 신라·발해·후삼국 기출형 covers all five sections');
// 13강(147쪽)은 교재 면의 사실 50개를 모두 덮는 60문제(사실 확인형과 자료 제시 기출형 약 절반씩)다. 번호는 805~864.
const ids13=Object.keys(catalog.questions).filter(id=>LECTURE_13.test(id));assert.equal(ids13.length,60,'13강 문항 수');
{const l13=lectures.find(l=>l.id==='13');assert.equal(lectures.indexOf(l13),lectures.findIndex(l=>l.id==='12')+1,'13강은 12강 바로 다음');assert.equal(l13.title,'13강 고려(경제, 사회)');assert.deepEqual(l13.ids,ids13);}
assert.deepEqual(ids13.map(id=>catalog.questions[id].number),Array.from({length:60},(_,i)=>805+i),'13강 번호는 805~864');
assert.deepEqual(ids13,Array.from({length:60},(_,i)=>'goryeoecon-hist-20260915-'+String(i+1).padStart(3,'0')));
// 13강은 고려 주제의 두 새 단원(경제·사회)에만 들어가고, 두 단원을 모두 쓴다.
const SECTIONS_13=['고려 경제','고려 사회'];
for(const id of ids13)assert(SECTIONS_13.includes(catalog.questions[id].section),'13강 question outside the 13강 고려 sections: '+id);
assert.deepEqual([...new Set(ids13.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_13].sort(),'13강 covers both columns');
// 14강(159쪽)은 교재 면의 사실 45개를 모두 덮는 43문제로, 사용자 지시에 따라 전 문제를 한능검 기출형(자료 제시)으로 냈다. 강 목록 맨 끝에 오고, 번호는 13강 마지막(864번) 뒤에 이어진다.
const ids14=Object.keys(catalog.questions).filter(id=>LECTURE_14.test(id));assert.equal(ids14.length,43,'14강 문항 수');
assert.equal(lectures.at(-1).id,'14','14강은 강 목록 맨 끝');assert.equal(lectures.at(-1).title,'14강 고려(문화 I)');assert.deepEqual(lectures.at(-1).ids,ids14);
assert.deepEqual(ids14.map(id=>catalog.questions[id].number),Array.from({length:43},(_,i)=>865+i),'14강 번호는 865~907');
assert.deepEqual(ids14,Array.from({length:43},(_,i)=>'goryeoculture-hist-20260915-'+String(i+1).padStart(3,'0')));
for(const id of ids14)assert.equal(catalog.questions[id].section,'고려 문화','14강 question outside the 고려 문화 section: '+id);
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
assert.deepEqual(Array.from(topics.list.find(t=>t.id==='goryeo').sections),['고려 초기 정치','고려 문벌 사회','고려 무신 정권','고려 대외 관계','고려 후기 사회 변동','고려의 멸망','고려 경제','고려 사회','고려 문화'],'고려 topic holds the 10강~14강 section names in lecture order');
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
