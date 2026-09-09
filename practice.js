'use strict';
(function(root){
 function normalize(s){return String(s).normalize('NFKC').trim().toLowerCase().replace(/[‘’]/g,"'").replace(/[.!?]+$/,'').replace(/\s+/g,' ').trim();}
 function grade(exercise,input){return exercise.type==='text'&&exercise.answers.some(a=>normalize(a)===normalize(input));}
 function fingerprint(text){let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n.toString(16);}
 function select(card,history,bank,options){
  const lesson=bank[card.id],base=options[card.id];
  const mcq=base?[{...base,question:base.question||card.question,explanation:base.explanation||card.explanation,type:'choice'}]:[];
  const variants=base?.placement==='after'?[...(lesson?.variants||[]),...mcq]:[...mcq,...(lesson?.variants||[])];
  if(!variants.length)return null;
  const count=history.filter(h=>h.cardId===card.id).length;
  const index=count%variants.length,exercise=structuredClone(variants[index]);
  exercise.key=card.id+':'+index;exercise.variantIndex=index;exercise.variantCount=variants.length;
  exercise.exerciseId=card.id+'-'+fingerprint(JSON.stringify([exercise.type,exercise.question,exercise.answers||exercise.choices[exercise.correctIndex]]));
  if(exercise.type==='choice'){
   let seed=2166136261;for(const char of card.id+':'+count)seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;
   const correct=exercise.choices[exercise.correctIndex],choices=[...exercise.choices];
   for(let i=choices.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[choices[i],choices[j]]=[choices[j],choices[i]];}
   exercise.choices=choices;exercise.correctIndex=choices.indexOf(correct);
  }
  return exercise;
 }
 // Refresh the same unfinished variant, even when incoming sync has advanced history.
 function refresh(card,saved,bank,options){
  // Content insertion must not silently replace a still-open, unchanged exercise.
  const size=(options[card.id]?1:0)+(bank[card.id]?.variants.length||0);
  let index=Number.isInteger(saved?.variantIndex)?saved.variantIndex:0;
  for(let i=0;i<size;i++){const candidate=select(card,Array.from({length:i},()=>({cardId:card.id})),bank,options);if(candidate.exerciseId===saved?.exerciseId){index=i;break;}}
  const current=select(card,Array.from({length:index},()=>({cardId:card.id})),bank,options);
  if(!current)return null;
  if(current.type==='choice'&&saved?.type==='choice'&&JSON.stringify([...current.choices].sort())===JSON.stringify([...saved.choices].sort())){
   const correct=current.choices[current.correctIndex];current.choices=[...saved.choices];current.correctIndex=current.choices.indexOf(correct);
  }
  return current;
 }
 const api={normalize,grade,select,refresh,fingerprint};root.Practice=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
