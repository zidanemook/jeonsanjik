const CACHE='chagog-v249-user-words-1008';
const ASSETS=['./storage.js?v=217','./content-index.js?v=217','./content-store.js?v=217','./hanneung-topics.js?v=217','./topics.js?v=217','./hanneung-data.js?v=217','./hanneung.js?v=217','./gichul-index.js?v=217','./gichul.js?v=217','./study-credit.js?v=217','./xp.js?v=217','./score.js?v=217','./content-corrections.js?v=217','./review-record.js?v=217','./review-policy.js?v=217','./practice.js?v=217','./index.html?v=217','./parts.js?v=217','./part-check.js?v=217','./core-units.js?v=217','./app.js?v=217','./scheduler.js?v=217','./learning.js?v=217','./style.css?v=217','./sync-core.js?v=217','./sync.js?v=217','./firebase-config.js?v=217','./manifest.json','./icon.svg'];
// v247: 자체 제작 문제의 글 · 해설 · 기초 개념 상자는 조각(chunks/<이름>.json?h=<지문>)으로 나뉘어 있고, 앱은 그 문제를 처음 낼 때 받는다(content-store.js).
// 오프라인에서도 전부 풀 수 있게 설치할 때 모든 조각을 미리 받는다. 설치가 끝나야 이 워커가 켜지므로 켜진 캐시는 언제나 셸 + 색인 + 모든 조각이 같은 판이다.
// 조각 주소는 내용 지문이다: 지문이 같은 조각은 옛 캐시에서 복사하고(네트워크 0), 받은 바이트의 지문이 주소와 다르면 캐시에 넣지 않는다.
// 지문 함수는 content-store.js hashBytes와 같아야 한다(lazy.test.cjs가 대조).
function hashBytes(u8){let a=2166136261,b=7;for(let i=0;i<u8.length;i++){const x=u8[i];a=Math.imul(a^x,16777619)>>>0;b=(Math.imul(b,31)+x)>>>0;}return a.toString(16).padStart(8,'0')+b.toString(16).padStart(8,'0');}
const CHUNK=/\/chunks\/[a-z]-[a-z0-9-]+\.json$/;
const chunkBody=buf=>new Response(buf,{status:200,headers:{'Content-Type':'application/json; charset=utf-8'}});
async function checked(response,hash){if(!response||!response.ok)return null;const buf=await response.arrayBuffer();return hashBytes(new Uint8Array(buf))===hash?buf:null;}
async function storeChunk(c,name,hash){
 const href=new URL('./chunks/'+name+'.json?h='+hash,self.location).href;
 let buf=await checked(await caches.match(href),hash);
 if(!buf){buf=await checked(await fetch(href,{cache:'no-store'}),hash);if(!buf)throw Error('Chunk fetch failed: '+name);}
 await c.put(href,chunkBody(buf));
}
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await Promise.all(ASSETS.map(async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('Asset fetch failed');await c.put(url,r);}));
 const list=await fetch('./chunk-manifest.json?v=217',{cache:'no-store'});if(!list.ok)throw Error('Chunk list fetch failed');const manifest=await list.json();
 // 배포가 퍼지는 중이면 색인과 조각 목록이 서로 다른 판일 수 있다. 그때는 설치하지 않는다(옛 워커가 그대로 남고, 다음에 열 때 다시 시도한다).
 const index=await (await c.match('./content-index.js?v=217')).text();if(!index.includes('"build":"'+manifest.build+'"'))throw Error('Index and chunk list are from different builds');
 const jobs=Object.entries(manifest.files);let next=0;
 await Promise.all(Array.from({length:6},async()=>{while(next<jobs.length){const [name,hash]=jobs[next++];await storeChunk(c,name,hash);}}));
 await self.skipWaiting();})()));
// 배포마다 캐시 이름이 바뀌는데 옛 캐시를 지운 적이 없어 기기에 41개(219MB)가 쌓여 있었다. 새 버전이 켜질 때 남은 것을 지운다.
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim();})()));
// 조각은 캐시 먼저(지문 주소라 내용이 바뀔 수 없다). 캐시에 없으면 받아서 지문을 확인한 뒤 넣는다. 지문이 다르면 409 — 앱이 '새 버전으로 다시 열기'를 보인다.
async function chunkResponse(href,hash){
 const c=await caches.open(CACHE),hit=await c.match(href);if(hit)return hit;
 let r;try{r=await fetch(href,{cache:'no-store'});}catch{return Response.error();}
 if(!r.ok)return r;
 const buf=await r.arrayBuffer();if(hashBytes(new Uint8Array(buf))!==hash)return new Response('',{status:409,statusText:'Chunk differs from its address'});
 try{await c.put(href,chunkBody(buf));}catch{}
 return chunkBody(buf);
}
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 {const url=new URL(e.request.url),hash=url.searchParams.get('h');if(hash&&CHUNK.test(url.pathname)){e.respondWith(chunkResponse(url.href,hash));return;}}
 e.respondWith((async()=>{const c=await caches.open(CACHE);try{const r=await fetch(e.request,{cache:'no-store'});if(r.ok)await c.put(e.request,r.clone());return r;}catch{const cached=await c.match(e.request);if(cached)return cached;if(e.request.mode==='navigate')return (await c.match('./index.html?v=217'))||Response.error();return Response.error();}})());});
