// 새 버전 알아채기(v259) 검사. 열어 둔 탭이 몇 판 전 화면을 그대로 보여 주던 일(2026-10-09 사용자: "이런사례가 또 잇으면 안되")이 다시 생기지 않게 한다.
//  1) 한 곳에서 나오는 버전: version.js = sw.js의 CACHE 이름(build-chunks.cjs가 만든다), 배포 목록, 화면의 버전 칸과 띠.
//  2) 서비스 워커가 '켜진 판'을 대답한다(sw.js message).
//  3) update.js만 가짜 서버, 가짜 워커 위에서: 안전한 자리면 다시 열기 / 아니면 띠 → 안전한 자리에서 다시 열기 / 한 판에 스스로 한 번만 /
//     연결 없음, 확인 실패, 같은 판, 옛 판이면 아무것도 안 함 / 워커가 아직 설치 중이면 기다림 / 설치가 끝내 안 되면 띠만 / 적어 둘 곳이 없으면 띠만.
//  4) app.js를 브라우저와 같은 방식(index.html의 스크립트 목록, 색인 + 조각)으로 가짜 DOM에서 돌려:
//     홈에서 새 판 → 스스로 다시 열기, 다시 연 뒤에도 옛 판이면 띠만(되풀이 없음), 문제를 푸는 중이면 띠 → 채점 → 다음 문제를 누를 때 다시 열기 → 새 판에서 같은 범위의 풀이 화면,
//     화면이 가려지면 푸는 중에도 다시 열기 → 같은 문제, 같은 보기 순서, 연결 없음이면 아무것도 안 보임, 화면 아래의 버전.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const AU=require('./update.js');
const flush=()=>new Promise(r=>setImmediate(r));
const settle=async()=>{for(let i=0;i<8;i++)await flush();};
const J=JSON.stringify;
(async()=>{
// ---------------------------------------------------------------- 1) 버전은 한 곳에서
const swText=read('sw.js'),html=read('index.html'),yml=read('.github/workflows/pages.yml'),versionText=read('version.js');
const CACHE=/const CACHE='([^']+)';/.exec(swText)[1],N=AU.num(CACHE);
assert.ok(N>=258,'sw.js 캐시 이름에서 판 번호를 읽는다: '+CACHE);
assert.equal(versionText,"globalThis.APP_BUILD='"+CACHE+"';\n",'version.js는 sw.js의 CACHE 이름 그대로다(node build-chunks.cjs가 만든다. 판을 올린 뒤 돌릴 것)');
assert.equal(AU.parse(versionText),CACHE);assert.equal(AU.label(CACHE),'v'+N);assert.equal(AU.label(''),'');assert.equal(AU.parse('<html>not found</html>'),null);assert.equal(AU.num('chagog-vx-y'),0);
{const built=require('./build-chunks.cjs');assert.equal(typeof built.outputs,'function');
 const v=/app\.js\?v=(\d+)/.exec(html)[1],order=[...html.matchAll(/<script src="([^"?]+)\?v=\d+"><\/script>/g)].map(m=>m[1]);
 assert.equal(order[0],'version.js','version.js를 맨 먼저 읽는다');assert.ok(order.indexOf('update.js')>0&&order.indexOf('update.js')<order.indexOf('app.js'),'update.js는 app.js 앞');
 for(const f of ['version.js','update.js']){assert.ok(swText.includes("'./"+f+'?v='+v+"'"),'sw.js 미리 받기에 '+f);assert.ok(new RegExp('cp [^\\n]*\\b'+f.replace('.','\\.')+'\\b').test(yml),'pages.yml이 올린다: '+f);}
 assert.ok(/node update\.test\.cjs/.test(yml),'pages.yml이 이 검사를 돌린다');
 assert.ok(/^version\.js -text$/m.test(read('.gitattributes')),'version.js는 줄 끝 변환을 타지 않는다');
 assert.match(html,/<div id="updateBanner" class="update-banner" role="status" hidden><span>새 버전이 있어요<\/span><button id="updateReload" type="button">다시 열기<\/button><\/div>/,'띠의 글');
 assert.match(html,/<p id="appVersion" class="app-version"[^>]*><\/p>/,'화면 아래 버전 칸');
 assert.ok(!/카드|문항/.test(/<div id="updateBanner".*?<\/div>/.exec(html)[0]));}
