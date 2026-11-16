(function(root){
 'use strict';
 const words=text=>typeof text==='string'?text.trim().split(/\s+/).filter(Boolean):[];
 const normal=word=>word.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
 const same=(a,b)=>a.length===b.length&&a.every((x,i)=>normal(x)===normal(b[i]));
 // Keep unchanged context outside the blanks. Never change the source exercise.
 function target(mark,sentence){
  const a=words(mark?.wrong),b=words(mark?.fix);
  if(b.length<2||b.length>8||a.length!==b.length||b.some(w=>!normal(w))||
   !same(a.map(normal).sort(),b.map(normal).sort())||same(a,b)||typeof sentence!=='string')return null;
  const at=sentence.indexOf(mark.fix);if(at<0)return null;
  let start=0,end=0;
  while(start<b.length&&normal(a[start])===normal(b[start]))start++;
  while(end<b.length-start&&normal(a[a.length-1-end])===normal(b[b.length-1-end]))end++;
  const tokens=[...mark.fix.matchAll(/\S+/g)],lo=tokens[start].index,hi=tokens[b.length-end-1].index+tokens[b.length-end-1][0].length;
  return {before:sentence.slice(0,at+lo),after:sentence.slice(at+hi),words:b.slice(start,b.length-end)};
 }
 function collect(quiz){
  if(quiz?.type!=='choice')return [];
  return (quiz.marks||[]).flatMap((marks,i)=>(marks||[]).flatMap(mark=>{
   const item=(quiz.fixes?.[i]||[]).map(sentence=>target(mark,sentence)).find(Boolean);
   return item?[{...item,choiceIndex:i}]:[];
  }));
 }
 function shuffle(answer,random=Math.random){
  const out=[...answer];
  for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
  // Bounded fallback also works with a deterministic random source and repeated words.
  if(same(out,answer)){const j=out.findIndex(w=>normal(w)!==normal(out[0]));if(j>0)[out[0],out[j]]=[out[j],out[0]];}
  return out;
 }
 function grade(answer,placed){const slots=answer.map((w,i)=>typeof placed[i]==='string'&&normal(w)===normal(placed[i]));return {correct:placed.length===answer.length&&slots.every(Boolean),slots};}
 function mount(parent,quiz){
  const doc=parent.ownerDocument;
  const el=(tag,text,cls)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  for(const item of collect(quiz)){
   const box=el('section',undefined,'word-order'),title=el('h3','어순 맞추기'),hint=el('p','낱말을 끌거나 눌러 빈칸을 채워 보세요.'),sentence=el('p',undefined,'word-order-sentence'),tray=el('div',undefined,'word-order-tray'),status=el('p','','word-order-status'),show=el('button','정답 보기');
   box.setAttribute('aria-label','어순 맞추기');status.setAttribute('role','status');show.type='button';
   box.append(title,hint,sentence,tray,show,status);parent.append(box);
   const pool=shuffle(item.words),placed=item.words.map(()=>null);let locked=false,timer=null,drag=null,suppressClick=false;
   const button=(text,cls,action)=>{const n=el('button',text,cls);n.type='button';n.disabled=locked;n.addEventListener('click',()=>{if(!suppressClick)action();});return n;};
   function check(){
    if(placed.some(x=>x===null))return;
    const result=grade(item.words,placed.map(i=>pool[i]));locked=!result.correct;
    status.textContent=result.correct?'맞았어요':'다시 해 보세요';box.classList.toggle('is-correct',result.correct);paint();
    if(!result.correct){sentence.querySelectorAll('.word-order-slot').forEach((n,i)=>n.classList.toggle('is-wrong',!result.slots[i]));
     timer=setTimeout(()=>{placed.fill(null);locked=false;paint();},800);}
   }
   function place(id,index){if(locked||index<0||placed[index]!==null)return;const old=placed.indexOf(id);if(old>=0)placed[old]=null;placed[index]=id;status.textContent='';box.classList.remove('is-correct');paint();check();}
   function pointer(n,id){
    n.addEventListener('pointerdown',e=>{if(locked||e.button!==0||drag)return;drag={id,pointerId:e.pointerId,x:e.clientX,y:e.clientY,moved:false,node:n};n.setPointerCapture(e.pointerId);});
    n.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointerId)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)drag.moved=true;
     if(drag.moved){n.classList.add('is-dragging');n.style.transform=`translate(${e.clientX-drag.x}px,${e.clientY-drag.y}px)`;}});
    const finish=(e,cancel)=>{if(!drag||e.pointerId!==drag.pointerId)return;const d=drag;drag=null;n.style.transform='';n.classList.remove('is-dragging');if(n.hasPointerCapture(e.pointerId))n.releasePointerCapture(e.pointerId);
     if(d.moved){suppressClick=true;setTimeout(()=>{suppressClick=false;},0);if(!cancel){const hit=doc.elementFromPoint(e.clientX,e.clientY)?.closest('.word-order-slot');if(hit&&sentence.contains(hit))place(id,Number(hit.dataset.slot));}}
    };
    n.addEventListener('pointerup',e=>finish(e,false));n.addEventListener('pointercancel',e=>finish(e,true));n.addEventListener('lostpointercapture',e=>finish(e,true));
   }
   function paint(){
    sentence.replaceChildren(doc.createTextNode(item.before));tray.replaceChildren();
    placed.forEach((id,i)=>{const n=button(id===null?'[　]':pool[id],'word-order-slot',()=>{if(id!==null){placed[i]=null;status.textContent='';box.classList.remove('is-correct');paint();}});n.dataset.slot=i;n.setAttribute('aria-label',(i+1)+'번째 칸'+(id===null?'':': '+pool[id]));if(id!==null)pointer(n,id);if(i)sentence.append(doc.createTextNode(' '));sentence.append(n);});
    sentence.append(doc.createTextNode(item.after));
    pool.forEach((word,id)=>{if(placed.includes(id))return;const n=button(word,'word-order-word',()=>place(id,placed.indexOf(null)));pointer(n,id);tray.append(n);});
   }
   show.addEventListener('click',()=>{clearTimeout(timer);
    // Allocate repeated words independently.
    const used=new Set();item.words.forEach((word,i)=>{const id=pool.findIndex((w,k)=>w===word&&!used.has(k));placed[i]=id;used.add(id);});
    locked=false;box.classList.add('is-correct');status.textContent='정답이에요';paint();});
   // Let native button keys work without the app's next-question shortcuts.
   box.addEventListener('keydown',e=>e.stopPropagation());paint();
  }
 }
 const api={target,collect,shuffle,grade,mount};root.WordOrder=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
