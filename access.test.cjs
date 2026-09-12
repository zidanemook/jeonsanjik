// Drives the real sync.js access flow (requester + owner) against a mock Firestore and a minimal
// DOM, so the three requester states, the owner's decisions and the read cost are all exercised.
// No real Firestore is contacted: the server rules themselves are NOT executed here, the mock only
// mirrors the operations the published rules allow (see the rule assertions at the end).
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),core=require('./sync-core.js');
const SRC=fs.readFileSync(__dirname+'/sync.js','utf8');
const now=()=>Date.now();

// ---- shared mock server -------------------------------------------------------------------
const allowed=new Map([['owner',{at:1,email:'owner@example.invalid',admin:true}],['member',{at:2,email:'member@example.invalid'}]]);
const requests=new Map(),events=new Map();
const counts={requestGet:0,requestList:0,requestListen:0,allowedGet:0,eventListen:0};
const deny=m=>Object.assign(Error(m),{code:'permission-denied'});
function requestDoc(uid){
 return {
  async get(){counts.requestGet++;const v=requests.get(uid);return {exists:!!v,data:()=>structuredClone(v)};},
  // The rules only let a requester create a document that does not exist yet, without rejectedAt.
  async set(value){
   if(requests.has(uid))throw deny('create on an existing request');
   assert.deepEqual(Object.keys(value).sort(),['at','displayName','email','uid']);
   assert.equal(value.uid,uid);assert.ok(value.at>0&&value.at<=now()+300000);
   requests.set(uid,structuredClone(value));
  },
  // Two single-key updates are permitted: the requester's monotonic `at`, the owner's rejectedAt.
  async update(patch){
   const old=requests.get(uid);if(!old)throw deny('update on a missing request');
   const keys=Object.keys(patch);assert.equal(keys.length,1,'an update touches exactly one field');
   if(keys[0]==='at')assert.ok(patch.at>old.at,'`at` only moves forward');
   else assert.equal(keys[0],'rejectedAt','only `at` or `rejectedAt` may be updated');
   assert.ok(patch[keys[0]]>0&&patch[keys[0]]<=now()+300000);
   requests.set(uid,{...old,...patch});
  },
  async delete(){requests.delete(uid);}
 };
}
function makeDb(){
 return {
  enablePersistence:()=>Promise.resolve(),
  collection(name){
   if(name==='accessRequests')return {
    doc:requestDoc,
    async get(){counts.requestList++;return {docs:[...requests].map(([id,v])=>({id,data:()=>structuredClone(v)}))};},
    onSnapshot(){counts.requestListen++;return()=>{};}
   };
   if(name==='allowedUsers')return {doc(uid){return {
    async get(){counts.allowedGet++;const v=allowed.get(uid);return {exists:!!v,data:()=>structuredClone(v)};},
    async set(value){assert.deepEqual(Object.keys(value).sort(),['at','email']);assert.ok(!('admin' in value),'approval never grants admin');allowed.set(uid,structuredClone(value));},
    async delete(){allowed.delete(uid);}
   };}};
   return {doc(uid){return {collection(type){return {
    doc(id){return {uid,type,id};},
    onSnapshot(options,fn){counts.eventListen++;queueMicrotask(()=>fn({metadata:{fromCache:false,hasPendingWrites:false},docs:[...(events.get(uid)||new Map())].map(([id,v])=>({id,data:()=>structuredClone(v)}))}));return()=>{};}
   };}};}};
  },
  batch(){const writes=[];return {set(ref,v){writes.push([ref,v]);},async commit(){for(const [ref,v] of writes){if(!events.has(ref.uid))events.set(ref.uid,new Map());events.get(ref.uid).set(ref.id,structuredClone(v));}}};}
 };
}

// ---- minimal DOM --------------------------------------------------------------------------
const IDS=['syncStatus','syncAccount','syncRequest','adminOpen','adminPanel','adminStatus','adminRequests'];
function node(tag){return {tag,className:'',type:'',hidden:false,disabled:false,textContent:'',onclick:null,children:[],
 append(...k){this.children.push(...k);},replaceChildren(...k){this.children.length=0;this.children.push(...k);}};}
function makeDom(){
 const byId=new Map(IDS.map(id=>[id,node('div')]));
 return {byId,document:{
  createElement:node,
  head:{append(script){queueMicrotask(()=>script.onload&&script.onload());}},
  querySelector(sel){return byId.get(sel.slice(1))||null;},
  visibilityState:'visible'
 }};
}
const walk=n=>[n,...n.children.flatMap(walk)];
const label=n=>walk(n).map(x=>x.textContent).join(' ');
const button=(root,text)=>walk(root).find(n=>n.tag==='button'&&n.textContent===text);

