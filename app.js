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
function validateBackup(v){if(![1,2].includes(v?.version)||!Array.isArray(v.cards)||!Array.isArray(v.history))throw Error('지원하지 않는 백업입니다.');const ids=new Set();for(const c of v.cards){validateContent(c);if(typeof c.id!=='string'||ids.has(c.id)||!validDay(c.created)||!(c.due===null||validDay(c.due))||(v.version===1?(!Number.isInteger(c.stage)||c.stage<0||c.stage>4):(!Number.isFinite(c.ease)||c.ease<1.3||c.ease>3||!Number.isInteger(c.interval)||c.interval<0||c.interval>365||!Number.isInteger(c.streak)||c.streak<0||c.due===null)))throw Error('카드 일정 또는 ID가 올바르지 않습니다.');if(c.retryAt!==undefined&&!Number.isFinite(Date.parse(c.retryAt)))throw Error('잘못된 재학습 시간');if(c.pendingAttempt!==undefined&&(!['remember','partial','none'].includes(c.pendingAttempt.recall)||!validDay(c.pendingAttempt.date)||!Number.isFinite(Date.parse(c.pendingAttempt.at))||typeof c.pendingAttempt.delayedFirst!=='boolean'))throw Error('잘못된 회상 기록');ids.add(c.id);}for(const h of v.history){if(typeof h.id!=='string'||typeof h.cardId!=='string'||!validDay(h.date)||!['correct','unsure','wrong'].includes(h.result))throw Error('복습 기록이 올바르지 않습니다.');}if(v.quizFeedback!==undefined&&(!v.quizFeedback||typeof v.quizFeedback.cardId!=='string'||!Number.isInteger(v.quizFeedback.selectedIndex)||!['correct','wrong'].includes(v.quizFeedback.result)))throw Error('퀴즈 피드백이 올바르지 않습니다.');}
function newCard(c){validateContent(c);return {id:crypto.randomUUID(),subject:c.subject.trim(),question:c.question.trim(),answer:c.answer.trim(),explanation:c.explanation||'',source:c.source||'',verified:c.verified===true,created:day(),due:day(),ease:2.5,interval:0,streak:0};}
function isPlayable(c){return !!c&&!!QUIZ_OPTIONS[c.id];}
function render(){
 const today=day(),select=$('#subjectFilter'),selected=select.value,playable=data.cards.filter(isPlayable),subjects=[...new Set(playable.map(c=>c.subject))];select.replaceChildren();const all=elem('option','전체 과목');all.value='';select.append(all);for(const subject of subjects){const o=elem('option',subject);o.value=subject;select.append(o);}select.value=subjects.includes(selected)?selected:'';
 const chosen=playable.filter(c=>!select.value||c.subject===select.value),due=ReviewLearning.queue(chosen),feedback=data.quizFeedback&&chosen.find(c=>c.id===data.quizFeedback.cardId),card=feedback||due[0];
 $('#date').textContent=new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});$('#subjectCounts').textContent=subjects.map(s=>s+' '+playable.filter(c=>c.subject===s).length+'문제').join(' · ');$('#due').textContent=due.length;$('#total').textContent=chosen.length;$('#done').textContent=data.history.filter(h=>h.date===today&&chosen.some(c=>c.id===h.cardId)).length;
 const metric=ReviewLearning.metrics(chosen,data.history);$('#retention').textContent=metric.total?Math.round(metric.correct/metric.total*100)+'% ('+metric.correct+'/'+metric.total+')':'아직 기록 없음';
 const waiting=chosen.filter(c=>c.retryAt&&Date.parse(c.retryAt)>Date.now());$('#retryStatus').textContent=waiting.length?waiting.length+'문제 재시도 대기 · '+new Date(Math.min(...waiting.map(c=>Date.parse(c.retryAt)))).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})+'부터 다시 풀 수 있어요.':'';
 const root=$('#card');root.replaceChildren();if(!card){root.append(elem('h2',waiting.length?'잠시 뒤 틀린 문제를 다시 풀어요':data.cards.length&&!playable.length?'퀴즈 보기가 준비된 카드가 없어요':'오늘 풀 문제를 마쳤어요'));return;}
 const quiz=QUIZ_OPTIONS[card.id];root.append(elem('small',card.subject+' · 개념 재구성'),elem('div',quiz?.question||card.question,'question'));
 if(!quiz){root.append(elem('p','이 문제의 보기를 준비 중입니다.'));return;}
 const choices=elem('div',undefined,'quiz-choices');quiz.choices.forEach((choice,i)=>{const button=btn((i+1)+'. '+choice,()=>answerQuiz(card.id,i));if(feedback){button.disabled=true;if(i===quiz.correctIndex)button.classList.add('quiz-correct');else if(i===data.quizFeedback.selectedIndex)button.classList.add('quiz-wrong');}choices.append(button);});root.append(choices);
 if(feedback){const answer=elem('div',undefined,'answer');answer.append(elem('strong',data.quizFeedback.result==='correct'?'정답입니다.':'틀렸어요. 정답은 '+(quiz.correctIndex+1)+'번입니다.'),elem('p',card.explanation),elem('small',card.source.replace(/\(정답 [①-⑳]\)|공식 정답 [①-⑳]·?|정답 [①-⑳]/g,'').replace('원문 및  기반','원문 기반')));root.append(answer,btn('다음 문제',()=>{const next=structuredClone(data);delete next.quizFeedback;if(commit(next))render();},'primary'));}
}
function answerQuiz(id,index){if(data.quizFeedback?.cardId===id||!Number.isInteger(index))return;const original=data.cards.find(c=>c.id===id),quiz=QUIZ_OPTIONS[id],subject=$('#subjectFilter').value,playable=ReviewLearning.queue(data.cards.filter(c=>isPlayable(c)&&(!subject||c.subject===subject)));if(!original||!isPlayable(original)||!quiz||index<0||index>=quiz.choices.length||!playable.some(c=>c.id===id))return;const next=structuredClone(data),c=next.cards.find(c=>c.id===id),result=index===quiz.correctIndex?'correct':'wrong';delete c.pendingAttempt;c.pendingAttempt=ReviewLearning.begin(c,data.history,result==='correct'?'remember':'none');const assessed=ReviewLearning.assess(c,data.history,result);next.cards[next.cards.findIndex(c=>c.id===id)]=assessed.card;next.history.push({id:crypto.randomUUID(),...assessed.entry,mode:'quiz',selectedIndex:index});next.quizFeedback={cardId:id,selectedIndex:index,result};if(commit(next))render();}
function installCorePack(){const pack='core-2026-09-08-v1';if(data.installedPacks?.includes(pack))return;const ids=new Set(data.cards.map(c=>c.id)),cards=CORE_REVIEW_PACK.filter(c=>!ids.has(c.id)).map(c=>({...newCard({...c,verified:true}),id:c.id}));commit({...data,cards:[...data.cards,...cards],installedPacks:[...new Set([...(data.installedPacks||[]),pack])]});}
installCorePack();
if(!data.quizUiVersion){const next=structuredClone(data);for(const c of next.cards)delete c.pendingAttempt;next.quizUiVersion=1;commit(next);}
else if(data.cards.some(c=>c.pendingAttempt)){const next=structuredClone(data);for(const c of next.cards)delete c.pendingAttempt;if(commit(next))data=next;}
$('#subjectFilter').onchange=()=>{if(data.quizFeedback){const next=structuredClone(data);delete next.quizFeedback;if(!commit(next))return;}render();};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});render();
setInterval(()=>{if(!document.hidden&&!$('#card .question')&&ReviewLearning.queue(data.cards.filter(c=>isPlayable(c)&&(!$('#subjectFilter').value||c.subject===$('#subjectFilter').value))).length)render();},15000);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});

