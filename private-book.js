'use strict';
(function(root){
 let current=null,generation=0;
 const cache=new Map(),mounts=new Set();
 const eligible=id=>/^(com-cg(?:0[1-9]|1\d|2[0-6])|sec-is(?:0[1-9]|1\d|2[01]))$/.test(id);
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 function markdown(text){const out=node('div',undefined,'private-text');let list=null;
  for(const line of String(text||'').split(/\r?\n/)){if(!line.trim()){list=null;continue;}const heading=/^(#{1,6})\s+(.+)/.exec(line),item=/^\s*[-*]\s+(.+)/.exec(line);
   const el=node(heading?'h'+Math.min(6,heading[1].length+2):item?'li':'p'),s=heading?heading[2]:item?item[1]:line;
   s.split(/(\*\*[^*]+\*\*)/g).forEach(t=>el.append(t.startsWith('**')&&t.endsWith('**')?node('strong',t.slice(2,-2)):document.createTextNode(t)));
   if(item){if(!list){list=node('ul');out.append(list);}list.append(el);}else{list=null;out.append(el);}
  }return out;
 }
 function decode(v){if('stringValue'in v)return v.stringValue;if('integerValue'in v)return Number(v.integerValue);if('arrayValue'in v)return (v.arrayValue.values||[]).map(decode);return null;}
 function session(value){
  generation++;current=value;cache.clear();
  for(const dialog of document.querySelectorAll?.('.private-dialog')||[])dialog.remove();
  for(const m of mounts){m.host.replaceChildren();m.fold=null;if(value)attach(m);}
 }
 async function read(group,id,token){
  if(!current||token!==generation)throw Error('session');
  const key=group+'/'+id;if(cache.has(key))return cache.get(key);
  const account=current;
  const pending=(async()=>{
   let data;if(account.read)data=await account.read(group,id);
   else{const credential=await account.user.getIdToken();if(token!==generation)throw Error('session');
    const url='https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(account.projectId)+'/databases/(default)/documents/privateBook/'+group+'/items/'+encodeURIComponent(id);
    // REST avoids the SDK's persistent offline store. These responses stay in memory only.
    const response=await fetch(url,{headers:{Authorization:'Bearer '+credential},cache:'no-store'});
    if(response.status===404)data=null;else{if(!response.ok)throw Error('read');const json=await response.json();data=Object.fromEntries(Object.entries(json.fields||{}).map(([k,v])=>[k,decode(v)]));}
   }if(token!==generation)throw Error('session');return data;
  })();cache.set(key,pending);try{return await pending;}catch(e){if(token===generation)cache.delete(key);throw e;}
 }
 function photo(p){const wrap=node('article',undefined,'private-page');
  wrap.append(node('p',[p.page?'p.'+p.page:'',p.part,p.chapter,p.section,p.kind==='quiz'?'확인 문제':''].filter(Boolean).join(' > '),'private-meta'));
  if(p.img){const image=node('img');image.src='data:image/webp;base64,'+p.img;image.alt='원본 쪽';image.loading='lazy';image.width=p.w;image.height=p.h;
   const zoom=node('button',undefined,'private-zoom');zoom.type='button';zoom.setAttribute('aria-label','원본 쪽 크게 보기');zoom.append(image);zoom.onclick=()=>{
    const dialog=node('dialog',undefined,'private-dialog'),close=node('button','닫기');close.type='button';const enlarged=node('img');enlarged.src=image.src;enlarged.alt=image.alt;dialog.append(close,enlarged);document.body.append(dialog);
    const cleanup=()=>{enlarged.removeAttribute('src');dialog.remove();};close.onclick=()=>dialog.close();dialog.addEventListener('close',cleanup,{once:true});dialog.showModal();
   };wrap.append(zoom);
  }
  const text=node('details');text.append(node('summary','정리 글'),markdown(p.text));wrap.append(text);return wrap;
 }
 function attach(m){if(m.fold||!eligible(m.id)||!current)return;
  const fold=node('details',undefined,'private-book'),body=node('div'),status=node('p',undefined,'status'),more=node('button','더 보기');more.type='button';more.hidden=true;
  fold.append(node('summary','원본 쪽 보기'),body,status,more);m.host.append(fold);m.fold=fold;
  let ids=null,at=0,busy=false;const token=generation;
  async function load(){if(busy||token!==generation||!current)return;busy=true;more.disabled=true;
   try{if(root.navigator?.onLine===false)throw Error('offline');status.textContent='불러오는 중…';
    if(!ids){const b=await read('boxes',m.id,token);ids=Array.isArray(b?.photos)?b.photos:[];}
    const next=ids.slice(at,at+3),docs=await Promise.all(next.map(id=>read('pages',id,token)));
    if(token!==generation)return;for(const p of docs)if(p)body.append(photo(p));at+=next.length;
    status.textContent=ids.length?'':'아직 연결된 쪽이 없어요.';more.hidden=at>=ids.length;
   }catch{if(token===generation){status.textContent=root.navigator?.onLine===false?'연결되면 볼 수 있어요':'불러오지 못했어요. 다시 열어 주세요.';}}
   finally{busy=false;more.disabled=false;}
  }
  fold.addEventListener('toggle',()=>{if(fold.open&&at===0)void load();});more.onclick=()=>void load();
 }
 function mount(parent,id){if(!eligible(id))return;
  for(const m of mounts)if(m.host.isConnected===false)mounts.delete(m);
  const host=node('div',undefined,'private-host'),m={host,id,fold:null};parent.append(host);mounts.add(m);attach(m);
 }
 root.StudyPrivateBook={session,mount,markdown};
 if(typeof module!=='undefined')module.exports=root.StudyPrivateBook;
})(globalThis);
