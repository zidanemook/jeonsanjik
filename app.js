'use strict';
const $=s=>document.querySelector(s);
function profileKey(uid){return uid?'chagog-user-'+uid:localStorage.getItem('chagog-owner')?'chagog-guest':'chagog-v1';}
let KEY='chagog-v1';try{KEY=profileKey(localStorage.getItem('chagog-active-user'));}catch{}
const {schedule,migrate}=ReviewSchedule;
const day=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function plus(date,n){const [y,m,d]=date.split('-').map(Number);return day(new Date(y,m-1,d+n));}
// 문제 원문·정답·해설은 앱 파일(core-review-pack·practice-bank·기출)에 있다. 폰 저장소에는 진도(일정)만 남기고,
// 읽을 때 앱 파일에서 원문을 붙인다. 앱 파일에 없는 카드(아직 내려받지 않은 기출 회차 등)는 저장된 원문을 그대로 둔다.
const CARD_CONTENT=['subject','question','answer','explanation','source','verified'];
function bankSource(id,lesson){const rule=CORE_REVIEW_PACK.find(c=>c.id===lesson.ruleId);return id.startsWith('ko-read')?'사고의 힘 논리 제2편 추론 강화 독해 1장 개념 기반 자체 제작 문제(교재 문장·예문은 옮기지 않음).':id.startsWith('ko-logic')?'사고의 힘 논리 제1편 개념 기반 자체 제작 문제(교재 문장·예문은 옮기지 않음).':id.startsWith('en-day1-')?'문제집 PART 01 문장의 구조·동사 유형 정리 기반 자체 제작 연습.':id.startsWith('en-day2-')?'문제집 PART 02 동사의 형태, 명사, 일치 정리 기반 자체 제작 연습.':id.startsWith('en-day3-')?'문제집 Day 3 문법 포인트 찾기 훈련 기반 자체 제작 연습.':id.startsWith('en-day4-')?'문제집 Day 4 문법 포인트 찾기 훈련 기반 자체 제작 연습.':id.startsWith('en-day5-')?'문제집 Day 5 문법 포인트 찾기 훈련 기반 자체 제작 연습.':id.startsWith('en-formula-')?'문법 공식 훈련 자체 제작 연습(문제집 Day 1~4 문법 포인트를 공식별로 묶음).':rule?.source||'수일치 문서 기반 자체 제작 연습.';}
let contentCache=null;
function cardContent(){
 if(contentCache)return contentCache;
 const m=new Map();
 for(const c of CORE_REVIEW_PACK)m.set(c.id,{subject:c.subject,question:c.question,answer:c.answer,explanation:c.explanation||'',source:c.source||'',verified:true});
 for(const [id,lesson]of Object.entries(PRACTICE_BANK)){
  if(m.has(id))continue;
  const e=Practice.select({id,question:'',explanation:''},[],PRACTICE_BANK,QUIZ_OPTIONS);
  m.set(id,{subject:lesson.subject||'영어',question:e.question,answer:e.type==='text'?e.answers[0]:e.choices[e.correctIndex],explanation:e.explanation||'',source:bankSource(id,lesson),verified:true});
 }
 contentCache=m;return m;
}
// 앱 파일이 기준이다. 저장된 옛 사본이 있어도 앱 파일 문장으로 덮어쓴다(문장 수정이 바로 반영된다).
// v131 복습 일정 규칙(7일 → 14일 → 30일 → 외운 문제)으로 한 번 다시 계산한다. 일정은 풀이 기록에서 나오므로 기록은 그대로다.
const SCHEDULE_VERSION=2;
function reschedule(state){if(state.scheduleVersion===SCHEDULE_VERSION||typeof ProgressSync==='undefined')return state;let next;try{next=ProgressSync.merge(state,[]);}catch{return state;}next.scheduleVersion=SCHEDULE_VERSION;try{writeState(KEY,next);}catch{}return next;}
function hydrateCards(state){const m=cardContent();state.cards=state.cards.map(c=>{const base=m.get(c.id);return base?{...c,...base}:c;});return state;}
function leanState(state){const m=cardContent();return {...state,version:3,cards:state.cards.map(c=>{if(!m.has(c.id))return c;const out={...c};for(const k of CARD_CONTENT)delete out[k];return out;})};}
function writeState(key,state){localStorage.setItem(key,JSON.stringify(leanState(state)));}
let data={version:3,cards:[],history:[]}, storageOK=true;
try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);validateBackup(parsed);data=reschedule(hydrateCards(migrate(parsed)));if(data.notes!==undefined)data.notes=cleanNotes(data.notes);if(parsed.version===1&&!localStorage.getItem(KEY+'-before-adaptive'))localStorage.setItem(KEY+'-before-adaptive',raw);if(parsed.version!==3)writeState(KEY,data);}}catch(e){storageOK=false;notify('저장 데이터를 읽지 못했어요. 기존 데이터를 보호하기 위해 저장을 중지했어요.');}
function notify(t){$('#message').textContent=t;}
function commit(next){if(!storageOK){notify('저장소를 확인해야 합니다. 새로고침 후 다시 시도하세요.');return false;}try{writeState(KEY,next);data=next;window.dispatchEvent(new Event('study-progress-saved'));return true;}catch(e){notify('저장 공간이 부족하거나 저장이 차단됐어요. 기록은 변경되지 않았습니다.');return false;}}
function elem(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function btn(text,fn,cls){const b=elem('button',text,cls);b.onclick=fn;return b;}
function validDay(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;return plus(s,0)===s;}
function validateContent(c){if(!c||typeof c!=='object'||['subject','question','answer'].some(k=>typeof c[k]!=='string'||!c[k].trim())||['explanation','source'].some(k=>c[k]!==undefined&&typeof c[k]!=='string'))throw Error('과목·질문·정답과 텍스트 형식을 확인하세요.');}
// 의견은 학습 기록이 아니다. 형식이 맞지 않는 의견 하나 때문에 기록 불러오기(=저장 전체)가 멈추지 않도록 막지 않고 걸러낸다.
function cleanNotes(list){const out=[];if(Array.isArray(list))for(const n of list){try{out.push(ProgressSync.note(n));}catch{}}return out;}
function validateBackup(v){if(v?.explanationViews!==undefined){if(!Array.isArray(v.explanationViews))throw Error('Invalid explanation records');StudyCredit.unionExplanations([],v.explanationViews);}if(![1,2,3].includes(v?.version)||!Array.isArray(v.cards)||!Array.isArray(v.history))throw Error('지원하지 않는 백업입니다.');const ids=new Set();for(const c of v.cards){if(v.version!==3||c.question!==undefined)validateContent(c);if(typeof c.id!=='string'||ids.has(c.id)||!validDay(c.created)||!(c.due===null||validDay(c.due))||(v.version===1?(!Number.isInteger(c.stage)||c.stage<0||c.stage>4):(!Number.isFinite(c.ease)||c.ease<1.3||c.ease>3||!Number.isInteger(c.interval)||c.interval<0||c.interval>365||!Number.isInteger(c.streak)||c.streak<0||c.due===null)))throw Error('문제 일정 또는 ID가 올바르지 않습니다.');if(c.retryAt!==undefined&&!Number.isFinite(Date.parse(c.retryAt)))throw Error('잘못된 재학습 시간');if(c.pendingAttempt!==undefined&&(!['remember','partial','none'].includes(c.pendingAttempt.recall)||!validDay(c.pendingAttempt.date)||!Number.isFinite(Date.parse(c.pendingAttempt.at))||typeof c.pendingAttempt.delayedFirst!=='boolean'))throw Error('잘못된 회상 기록');ids.add(c.id);}for(const h of v.history){if(typeof h.id!=='string'||typeof h.cardId!=='string'||!validDay(h.date)||!['correct','unsure','wrong'].includes(h.result))throw Error('복습 기록이 올바르지 않습니다.');}if(v.quizFeedback!==undefined&&(!v.quizFeedback||typeof v.quizFeedback.cardId!=='string'||!Number.isInteger(v.quizFeedback.selectedIndex)||!['correct','wrong','unsure'].includes(v.quizFeedback.result)))throw Error('퀴즈 피드백이 올바르지 않습니다.');if(v.queueMode!==undefined&&!QUEUE_MODES.some(([m])=>m===v.queueMode))throw Error('대기열 모드가 올바르지 않습니다.');if(v.targetExam!==undefined&&JSON.stringify(ExamScore.target(v.targetExam))!==JSON.stringify(v.targetExam))throw Error('목표 점수가 올바르지 않습니다.');if(v.dailyGoals!==undefined&&(!v.dailyGoals||typeof v.dailyGoals!=='object'||Array.isArray(v.dailyGoals)||Object.entries(v.dailyGoals).some(([k,g])=>typeof k!=='string'||k.length>40||!Number.isInteger(g)||g<1||g>500)))throw Error('과목별 하루 목표가 올바르지 않습니다.');if(v.includeMastered!==undefined&&v.includeMastered!==true)throw Error('외운 문제 옵션이 올바르지 않습니다.');if(v.scheduleVersion!==undefined&&!Number.isInteger(v.scheduleVersion))throw Error('일정 버전이 올바르지 않습니다.');if(v.dailyGoal!==undefined&&!(Number.isInteger(v.dailyGoal)&&v.dailyGoal>=1&&v.dailyGoal<=500))throw Error('하루 목표가 올바르지 않습니다.');}
function newCard(c){validateContent(c);return {id:crypto.randomUUID(),subject:c.subject.trim(),question:c.question.trim(),answer:c.answer.trim(),explanation:c.explanation||'',source:c.source||'',verified:c.verified===true,created:day(),due:day(),ease:2.5,interval:0,streak:0};}
// 공무원 기출은 회차 파일을 받기 전에도 풀 수 있는 카드다(색인에 있으면 된다). 보기는 그 회차의 문항을 처음 낼 때 받는다.
function isPlayable(c){return !!c&&(!!QUIZ_OPTIONS[c.id]||!!PRACTICE_BANK[c.id]||Gichul.known(c.id));}
const STUDY_SETS=STUDY_REVIEW_CATALOG.sets;
const STUDY_SET_BY_ID=new Map(STUDY_SETS.flatMap(set=>set.ids.map(id=>[id,set.number])));
function studySet(id){return STUDY_SET_BY_ID.get(id)||0;}
function studyScope(value){if(value==='study-20260910')return 0;const match=/^study-20260910-([1-9]\d*)$/.exec(value||'');return match&&STUDY_SETS.some(set=>set.number===Number(match[1]))?Number(match[1]):null;}
const TOPIC_BY_ID=StudyTopics.byCard(STUDY_REVIEW_CATALOG,globalThis.HANNEUNG_TOPICS||{});
function studyTopic(id){return TOPIC_BY_ID.get(id)||'';}
// 'topic-<id>' is the self-made side of one era; 'papers-<id>' is the official 기출 of the same era.
function topicRange(value){const match=/^(topic|papers)-([a-z-]+)$/.exec(value||'');return match&&StudyTopics.list.some(t=>t.id===match[2])?{id:match[2],papers:match[1]==='papers'}:null;}
function topicScope(value){return topicRange(value)?.id||null;}
// 'lecture-<id>' follows the textbook lectures (02~05강, 06강, 07강, 08강 …) over the self-made summary questions.
const STUDY_LECTURES=STUDY_REVIEW_CATALOG.lectures||[];
const LECTURE_BY_ID=new Map(STUDY_LECTURES.flatMap(l=>l.ids.map(id=>[id,l.id])));
// 2026-09-16 없앤 범위: 07·08강 덩어리는 07강으로, 따로 떠 있던 기출형 연습은 그 문제들이 처음 들어간 강으로 이어 연다(저장된 범위가 빈 화면이 되지 않게).
const RETIRED_LECTURES={'07-08':'07','02-03-04-05':'02-05','05-06':'06','10-12':'10'};
function lectureScope(value){const match=/^lecture-([0-9][0-9-]*)$/.exec(value||'');if(!match)return null;const id=RETIRED_LECTURES[match[1]]||match[1];return STUDY_LECTURES.some(l=>l.id===id)?id:null;}
function lectureTitle(id){return STUDY_LECTURES.find(l=>l.id===id)?.title||'';}
// 'paper-<paperId>' is one official 기출 회차 (예: 2026 지방직 9급 컴퓨터일반). 회차는 과목을 가리지 않는다.
const PAPER_SUBJECTS=new Set(Gichul.subjects);
function paperScope(value){const match=/^paper-([a-z0-9-]+)$/.exec(value||'');return match&&Gichul.has(match[1])?match[1]:null;}
function hasRanges(subject){return subject==='한국사'||PAPER_SUBJECTS.has(subject);}
// 회차 범위(한능검 n회 · 공무원 기출 한 과목 한 회차)에서는 앱이 문제를 고르지 않는다. 원문 순서대로만 낸다.
function sequentialScope(scope){return !!paperScope(scope.round)||(scope.subject==='한국사'&&!!scope.round&&Hanneung.rounds.includes(Number(scope.round)));}
function scopeOf(){const s=data.practiceScope||{};return {subject:s.subject||'',topic:s.topic||'',round:s.round||''};}
function roundMatch(c,round){
 if(!round)return true;
 const paper=paperScope(round);if(paper)return Gichul.paperOf(c.id)===paper;
 const t=topicRange(round);if(t)return studyTopic(c.id)===t.id&&(t.papers?!!Hanneung.get(c.id):!Hanneung.get(c.id));
 const lecture=lectureScope(round);if(lecture)return LECTURE_BY_ID.get(c.id)===lecture;
 const set=studyScope(round);if(set!==null)return !!studySet(c.id)&&(!set||studySet(c.id)===set);
 if(round==='core')return !Hanneung.get(c.id)&&!Gichul.get(c.id)&&!studySet(c.id);
 return Hanneung.get(c.id)?.round===Number(round);
}
// 교재 진도(topic) 범위를 가진 과목: 영어는 문제집 Day, 국어는 『사고의 힘 논리』의 장.
const TOPIC_SUBJECTS=new Set(['영어','국어']);
const KOREAN_TOPICS={'논리 1장':'1장 논증의 개념과 유형','논리 2장':'2장 명제 논리','논리 3장':'3장 정언 논리','논리 4장':'4장 술어 논리','논리 5장':'5장 귀납 논증','논리 6장':'6장 논리의 오류','독해 1장':'독해 1장 독해의 원리'};
// 영어 ‘문법 공식 훈련’의 공식 하나 범위는 topic을 'formula:<공식 id>'로 두고, 그 공식에 속한 문제집 Day 문제와 새 훈련 문제를 함께 담는다.
function topicMatch(lesson,topic){return !!lesson&&(lesson.topic===topic||(topic.startsWith('formula:')&&lesson.formula===topic.slice(8)));}
function inScope(c,scope){const subject=scope.subject||'',topic=TOPIC_SUBJECTS.has(subject)?scope.topic||'':'',round=hasRanges(subject)?scope.round||'':'';return isPlayable(c)&&(!subject||c.subject===subject)&&(!topic||topicMatch(PRACTICE_BANK[c.id],topic))&&roundMatch(c,round);}
function orderedScope(round){return !!topicScope(round)||!!lectureScope(round)||studyScope(round)!==null||!!paperScope(round)||Hanneung.rounds.includes(Number(round));}
const inCurrent=c=>inScope(c,scopeOf());
function sameScope(a,b){return !!a&&!!b&&(a.subject||'')===(b.subject||'')&&(a.topic||'')===(b.topic||'')&&(a.round||'')===(b.round||'');}
function scopeLabel(scope){
 const s=scope.subject;if(!s)return '전체 과목';
 const paper=hasRanges(s)?paperScope(scope.round):null;if(paper)return s+' · 기출 '+Gichul.paper(paper).range;
 if(s==='영어'&&(scope.topic||'').startsWith('formula:'))return '영어 · 문법 공식 · '+ENGLISH_FORMULAS.title(scope.topic.slice(8));
 if(s==='영어')return '영어 · '+({'':'전체','수일치':'수일치','영문법':'그 밖의 문법 연습','문법 공식 훈련':'문법 공식 훈련 새 문제'}[scope.topic||'']??scope.topic);
 if(s==='국어'&&KOREAN_TOPICS[scope.topic])return '국어 · 사고의 힘 논리 '+KOREAN_TOPICS[scope.topic];
 if(s!=='한국사')return s+' · 전체';
 const r=scope.round||'',t=topicRange(r),set=studyScope(r),lecture=lectureScope(r);
 if(t)return '한국사 · '+StudyTopics.title(t.id)+(t.papers?' · 기출만':'');if(lecture)return '한국사 · '+lectureTitle(lecture);if(set===0)return '한국사 · 요약자료 전체';if(set)return '한국사 · 요약자료 '+set+'묶음';if(r==='core')return '한국사 · 기존 핵심 복습';if(r)return '한국사 · 기출 '+r+'회';return '한국사 · 전체';
}
// Summary questions open from the first catalog number, so a new topic starts at its first question.
// Summary questions first (catalog order), then official papers from the newest round.
function catalogOrder(cards){const n=c=>{const q=STUDY_REVIEW_CATALOG.questions[c.id];if(q)return q.number;const g=Gichul.rank(c.id);if(g!==null)return 1000000+g;const p=Hanneung.get(c.id);return p?10000+(1000-p.round)*100+p.number:Infinity;};return cards.map((c,i)=>[c,i]).sort((a,b)=>{const x=n(a[0]),y=n(b[0]);return x===y?a[1]-b[1]:x<y?-1:1;}).map(p=>p[0]);}
function firstPass(ids){const first=new Map();for(const row of data.history.filter(h=>h.mode==='quiz'&&ids.has(h.cardId)).sort((a,b)=>(a.at||a.date).localeCompare(b.at||b.date)||a.id.localeCompare(b.id)))if(!first.has(row.cardId))first.set(row.cardId,row);return {answered:first.size,correct:[...first.values()].filter(h=>h.result==='correct').length};}
function appendPaper(parent,paper){
 if(!paper)return;
 const wrap=elem('div',undefined,'paper-image'),link=elem('a'),img=elem('img');
 link.href=paper.image;link.target='_blank';link.rel='noopener';link.setAttribute('aria-label',Hanneung.title(paper)+' 원문 크게 보기');
 img.src=paper.image;img.alt=Hanneung.title(paper)+' 원문 문제·사료·보기';img.width=paper.width;img.height=paper.height;img.loading='lazy';
 link.append(img);wrap.append(link,elem('small','문제를 누르면 크게 볼 수 있어요.'));
 const original=elem('a','국사편찬위원회 원본 문제지');original.href=paper.source;original.target='_blank';original.rel='noopener';wrap.append(original);
 const error=elem('p','문제 이미지를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 불러오세요.');error.hidden=true;
 const update=()=>{if(parent.id==='card'&&parent.querySelector('.paper-image img')===img)for(const b of parent.querySelectorAll('.quiz-choices button'))b.disabled=!!data.quizFeedback||!img.complete||!img.naturalWidth;};
 img.onerror=()=>{error.hidden=false;update();};img.onload=()=>{error.hidden=true;update();};
 error.append(btn('이미지 다시 불러오기',()=>{img.src=paper.image+'?retry='+Date.now();}));wrap.append(error);parent.append(wrap);
}
// 사진 보기 문항: 보기 자체가 사진이라 이름을 붙이면 답이 그대로 드러난다. 채점 전에는 번호만, 채점 뒤에는 이름을 붙인다.
// 공공누리 제1유형·CC BY·CC BY-SA는 출처표시가 의무인데 출처 문구에 국가유산 이름이 들어 있다(라이선스는 사진마다 출처 문구에 적혀 있다). 보기마다 붙이면 정답이 노출되므로
// 네 장의 출처를 보기 순서와 무관한 고정 순서(가나다순)로 문제 아래에 한 번만 모아 띄운다. 사진이 보이는 화면에는 언제나 함께 나온다.
function photoCredits(quiz){
 const box=elem('div',undefined,'photo-credits');
 box.append(elem('p','사진 출처 (보기 순서와 무관하게 가나다순으로 적었습니다)','photo-credit-head'));
 for(const name of Object.keys(quiz.choiceImages).sort((a,b)=>a.localeCompare(b,'ko')))box.append(elem('p',quiz.choiceImages[name].credit,'photo-credit'));
 return box;
}
function appendPhotoChoices(parent,quiz,pick,selected){
 const wrap=elem('div',undefined,'quiz-choices photo-choices'),imgs=[],buttons=[];
 quiz.choices.forEach((choice,i)=>{
  const meta=quiz.choiceImages[choice],cell=elem('div',undefined,'photo-cell'),button=elem('button');
  button.type='button';button.className='photo-choice';button.disabled=true;
  const img=elem('img');img.src=meta.src;img.alt=(i+1)+'번 사진 · '+meta.alt;img.loading='lazy';img.decoding='async';
  button.append(img,elem('span',(i+1)+'번','photo-number'));
  if(pick){button.onclick=()=>pick(i);button.setAttribute('aria-label',(i+1)+'번 사진 고르기 · '+meta.alt);}
  else{if(i===quiz.correctIndex)button.classList.add('quiz-correct');else if(i===selected)button.classList.add('quiz-wrong');}
  cell.append(button);if(!pick)cell.append(elem('small',(i+1)+'. '+choice,'photo-name'));
  wrap.append(cell);imgs.push(img);buttons.push(button);
 });
 parent.append(wrap);
 if(pick){
  const error=elem('p','보기 사진을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 불러오세요.','photo-error');error.hidden=true;
  const update=()=>{const ready=imgs.every(x=>x.complete&&x.naturalWidth);for(const b of buttons)b.disabled=!ready||!!data.quizFeedback;error.hidden=!imgs.some(x=>x.complete&&!x.naturalWidth);};
  for(const img of imgs){img.onload=update;img.onerror=update;}
  error.append(btn('사진 다시 불러오기',()=>{for(const img of imgs)if(!img.naturalWidth)img.src=img.src.split('?')[0]+'?retry='+Date.now();}));
  parent.append(error);update();
 }
 parent.append(photoCredits(quiz));
}
// 특정 강의·범위에서만 보이는 "외운 문제도 풀기" 옵션. 그 범위의 외운 문제 수를 함께 보여 준다.
function renderMasteredToggle(scope){const ranged=rangedScope(scope)&&!sequentialScope(scope),n=ranged?data.cards.filter(c=>inScope(c,scope)&&isMastered(c)).length:0;
 $('#masteredLabel').hidden=!ranged||!n;$('#includeMastered').checked=data.includeMastered===true;$('#masteredCount').textContent=n?'('+n+'문제)':'';}
function renderScopeStatus(scope){renderMasteredToggle(scope);
 const r=hasRanges(scope.subject)?scope.round||'':'',numeric=Number(r),isRound=!!r&&Hanneung.rounds.includes(numeric),el=$('#roundScore');el.hidden=true;el.textContent='';
 if(isRound){const s=Hanneung.stats(numeric,data.history);el.textContent='첫 시도 '+s.answered+'/'+s.total+'문제 · '+(s.complete?'점수 ':'현재 획득 ')+s.points+'/100점'+(s.bonus?' (공식 오류 문제 2점 포함)':'')+(s.complete?' · '+(s.points>=60?'3급 이상 기준 도달':'3급 기준 60점 미만'):'');el.hidden=false;}
 else if(orderedScope(r)){const ids=new Set(data.cards.filter(c=>inScope(c,scope)).map(c=>c.id)),p=firstPass(ids);el.textContent='첫 시도 '+p.answered+'/'+ids.size+'문제 · 정답 '+p.correct+'개';el.hidden=false;}
 const cancelled=$('#annulledQuestion');cancelled.hidden=!(isRound&&numeric===63);if(!cancelled.hidden&&!cancelled.querySelector('img'))appendPaper(cancelled,Hanneung.get('hanneung-63-42'));
}
function saveDraft(){if(!storageOK)return;try{writeState(KEY,data);}catch{notify('입력 내용을 저장하지 못했어요.');}}
function setQueueMode(value){
 if(queueMode()===value)return;
 const next=structuredClone(data);next.queueMode=value;delete next.quizFeedback;delete next.activePractice;
 if(commit(next)){sessionDirty=true;render();window.scrollTo(0,0);}
}
// BEGIN PAPER ORDER — 기출 회차에서는 앱이 문제를 고르지 않는다. 1번부터 마지막 번호까지 원문 순서대로만
// 내고, 마지막 문항을 풀면 멈춘다. 복습 일정·재시도 대기(retryAt)·형제 간격(ReviewPolicy.separate)
// 어느 것도 회차 안에서는 적용하지 않는다. 어제 맞힌 문제도 제자리에 다시 나온다.
// 답안 기록과 복습 일정 갱신은 평소와 똑같다 — 바뀌는 것은 "다음에 무엇을 낼지"뿐이다.
// 저장하지 않는 세션 한정 위치라 회차를 다시 열면 언제나 1번부터 시작한다.
let paperCursor=null;
function paperIndex(scope){if(!paperCursor||!sameScope(paperCursor.scope,scope))paperCursor={scope:{subject:scope.subject||'',topic:scope.topic||'',round:scope.round||''},index:0};return paperCursor.index;}
function paperAdvance(){if(paperCursor)paperCursor={...paperCursor,index:paperCursor.index+1};}
function paperRestart(){if(paperCursor)paperCursor={...paperCursor,index:0};}
// END PAPER ORDER
// A wrong answer today also brings back the other questions on the same concept (still after the sibling gap).
// BEGIN QUEUE MODES — 무엇을 먼저 낼지만 고른다. 채점·기록·복습 일정은 어느 모드에서도 평소와 똑같다.
// 늘 고른 범위 안에서만 돈다(호출부가 이미 inScope로 거른 카드를 넘긴다). 낼 게 없으면 없다고 말한다.
const QUEUE_MODES=[['default','기본 · 복습 주기 순'],['wrong','틀린 문제 위주'],['fresh','안 푼 문제 먼저']];
function queueMode(){return QUEUE_MODES.some(([v])=>v===data.queueMode)?data.queueMode:'default';}
let queueModeFilled=false;
let historyStatsCache=null;
// 문제별 오답 횟수와 시도 여부를 기존 history에서만 읽는다. 새 저장 필드가 없어 기기 간 동기화에도 그대로 남는다.
function historyStats(){
 if(historyStatsCache?.rows===data.history)return historyStatsCache.value;
 const wrong=new Map(),seen=new Set();
 for(const h of data.history){seen.add(h.cardId);if(h.result==='wrong')wrong.set(h.cardId,(wrong.get(h.cardId)||0)+1);}
 const value={wrong,seen};historyStatsCache={rows:data.history,value};return value;
}
function waitingRetry(c){return !!c.retryAt&&Date.parse(c.retryAt)>Date.now();}
// 형제 간격은 다른 문제가 있을 때만 사이를 벌린다. 풀 문제가 그것뿐이면 막지 않고 먼저 풀린 순서대로 낸다.
function settle(order){
 const queue=ReviewPolicy.separate(order,data.history);
 if(!queue.ready.length&&queue.waiting.length){const promoted=[...queue.waiting].sort((a,b)=>a.until-b.until).map(w=>w.card);return {ready:promoted,waiting:[],nextAt:null};}
 return queue;
}
// 틀린 문제 위주: 오답 이력이 있는 문제를 복습 주기와 무관하게 많이 틀린 순으로 낸다.
// 주기를 기다리면 대개 0문제가 되어 모드가 무의미해지기 때문이다. 5분 재시도 대기만은 그대로 지킨다.
function wrongQueue(cards){
 const {wrong}=historyStats();
 const pool=cards.filter(c=>c.pendingAttempt||(wrong.has(c.id)&&!waitingRetry(c)));
 const rank=new Map(cards.map((c,i)=>[c.id,i]));
 pool.sort((a,b)=>Number(!!b.pendingAttempt)-Number(!!a.pendingAttempt)||(wrong.get(b.id)||0)-(wrong.get(a.id)||0)||rank.get(a.id)-rank.get(b.id));
 return settle(pool);
}
// 외운 문제(v131): 제때 네 번 맞힌 문제(7·14·30일 통과). 특정 강의·범위를 풀 때는 옵션을 켜지 않으면 안 나오고,
// 과목 전체로 풀 때는 복습일이 지난 것 중 하루 7분의 1 정도만 무작위로 섞인다(날짜로 고정된 무작위라 하루 안에서는 같다). 모의고사에서는 나온다(계획서).
const isMastered=c=>(c.streak||0)>=ReviewSchedule.MASTER_STREAK;
const rangedScope=sc=>!!(sc&&(sc.topic||sc.round));
function dailyPick(id){let h=2166136261;for(const ch of day()+id)h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h%7===0;}
function withoutMastered(cards,ranged){return cards.filter(c=>!isMastered(c)||c.pendingAttempt||(ranged?data.includeMastered===true:dailyPick(c.id)));}
function reviewQueue(cards,ranged=false){
 cards=withoutMastered(cards,ranged);
 const mode=queueMode();
 if(mode==='wrong')return wrongQueue(cards);
 const due=ReviewLearning.queue(cards),ids=new Set(due.map(c=>c.id)),today=day(),missed=new Map(),last=new Map();
 for(const h of data.history){const at=h.at||h.date;if((last.get(h.cardId)||'')<at)last.set(h.cardId,at);if(h.mode==='quiz'&&h.result==='wrong'&&h.date===today){const k=ReviewPolicy.concept(h.cardId);if((missed.get(k)||'')<at)missed.set(k,at);}}
 const extra=missed.size?cards.filter(c=>{if(ids.has(c.id))return false;const at=missed.get(ReviewPolicy.concept(c.id));return !!at&&(last.get(c.id)||'')<at;}):[];
 const queue=settle(ReviewPolicy.skipTwins([...due,...extra],data.history).cards);
 // 안 푼 문제 먼저: 대기열을 그대로 두고 한 번도 안 푼 문제만 앞으로 당긴다. 빠지는 카드는 없다.
 if(mode==='fresh'&&queue.ready.length){const {seen}=historyStats(),fresh=queue.ready.filter(c=>!seen.has(c.id));
  if(fresh.length&&fresh.length<queue.ready.length)return {...queue,ready:[...fresh,...queue.ready.filter(c=>seen.has(c.id))]};}
 return queue;
}
// END QUEUE MODES
// 경험치·레벨(xp.js). 풀면 언제나 오르고, 처음 맞힘·틀렸던 문제 맞힘이 크게 오른다. 하루 목표는 과목마다 사용자가 정했을 때만(전체 목표는 v135에서 없앰).
function renderXp(){
 let s;try{s=StudyXp.summary(data.history,data.explanationViews||[],StudyXp.day());}catch{$('#xpCard').hidden=true;return;}
 const o=StudyXp.overallTier(data.history,ReviewPolicy.concept,allRuleTotals());
 $('#xpCard').hidden=false;$('#xpLevel').replaceChildren(badge({level:s.level,tier:o.tier}),document.createTextNode(' '+o.tier.name+' · Lv '+s.level));
 $('#xpAcc').textContent=tierNote(o);
 $('#xpStreak').textContent=s.streak?'🔥 '+s.streak+'일 연속'+(s.solvedToday?'':' · 오늘 풀면 이어져요'):'오늘 한 문제 풀면 🔥 연속 시작';
 $('#xpBar').max=s.need;$('#xpBar').value=s.into;
 $('#xpText').textContent='다음 레벨까지 '+(s.need-s.into)+' XP · 오늘 +'+s.todayXp+' XP ('+s.todaySolves+'문제) · 누적 '+s.total+' XP';
 const goals=subjectGoals(),per=todayBySubject(),parts=Object.entries(goals).map(([sub,g])=>sub+' '+(per[sub]||0)+'/'+g+((per[sub]||0)>=g?' ✅':''));
 // v135: 전체 하루 목표는 없앴다(사용자: "전체 목표는 제거"). 과목 목표만 모아 보여 준다.
 $('#xpGoal').textContent=parts.length?'오늘 과목 목표: '+parts.join(' · '):'';$('#xpGoal').hidden=!parts.length;
}
// 과목별 하루 목표(v135, 사용자: "오늘 풀 문제 목표도 과목별로 커스텀하게 — 현재는 구분이 안 되어 있음"). data.dailyGoals = {과목: 문제 수}.
function subjectGoals(){const g=data.dailyGoals;return g&&typeof g==='object'?g:{};}
function todayBySubject(){const bySubject=new Map(data.cards.map(c=>[c.id,c.subject]));try{return StudyXp.solvesBySubject(data.history,id=>bySubject.get(id)||null,StudyXp.day());}catch{return {};}}
function goalLine(done,goal){return done>=goal?'✅ 오늘 목표 달성 '+done+'/'+goal+'문제':'오늘 목표 '+done+'/'+goal+'문제';}
function setSubjectGoal(subject,value){
 const next=structuredClone(data),goals={...(next.dailyGoals||{})};if(value===null)delete goals[subject];else goals[subject]=value;
 if(Object.keys(goals).length)next.dailyGoals=goals;else delete next.dailyGoals;
 if(commit(next)){render();notify(value===null?subject+' 하루 목표를 없앴어요.':subject+' 하루 목표를 '+value+'문제로 정했어요.');}
}
function renderSubjectGoal(s){
 const goal=subjectGoals()[s],done=todayBySubject()[s]||0;
 $('#subjectGoalText').textContent=goal?goalLine(done,goal):'';$('#subjectGoalText').hidden=!goal;
 $('#subjectGoalEdit').querySelector('summary').textContent=goal?'이 과목 하루 목표 바꾸기 ('+goal+'문제)':'이 과목 하루 목표 정하기';
 if(document.activeElement?.id!=='subjectGoalInput')$('#subjectGoalInput').value=goal||'';
}
// 과목 레벨 뱃지(v124): 육각형 안에 레벨, 레벨 구간마다 색(브론즈·실버·골드·플래티넘·다이아).
// 외운 비율의 분모: 과목마다 풀 수 있는 규칙 수(쌍둥이 묶음 하나 = 규칙 하나, 기출은 문제 하나).
function ruleTotals(){const t={},seen=new Set();for(const c of data.cards){if(!isPlayable(c))continue;const k=ReviewPolicy.concept(c.id);if(seen.has(k))continue;seen.add(k);const x=t[c.subject]||(t[c.subject]={self:0,exam:0});x[StudyXp.isExam(c.id)?'exam':'self']++;}return t;}
function allRuleTotals(){const out={self:0,exam:0};for(const x of Object.values(ruleTotals())){out.self+=x.self;out.exam+=x.exam;}return out;}
function subjectLevels(history=data.history){const bySubject=new Map(data.cards.map(c=>[c.id,c.subject]));try{return StudyXp.bySubject(history,data.explanationViews||[],id=>bySubject.get(id)||null,ReviewPolicy.concept,ruleTotals());}catch{return {};}}
function badge(s,big){const l=s||{level:1,tier:StudyXp.tier(0)},b=elem('span',undefined,'level-badge tier-'+l.tier.id+(big?' big':''));b.setAttribute('aria-label',l.tier.name+' 레벨 '+l.level);b.title=l.tier.name+' · Lv '+l.level;b.append(elem('small','Lv'),elem('b',String(l.level)));return b;}
// 뱃지 설명 한 줄(v138): 뱃지 색 = 외운 비율(자체제작·기출 반반), 숫자 = 레벨. 외우는 중인 규칙과 다음 등급 조건.
function tierNote(x){
 const fmt=n=>n.toLocaleString('ko-KR'),st=x.stages||[0,0,0,0],pools=[];
 if(x.self?.all)pools.push('자체제작 '+x.self.pct+'% ('+fmt(x.self.done)+'/'+fmt(x.self.all)+')');
 if(x.exam?.all)pools.push('기출 '+x.exam.pct+'% ('+fmt(x.exam.done)+'/'+fmt(x.exam.all)+')');
 let t='외운 비율 '+x.pct+'%'+(pools.length>1?' = 반반('+pools.join(' · ')+')':pools.length?' · '+pools[0]:'')+' · 외우는 중: 7일 통과 '+fmt(st[1])+' · 14일 통과 '+fmt(st[2]);
 if(!x.checked)t+=' — 맞힌 문제를 7일 뒤 · 그 뒤 14일 뒤 · 그 뒤 30일 뒤 다시 맞히면 외운 규칙이 돼요(틀리면 처음부터)';
 const i=StudyXp.TIERS.findIndex(t=>t[1]===x.tier.id),next=StudyXp.TIERS[i-1];if(next)t+=' · 다음 '+next[2]+': 외운 비율 '+next[0]+'%';
 return t;
}
function xpAwardNode(reviewId){
 let a;try{a=StudyXp.lastAward(data.history,data.explanationViews||[],reviewId);}catch{return null;}if(!a)return null;
 const box=elem('div',undefined,'xp-award'+(a.parts.length>1?' is-bonus':''));
 box.append(elem('strong','+'+a.xp+' XP'),elem('span',a.parts.map(p=>p.label+' +'+p.xp).join(' · ')));
 if(a.levelAfter>a.levelBefore)box.append(elem('p','🎉 레벨 '+a.levelAfter+' 달성!','xp-levelup'));
 const subject=data.cards.find(c=>c.id===a.cardId)?.subject;
 if(subject){const now=subjectLevels()[subject],before=subjectLevels(data.history.filter(h=>h.id!==reviewId))[subject];
  if(now){const line=elem('p',undefined,'xp-subject');line.append(badge(now),document.createTextNode(' '+subject+' Lv '+now.level+' · 다음까지 '+(now.need-now.into)+' XP'));box.append(line);
   if(now.level>(before?.level||1))box.append(elem('p','🎉 '+subject+' 레벨 '+now.level+' 달성!','xp-levelup'));
   if(now.tier.id!==(before?.tier.id||'iron'))box.append(elem('p','🏅 '+subject+' '+now.tier.name+' 뱃지! 외운 비율 '+now.pct+'%','xp-levelup'));}}
 return box;
}
// 예상점수(score.js): 기출 첫 풀이만, 4과목 평균 + 가산점을 사용자가 정한 목표와 비교한다(기본 국가직 전산9급 95 · 가산 5).
function examScore(){const bySubject=new Map(data.cards.map(c=>[c.id,c.subject]));return ExamScore.summary(data.history,id=>bySubject.get(id)||null,data.targetExam);}
const fmt1=x=>Number.isInteger(x)?String(x):x.toFixed(1);
function renderScoreLine(){
 let s;try{s=examScore();}catch{$('#homeScore').hidden=true;return;}$('#homeScore').hidden=false;
 $('#homeScore').textContent=s.total?'예상 '+fmt1(s.total.score)+'점 / 목표 '+fmt1(s.target.cutoff)+'점 ('+(s.total.gap>=0?'+':'')+fmt1(s.total.gap)+') · '+s.target.name+' ›'
  :'예상점수: 기출을 더 풀면 나와요 — '+s.missing.map(m=>m.subject+' '+m.need+'문제').join(' · ')+' ›';
}
function renderScore(){
 let s;try{s=examScore();}catch{$('#scoreTotal').textContent='풀이 기록을 확인해야 해요.';return;}
 $('#scoreTarget').textContent='목표: '+s.target.name+' · 합격선 '+fmt1(s.target.cutoff)+'점(가산점 포함) · 내 가산점 '+fmt1(s.target.bonus)+'점';
 if(s.total){$('#scoreTotal').replaceChildren(document.createTextNode('예상 '+fmt1(s.total.score)+'점'),elem('small','범위 '+fmt1(s.total.low)+'~'+fmt1(s.total.high)+' · 4과목 평균 '+fmt1(s.total.raw)+' + 가산 '+fmt1(s.target.bonus),'score-sub'));
  $('#scoreGap').textContent=s.total.gap>=0?'✅ 목표보다 '+fmt1(s.total.gap)+'점 높아요':'목표까지 '+fmt1(-s.total.gap)+'점 더 필요해요';$('#scoreGap').className='score-gap '+(s.total.gap>=0?'is-over':'is-under');}
 else{$('#scoreTotal').textContent='4과목 모두 기출을 10문제 이상 처음 풀면 예상점수가 나와요.';$('#scoreGap').textContent='남은 것: '+s.missing.map(m=>m.subject+' '+m.need+'문제').join(' · ');$('#scoreGap').className='score-gap';}
 const body=$('#scoreRows');body.replaceChildren();
 for(const x of s.subjects){if(!x.ranked&&!x.n&&!x.self)continue;const tr=elem('tr',undefined,x.ranked?'':'score-unranked');
  const name=elem('td',x.subject);if(!x.ranked)name.append(elem('small',' 평균 제외'));const tried=elem('td',x.n?x.correct+'/'+x.n:'0');if(x.self)tried.append(elem('small','자체제작 '+x.self.rate+'% ('+x.self.n+')','score-self'));
  tr.append(name,elem('td',x.ready?String(x.score):'—','score-num'),elem('td',x.ready?x.low+'~'+x.high:x.n?x.need+'문제 더':'—','score-num'),tried);body.append(tr);}
 if(document.activeElement?.closest?.('#targetEdit'))return;
 $('#targetName').value=s.target.name;$('#targetCutoff').value=s.target.cutoff;$('#targetBonus').value=s.target.bonus;
}
function saveTarget(value){
 const next=structuredClone(data);if(value===null)delete next.targetExam;else next.targetExam=value;
 if(commit(next)){renderScore();renderScoreLine();notify(value===null?'목표를 기본값으로 되돌렸어요.':'목표를 저장했어요.');}
}
let creditHistoryLimit=14;
function renderStudyCredit(){
 try{
  const s=StudyCredit.summary(data.history,StudyCredit.day(),data.explanationViews||[]);
  $('#studyToday').textContent=StudyCredit.format(s.todayMinutes);$('#studyTotal').textContent=StudyCredit.format(s.totalMinutes);
  $('#studyCreditCount').textContent='오늘 풀이 '+s.todayAttempts+'회 · 해설 '+s.todayExplanations+'회 / 누적 풀이 '+s.attempts+'회 · 해설 '+s.explanations+'회';
  $('#studyCreditExcluded').textContent=s.excluded?'문제풀이 여부가 확인되지 않는 이전 기록 '+s.excluded+'건은 제외했어요.':'';
  const list=$('#studyTimeHistory');list.replaceChildren();
  for(const row of s.days.slice(0,creditHistoryLimit))list.append(elem('li',row.date+' · 풀이 '+row.attempts+'회 · 해설 '+row.explanations+'회 · '+StudyCredit.format(row.minutes)));
  if(!s.days.length)list.append(elem('li','문제를 풀고 채점하면 날짜별 환산 시간이 남아요.'));
  $('#studyTimeMore').hidden=s.days.length<=creditHistoryLimit;
 }catch{
  $('#studyToday').textContent='확인 필요';$('#studyTotal').textContent='확인 필요';$('#studyCreditCount').textContent='저장된 풀이 기록을 확인해야 해요.';$('#studyTimeHistory').replaceChildren();$('#studyTimeMore').hidden=true;
 }
}
function viewed(reviewId){return (data.explanationViews||[]).some(v=>v.id===reviewId);}
function nextLabel(reviewId){return viewed(reviewId)?'다음 문제':'해설 건너뛰고 다음 문제';}
function updateExplanationCredits(){for(const node of document.querySelectorAll('[data-explanation-review]'))node.querySelector('.explanation-credit').textContent=viewed(node.dataset.explanationReview)?'해설 열기 · 환산 시간 +1분 반영됨':'이 풀이의 해설을 처음 펼치면 +1분';const next=$('#nextQuestion');if(next)next.textContent=nextLabel(next.dataset.review);}
function creditExplanation(reviewId){
 const review=data.history.find(h=>h.id===reviewId&&h.mode==='quiz');if(!review)return;
 if((data.explanationViews||[]).some(v=>v.id===reviewId)){updateExplanationCredits();return;}
 const next=structuredClone(data);next.explanationViews=StudyCredit.unionExplanations(next.explanationViews||[],[{id:reviewId,openedAt:Date.now()}]);
 if(commit(next)){renderStudyCredit();updateExplanationCredits();}
}
function attachExplanationCredit(details,reviewId,location){
 if(!reviewId||!data.history.some(h=>h.id===reviewId&&h.mode==='quiz'))return;
 details.dataset.explanationReview=reviewId;details.dataset.explanationKey=location+'-'+reviewId;
 details.append(elem('small',(data.explanationViews||[]).some(v=>v.id===reviewId)?'해설 열기 · 환산 시간 +1분 반영됨':'이 풀이의 해설을 처음 펼치면 +1분','explanation-credit'));
 // Listen to the user's summary activation, not a programmatic open-state restoration.
 details.querySelector('summary').addEventListener('click',()=>{if(!details.open)creditExplanation(reviewId);});
}
function feedbackReviewId(feedback){
 if(feedback.reviewId)return feedback.reviewId;
 return data.history.filter(h=>h.cardId===feedback.cardId&&h.mode==='quiz'&&(!feedback.exercise?.exerciseId||!h.detail||h.detail.exerciseId===feedback.exercise.exerciseId)).sort((a,b)=>(a.at||a.date).localeCompare(b.at||b.date)||a.id.localeCompare(b.id)).at(-1)?.id;
}
function restoreExplanationPanels(keys){for(const node of document.querySelectorAll('[data-explanation-key]'))if(keys.has(node.dataset.explanationKey))node.open=true;}
function appendCorrection(parent,snapshot){const update=ContentCorrections.find(snapshot);if(!update)return;const note=elem('div',undefined,'content-correction');note.append(elem('strong','문제·해설 수정 안내'),elem('p','아래 기록은 수정 전 문제의 당시 채점 결과입니다.'),elem('p',update.note),elem('p','현재 문제: '+update.question),elem('p','현재 정답: '+update.answer),elem('p',update.explanation));parent.append(note);}
// English sentence options carry per-option marks: null when the sentence is right, else [{wrong,fix}]. Show the wrong words and the fix in place.
// A mark may carry neighbor words for uniqueness ("tourists visited" → "tourists visiting"); highlight only the words that change.
function narrowMark(m){
 const w=m.wrong.split(' '),f=m.fix.split(' ');let a=0,b=0;
 while(a<w.length-1&&a<f.length-1&&w[a]===f[a])a++;
 while(b<w.length-a-1&&b<f.length-a-1&&w[w.length-1-b]===f[f.length-1-b])b++;
 const lead=w.slice(0,a).join(' ');return {skip:lead?lead.length+1:0,wrong:w.slice(a,w.length-b).join(' '),fix:f.slice(a,f.length-b).join(' ')};
}
// The right sentence gets a label that fits the question: translation items (우리말을 영어로 옳게 옮긴 것) are judged on meaning too.
function okLabel(quiz){return /옳게 옮긴/.test(quiz?.question||'')?' (옳게 옮김)':' (어법상 옳음)';}
// struck: the option's full corrected sentences follow underneath, so the wrong words are only struck out (no inline → fix).
function markedChoice(text,marks,ok=' (어법상 옳음)',struck=false){
 const span=elem('span');let start=0;
 const hits=(marks||[]).map(m=>{const n=narrowMark(m),at=text.indexOf(m.wrong);return {m:n,at:at<0?-1:at+n.skip};}).filter(h=>h.at>=0).sort((a,b)=>a.at-b.at);
 for(const {m,at} of hits){if(at<start)continue;span.append(document.createTextNode(text.slice(start,at)));if(struck)span.append(elem('mark',m.wrong,'choice-error choice-struck'));else span.append(elem('mark',m.wrong,'choice-error'),elem('span',' → '+m.fix,'choice-fix'));start=at+m.wrong.length;}
 span.append(document.createTextNode(text.slice(start)));if(!marks)span.append(elem('span',ok,'choice-ok'));return span;
}
function markedLine(label,quiz,i){const p=elem('p',label+(i+1)+'. ');p.append(markedChoice(quiz.choices[i],quiz.marks[i],okLabel(quiz)));return p;}
// quiz.fixes[i]: every correct English sentence for option i (null = none written). The first is the one to write on the exam (★ when there are several).
// Words that differ from the option's own English are painted green.
function englishOf(choice){const at=choice.indexOf(' → ');return at<0?choice:choice.slice(at+3);}
function fixLine(base,fix,best){
 const a=base.split(' '),b=fix.split(' ');let s=0,e=0;
 while(s<a.length&&s<b.length&&a[s]===b[s])s++;
 while(e<a.length-s&&e<b.length-s&&a[a.length-1-e]===b[b.length-1-e])e++;
 const pre=b.slice(0,s).join(' '),mid=b.slice(s,b.length-e).join(' '),post=b.slice(b.length-e).join(' ');
 const p=elem('p',undefined,'choice-fix-line');p.append(elem('span','✓','choice-fix-check'));const en=elem('span',undefined,'choice-fix-text');
 en.append(document.createTextNode(pre+(pre&&(mid||post)?' ':'')));if(mid)en.append(elem('mark',mid,'choice-fix-word'));en.append(document.createTextNode((post&&mid?' ':'')+post));
 if(best)en.append(elem('span','★추천','choice-fix-best'));p.append(en);return p;
}
// 대괄호 고르기 문제(보기 = 문장 속 조각)는 고친 문장 전체를 해설 맨 위에 한 번 보여 준다(quiz.sentence).
function sentenceLine(quiz){if(!quiz.sentence)return [];const base=(quiz.question.split('\n').find(l=>l.includes('['))||'').replace(/[\[\]]/g,''),box=elem('div',undefined,'choice-sentence');box.append(elem('strong','바르게 고친 문장'),fixLine(base,quiz.sentence,false));return [box];}
function fixLines(quiz,i){const list=quiz.fixes?.[i];if(!list?.length)return [];const base=englishOf(quiz.choices[i]);return list.map((f,k)=>fixLine(base,f,k===0&&list.length>1));}
// Each option as its own block: the sentence (wrong words marked) and that option's explanation right under it.
function choiceExplanations(quiz,split,picked){
 const box=elem('div',undefined,'choice-explanations');box.append(...sentenceLine(quiz));
 quiz.choices.forEach((c,i)=>{
  const answer=i===quiz.correctIndex,mine=i===picked&&!answer,item=elem('div',undefined,'choice-explain'+(answer?' is-answer':mine?' is-picked':''));
  const head=elem('p',(i+1)+'. ','choice-explain-sentence');head.append(quiz.marks?markedChoice(c,quiz.marks[i],okLabel(quiz),!!quiz.fixes?.[i]?.length):document.createTextNode(c));
  if(answer)head.append(elem('span','정답','choice-answer-tag'));if(mine)head.append(elem('span','내 답','choice-picked-tag'));
  item.append(head,...fixLines(quiz,i),elem('p',split.per[i],'choice-explain-text'));box.append(item);
 });
 if(split.rest.length)box.append(...explanationParts(split.rest.join('\n\n')));
 return box;
}
function markedList(quiz){const box=elem('div',undefined,'marked-choices');box.append(elem('strong','보기별 틀린 곳'));quiz.choices.forEach((c,i)=>{const p=elem('p',(i+1)+'. ','example');p.append(markedChoice(c,quiz.marks[i],okLabel(quiz),!!quiz.fixes?.[i]?.length));box.append(p,...fixLines(quiz,i));});return box;}
// 기출형 자료 제시 문제는 발문 뒤 빈 줄 다음에 [자료 이름]으로 시작하는 자료를 둔다. 발문은 크게, 자료는 상자에 보통 글씨로 보여 준다.
function questionNodes(text){const at=text.indexOf('\n\n[');if(at<0)return [elem('div',text,'question')];return [elem('div',text.slice(0,at),'question'),elem('div',text.slice(at+2),'question-clue')];}
// 영어 해설 끝의 ‘외우는 공식’ 문단(규칙마다 같은 외우기 블록)은 상자로 따로 보여 준다. 줄 머리(외우는 공식·입으로 외우기)와 이름표(꿀팁·함정)만 굵게 한다.
// 2026-09-19: 한국사 해설의 ‘외우는 비결’ 문단은 전수 뗐다(사용자 요청 — 문제에서는 요약만 본다). 이 상자는 이제 영어 공식 전용이다.
function explanationParts(text){
 const paras=String(text).split(/\n\s*\n/),at=paras.findIndex(p=>p.startsWith('외우는 공식\n'));
 if(at<0)return [explanationText(text)];
 const out=[],before=paras.slice(0,at).join('\n\n'),after=paras.slice(at+1).join('\n\n'),box=elem('div',undefined,'formula-box');
 if(before)out.push(explanationText(before));
 paras[at].split('\n').forEach(line=>{const label=/^(꿀팁|함정): /.exec(line),p=elem('p',undefined,/^(외우는 공식|입으로 외우기)$/.test(line)?'formula-head':label?'formula-note':/^✗/.test(line)?'formula-bad':/^예\)/.test(line)?'formula-example':'formula-line');
  if(label)p.append(elem('strong',label[1]+': '),document.createTextNode(line.slice(label[0].length)));else p.append(...keyText(line));box.append(p);});
 out.push(box);if(after)out.push(explanationText(after));return out;
}
// **말** 은 외울 핵심 — 색칠해 보여 준다(외우는 공식 상자·규칙 정리).
function keyText(line){return line.split(/\*\*(.+?)\*\*/).map((part,i)=>i%2?elem('mark',part,'key-word'):document.createTextNode(part));}
// 규칙 정리: 줄마다 한 문단. [소제목] 줄은 굵게, ✓/✗로 시작하는 줄은 맞는·틀린 예문으로 색을 달리한다.
function ruleLines(text,cls){return String(text).split('\n').filter(Boolean).map(line=>{const p=elem('p',undefined,cls+(/^✓/.test(line)?' rule-ok':/^✗/.test(line)?' rule-bad':/^【[^】]*】$/.test(line)?' rule-head':''));p.append(...keyText(line));return p;});}
function explanationText(text){
 const p=elem('p',undefined,'explanation-text');let start=0;
 for(const match of text.matchAll(/https:\/\/(?:contents\.history\.go\.kr|www\.heritage\.go\.kr|www\.museum\.go\.kr|encykorea\.aks\.ac\.kr|cl\.mofa\.go\.kr|www\.kookje\.co\.kr|www\.kmdb\.or\.kr)\/[^\s]+/g)){
  p.append(document.createTextNode(text.slice(start,match.index)));const link=elem('a','근거 자료 열기');link.href=match[0];link.target='_blank';link.rel='noopener noreferrer';p.append(link);start=match.index+match[0].length;
 }
 p.append(document.createTextNode(text.slice(start)));return p;
}
function appendNewPaperExplanation(parent,id,previous,reviewId,location){
 if(!Hanneung.hasExplanation(id))return;const current=Hanneung.explanation(id);if(current===previous)return;
 const details=elem('details',undefined,'lesson');details.append(elem('summary','추가된 상세 해설 보기'),explanationText(current));attachExplanationCredit(details,reviewId,location);parent.append(details);
}
// Only explicit user choices move the shared study position; incoming sync and redraws never do.
let sessionDirty=false;
function sessionSnapshot(){const s=data.practiceScope||{},a=data.activePractice,e=a?.exercise;return {subject:s.subject||'',topic:s.topic||'',round:s.round||'',cardId:e?a.cardId:null,exerciseId:e?.exerciseId||null,variantIndex:e?(e.variantIndex??0):null,type:e?e.type:null,choices:e?.type==='choice'?[...e.choices]:null};}
function stampSession(){if(!storageOK)return;let session;try{session=ProgressSync.session({at:Math.max(Date.now(),(data.session?.at||0)+1),...sessionSnapshot()});}catch{return;}data.session=session;try{writeState(KEY,data);window.dispatchEvent(new Event('study-progress-saved'));}catch{}}
function render(){renderView();if(sessionDirty){sessionDirty=false;stampSession();}}
// Screens: home (subjects) → subject (resume / choose range) → range → quiz (question, then explanation). Progress is separate.
const VIEWS=['home','subject','range','quiz','progress','memorize'];
let view='home',viewSubject='';
function go(name,subject=viewSubject,replace=false){view=name;viewSubject=subject;const depth=(history.state?.depth||0)+(replace?0:1);try{history[replace?'replaceState':'pushState']({view:name,subject,depth},'');}catch{}notify('');render();window.scrollTo(0,0);}
function goBack(){if(history.state?.depth>0){history.back();return;}const parent=view==='quiz'||view==='range'?'subject':'home';go(parent,view==='quiz'?scopeOf().subject:viewSubject,true);}
try{history.replaceState({view:'home',subject:'',depth:0},'');}catch{}
window.addEventListener('popstate',e=>{view=VIEWS.includes(e.state?.view)?e.state.view:'home';viewSubject=e.state?.subject||'';notify('');render();window.scrollTo(0,0);});
function subjectsList(){return [...new Set(data.cards.filter(isPlayable).map(c=>c.subject))];}
function questionCount(cards){return cards.reduce((n,c)=>n+(QUIZ_OPTIONS[c.id]||Gichul.known(c.id)?1:0)+(PRACTICE_BANK[c.id]?.variants.length||0),0);}
// 화면의 모든 수는 "문제" 한 단위로 센다. 문제 하나가 곧 복습 일정 하나이므로(content-audit.cjs가 강제) 두 수는 같은 단위다.
// 풀어야 할 문제 = 처음 푸는 문제(제한 없음) + 복습 주기가 된 문제. 늘 고른 범위 안에서만 센다.
function countLine(cards){return '풀어야 할 문제 '+questionCount(reviewQueue(cards).ready)+'/'+questionCount(cards);}
// 그날 푼 서로 다른 문제 수. 같은 문제를 여러 번 풀어도 한 문제로 센다(풀이 횟수는 학습량 환산 시간에 따로 나온다).
function solvedOn(ids,date){return new Set(data.history.filter(h=>h.date===date&&ids.has(h.cardId)).map(h=>h.cardId)).size;}
function menuItem(title,detail,fn,cls='menu-item'){const b=btn('',fn,cls);b.type='button';b.append(elem('strong',title));if(detail)b.append(elem('span',detail));return b;}
function lastScope(subject){const s=data.lastScopes?.[subject]||(data.practiceScope?.subject===subject?data.practiceScope:null);return s?{subject,topic:s.topic||'',round:s.round||''}:null;}
function openScope(scope,resume=false){
 scope={subject:scope.subject||'',topic:TOPIC_SUBJECTS.has(scope.subject)?scope.topic||'':'',round:hasRanges(scope.subject)?scope.round||'':''};
 if(resume&&sameScope(scopeOf(),scope)){go('quiz');return;}
 const next=structuredClone(data);next.practiceScope=scope;if(scope.subject)next.lastScopes={...(next.lastScopes||{}),[scope.subject]:scope};delete next.quizFeedback;delete next.activePractice;
 paperCursor=null;
 if(commit(next)){sessionDirty=true;go('quiz');}
}
function renderView(){
 $('#date').textContent=new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});
 if((view==='subject'||view==='range')&&!viewSubject)view='home';
 for(const v of VIEWS)$('#'+v+'View').hidden=v!==view;document.body.dataset.view=view;
 // 과목 선택 화면을 벗어나면 승인 관리는 닫는다: 다시 돌아왔을 때 오래된 목록이 남지 않는다.
 if(view!=='home')$('#adminPanel').hidden=true;
 if(view==='home')renderHome();else if(view==='subject')renderSubject();else if(view==='range')renderRange();else if(view==='progress')renderProgress();else if(view==='memorize')renderMemorize();else renderQuiz();
}
function renderHome(){
 renderXp();renderScoreLine();const list=$('#subjectList'),playable=data.cards.filter(isPlayable);list.replaceChildren();
 const levels=subjectLevels();
 for(const s of subjectsList()){const cards=playable.filter(c=>c.subject===s),goal=subjectGoals()[s],item=menuItem(s,countLine(cards)+(goal?' · '+goalLine(todayBySubject()[s]||0,goal):''),()=>go('subject',s),'menu-item with-badge');item.append(badge(levels[s]));list.append(item);}
 if(!list.children.length)list.append(elem('p',data.cards.length?'풀 수 있는 문제가 아직 없어요.':'문제를 불러오는 중입니다.'));
}
// 외울 것: 목록 화면(viewSubject 비어 있음) → 한 목록 화면(viewSubject = 목록 id). 가림·확인은 이 화면에서만 쓰고 저장하지 않는다.
const MEMO_SCOPE='과목:';
let memorizeShown=new Set();
function renderMemorize(){
 // viewSubject는 '과목:<과목 이름>'이면 그 과목의 목록 화면, 아니면 목록 하나의 id다.
 const body=$('#memorizeBody'),subject=viewSubject.startsWith(MEMO_SCOPE)?viewSubject.slice(MEMO_SCOPE.length):'',set=subject?null:MEMORIZE.get(viewSubject);body.replaceChildren();
 $('#memorizeTitle').textContent=set?set.title:subject?subject+' · 외울 것':'외울 것';
 if(!set){
  body.append(elem('p','가려 둔 칸을 먼저 떠올린 뒤 눌러서 확인해요. 공부한 범위까지만 들어 있어요.','status'));
  const list=elem('div',undefined,'menu-list'),sets=subject?MEMORIZE.sets.filter(x=>x.subject===subject):MEMORIZE.sets;
  for(const x of sets)list.append(menuItem(x.title,(subject?'':x.subject+' · ')+MEMORIZE.size(x)+'칸'+(data.memorizeLast===x.id?' · 마지막으로 본 목록':''),()=>{memorizeShown=new Set();if(data.memorizeLast!==x.id){data.memorizeLast=x.id;saveDraft();}go('memorize',x.id);}));
  body.append(list);return;
 }
 const total=MEMORIZE.size(set),keys=[];
 const cell=(key,prompt,answer,detail,photo)=>{keys.push(key);const open=memorizeShown.has(key),b=btn('',()=>{if(memorizeShown.has(key))memorizeShown.delete(key);else memorizeShown.add(key);render();},'memorize-cell'+(open?' shown':'')+(photo?' photo':''));
  b.type='button';b.setAttribute('aria-pressed',String(open));
  // 사진 칸: 앞면이 사진이고 누르면 이름이 나온다. 사진은 열려도 남겨 둔다 — 사진과 이름을 함께 봐야 외워진다.
  if(photo){const im=elem('img');im.src=photo;im.alt=prompt;im.loading='lazy';b.append(im);}
  b.append(elem('strong',open&&answer?answer:(photo?'':prompt)));
  if(!open)b.append(elem('span','눌러서 확인','memorize-hidden'));
  // 영어 공식 카드 뒷면은 **핵심** 색칠 · ✗ 줄 빨강 · 예) 줄을 해설의 외우는 공식 상자와 같게 보여 준다.
  else if(detail&&detail.includes('**')){const box=elem('span',undefined,'memorize-formula');for(const line of detail.split('\n')){const l=elem('span',undefined,/^✗/.test(line)?'formula-bad':/^예\)/.test(line)?'formula-example':'formula-line');l.append(...keyText(line));box.append(l);}b.append(box);}
  else b.append(elem('span',detail||(answer?'':'—')));return b;};
 const content=[];
 if(set.lines)set.lines.forEach((line,li)=>{
  const group=elem('div',undefined,'memorize-line'),grid=elem('div',undefined,'memorize-grid');
  group.append(elem('p',line.chant,'memorize-chant'));
  line.items.forEach((item,i)=>grid.append(cell(set.id+':'+li+':'+i,(i+1)+'. '+[...line.chant][i],(i+1)+'. '+item.name,item.facts.length?item.facts.join(' · '):'아직 공부하지 않은 범위')));
  group.append(grid);content.push(group);
 });
 else if(set.pairs)set.pairs.forEach(([left,leftDetail,right,rightDetail],pi)=>{
  const row=elem('div',undefined,'memorize-pair');
  row.append(cell(set.id+':'+pi+':0',left,'',leftDetail),cell(set.id+':'+pi+':1',right,'',rightDetail));content.push(row);
 });
 else set.groups.forEach((g,gi)=>{
  const group=elem('div',undefined,'memorize-line'),grid=elem('div',undefined,'memorize-grid');
  group.append(elem('p',g.title,'memorize-group-title'));
  g.cards.forEach(([front,back,photo],ci)=>grid.append(cell(set.id+':'+gi+':'+ci,front,photo?back.split('\n')[0]:'',photo?back.split('\n').slice(1).join(' '):back,photo)));
  group.append(grid);content.push(group);
 });
 const bar=elem('div',undefined,'memorize-bar'),shown=keys.filter(k=>memorizeShown.has(k)).length;
 const all=btn('모두 보기',()=>{for(const k of keys)memorizeShown.add(k);render();}),none=btn('모두 가리기',()=>{memorizeShown=new Set();render();});all.type='button';none.type='button';
 bar.append(elem('span',shown+' / '+total+' 확인','memorize-count'),all,none);
 body.append(elem('p',set.hint,'status'),bar,...content);
}
function renderSubject(){
 const s=viewSubject,cards=data.cards.filter(c=>isPlayable(c)&&c.subject===s),ids=new Set(cards.map(c=>c.id)),today=day();
 $('#subjectTitle').textContent=s;renderSubjectGoal(s);
 {const l=subjectLevels()[s]||{level:1,into:0,need:StudyXp.subjectNeed(1),xp:0,...StudyXp.mastery([],ReviewPolicy.concept,ruleTotals()[s])};$('#subjectBadge').replaceChildren(badge(l,true));
  const bar=elem('progress',undefined,'xp-bar');bar.max=l.need;bar.value=l.into;$('#subjectLevel').replaceChildren(elem('span',l.tier.name+' · Lv '+l.level+' · 다음 레벨까지 '+(l.need-l.into)+' XP · 이 과목 누적 '+l.xp+' XP'),bar,elem('span',tierNote(l),'tier-note'));}
 $('#subjectSummary').textContent=countLine(cards)+' · 오늘 푼 문제 '+solvedOn(ids,today)+'개';
 // 외울 것은 과목 안에 둔다(2026-09-19 사용자: "외울것들은 과목별로 분류해서 정리해라 … 국어는 국어 클릭하면 거기서 외울것에 넣는방식").
 const sets=MEMORIZE.sets.filter(x=>x.subject===s),memo=$('#openMemorize');memo.hidden=!sets.length;
 if(sets.length)$('#memorizeHint').textContent=sets.length+'개 목록 · '+sets.reduce((n,x)=>n+MEMORIZE.size(x),0)+'칸 · '+sets.slice(0,3).map(x=>x.title).join(' · ')+(sets.length>3?' 외':'');
 const last=lastScope(s),open=sameScope(scopeOf(),last)&&(data.activePractice||data.quizFeedback);
 $('#resumeHint').textContent=last?scopeLabel(last)+(open?' · 풀던 문제부터':' · 이어서 풀기'):s+' 전체의 첫 문제부터 시작해요';
}
function renderRange(){
 const s=viewSubject,root=$('#rangeList'),cards=data.cards.filter(c=>isPlayable(c)&&c.subject===s);
 $('#rangeTitle').textContent=s+' · 연습 범위';root.replaceChildren();
 const group=(title,folded)=>{const g=elem('div',undefined,'menu-list');if(folded){const d=elem('details',undefined,'range-fold');d.append(elem('summary',title,'range-heading'),g);root.append(d);}else root.append(elem('h3',title,'range-heading'),g);return g;};
 const scope=(round,topic='')=>({subject:s,topic,round});
 // 회차 범위는 대기열과 무관하게 1번부터 끝까지 나오므로 '지금 풀 차례' 수를 붙이지 않는다. 대신 순서를 알린다.
 const option=(g,title,sc,extra)=>{const inside=cards.filter(c=>inScope(c,sc)),p=firstPass(new Set(inside.map(c=>c.id)));if(!inside.length)return;
  const total=questionCount(inside),first='첫 시도 '+p.answered+'/'+total+(p.answered?' · 정답 '+p.correct:'');
  const detail=sequentialScope(sc)?'전체 '+total+'문제 · '+first+' · 1번부터 순서대로':'풀어야 할 문제 '+questionCount(reviewQueue(inside,rangedScope(sc)).ready)+'/'+total+' · '+first;
  g.append(menuItem(title,detail+(extra?' · '+extra:''),()=>openScope(sc)));};
 // 공무원 기출은 과목마다 회차가 40개 가까이 된다. 한 줄로 늘어놓으면 휴대폰에서 원하는 회차를 찾기 어려워
 // 연도별로 접는다(range-fold 안에 range-fold). 최신 연도가 맨 위이고, 지금 풀던 회차가 든 연도(없으면 최신 연도)만 펼쳐 둔다.
 const paperYears=(parent,current)=>{
  const years=new Map();for(const p of Gichul.forSubject(s)){if(!years.has(p.year))years.set(p.year,[]);years.get(p.year).push(p);}
  const open=paperScope(current)?Gichul.paper(paperScope(current)).year:Math.max(...years.keys());
  for(const [year,list]of years){
   const ids=new Set(cards.filter(c=>list.some(p=>p.id===Gichul.paperOf(c.id))).map(c=>c.id)),first=firstPass(ids);
   const fold=elem('details',undefined,'range-fold paper-year'),g=elem('div',undefined,'menu-list');fold.open=year===open;
   fold.append(elem('summary',year+'년 · '+list.length+'회차 · 첫 시도 '+first.answered+'/'+ids.size+'문제','range-heading'),g);parent.append(fold);
   for(const p of list)option(g,p.range,scope('paper-'+p.id));
  }
 };
 const paperCount=Gichul.forSubject(s).length;
 if(s==='한국사'){
  const round=scopeOf().round;
  // 자체 제작은 교재 진도순, 기출은 회차별. 같은 문제를 여러 순서로 제공하면 어디까지 풀었는지
  // 알기 어려워진다. 문항 화면은 여전히 시대 주제를 표시하므로 분류 자체는 살아 있다.
  const lectures=group('교재 강별');for(const l of STUDY_LECTURES)option(lectures,l.title,scope('lecture-'+l.id));
  const papers=group('기출 · 회차별 심화 ('+Math.min(...Hanneung.rounds)+'~'+Math.max(...Hanneung.rounds)+'회)',!Hanneung.rounds.includes(Number(round)));for(const n of Hanneung.rounds){const count=Hanneung.rows.filter(r=>r.round===n&&Hanneung.hasExplanation(r.id)).length;option(papers,n+'회',scope(String(n)),count?'해설 '+count+'개':'');}
  const exams=group('기출 · 공무원 9급 ('+paperCount+'회차)',!paperScope(round));paperYears(exams,round);
  const other=group('그 밖의 범위',!(studyScope(round)!==null||round==='core'));option(other,'한국사 전체',scope(''));
 }else if(s==='영어'){const g=group('문제집 진도');option(g,'Day 1 문장의 구조·동사 유형',scope('','Day 1'));option(g,'Day 2 동사의 형태·명사·일치',scope('','Day 2'));option(g,'Day 3 분사·준동사·관사와 도치',scope('','Day 3'));option(g,'Day 4 형용사·부사와 비교 구문',scope('','Day 4'));option(g,'Day 5 접속사·관계사·가정법과 도치',scope('','Day 5'));
  // 문법 공식 훈련: 공식(규칙) 하나가 범위 하나다. 그 공식의 문제집 Day 문제와 새 훈련 문제를 함께 담고, 영역별로 접어 둔다(지금 풀던 공식의 영역만 펼침).
  const formulas=group('문법 공식 훈련');option(formulas,'공식 훈련 새 문제 전체',scope('','문법 공식 훈련'));
  const nowFormula=(scopeOf().topic||'').startsWith('formula:')?scopeOf().topic.slice(8):'';
  for(const area of ENGLISH_FORMULAS.areas){const fold=elem('details',undefined,'range-fold formula-area'),box=elem('div',undefined,'menu-list');fold.open=area.rules.some(r=>r.id===nowFormula);
   fold.append(elem('summary',area.title+' · 공식 '+area.rules.length+'개','range-heading'),box);formulas.append(fold);
   for(const rule of area.rules)option(box,rule.title,scope('','formula:'+rule.id));}
  const exams=group('기출 · 회차별 ('+paperCount+'회차)',!paperScope(scopeOf().round));paperYears(exams,scopeOf().round);
  const rest=group('그 밖의 범위',true);option(rest,'수일치',scope('','수일치'));option(rest,'그 밖의 문법 연습',scope('','영문법'));option(rest,'영어 전체',scope(''));}
 // 국어는 교재(사고의 힘 논리) 장별 자체 제작 문제를 먼저 두고, 기출은 영어처럼 풀던 회차가 없으면 접어 둔다.
 else if(s==='국어'){const g=group('사고의 힘 논리');for(const [topic,title]of Object.entries(KOREAN_TOPICS))option(g,title,scope('',topic));
  const exams=group('기출 · 회차별 ('+paperCount+'회차)',!paperScope(scopeOf().round));paperYears(exams,scopeOf().round);
  option(group('그 밖의 범위',true),'국어 전체',scope(''));}
 else if(PAPER_SUBJECTS.has(s)){
  const exams=group('기출 · 회차별 ('+paperCount+'회차)');paperYears(exams,scopeOf().round);
  option(group('그 밖의 범위',true),s+' 전체',scope(''));
 }
 else option(group(s),s+' 전체',scope(''));
}
function renderProgress(){
 const playable=data.cards.filter(isPlayable),today=day(),todayRows=data.history.filter(h=>h.date===today);
 const stat=cards=>{const ids=new Set(cards.map(c=>c.id));return {due:questionCount(reviewQueue(cards).ready),total:questionCount(cards),done:solvedOn(ids,today)};};
 const all=stat(playable);$('#due').textContent=all.due;$('#total').textContent=all.total;$('#done').textContent=all.done;
 const metric=ReviewLearning.metrics(playable,data.history);$('#retention').textContent=metric.total?Math.round(metric.correct/metric.total*100)+'% ('+metric.correct+'/'+metric.total+')':'아직 기록 없음';
 const body=$('#subjectStats');body.replaceChildren();
 for(const s of subjectsList()){const r=stat(playable.filter(c=>c.subject===s)),row=elem('tr');for(const v of [s,r.due,r.total,r.done])row.append(elem('td',String(v)));body.append(row);}
 renderStudyCredit();renderScore();
}
function renderQuiz(){
 const opened=new Set([...document.querySelectorAll('[data-explanation-key][open]')].map(e=>e.dataset.explanationKey));
 const hadFocus=document.activeElement?.id==='practiceInput',caret=hadFocus?document.activeElement.selectionStart:null;
 const noteFocus=document.activeElement?.id==='noteInput',noteCaret=noteFocus?document.activeElement.selectionStart:null;
 const scope=scopeOf(),playable=data.cards.filter(isPlayable),ordered=orderedScope(scope.round);
 $('#scopeLabel').textContent=scopeLabel(scope);renderScopeStatus(scope);
 const inside=playable.filter(c=>inScope(c,scope)),chosen=ordered?catalogOrder(inside):inside,queue=reviewQueue(chosen,rangedScope(scope)),due=queue.ready;
 // 전부 풀기 모드에서는 복습 대기열(due·재시도·형제 간격)을 거치지 않고 드릴 순서만 따른다.
 // 기출 회차: 대기열을 거치지 않고 원문 순서 그대로 낸다. 드릴을 켜면 드릴이 우선한다(회차에서는 드릴 버튼을 감춘다).
 const sequential=sequentialScope(scope)&&chosen.length>0,at=sequential?paperIndex(scope):-1;
 const feedback=data.quizFeedback&&chosen.find(c=>c.id===data.quizFeedback.cardId);
 const card=feedback||(sequential?chosen[at]:due.find(c=>c.id===data.activePractice?.cardId)||due[0]);
 const waiting=chosen.filter(c=>c.retryAt&&Date.parse(c.retryAt)>Date.now());$('#retryStatus').textContent=sequential?'':waiting.length?waiting.length+'문제 재시도 대기 · '+new Date(Math.min(...waiting.map(c=>Date.parse(c.retryAt)))).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})+'부터 다시 풀 수 있어요.':'';
 if(!sequential&&queue.waiting.length)$('#retryStatus').textContent+=' 같은 개념의 문제 '+queue.waiting.length+'개 · '+new Date(queue.nextAt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})+'부터 풀 수 있어요.';
 // 대기열 모드는 대기열을 쓰는 화면에서만 고른다. 기출 회차와 전부 풀기는 대기열을 거치지 않는다.
 const modeBox=$('#queueModeLabel'),modeSel=$('#queueMode');
 modeBox.hidden=!chosen.length||sequential;
 if(!queueModeFilled){queueModeFilled=true;for(const [v,t] of QUEUE_MODES){const o=elem('option',t);o.value=v;modeSel.append(o);}}
 modeSel.value=queueMode();
 modeSel.onchange=()=>setQueueMode(modeSel.value);
 const place=card?chosen.findIndex(c=>c.id===card.id)+1:chosen.length;
 $('#orderStatus').textContent=sequential?place+'/'+chosen.length+' · 원문 순서 그대로':'';$('#orderStatus').hidden=!sequential;
 const root=$('#card');root.replaceChildren();root.classList.toggle('paper-card',!!Hanneung.get(card?.id)&&!feedback);root.classList.toggle('gichul-card',!!Gichul.get(card?.id));root.classList.toggle('feedback-card',!!feedback);
 if(!card){
  if(sequentialScope(scope)&&chosen.length){
   root.append(elem('h2','이 회차를 끝까지 풀었어요'),elem('p',scopeLabel(scope)+' · '+chosen.length+'문제를 1번부터 순서대로 모두 풀었어요. 채점 기록과 복습 일정은 평소대로 남았어요.'));
   root.append(btn('처음부터 다시 풀기',()=>{paperRestart();render();window.scrollTo(0,0);},'primary'));
   if(scope.subject)root.append(btn('다른 범위 고르기',()=>go('range',scope.subject)));
   return;
  }
  if(queueMode()==='wrong'&&chosen.length&&!waiting.length){
   root.append(elem('h2','틀렸던 문제가 없어요'),elem('p',scopeLabel(scope)+'에서 아직 틀린 문제가 없어요. 기본 모드로 돌아가면 평소 순서대로 이어서 풀 수 있어요.'));
   root.append(btn('기본 모드로 돌아가기',()=>setQueueMode('default'),'primary'));
   if(scope.subject)root.append(btn('다른 범위 고르기',()=>go('range',scope.subject)));
   return;
  }
  root.append(elem('h2',queue.waiting.length?'비슷한 내용은 잠시 뒤 다시 풀어요':waiting.length?'잠시 뒤 틀린 문제를 다시 풀어요':data.cards.length&&!playable.length?'풀 수 있는 문제가 아직 없어요':'오늘 풀 문제를 마쳤어요'));
  const t=topicRange(scope.round),index=StudyTopics.list.findIndex(x=>x.id===t?.id),set=studyScope(scope.round);
  const nextTopic=t&&StudyTopics.list.slice(index+1).find(x=>data.cards.some(c=>isPlayable(c)&&inScope(c,{subject:'한국사',round:(t.papers?'papers-':'topic-')+x.id})));
  const lecture=STUDY_LECTURES.findIndex(l=>l.id===lectureScope(scope.round)),nextLecture=lecture>=0?STUDY_LECTURES[lecture+1]:null;
  if(nextTopic)root.append(btn('다음 주제 풀기 · '+nextTopic.title,()=>openScope({subject:'한국사',round:(t.papers?'papers-':'topic-')+nextTopic.id}),'primary'));
  else if(nextLecture)root.append(btn('다음 강 풀기 · '+nextLecture.title,()=>openScope({subject:'한국사',round:'lecture-'+nextLecture.id}),'primary'));
  else if(set>0&&set<STUDY_SETS.length)root.append(btn('다음 묶음 풀기',()=>openScope({subject:'한국사',round:'study-20260910-'+(set+1)}),'primary'));
  if(scope.subject)root.append(btn('다른 범위 고르기',()=>go('range',scope.subject)));
  return;
 }
 // 기출 회차 파일은 그 회차의 문항을 처음 낼 때 받는다. 받는 동안·받지 못했을 때는 문제 대신 안내만 그린다.
 if(!feedback&&Gichul.known(card.id)&&!Gichul.ready(card.id)){renderPaperLoad(root,card,scope);return;}
 let active=data.activePractice;
 if(!feedback&&active?.cardId===card.id){const canonical=CORE_REVIEW_PACK.find(c=>c.id===card.id)||card,current=Practice.refresh(canonical,active.exercise,PRACTICE_BANK,QUIZ_OPTIONS);if(JSON.stringify(current)!==JSON.stringify(active.exercise)){const changed=current.question!==active.exercise.question||current.type!==active.exercise.type;active={...active,exercise:current,draft:changed?'':active.draft};data.activePractice=active;saveDraft();if(changed)notify('풀던 문제의 표현이 수정됐어요. 새 문제를 확인해 주세요.');}}
 if(!feedback&&(!active||active.cardId!==card.id)){if(active?.draft){data.practiceDrafts??={};data.practiceDrafts[active.cardId]=active;}const canonical=CORE_REVIEW_PACK.find(c=>c.id===card.id)||card;const exercise=Practice.select(canonical,data.history,PRACTICE_BANK,QUIZ_OPTIONS),saved=data.practiceDrafts?.[card.id];active=saved?.exercise?.exerciseId===exercise.exerciseId?saved:{cardId:card.id,exercise,draft:'',assisted:false};data.activePractice=active;saveDraft();}
 const quiz=feedback?(data.quizFeedback.exercise||{...QUIZ_OPTIONS[card.id],type:'choice',question:QUIZ_OPTIONS[card.id]?.question||card.question,explanation:card.explanation}):active.exercise;
 const lesson=PRACTICE_BANK[card.id],summary=STUDY_REVIEW_CATALOG.questions[card.id];
 const paperRow=Gichul.get(card.id);
 const label=elem('small',card.subject+' · '+(lesson?.title||(paperRow?Gichul.title(paperRow):quiz.image?Hanneung.title(Hanneung.get(card.id))+(studyTopic(card.id)?' · '+StudyTopics.title(studyTopic(card.id)):''):summary?StudyTopics.title(studyTopic(card.id))+' · 복습 '+summary.number+'번 · 자체 제작':'개념 복습'))+' · '+(quiz.type==='text'?'직접 쓰기':quiz.choiceImages?'사진 객관식':'객관식'));
 if(feedback)renderFeedback(root,card,quiz,lesson,label);
 else{
  root.append(label,...questionNodes(quiz.question));
  appendPaper(root,Hanneung.get(card.id));
  if(quiz.type==='choice'&&quiz.choiceImages)appendPhotoChoices(root,quiz,i=>answerPractice(card.id,i));
  else if(quiz.type==='choice'){
   const choices=elem('div',undefined,'quiz-choices');if(quiz.image)choices.classList.add('paper-choices');quiz.choices.forEach((choice,i)=>{const button=btn(quiz.fixedOrder?choice:(i+1)+'. '+choice,()=>answerPractice(card.id,i));button.disabled=!!quiz.image;choices.append(button);});root.append(choices);
  }else{
   const form=elem('form',undefined,'practice-form'),hint=elem('label','지정한 단어나 빈칸의 답만 입력하세요.');hint.htmlFor='practiceInput';
   const input=elem('input');input.id='practiceInput';input.type='text';input.maxLength=2000;input.autocomplete='off';input.autocapitalize='none';input.spellcheck=false;input.setAttribute('lang','en');input.value=active.draft;
   input.oninput=()=>{if(data.activePractice?.cardId===card.id){data.activePractice.draft=input.value;saveDraft();}};
   const submit=elem('button','채점하기','primary');submit.type='submit';form.append(hint,input,submit);form.onsubmit=e=>{e.preventDefault();answerPractice(card.id,input.value);};root.append(form);
  }
  appendNoteBox(root,card,quiz,'question',label.textContent);
 }
 restoreExplanationPanels(opened);
 if(hadFocus&&$('#practiceInput')&&!feedback){$('#practiceInput').focus();$('#practiceInput').setSelectionRange(caret,caret);}
 if(noteFocus&&$('#noteInput')){$('#noteInput').focus();$('#noteInput').setSelectionRange(noteCaret,noteCaret);}
}
function renderPaperLoad(root,card,scope){
 const paperId=Gichul.paperOf(card.id),paper=Gichul.paper(paperId),state=Gichul.state(paperId);
 root.append(elem('small',card.subject+' · '+paper.title));
 if(state==='error'){
  root.append(elem('h2','기출 문제를 불러오지 못했어요'),elem('p',paper.title+' 문제 파일을 받지 못했어요. 인터넷 연결을 확인하고 다시 불러오세요. 한 번 받은 회차는 이 기기에 남아 연결 없이도 풀 수 있어요.'));
  root.append(btn('다시 불러오기',()=>{Gichul.load(paperId).then(render,render);render();},'primary'));
  if(scope.subject)root.append(btn('다른 범위 고르기',()=>go('range',scope.subject)));
  return;
 }
 root.append(elem('p','기출 문제를 불러오는 중입니다 · '+paper.title,'status'));
 if(state==='idle')Gichul.load(paperId).then(render,render);
}
// Explanation page after grading: result first, explanation folded (opening it earns +1 minute), skippable.
function renderFeedback(root,card,quiz,lesson,label){
 const f=data.quizFeedback,reviewId=feedbackReviewId(f),correct=quiz.type==='text'?quiz.answers.join(' / '):quiz.choices[quiz.correctIndex];
 root.append(elem('p','채점 결과 · 해설','eyebrow'));
 const banner=elem('div',undefined,'result-banner result-'+f.result);
 banner.append(elem('strong',f.result==='correct'?'정답입니다':f.result==='unsure'?'정답이에요 · 설명을 보고 풀어서 내일 다시 연습해요':'틀렸어요'));
 if(f.result==='wrong')banner.append(quiz.marks&&quiz.choices[f.selectedIndex]!==undefined?markedLine('내 답: ',quiz,f.selectedIndex):elem('p','내 답: '+(quiz.type==='text'?f.userAnswer:quiz.choices[f.selectedIndex]??'')));
 banner.append(quiz.marks?markedLine('정답: ',quiz,quiz.correctIndex):elem('p','정답: '+correct));root.append(banner);{const award=xpAwardNode(reviewId);if(award)root.append(award);}
 appendCorrection(root,quiz);
 const main=elem('details',undefined,'lesson explanation-main');main.append(elem('summary','해설 보기'));const byChoice=Practice.explainByChoice(quiz);if(byChoice)main.append(choiceExplanations(quiz,byChoice,f.selectedIndex));else{if(quiz.marks)main.append(markedList(quiz));main.append(...explanationParts(quiz.explanation||card.explanation||''));}attachExplanationCredit(main,reviewId,'feedback');root.append(main);
 appendNewPaperExplanation(root,card.id,quiz.explanation||card.explanation,reviewId,'feedback-supplement');
 if(lesson){root.append(elem('p',lesson.hook,'hook'));const details=elem('details',undefined,'lesson');details.append(elem('summary','규칙과 비교 예문 더 보기'),...ruleLines(lesson.rule,'rule-line'));for(const example of lesson.examples)details.append(...ruleLines(example,'example'));attachExplanationCredit(details,reviewId,'lesson');root.append(details);}
 const recap=elem('details',undefined,'lesson recap');recap.append(elem('summary','문제 다시 보기'),label,...questionNodes(quiz.question));appendPaper(recap,Hanneung.get(card.id));
 if(quiz.type==='choice'&&quiz.choiceImages)appendPhotoChoices(recap,quiz,null,f.selectedIndex);
 else if(quiz.type==='choice'){const choices=elem('div',undefined,'quiz-choices recap-choices');if(quiz.image)choices.classList.add('paper-choices');quiz.choices.forEach((choice,i)=>{const b=elem('button',quiz.fixedOrder?choice:(i+1)+'. '+(quiz.marks?'':choice));if(quiz.marks)b.append(markedChoice(choice,quiz.marks[i],okLabel(quiz)));b.type='button';b.disabled=true;if(i===quiz.correctIndex)b.classList.add('quiz-correct');else if(i===f.selectedIndex)b.classList.add('quiz-wrong');choices.append(b);});recap.append(choices);}
 root.append(recap);
 const dueCard=data.cards.find(c=>c.id===card.id),concept=ReviewPolicy.concept(card.id),siblings=data.cards.some(c=>c.id!==card.id&&isPlayable(c)&&ReviewPolicy.concept(c.id)===concept);
 root.append(elem('p','풀이 완료 · 환산 시간 +1분','study-credit-award'),elem('small','다음 복습: '+dueCard.due+(f.result==='wrong'?' · 5분 뒤 다시 풀 수 있어요.'+(siblings?' 같은 개념의 다른 문제도 10분 뒤 이어서 나와요.':''):''),'next-review'));
 const source=(CORE_REVIEW_PACK.find(c=>c.id===card.id)||card).source;if(quiz.type==='text'||source)root.append(elem('small',quiz.type==='text'?(card.id.startsWith('en-day1-')?'문제집 PART 01 문장의 구조·동사 유형 정리 기반 자체 제작 연습':card.id.startsWith('en-day2-')?'문제집 PART 02 동사의 형태, 명사, 일치 정리 기반 자체 제작 연습':card.id.startsWith('en-day3-')?'문제집 Day 3 문법 포인트 찾기 훈련 기반 자체 제작 연습':card.id.startsWith('en-day4-')?'문제집 Day 4 문법 포인트 찾기 훈련 기반 자체 제작 연습':card.id.startsWith('en-day5-')?'문제집 Day 5 문법 포인트 찾기 훈련 기반 자체 제작 연습':card.id.startsWith('en-formula-')?'문법 공식 훈련 자체 제작 연습':'대화 학습·수일치 정리 기반 자체 제작 연습'):source,'source-line'));
 const next=btn(nextLabel(reviewId),()=>{const state=structuredClone(data);delete state.quizFeedback;delete state.activePractice;if(commit(state)){sessionDirty=true;render();window.scrollTo(0,0);}},'primary next-question');next.id='nextQuestion';next.dataset.review=reviewId||'';root.append(next);
 appendNoteBox(root,card,quiz,'explanation',label.textContent);
}
// 문제 의견: 버튼을 누르면 입력칸이 열린다. 쓰던 내용은 화면을 다시 그리거나 닫았다 열어도 남고,
// 보낸 의견은 이 기기에 먼저 저장된 뒤 로그인한 계정으로 전송된다(답안 기록 동기화와 별도).
let noteSaveTimer=null;
function saveNoteDraftSoon(){clearTimeout(noteSaveTimer);noteSaveTimer=setTimeout(()=>{noteSaveTimer=null;saveDraft();},600);}
function saveNoteDraftNow(){if(noteSaveTimer){clearTimeout(noteSaveTimer);noteSaveTimer=null;saveDraft();}}
window.addEventListener('pagehide',saveNoteDraftNow);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveNoteDraftNow();});
function appendNoteBox(root,card,quiz,stage,title){
 const box=elem('div',undefined,'note-box'),draft=data.noteDraft?.cardId===card.id?data.noteDraft:null,open=!!draft?.open,sent=(data.notes||[]).filter(n=>n.cardId===card.id).length;
 const toggle=btn(open?'의견 입력 닫기':'✎ 문제 의견 남기기',()=>{const d=data.noteDraft?.cardId===card.id?data.noteDraft:{cardId:card.id,text:''};d.open=!open;data.noteDraft=d;clearTimeout(noteSaveTimer);noteSaveTimer=null;saveDraft();render();if(d.open)$('#noteInput')?.focus();},'note-toggle');
 toggle.type='button';toggle.setAttribute('aria-expanded',String(open));box.append(toggle);
 if(sent)box.append(elem('small','이 문제에 남긴 의견 '+sent+'개','note-count'));
 if(open){
  const panel=elem('div',undefined,'note-panel'),hint=elem('label','틀린 곳·헷갈린 점·바라는 점을 적어 주세요.'),input=elem('textarea');
  hint.htmlFor='noteInput';input.id='noteInput';input.maxLength=2000;input.rows=4;input.value=typeof draft.text==='string'?draft.text:'';
  input.oninput=()=>{if(data.noteDraft?.cardId===card.id){data.noteDraft.text=input.value;saveNoteDraftSoon();}};
  const close=btn('닫기',()=>{if(data.noteDraft?.cardId===card.id){data.noteDraft.open=false;clearTimeout(noteSaveTimer);noteSaveTimer=null;saveDraft();}render();}),send=btn('보내기',()=>sendNote(card,quiz,stage,title),'primary');
  close.type='button';send.type='button';const actions=elem('div',undefined,'note-actions');actions.append(close,send);
  panel.append(hint,input,actions);box.append(panel);
 }
 root.append(box);
}
function sendNote(card,quiz,stage,title){
 const text=String(data.noteDraft?.cardId===card.id?data.noteDraft.text:'').trim();if(!text){notify('의견을 입력한 다음 보내 주세요.');return;}
 let note;try{note=ProgressSync.note({id:crypto.randomUUID(),cardId:card.id,exerciseId:String(quiz.exerciseId||'').slice(0,160),stage,subject:String(card.subject||'').slice(0,80),question:(String(title||'')+'\n'+String(quiz.question||card.question||'')).slice(0,6000),text:text.slice(0,2000),at:Date.now()});}
 catch{notify('의견을 저장할 수 없어요. 내용 길이를 확인해 주세요.');return;}
 clearTimeout(noteSaveTimer);noteSaveTimer=null;const next=structuredClone(data);next.notes=[...(next.notes||[]),note];delete next.noteDraft;
 if(commit(next)){notify('의견을 저장했어요 · 로그인돼 있으면 자동으로 전송돼요.');render();}
}
function answerPractice(id,input){
 if(data.quizFeedback)return;const active=data.activePractice;
 // 화면과 기록이 어긋난 채로 누른 답은 조용히 버리지 않고 화면을 다시 그린 뒤 알려 준다.
 const stale=()=>{render();notify('풀 차례가 바뀌어 문제를 다시 불러왔어요. 다시 골라 주세요.');};
 if(active?.cardId!==id){stale();return;}const quiz=active.exercise;
 if(quiz.image){const img=$('#card .paper-image img');if(!img?.complete||!img.naturalWidth){notify('문제 이미지가 표시된 뒤 답을 골라 주세요.');return;}}
 if(quiz.choiceImages&&[...document.querySelectorAll('#card .photo-choices img')].some(img=>!img.complete||!img.naturalWidth)){notify('보기 사진이 모두 표시된 뒤 답을 골라 주세요.');return;}
 const sequential=sequentialScope(scopeOf());
 // 회차에서는 대기열이 아니라 "지금 차례인 문항인가"만 본다.
 if(sequential){if(catalogOrder(data.cards.filter(inCurrent))[paperIndex(scopeOf())]?.id!==id){stale();return;}}
 // 같은 개념 간격으로 기다리던 문제는 화면이 앞당겨 보여 줄 수 있다. 그사이 다른 문제의 간격이 먼저 끝나도 보여 준 문제의 답은 받는다.
 else{const q=reviewQueue(data.cards.filter(inCurrent),rangedScope(scopeOf()));if(!q.ready.some(c=>c.id===id)&&!q.waiting.some(w=>w.card.id===id)){stale();return;}}
 if(quiz.type==='text'&&!String(input).trim()){notify('답을 입력한 다음 채점해 주세요.');return;}
 if(quiz.type==='choice'&&(!Number.isInteger(input)||input<0||input>=quiz.choices.length))return;
 const correct=quiz.type==='text'?Practice.grade(quiz,input):input===quiz.correctIndex;
 const next=structuredClone(data),c=next.cards.find(c=>c.id===id),result=correct?(active.assisted?'unsure':'correct'):'wrong';
 delete c.pendingAttempt;c.pendingAttempt=ReviewLearning.begin(c,data.history,result==='correct'?'remember':result==='unsure'?'partial':'none');
 // 같은 날 한 회차를 몰아서 풀어도 간격이 부풀지 않도록 드릴과 같은 assess 래퍼를 그대로 쓴다.
 const assessed=sequential?ReviewLearning.assessRepeat(c,data.history,result):ReviewLearning.assess(c,data.history,result);if(result==='unsure')delete assessed.card.retryAt;
 next.cards[next.cards.findIndex(c=>c.id===id)]=assessed.card;
 if(!quiz.exerciseId)quiz.exerciseId=id+'-'+Practice.fingerprint(JSON.stringify([quiz.type,quiz.question,quiz.answers||quiz.choices[quiz.correctIndex]]));
 let detail;try{detail=ReviewRecord.create(c,quiz,input,PRACTICE_BANK[id],ReviewPolicy.concept(id),active.assisted);}catch{notify('답안이나 문제 정보를 저장할 수 없어요. 입력 길이를 확인해 주세요.');return;}
 const reviewId=crypto.randomUUID();next.history.push({id:reviewId,...assessed.entry,mode:'quiz',detail});
 if(next.practiceDrafts)delete next.practiceDrafts[id];
 next.quizFeedback={cardId:id,reviewId,selectedIndex:quiz.type==='choice'?input:-1,userAnswer:quiz.type==='text'?String(input):'',result,exercise:quiz};
 delete next.activePractice;notify('');if(commit(next)){if(sequential)paperAdvance();sessionDirty=true;render();window.scrollTo(0,0);}
}
// 설치 묶음에 없는 연습 문제(영어: 나뉜 규칙 문제 · 문제집 Day 1 · Day 2 · Day 3 · Day 4 · Day 5 · 문법 공식 훈련, 국어: 사고의 힘 논리 1~6장·독해 1장)는 그 문제 자체에서 카드 내용을 만든다. 문제 하나 = 카드 하나다.
// 과목은 연습 문제에 적힌 subject를 따르고, 적혀 있지 않으면 영어다(기존 영어 문제는 subject를 따로 적지 않았다).
// 새로 만든 문제는 '팩 이름'이 바뀔 때만 기기에 들어왔다. 배포할 때 이름을 손으로 안 올리면 영영 안 들어온다 —
// 2026-09-17 뒤에 만든 158문항(16강 80 · 문화유산 사진 70 · 궁궐 사진 8)이 그래서 이미 쓰던 기기에서 안 보였다.
// 이제 이름을 보지 않고 대조한다. 기기에 없는 문제는 언제나 넣고, 넣을 것이 없으면 저장도 하지 않는다.
function installCorePack(){const ids=new Set(data.cards.map(c=>c.id));const cards=[...cardContent()].filter(([id])=>!ids.has(id)).map(([id,c])=>({...newCard(c),id}));if(!cards.length)return;commit({...data,cards:[...data.cards,...cards]});}
installCorePack();
// 더는 없는 문제(v57에서 문제 하나씩으로 나눈 영어 규칙 카드 등)를 가리키던 풀이 화면·채점 화면만 비운다.
// 그대로 두면 채점 화면이 남아 다음 답을 받지 못한다. 채점 기록(history)과 카드 일정은 한 건도 지우지 않는다.
{const gone=id=>!!id&&!isPlayable(data.cards.find(c=>c.id===id));if(gone(data.quizFeedback?.cardId)||gone(data.activePractice?.cardId)){const next=structuredClone(data);if(gone(next.quizFeedback?.cardId))delete next.quizFeedback;if(gone(next.activePractice?.cardId))delete next.activePractice;commit(next);}}
if(!data.quizUiVersion){const next=structuredClone(data);for(const c of next.cards)delete c.pendingAttempt;next.quizUiVersion=1;commit(next);}
else if(data.cards.some(c=>c.pendingAttempt)){const next=structuredClone(data);for(const c of next.cards)delete c.pendingAttempt;if(commit(next))data=next;}
$('#resumeStudy').onclick=()=>openScope(lastScope(viewSubject)||{subject:viewSubject},true);
$('#chooseRange').onclick=()=>go('range');
$('#openProgress').onclick=()=>go('progress');
$('#openMemorize').onclick=()=>go('memorize',MEMO_SCOPE+viewSubject);
for(const b of document.querySelectorAll('[data-back]'))b.onclick=goBack;
$('#quizBack').onclick=goBack;
$('#studyTimeMore').onclick=()=>{creditHistoryLimit+=30;renderStudyCredit();};
$('#subjectGoalSave').onclick=()=>{const v=Number($('#subjectGoalInput').value);if(!Number.isInteger(v)||v<1||v>500){notify('하루 목표는 1~500 사이의 숫자로 적어 주세요.');return;}setSubjectGoal(viewSubject,v);};
$('#subjectGoalClear').onclick=()=>setSubjectGoal(viewSubject,null);
$('#includeMastered').onchange=e=>{const next=structuredClone(data);if(e.target.checked)next.includeMastered=true;else delete next.includeMastered;delete next.quizFeedback;delete next.activePractice;if(commit(next)){notify(e.target.checked?'이 범위의 외운 문제도 복습일이 되면 나와요.':'외운 문제는 이 범위에서 빼요.');render();}};
$('#homeScore').onclick=()=>go('progress');
$('#targetSave').onclick=()=>{const t={name:$('#targetName').value.trim(),cutoff:Number($('#targetCutoff').value),bonus:Number($('#targetBonus').value||0)};
 if(JSON.stringify(ExamScore.target(t))!==JSON.stringify(t)){notify('목표 이름(40자 이내), 목표 점수(1~110), 가산점(0~10)을 확인해 주세요.');return;}saveTarget(t);};
