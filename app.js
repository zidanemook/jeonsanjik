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
function validateBackup(v){if(![1,2].includes(v?.version)||!Array.isArray(v.cards)||!Array.isArray(v.history))throw Error('지원하지 않는 백업입니다.');const ids=new Set();for(const c of v.cards){validateContent(c);if(typeof c.id!=='string'||ids.has(c.id)||!validDay(c.created)||!(c.due===null||validDay(c.due))||(v.version===1?(!Number.isInteger(c.stage)||c.stage<0||c.stage>4):(!Number.isFinite(c.ease)||c.ease<1.3||c.ease>3||!Number.isInteger(c.interval)||c.interval<0||c.interval>365||!Number.isInteger(c.streak)||c.streak<0||c.due===null)))throw Error('카드 일정 또는 ID가 올바르지 않습니다.');if(c.retryAt!==undefined&&!Number.isFinite(Date.parse(c.retryAt)))throw Error('잘못된 재학습 시간');if(c.pendingAttempt!==undefined&&(!['remember','partial','none'].includes(c.pendingAttempt.recall)||!validDay(c.pendingAttempt.date)||!Number.isFinite(Date.parse(c.pendingAttempt.at))||typeof c.pendingAttempt.delayedFirst!=='boolean'))throw Error('잘못된 회상 기록');ids.add(c.id);}for(const h of v.history){if(typeof h.id!=='string'||typeof h.cardId!=='string'||!validDay(h.date)||!['correct','unsure','wrong'].includes(h.result))throw Error('복습 기록이 올바르지 않습니다.');}if(v.quizFeedback!==undefined&&(!v.quizFeedback||typeof v.quizFeedback.cardId!=='string'||!Number.isInteger(v.quizFeedback.selectedIndex)||!['correct','wrong','unsure'].includes(v.quizFeedback.result)))throw Error('퀴즈 피드백이 올바르지 않습니다.');}
function newCard(c){validateContent(c);return {id:crypto.randomUUID(),subject:c.subject.trim(),question:c.question.trim(),answer:c.answer.trim(),explanation:c.explanation||'',source:c.source||'',verified:c.verified===true,created:day(),due:day(),ease:2.5,interval:0,streak:0};}
function isPlayable(c){return !!c&&(!!QUIZ_OPTIONS[c.id]||!!PRACTICE_BANK[c.id]);}
function inScope(c){const subject=$('#subjectFilter').value,topic=$('#topicFilter').value;return isPlayable(c)&&(!subject||c.subject===subject)&&(!topic||PRACTICE_BANK[c.id]?.topic===topic);}
function saveDraft(){if(!storageOK)return;try{localStorage.setItem(KEY,JSON.stringify(data));}catch{notify('입력 내용을 저장하지 못했어요.');}}
let historyLimit=30;
function renderHistory(cards){
 const byId=new Map(cards.map(c=>[c.id,c]));
 const rows=data.history.filter(h=>byId.has(h.cardId)).sort((a,b)=>b.date.localeCompare(a.date)||(b.at||'').localeCompare(a.at||'')||b.id.localeCompare(a.id));
 $('#historyTitle').textContent='학습 기록 · '+rows.length+'회';const list=$('#historyList');list.replaceChildren();
 if(!rows.length){list.append(elem('p','문제를 풀면 날짜와 채점 결과가 여기에 남아요.'));return;}
 for(const row of rows.slice(0,historyLimit)){const card=byId.get(row.cardId),item=elem('li',undefined,'history-row'),result=elem('strong',row.result==='correct'?'정답':row.result==='wrong'?'오답':'복습 필요','result-'+row.result);const content=elem('div');const label=PRACTICE_BANK[card.id]?.title||card.question.split('\n')[0];content.append(elem('div',card.subject+' · '+label));const time=row.at&&Number.isFinite(Date.parse(row.at))?new Date(row.at).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}):'';content.append(elem('small',row.date+' '+time));item.append(result,content);list.append(item);}
 if(rows.length>historyLimit){const item=elem('li');item.append(btn('이전 기록 더 보기',()=>{historyLimit+=30;renderHistory(data.cards.filter(inScope));}));list.append(item);}
}
function render(){
 const hadFocus=document.activeElement?.id==='practiceInput',caret=hadFocus?document.activeElement.selectionStart:null;
 const today=day(),select=$('#subjectFilter'),selected=data.practiceScope?.subject||'',playable=data.cards.filter(isPlayable),subjects=[...new Set(playable.map(c=>c.subject))];select.replaceChildren();const all=elem('option','전체 과목');all.value='';select.append(all);for(const subject of subjects){const o=elem('option',subject);o.value=subject;select.append(o);}select.value=subjects.includes(selected)?selected:'';
 $('#topicFilter').value=data.practiceScope?.topic||'';$('#topicLabel').hidden=select.value!=='영어';if(select.value!=='영어')$('#topicFilter').value='';
 const chosen=playable.filter(inScope),due=ReviewLearning.queue(chosen),feedback=data.quizFeedback&&chosen.find(c=>c.id===data.quizFeedback.cardId),card=feedback||due[0];
 $('#date').textContent=new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});$('#subjectCounts').textContent=subjects.map(s=>s+' '+playable.filter(c=>c.subject===s).length+'문제').join(' · ');$('#due').textContent=due.length;$('#total').textContent=chosen.length;$('#done').textContent=data.history.filter(h=>h.date===today&&chosen.some(c=>c.id===h.cardId)).length;
 const metric=ReviewLearning.metrics(chosen,data.history);$('#retention').textContent=metric.total?Math.round(metric.correct/metric.total*100)+'% ('+metric.correct+'/'+metric.total+')':'아직 기록 없음';
 renderHistory(chosen);
 const waiting=chosen.filter(c=>c.retryAt&&Date.parse(c.retryAt)>Date.now());$('#retryStatus').textContent=waiting.length?waiting.length+'문제 재시도 대기 · '+new Date(Math.min(...waiting.map(c=>Date.parse(c.retryAt)))).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})+'부터 다시 풀 수 있어요.':'';
 const root=$('#card');root.replaceChildren();if(!card){root.append(elem('h2',waiting.length?'잠시 뒤 틀린 문제를 다시 풀어요':data.cards.length&&!playable.length?'퀴즈 보기가 준비된 카드가 없어요':'오늘 풀 문제를 마쳤어요'));return;}
 let active=data.activePractice;
 if(!feedback&&(!active||active.cardId!==card.id)){active={cardId:card.id,exercise:Practice.select(card,data.history,PRACTICE_BANK,QUIZ_OPTIONS),draft:'',assisted:false};data.activePractice=active;saveDraft();}
 const quiz=feedback?(data.quizFeedback.exercise||{...QUIZ_OPTIONS[card.id],type:'choice',question:QUIZ_OPTIONS[card.id]?.question||card.question,explanation:card.explanation}):active.exercise;
 const lesson=PRACTICE_BANK[card.id];
 root.append(elem('small',card.subject+' · '+(lesson?.title||'개념 복습')+' · '+(quiz.type==='text'?'직접 쓰기':'객관식')));
 root.append(elem('div',quiz.question,'question'));
 if(quiz.type==='choice'){
  const choices=elem('div',undefined,'quiz-choices');quiz.choices.forEach((choice,i)=>{const button=btn((i+1)+'. '+choice,()=>answerPractice(card.id,i));if(feedback){button.disabled=true;if(i===quiz.correctIndex)button.classList.add('quiz-correct');else if(i===data.quizFeedback.selectedIndex)button.classList.add('quiz-wrong');}choices.append(button);});root.append(choices);
 }else{
  const form=elem('form',undefined,'practice-form'),label=elem('label','지정한 단어나 빈칸의 답만 입력하세요.');label.htmlFor='practiceInput';
  const input=elem('input');input.id='practiceInput';input.type='text';input.autocomplete='off';input.autocapitalize='none';input.spellcheck=false;input.setAttribute('lang','en');input.value=feedback?data.quizFeedback.userAnswer||'':active.draft;input.disabled=!!feedback;
  input.oninput=()=>{if(data.activePractice?.cardId===card.id){data.activePractice.draft=input.value;saveDraft();}};
  const submit=elem('button','채점하기','primary');submit.type='submit';submit.disabled=!!feedback;form.append(label,input,submit);form.onsubmit=e=>{e.preventDefault();answerPractice(card.id,input.value);};root.append(form);
 }
 if(feedback){
  const f=data.quizFeedback,answer=elem('div',undefined,'answer'),correct=quiz.type==='text'?quiz.answers.join(' / '):quiz.choices[quiz.correctIndex];
  answer.append(elem('strong',f.result==='correct'?'정답입니다.':f.result==='unsure'?'정답입니다. 설명을 보고 풀어 내일 다시 연습해요.':'틀렸어요. 정답: '+correct),elem('p',quiz.explanation||card.explanation));
  if(lesson)answer.append(elem('p',lesson.hook,'hook'));
  if(lesson){const details=elem('details',undefined,'lesson');details.append(elem('summary','규칙과 비교 예문 더 보기'),elem('p',lesson.rule));for(const example of lesson.examples)details.append(elem('p',example,'example'));answer.append(details);}
  answer.append(elem('small',quiz.type==='text'?'대화 학습·수일치 정리 기반 자체 제작 연습':card.source));
  const dueCard=data.cards.find(c=>c.id===card.id);answer.append(elem('small','다음 복습: '+dueCard.due+(f.result==='wrong'?' · 5분 뒤에도 다시 풀 수 있어요.':'')));
  root.append(answer,btn('다음 문제',()=>{const next=structuredClone(data);delete next.quizFeedback;delete next.activePractice;if(commit(next))render();},'primary'));
 }
 if(hadFocus&&$('#practiceInput')&&!feedback){$('#practiceInput').focus();$('#practiceInput').setSelectionRange(caret,caret);}
}
function answerPractice(id,input){
 if(data.quizFeedback)return;const active=data.activePractice;if(active?.cardId!==id)return;const quiz=active.exercise;
 if(!ReviewLearning.queue(data.cards.filter(inScope)).some(c=>c.id===id))return;
 if(quiz.type==='text'&&!String(input).trim()){notify('답을 입력한 다음 채점해 주세요.');return;}
 if(quiz.type==='choice'&&(!Number.isInteger(input)||input<0||input>=quiz.choices.length))return;
 const correct=quiz.type==='text'?Practice.grade(quiz,input):input===quiz.correctIndex;
 const next=structuredClone(data),c=next.cards.find(c=>c.id===id),result=correct?(active.assisted?'unsure':'correct'):'wrong';
 delete c.pendingAttempt;c.pendingAttempt=ReviewLearning.begin(c,data.history,result==='correct'?'remember':result==='unsure'?'partial':'none');
 const assessed=ReviewLearning.assess(c,data.history,result);if(result==='unsure')delete assessed.card.retryAt;
 next.cards[next.cards.findIndex(c=>c.id===id)]=assessed.card;
 next.history.push({id:crypto.randomUUID(),...assessed.entry,mode:'quiz'});
 next.quizFeedback={cardId:id,selectedIndex:quiz.type==='choice'?input:-1,userAnswer:quiz.type==='text'?String(input):'',result,exercise:quiz};
 delete next.activePractice;notify('');if(commit(next))render();
}
function installCorePack(){const pack='core-2026-09-09-v3';if(data.installedPacks?.includes(pack))return;const ids=new Set(data.cards.map(c=>c.id)),extras=Object.entries(PRACTICE_BANK).filter(([id])=>!CORE_REVIEW_PACK.some(c=>c.id===id)).map(([id,l])=>({id,subject:'영어',question:l.variants[0].question,answer:l.variants[0].answers[0],explanation:l.variants[0].explanation,source:'수일치 문서 기반 자체 제작 연습.'}));const cards=[...CORE_REVIEW_PACK,...extras].filter(c=>!ids.has(c.id)).map(c=>({...newCard({...c,verified:true}),id:c.id}));commit({...data,cards:[...data.cards,...cards],installedPacks:[...new Set([...(data.installedPacks||[]),pack])]});}
installCorePack();
if(!data.quizUiVersion){const next=structuredClone(data);for(const c of next.cards)delete c.pendingAttempt;next.quizUiVersion=1;commit(next);}
else if(data.cards.some(c=>c.pendingAttempt)){const next=structuredClone(data);for(const c of next.cards)delete c.pendingAttempt;if(commit(next))data=next;}
function changeScope(){historyLimit=30;const next=structuredClone(data);next.practiceScope={subject:$('#subjectFilter').value,topic:$('#topicFilter').value};delete next.quizFeedback;delete next.activePractice;if(commit(next))render();}
$('#subjectFilter').onchange=changeScope;$('#topicFilter').onchange=changeScope;
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});render();
setInterval(()=>{if(!document.hidden&&!$('#card .question')&&ReviewLearning.queue(data.cards.filter(inScope)).length)render();},15000);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});

