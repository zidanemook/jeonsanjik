'use strict';
// 새 버전 알아채기(v259). 열어 둔 탭이 몇 판 전 화면을 그대로 보여 주는 일이 없게 한다.
//  - 지금 돌고 있는 판: version.js가 심은 APP_BUILD(sw.js의 CACHE 이름과 같은 글. build-chunks.cjs가 sw.js에서 만든다).
//  - 올라와 있는 판: version.js를 cache: 'no-store'로 다시 받아 읽는다.
//  - 준비됐는가: 켜진 서비스 워커에게 판을 물어(sw.js의 message) 지금 판보다 높으면 그 워커의 미리 받기가 끝난 것이다(설치가 끝나야 켜진다).
//  - 준비되면: 안전한 자리(문제를 풀고 있지 않거나 화면이 가려져 있음)면 바로 다시 열고, 아니면 띠를 띄우고 다음 안전한 자리에서 다시 연다.
//  - 한 판에 스스로 다시 여는 것은 한 번뿐이다(sessionStorage에 그 판을 적는다). 그 뒤에는 띠만.
//  - 연결이 없거나 확인이 실패하면 아무것도 하지 않고 아무것도 보이지 않는다.
// 이 파일은 읽히기만 해서는 아무 일도 하지 않는다. app.js가 create(...).start()로 켠다. Node(검사)는 require해서 같은 함수를 쓴다.
(function(root){
 const BUILD=/^chagog-v(\d+)-[a-z0-9-]+$/;
 const num=b=>{const m=BUILD.exec(String(b||''));return m?Number(m[1]):0;};
 const label=b=>num(b)?'v'+num(b):'';
 // version.js의 글에서 판을 읽는다.
 function parse(text){const m=/APP_BUILD='([^']+)'/.exec(String(text||''));return m&&num(m[1])?m[1]:null;}
 const MARK='chagog-update-auto';
 // o: {running, url, fetch, sw, online, store, safe, reload, banner, now, setTimeout, ask, grace, gap}
 function create(o){
  const running=o.running||'',url=o.url||'version.js',grace=o.grace??120000,gap=o.gap??20000;
  const now=o.now||(()=>Date.now()),later=o.setTimeout||((fn,ms)=>root.setTimeout(fn,ms));
  let target='',seenAt=0,ready=false,shown=false,reloading=false,job=null,lastCheck=-Infinity,retry=false,again=false;
  const read=()=>{try{return o.store?o.store.getItem(MARK):undefined;}catch{return undefined;}};
  // 이 판으로 스스로 다시 연 적이 없고, 그 사실을 적어 둘 수 있을 때만 스스로 다시 연다.
  const autoAllowed=()=>{const v=read();return v!==undefined&&v!==target;};
  const mark=()=>{try{o.store.setItem(MARK,target);return o.store.getItem(MARK)===target;}catch{return false;}};
  const show=()=>{if(!shown){shown=true;try{o.banner(true);}catch{}}};
  function reloadFor(auto){
   if(reloading)return false;
   if(auto){if(!mark())return false;}else if(target)mark();
   reloading=true;try{o.reload();}catch{reloading=false;return false;}
   return true;
  }
  async function registration(){try{return o.sw?(await o.sw.getRegistration())||null:null;}catch{return null;}}
  // 켜진 워커의 판. 옛 워커(v258까지)는 대답하지 않는다 → ''.
  function ask(worker){
   if(o.ask)return Promise.resolve(o.ask(worker)).catch(()=>'');
   return new Promise(resolve=>{let done=false;const end=v=>{if(!done){done=true;resolve(typeof v==='string'?v:'');}};
    try{const ch=new root.MessageChannel();ch.port1.onmessage=e=>end(e.data&&e.data.build);worker.postMessage({type:'build'},[ch.port2]);}catch{end('');}
    later(()=>end(''),3000);});
  }
  async function run(){
   if(reloading)return 'reloading';
   if(o.online&&!o.online())return 'offline';
   const reg=await registration();
   // 브라우저에게 sw.js를 다시 보게 한다(탭을 열어 둔 동안에는 브라우저가 스스로 보지 않는다).
   if(reg){try{const p=reg.update();if(p&&p.catch)p.catch(()=>{});}catch{}}
   let text;try{const r=await o.fetch(url,{cache:'no-store'});if(!r||!r.ok)return 'failed';text=await r.text();}catch{return 'failed';}
   const seen=parse(text);if(!seen)return 'failed';
   if(num(seen)<=num(running))return 'current';
   if(seen!==target){target=seen;seenAt=now();ready=false;}
   let installed=!reg;
   if(reg){const w=reg.active;installed=!!w&&num(await ask(w))>num(running);}
   if(reloading)return 'reloading';
   if(!installed){
    // 새 워커가 아직 설치 중이다. 조금 뒤에 다시 본다. 오래 지나도 켜지지 않으면(설치가 계속 실패) 띠만 띄운다(스스로 다시 열지 않는다).
    if(now()-seenAt>=grace){show();return 'late';}
    if(!retry){retry=true;later(()=>{retry=false;check(true);},gap);}
    return 'installing';
   }
   ready=true;
   if(autoAllowed()&&safeNow()&&reloadFor(true))return 'reload';
   show();return 'banner';
  }
  const safeNow=()=>{try{return !!o.safe();}catch{return false;}};
  // force: 방금 확인했어도 다시 본다(워커가 바뀌었을 때, 다시 보기로 한 때).
  // 확인하는 중에 force가 또 오면(확인 도중에 새 워커가 켜짐) 끝난 뒤 한 번 더 본다.
  function check(force){
   if(job){if(force)again=true;return job;}
   if(!force&&now()-lastCheck<15000)return Promise.resolve('skipped');
   lastCheck=now();
   job=run().catch(()=>'failed').then(r=>{job=null;if(again){again=false;return check(true);}return r;});
   return job;
  }
  // 앱이 안전한 자리에 왔을 때 부른다. 다시 열기를 시작했으면 true(앱은 그리지 않고 기다린다).
  function safePoint(){return ready&&!reloading&&autoAllowed()&&safeNow()&&reloadFor(true);}
  // 띠의 '다시 열기'를 눌렀다. 사람이 누른 것이라 횟수를 따지지 않는다.
  function reloadNow(){return reloadFor(false);}
  function start(every){
   const doc=root.document,on=(t,k,fn)=>{try{t.addEventListener(k,fn);}catch{}};
   on(doc,'visibilitychange',()=>{if(doc.hidden)safePoint();else check();});
   for(const k of ['focus','online','pageshow'])on(root,k,()=>check());
   if(o.sw)on(o.sw,'controllerchange',()=>check(true));
   try{root.setInterval(()=>check(),every||180000);}catch{}
   return check(true);
  }
  return {check,safePoint,reloadNow,start,state:()=>({running,target,ready,shown,reloading})};
 }
 const api={num,label,parse,create,MARK};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.AppUpdate=api;
})(globalThis);
