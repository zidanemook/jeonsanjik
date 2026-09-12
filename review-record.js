'use strict';
(function(root){
 const limits={exerciseId:160,conceptId:160,title:160,subject:80,question:6000,options:6000,submittedAnswer:2000,correctAnswer:2000,explanation:8000};
 function validate(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||value.schema!==1||!['choice','text'].includes(value.presentation)||typeof value.assisted!=='boolean')throw Error('Invalid answer detail');
  const keys=['schema','presentation','assisted',...Object.keys(limits)];if(Object.keys(value).some(k=>!keys.includes(k))||Object.keys(value).length!==keys.length)throw Error('Invalid detail fields');
  const out={schema:1,presentation:value.presentation,assisted:value.assisted};
  for(const [key,max]of Object.entries(limits)){if(typeof value[key]!=='string'||value[key].length>max||(!['options'].includes(key)&&!value[key].trim()))throw Error('Invalid detail '+key);out[key]=value[key];}
  if(!/^[\w-]{1,160}$/.test(out.exerciseId)||!/^[\w-]{1,160}$/.test(out.conceptId))throw Error('Invalid exercise identity');
  return out;
 }
 // 사진 보기는 지난 기록에서도 무엇을 골랐는지 남아야 한다. 보기 이름 뒤에 사진 경로를 함께 적어 둔다.
 function label(exercise,i){return (exercise.fixedOrder?'':(i+1)+'. ')+exercise.choices[i]+(exercise.choiceImages?' (사진: '+exercise.choiceImages[exercise.choices[i]].src+')':'');}
 function create(card,exercise,input,lesson,conceptId,assisted=false){return validate({schema:1,presentation:exercise.type,assisted:!!assisted,exerciseId:exercise.exerciseId,conceptId,title:lesson?.title||card.question.split('\n')[0].slice(0,160),subject:card.subject,question:exercise.question+(exercise.image?'\n원문 이미지: '+exercise.image:''),options:exercise.type==='choice'?exercise.choices.map((s,i)=>label(exercise,i)).join('\n'):'',submittedAnswer:exercise.type==='choice'?label(exercise,input):String(input),correctAnswer:exercise.type==='choice'?label(exercise,exercise.correctIndex):exercise.answers.join(' / '),explanation:exercise.explanation||card.explanation});}
 const api={validate,create};root.ReviewRecord=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