globalThis.StudyProgress={
 get:()=>structuredClone(data),
 merge(rows){const next=ProgressSync.merge(data,rows);if(JSON.stringify(next)!==JSON.stringify(data)){if(!commit(next))throw Error('Local save failed');render();}},
 switchUser(uid){
  const target=profileKey(uid);if(target===KEY)return;
  const raw=localStorage.getItem(target);let next=raw?JSON.parse(raw):{version:2,cards:[],history:[]};validateBackup(next);next=migrate(next);
  const owner=localStorage.getItem('chagog-owner');
  if(uid&&!owner){const guest=localStorage.getItem('chagog-v1');if(guest){const parsed=JSON.parse(guest);validateBackup(parsed);const old=migrate(parsed);const ids=new Set(next.cards.map(c=>c.id));next.cards.push(...old.cards.filter(c=>!ids.has(c.id)));next=ProgressSync.merge(next,old.history);}}
  delete next.quizFeedback;delete next.activePractice;for(const c of next.cards)delete c.pendingAttempt;
  localStorage.setItem(target,JSON.stringify(next));
  if(uid){if(!owner)localStorage.setItem('chagog-owner',uid);localStorage.setItem('chagog-active-user',uid);}else localStorage.removeItem('chagog-active-user');
  KEY=target;data=next;historyLimit=30;storageOK=true;installCorePack();render();
 }
};
