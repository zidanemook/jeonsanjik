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
for(const card of cards.values())if(/^(?:joseonecosoc-hist-20260923-|joseonforeign-hist-20260921-|joseonorg-hist-20260921-|joseon(?:early|photo)-hist-20260919-|(?:study|summary)-hist-20260910-|summary-hist-20260911-|lecture-hist-20260911-|summary-hist-20260912-|(?:heritage|daily|photo|culture|goryeo)-hist-20260912-|goryeomid-hist-20260914-|goryeoforeign-hist-20260914-|goryeostyle-hist-20260915-|ancientstyle-hist-20260915-|nanbukstyle-hist-20260915-|goryeoecon-hist-20260915-|goryeoculture-hist-20260915-|goryeoculture2-hist-20260916-|typefill-hist-20260916-)/.test(card.id))assert(ids.has(card.id),'Summary question excluded from scope: '+card.id);
// Textbook lecture ranges: every summary question sits in exactly one lecture, in catalog order.
// 2026-09-16 사용자 지시: 따로 떠 있던 기출형 연습 범위 셋(선사~삼국·가야 / 통일 신라·발해·후삼국 / 고려)을 없애고 문제마다 실제 소속 강에 넣는다. 07·08강 덩어리도 둘로 나눈다.
const lectures=JSON.parse(JSON.stringify(catalog.lectures)),inLecture=new Map();
assert.deepEqual(lectures.map(l=>l.id),['02-05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','250','252-256']);
assert.deepEqual(lectures.map(l=>l.title),['02~05강 선사 시대~삼국 통일','06강 통일 신라·발해·후삼국','07강 고대(경제, 사회)','08강 고대(문화 1)','09강 고대(문화 2)','10강 고려(초기 정치)','11강 고려(중기 정치~무신 정변)','12강 고려(외교)','13강 고려(경제, 사회)','14강 고려(문화 I)','15강 고려(문화 2)','16강 조선 전기(정치)','17강 조선(조직)','18강 조선 전기(외교)','19강 조선 전기(경제, 사회)','20강 조선 전기(문화 I)','21강 조선 전기(문화 II)','22강 조선 후기(정치)','23강 조선 후기(조직, 외교)','24강 조선 후기(경제)','25강 조선 후기(사회)','특강 세시 풍속','특강 근·현대 인물']);
for(const l of lectures){assert(l.ids.length>0,'Empty lecture '+l.id);for(const id of l.ids){assert(!inLecture.has(id),'Question in two lectures: '+id);assert(catalog.questions[id],'Unknown lecture question: '+id);inLecture.set(id,l.id);}const numbers=l.ids.map(id=>catalog.questions[id].number);assert.deepEqual(numbers,[...numbers].sort((a,b)=>a-b),'Lecture keeps catalog order: '+l.id);}
assert.equal(inLecture.size,catalog.total);
// 고대 기출형 108문항의 소속 강. 정답 사실과 대상을 알아내는 핵심 단서가 교재 어느 강에서 나오는지로 정했고, 둘이 다르면 뒤 강이다.
// 판정 근거는 research/lecture-merge-20260916/placement.json. 고려 기출형 48문항은 단원이 강과 1:1이라 단원으로 정한다.
const EXAM_PLACEMENT={
 'ancientstyle-hist-20260915-':{'02-05':[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,24,25,26,27,28,30,31,32,33,34,35,36,37,38,39,41,42,43,44,45,46,47,55],'07':[23],'08':[22,29,40],'09':[48,49,50,51,52,53,54]},
 'nanbukstyle-hist-20260915-':{'02-05':[40,41],'06':[1,2,3,4,6,8,9,10,11,12,13,14,15,21,22,24,25,26,27,28,29,30,31,32,34,35,38,42,43,44,45,52],'07':[19,20,33,36,37,39],'08':[16,17,18,23,53],'09':[5,7,46,47,48,49,50,51]}
};
// 기출 유형 보강 87문항(사료·연표 칸·이후/배경/영향·순서·지역사·부정 발문, 2026-09-16)도 같은 원칙으로 강에 넣는다. 근거는 research/empty-types-20260916/final.jsonl의 lecture.
EXAM_PLACEMENT['typefill-hist-20260916-']={"10":[28,41,49,68,69,78],"11":[31,34,36,42,60,61,70,80,81],"12":[23,24,25,26,27,29,30,32,33,35,37,38,39,40,43,44,54,58,62,63],"13":[45,47,48,59,71,74,85,86],"14":[46,55,56,57,73,83,84],"02-05":[1,2,4,5,9,10,11,12,16,18,66],"07":[3,52,72,82],"06":[6,7,8,13,14,15,17,19,20,53,79],"08":[21,50,51,65,75],"09":[22,64,67,76,77,87]};
const examLecture=new Map();for(const [prefix,byLecture]of Object.entries(EXAM_PLACEMENT))for(const [lecture,nums]of Object.entries(byLecture))for(const n of nums){const id=prefix+String(n).padStart(3,'0');assert(!examLecture.has(id),'Exam question placed twice: '+id);examLecture.set(id,lecture);}
const GORYEO_EXAM_BY_SECTION={'고려 초기 정치':'10','고려 문벌 사회':'11','고려 무신 정권':'11','고려 대외 관계':'12','고려 후기 사회 변동':'12','고려의 멸망':'12'};
const LECTURE_0708=/^(?:lecture-hist-20260911-|heritage-hist-20260912-|photo-hist-20260912-)/;
const LECTURE_09=/^culture-hist-20260912-/,LECTURE_10=/^goryeo-hist-20260912-/,LECTURE_11=/^goryeomid-hist-20260914-/,LECTURE_12=/^goryeoforeign-hist-20260914-/,LECTURE_GORYEO_EXAM=/^goryeostyle-hist-20260915-/,LECTURE_ANCIENT_EXAM=/^ancientstyle-hist-20260915-/,LECTURE_NANBUK_EXAM=/^nanbukstyle-hist-20260915-/,LECTURE_13=/^goryeoecon-hist-20260915-/,LECTURE_14=/^goryeoculture-hist-20260915-/,LECTURE_15=/^goryeoculture2-hist-20260916-/,LECTURE_16=/^joseon(?:early|photo)-hist-20260919-/,LECTURE_17=/^joseonorg-hist-20260921-/,LECTURE_18=/^joseonforeign-hist-20260921-/,LECTURE_19=/^joseonecosoc-hist-20260923-/,LECTURE_20=/^joseonculture1-hist-20260923-/,LECTURE_20_HYANG=/^hyang-hist-20260924-/,LECTURE_21=/^joseonculture2-hist-20260924-/,LECTURE_SPECIAL=/^special-hist-20260924-/,LECTURE_22=/^joseonlate1-hist-20260927-/,LECTURE_23=/^joseonlate2-hist-20260928-/,LECTURE_24=/^joseonlate3-hist-20260928-/,LECTURE_25=/^joseonlate4-hist-20260928-/;
function lecture0708(id){const source=cards.get(id).source;return /^08강 고대\(문화 1\)/.test(source)?'08':/^07강 고대\(경제, 사회\)/.test(source)?'07':'출처 표기 없음';}
for(const [id,q]of Object.entries(catalog.questions)){
 const expected=/^typefill-hist-20260916-/.test(id)?examLecture.get(id):LECTURE_SPECIAL.test(id)?(+id.slice(-3)<=134?'250':'252-256'):LECTURE_25.test(id)?'25':LECTURE_24.test(id)?'24':LECTURE_23.test(id)?'23':LECTURE_22.test(id)?'22':LECTURE_21.test(id)?'21':(LECTURE_20.test(id)||LECTURE_20_HYANG.test(id))?'20':LECTURE_19.test(id)?'19':LECTURE_18.test(id)?'18':LECTURE_17.test(id)?'17':LECTURE_16.test(id)?'16':LECTURE_15.test(id)?'15':LECTURE_14.test(id)?'14':LECTURE_13.test(id)?'13':(LECTURE_ANCIENT_EXAM.test(id)||LECTURE_NANBUK_EXAM.test(id))?examLecture.get(id):LECTURE_GORYEO_EXAM.test(id)?GORYEO_EXAM_BY_SECTION[q.section]:LECTURE_12.test(id)?'12':LECTURE_11.test(id)?'11':LECTURE_10.test(id)?'10':LECTURE_09.test(id)?'09':LECTURE_0708.test(id)?lecture0708(id):['통일 신라','발해','후삼국'].includes(q.section)?'06':'02-05';
 assert.equal(inLecture.get(id),expected,'Lecture by section: '+id);
}
// 07·08강: 기존 73문항은 출처 표기로 29·44로 나뉜다.
const ids0708=Object.keys(catalog.questions).filter(id=>LECTURE_0708.test(id));assert.equal(ids0708.length,73);
assert.equal(ids0708.filter(id=>inLecture.get(id)==='07').length,29,'07강 사실형 문항 수');assert.equal(ids0708.filter(id=>inLecture.get(id)==='08').length,44,'08강 사실형 문항 수');
assert(ids0708.every(id=>catalog.questions[id].number>225),'New questions continue after the earlier catalog numbers');
assert(catalog.sets.filter(s=>s.title.startsWith('07·08강 고대 경제·사회·문화')).length===7);
assert.deepEqual(lectures.map(l=>l.ids.length),[220,127,40,57,54,66,125,187,68,50,63,88,78,83,115,108,94,20,20,20,20,134,418],'강별 문항 수(기출형·유형 보강 포함)');
// 강 안에서는 사실형 문항 뒤에 기출형이 모인다(번호가 그렇게 이어져 있다). 13·14강은 처음부터 섞여 있어 제외한다.
for(const l of lectures.filter(l=>!['13','14','15','16','17','18','19','20','21','22','23','24','25','250','252-256'].includes(l.id))){const exam=l.ids.map(id=>/style-hist-20260915-|typefill-hist-20260916-/.test(id)),first=exam.indexOf(true);if(first>=0)assert(exam.slice(first).every(Boolean),'기출형은 강의 끝에 모인다: '+l.id);}
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
assert.equal(examLecture.size,108+87,'고대 기출형 108문항과 유형 보강 87문항이 모두 배정표에 있다');
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
{const l13=lectures.find(l=>l.id==='13');assert.equal(lectures.indexOf(l13),lectures.findIndex(l=>l.id==='12')+1,'13강은 12강 바로 다음');assert.equal(l13.title,'13강 고려(경제, 사회)');assert.deepEqual(l13.ids.filter(id=>!id.startsWith('typefill-')),ids13);}
assert.deepEqual(ids13.map(id=>catalog.questions[id].number),Array.from({length:60},(_,i)=>805+i),'13강 번호는 805~864');
assert.deepEqual(ids13,Array.from({length:60},(_,i)=>'goryeoecon-hist-20260915-'+String(i+1).padStart(3,'0')));
// 13강은 고려 주제의 두 새 단원(경제·사회)에만 들어가고, 두 단원을 모두 쓴다.
const SECTIONS_13=['고려 경제','고려 사회'];
for(const id of ids13)assert(SECTIONS_13.includes(catalog.questions[id].section),'13강 question outside the 13강 고려 sections: '+id);
assert.deepEqual([...new Set(ids13.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_13].sort(),'13강 covers both columns');
// 14강(159쪽)은 교재 면의 사실 45개를 모두 덮는 43문제로, 사용자 지시에 따라 전 문제를 한능검 기출형(자료 제시)으로 냈다. 강 목록 맨 끝에 오고, 번호는 13강 마지막(864번) 뒤에 이어진다.
const ids14=Object.keys(catalog.questions).filter(id=>LECTURE_14.test(id));assert.equal(ids14.length,43,'14강 문항 수');
{const l14=lectures.find(l=>l.id==='14');assert.equal(lectures.indexOf(l14),lectures.findIndex(l=>l.id==='13')+1,'14강은 13강 바로 다음');assert.equal(l14.title,'14강 고려(문화 I)');assert.deepEqual(l14.ids.filter(id=>!id.startsWith('typefill-')),ids14);}
assert.deepEqual(ids14.map(id=>catalog.questions[id].number),Array.from({length:43},(_,i)=>865+i),'14강 번호는 865~907');
assert.deepEqual(ids14,Array.from({length:43},(_,i)=>'goryeoculture-hist-20260915-'+String(i+1).padStart(3,'0')));
for(const id of ids14)assert.equal(catalog.questions[id].section,'고려 문화','14강 question outside the 고려 문화 section: '+id);
// 15강(170~171쪽)은 교재 면의 사실 49개를 모두 덮는 63문제(사실 확인형과 자료 제시 기출형, 기출형이 절반 넘게, 문화유산 사진 보기 포함)다. 강 목록 맨 끝에 오고, 번호는 유형 보강 마지막(994번) 뒤에 이어진다.
const ids15=Object.keys(catalog.questions).filter(id=>LECTURE_15.test(id));assert.equal(ids15.length,63,'15강 문항 수');
{const l15=lectures.find(l=>l.id==='15');assert.equal(l15.title,'15강 고려(문화 2)');assert.deepEqual(l15.ids,ids15);}
assert.deepEqual(ids15.map(id=>catalog.questions[id].number),Array.from({length:63},(_,i)=>995+i),'15강 번호는 995~1057');
assert.deepEqual(ids15,Array.from({length:63},(_,i)=>'goryeoculture2-hist-20260916-'+String(i+1).padStart(3,'0')));
for(const id of ids15)assert.equal(catalog.questions[id].section,'고려 문화','15강 question outside the 고려 문화 section: '+id);
assert.equal(catalog.sets.filter(s=>s.title.startsWith('15강 고려(문화 2)')).length,8);
// 15강 사진 보기: 보기마다 저장소 사진 한 장과 출처표시가 있고, 대체 텍스트에 이름이 없다(라이선스 문구 검사는 content-audit.cjs).
{const photo15=ids15.filter(id=>ctx.QUIZ_OPTIONS[id].choiceImages);assert(photo15.length>=15,'15강 사진 보기 문항 수: '+photo15.length);
 for(const id of photo15){const o=ctx.QUIZ_OPTIONS[id];assert.equal(Object.keys(o.choiceImages).length,o.choices.length,'Every option needs a photo: '+id);assert(!o.fixedOrder,'Photo options must still shuffle: '+id);
  for(const name of o.choices){const meta=o.choiceImages[name];assert(fs.existsSync(__dirname+'/'+meta.src),'Missing photo file: '+meta.src);assert(/공공누리 제1유형|위키미디어 공용/.test(meta.credit),'Photo option without its attribution: '+name);assert(!meta.alt.includes(name),'Alt text must not name the option: '+name);}}}
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
// 16강(183쪽)은 교재 한 면의 사실 78개를 덮는 88문제(사실형 37 · 자료 제시 기출형 43 · 사진 고르기 8)다. 조선이 처음 들어온 강이다.
const ids16=Object.keys(catalog.questions).filter(id=>LECTURE_16.test(id));assert.equal(ids16.length,88,'16강 문항 수');
assert.deepEqual(ids16,[...Array.from({length:80},(_,i)=>'joseonearly-hist-20260919-'+String(i+1).padStart(3,'0')),...Array.from({length:8},(_,i)=>'joseonphoto-hist-20260919-'+String(i+1).padStart(3,'0'))]);
assert.deepEqual(ids16.map(id=>catalog.questions[id].number),Array.from({length:88},(_,i)=>1058+i),'16강 번호는 1058~1145');
{const l16=lectures.find(l=>l.id==='16');assert.equal(l16.title,'16강 조선 전기(정치)');assert.deepEqual(Array.from(l16.ids),ids16,'16강 범위는 이 강의 문항만');}
const SECTIONS_16=['조선 건국·통치 기반','사림과 사화','붕당의 형성'];
for(const id of ids16)assert(SECTIONS_16.includes(catalog.questions[id].section),'16강 question outside the 조선 전기 sections: '+id);
assert.deepEqual([...new Set(ids16.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_16].sort(),'16강 covers all three 조선 전기 sections');
assert.deepEqual(Array.from(topics.list.find(t=>t.id==='joseon-early').sections).slice(0,3),SECTIONS_16,'조선 전기 topic holds the 16강 section names first');
assert.equal(catalog.sets.filter(s=>s.title.startsWith('16강 조선 전기(정치)')).length,11);
// 16강 사진 고르기 8문항: 네 보기가 모두 사진이고 오답 사진은 다른 나라·다른 시대(고구려·신라·고려)에서 왔다.
{const photo16=ids16.filter(id=>ctx.QUIZ_OPTIONS[id].choiceImages);assert.equal(photo16.length,8,'16강 사진 보기 문항 수: '+photo16.length);
 for(const id of photo16){const o=ctx.QUIZ_OPTIONS[id];assert.equal(Object.keys(o.choiceImages).length,o.choices.length,'Every option needs a photo: '+id);assert(!o.fixedOrder,'Photo options must still shuffle: '+id);
  const srcs=new Set();for(const name of o.choices){const meta=o.choiceImages[name];assert(fs.existsSync(__dirname+'/'+meta.src),'Missing photo file: '+meta.src);assert(!srcs.has(meta.src),'Two options share one photo: '+meta.src);srcs.add(meta.src);
   assert(/공공누리 제1유형|위키미디어 공용/.test(meta.credit),'Photo option without its attribution: '+name);assert(!meta.alt.includes(name),'Alt text must not name the option: '+name);}
  assert(['경복궁','종묘','창덕궁'].includes(o.choices[o.correctIndex]),'16강 사진 문항의 정답은 조선 전기 건축: '+id);
  for(const name of o.choices.filter((_,i)=>i!==o.correctIndex))assert(!['경복궁','종묘','창덕궁','서울 원각사지 10층 석탑','보은 법주사 팔상전','구례 화엄사 각황전','김제 금산사 미륵전','합천 해인사 장경판전','팔만대장경판','백자 달항아리','백자 청화매조죽문 유개항아리','분청사기 박지철채모란문 자라병','몽유도원도','인왕제색도','김홍도 씨름'].includes(name),'오답 사진은 다른 나라·다른 시대에서: '+name);}}
// 17강(184~185쪽 조선(조직))은 두 면의 사실 94개를 덮는 78문제(사실형 39 · 자료 제시형 39)다. 기구를 기능·별칭·으뜸 관직으로 가르는 문제가 중심이다.
const ids17=Object.keys(catalog.questions).filter(id=>LECTURE_17.test(id));assert.equal(ids17.length,78,'17강 문항 수');
assert.deepEqual(ids17,Array.from({length:78},(_,i)=>'joseonorg-hist-20260921-'+String(i+1).padStart(3,'0')));
assert.deepEqual(ids17.map(id=>catalog.questions[id].number),Array.from({length:78},(_,i)=>1146+i),'17강 번호는 1146~1223');
{const l17=lectures.find(l=>l.id==='17');assert.equal(l17.title,'17강 조선(조직)');assert.deepEqual(Array.from(l17.ids),ids17,'17강 범위는 이 강의 문항만');}
const SECTIONS_17=['조선 중앙 정치 조직','조선 지방 행정 조직','조선 관리 선발 방식','조선 군사 조직'];
for(const id of ids17)assert(SECTIONS_17.includes(catalog.questions[id].section),'17강 question outside the 조선(조직) sections: '+id);
assert.deepEqual([...new Set(ids17.map(id=>catalog.questions[id].section))],SECTIONS_17,'17강 covers all four blocks in page order');
assert.deepEqual(Array.from(topics.list.find(t=>t.id==='joseon-early').sections).slice(0,7),[...SECTIONS_16,...SECTIONS_17],'조선 전기 topic holds the 16강 then 17강 section names first');
assert.equal(catalog.sets.filter(s=>s.title.startsWith('17강 조선(조직)')).length,10);
// 자료 제시형은 발문 뒤 빈 줄과 [자료 이름] 한 줄로 시작하고, 사실형은 절반을 넘지 않는다.
{const material=ids17.filter(id=>cards.get(id).question.includes('\n'));for(const id of material)assert(cards.get(id).question.includes('\n\n['),'Material format: '+id);assert(material.length*2>=ids17.length,'17강 자료 제시형이 절반 이상: '+material.length);}
// 18강(206~207쪽 조선 전기(외교))은 두 면의 사실 79개를 덮는 83문제(사실형 41 · 자료 제시형 42)다. 전투·인물·약조를 사람·장소·결과로 가르는 문제가 중심이다.
// 206쪽 조선 초기 대외 관계는 조선 전기 주제에, 임진왜란·광해군·호란은 기출 분류(hanneung-topics.js)와 같이 조선 후기(양난~) 주제에 둔다.
const ids18=Object.keys(catalog.questions).filter(id=>LECTURE_18.test(id));assert.equal(ids18.length,83,'18강 문항 수');
assert.deepEqual(ids18,Array.from({length:83},(_,i)=>'joseonforeign-hist-20260921-'+String(i+1).padStart(3,'0')));
assert.deepEqual(ids18.map(id=>catalog.questions[id].number),Array.from({length:83},(_,i)=>1224+i),'18강 번호는 1224~1306');
{const l18=lectures.find(l=>l.id==='18');assert.equal(l18.title,'18강 조선 전기(외교)');assert.deepEqual(Array.from(l18.ids),ids18,'18강 범위는 이 강의 문항만');}
const SECTIONS_18=['조선 초기 대외 관계','임진왜란의 전개','광해군의 정책','호란의 전개'];
for(const id of ids18)assert(SECTIONS_18.includes(catalog.questions[id].section),'18강 question outside the 조선 전기(외교) sections: '+id);
assert.deepEqual([...new Set(ids18.map(id=>catalog.questions[id].section))],SECTIONS_18,'18강 covers all four blocks in page order');
assert.deepEqual(Array.from(topics.list.find(t=>t.id==='joseon-early').sections).slice(0,8),[...SECTIONS_16,...SECTIONS_17,SECTIONS_18[0]],'조선 전기 topic holds 16강·17강 sections then 18강 조선 초기 대외 관계');
const SECTIONS_22=['붕당 정치의 전개','예송','환국','영조의 탕평 정치','정조의 탕평 정치','세도 정치'];
const SECTIONS_23=['비변사의 변화','조선 후기 군사 제도','북벌과 나선 정벌','북학론','백두산정계비와 간도','일본과의 관계 회복','독도'];
const SECTIONS_24=['조선 후기 수취 체제','조선 후기 농촌 경제','사상과 장시·포구 상업','조선 후기 대외 무역','화폐 경제의 발달','조선 후기 수공업과 광업'];
const SECTIONS_25=['조선 후기 신분제의 동요','서얼과 중인의 신분 상승','노비의 신분 상승','조선 후기 향촌 질서','예언 사상의 유행','천주교의 전파와 박해','동학의 창시','19세기 농민 봉기'];
assert.deepEqual(Array.from(topics.list.find(t=>t.id==='joseon-late').sections),[...SECTIONS_18.slice(1),...SECTIONS_22,...SECTIONS_23,...SECTIONS_24,...SECTIONS_25],'조선 후기 topic starts with 18강 임진왜란·광해군·호란, then 22강 정치, then 23강 조직·외교, then 24강 경제, then 25강 사회');
assert.equal(catalog.sets.filter(s=>s.title.startsWith('18강 조선 전기(외교)')).length,11);
{const material=ids18.filter(id=>cards.get(id).question.includes('\n'));for(const id of material)assert(cards.get(id).question.includes('\n\n['),'Material format: '+id);assert(material.length*2>=ids18.length,'18강 자료 제시형이 절반 이상: '+material.length);
 // 순서 배열 보기에는 연도가 없다(연도로 줄 세우면 지식 없이 풀린다).
 for(const id of ids18){const o=ctx.QUIZ_OPTIONS[id];for(const c of o.choices)assert(!/\d{3,4}\s*년|\b1[0-9]{3}\b/.test(c),'18강 보기에 연도: '+id);}}
// 19강(218~219쪽 요약 '한국사를 읽다' + 212~217쪽 자료 '한국사를 보다' 조선 전기(경제, 사회))은 사실 111개(요약 면 65 · 자료 면에만 46)를 덮는 115문제(사실형 57 · 자료 제시형 58)다.
// 과전법·직전법·관수관급제·직전법 폐지, 공법, 16세기 수취 문란, 신분제, 향촌 사회(유향소·경재소·향약)를 대상·시기·역할로 가른다. 네 단원 모두 기출 분류대로 조선 전기 주제 끝에 둔다.
const ids19=Object.keys(catalog.questions).filter(id=>LECTURE_19.test(id));assert.equal(ids19.length,115,'19강 문항 수');
assert.deepEqual(ids19,Array.from({length:115},(_,i)=>'joseonecosoc-hist-20260923-'+String(i+1).padStart(3,'0')));
assert.deepEqual(ids19.map(id=>catalog.questions[id].number),Array.from({length:115},(_,i)=>1307+i),'19강 번호는 1307~1421');
{const l19=lectures.find(l=>l.id==='19');assert.equal(l19.title,'19강 조선 전기(경제, 사회)');assert.deepEqual(Array.from(l19.ids),ids19,'19강 범위는 이 강의 문항만');}
const SECTIONS_19=['조선 전기 토지 제도','조선 전기 수취 체제','조선 전기 신분 제도','조선 전기 사회 제도와 법률'];
const SECTIONS_20=['조선 전기 교육 기관','조선 전기 성리학의 발달','조선 전기 불교와 도교','조선 전기 편찬 사업'];
const SECTIONS_21=['조선 전기 과학 기술','조선 전기 훈민정음','조선 전기 건축','조선 전기 공예·그림·문학'];
for(const id of ids19)assert(SECTIONS_19.includes(catalog.questions[id].section),'19강 question outside the 조선 전기(경제, 사회) sections: '+id);
assert.deepEqual([...new Set(ids19.map(id=>catalog.questions[id].section))],SECTIONS_19,'19강 covers all four blocks in page order');
assert.deepEqual(Array.from(topics.list.find(t=>t.id==='joseon-early').sections),[...SECTIONS_16,...SECTIONS_17,SECTIONS_18[0],...SECTIONS_19,...SECTIONS_20,...SECTIONS_21],'조선 전기 topic ends with 19강 경제·사회 then 20강·21강 문화 sections');
assert.equal(catalog.sets.filter(s=>s.title.startsWith('19강 조선 전기(경제, 사회)')).length,15);
{const material=ids19.filter(id=>cards.get(id).question.includes('\n'));for(const id of material)assert(cards.get(id).question.includes('\n\n['),'Material format: '+id);assert(material.length*2>=ids19.length,'19강 자료 제시형이 절반 이상: '+material.length);
 for(const id of ids19){const o=ctx.QUIZ_OPTIONS[id];assert.equal(o.correctIndex,0);assert.equal(cards.get(id).answer,o.choices[0]);for(const c of o.choices)assert(!/\d{3,4}\s*년|\b1[0-9]{3}\b/.test(c),'19강 보기에 연도: '+id);}
 // 해설에 한자를 단독으로 쓰지 않는다(한글 뒤 괄호도 쓰지 않았다).
 for(const id of ids19)assert(!/[\u4e00-\u9fff]/.test(cards.get(id).question+cards.get(id).explanation),'19강 한자: '+id);}
// 20강(231쪽 요약 '한국사를 읽다' + 228~230쪽 자료 '한국사를 보다' 조선 전기(문화 I))은 사실 110개(요약 면 76 · 자료 면에만 34)를 덮는 99문제(사실형 42 · 자료 제시형 57)다.
// 교육 기관(성균관·4부 학당·향교·서원·서당), 성리학(이황·이이·학파·붕당), 불교와 도교, 편찬 사업(역사서·지도·지리서·의례·법전·음악)을 위치·지은이·서술 방식·왕으로 가른다. 네 단원 모두 기출 분류대로 조선 전기 주제 끝에 둔다.
const ids20=Object.keys(catalog.questions).filter(id=>LECTURE_20.test(id));assert.equal(ids20.length,99,'20강 문항 수');
// 2026-09-24 보충: 이름이 비슷한 향교·유향소·향약·향도·향리를 가르는 9문제(1521~1529). 향교 쪽은 교육 기관, 나머지는 19강의 사회 제도와 법률 단원.
const ids20h=Object.keys(catalog.questions).filter(id=>LECTURE_20_HYANG.test(id));
assert.deepEqual(ids20h,Array.from({length:9},(_,i)=>'hyang-hist-20260924-'+String(i+1).padStart(3,'0')));
assert.deepEqual(ids20h.map(id=>catalog.questions[id].number),Array.from({length:9},(_,i)=>1521+i),'향 자 비교 번호는 1521~1529');
for(const id of ids20h){assert(['조선 전기 교육 기관','조선 전기 사회 제도와 법률'].includes(catalog.questions[id].section),'향 자 비교 단원: '+id);const o=ctx.QUIZ_OPTIONS[id],e=cards.get(id).explanation;assert.equal(o.correctIndex,0);assert.equal(cards.get(id).answer,o.choices[0]);
 assert(!/[一-鿿]/.test(cards.get(id).question+e),'향 자 비교 한자: '+id);assert(/^정답 근거: [\s\S]+\n\n보기 비교: [\s\S]+\n\n기억 연결: /.test(e),'향 자 비교 해설 세 칸: '+id);
 assert(/향교의 '교' = 학교[\s\S]*유향소의 '소' = 곳[\s\S]*향약의 '약' = 약속[\s\S]*향도의 '도' = 무리/.test(e.split('기억 연결: ')[1]),'향 자 비교 기억 연결에 뒷글자 고리(사용자 채택): '+id);}
assert.deepEqual(ids20,Array.from({length:99},(_,i)=>'joseonculture1-hist-20260923-'+String(i+1).padStart(3,'0')));
assert.deepEqual(ids20.map(id=>catalog.questions[id].number),Array.from({length:99},(_,i)=>1422+i),'20강 번호는 1422~1520');
{const l20=lectures.find(l=>l.id==='20');assert.equal(l20.title,'20강 조선 전기(문화 I)');assert.deepEqual(Array.from(l20.ids),[...ids20,...ids20h],'20강 범위는 이 강의 문항 + 향 자 비교 보충만');}
for(const id of ids20)assert(SECTIONS_20.includes(catalog.questions[id].section),'20강 question outside the 조선 전기(문화 I) sections: '+id);
assert.deepEqual([...new Set(ids20.map(id=>catalog.questions[id].section))],SECTIONS_20,'20강 covers all four blocks in page order');
assert.equal(catalog.sets.filter(s=>s.title.startsWith('20강 조선 전기(문화 I)')).length,15);
{const material=ids20.filter(id=>cards.get(id).question.includes('\n'));for(const id of material)assert(cards.get(id).question.includes('\n\n['),'Material format: '+id);assert(material.length*2>=ids20.length,'20강 자료 제시형이 절반 이상: '+material.length);
 for(const id of ids20){const o=ctx.QUIZ_OPTIONS[id];assert.equal(o.correctIndex,0);assert.equal(cards.get(id).answer,o.choices[0]);for(const c of o.choices)assert(!/\d{3,4}\s*년|\b1[0-9]{3}\b/.test(c),'20강 보기에 연도: '+id);}
 for(const id of ids20)assert(!/[\u4e00-\u9fff]/.test(cards.get(id).question+cards.get(id).explanation),'20강 한자: '+id);
 // 해설 세 칸이 모두 있다. '(○○ 때)'는 그 일이 있었던 재위다(2026-09-23 부모 검토): 조선 내내 이어진 기관·기록·흐름에는 왕 표기를 달지 않으므로
 // '정한 왕 없음'·'조선 내내 운영' 같은 표기는 쓰지 않고, 한 칸 안에서 같은 책의 재위 괄호는 한 번, 실록의 '(왕마다 죽은 뒤 편찬)'은 해설 하나에 한 번까지.
 for(const id of ids20){const e=cards.get(id).explanation;assert(/^정답 근거: [\s\S]+\n\n보기 비교: [\s\S]+\n\n기억 연결: /.test(e),'20강 해설 세 칸: '+id);
  assert(!/정한 왕 없음|조선 내내/.test(e),'20강 해설에 정한 왕 없음·조선 내내 표기 없음: '+id);assert((e.match(/왕마다 죽은 뒤 편찬/g)||[]).length<=1,'20강 실록 표기 한 번: '+id);
  for(const part of e.split('\n\n')){const seen=new Map();for(const m of part.matchAll(/(『[^』]+』)\(([^()]*때[^()]*)\)/g))seen.set(m[1],(seen.get(m[1])||0)+1);for(const [book,n] of seen)assert(n===1,'20강 한 칸에 같은 책 재위 표기 한 번: '+id+' '+book);}}}
// 21강(243쪽 요약 '한국사를 읽다' + 240~242쪽 자료 '한국사를 보다' 조선 전기(문화 II))은 사실 100개를 덮는 94문제(사실형 43 · 자료 제시형 51)다.
// 과학 기술(인쇄술·천문 기구·역법·의학·농서·병서), 훈민정음, 건축(궁궐·종묘·사직단·장경판전·원각사지 10층 석탑·서원), 공예·그림·문학·글씨를 쓰임새·지은이·왕·생김새로 가른다. 네 단원 모두 조선 전기 주제 끝(20강 뒤)에 둔다.
const ids21=Object.keys(catalog.questions).filter(id=>LECTURE_21.test(id));assert.equal(ids21.length,94,'21강 문항 수');
assert.deepEqual(ids21,Array.from({length:94},(_,i)=>'joseonculture2-hist-20260924-'+String(i+1).padStart(3,'0')));
assert.deepEqual(ids21.map(id=>catalog.questions[id].number),Array.from({length:94},(_,i)=>1530+i),'21강 번호는 1530~1623');
{const l21=lectures.find(l=>l.id==='21');assert.equal(l21.title,'21강 조선 전기(문화 II)');assert.deepEqual(Array.from(l21.ids),ids21,'21강 범위는 이 강의 문항만');}
for(const id of ids21)assert(SECTIONS_21.includes(catalog.questions[id].section),'21강 question outside the 조선 전기(문화 II) sections: '+id);
assert.deepEqual([...new Set(ids21.map(id=>catalog.questions[id].section))],SECTIONS_21,'21강 covers all four blocks in page order');
assert.equal(catalog.sets.filter(s=>s.title.startsWith('21강 조선 전기(문화 II)')).length,12);
{const material=ids21.filter(id=>cards.get(id).question.includes('\n'));for(const id of material)assert(cards.get(id).question.includes('\n\n['),'Material format: '+id);assert(material.length*2>=ids21.length,'21강 자료 제시형이 절반 이상: '+material.length);
 for(const id of ids21){const o=ctx.QUIZ_OPTIONS[id];assert.equal(o.correctIndex,0);assert.equal(cards.get(id).answer,o.choices[0]);assert.equal(o.choices.length,4);for(const c of o.choices)assert(!/\d{3,4}\s*년|\b1[0-9]{3}\b|\((태조|태종|세종|문종|세조|성종|중종|명종|선조) 때\)/.test(c),'21강 보기에 연도·왕 표기: '+id);}
 for(const id of ids21)assert(!/[\u4e00-\u9fff]/.test(cards.get(id).question+cards.get(id).explanation),'21강 한자: '+id);
 // 해설은 세 칸뿐이다(문화유산의 '판별:' 줄은 기억 연결 칸 안에 둔다). 기억 연결에도 왕 또는 시기(15세기·16세기)를 적고, '정한 왕 없음'·'조선 내내'는 쓰지 않는다.
 for(const id of ids21){const e=cards.get(id).explanation;assert(/^정답 근거: [\s\S]+\n\n보기 비교: [\s\S]+\n\n기억 연결: /.test(e)&&e.split('\n\n').length===3,'21강 해설 세 칸: '+id);
  assert(/(태조|태종|세종|문종|세조|성종|중종|명종|선조|영조) 때|15세기|16세기|17세기/.test(e.split('기억 연결: ')[1]),'21강 기억 연결 왕·시기 표기: '+id);
  assert(!/정한 왕 없음|조선 내내|두문자|외우는 비결/.test(e),'21강 해설 금지 표기: '+id);
  for(const part of e.split('\n\n')){const seen=new Map();for(const m of part.matchAll(/(『[^』]+』|「[^」]+」)\(([^()]*때[^()]*)\)/g))seen.set(m[1],(seen.get(m[1])||0)+1);for(const [book,n] of seen)assert(n===1,'21강 한 칸에 같은 책 재위 표기 한 번: '+id+' '+book);}}
 // 문화유산(원각사지 10층 석탑·장경판전·분청사기·백자·고사관수도·몽유도원도·사군자·초충도) 문항은 기억 연결 칸 끝에 판별 줄이 있다.
 const heritage=ids21.filter(id=>/원각사지|장경판전|분청사기|백자|고사관수도|몽유도원도|사군자|초충도/.test(cards.get(id).question.split('\n')[0]+cards.get(id).answer));
 assert(heritage.length>=15,'21강 문화유산 문항: '+heritage.length);
 for(const id of heritage.filter(id=>!/왕|인물|짝지은|이상좌/.test(cards.get(id).question.split('\n')[0])))assert(/\n판별: /.test(cards.get(id).explanation.split('기억 연결: ')[1]),'21강 문화유산 판별 줄: '+id);}
// 22강(012~013쪽 요약 '한국사를 읽다' 조선 후기(정치))은 사용자 요청(80회까지 강마다 20문제)으로 한능검 57~79회 기출 빈도 상위 사실만 고른 20문제다(빈도표 research/hanneung-lecture22-20260927/frequency.md).
// 강 범위는 교재 순서대로 21강 뒤 · 특강 앞. 8문제 묶음은 저장된 번호를 지키려고 맨 끝(284~286)에 붙였다. 단원 여섯은 조선 후기 주제 끝(18강 호란 뒤).
{const ids22=Object.keys(catalog.questions).filter(id=>LECTURE_22.test(id));assert.equal(ids22.length,20,'22강 문제 수');
 assert.deepEqual(ids22,Array.from({length:20},(_,i)=>'joseonlate1-hist-20260927-'+String(i+1).padStart(3,'0')));
 assert.deepEqual(ids22.map(id=>catalog.questions[id].number),Array.from({length:20},(_,i)=>2176+i),'22강 번호는 2176~2195');
 {const i=lectures.findIndex(l=>l.id==='22');assert.equal(lectures[i-1].id,'21');assert.equal(lectures[i+1].id,'23');assert.equal(lectures[i].title,'22강 조선 후기(정치)');assert.deepEqual(Array.from(lectures[i].ids),ids22,'22강 범위는 이 강의 문제만');}
 for(const id of ids22)assert(SECTIONS_22.includes(catalog.questions[id].section),'22강 question outside the 조선 후기(정치) sections: '+id);
 assert.deepEqual([...new Set(ids22.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_22].sort(),'22강 covers all six blocks');
 {const sets22=catalog.sets.filter(s=>s.title.startsWith('22강 조선 후기(정치) '));assert.deepEqual([...sets22.map(s=>s.number)],[284,285,286]);assert.deepEqual([...sets22.map(s=>s.ids.length)],[8,8,4]);}
 const material=ids22.filter(id=>cards.get(id).question.includes('\n'));for(const id of material)assert(cards.get(id).question.includes('\n\n['),'Material format: '+id);assert(material.length*2>=ids22.length,'22강 자료 제시형이 절반 이상: '+material.length);
 const KINGS='선조|광해군|인조|효종|현종|숙종|경종|영조|정조|순조|헌종|철종|명종';
 for(const id of ids22){const c=cards.get(id),o=ctx.QUIZ_OPTIONS[id],e=c.explanation;
  assert.equal(o.correctIndex,0);assert.equal(c.answer,o.choices[0]);assert.equal(o.choices.length,4);
  for(const x of o.choices.concat([c.question]))assert(!/\d{3,4}\s*년|\b1[0-9]{3}\b/.test(x)&&!new RegExp('[(]('+KINGS+')[^()]* 때[)]').test(x),'22강 보기·발문에 연도·왕 표기: '+id);
  assert(!/[\u4e00-\u9fff]/.test(c.question+e),'22강 한자: '+id);
  assert(/^정답 근거: [\s\S]+\n\n보기 비교: [\s\S]+\n\n기억 연결: /.test(e)&&e.split('\n\n').length===3,'22강 해설 세 칸: '+id);
  assert(new RegExp('('+KINGS+') 때').test(e.split('기억 연결: ')[1]),'22강 기억 연결 왕 표기: '+id);
  assert(!/정한 왕 없음|조선 내내|두문자|외우는 비결|카드|문항|변형|\d{3,4}/.test(c.question+e+o.choices.join('')),'22강 금지 표기: '+id);
  assert(/^22강 조선 후기\(정치\) 01[23]쪽 .* · 교재 사진 기반 자체 제작 문제\(공식 기출 아님\)\.$/.test(c.source),'22강 출처: '+id);
  for(const part of e.split('\n\n')){const seen=new Map();for(const m of part.matchAll(/(『[^』]+』|기해예송|갑인예송|경신환국|기사환국|갑술환국|기축옥사|이인좌의 난|탕평비|균역법|신해통공|장용영|초계문신제)\(([^()]*때[^()]*)\)/g))seen.set(m[1],(seen.get(m[1])||0)+1);for(const [w,n] of seen)assert(n===1,'22강 한 칸에 같은 대상 왕 표기 한 번: '+id+' '+w);}}
 // 대조군: 해설 속 대표 사건의 왕 표기가 맞는지(틀린 왕을 적으면 잡힌다).
 for(const [w,k] of [['기사환국','숙종'],['경신환국','숙종'],['갑술환국','숙종'],['기해예송','현종'],['갑인예송','현종'],['기축옥사','선조'],['이인좌의 난','영조']])for(const id of ids22)for(const m of cards.get(id).explanation.matchAll(new RegExp(w+'[(]([^()]*때)[)]','g')))assert(m[1].includes(k),'22강 왕 표기: '+id+' '+w+'('+m[1]+')');
}
// 23강(025쪽 요약 '한국사를 읽다' 조선 후기(조직, 외교))은 사용자 요청(80회까지 강마다 20문제)으로 한능검 57~79회 기출 빈도 상위 사실만 고른 20문제다(빈도표 research/hanneung-lecture23-20260928/frequency.md).
// 강 범위는 교재 순서대로 22강 뒤 · 특강 앞. 8문제 묶음은 저장된 번호를 지키려고 맨 끝(287~289)에 붙였다. 단원 일곱은 조선 후기 주제 끝(22강 세도 정치 뒤).
// 사료는 교재 '한국사를 보다' 022~024쪽 글자 그대로(『송서습유』 · 『북학의』 서문 · 칙령 제41호 조문). 대한 제국 때 일(간도 관리사 · 간도 협약 · 칙령 제41호)은 '(대한 제국 때)'로 적는다.
{const ids23=Object.keys(catalog.questions).filter(id=>LECTURE_23.test(id));assert.equal(ids23.length,20,'23강 문제 수');
 assert.deepEqual(ids23,Array.from({length:20},(_,i)=>'joseonlate2-hist-20260928-'+String(i+1).padStart(3,'0')));
 assert.deepEqual(ids23.map(id=>catalog.questions[id].number),Array.from({length:20},(_,i)=>2196+i),'23강 번호는 2196~2215');
 {const i=lectures.findIndex(l=>l.id==='23');assert.equal(lectures[i-1].id,'22');assert.equal(lectures[i+1].id,'24');assert.equal(lectures[i].title,'23강 조선 후기(조직, 외교)');assert.deepEqual(Array.from(lectures[i].ids),ids23,'23강 범위는 이 강의 문제만');}
 for(const id of ids23)assert(SECTIONS_23.includes(catalog.questions[id].section),'23강 question outside the 조선 후기(조직, 외교) sections: '+id);
 assert.deepEqual([...new Set(ids23.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_23].sort(),'23강 covers all seven blocks');
 {const sets23=catalog.sets.filter(s=>s.title.startsWith('23강 조선 후기(조직, 외교) '));assert.deepEqual([...sets23.map(s=>s.number)],[287,288,289]);assert.deepEqual([...sets23.map(s=>s.ids.length)],[8,8,4]);}
 const material=ids23.filter(id=>cards.get(id).question.includes('\n'));for(const id of material)assert(cards.get(id).question.includes('\n\n['),'Material format: '+id);assert(material.length*2>=ids23.length,'23강 자료 제시형이 절반 이상: '+material.length);
 const KINGS='중종|명종|선조|광해군|인조|효종|현종|숙종|경종|영조|정조|순조|헌종|철종|고종';
 for(const id of ids23){const c=cards.get(id),o=ctx.QUIZ_OPTIONS[id],e=c.explanation;
  assert.equal(o.correctIndex,0);assert.equal(c.answer,o.choices[0]);assert.equal(o.choices.length,4);
  for(const x of o.choices.concat([c.question]))assert(!/\d{3,4}\s*년|\b1[0-9]{3}\b/.test(x)&&!new RegExp('[(]('+KINGS+'|대한 제국)[^()]* 때[)]').test(x),'23강 보기·발문에 연도·왕 표기: '+id);
  assert(!/[\u4e00-\u9fff]/.test(c.question+e),'23강 한자: '+id);
  assert(/^정답 근거: [\s\S]+\n\n보기 비교: [\s\S]+\n\n기억 연결: /.test(e)&&e.split('\n\n').length===3,'23강 해설 세 칸: '+id);
  assert(new RegExp('('+KINGS+') 때').test(e.split('기억 연결: ')[1]),'23강 기억 연결 왕 표기: '+id);
  assert(!/정한 왕 없음|조선 내내|두문자|외우는 비결|카드|문항|변형|\d{3,4}/.test(c.question+e+o.choices.join('')),'23강 금지 표기: '+id);
  assert(/^23강 조선 후기\(조직, 외교\) 025쪽 .* \(한국사를 보다 022~024쪽 자료 포함\) · 교재 사진 기반 자체 제작 문제\(공식 기출 아님\)\.$/.test(c.source),'23강 출처: '+id);
  for(const part of e.split('\n\n')){const seen=new Map();for(const m of part.matchAll(/(『[^』]+』|나선 정벌|북벌론|백두산정계비|금위영|훈련도감|기유약조|회답 겸 쇄환사|안용복|칙령 제41호|간도 협약|을묘왜변|삼포 왜란|정유재란)\(([^()]*때[^()]*)\)/g))seen.set(m[1],(seen.get(m[1])||0)+1);for(const [w,n] of seen)assert(n===1,'23강 한 칸에 같은 대상 왕 표기 한 번: '+id+' '+w);}}
 // 대조군: 해설 속 대표 사건의 왕 표기가 맞는지(틀린 왕을 적으면 잡힌다).
 for(const [w,k] of [['나선 정벌','효종'],['백두산정계비','숙종'],['금위영','숙종'],['훈련도감','선조'],['기유약조','광해군'],['회답 겸 쇄환사','선조'],['안용복','숙종'],['을묘왜변','명종'],['삼포 왜란','중종'],['칙령 제41호','대한 제국'],['간도 협약','대한 제국']])for(const id of ids23)for(const m of cards.get(id).explanation.matchAll(new RegExp(w+'[(]([^()]*때)[)]','g')))assert(m[1].includes(k),'23강 왕 표기: '+id+' '+w+'('+m[1]+')');
 // 사료는 교재 자료 면 글자 그대로(가짜 사료 금지): 출전 줄이 있는 자료는 이 셋뿐.
 assert.deepEqual(ids23.filter(id=>/\n- 『[^』]+』[^\n]* -$/.test(cards.get(id).question)).map(id=>cards.get(id).question.match(/- (『[^』]+』)/)[1]),['『송서습유』','『북학의』'],'23강 출전 표기 사료');
}
// 24강(037쪽 요약 '한국사를 읽다' 조선 후기(경제))은 사용자 요청(80회까지 강마다 20문제)으로 한능검 57~79회 기출 빈도 상위 사실만 고른 20문제다(빈도표 research/hanneung-lecture24-20260928/frequency.md).
// 강 범위는 교재 순서대로 23강 뒤 · 특강 앞. 8문제 묶음은 저장된 번호를 지키려고 맨 끝(290~292)에 붙였다. 단원 여섯은 조선 후기 주제 끝(23강 독도 뒤). core는 20문제 전부(접는 문제 없음).
// 사료는 교재 '한국사를 보다' 034~036쪽 글자 그대로(괄호 속 한자만 뺌): 『일성록』 · 『만기요람』 · 『영조실록』 · 『경세유표』 · 『연암집』 · 『경제야언』 · 『택리지』 · 『우서』 · 『비변사등록』.
{const ids24=Object.keys(catalog.questions).filter(id=>LECTURE_24.test(id));assert.equal(ids24.length,20,'24강 문제 수');
 assert.deepEqual(ids24,Array.from({length:20},(_,i)=>'joseonlate3-hist-20260928-'+String(i+1).padStart(3,'0')));
 assert.deepEqual(ids24.map(id=>catalog.questions[id].number),Array.from({length:20},(_,i)=>2216+i),'24강 번호는 2216~2235');
 {const i=lectures.findIndex(l=>l.id==='24');assert.equal(lectures[i-1].id,'23');assert.equal(lectures[i+1].id,'25');assert.equal(lectures[i].title,'24강 조선 후기(경제)');assert.deepEqual(Array.from(lectures[i].ids),ids24,'24강 범위는 이 강의 문제만');assert.deepEqual(Array.from(lectures[i].core),ids24,'24강 core = 20문제 전부');}
 for(const id of ids24)assert(SECTIONS_24.includes(catalog.questions[id].section),'24강 question outside the 조선 후기(경제) sections: '+id);
 assert.deepEqual([...new Set(ids24.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_24].sort(),'24강 covers all six blocks');
 {const sets24=catalog.sets.filter(s=>s.title.startsWith('24강 조선 후기(경제) '));assert.deepEqual([...sets24.map(s=>s.number)],[290,291,292]);assert.deepEqual([...sets24.map(s=>s.ids.length)],[8,8,4]);}
 const material=ids24.filter(id=>cards.get(id).question.includes('\n'));for(const id of material)assert(cards.get(id).question.includes('\n\n['),'Material format: '+id);assert(material.length*2>=ids24.length,'24강 자료 제시형이 절반 이상: '+material.length);
 const KINGS='중종|명종|선조|광해군|인조|효종|현종|숙종|경종|영조|정조|순조|헌종|철종|고종|세종|세조|지증왕|신문왕|흥덕왕|성종|경종|공양왕';
 for(const id of ids24){const c=cards.get(id),o=ctx.QUIZ_OPTIONS[id],e=c.explanation;
  assert.equal(o.correctIndex,0);assert.equal(c.answer,o.choices[0]);assert.equal(o.choices.length,4);
  for(const x of o.choices.concat([c.question]))assert(!/\d{3,4}\s*년|\b1[0-9]{3}\b/.test(x)&&!new RegExp('[(]('+KINGS+'|대한 제국)[^()]* 때[)]').test(x),'24강 보기·발문에 연도·왕 표기: '+id);
  assert(!/[\u4e00-\u9fff]/.test(c.question+e),'24강 한자: '+id);
  assert(/^정답 근거: [\s\S]+\n\n보기 비교: [\s\S]+\n\n기억 연결: /.test(e)&&e.split('\n\n').length===3,'24강 해설 세 칸: '+id);
  assert(new RegExp('('+KINGS+') 때').test(e.split('기억 연결: ')[1]),'24강 기억 연결 왕 표기: '+id);
  assert(!/정한 왕 없음|조선 내내|두문자|외우는 비결|카드|문항|변형|\d{3,4}/.test(c.question+e+o.choices.join('')),'24강 금지 표기: '+id);
  assert(/^24강 조선 후기\(경제\) 037쪽 .* \(한국사를 보다 034~036쪽 자료 포함\) · 교재 사진 기반 자체 제작 문제\(공식 기출 아님\)\.$/.test(c.source),'24강 출처: '+id);
  for(const part of e.split('\n\n')){const seen=new Map();for(const m of part.matchAll(/(『[^』]+』|대동법|영정법|균역법|상평통보|설점수세제|신해통공|연분 9등법|공법|직전법|과전법|호포제|기유약조)\(([^()]*때[^()]*)\)/g))seen.set(m[1],(seen.get(m[1])||0)+1);for(const [w,n] of seen)assert(n===1,'24강 한 칸에 같은 대상 왕 표기 한 번: '+id+' '+w);}}
 // 대조군: 해설 속 대표 제도의 왕 표기가 맞는지(틀린 왕을 적으면 잡힌다).
 for(const [w,k] of [['영정법','인조'],['균역법','영조'],['상평통보','숙종'],['설점수세제','효종'],['신해통공','정조'],['연분 9등법','세종'],['공법','세종'],['직전법','세조'],['과전법','공양왕'],['기유약조','광해군']])for(const id of ids24)for(const m of cards.get(id).explanation.matchAll(new RegExp(w+'[(]([^()]*때)[)]','g')))assert(m[1].includes(k),'24강 왕 표기: '+id+' '+w+'('+m[1]+')');
 for(const id of ids24)for(const m of cards.get(id).explanation.matchAll(/대동법[(]([^()]*때)[)]/g))assert(/광해군|효종|숙종/.test(m[1]),'24강 대동법 왕 표기: '+id+' '+m[1]);
 // 사료는 교재 자료 면 글자 그대로(가짜 사료 금지): 출전이 마지막 줄 '- 『책』 -'인 자료.
 assert.deepEqual(ids24.filter(id=>/\n- 『[^』]+』[^\n]* -$/.test(cards.get(id).question)).map(id=>cards.get(id).question.match(/\n- (『[^』]+』)[^\n]* -$/)[1]),['『일성록』','『만기요람』','『영조실록』','『만기요람』','『연암집』','『택리지』','『비변사등록』'],'24강 출전 표기 사료');
}
// 25강(049쪽 요약 '한국사를 읽다' 조선 후기(사회))은 사용자 요청(80회까지 강마다 20문제)으로 한능검 57~79회 기출 빈도 상위 사실만 고른 20문제다(빈도표 research/hanneung-lecture25-20260928/frequency.md).
// 강 범위는 교재 순서대로 24강 뒤 · 특강 앞. 8문제 묶음은 저장된 번호를 지키려고 맨 끝(293~295)에 붙였다. 단원 여덟은 조선 후기 주제 끝(24강 수공업과 광업 뒤). core는 20문제 전부(접는 문제 없음).
// 사료는 교재 '한국사를 보다' 046~048쪽 글자 그대로(괄호 속 한자만 뺌): 「양반전」 · 『영조실록』 · 『순조실록』 · 『승정원일기』 · 『임술록』 · 『패림』 · 『상원과방』 · 『목민심서』 · 「상재상서」 · 『정조실록』 · 최시형의 최초 설법 · 『일성록』.
{const ids25=Object.keys(catalog.questions).filter(id=>LECTURE_25.test(id));assert.equal(ids25.length,20,'25강 문제 수');
 assert.deepEqual(ids25,Array.from({length:20},(_,i)=>'joseonlate4-hist-20260928-'+String(i+1).padStart(3,'0')));
 assert.deepEqual(ids25.map(id=>catalog.questions[id].number),Array.from({length:20},(_,i)=>2236+i),'25강 번호는 2236~2255');
 {const i=lectures.findIndex(l=>l.id==='25');assert.equal(lectures[i-1].id,'24');assert.equal(lectures[i+1].id,'250');assert.equal(lectures[i].title,'25강 조선 후기(사회)');assert.deepEqual(Array.from(lectures[i].ids),ids25,'25강 범위는 이 강의 문제만');assert.deepEqual(Array.from(lectures[i].core),ids25,'25강 core = 20문제 전부');}
 for(const id of ids25)assert(SECTIONS_25.includes(catalog.questions[id].section),'25강 question outside the 조선 후기(사회) sections: '+id);
 assert.deepEqual([...new Set(ids25.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_25].sort(),'25강 covers all eight blocks');
 {const sets25=catalog.sets.filter(s=>s.title.startsWith('25강 조선 후기(사회) '));assert.deepEqual([...sets25.map(s=>s.number)],[293,294,295]);assert.deepEqual([...sets25.map(s=>s.ids.length)],[8,8,4]);}
 const material=ids25.filter(id=>cards.get(id).question.includes('\n'));for(const id of material)assert(cards.get(id).question.includes('\n\n['),'Material format: '+id);assert(material.length*2>=ids25.length,'25강 자료 제시형이 절반 이상: '+material.length);
 const KINGS='중종|명종|선조|광해군|인조|효종|현종|숙종|경종|영조|정조|순조|헌종|철종|고종|태조|광종|문종|신종|원성왕|진흥왕|진성 여왕';
 for(const id of ids25){const c=cards.get(id),o=ctx.QUIZ_OPTIONS[id],e=c.explanation;
  assert.equal(o.correctIndex,0);assert.equal(c.answer,o.choices[0]);assert.equal(o.choices.length,4);
  for(const x of o.choices.concat([c.question]))assert(!/\d{3,4}\s*년|\b1[0-9]{3}\b/.test(x)&&!new RegExp('[(]('+KINGS+'|대한 제국)[^()]* 때[)]').test(x),'25강 보기·발문에 연도·왕 표기: '+id);
  assert(!/[\u4e00-\u9fff]/.test(c.question+e),'25강 한자: '+id);
  assert(/^정답 근거: [\s\S]+\n\n보기 비교: [\s\S]+\n\n기억 연결: /.test(e)&&e.split('\n\n').length===3,'25강 해설 세 칸: '+id);
  assert(new RegExp('('+KINGS+') 때').test(e.split('기억 연결: ')[1]),'25강 기억 연결 왕 표기: '+id);
  assert(!/정한 왕 없음|조선 내내|두문자|외우는 비결|카드|문항|변형|\d{3,4}/.test(c.question+e+o.choices.join('')),'25강 금지 표기: '+id);
  assert(/^25강 조선 후기\(사회\) 049쪽 .* \(한국사를 보다 046~048쪽 자료 포함\) · 교재 사진 기반 자체 제작 문제\(공식 기출 아님\)\.$/.test(c.source),'25강 출처: '+id);
  for(const part of e.split('\n\n')){const seen=new Map();for(const m of part.matchAll(/(『[^』]+』|신해박해|신유박해|병인박해|홍경래의 난|임술 농민 봉기|삼정이정청|노비종모법|공노비|검서관)\(([^()]*때[^()]*)\)/g))seen.set(m[1],(seen.get(m[1])||0)+1);for(const [w,n] of seen)assert(n===1,'25강 한 칸에 같은 대상 왕 표기 한 번: '+id+' '+w);}}
 // 대조군: 해설 속 대표 사건의 왕 표기가 맞는지(틀린 왕을 적으면 잡힌다).
 for(const [w,k] of [['신해박해','정조'],['신유박해','순조'],['병인박해','고종'],['홍경래의 난','순조'],['임술 농민 봉기','철종'],['삼정이정청','철종'],['노비종모법','영조'],['검서관','정조']])for(const id of ids25)for(const m of cards.get(id).explanation.matchAll(new RegExp(w+'[(]([^()]*때)[)]','g')))assert(m[1].includes(k),'25강 왕 표기: '+id+' '+w+'('+m[1]+')');
 // 사료는 교재 자료 면 글자 그대로(가짜 사료 금지): 출전이 마지막 줄 '- 『책』 -'인 자료.
 assert.deepEqual(ids25.filter(id=>/\n- 『[^』]+』[^\n]* -$/.test(cards.get(id).question)).map(id=>cards.get(id).question.match(/\n- (『[^』]+』)[^\n]* -$/)[1]),['『영조실록』','『순조실록』','『승정원일기』','『임술록』','『패림』','『상원과방』','『정조실록』','『일성록』'],'25강 출전 표기 사료');
}
// 주제 특강(250쪽 세시 풍속 · 252~256쪽 근·현대 인물 80명, 251쪽은 사진 없음)은 사실 411개(인물 317 · 세시 풍속 94)를 덮는 552문제다. 21강 뒤 마지막 범위.
// 세시 풍속은 '여러 시대 통합' 주제, 인물은 활동 시기에 따라 개항·개화기 / 갑오개혁·대한제국 / 일제 강점기 / 현대 주제의 단원에 든다.
{const SECTIONS_SP=['세시 풍속','개화파와 개항기 인물','동학·위정척사 인물','의병 인물','애국 계몽 운동 인물','한국을 도운 외국인','국외 독립운동 기지 인물','국권 피탈 전 의거 인물','의열 투쟁 인물','독립군·광복군 인물','여성 독립운동가','임시 정부·광복 전후 인물','광복 이후 인물','국학·민족 종교 인물','문학·예술·사회 운동 인물'];
 const idsSp=Object.keys(catalog.questions).filter(id=>LECTURE_SPECIAL.test(id));assert.equal(idsSp.length,552,'주제 특강 문항 수');
 assert.deepEqual(idsSp,Array.from({length:552},(_,i)=>'special-hist-20260924-'+String(i+1).padStart(3,'0')));
 assert.deepEqual(idsSp.map(id=>catalog.questions[id].number),Array.from({length:552},(_,i)=>1624+i),'주제 특강 번호는 1624~2175');
 // 2026-09-27 사용자 "세시풍속과 근현대 인물 분리하자": 강 두 개 — 250 세시 풍속(001~134) · 252-256 근·현대 인물(135~552). 옛 lecture-250-256은 250으로.
 const [lss,lsp]=lectures.slice(-2);assert.equal(lss.id,'250');assert.equal(lss.title,'특강 세시 풍속');assert.equal(lsp.id,'252-256');assert.equal(lsp.title,'특강 근·현대 인물');
 assert.deepEqual(Array.from(lss.ids),idsSp.slice(0,134),'세시 풍속 강은 세시 풍속 문제만');assert.deepEqual(Array.from(lsp.ids),idsSp.slice(134),'근·현대 인물 강은 인물 문제만');
 assert.ok(lss.ids.every(id=>catalog.questions[id].section==='세시 풍속'));assert.ok(lsp.ids.every(id=>catalog.questions[id].section!=='세시 풍속'));
 {const sp=catalog.sets.filter(s=>/^특강 /.test(s.title));assert.ok(sp.every(s=>s.ids.every(id=>lss.ids.includes(id))||s.ids.every(id=>lsp.ids.includes(id))),'특강 묶음이 두 강에 걸치지 않음');
  assert.equal(sp.filter(s=>s.title.startsWith('특강 세시 풍속 ')).length,17);assert.equal(sp.filter(s=>s.title.startsWith('특강 근·현대 인물 ')).length,53);}
 assert.deepEqual([...new Set(idsSp.map(id=>catalog.questions[id].section))].sort(),[...SECTIONS_SP].sort(),'주제 특강 단원');
 const T=Object.fromEntries(topics.list.map(t=>[t.id,t.sections]));
 assert.deepEqual(Array.from(T.integrated),['세시 풍속']);assert.deepEqual(Array.from(T.opening),['개화파와 개항기 인물','동학·위정척사 인물']);
 assert.deepEqual(Array.from(T['korean-empire']),['의병 인물','애국 계몽 운동 인물','국권 피탈 전 의거 인물']);assert.deepEqual(Array.from(T.contemporary),['광복 이후 인물']);
 assert.equal(T.colonial.length,8);
 const sets=catalog.sets.filter(s=>/^특강 (세시 풍속|근·현대 인물) /.test(s.title));assert.equal(sets.length,70);assert(sets.every(s=>s.ids.length<=8));
 assert.equal(idsSp.filter(id=>catalog.questions[id].section==='세시 풍속').length,134,'세시 풍속 문항 수');
 for(const id of idsSp){const c=cards.get(id),o=ctx.QUIZ_OPTIONS[id],e=c.explanation;
  assert.equal(o.correctIndex,0);assert.equal(c.answer,o.choices[0]);assert.equal(o.choices.length,4);assert.equal(new Set(o.choices).size,4);
  for(const x of o.choices)assert(!/\d{3,4}\s*년|\b1[89]\d{2}\b|\((철종|고종|순종) 때\)/.test(x),'주제 특강 보기에 연도·왕 표기: '+id);
  assert(!/\((철종|고종|순종) 때\)/.test(c.question),'주제 특강 발문에 왕 표기: '+id);
  assert(!/\d{3,4}\s*년|\b1[89]\d{2}\b/.test(c.question+e),'주제 특강 연도: '+id);
  if(c.question.includes('\n'))assert(c.question.includes('\n\n['),'Material format: '+id);
  assert(!/[\u4e00-\u9fff]/.test(c.question+e),'주제 특강 한자: '+id);
  assert(/^정답 근거: [\s\S]+\n\n보기 비교: [\s\S]+\n\n기억 연결: /.test(e)&&e.split('\n\n').length===3,'주제 특강 해설 세 칸: '+id);
  assert(!/두문자|외우는 비결|정한 왕 없음|카드|문항|변형|[{}]|때\) 때/.test(c.question+e+o.choices.join('')),'주제 특강 금지 표기: '+id);
  assert(/^특강 (세시 풍속 250쪽|근·현대 인물 25[2-6]쪽) · 교재 사진 기반 자체 제작 문제\(공식 기출 아님\)\.$/.test(c.source),'주제 특강 출처: '+id);}
 // 1910년 전 사건은 본문(정답 근거+보기 비교) 첫 언급과 기억 연결 첫 언급에 왕을 단다(대조 여섯 사건). 그 밖에는 되풀이하지 않는다.
 for(const [word,king] of [['갑신정변','고종'],['을사늑약','고종'],['헤이그 특사','고종'],['동학 농민 운동','고종'],['진주 농민 봉기','철종'],['정미의병','순종']]){
  const hits=idsSp.filter(id=>cards.get(id).explanation.includes(word));assert(hits.length>0,'대조 사건 '+word);
  for(const id of hits){const P3=cards.get(id).explanation.split('\n\n');for(const part of [P3[0]+'\n\n'+P3[1],P3[2]]){const i=part.indexOf(word);if(i<0)continue;assert(part.slice(i+word.length).startsWith('('+king+' 때)'),'첫 언급 왕 표기: '+word+' '+id);assert.equal(part.split(word+'('+king+' 때)').length-1,1,'본문(정답 근거+보기 비교)·기억 연결에 한 번씩: '+word+' '+id);}}}
 // 1910년 뒤 일에는 왕을 달지 않는다.
 for(const id of idsSp)assert(!/(3·1 운동|한인 애국단|의열단|임시 정부|신간회|광복군)\((고종|순종) 때\)/.test(cards.get(id).explanation),'1910년 뒤 일에 왕 표기: '+id);
}
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