// ---- a client: the real sync.js and its real boot(), mock everything else ------------------
function client(uid){
 const {byId,document}=makeDom(),db=makeDb();
 let current={version:2,cards:[],history:[]},profile=null;const profiles=new Map();
 const store={get:()=>structuredClone(current),merge(rows){current=core.merge(current,rows);},
  switchUser(next){profiles.set(profile,current);profile=next;current=profiles.get(next)||{version:2,cards:[],history:[]};}};
 const listeners=[],who=next=>next?{uid:next,email:next+'@example.invalid',displayName:next+' 학습자'}:null;
 const auth={currentUser:who(uid),
  onAuthStateChanged(fn){listeners.push(fn);queueMicrotask(()=>fn(this.currentUser));return()=>{};},
  async signOut(){},async signInWithPopup(){}};
 const firebase={initializeApp(){},auth:()=>auth,firestore:()=>db};
 firebase.auth.GoogleAuthProvider=function(){};
 const context={document,firebase,ProgressSync:core,StudyProgress:store,
  STUDY_FIREBASE_CONFIG:{apiKey:'k',projectId:'p',authDomain:'a',appId:'i'},
  navigator:{onLine:true},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},
  addEventListener(){},removeEventListener(){}};
 vm.createContext(context);vm.runInContext(SRC,context);
 return {el:id=>byId.get(id),store,
  status:()=>byId.get('syncStatus').textContent,
  rows:()=>byId.get('adminRequests').children,
  login(next){auth.currentUser=who(next);for(const fn of listeners)fn(auth.currentUser);}};
}
const tick=()=>new Promise(r=>setImmediate(r));const settle=async()=>{for(let i=0;i<25;i++)await tick();};