// ---------------------------------------------------------------- 2) 서비스 워커가 켜진 판을 대답한다
{const on={},self={location:new URL('https://example.test/app/sw.js'),addEventListener:(k,f)=>{on[k]=f;},skipWaiting:async()=>{},clients:{claim:async()=>{}}};
 const ctx={self,caches:{},fetch:()=>{},Response,URL,console,Uint8Array,Promise,Error,Object,Array,Math};vm.createContext(ctx);vm.runInContext(swText,ctx,{filename:'sw.js'});
 assert.equal(typeof on.message,'function','sw.js가 message를 듣는다');
 const got=[];on.message({data:{type:'build'},ports:[{postMessage:d=>got.push(d)}]});assert.deepEqual(J(got),J([{build:CACHE}]),'켜진 워커의 판 = CACHE 이름');
 on.message({data:{type:'other'},ports:[{postMessage:d=>got.push(d)}]});on.message({data:null});on.message({data:{type:'build'}});assert.equal(got.length,1,'다른 글에는 대답하지 않는다');
 assert.match(swText,/await self\.skipWaiting\(\);/,'설치가 끝나면 기다리지 않고 켜진다');assert.match(swText,/await self\.clients\.claim\(\);/,'켜지면 열려 있는 탭을 넘겨받는다(탭은 controllerchange로 안다)');}
