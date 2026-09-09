'use strict';
(function(root){
 function normalize(s){return String(s).normalize('NFKC').trim().toLowerCase().replace(/[‘’]/g,"'").replace(/[.!?]+$/,'').replace(/\s+/g,' ').trim();}
 function grade(exercise,input){return exercise.type==='text'&&exercise.answers.some(a=>normalize(a)===normalize(input));}
 function select(card,history,bank,options){
  const lesson=bank[card.id],base=options[card.id];
  const variants=[...(base?[{...base,question:base.question||card.question,explanation:card.explanation,type:'choice'}]:[]),...(lesson?.variants||[])];
  if(!variants.length)return null;
  const count=history.filter(h=>h.cardId===card.id).length;
  const index=count%variants.length,exercise=structuredClone(variants[index]);
  exercise.key=card.id+':'+index;exercise.variantIndex=index;exercise.variantCount=variants.length;
  if(exercise.type==='choice'){
   let seed=2166136261;for(const char of card.id+':'+count)seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;
   const correct=exercise.choices[exercise.correctIndex],choices=[...exercise.choices];
   for(let i=choices.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[choices[i],choices[j]]=[choices[j],choices[i]];}
   exercise.choices=choices;exercise.correctIndex=choices.indexOf(correct);
  }
  return exercise;
 }
 const api={normalize,grade,select};root.Practice=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
