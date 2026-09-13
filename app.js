'use strict';
const $=s=>document.querySelector(s);
function profileKey(uid){return uid?'chagog-user-'+uid:localStorage.getItem('chagog-owner')?'chagog-guest':'chagog-v1';}
let KEY='chagog-v1';try{KEY=profileKey(localStorage.getItem('chagog-active-user'));}catch{}
const {schedule,migrate}=ReviewSchedule;
const day=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function plus(date,n){const [y,m,d]=date.split('-').map(Number);return day(new Date(y,m-1,d+n));}
let data={version:2,cards:[],history:[]}, storageOK=true;
try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);validateBackup(parsed);data=migrate(parsed);if(parsed.version===1){if(!localStorage.getItem(KEY+'-before-adaptive'))localStorage.setItem(KEY+'-before-adaptive',raw);localStorage.setItem(KEY,JSON.stringify(data));}}}catch(e){storageOK=false;notify('저장 데이터를 읽지 못했어요. 기존 데이터를 보호하기 위해 저장을 중지했어요.');}
function notify(t){$('#message').textContent=t;}
function commit(next){if(!storageOK){notify('저장소를 확인해야 합니다. 새로고침 후 다시 시도하세요.');return false;}try{localStorage.setItem(KEY,JSON.stringify(next));data=next;window.dispatchEvent(new Event('study-progress-saved'));return true;}catch(e){notify('저장 공간이 부족하거나 저장이 차단됐어요. 기록은 변경되지 않았습니다.');return false;}}
function elem(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function btn(text,fn,cls){const b=elem('button',text,cls);b.onclick=fn;return b;}
function validDay(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;return plus(s,0)===s;}
function validateContent(c){if(!c||typeof c!=='object'||['subject','question','answer'].some(k=>typeof c[k]!=='string'||!c[k].trim())||['explanation','source'].some(k=>c[k]!==undefined&&typeof c[k]!=='string'))throw Error('과목·질문·정답과 텍스트 형식을 확인하세요.');}
function validateBackup(v){if(v?.explanationViews!==undefined){if(!Array.isArray(v.explanationViews))throw Error('Invalid explanation records');StudyCredit.unionExplanations([],v.explanationViews);}if(![1,2].includes(v?.version)||!Array.isArray(v.cards)||!Array.isArray(v.history))throw Error('지원하지 않는 백업입니다.');const ids=new Set();for(const c of v.cards){validateContent(c);if(typeof c.id!=='string'||ids.has(c.id)||!validDay(c.created)||!(c.due===null||validDay(c.due))||(v.version===1?(!Number.isInteger(c.stage)||c.stage<0||c.stage>4):(!Number.isFinite(c.ease)||c.ease<1.3||c.ease>3||!Number.isInteger(c.interval)||c.interval<0||c.interval>365||!Number.isInteger(c.streak)||c.streak<0||c.due===null)))throw Error('카드 일정 또는 ID가 올바르지 않습니다.');if(c.retryAt!==undefined&&!Number.isFinite(Date.parse(c.retryAt)))throw Error('잘못된 재학습 시간');if(c.pendingAttempt!==undefined&&(!['remember','partial','none'].includes(c.pendingAttempt.recall)||!validDay(c.pendingAttempt.date)||!Number.isFinite(Date.parse(c.pendingAttempt.at))||typeof c.pendingAttempt.delayedFirst!=='boolean'))throw Error('잘못된 회상 기록');ids.add(c.id);}for(const h of v.history){if(typeof h.id!=='string'||typeof h.cardId!=='string'||!validDay(h.date)||!['correct','unsure','wrong'].includes(h.result))throw Error('복습 기록이 올바르지 않습니다.');}if(v.quizFeedback!==undefined&&(!v.quizFeedback||typeof v.quizFeedback.cardId!=='string'||!Number.isInteger(v.quizFeedback.selectedIndex)||!['correct','wrong','unsure'].includes(v.quizFeedback.result)))throw Error('퀴즈 피드백이 올바르지 않습니다.');}
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
// 'lecture-<id>' follows the textbook lectures (02~05강, 06강, 07·08강) over the self-made summary questions.
const STUDY_LECTURES=STUDY_REVIEW_CATALOG.lectures||[];
const LECTURE_BY_ID=new Map(STUDY_LECTURES.flatMap(l=>l.ids.map(id=>[id,l.id])));
function lectureScope(value){const match=/^lecture-([0-9][0-9-]*)$/.exec(value||'');return match&&STUDY_LECTURES.some(l=>l.id===match[1])?match[1]:null;}
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
function inScope(c,scope){const subject=scope.subject||'',topic=subject==='영어'?scope.topic||'':'',round=hasRanges(subject)?scope.round||'':'';return isPlayable(c)&&(!subject||c.subject===subject)&&(!topic||PRACTICE_BANK[c.id]?.topic===topic)&&roundMatch(c,round);}
function orderedScope(round){return !!topicScope(round)||!!lectureScope(round)||studyScope(round)!==null||!!paperScope(round)||Hanneung.rounds.includes(Number(round));}
const inCurrent=c=>inScope(c,scopeOf());
function sameScope(a,b){return !!a&&!!b&&(a.subject||'')===(b.subject||'')&&(a.topic||'')===(b.topic||'')&&(a.round||'')===(b.round||'');}
function scopeLabel(scope){
 const s=scope.subject;if(!s)return '전체 과목';
 const paper=hasRanges(s)?paperScope(scope.round):null;if(paper)return s+' · 기출 '+Gichul.paper(paper).range;
 if(s==='영어')return '영어 · '+({'':'전체','수일치':'수일치','영문법':'그 밖의 문법 연습'}[scope.topic||'']??scope.topic);
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
// 공공누리 제1유형은 출처표시가 의무인데 출처 문구에 국가유산 이름이 들어 있다. 보기마다 붙이면 정답이 노출되므로
// 네 장의 출처를 보기 순서와 무관한 고정 순서(가나다순)로 문제 아래에 한 번만 모아 띄운다. 사진이 보이는 화면에는 언제나 함께 나온다.
function photoCredits(quiz){
 const box=elem('div',undefined,'photo-credits');
 box.append(elem('p','사진 출처 · 공공누리 제1유형 (보기 순서와 무관하게 가나다순으로 적었습니다)','photo-credit-head'));
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
function renderScopeStatus(scope){
 const r=hasRanges(scope.subject)?scope.round||'':'',numeric=Number(r),isRound=!!r&&Hanneung.rounds.includes(numeric),el=$('#roundScore');el.hidden=true;el.textContent='';
 if(isRound){const s=Hanneung.stats(numeric,data.history);el.textContent='첫 시도 '+s.answered+'/'+s.total+'문항 · '+(s.complete?'점수 ':'현재 획득 ')+s.points+'/100점'+(s.bonus?' (공식 오류 문항 2점 포함)':'')+(s.complete?' · '+(s.points>=60?'3급 이상 기준 도달':'3급 기준 60점 미만'):'');el.hidden=false;}
 else if(orderedScope(r)){const ids=new Set(data.cards.filter(c=>inScope(c,scope)).map(c=>c.id)),p=firstPass(ids);el.textContent='첫 시도 '+p.answered+'/'+ids.size+'문제 · 정답 '+p.correct+'개';el.hidden=false;}
 const cancelled=$('#annulledQuestion');cancelled.hidden=!(isRound&&numeric===63);if(!cancelled.hidden&&!cancelled.querySelector('img'))appendPaper(cancelled,Hanneung.get('hanneung-63-42'));
}
function saveDraft(){if(!storageOK)return;try{localStorage.setItem(KEY,JSON.stringify(data));}catch{notify('입력 내용을 저장하지 못했어요.');}}
// BEGIN DRILL MODE — "이 범위 전부 풀기". 저장하지 않는 세션 한정 상태라 새 저장 필드도, 새 문서도 만들지 않는다.
let drill=null;
function drillSize(id){return (QUIZ_OPTIONS[id]||Gichul.known(id)?1:0)+(PRACTICE_BANK[id]?.variants.length||0);}
function drillOn(scope){return !!drill&&StudyDrill.sameScope(drill.scope,scope);}
function drillCards(scope){const inside=data.cards.filter(c=>isPlayable(c)&&inScope(c,scope));return orderedScope(scope.round)?catalogOrder(inside):inside;}
// 카드의 변형은 "몇 번 풀었나"로 정해진다. 회차마다 시도 수를 한 바퀴씩 올려 같은 변형을 보기 순서만 새로 섞어 낸다.
function drillExercise(card,item){const canonical=CORE_REVIEW_PACK.find(c=>c.id===card.id)||card;return Practice.select(canonical,Array.from({length:StudyDrill.attempts(drill,item)},()=>({cardId:card.id})),PRACTICE_BANK,QUIZ_OPTIONS);}
function toggleDrill(){
 const scope=scopeOf();
 drill=drillOn(scope)?null:StudyDrill.create(scope,drillCards(scope),drillSize);paperCursor=null;
 const next=structuredClone(data);delete next.quizFeedback;delete next.activePractice;
 if(commit(next)){sessionDirty=true;render();window.scrollTo(0,0);}else if(drill)drill=null;
}
// END DRILL MODE
// BEGIN PAPER ORDER — 기출 회차에서는 앱이 문제를 고르지 않는다. 1번부터 마지막 번호까지 원문 순서대로만
// 내고, 마지막 문항을 풀면 멈춘다. 복습 일정·재시도 대기(retryAt)·형제 간격(ReviewPolicy.separate)·
// 하루 새 문제 몫 어느 것도 회차 안에서는 적용하지 않는다. 어제 맞힌 문제도 제자리에 다시 나온다.
// 답안 기록과 복습 일정 갱신은 평소와 똑같다 — 바뀌는 것은 "다음에 무엇을 낼지"뿐이다.
// 저장하지 않는 세션 한정 위치라 회차를 다시 열면 언제나 1번부터 시작한다.
let paperCursor=null;
function paperIndex(scope){if(!paperCursor||!sameScope(paperCursor.scope,scope))paperCursor={scope:{subject:scope.subject||'',topic:scope.topic||'',round:scope.round||''},index:0};return paperCursor.index;}
function paperAdvance(){if(paperCursor)paperCursor={...paperCursor,index:paperCursor.index+1};}
function paperRestart(){if(paperCursor)paperCursor={...paperCursor,index:0};}
// END PAPER ORDER
// A wrong answer today also brings back the other questions on the same concept (still after the sibling gap).
function reviewQueue(cards){
 const due=ReviewLearning.queue(cards),ids=new Set(due.map(c=>c.id)),today=day(),missed=new Map(),last=new Map();
 for(const h of data.history){const at=h.at||h.date;if((last.get(h.cardId)||'')<at)last.set(h.cardId,at);if(h.mode==='quiz'&&h.result==='wrong'&&h.date===today){const k=ReviewPolicy.concept(h.cardId);if((missed.get(k)||'')<at)missed.set(k,at);}}
 const extra=missed.size?cards.filter(c=>{if(ids.has(c.id))return false;const at=missed.get(ReviewPolicy.concept(c.id));return !!at&&(last.get(c.id)||'')<at;}):[];
 const queue=ReviewPolicy.separate([...due,...extra],data.history);
 return {...queue,ready:withNewCards(cards,queue.ready)};
}
// 하루에 끼워 넣는 "한 번도 안 푼" 문제 수. 바꿀 곳은 이 한 줄뿐이고, 0으로 두면 기능이 꺼진다.
const NEW_CARDS_PER_DAY=5;
// 새 문제 하나를 복습 문제 몇 개 뒤에 끼울지. 복습 카드는 하나도 빠지지 않고 서로의 순서도 그대로다.
const NEW_CARD_GAP=3;
let firstAttemptCache=null;
// 카드별 최초 시도 날짜를 기존 history에서만 읽는다. 새 저장 필드가 없으므로 새로고침·기기 간 동기화에도 그대로 남는다.
function firstAttemptDays(){
 if(firstAttemptCache?.rows===data.history)return firstAttemptCache.map;
 const map=new Map();
 for(const h of data.history){const d=h.date||'';const prev=map.get(h.cardId);if(prev===undefined||d<prev)map.set(h.cardId,d);}
 firstAttemptCache={rows:data.history,map};return map;
}
// 오늘 이 범위에서 앞으로 꺼낼 수 있는 미풀이 문제 수. 한 번 풀면 그날의 몫으로 계산된다.
function newCardRoom(cards){
 if(NEW_CARDS_PER_DAY<=0)return 0;
 const first=firstAttemptDays(),today=day();let used=0,fresh=0;
 for(const c of cards){const d=first.get(c.id);if(d===undefined)fresh++;else if(d===today)used++;}
 return Math.max(0,Math.min(NEW_CARDS_PER_DAY-used,fresh));
}
// 복습 대기열을 그대로 두고 미풀이 문제만 사이에 끼운다. 카드가 빠지지도, 없던 카드가 due가 되지도 않는 순서 변경뿐이다.
function withNewCards(order,ready){
 const room=newCardRoom(order);if(!room)return ready;
 const first=firstAttemptDays(),rank=new Map(order.map((c,i)=>[c.id,i]));
 const fresh=ready.filter(c=>!first.has(c.id)).sort((a,b)=>(rank.get(a.id)??0)-(rank.get(b.id)??0)).slice(0,room);
 if(!fresh.length)return ready;
 const picked=new Set(fresh.map(c=>c.id)),rest=ready.filter(c=>!picked.has(c.id)),out=[];
 let i=0;
 for(const card of rest){
  out.push(card);
  // 같은 개념의 형제 문항이 연달아 나오면 한 칸 뒤로 미룬다 (ReviewPolicy.separate의 형제 간격과 같은 기준).
  if(i<fresh.length&&out.length%(NEW_CARD_GAP+1)===NEW_CARD_GAP&&ReviewPolicy.concept(card.id)!==ReviewPolicy.concept(fresh[i].id))out.push(fresh[i++]);
 }
 while(i<fresh.length)out.push(fresh[i++]);
 return out;
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
function appendCorrection(parent,snapshot){const update=ContentCorrections.find(snapshot);if(!update)return;const note=elem('div',undefined,'content-correction');note.append(elem('strong','문항·해설 수정 안내'),elem('p','아래 기록은 수정 전 문항의 당시 채점 결과입니다.'),elem('p',update.note),elem('p','현재 문항: '+update.question),elem('p','현재 정답: '+update.answer),elem('p',update.explanation));parent.append(note);}
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
function stampSession(){if(!storageOK)return;let session;try{session=ProgressSync.session({at:Math.max(Date.now(),(data.session?.at||0)+1),...sessionSnapshot()});}catch{return;}data.session=session;try{localStorage.setItem(KEY,JSON.stringify(data));window.dispatchEvent(new Event('study-progress-saved'));}catch{}}
function render(){renderView();if(sessionDirty){sessionDirty=false;stampSession();}}
// Screens: home (subjects) → subject (resume / choose range) → range → quiz (question, then explanation). Progress is separate.
const VIEWS=['home','subject','range','quiz','progress'];
let view='home',viewSubject='';
function go(name,subject=viewSubject,replace=false){view=name;viewSubject=subject;const depth=(history.state?.depth||0)+(replace?0:1);try{history[replace?'replaceState':'pushState']({view:name,subject,depth},'');}catch{}notify('');render();window.scrollTo(0,0);}
function goBack(){if(history.state?.depth>0){history.back();return;}const parent=view==='quiz'||view==='range'?'subject':'home';go(parent,view==='quiz'?scopeOf().subject:viewSubject,true);}
try{history.replaceState({view:'home',subject:'',depth:0},'');}catch{}
window.addEventListener('popstate',e=>{view=VIEWS.includes(e.state?.view)?e.state.view:'home';viewSubject=e.state?.subject||'';notify('');render();window.scrollTo(0,0);});
function subjectsList(){return [...new Set(data.cards.filter(isPlayable).map(c=>c.subject))];}
function questionCount(cards){return cards.reduce((n,c)=>n+(QUIZ_OPTIONS[c.id]||Gichul.known(c.id)?1:0)+(PRACTICE_BANK[c.id]?.variants.length||0),0);}
function menuItem(title,detail,fn,cls='menu-item'){const b=btn('',fn,cls);b.type='button';b.append(elem('strong',title));if(detail)b.append(elem('span',detail));return b;}
function lastScope(subject){const s=data.lastScopes?.[subject]||(data.practiceScope?.subject===subject?data.practiceScope:null);return s?{subject,topic:s.topic||'',round:s.round||''}:null;}
function openScope(scope,resume=false){
 scope={subject:scope.subject||'',topic:scope.subject==='영어'?scope.topic||'':'',round:hasRanges(scope.subject)?scope.round||'':''};
 if(resume&&sameScope(scopeOf(),scope)){go('quiz');return;}
 const next=structuredClone(data);next.practiceScope=scope;if(scope.subject)next.lastScopes={...(next.lastScopes||{}),[scope.subject]:scope};delete next.quizFeedback;delete next.activePractice;
 drill=null;paperCursor=null;
 if(commit(next)){sessionDirty=true;go('quiz');}
}
function renderView(){
 $('#date').textContent=new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});
 if((view==='subject'||view==='range')&&!viewSubject)view='home';
 for(const v of VIEWS)$('#'+v+'View').hidden=v!==view;document.body.dataset.view=view;
 // 과목 선택 화면을 벗어나면 승인 관리는 닫는다: 다시 돌아왔을 때 오래된 목록이 남지 않는다.
 if(view!=='home')$('#adminPanel').hidden=true;
 if(view==='home')renderHome();else if(view==='subject')renderSubject();else if(view==='range')renderRange();else if(view==='progress')renderProgress();else renderQuiz();
}
function renderHome(){
 const list=$('#subjectList'),playable=data.cards.filter(isPlayable);list.replaceChildren();
 for(const s of subjectsList()){const cards=playable.filter(c=>c.subject===s);list.append(menuItem(s,questionCount(cards)+'문항 · 풀 문제 '+reviewQueue(cards).ready.length+'개',()=>go('subject',s)));}
 if(!list.children.length)list.append(elem('p',data.cards.length?'퀴즈 보기가 준비된 카드가 없어요.':'문제를 불러오는 중입니다.'));
}
function renderSubject(){
 const s=viewSubject,cards=data.cards.filter(c=>isPlayable(c)&&c.subject===s),ids=new Set(cards.map(c=>c.id)),today=day();
 $('#subjectTitle').textContent=s;
 const newRoom=newCardRoom(cards);
 $('#subjectSummary').textContent=questionCount(cards)+'문항 · 풀 문제 '+reviewQueue(cards).ready.length+'개'+(newRoom?' (새 문제 '+newRoom+'개 포함)':'')+' · 오늘 푼 문제 '+data.history.filter(h=>h.date===today&&ids.has(h.cardId)).length+'개';
 const last=lastScope(s),open=sameScope(scopeOf(),last)&&(data.activePractice||data.quizFeedback);
 $('#resumeHint').textContent=last?scopeLabel(last)+(open?' · 풀던 문제부터':' · 이어서 풀기'):s+' 전체의 첫 문제부터 시작해요';
}
function renderRange(){
 const s=viewSubject,root=$('#rangeList'),cards=data.cards.filter(c=>isPlayable(c)&&c.subject===s);
 $('#rangeTitle').textContent=s+' · 연습 범위';root.replaceChildren();
 const group=(title,folded)=>{const g=elem('div',undefined,'menu-list');if(folded){const d=elem('details',undefined,'range-fold');d.append(elem('summary',title,'range-heading'),g);root.append(d);}else root.append(elem('h3',title,'range-heading'),g);return g;};
 const scope=(round,topic='')=>({subject:s,topic,round});
 // 회차 범위는 대기열과 무관하게 1번부터 끝까지 나오므로 '풀 문제' 수를 붙이지 않는다. 대신 순서를 알린다.
 const option=(g,title,sc,extra)=>{const inside=cards.filter(c=>inScope(c,sc)),p=firstPass(new Set(inside.map(c=>c.id)));if(!inside.length)return;
  const seen=inside.length+'문제 · 첫 시도 '+p.answered+'/'+inside.length+(p.answered?' · 정답 '+p.correct:'');
  const detail=sequentialScope(sc)?seen+' · 1번부터 순서대로':seen+' · 풀 문제 '+reviewQueue(inside).ready.length+(newCardRoom(inside)?' · 새 문제 '+newCardRoom(inside):'');
  g.append(menuItem(title,detail+(extra?' · '+extra:''),()=>openScope(sc)));};
 // 공무원 기출은 과목마다 회차가 40개 가까이 된다. 한 줄로 늘어놓으면 휴대폰에서 원하는 회차를 찾기 어려워
 // 연도별로 접는다(range-fold 안에 range-fold). 최신 연도가 맨 위이고, 지금 풀던 회차가 든 연도(없으면 최신 연도)만 펼쳐 둔다.
 const paperYears=(parent,current)=>{
  const years=new Map();for(const p of Gichul.forSubject(s)){if(!years.has(p.year))years.set(p.year,[]);years.get(p.year).push(p);}
  const open=paperScope(current)?Gichul.paper(paperScope(current)).year:Math.max(...years.keys());
  for(const [year,list]of years){
   const ids=new Set(cards.filter(c=>list.some(p=>p.id===Gichul.paperOf(c.id))).map(c=>c.id)),first=firstPass(ids);
   const fold=elem('details',undefined,'range-fold paper-year'),g=elem('div',undefined,'menu-list');fold.open=year===open;
   fold.append(elem('summary',year+'년 · '+list.length+'회차 · 첫 시도 '+first.answered+'/'+ids.size,'range-heading'),g);parent.append(fold);
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
 }else if(s==='영어'){const g=group('문제집 진도');option(g,'Day 1 문장의 구조·동사 유형',scope('','Day 1'));
  const exams=group('기출 · 회차별 ('+paperCount+'회차)',!paperScope(scopeOf().round));paperYears(exams,scopeOf().round);
  const rest=group('그 밖의 범위',true);option(rest,'수일치',scope('','수일치'));option(rest,'그 밖의 문법 연습',scope('','영문법'));option(rest,'영어 전체',scope(''));}
 else if(PAPER_SUBJECTS.has(s)){
  const exams=group('기출 · 회차별 ('+paperCount+'회차)');paperYears(exams,scopeOf().round);
  option(group('그 밖의 범위',true),s+' 전체',scope(''));
 }
 else option(group(s),s+' 전체',scope(''));
}
function renderProgress(){
 const playable=data.cards.filter(isPlayable),today=day(),todayRows=data.history.filter(h=>h.date===today);
 const stat=cards=>{const ids=new Set(cards.map(c=>c.id));return {due:reviewQueue(cards).ready.length,total:cards.length,done:todayRows.filter(h=>ids.has(h.cardId)).length};};
 const all=stat(playable);$('#due').textContent=all.due;$('#total').textContent=all.total;$('#done').textContent=all.done;
 const metric=ReviewLearning.metrics(playable,data.history);$('#retention').textContent=metric.total?Math.round(metric.correct/metric.total*100)+'% ('+metric.correct+'/'+metric.total+')':'아직 기록 없음';
 const body=$('#subjectStats');body.replaceChildren();
 for(const s of subjectsList()){const r=stat(playable.filter(c=>c.subject===s)),row=elem('tr');for(const v of [s,r.due,r.total,r.done])row.append(elem('td',String(v)));body.append(row);}
 renderStudyCredit();
}
function renderQuiz(){
 const opened=new Set([...document.querySelectorAll('[data-explanation-key][open]')].map(e=>e.dataset.explanationKey));
 const hadFocus=document.activeElement?.id==='practiceInput',caret=hadFocus?document.activeElement.selectionStart:null;
 const scope=scopeOf(),playable=data.cards.filter(isPlayable),ordered=orderedScope(scope.round);
 $('#scopeLabel').textContent=scopeLabel(scope);renderScopeStatus(scope);
 const inside=playable.filter(c=>inScope(c,scope)),chosen=ordered?catalogOrder(inside):inside,queue=reviewQueue(chosen),due=queue.ready;
 // 전부 풀기 모드에서는 복습 대기열(due·재시도·형제 간격)을 거치지 않고 드릴 순서만 따른다.
 const drilling=drillOn(scope),item=drilling?StudyDrill.current(drill):null;
 // 기출 회차: 대기열을 거치지 않고 원문 순서 그대로 낸다. 드릴을 켜면 드릴이 우선한다(회차에서는 드릴 버튼을 감춘다).
 const sequential=!drilling&&sequentialScope(scope)&&chosen.length>0,at=sequential?paperIndex(scope):-1;
 const feedback=data.quizFeedback&&chosen.find(c=>c.id===data.quizFeedback.cardId);
 const card=feedback||(drilling?(item&&chosen.find(c=>c.id===item.cardId)):sequential?chosen[at]:due.find(c=>c.id===data.activePractice?.cardId)||due[0]);
 const waiting=chosen.filter(c=>c.retryAt&&Date.parse(c.retryAt)>Date.now());$('#retryStatus').textContent=drilling||sequential?'':waiting.length?waiting.length+'문제 재시도 대기 · '+new Date(Math.min(...waiting.map(c=>Date.parse(c.retryAt)))).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})+'부터 다시 풀 수 있어요.':'';
 if(!drilling&&!sequential&&queue.waiting.length)$('#retryStatus').textContent+=' '+queue.waiting.length+'개 관련 카드 · '+new Date(queue.nextAt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})+'부터 풀 수 있어요.';
 const toggle=$('#drillToggle');toggle.hidden=!chosen.length||sequential;toggle.textContent=drilling?'전부 풀기 끄기':'이 범위 전부 풀기';toggle.setAttribute('aria-pressed',String(drilling));
 const place=card?chosen.findIndex(c=>c.id===card.id)+1:chosen.length;
 $('#drillStatus').textContent=drilling?StudyDrill.label(drill):sequential?place+'/'+chosen.length+' · 원문 순서 그대로':'';$('#drillStatus').hidden=!drilling&&!sequential;
 const root=$('#card');root.replaceChildren();root.classList.toggle('paper-card',!!Hanneung.get(card?.id)&&!feedback);root.classList.toggle('gichul-card',!!Gichul.get(card?.id));root.classList.toggle('feedback-card',!!feedback);
 if(!card){
  if(sequentialScope(scope)&&chosen.length){
   root.append(elem('h2','이 회차를 끝까지 풀었어요'),elem('p',scopeLabel(scope)+' · '+chosen.length+'문항을 1번부터 순서대로 모두 풀었어요. 채점 기록과 복습 일정은 평소대로 남았어요.'));
   root.append(btn('처음부터 다시 풀기',()=>{paperRestart();render();window.scrollTo(0,0);},'primary'));
   if(scope.subject)root.append(btn('다른 범위 고르기',()=>go('range',scope.subject)));
   return;
  }
  if(drilling){
   root.append(elem('h2','이 범위를 전부 풀었어요'),elem('p',scopeLabel(scope)+' · '+drill.total+'문항을 모두 한 번 이상 맞혔어요.'+(drill.round>1?' 틀린 문제만 다시 도느라 '+drill.round+'회차까지 왔어요.':'')));
   root.append(btn('전부 풀기 끝내기',toggleDrill,'primary'));
   if(scope.subject)root.append(btn('다른 범위 고르기',()=>go('range',scope.subject)));
   return;
  }
  root.append(elem('h2',queue.waiting.length?'비슷한 내용은 잠시 뒤 다시 풀어요':waiting.length?'잠시 뒤 틀린 문제를 다시 풀어요':data.cards.length&&!playable.length?'퀴즈 보기가 준비된 카드가 없어요':'오늘 풀 문제를 마쳤어요'));
  const t=topicRange(scope.round),index=StudyTopics.list.findIndex(x=>x.id===t?.id),set=studyScope(scope.round);
  const nextTopic=t&&StudyTopics.list.slice(index+1).find(x=>data.cards.some(c=>isPlayable(c)&&inScope(c,{subject:'한국사',round:(t.papers?'papers-':'topic-')+x.id})));
  const lecture=STUDY_LECTURES.findIndex(l=>l.id===lectureScope(scope.round)),nextLecture=lecture>=0?STUDY_LECTURES[lecture+1]:null;
  if(nextTopic)root.append(btn('다음 주제 풀기 · '+nextTopic.title,()=>openScope({subject:'한국사',round:(t.papers?'papers-':'topic-')+nextTopic.id}),'primary'));
  else if(nextLecture)root.append(btn('다음 강 풀기 · '+nextLecture.title,()=>openScope({subject:'한국사',round:'lecture-'+nextLecture.id}),'primary'));
  else if(set>0&&set<STUDY_SETS.length)root.append(btn('다음 묶음 풀기',()=>openScope({subject:'한국사',round:'study-20260910-'+(set+1)}),'primary'));
  if(chosen.length)root.append(btn('이 범위 전부 풀기 · '+questionCount(chosen)+'문항 · 일정과 상관없이 반복',toggleDrill));
  if(scope.subject)root.append(btn('다른 범위 고르기',()=>go('range',scope.subject)));
  return;
 }
 // 기출 회차 파일은 그 회차의 문항을 처음 낼 때 받는다. 받는 동안·받지 못했을 때는 문제 대신 안내만 그린다.
 if(!feedback&&Gichul.known(card.id)&&!Gichul.ready(card.id)){renderPaperLoad(root,card,scope);return;}
 let active=data.activePractice;
 if(drilling&&!feedback){const expected=drillExercise(card,item);if(active?.cardId!==card.id||active.exercise?.exerciseId!==expected.exerciseId){active={cardId:card.id,exercise:expected,draft:'',assisted:false};data.activePractice=active;saveDraft();}}
 if(!drilling&&!feedback&&active?.cardId===card.id){const canonical=CORE_REVIEW_PACK.find(c=>c.id===card.id)||card,current=Practice.refresh(canonical,active.exercise,PRACTICE_BANK,QUIZ_OPTIONS);if(JSON.stringify(current)!==JSON.stringify(active.exercise)){const changed=current.question!==active.exercise.question||current.type!==active.exercise.type;active={...active,exercise:current,draft:changed?'':active.draft};data.activePractice=active;saveDraft();if(changed)notify('풀던 문항의 표현이 수정됐어요. 새 문항을 확인해 주세요.');}}
 if(!drilling&&!feedback&&(!active||active.cardId!==card.id)){if(active?.draft){data.practiceDrafts??={};data.practiceDrafts[active.cardId]=active;}const canonical=CORE_REVIEW_PACK.find(c=>c.id===card.id)||card;const exercise=Practice.select(canonical,data.history,PRACTICE_BANK,QUIZ_OPTIONS),saved=data.practiceDrafts?.[card.id];active=saved?.exercise?.exerciseId===exercise.exerciseId?saved:{cardId:card.id,exercise,draft:'',assisted:false};data.activePractice=active;saveDraft();}
 const quiz=feedback?(data.quizFeedback.exercise||{...QUIZ_OPTIONS[card.id],type:'choice',question:QUIZ_OPTIONS[card.id]?.question||card.question,explanation:card.explanation}):active.exercise;
 const lesson=PRACTICE_BANK[card.id],summary=STUDY_REVIEW_CATALOG.questions[card.id];
 const paperRow=Gichul.get(card.id);
 const label=elem('small',card.subject+' · '+(lesson?.title||(paperRow?Gichul.title(paperRow):quiz.image?Hanneung.title(Hanneung.get(card.id))+(studyTopic(card.id)?' · '+StudyTopics.title(studyTopic(card.id)):''):summary?StudyTopics.title(studyTopic(card.id))+' · 복습 '+summary.number+'번 · 자체 제작':'개념 복습'))+' · '+(quiz.type==='text'?'직접 쓰기':quiz.choiceImages?'사진 객관식':'객관식'));
 if(feedback)renderFeedback(root,card,quiz,lesson,label);
 else{
  root.append(label,elem('div',quiz.question,'question'));
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
 }
 restoreExplanationPanels(opened);
 if(hadFocus&&$('#practiceInput')&&!feedback){$('#practiceInput').focus();$('#practiceInput').setSelectionRange(caret,caret);}
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
 if(f.result==='wrong')banner.append(elem('p','내 답: '+(quiz.type==='text'?f.userAnswer:quiz.choices[f.selectedIndex]??'')));
 banner.append(elem('p','정답: '+correct));root.append(banner);
 appendCorrection(root,quiz);
 const main=elem('details',undefined,'lesson explanation-main');main.append(elem('summary','해설 보기'),explanationText(quiz.explanation||card.explanation||''));attachExplanationCredit(main,reviewId,'feedback');root.append(main);
 appendNewPaperExplanation(root,card.id,quiz.explanation||card.explanation,reviewId,'feedback-supplement');
 if(lesson){root.append(elem('p',lesson.hook,'hook'));const details=elem('details',undefined,'lesson');details.append(elem('summary','규칙과 비교 예문 더 보기'),elem('p',lesson.rule));for(const example of lesson.examples)details.append(elem('p',example,'example'));attachExplanationCredit(details,reviewId,'lesson');root.append(details);}
 const recap=elem('details',undefined,'lesson recap');recap.append(elem('summary','문제 다시 보기'),label,elem('div',quiz.question,'question'));appendPaper(recap,Hanneung.get(card.id));
 if(quiz.type==='choice'&&quiz.choiceImages)appendPhotoChoices(recap,quiz,null,f.selectedIndex);
 else if(quiz.type==='choice'){const choices=elem('div',undefined,'quiz-choices recap-choices');if(quiz.image)choices.classList.add('paper-choices');quiz.choices.forEach((choice,i)=>{const b=elem('button',quiz.fixedOrder?choice:(i+1)+'. '+choice);b.type='button';b.disabled=true;if(i===quiz.correctIndex)b.classList.add('quiz-correct');else if(i===f.selectedIndex)b.classList.add('quiz-wrong');choices.append(b);});recap.append(choices);}
 root.append(recap);
 const dueCard=data.cards.find(c=>c.id===card.id),concept=ReviewPolicy.concept(card.id),siblings=data.cards.some(c=>c.id!==card.id&&isPlayable(c)&&ReviewPolicy.concept(c.id)===concept);
 root.append(elem('p','풀이 완료 · 환산 시간 +1분','study-credit-award'),elem('small','다음 복습: '+dueCard.due+(f.result==='wrong'?' · 5분 뒤 다시 풀 수 있어요.'+(siblings?' 같은 개념의 다른 문제도 10분 뒤 이어서 나와요.':''):''),'next-review'));
 const source=(CORE_REVIEW_PACK.find(c=>c.id===card.id)||card).source;if(quiz.type==='text'||source)root.append(elem('small',quiz.type==='text'?(card.id.startsWith('grammar-verb-')?'문제집 PART 01 문장의 구조·동사 유형 정리 기반 자체 제작 연습':'대화 학습·수일치 정리 기반 자체 제작 연습'):source,'source-line'));
 const next=btn(nextLabel(reviewId),()=>{const state=structuredClone(data);delete state.quizFeedback;delete state.activePractice;if(commit(state)){sessionDirty=true;render();window.scrollTo(0,0);}},'primary next-question');next.id='nextQuestion';next.dataset.review=reviewId||'';root.append(next);
}
function answerPractice(id,input){
 if(data.quizFeedback)return;const active=data.activePractice;if(active?.cardId!==id)return;const quiz=active.exercise;
 if(quiz.image){const img=$('#card .paper-image img');if(!img?.complete||!img.naturalWidth){notify('문제 이미지가 표시된 뒤 답을 골라 주세요.');return;}}
 if(quiz.choiceImages&&[...document.querySelectorAll('#card .photo-choices img')].some(img=>!img.complete||!img.naturalWidth)){notify('보기 사진이 모두 표시된 뒤 답을 골라 주세요.');return;}
 const drilling=drillOn(scopeOf()),item=drilling?StudyDrill.current(drill):null;
 const sequential=!drilling&&sequentialScope(scopeOf());
 if(drilling){if(!item||item.cardId!==id||item.index!==(quiz.variantIndex??0))return;}
 // 회차에서는 대기열이 아니라 "지금 차례인 문항인가"만 본다.
 else if(sequential){if(catalogOrder(data.cards.filter(inCurrent))[paperIndex(scopeOf())]?.id!==id)return;}
 else if(!reviewQueue(data.cards.filter(inCurrent)).ready.some(c=>c.id===id))return;
 if(quiz.type==='text'&&!String(input).trim()){notify('답을 입력한 다음 채점해 주세요.');return;}
 if(quiz.type==='choice'&&(!Number.isInteger(input)||input<0||input>=quiz.choices.length))return;
 const correct=quiz.type==='text'?Practice.grade(quiz,input):input===quiz.correctIndex;
 const next=structuredClone(data),c=next.cards.find(c=>c.id===id),result=correct?(active.assisted?'unsure':'correct'):'wrong';
 delete c.pendingAttempt;c.pendingAttempt=ReviewLearning.begin(c,data.history,result==='correct'?'remember':result==='unsure'?'partial':'none');
 // 같은 날 한 회차를 몰아서 풀어도 간격이 부풀지 않도록 드릴과 같은 assess 래퍼를 그대로 쓴다.
 const assessed=(drilling||sequential?StudyDrill:ReviewLearning).assess(c,data.history,result);if(result==='unsure')delete assessed.card.retryAt;
 next.cards[next.cards.findIndex(c=>c.id===id)]=assessed.card;
 if(!quiz.exerciseId)quiz.exerciseId=id+'-'+Practice.fingerprint(JSON.stringify([quiz.type,quiz.question,quiz.answers||quiz.choices[quiz.correctIndex]]));
 let detail;try{detail=ReviewRecord.create(c,quiz,input,PRACTICE_BANK[id],ReviewPolicy.concept(id),active.assisted);}catch{notify('답안이나 문제 정보를 저장할 수 없어요. 입력 길이를 확인해 주세요.');return;}
 const reviewId=crypto.randomUUID();next.history.push({id:reviewId,...assessed.entry,mode:'quiz',detail});
 if(next.practiceDrafts)delete next.practiceDrafts[id];
 next.quizFeedback={cardId:id,reviewId,selectedIndex:quiz.type==='choice'?input:-1,userAnswer:quiz.type==='text'?String(input):'',result,exercise:quiz};
 delete next.activePractice;notify('');if(commit(next)){if(drilling)drill=StudyDrill.answer(drill,id,item.index,result==='correct');else if(sequential)paperAdvance();sessionDirty=true;render();window.scrollTo(0,0);}
}
function installCorePack(){const pack='core-2026-09-12-v21';if(data.installedPacks?.includes(pack))return;const ids=new Set(data.cards.map(c=>c.id)),extras=Object.entries(PRACTICE_BANK).filter(([id])=>!CORE_REVIEW_PACK.some(c=>c.id===id)).map(([id,l])=>({id,subject:'영어',question:l.variants[0].question,answer:l.variants[0].answers[0],explanation:l.variants[0].explanation,source:id.startsWith('grammar-verb-')?'문제집 PART 01 문장의 구조·동사 유형 정리 기반 자체 제작 연습.':'수일치 문서 기반 자체 제작 연습.'}));const cards=[...CORE_REVIEW_PACK,...extras].filter(c=>!ids.has(c.id)).map(c=>({...newCard({...c,verified:true}),id:c.id}));commit({...data,cards:[...data.cards,...cards],installedPacks:[...new Set([...(data.installedPacks||[]),pack])]});}
installCorePack();
if(!data.quizUiVersion){const next=structuredClone(data);for(const c of next.cards)delete c.pendingAttempt;next.quizUiVersion=1;commit(next);}
else if(data.cards.some(c=>c.pendingAttempt)){const next=structuredClone(data);for(const c of next.cards)delete c.pendingAttempt;if(commit(next))data=next;}
$('#resumeStudy').onclick=()=>openScope(lastScope(viewSubject)||{subject:viewSubject},true);
$('#chooseRange').onclick=()=>go('range');
$('#openProgress').onclick=()=>go('progress');
for(const b of document.querySelectorAll('[data-back]'))b.onclick=goBack;
$('#quizBack').onclick=goBack;
$('#drillToggle').onclick=toggleDrill;
$('#studyTimeMore').onclick=()=>{creditHistoryLimit+=30;renderStudyCredit();};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});render();
setInterval(()=>{if(view==='quiz'&&!document.hidden&&!$('#card .question')&&reviewQueue(data.cards.filter(inCurrent)).ready.length)render();},15000);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});