// ---------------------------------------------------------------- 3) update.js
const NEXT='chagog-v'+(N+1)+'-next-test',NEXT2='chagog-v'+(N+2)+'-next-test-2',OLDER='chagog-v'+(N-1)+'-older';
const marker=b=>"globalThis.APP_BUILD='"+b+"';\n";
const memory=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>{m.set(k,String(v));},removeItem:k=>{m.delete(k);},m};};
// 가짜 세상: 서버(version.js가 어느 판인가, 연결), 워커(켜진 판), 화면(안전한가), 시계.
function world(over={}){
 const w={served:CACHE,offline:false,status:200,worker:CACHE,hasWorker:true,safe:true,clock:1000000,fetches:[],updates:0,reloads:0,banner:false,timers:[],store:memory(),...over};
 const reg={update(){w.updates++;return Promise.resolve();},get active(){return w.worker===null?null:{id:w.worker};}};
 w.make=(extra={})=>AU.create({running:CACHE,
  fetch:(url,opts)=>{w.fetches.push(url+' ['+(opts&&opts.cache)+']');if(w.offline)return Promise.reject(new TypeError('Failed to fetch'));return Promise.resolve({ok:w.status===200,status:w.status,text:()=>Promise.resolve(w.status===200?marker(w.served):'')});},
  sw:w.hasWorker?{getRegistration:()=>Promise.resolve(reg),addEventListener(){}}:null,ask:worker=>Promise.resolve(worker.id),
  online:()=>!w.netDown,store:w.store,safe:()=>w.safe,reload:()=>{w.reloads++;},banner:on=>{w.banner=on;},now:()=>w.clock,setTimeout:(fn,ms)=>{w.timers.push({fn,ms});},...extra});
 return w;
}
{// (가) 같은 판, 옛 판(배포가 퍼지는 중), 읽을 수 없는 글: 아무것도 안 한다.
 const w=world(),u=w.make();assert.equal(await u.check(true),'current');assert.deepEqual(w.fetches,['version.js [no-store]'],'version.js를 캐시 없이 받는다');assert.equal(w.updates,1,'브라우저에게 sw.js를 다시 보게 한다(registration.update)');
 w.served=OLDER;assert.equal(await u.check(true),'current');
 assert.equal(w.reloads,0);assert.equal(w.banner,false);
 const bad=world(),ub=bad.make({fetch:()=>Promise.resolve({ok:true,status:200,text:()=>Promise.resolve('<!doctype html>')})});assert.equal(await ub.check(true),'failed');assert.equal(bad.reloads+Number(bad.banner),0);}
{// (나) 연결 없음, 받기 실패, 404: 아무것도 하지 않고 아무것도 보이지 않는다.
 const w=world({served:NEXT,worker:NEXT,netDown:true}),u=w.make();assert.equal(await u.check(true),'offline');assert.deepEqual(w.fetches,[],'연결이 없으면 받으려 하지도 않는다');
 w.netDown=false;w.offline=true;assert.equal(await u.check(true),'failed');
 w.offline=false;w.status=404;assert.equal(await u.check(true),'failed');w.status=503;assert.equal(await u.check(true),'failed');
 assert.equal(w.reloads,0);assert.equal(w.banner,false);assert.equal(w.store.m.size,0);
 // 연결이 돌아오면 그때 알아챈다.
 w.status=200;assert.equal(await u.check(true),'reload');assert.equal(w.reloads,1);}
{// (다) 새 판이 준비됨 + 안전한 자리: 스스로 다시 연다. 한 번만.
 const w=world({served:NEXT,worker:NEXT}),u=w.make();assert.equal(await u.check(true),'reload');assert.equal(w.reloads,1);assert.equal(w.banner,false,'다시 열 때는 띠를 띄우지 않는다');
 assert.equal(w.store.getItem(AU.MARK),NEXT,'어느 판으로 다시 열었는지 적어 둔다');
 assert.equal(await u.check(true),'reloading');assert.equal(u.safePoint(),false);assert.equal(w.reloads,1,'다시 여는 중에는 또 열지 않는다');
 // 다시 열었는데도 옛 판이 뜬 경우(HTTP 캐시, 배포가 퍼지는 중): 같은 탭의 새 페이지는 띠만 보인다. 몇 번을 확인해도 스스로 다시 열지 않는다.
 const again=world({served:NEXT,worker:NEXT,store:w.store}),u2=again.make();
 for(let i=0;i<5;i++){assert.equal(await u2.check(true),'banner');assert.equal(u2.safePoint(),false);}
 assert.equal(again.reloads,0,'한 판에 스스로 다시 여는 것은 한 번뿐');assert.equal(again.banner,true,'대신 띠를 띄운다');
 // 띠의 '다시 열기'는 사람이 누른 것이라 언제든 된다.
 assert.equal(u2.reloadNow(),true);assert.equal(again.reloads,1);
 // 그다음 판이 올라오면 다시 한 번 스스로 연다.
 const later=world({served:NEXT2,worker:NEXT2,store:w.store}),u3=later.make();assert.equal(await u3.check(true),'reload');assert.equal(later.reloads,1);assert.equal(w.store.getItem(AU.MARK),NEXT2);}
{// (라) 문제를 푸는 중: 띠만. 안전한 자리가 오면 그때 다시 연다.
 const w=world({served:NEXT,worker:NEXT,safe:false}),u=w.make();assert.equal(await u.check(true),'banner');assert.equal(w.banner,true);assert.equal(w.reloads,0);
 assert.equal(u.safePoint(),false,'아직 푸는 중');assert.equal(await u.check(true),'banner');assert.equal(w.reloads,0);
 w.safe=true;assert.equal(u.safePoint(),true,'채점이 끝나고 다음 문제로 넘어가는 자리');assert.equal(w.reloads,1);assert.equal(u.safePoint(),false);assert.equal(w.reloads,1);}
{// (마) 새 워커가 아직 설치 중(켜진 워커는 옛 판): 기다린다. 켜지면 다시 연다.
 const w=world({served:NEXT,worker:CACHE}),u=w.make();assert.equal(await u.check(true),'installing');assert.equal(w.reloads+Number(w.banner),0,'미리 받기가 끝나기 전에는 아무것도 안 한다');
 assert.equal(w.timers.length,1,'조금 뒤에 다시 본다');assert.equal(u.safePoint(),false);
 w.worker=NEXT;w.timers.shift().fn();await settle();assert.equal(w.reloads,1,'새 워커가 켜지면 다시 연다');}
{// (바) 옛 워커(v258까지)는 대답하지 않는다, 워커가 아예 없는 등록도 같다: 기다리다가, 오래 지나도 안 켜지면 띠만(스스로 다시 열지 않는다).
 for(const worker of ['',null]){const w=world({served:NEXT,worker}),u=w.make();assert.equal(await u.check(true),'installing');
  w.clock+=119000;assert.equal(await u.check(true),'installing');assert.equal(w.banner,false);
  w.clock+=2000;assert.equal(await u.check(true),'late');assert.equal(w.banner,true,'설치가 끝내 안 되면 띠로 알린다');assert.equal(u.safePoint(),false);assert.equal(w.reloads,0);
  assert.equal(u.reloadNow(),true);assert.equal(w.reloads,1);}}
{// (사) 서비스 워커를 못 쓰는 브라우저: 올라온 판이 높으면 바로 준비된 것으로 본다.
 const w=world({served:NEXT,hasWorker:false}),u=w.make();assert.equal(await u.check(true),'reload');assert.equal(w.reloads,1);}
{// (아) 적어 둘 곳(sessionStorage)이 없거나 쓰기가 실패하면 스스로 다시 열지 않는다(되풀이를 막을 수 없으므로). 띠만.
 const w=world({served:NEXT,worker:NEXT}),u=w.make({store:null});assert.equal(await u.check(true),'banner');assert.equal(w.reloads,0);assert.equal(w.banner,true);
 const w2=world({served:NEXT,worker:NEXT}),u2=w2.make({store:{getItem:()=>null,setItem(){throw Error('quota');}}});assert.equal(await u2.check(true),'banner');assert.equal(w2.reloads,0);
 const w3=world({served:NEXT,worker:NEXT}),u3=w3.make({store:{getItem(){throw Error('denied');},setItem(){}}});assert.equal(await u3.check(true),'banner');assert.equal(w3.reloads,0);}
{// (자) 잇달아 부르면 한 번만 받는다(포커스와 앞으로 나옴이 함께 온다).
 const w=world(),u=w.make();await Promise.all([u.check(),u.check(),u.check()]);assert.equal(w.fetches.length,1);assert.equal(await u.check(),'skipped');w.clock+=16000;assert.equal(await u.check(),'current');assert.equal(w.fetches.length,2);}
