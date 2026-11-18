'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/private-book.js','utf8');
function element(tag){return {tag,children:[],events:{},hidden:false,isConnected:true,append(...xs){this.children.push(...xs);},replaceChildren(...xs){this.children=xs;},setAttribute(){},addEventListener(k,fn){this.events[k]=fn;},remove(){this.isConnected=false;},get text(){return (this.textContent||'')+this.children.map(x=>x.text||x.textContent||'').join('');}};}
function fixture(){const ctx={document:{createElement:element,createTextNode:text=>({text}),querySelectorAll:()=>[]},navigator:{onLine:true},console};vm.createContext(ctx);vm.runInContext(source,ctx);return {...ctx,api:ctx.StudyPrivateBook};}
const settle=async()=>{for(let i=0;i<12;i++)await new Promise(r=>setImmediate(r));};
(async()=>{
 const f=fixture(),parent=element('div'),calls=[];
 f.api.mount(parent,'com-cg02');assert.equal(parent.children[0].children.length,0);
 f.api.session(null);assert.equal(parent.children[0].children.length,0);assert.equal(calls.length,0);
 const read=async(group,id)=>{calls.push([group,id]);return group==='boxes'?{photos:['a','b','c','d','e','f','g']}:{id,page:'x',text:'## Heading\n- **Bold**\n<script>unsafe</script>',img:'AA==',w:10,h:20};};
 f.api.session({read});const fold=parent.children[0].children[0];assert.equal(fold.children[0].textContent,'원본 쪽 보기');assert.equal(calls.length,0);
 fold.open=true;fold.events.toggle();fold.events.toggle();await settle();assert.equal(calls.length,4);assert.equal(fold.children[1].children.length,3);
 fold.events.toggle();await settle();assert.equal(calls.length,4);
 await fold.children[3].onclick();await settle();assert.equal(calls.length,7);assert.equal(fold.children[1].children.length,6);
 const second=element('div');f.api.mount(second,'com-cg02');second.children[0].children[0].open=true;second.children[0].children[0].events.toggle();await settle();assert.equal(calls.length,7,'same-session cache');
 const other=element('div');for(const id of ['hist-a','eng-a','com-cg27','sec-is22'])f.api.mount(other,id);assert.equal(other.children.length,0);
 f.api.session(null);assert.equal(parent.children[0].children.length,0,'signout removes private content');assert.equal(second.children[0].children.length,0);
 f.api.session({read});f.navigator.onLine=false;const offline=parent.children[0].children[0];offline.open=true;offline.events.toggle();await settle();assert.equal(offline.children[2].textContent,'연결되면 볼 수 있어요');assert.equal(calls.length,7);
 f.navigator.onLine=true;offline.events.toggle();await settle();assert.equal(calls.length,11,'new owner session clears cache');
 // An old in-flight response must never appear after an account switch.
 let resolve;f.api.session({read:()=>new Promise(r=>{resolve=r;})});const old=parent.children[0].children[0];old.open=true;old.events.toggle();f.api.session(null);resolve({photos:['a']});await settle();assert.equal(parent.children[0].children.length,0);assert.equal(old.children[1].children.length,0);
 const markup=f.api.markdown('# Heading\n- **Bold**\n<img src=x onerror=alert(1)>');assert.equal(markup.children[0].tag,'h3');assert.equal(markup.children[1].tag,'ul');assert.equal(markup.children[1].children[0].children[1].tag,'strong');assert.ok(markup.text.includes('<img'));
 // Auth integration reuses the server-verified role and resets on every account change.
 const sync=fs.readFileSync(__dirname+'/sync.js','utf8');assert.match(sync,/access\?\.reset\(\);root\.StudyPrivateBook\?\.session\(null\)/);assert.match(sync,/role==='owner'\)\{access\?\.admin\(gate\);root\.StudyPrivateBook\?\.session/);
 // Drive real account transitions rather than trusting the rendering API alone.
 let authChanged,role='member',privateReads=0,grantReads=0;const ctx={console,navigator:{onLine:true},ProgressSync:require('./sync-core.js'),setInterval:()=>0,clearInterval(){},addEventListener(){},removeEventListener(){}};vm.createContext(ctx);vm.runInContext(sync,ctx);
 ctx.document={createElement:element,createTextNode:text=>({text}),querySelectorAll:()=>[]};
 ctx.fetch=async(url,options)=>{privateReads++;assert.equal(options.cache,'no-store');assert.equal(options.headers.Authorization,'Bearer mock-token');assert.match(url,/privateBook\/boxes\/items\/sec-is01$/);return {ok:true,status:200,json:async()=>({fields:{photos:{arrayValue:{values:[]}}}})};};vm.runInContext(source,ctx);
 const host=element('div');ctx.StudyPrivateBook.mount(host,'sec-is01');
 const user={uid:'mock-owner',getIdToken:async()=>'mock-token'},auth={onAuthStateChanged(fn){authChanged=fn;return()=>{};}};
 const db={app:{options:{projectId:'mock-project'}},collection(name){assert.notEqual(name,'privateBook','private reads must avoid the persistent SDK');if(name==='allowedUsers')return {doc:()=>({get:async()=>{grantReads++;return {exists:true,data:()=>({role})};}})};return {doc:()=>({collection:()=>({onSnapshot:()=>()=>{}})})};}};
 const cloud=ctx.ProgressCloud.connect({auth,db,store:{switchUser:async()=>{},merge(){},events:()=>[]},status(){}});
 authChanged(null);await settle();assert.equal(host.children[0].children.length,0);assert.equal(privateReads,0);
 authChanged(user);await settle();assert.equal(host.children[0].children.length,0);assert.equal(privateReads,0);assert.equal(grantReads,1);
 role='owner';authChanged(user);await settle();assert.equal(host.children[0].children.length,1);assert.equal(privateReads,0);assert.equal(grantReads,2,'reuse the existing role read');
 const ownerFold=host.children[0].children[0];ownerFold.open=true;ownerFold.events.toggle();await settle();assert.equal(privateReads,1);
 role='member';authChanged(user);await settle();assert.equal(host.children[0].children.length,0);assert.equal(privateReads,1);cloud.close();
 assert.match(source,/cache:'no-store'/);assert.ok(!/localStorage|indexedDB|\.set\(|\.batch\(/.test(source.replace(/cache\.set\([^;]+;/g,'')));
 const app=fs.readFileSync(__dirname+'/app.js','utf8');assert.match(app,/StudyPrivateBook\?\.mount\(d,Content.ruleOfBox\(box\)\)/);assert.match(app,/StudyPrivateBook\?\.mount\(main.d,m.box\)/);
 const sw=fs.readFileSync(__dirname+'/sw.js','utf8');assert.match(sw,/new URL\(e.request.url\).origin!==self.location.origin\)return/);
 const rule=fs.readFileSync(__dirname+'/firestore.rules','utf8');assert.match(rule,/match \/privateBook\/\{doc=\*\*\} \{\s+allow read, write: if isAdmin\(\);\s+\}/);
 // Private research is deliberately absent from a CI checkout. The full local run also
 // scans twenty long index headings against every public text file, including chunks.
 const mapFile=path.resolve(__dirname,'../research/private-book-20261118/map.json');
 if(fs.existsSync(mapFile)){
  const map=JSON.parse(fs.readFileSync(mapFile,'utf8')),samples=[...new Set(map.pages.map(p=>p.section).filter(t=>t.length>35))].filter((_,i)=>i%4===0).slice(0,20);assert.equal(samples.length,20);
  const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name==='.git'?[]:e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
  for(const file of walk(__dirname).filter(p=>/\.(js|cjs|json|css|html|md|txt|yml)$/.test(p))){const text=fs.readFileSync(file,'utf8');for(const sample of samples)assert.ok(!text.includes(sample),'private heading leaked: '+path.relative(__dirname,file));}
  console.log('PASS private heading samples: 20');
 }
 console.log('PASS private original view: authorization, lazy reads, paging, cache, offline, account races, safe text, integration');
})().catch(e=>{console.error(e);process.exitCode=1;});
