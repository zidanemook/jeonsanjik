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
function isPlayable(c){return !!c&&(!!QUIZ_OPTIONS[c.id]||!!PRACTICE_BANK[c.id]);}
const STUDY_SETS=STUDY_REVIEW_CATALOG.sets;
const STUDY_SET_BY_ID=new Map(STUDY_SETS.flatMap(set=>set.ids.map(id=>[id,set.number])));
function studySet(id){return STUDY_SET_BY_ID.get(id)||0;}
function studyScope(value){if(value==='study-20260910')return 0;const match=/^study-20260910-([1-9]\d*)$/.exec(value||'');return match&&STUDY_SETS.some(set=>set.number===Number(match[1]))?Number(match[1]):null;}
const TOPIC_BY_ID=StudyTopics.byCard(STUDY_REVIEW_CATALOG,globalThis.HANNEUNG_TOPICS||{});
function studyTopic(id){return TOPIC_BY_ID.get(id)||'';}
// 'topic-<id>' mixes summary and official questions of one era; 'papers-<id>' keeps only the official ones.
function topicRange(value){const match=/^(topic|papers)-([a-z-]+)$/.exec(value||'');return match&&StudyTopics.list.some(t=>t.id===match[2])?{id:match[2],papers:match[1]==='papers'}:null;}
function topicScope(value){return topicRange(value)?.id||null;}
function scopeOf(){const s=data.practiceScope||{};return {subject:s.subject||'',topic:s.topic||'',round:s.round||''};}
function inScope(c,scope){const subject=scope.subject||'',topic=subject==='영어'?scope.topic||'':'',round=subject==='한국사'?scope.round||'':'',set=studyScope(round),t=topicRange(round);return isPlayable(c)&&(!subject||c.subject===subject)&&(!topic||PRACTICE_BANK[c.id]?.topic===topic)&&(!round||(t?studyTopic(c.id)===t.id&&(!t.papers||!!Hanneung.get(c.id)):set!==null?!!studySet(c.id)&&(!set||studySet(c.id)===set):round==='core'?!Hanneung.get(c.id)&&!studySet(c.id):Hanneung.get(c.id)?.round===Number(round)));}
const inCurrent=c=>inScope(c,scopeOf());
function sameScope(a,b){return !!a&&!!b&&(a.subject||'')===(b.subject||'')&&(a.topic||'')===(b.topic||'')&&(a.round||'')===(b.round||'');}
function scopeLabel(scope){
 const s=scope.subject;if(!s)return '전체 과목';
 if(s==='영어')return '영어 · '+({'':'전체','수일치':'수일치','영문법':'그 밖의 문법 연습'}[scope.topic||'']??scope.topic);
 if(s!=='한국사')return s+' · 전체';
 const r=scope.round||'',t=topicRange(r),set=studyScope(r);
 if(t)return '한국사 · '+StudyTopics.title(t.id)+(t.papers?' · 기출만':'');if(set===0)return '한국사 · 요약자료 전체';if(set)return '한국사 · 요약자료 '+set+'묶음';if(r==='core')return '한국사 · 기존 핵심 복습';if(r)return '한국사 · 기출 '+r+'회';return '한국사 · 전체';
}
// Summary questions open from the first catalog number, so a new topic starts at its first question.
// Summary questions first (catalog order), then official papers from the newest round.
function catalogOrder(cards){const n=c=>{const q=STUDY_REVIEW_CATALOG.questions[c.id];if(q)return q.number;const p=Hanneung.get(c.id);return p?10000+(1000-p.round)*100+p.number:Infinity;};return cards.map((c,i)=>[c,i]).sort((a,b)=>{const x=n(a[0]),y=n(b[0]);return x===y?a[1]-b[1]:x<y?-1:1;}).map(p=>p[0]);}
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
function renderScopeStatus(scope){
 const r=scope.subject==='한국사'?scope.round||'':'',numeric=Number(r),isRound=!!r&&Hanneung.rounds.includes(numeric),el=$('#roundScore');el.hidden=true;el.textContent='';
 if(isRound){const s=Hanneung.stats(numeric,data.history);el.textContent='첫 풀이 '+s.answered+'/'+s.total+'문항 · '+(s.complete?'점수 ':'현재 획득 ')+s.points+'/100점'+(s.bonus?' (공식 오류 문항 2점 포함)':'')+(s.complete?' · '+(s.points>=60?'3급 이상 기준 도달':'3급 기준 60점 미만'):'');el.hidden=false;}
 else if(topicScope(r)||studyScope(r)!==null){const ids=new Set(data.cards.filter(c=>inScope(c,scope)).map(c=>c.id)),p=firstPass(ids);el.textContent='첫 풀이 '+p.answered+'/'+ids.size+'문제 · 정답 '+p.correct+'개';el.hidden=false;}
 const cancelled=$('#annulledQuestion');cancelled.hidden=!(isRound&&numeric===63);if(!cancelled.hidden&&!cancelled.querySelector('img'))appendPaper(cancelled,Hanneung.get('hanneung-63-42'));
}
function saveDraft(){if(!storageOK)return;try{localStorage.setItem(KEY,JSON.stringify(data));}catch{notify('입력 내용을 저장하지 못했어요.');}}
// A wrong answer today also brings back the other questions on the same concept (still after the sibling gap).
function reviewQueue(cards){
 const due=ReviewLearning.queue(cards),ids=new Set(due.map(c=>c.id)),today=day(),missed=new Map(),last=new Map();
 for(const h of data.history){const at=h.at||h.date;if((last.get(h.cardId)||'')<at)last.set(h.cardId,at);if(h.mode==='quiz'&&h.result==='wrong'&&h.date===today){const k=ReviewPolicy.concept(h.cardId);if((missed.get(k)||'')<at)missed.set(k,at);}}
 const extra=missed.size?cards.filter(c=>{if(ids.has(c.id))return false;const at=missed.get(ReviewPolicy.concept(c.id));return !!at&&(last.get(c.id)||'')<at;}):[];
 return ReviewPolicy.separate([...due,...extra],data.history);
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
function questionCount(cards){return cards.reduce((n,c)=>n+(QUIZ_OPTIONS[c.id]?1:0)+(PRACTICE_BANK[c.id]?.variants.length||0),0);}
function menuItem(title,detail,fn,cls='menu-item'){const b=btn('',fn,cls);b.type='button';b.append(elem('strong',title));if(detail)b.append(elem('span',detail));return b;}
function lastScope(subject){const s=data.lastScopes?.[subject]||(data.practiceScope?.subject===subject?data.practiceScope:null);return s?{subject,topic:s.topic||'',round:s.round||''}:null;}
function openScope(scope,resume=false){
 scope={subject:scope.subject||'',topic:scope.subject==='영어'?scope.topic||'':'',round:scope.subject==='한국사'?scope.round||'':''};
 if(resume&&sameScope(scopeOf(),scope)){go('quiz');return;}
 const next=structuredClone(data);next.practiceScope=scope;if(scope.subject)next.lastScopes={...(next.lastScopes||{}),[scope.subject]:scope};delete next.quizFeedback;delete next.activePractice;
 if(commit(next)){sessionDirty=true;go('quiz');}
}
function renderView(){
 $('#date').textContent=new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});
 if((view==='subject'||view==='range')&&!viewSubject)view='home';
 for(const v of VIEWS)$('#'+v+'View').hidden=v!==view;document.body.dataset.view=view;
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
 $('#subjectSummary').textContent=questionCount(cards)+'문항 · 풀 문제 '+reviewQueue(cards).ready.length+'개 · 오늘 푼 문제 '+data.history.filter(h=>h.date===today&&ids.has(h.cardId)).length+'개';
 const last=lastScope(s),open=sameScope(scopeOf(),last)&&(data.activePractice||data.quizFeedback);
 $('#resumeHint').textContent=last?scopeLabel(last)+(open?' · 풀던 문제부터':' · 이어서 풀기'):s+' 전체의 첫 문제부터 시작해요';
}
function renderRange(){
 const s=viewSubject,root=$('#rangeList'),cards=data.cards.filter(c=>isPlayable(c)&&c.subject===s);
 $('#rangeTitle').textContent=s+' · 연습 범위';root.replaceChildren();
 const group=(title,folded)=>{const g=elem('div',undefined,'menu-list');if(folded){const d=elem('details',undefined,'range-fold');d.append(elem('summary',title,'range-heading'),g);root.append(d);}else root.append(elem('h3',title,'range-heading'),g);return g;};
 const scope=(round,topic='')=>({subject:s,topic,round});
 const option=(g,title,sc,extra)=>{const inside=cards.filter(c=>inScope(c,sc)),p=firstPass(new Set(inside.map(c=>c.id)));if(!inside.length)return;g.append(menuItem(title,inside.length+'문제 · 첫 풀이 '+p.answered+'/'+inside.length+(p.answered?' · 정답 '+p.correct:'')+' · 풀 문제 '+reviewQueue(inside).ready.length+(extra?' · '+extra:''),()=>openScope(sc)));};
 if(s==='한국사'){
  const mix=t=>{const inside=cards.filter(c=>studyTopic(c.id)===t.id),papers=inside.filter(c=>Hanneung.get(c.id)).length;return (inside.length-papers?'자체 제작 '+(inside.length-papers):'')+(inside.length-papers&&papers?' + ':'')+(papers?'기출 '+papers:'');};
  const topics=group('주제별 · 자체 제작 + 기출');for(const t of StudyTopics.list)option(topics,t.title,scope('topic-'+t.id),mix(t));
  const current=topicRange(scopeOf().round),papersOnly=group('주제별 · 기출만',!current?.papers);for(const t of StudyTopics.list)option(papersOnly,t.title+' · 기출',scope('papers-'+t.id));
  const papers=group('기출 · 회차별 심화 ('+Math.min(...Hanneung.rounds)+'~'+Math.max(...Hanneung.rounds)+'회)',!Hanneung.rounds.includes(Number(scopeOf().round)));for(const n of Hanneung.rounds){const count=Hanneung.rows.filter(r=>r.round===n&&Hanneung.hasExplanation(r.id)).length;option(papers,n+'회',scope(String(n)),count?'해설 '+count+'개':'');}
  const other=group('그 밖의 범위');option(other,'요약자료 전체 · 자체 제작',scope('study-20260910'));option(other,'기존 핵심 복습',scope('core'));option(other,'한국사 전체',scope(''));
 }else if(s==='영어'){const g=group('영어');option(g,'영어 전체',scope(''));option(g,'수일치',scope('','수일치'));option(g,'그 밖의 문법 연습',scope('','영문법'));}
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
 const scope=scopeOf(),playable=data.cards.filter(isPlayable),ordered=topicScope(scope.round)||studyScope(scope.round)!==null;
 $('#scopeLabel').textContent=scopeLabel(scope);renderScopeStatus(scope);
 const inside=playable.filter(c=>inScope(c,scope)),chosen=ordered?catalogOrder(inside):inside,queue=reviewQueue(chosen),due=queue.ready,feedback=data.quizFeedback&&chosen.find(c=>c.id===data.quizFeedback.cardId),card=feedback||due.find(c=>c.id===data.activePractice?.cardId)||due[0];
 const waiting=chosen.filter(c=>c.retryAt&&Date.parse(c.retryAt)>Date.now());$('#retryStatus').textContent=waiting.length?waiting.length+'문제 재시도 대기 · '+new Date(Math.min(...waiting.map(c=>Date.parse(c.retryAt)))).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})+'부터 다시 풀 수 있어요.':'';
 if(queue.waiting.length)$('#retryStatus').textContent+=' '+queue.waiting.length+'개 관련 카드 · '+new Date(queue.nextAt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})+'부터 풀 수 있어요.';
 const root=$('#card');root.replaceChildren();root.classList.toggle('paper-card',!!Hanneung.get(card?.id)&&!feedback);root.classList.toggle('feedback-card',!!feedback);
 if(!card){
  root.append(elem('h2',queue.waiting.length?'비슷한 내용은 잠시 뒤 다시 풀어요':waiting.length?'잠시 뒤 틀린 문제를 다시 풀어요':data.cards.length&&!playable.length?'퀴즈 보기가 준비된 카드가 없어요':'오늘 풀 문제를 마쳤어요'));
  const t=topicRange(scope.round),index=StudyTopics.list.findIndex(x=>x.id===t?.id),set=studyScope(scope.round);
  const nextTopic=t&&StudyTopics.list.slice(index+1).find(x=>data.cards.some(c=>isPlayable(c)&&inScope(c,{subject:'한국사',round:(t.papers?'papers-':'topic-')+x.id})));
  if(nextTopic)root.append(btn('다음 주제 풀기 · '+nextTopic.title,()=>openScope({subject:'한국사',round:(t.papers?'papers-':'topic-')+nextTopic.id}),'primary'));
  else if(set>0&&set<STUDY_SETS.length)root.append(btn('다음 묶음 풀기',()=>openScope({subject:'한국사',round:'study-20260910-'+(set+1)}),'primary'));
  if(scope.subject)root.append(btn('다른 범위 고르기',()=>go('range',scope.subject)));
  return;
 }
 let active=data.activePractice;
 if(!feedback&&active?.cardId===card.id){const canonical=CORE_REVIEW_PACK.find(c=>c.id===card.id)||card,current=Practice.refresh(canonical,active.exercise,PRACTICE_BANK,QUIZ_OPTIONS);if(JSON.stringify(current)!==JSON.stringify(active.exercise)){const changed=current.question!==active.exercise.question||current.type!==active.exercise.type;active={...active,exercise:current,draft:changed?'':active.draft};data.activePractice=active;saveDraft();if(changed)notify('풀던 문항의 표현이 수정됐어요. 새 문항을 확인해 주세요.');}}
 if(!feedback&&(!active||active.cardId!==card.id)){if(active?.draft){data.practiceDrafts??={};data.practiceDrafts[active.cardId]=active;}const canonical=CORE_REVIEW_PACK.find(c=>c.id===card.id)||card;const exercise=Practice.select(canonical,data.history,PRACTICE_BANK,QUIZ_OPTIONS),saved=data.practiceDrafts?.[card.id];active=saved?.exercise?.exerciseId===exercise.exerciseId?saved:{cardId:card.id,exercise,draft:'',assisted:false};data.activePractice=active;saveDraft();}
 const quiz=feedback?(data.quizFeedback.exercise||{...QUIZ_OPTIONS[card.id],type:'choice',question:QUIZ_OPTIONS[card.id]?.question||card.question,explanation:card.explanation}):active.exercise;
 const lesson=PRACTICE_BANK[card.id],summary=STUDY_REVIEW_CATALOG.questions[card.id];
 const label=elem('small',card.subject+' · '+(lesson?.title||(quiz.image?Hanneung.title(Hanneung.get(card.id))+(studyTopic(card.id)?' · '+StudyTopics.title(studyTopic(card.id)):''):summary?StudyTopics.title(studyTopic(card.id))+' · 복습 '+summary.number+'번 · 자체 제작':'개념 복습'))+' · '+(quiz.type==='text'?'직접 쓰기':'객관식'));
 if(feedback)renderFeedback(root,card,quiz,lesson,label);
 else{
  root.append(label,elem('div',quiz.question,'question'));
  appendPaper(root,Hanneung.get(card.id));
  if(quiz.type==='choice'){
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
 if(quiz.type==='choice'){const choices=elem('div',undefined,'quiz-choices recap-choices');if(quiz.image)choices.classList.add('paper-choices');quiz.choices.forEach((choice,i)=>{const b=elem('button',quiz.fixedOrder?choice:(i+1)+'. '+choice);b.type='button';b.disabled=true;if(i===quiz.correctIndex)b.classList.add('quiz-correct');else if(i===f.selectedIndex)b.classList.add('quiz-wrong');choices.append(b);});recap.append(choices);}
 root.append(recap);
 const dueCard=data.cards.find(c=>c.id===card.id),concept=ReviewPolicy.concept(card.id),siblings=data.cards.some(c=>c.id!==card.id&&isPlayable(c)&&ReviewPolicy.concept(c.id)===concept);
 root.append(elem('p','풀이 완료 · 환산 시간 +1분','study-credit-award'),elem('small','다음 복습: '+dueCard.due+(f.result==='wrong'?' · 5분 뒤 다시 풀 수 있어요.'+(siblings?' 같은 개념의 다른 문제도 10분 뒤 이어서 나와요.':''):''),'next-review'));
 const source=(CORE_REVIEW_PACK.find(c=>c.id===card.id)||card).source;if(quiz.type==='text'||source)root.append(elem('small',quiz.type==='text'?'대화 학습·수일치 정리 기반 자체 제작 연습':source,'source-line'));
 const next=btn(nextLabel(reviewId),()=>{const state=structuredClone(data);delete state.quizFeedback;delete state.activePractice;if(commit(state)){sessionDirty=true;render();window.scrollTo(0,0);}},'primary next-question');next.id='nextQuestion';next.dataset.review=reviewId||'';root.append(next);
}
function answerPractice(id,input){
 if(data.quizFeedback)return;const active=data.activePractice;if(active?.cardId!==id)return;const quiz=active.exercise;
 if(quiz.image){const img=$('#card .paper-image img');if(!img?.complete||!img.naturalWidth){notify('문제 이미지가 표시된 뒤 답을 골라 주세요.');return;}}
 if(!reviewQueue(data.cards.filter(inCurrent)).ready.some(c=>c.id===id))return;
 if(quiz.type==='text'&&!String(input).trim()){notify('답을 입력한 다음 채점해 주세요.');return;}
 if(quiz.type==='choice'&&(!Number.isInteger(input)||input<0||input>=quiz.choices.length))return;
 const correct=quiz.type==='text'?Practice.grade(quiz,input):input===quiz.correctIndex;
 const next=structuredClone(data),c=next.cards.find(c=>c.id===id),result=correct?(active.assisted?'unsure':'correct'):'wrong';
 delete c.pendingAttempt;c.pendingAttempt=ReviewLearning.begin(c,data.history,result==='correct'?'remember':result==='unsure'?'partial':'none');
 const assessed=ReviewLearning.assess(c,data.history,result);if(result==='unsure')delete assessed.card.retryAt;
 next.cards[next.cards.findIndex(c=>c.id===id)]=assessed.card;
 if(!quiz.exerciseId)quiz.exerciseId=id+'-'+Practice.fingerprint(JSON.stringify([quiz.type,quiz.question,quiz.answers||quiz.choices[quiz.correctIndex]]));
 let detail;try{detail=ReviewRecord.create(c,quiz,input,PRACTICE_BANK[id],ReviewPolicy.concept(id),active.assisted);}catch{notify('답안이나 문제 정보를 저장할 수 없어요. 입력 길이를 확인해 주세요.');return;}
 const reviewId=crypto.randomUUID();next.history.push({id:reviewId,...assessed.entry,mode:'quiz',detail});
 if(next.practiceDrafts)delete next.practiceDrafts[id];
 next.quizFeedback={cardId:id,reviewId,selectedIndex:quiz.type==='choice'?input:-1,userAnswer:quiz.type==='text'?String(input):'',result,exercise:quiz};
 delete next.activePractice;notify('');if(commit(next)){sessionDirty=true;render();window.scrollTo(0,0);}
}
function installCorePack(){const pack='core-2026-09-10-v7';if(data.installedPacks?.includes(pack))return;const ids=new Set(data.cards.map(c=>c.id)),extras=Object.entries(PRACTICE_BANK).filter(([id])=>!CORE_REVIEW_PACK.some(c=>c.id===id)).map(([id,l])=>({id,subject:'영어',question:l.variants[0].question,answer:l.variants[0].answers[0],explanation:l.variants[0].explanation,source:'수일치 문서 기반 자체 제작 연습.'}));const cards=[...CORE_REVIEW_PACK,...extras].filter(c=>!ids.has(c.id)).map(c=>({...newCard({...c,verified:true}),id:c.id}));commit({...data,cards:[...data.cards,...cards],installedPacks:[...new Set([...(data.installedPacks||[]),pack])]});}
installCorePack();
if(!data.quizUiVersion){const next=structuredClone(data);for(const c of next.cards)delete c.pendingAttempt;next.quizUiVersion=1;commit(next);}
else if(data.cards.some(c=>c.pendingAttempt)){const next=structuredClone(data);for(const c of next.cards)delete c.pendingAttempt;if(commit(next))data=next;}
$('#resumeStudy').onclick=()=>openScope(lastScope(viewSubject)||{subject:viewSubject},true);
$('#chooseRange').onclick=()=>go('range');
$('#openProgress').onclick=()=>go('progress');
for(const b of document.querySelectorAll('[data-back]'))b.onclick=goBack;
$('#quizBack').onclick=goBack;
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
  const next=structuredClone(data),scope={subject:remote.subject,topic:remote.topic,round:remote.round};next.session=remote;next.practiceScope=scope;if(scope.subject)next.lastScopes={...(next.lastScopes||{}),[scope.subject]:scope};delete next.quizFeedback;
  const card=remote.cardId&&next.cards.find(c=>c.id===remote.cardId);let exercise=null;
  if(card&&isPlayable(card))exercise=Practice.refresh(CORE_REVIEW_PACK.find(c=>c.id===card.id)||card,{exerciseId:remote.exerciseId,variantIndex:remote.variantIndex,type:remote.type,choices:remote.choices},PRACTICE_BANK,QUIZ_OPTIONS);
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
  KEY=target;data=next;creditHistoryLimit=14;storageOK=true;installCorePack();render();
 }
};