// ---------------------------------------------------------------- 4) app.js와 함께(브라우저와 같은 스크립트 목록, 색인 + 조각)
const LAZY=[...html.matchAll(/<script src="([^"?]+)\?v=\d+"><\/script>/g)].map(m=>m[1]).filter(f=>f!=='firebase-config.js'&&f!=='sync.js');
const text=new Map();const source=f=>{if(!text.has(f))text.set(f,read(f));return text.get(f);};
// 기기 하나: localStorage(기록), sessionStorage(탭), 서버와 워커의 상태. page()가 그 탭에서 페이지를 한 번 연다(running = 그 페이지가 받은 판).
function device(){return {local:new Map(),session:memory(),served:CACHE,worker:CACHE,online:true,netFail:false};}
function page(dev,running=CACHE){
 function el(tag='div'){const node={tag,children:[],attrs:{},dataset:{},classes:new Set(),_text:'',hidden:false,disabled:false,open:false,
  get textContent(){return node._text;},set textContent(v){node._text=String(v);node.children=[];},
  append(...k){node.children.push(...k);},replaceChildren(...k){node.children=k;},
  classList:{add:c=>node.classes.add(c),remove:c=>node.classes.delete(c),toggle:(c,on)=>on?node.classes.add(c):node.classes.delete(c),contains:c=>node.classes.has(c)},
  setAttribute(k,v){node.attrs[k]=v;},getAttribute(k){return node.attrs[k];},focus(){},setSelectionRange(){},addEventListener(){},
  querySelector(sel){return sel==='summary'?el('summary'):null;},querySelectorAll(){return [];},
  get all(){const out=[];(function walk(n){for(const c of n.children){out.push(c);walk(c);}})(node);return out;}};return node;}
 const nodes=new Map(),inst={nodes,reloads:0,fetches:[],updates:0,timers:[],docOn:{},winOn:{},swOn:{}};
 nodes.set('#updateBanner',Object.assign(el('div'),{hidden:true}));
 const listen=map=>(k,fn)=>{(map[k]??=[]).push(fn);};
 const doc={createElement:tag=>el(tag),createTextNode(t){const n=el('#text');n._text=String(t);return n;},body:el('body'),activeElement:null,hidden:false,
  querySelector(sel){if(!nodes.has(sel))nodes.set(sel,el(sel));return nodes.get(sel);},querySelectorAll(){return [];},addEventListener:listen(inst.docOn)};
 const reg={update(){inst.updates++;return Promise.resolve();},get active(){return dev.worker?{postMessage(msg,ports){if(msg.type==='build')ports[0].postMessage({build:dev.worker});}}:null;}};
 class Channel{constructor(){const a={onmessage:null};this.port1=a;this.port2={postMessage:d=>{setImmediate(()=>a.onmessage&&a.onmessage({data:d}));}};}}
 const ctx={document:doc,console,
  localStorage:{getItem:k=>dev.local.has(k)?dev.local.get(k):null,setItem:(k,v)=>dev.local.set(k,String(v)),removeItem:k=>dev.local.delete(k)},sessionStorage:dev.session,
  crypto:{randomUUID:()=>'id-'+Math.random().toString(16).slice(2)},
  history:{state:{depth:0},pushState(s){this.state=s;},replaceState(s){this.state=s;}},
  navigator:{get onLine(){return dev.online;},serviceWorker:{register:()=>Promise.resolve(reg),getRegistration:()=>Promise.resolve(reg),addEventListener:listen(inst.swOn)}},
  MessageChannel:Channel,setInterval:(fn,ms)=>{inst.every=ms;return 1;},clearInterval(){},setTimeout:(fn,ms)=>{inst.timers.push({fn,ms});return inst.timers.length;},clearTimeout(){},
  structuredClone,addEventListener:listen(inst.winOn),dispatchEvent(){},scrollTo(){},location:{protocol:'https:',reload(){inst.reloads++;}},
  Date,JSON,Math,Set,Map,Number,String,Object,Array,Error,RegExp,Intl,Promise,TextDecoder,Uint8Array,Event:class{constructor(t){this.type=t;}}};
 ctx.window=ctx;ctx.self=ctx;vm.createContext(ctx);
 ctx.fetch=(url,opts)=>{
  let m=/^chunks\/([a-z]-[a-z0-9-]+)\.json\?h=([0-9a-f]{16})$/.exec(url);
  if(m){const b=fs.readFileSync(path.join(__dirname,'chunks',m[1]+'.json'));return Promise.resolve({ok:true,status:200,arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.length))});}
  if(url==='version.js'){inst.fetches.push(url+' ['+(opts&&opts.cache)+']');if(dev.netFail)return Promise.reject(new TypeError('Failed to fetch'));return Promise.resolve({ok:true,status:200,text:()=>Promise.resolve(marker(dev.served))});}
  return Promise.reject(Error('unexpected fetch '+url));};
 for(const f of LAZY)vm.runInContext(f==='version.js'?marker(running):source(f),ctx,{filename:f});
 inst.ctx=ctx;inst.doc=doc;inst.run=code=>vm.runInContext(code,ctx);
 inst.fire=(map,kind)=>{for(const fn of map[kind]||[])fn({type:kind});};
 inst.text=sel=>{const n=nodes.get(sel);return n?[n._text,...n.all.map(x=>x._text)].filter(Boolean).join(' | '):'';};
 inst.button=id=>nodes.get('#card').all.find(n=>n.id===id);
 inst.banner=()=>!nodes.get('#updateBanner').hidden;
 return inst;
}
const answer=inst=>{const quiz=inst.run('data.activePractice.exercise'),id=inst.run('data.activePractice.cardId');inst.run('answerPractice('+J(id)+','+J(quiz.type==='choice'?quiz.correctIndex:quiz.answers[0])+')');assert.ok(inst.run('!!data.quizFeedback'),'채점됨');};
const position=inst=>inst.run("JSON.stringify({view,scope:data.practiceScope,card:data.activePractice?.cardId||null,exercise:data.activePractice?.exercise?.exerciseId||null,choices:data.activePractice?.exercise?.choices||null,feedback:!!data.quizFeedback,solved:data.history.length})");
const SCOPE={subject:'영어',topic:'Day 1',round:''};
{// (가) 화면 아래의 버전: 지금 돌고 있는 판. 같은 판이면 아무 일도 없다. 확인하는 때: 시작, 앞으로 나옴, 포커스, 연결됨, 몇 분마다.
 const dev=device(),p=page(dev);await settle();
 assert.equal(p.nodes.get('#appVersion')._text,'v'+N,'화면 아래에 지금 버전');assert.equal(p.run('APP_BUILD'),CACHE);
 assert.deepEqual(p.fetches,['version.js [no-store]'],'시작할 때 올라와 있는 판을 캐시 없이 확인한다');assert.equal(p.updates,1,'시작할 때 registration.update()');
 assert.equal(p.reloads,0);assert.equal(p.banner(),false);
 assert.ok(p.docOn.visibilitychange?.length&&p.winOn.focus?.length&&p.winOn.online?.length&&p.winOn.pageshow?.length&&p.swOn.controllerchange?.length,'앞으로 나옴, 포커스, 연결됨, 워커 바뀜을 듣는다');
 assert.ok(p.every>=60000&&p.every<=600000,'열어 둔 동안 몇 분마다 확인한다: '+p.every);
 const t=Date.now;
 // 15초 안에 겹쳐 오는 신호는 한 번으로 친다. 그 뒤의 포커스는 다시 확인한다.
 p.fire(p.winOn,'focus');p.fire(p.docOn,'visibilitychange');await settle();assert.equal(p.fetches.length,1);
 try{let now=t()+20000;Date.now=()=>now;p.fire(p.winOn,'focus');await settle();assert.equal(p.fetches.length,2,'포커스가 돌아오면 다시 확인한다');
  now+=20000;p.fire(p.docOn,'visibilitychange');await settle();assert.equal(p.fetches.length,3,'앞으로 나오면 다시 확인한다');
  now+=20000;p.fire(p.winOn,'online');await settle();assert.equal(p.fetches.length,4,'연결되면 다시 확인한다');}finally{Date.now=t;}
 assert.equal(p.reloads,0);assert.equal(p.banner(),false);}
{// (나) 홈에 있는 탭 + 새 판이 올라와 그 워커가 켜짐 → 스스로 다시 연다. 다시 연 페이지가 새 판이면 조용하다.
 const dev=device(),p=page(dev);await settle();assert.equal(p.reloads,0);
 dev.served=NEXT;dev.worker=NEXT;p.fire(p.swOn,'controllerchange');await settle();
 assert.equal(p.reloads,1,'홈에서는 스스로 다시 연다');assert.equal(p.banner(),false);assert.equal(dev.session.getItem(AU.MARK),NEXT);
 const q=page(dev,NEXT);await settle();assert.equal(q.nodes.get('#appVersion')._text,'v'+(N+1),'다시 연 페이지는 새 판');assert.equal(q.reloads,0);assert.equal(q.banner(),false);assert.equal(q.run('view'),'home');
 // 다시 열었는데도 옛 판이 뜬 경우: 그 탭은 띠만 보이고 더는 스스로 열지 않는다. 화면을 옮겨 다녀도 같다.
 const stuck=page(dev,CACHE);await settle();assert.equal(stuck.reloads,0,'되풀이해서 다시 열지 않는다');assert.equal(stuck.banner(),true,'띠로 알린다');
 stuck.run("go('subject','영어')");stuck.run("go('home')");stuck.fire(stuck.swOn,'controllerchange');await settle();assert.equal(stuck.reloads,0);
 stuck.nodes.get('#updateReload').onclick();await settle();assert.equal(stuck.reloads,1,'띠의 다시 열기를 누르면 다시 연다');}
{// (다) 문제를 푸는 중에 새 판 → 띠만(문제는 그대로) → 답하고 채점 화면에서도 그대로 → '다음 문제'를 누르는 자리에서 다시 연다 → 새 판이 같은 범위의 풀이 화면으로 열린다.
 const dev=device(),p=page(dev);await settle();p.run('openScope('+J(SCOPE)+')');await settle();
 assert.ok(p.run('!!data.activePractice'),'문제가 떠 있다: '+p.text('#card').slice(0,80));const before=position(p),shown=p.text('#card');
 dev.served=NEXT;dev.worker=NEXT;p.fire(p.swOn,'controllerchange');await settle();
 assert.equal(p.reloads,0,'푸는 중에는 다시 열지 않는다');assert.equal(p.banner(),true,'띠가 뜬다');assert.equal(position(p),before);assert.equal(p.text('#card'),shown,'문제 화면은 그대로');
 p.run('render()');assert.equal(p.reloads,0,'다시 그려도(동기화 등) 푸는 중이면 그대로');
 answer(p);await settle();assert.equal(p.reloads,0,'채점 화면(해설을 읽는 중)에서도 다시 열지 않는다');assert.equal(p.run('data.history.length'),1);
 const nextButton=p.button('nextQuestion');assert.ok(nextButton,'다음 문제 버튼');nextButton.onclick();await settle();
 assert.equal(p.reloads,1,'다음 문제로 넘어가는 자리에서 다시 연다');assert.ok(p.run('!data.quizFeedback&&!data.activePractice'),'채점 화면은 닫혔고 다음 문제는 새 판이 낸다');
 const q=page(dev,NEXT);await settle();
 assert.equal(q.run('view'),'quiz','새 판이 풀이 화면으로 열린다(홈으로 돌아가지 않는다)');assert.equal(J(q.run('data.practiceScope')),J(SCOPE),'같은 범위');
 assert.equal(q.run('data.history.length'),1,'푼 기록 그대로');assert.ok(q.run('!!data.activePractice'),'다음 문제가 떠 있다: '+q.text('#card').slice(0,80));
 assert.equal(q.run('data.session.cardId'),q.run('data.activePractice.cardId'),'풀던 자리(다른 기기가 이어 받는 위치)도 그 문제로 찍힌다');
 assert.equal(q.reloads,0);assert.equal(q.banner(),false);assert.equal(dev.session.getItem('chagog-update-resume'),null,'돌아갈 자리는 한 번만 쓴다');
 // 그 뒤에 그냥 새로고침하면 예전처럼 홈에서 연다.
 const r=page(dev,NEXT);await settle();assert.equal(r.run('view'),'home');}
{// (라) 푸는 중에 화면이 가려짐(다른 앱, 다른 탭) → 그 사이에 다시 연다 → 돌아오면 같은 문제, 같은 보기 순서.
 const dev=device(),p=page(dev);await settle();p.run('openScope('+J(SCOPE)+')');await settle();answer(p);p.button('nextQuestion').onclick();await settle();const before=position(p);
 assert.ok(JSON.parse(before).card&&JSON.parse(before).solved===1);
 dev.served=NEXT;dev.worker=NEXT;p.fire(p.swOn,'controllerchange');await settle();assert.equal(p.reloads,0);assert.equal(p.banner(),true);
 p.doc.hidden=true;p.fire(p.docOn,'visibilitychange');await settle();assert.equal(p.reloads,1,'가려진 사이에 다시 연다');
 const q=page(dev,NEXT);await settle();assert.equal(position(q),before,'같은 문제, 같은 보기 순서, 같은 기록');assert.equal(q.banner(),false);}
{// (마) 기초 개념 보기, 외울 것을 읽는 중에도 띠만. 다른 화면으로 옮기는 자리에서 다시 연다.
 const dev=device(),p=page(dev);await settle();p.run("go('memorize','history-people')");await settle();
 dev.served=NEXT;dev.worker=NEXT;p.fire(p.swOn,'controllerchange');await settle();assert.equal(p.reloads,0);assert.equal(p.banner(),true);
 p.run("go('subject','한국사')");await settle();assert.equal(p.reloads,1);
 const q=page(dev,NEXT);await settle();assert.equal(q.run('view'),'subject');assert.equal(q.run('viewSubject'),'한국사','보던 과목 화면으로 열린다');}
{// (바) 연결 없음, 확인 실패: 새 판이 올라와 있어도 아무것도 하지 않고 아무것도 보이지 않는다. 연결이 돌아오면 알아챈다.
 const dev=device();dev.served=NEXT;dev.worker=NEXT;dev.online=false;const p=page(dev);await settle();
 assert.deepEqual(p.fetches,[]);assert.equal(p.reloads,0);assert.equal(p.banner(),false);assert.equal(p.text('#message'),'','알림 글도 없다');
 dev.online=true;dev.netFail=true;p.fire(p.swOn,'controllerchange');await settle();assert.equal(p.fetches.length,1);assert.equal(p.reloads,0);assert.equal(p.banner(),false);assert.equal(p.text('#message'),'');
 dev.netFail=false;p.fire(p.swOn,'controllerchange');await settle();assert.equal(p.reloads,1,'연결이 돌아오면 다시 연다');}
{// (사) 올라온 판은 새것인데 새 워커가 아직 설치 중: 기다린다. 워커가 켜지면(controllerchange) 그때.
 const dev=device();const p=page(dev);await settle();dev.served=NEXT;p.fire(p.swOn,'controllerchange');await settle();assert.equal(p.reloads,0);assert.equal(p.banner(),false);
 dev.worker=NEXT;p.fire(p.swOn,'controllerchange');await settle();assert.equal(p.reloads,1);}
{// (아) 띠, 버전 칸의 글에 금지어가 없다.
 const dev=device();dev.served=NEXT;dev.worker=NEXT;const p=page(dev);await settle();
 for(const sel of ['#appVersion','#message'])assert.ok(!/카드|문항/.test(p.text(sel)));}
console.log('PASS update: version.js = sw.js CACHE('+CACHE+'), 화면 아래 v'+N+', 워커가 켜진 판을 대답함; update.js 9갈래(같은 판, 연결 없음과 실패, 스스로 다시 열기 한 판에 한 번, 푸는 중 띠 뒤 안전한 자리, 설치 중 기다림, 설치 안 됨은 띠만, 워커 없는 브라우저, 적어 둘 곳 없음, 겹친 신호); '
 +'app.js와 함께 8갈래(시작과 포커스와 앞으로 나옴과 연결됨에 확인, 홈에서 다시 열기와 되풀이 없음, 푸는 중 띠 뒤 다음 문제에서 다시 열기 뒤 같은 범위의 풀이 화면, 가려진 사이 다시 열기 뒤 같은 문제, 읽는 화면, 연결 없음, 설치 중, 금지어)');
})().catch(e=>{console.error(e);process.exitCode=1;});
