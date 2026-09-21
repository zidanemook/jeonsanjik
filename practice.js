'use strict';
(function(root){
 function normalize(s){return String(s).normalize('NFKC').trim().toLowerCase().replace(/[‘’]/g,"'").replace(/[.!?]+$/,'').replace(/\s+/g,' ').trim();}
 function grade(exercise,input){return exercise.type==='text'&&exercise.answers.some(a=>normalize(a)===normalize(input));}
 function fingerprint(text){let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n.toString(16);}
 // Explanations cite options as ①~④ and marks list each option's wrong words, both in the order they had in `from`; follow the shown order.
 function reorder(exercise,from){
  const nums='①②③④⑤',at=from.map(c=>exercise.choices.indexOf(c));
  // 기억 연결 uses ①② as its own list markers (en-day2-29), so that paragraph keeps its numbers.
  if(exercise.explanation)exercise.explanation=exercise.explanation.split(/(\n\s*\n)/).map(p=>p.startsWith('기억 연결:')?p:p.replace(/[①②③④⑤]/g,m=>at[nums.indexOf(m)]>=0?nums[at[nums.indexOf(m)]]:m)).join('');
  if(exercise.marks)exercise.marks=exercise.choices.map(c=>exercise.marks[from.indexOf(c)]??null);
  if(exercise.fixes)exercise.fixes=exercise.choices.map(c=>exercise.fixes[from.indexOf(c)]??null);
 }
 function select(card,history,bank,options){
  const lesson=bank[card.id],base=options[card.id];
  const mcq=base?[{...base,question:base.question||card.question,explanation:base.explanation||card.explanation,type:'choice'}]:[];
  const variants=base?.placement==='after'?[...(lesson?.variants||[]),...mcq]:[...mcq,...(lesson?.variants||[])];
  if(!variants.length)return null;
  const count=history.filter(h=>h.cardId===card.id).length;
  const index=count%variants.length,exercise=structuredClone(variants[index]);
  exercise.key=card.id+':'+index;exercise.variantIndex=index;exercise.variantCount=variants.length;
  exercise.exerciseId=card.id+'-'+fingerprint(JSON.stringify([exercise.type,exercise.question,exercise.answers||exercise.choices[exercise.correctIndex],...(exercise.image?[exercise.image]:[])]));
  if(exercise.type==='choice'&&!exercise.fixedOrder){
   const correct=exercise.choices[exercise.correctIndex],shuffle=n=>{
    let seed=2166136261;for(const char of card.id+':'+n)seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;
    const choices=[...exercise.choices];
    for(let i=choices.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[choices[i],choices[j]]=[choices[j],choices[i]];}
    return choices;
   };
   // A retry of the same variant never keeps the previous attempt's answer number.
   let choices,previous=-1;
   for(let n=index;n<=count;n+=variants.length){choices=shuffle(n);if(choices.indexOf(correct)===previous)choices.push(choices.shift());previous=choices.indexOf(correct);}
   const from=exercise.choices;exercise.choices=choices;exercise.correctIndex=previous;reorder(exercise,from);
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
  if(current.type==='choice'&&!current.fixedOrder&&saved?.type==='choice'&&JSON.stringify([...current.choices].sort())===JSON.stringify([...saved.choices].sort())){
   const correct=current.choices[current.correctIndex],from=current.choices;current.choices=[...saved.choices];current.correctIndex=current.choices.indexOf(correct);reorder(current,from);
  }
  return current;
 }
 // Split "정답 근거: … / 보기 비교: ① … ② … / 기억 연결: …" into one text per shown option plus the remaining paragraphs.
 // Numbers must already follow the shown order (select/refresh do that). Anything that does not split cleanly returns null.
 function explainByChoice(exercise){
  if(exercise?.type!=='choice'||!exercise.explanation)return null;
  const paras=exercise.explanation.split(/\n\s*\n/),key=paras.findIndex(p=>p.startsWith('정답 근거:')),cmp=paras.findIndex(p=>p.startsWith('보기 비교:'));
  if(key<0||cmp<0)return null;
  const body=paras[cmp].slice('보기 비교:'.length).trim(),marks=[...body.matchAll(/[①②③④⑤]/g)];
  if(!marks.length||marks[0].index!==0)return null;
  const per=exercise.choices.map(()=>null);per[exercise.correctIndex]=paras[key].slice('정답 근거:'.length).trim();
  for(let i=0;i<marks.length;i++){const k='①②③④⑤'.indexOf(marks[i][0]);if(k>=exercise.choices.length||per[k]!==null)return null;per[k]=body.slice(marks[i].index+1,marks[i+1]?.index).trim();if(!per[k])return null;}
  if(per.some(t=>t===null))return null;
  return {per,rest:paras.filter((_,i)=>i!==key&&i!==cmp)};
 }
 const api={normalize,grade,select,refresh,fingerprint,explainByChoice};root.Practice=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