(async()=>{
 // 1) 미신청: a denied account is offered the request button and files exactly one document.
 const a=client('newbie');await settle();
 assert.equal(counts.requestGet,1,'the denial path costs one read, not a subscription');
 assert.equal(counts.requestListen,0);
 assert.equal(a.el('syncRequest').hidden,false);
 assert.equal(a.el('syncRequest').textContent,'승인 요청');
 assert.equal(a.el('adminOpen').hidden,true,'a denied account never sees the admin control');
 assert.equal(a.el('adminPanel').hidden,true);
 await a.el('syncRequest').onclick();await settle();
 assert.equal(requests.size,1);
 const filed=requests.get('newbie');
 assert.deepEqual(Object.keys(filed).sort(),['at','displayName','email','uid'],'only the submitted identity is stored');
 assert.equal(filed.email,'newbie@example.invalid');
 assert.equal(a.el('syncRequest').hidden,true,'the button disappears once the request is filed');
 assert.match(a.status(),/요청이 접수됐습니다/);
 // 2) 접수됨: a repeat visit shows the confirmation, one read, and no second document.
 a.login(null);await settle();a.login('newbie');await settle();
 assert.equal(counts.requestGet,2,'one status read per denied visit');
 assert.equal(requests.size,1,'a second visit never files a second request');
 assert.equal(a.el('syncRequest').hidden,true);
 assert.match(a.status(),/요청이 접수됐습니다/);

 // 3) Zero change for an approved non-admin: no admin control, no new read, no new listener.
 const before={...counts};
 const m=client('member');await settle();
 assert.equal(counts.requestGet,before.requestGet,'an approved account never reads accessRequests');
 assert.equal(counts.requestList,0);
 assert.equal(counts.requestListen,0,'no listener is ever opened on accessRequests');
 assert.equal(m.el('adminOpen').hidden,true,'the admin section must not render for an approved user');
 assert.equal(m.el('adminPanel').hidden,true);
 assert.equal(m.el('syncRequest').hidden,true);
 assert.equal(counts.eventListen,before.eventListen+1,'the existing event listener still starts');

 // 4) Owner: the section opens on a single one-shot read.
 const o=client('owner');await settle();
 assert.equal(o.el('adminOpen').hidden,false,'the admin control renders from the allowlist flag already read');
 assert.equal(o.el('adminPanel').hidden,true,'nothing is read until the section is opened');
 assert.equal(counts.requestList,0);
 o.el('adminOpen').onclick();await settle();
 assert.equal(counts.requestList,1,'opening the section is one get()');
 assert.equal(counts.requestListen,0,'the listing is never a subscription');
 assert.equal(o.el('adminPanel').hidden,false);
 assert.equal(o.rows().length,1);
 assert.match(o.el('adminStatus').textContent,/대기 중인 요청 1건/);
 assert.match(label(o.rows()[0]),/newbie@example\.invalid/);
 // 거절 records the decision instead of erasing the request.
 await button(o.rows()[0],'거절').onclick();await settle();
 assert.equal(requests.size,1,'rejecting keeps the row so the owner remembers the decision');
 assert.ok(requests.get('newbie').rejectedAt>0);
 assert.equal(counts.requestList,2,'the list is re-read once after a decision');
 assert.match(label(o.rows()[0]),/거절됨/);
 assert.ok(button(o.rows()[0],'삭제'),'a declined row offers a hard delete');

 // 5) 거절됨: the requester may ask again, and the refusal is preserved.
 const r=client('newbie');await settle();
 assert.equal(r.el('syncRequest').hidden,false);
 assert.equal(r.el('syncRequest').textContent,'다시 요청');
 assert.match(r.status(),/거절되었습니다/);
 const rejectedAt=requests.get('newbie').rejectedAt;
 await r.el('syncRequest').onclick();await settle();
 assert.equal(requests.size,1,'asking again reuses the same document');
 assert.equal(requests.get('newbie').rejectedAt,rejectedAt,'the requester cannot clear the refusal');
 assert.ok(requests.get('newbie').at>rejectedAt,'the fresh ask is newer than the refusal');
 assert.equal(r.el('syncRequest').hidden,true);

 // 6) The owner can tell a repeat ask from a first one, and 승인 writes the allowlist document.
 o.el('adminOpen').onclick();await settle();   // closes the section
 o.el('adminOpen').onclick();await settle();   // reopens it: one more read
 assert.equal(counts.requestList,3);
 assert.match(label(o.rows()[0]),/다시 요청 \(이전에 거절\)/);
 assert.match(o.el('adminStatus').textContent,/대기 중인 요청 1건/);
 await button(o.rows()[0],'승인').onclick();await settle();
 assert.deepEqual(Object.keys(allowed.get('newbie')).sort(),['at','email'],'승인 writes only at and email');
 assert.equal(allowed.get('newbie').email,'newbie@example.invalid');
 assert.equal(requests.size,0,'an approved request is cleared');
 assert.equal(o.rows().length,0);

 // 7) The approved account now syncs like any other: no admin control, no extra read.
 const after={...counts};
 const n=client('newbie');await settle();
 assert.equal(counts.requestGet,after.requestGet,'an approved account stops reading accessRequests');
 assert.equal(n.el('adminOpen').hidden,true);
 assert.equal(n.el('syncRequest').hidden,true);
 assert.equal(counts.eventListen,after.eventListen+1);

 // ---- rules text guards: the new collections must not weaken what already existed ----------
 const rules=fs.readFileSync(__dirname+'/firestore.rules','utf8');
 assert.match(rules,/function owner\(uid\) \{\s*\n\s+return request\.auth != null && request\.auth\.uid == uid/,'the owner(uid) gate stays');
 assert.match(rules,/allow update: if owner\(uid\) && request\.resource\.data == resource\.data;/,'event immutability stays');
 assert.equal((rules.match(/allow delete: if false;/g)||[]).length,3,'users/{uid} documents stay undeletable');
 assert.match(rules,/match \/allowedUsers\/\{uid\} \{[\s\S]*?allow list: if isAdmin\(\);/,'only the owner may enumerate the allowlist');
 assert.match(rules,/allow delete: if isAdmin\(\) && uid != request\.auth\.uid;/,'the owner cannot delete their own grant');
 assert.match(rules,/allow create, update: if isAdmin\(\) && uid != request\.auth\.uid/,'the owner cannot rewrite their own grant');
 assert.match(rules,/allow create: if mine\(\) && validRequest\(request\.resource\.data\)\s*\n\s+&& !\('rejectedAt' in request\.resource\.data\);/);
 assert.match(rules,/allow update: if mine\(\)[\s\S]*?changed\(\['at'\]\) && request\.resource\.data\.at > resource\.data\.at;/);
 assert.match(rules,/allow update: if isAdmin\(\)[\s\S]*?changed\(\['rejectedAt'\]\)/);
 assert(!/uid == '/.test(rules),'no UID is hardcoded in the rules');
 assert(!/allowedUsers'\)\.doc\('/.test(SRC),'no UID is hardcoded in the client');

 console.log('PASS access requests: 미신청→접수됨→거절됨→다시 요청→승인, one read per denied visit, one get() per owner listing (never a subscription), no admin section and no extra read for approved users, refusal preserved across a re-ask, and the existing users/{uid} guards intact');
})().catch(e=>{console.error(e);process.exitCode=1;});