$('#targetReset').onclick=()=>saveTarget(null);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});render();
setInterval(()=>{if(view==='quiz'&&!document.hidden&&!$('#card .question')&&reviewQueue(data.cards.filter(inCurrent),rangedScope(scopeOf())).ready.length)render();},15000);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});

globalThis.StudyProgress={
 get:()=>structuredClone(data),
 merge(rows){const next=ProgressSync.merge(data,rows);if(JSON.stringify(next)!==JSON.stringify(data)){if(!commit(next))throw Error('Local save failed');render();}},
 session:()=>data.session?structuredClone(data.session):null,
 // A newer position from another device reopens the same scope, question and choice order.
 mergeSession(row){
  const remote=ProgressSync.session(row);if(remote.at<=(data.session?.at||0))return;
  paperCursor=null;
  const next=structuredClone(data),scope={subject:remote.subject,topic:remote.topic,round:remote.round};next.session=remote;next.practiceScope=scope;if(scope.subject)next.lastScopes={...(next.lastScopes||{}),[scope.subject]:scope};delete next.quizFeedback;
  const card=remote.cardId&&next.cards.find(c=>c.id===remote.cardId);let exercise=null;
  if(card&&isPlayable(card)&&(!Gichul.known(card.id)||Gichul.ready(card.id)))exercise=Practice.refresh(CORE_REVIEW_PACK.find(c=>c.id===card.id)||card,{exerciseId:remote.exerciseId,variantIndex:remote.variantIndex,type:remote.type,choices:remote.choices},PRACTICE_BANK,QUIZ_OPTIONS);
  if(exercise&&exercise.exerciseId===remote.exerciseId){const own=data.activePractice?.cardId===card.id&&data.activePractice.exercise?.exerciseId===exercise.exerciseId?data.activePractice:null;next.activePractice={...(own||{cardId:card.id,draft:'',assisted:false}),exercise};}else delete next.activePractice;
  if(!commit(next))throw Error('Local save failed');render();
 },
 notes:()=>structuredClone(data.notes||[]),
 mergeNotes(rows){const notes=ProgressSync.unionNotes(cleanNotes(data.notes),rows);if(JSON.stringify(notes)!==JSON.stringify(data.notes||[])){if(!commit({...data,notes}))throw Error('Local save failed');}},
 mergeExplanations(rows){const views=StudyCredit.unionExplanations(data.explanationViews||[],rows);if(JSON.stringify(views)!==JSON.stringify(data.explanationViews||[])){if(!commit({...data,explanationViews:views}))throw Error('Local save failed');renderStudyCredit();updateExplanationCredits();}},
 switchUser(uid){
  const target=profileKey(uid);if(target===KEY)return;
  const raw=localStorage.getItem(target);let next=raw?JSON.parse(raw):{version:3,cards:[],history:[]};validateBackup(next);next=reschedule(hydrateCards(migrate(next)));if(next.notes!==undefined)next.notes=cleanNotes(next.notes);
  const owner=localStorage.getItem('chagog-owner');
  if(uid&&!owner){const guest=localStorage.getItem('chagog-v1');if(guest){const parsed=JSON.parse(guest);validateBackup(parsed);const old=migrate(parsed);const ids=new Set(next.cards.map(c=>c.id));next.cards.push(...old.cards.filter(c=>!ids.has(c.id)));next=ProgressSync.merge(next,old.history);next.explanationViews=StudyCredit.unionExplanations(next.explanationViews||[],old.explanationViews||[]);next.notes=ProgressSync.unionNotes(cleanNotes(next.notes),cleanNotes(old.notes));}}
  delete next.quizFeedback;delete next.activePractice;for(const c of next.cards)delete c.pendingAttempt;
  writeState(target,next);
  if(uid){if(!owner)localStorage.setItem('chagog-owner',uid);localStorage.setItem('chagog-active-user',uid);}else localStorage.removeItem('chagog-active-user');
  KEY=target;data=next;creditHistoryLimit=14;storageOK=true;paperCursor=null;installCorePack();render();
 }
};