globalThis.StudyProgress={
 get:()=>structuredClone(data),
 merge(rows){const next=ProgressSync.merge(data,rows);if(JSON.stringify(next)!==JSON.stringify(data)){if(!commit(next))throw Error('Local save failed');render();}},
 session:()=>data.session?structuredClone(data.session):null,
 // A newer position from another device reopens the same scope, question and choice order.
 mergeSession(row){
  const remote=ProgressSync.session(row);if(remote.at<=(data.session?.at||0))return;
  drill=null;paperCursor=null;
  const next=structuredClone(data),scope={subject:remote.subject,topic:remote.topic,round:remote.round};next.session=remote;next.practiceScope=scope;if(scope.subject)next.lastScopes={...(next.lastScopes||{}),[scope.subject]:scope};delete next.quizFeedback;
  const card=remote.cardId&&next.cards.find(c=>c.id===remote.cardId);let exercise=null;
  if(card&&isPlayable(card)&&(!Gichul.known(card.id)||Gichul.ready(card.id)))exercise=Practice.refresh(CORE_REVIEW_PACK.find(c=>c.id===card.id)||card,{exerciseId:remote.exerciseId,variantIndex:remote.variantIndex,type:remote.type,choices:remote.choices},PRACTICE_BANK,QUIZ_OPTIONS);
  if(exercise&&exercise.exerciseId===remote.exerciseId){const own=data.activePractice?.cardId===card.id&&data.activePractice.exercise?.exerciseId===exercise.exerciseId?data.activePractice:null;next.activePractice={...(own||{cardId:card.id,draft:'',assisted:false}),exercise};}else delete next.activePractice;
  if(!commit(next))throw Error('Local save failed');render();
 },
 mergeExplanations(rows){const views=StudyCredit.unionExplanations(data.explanationViews||[],rows);if(JSON.stringify(views)!==JSON.stringify(data.explanationViews||[])){if(!commit({...data,explanationViews:views}))throw Error('Local save failed');renderStudyCredit();updateExplanationCredits();}},
 switchUser(uid){
  const target=profileKey(uid);if(target===KEY)return;
  const raw=localStorage.getItem(target);let next=raw?JSON.parse(raw):{version:2,cards:[],history:[]};validateBackup(next);next=migrate(next);
  const owner=localStorage.getItem('chagog-owner');
  if(uid&&!owner){const guest=localStorage.getItem('chagog-v1');if(guest){const parsed=JSON.parse(guest);validateBackup(parsed);const old=migrate(parsed);const ids=new Set(next.cards.map(c=>c.id));next.cards.push(...old.cards.filter(c=>!ids.has(c.id)));next=ProgressSync.merge(next,old.history);next.explanationViews=StudyCredit.unionExplanations(next.explanationViews||[],old.explanationViews||[]);}}
  delete next.quizFeedback;delete next.activePractice;for(const c of next.cards)delete c.pendingAttempt;
  localStorage.setItem(target,JSON.stringify(next));
  if(uid){if(!owner)localStorage.setItem('chagog-owner',uid);localStorage.setItem('chagog-active-user',uid);}else localStorage.removeItem('chagog-active-user');
  KEY=target;data=next;creditHistoryLimit=14;storageOK=true;drill=null;paperCursor=null;installCorePack();render();
 }
};