globalThis.StudyProgress={
 get:()=>structuredClone(data),
 merge(rows){const next=ProgressSync.merge(data,rows);if(JSON.stringify(next)!==JSON.stringify(data)){if(!commit(next))throw Error('Local save failed');render();}},
 switchUser(uid){
  const target=profileKey(uid);if(target===KEY)return;
  const raw=localStorage.getItem(target);let next=raw?JSON.parse(raw):{version:2,cards:[],history:[]};validateBackup(next);next=migrate(next);
  const owner=localStorage.getItem('chagog-owner');
  if(uid&&!owner){const guest=localStorage.getItem('chagog-v1');if(guest){const parsed=JSON.parse(guest);validateBackup(parsed);const old=migrate(parsed);const ids=new Set(next.cards.map(c=>c.id));next.cards.push(...old.cards.filter(c=>!ids.has(c.id)));next=ProgressSync.merge(next,old.history);}}
  delete next.quizFeedback;for(const c of next.cards)delete c.pendingAttempt;
  localStorage.setItem(target,JSON.stringify(next));
  if(uid){if(!owner)localStorage.setItem('chagog-owner',uid);localStorage.setItem('chagog-active-user',uid);}else localStorage.removeItem('chagog-active-user');
  KEY=target;data=next;storageOK=true;installCorePack();render();
 }
};
