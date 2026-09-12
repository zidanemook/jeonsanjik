'use strict';
// Immutable results include the original question and answer. Unsubmitted drafts stay local.
(function(root){
 // Approval requests. Every call here is a one-shot read or write: the owner's pending list is
 // fetched when the section is opened and never subscribed to, so an approved account that never
 // opens it pays nothing, and no listener is added anywhere.
 function accessGate(db){
  const requests=()=>db.collection('accessRequests'),text=(v,max)=>String(v==null?'':v).slice(0,max);
  const row=(uid,v)=>{const at=Number(v.at)||0,rejectedAt=Number(v.rejectedAt)||0;
   return {uid,email:text(v.email,320),displayName:text(v.displayName,160),at,rejectedAt,rejected:rejectedAt>=at,repeat:rejectedAt>0&&at>rejectedAt};};
  return {
   // 미신청 / 접수됨 / 거절됨: one read on the denial path decides which of the three shows.
   async status(uid){
    const doc=await requests().doc(uid).get({source:'server'});
    if(!doc.exists)return {filed:false,rejected:false};
    return {filed:true,...row(uid,doc.data()||{})};
   },
   // The requester submits only the identity they signed in with; nothing else is stored.
   async submit(user){
    const ask={uid:user.uid,email:text(user.email,320),displayName:text(user.displayName,160),at:Date.now()};
    if(!ask.email)throw Error('Missing account email');
    await requests().doc(user.uid).set(ask);return ask;
   },
   // Asking again after a refusal moves `at` forward only, leaving `rejectedAt` in place so the
   // owner still sees that this person was declined before.
   async reask(uid){await requests().doc(uid).update({at:Date.now()});},
   async list(){
    const snapshot=await requests().get({source:'server'});
    return snapshot.docs.map(d=>row(d.id,d.data()||{})).sort((a,b)=>a.at-b.at);
   },
   // Grant first, then clear the ask: a failure leaves the request visible instead of losing it.
   async approve(ask){
    await db.collection('allowedUsers').doc(ask.uid).set({at:Date.now(),email:text(ask.email,320)});
    await requests().doc(ask.uid).delete();
   },
   // Refusing records the decision instead of erasing the request.
   async reject(uid){await requests().doc(uid).update({rejectedAt:Date.now()});},
   async remove(uid){await requests().doc(uid).delete();}
  };
 }
 function connect({auth,db,store,status,access}){
  const withViews=typeof store.mergeExplanations==='function',withSession=typeof store.session==='function'&&typeof store.mergeSession==='function';
  let generation=0,unsubscribe,unsubscribeViews,unsubscribeSession,knownSession=0,sessionReady=false,sessionSending=false,uid=null,known=new Set(),knownViews=new Map(),reviewsReady=false,viewsReady=!withViews,ready=false,uploading=false,merging=false,closed=false;
  const say=text=>status(text),gate=accessGate(db);
  function merge(rows){merging=true;try{store.merge(rows);}finally{merging=false;}}
  function mergeViews(rows){merging=true;try{store.mergeExplanations(rows);}finally{merging=false;}}
  function sessionRef(user){return db.collection('users').doc(user).collection('state').doc('session');}
  // Last explicit choice wins; the rules reject a write older than the stored position.
  // One write goes out at once; further choices inside the cooldown coalesce into a single
  // trailing write, so a burst of taps costs one billed write instead of one per tap.
  const SESSION_COOLDOWN_MS=4000,later=typeof root.setTimeout==='function'?root.setTimeout.bind(root):null,cancel=typeof root.clearTimeout==='function'?root.clearTimeout.bind(root):()=>{};
  let sessionCooldown=null,sessionPending=false,sentPosition='';
  // `at` advances on every stamp, so an unchanged position is recognised by its body alone.
  function positionOf(row){const {at,...rest}=row;return JSON.stringify(rest);}
  function sessionDue(){
   if(!withSession||!sessionReady||!uid||closed)return null;
   let row;try{const local=store.session();if(!local)return null;row=ProgressSync.session(local);}catch{return null;}
   return row.at>knownSession&&positionOf(row)!==sentPosition?row:null;
  }
  async function sendSession(){
   if(sessionSending)return;const row=sessionDue();if(!row)return;const token=generation,user=uid;sessionSending=true;
   try{await sessionRef(user).set(row);if(token===generation){knownSession=Math.max(knownSession,row.at);sentPosition=positionOf(row);}}
   catch{if(token===generation)sessionPending=true;}
   finally{sessionSending=false;}
  }
  function armSession(){
   if(!later)return;
   sessionCooldown=later(()=>{sessionCooldown=null;const wanted=sessionPending;sessionPending=false;if(wanted&&sessionDue()){void sendSession();armSession();}},SESSION_COOLDOWN_MS);
  }
  function pushSession(){
   if(!sessionDue())return;
   if(sessionCooldown||sessionSending){sessionPending=true;return;}
   sessionPending=false;void sendSession();armSession();
  }
  // Closing or hiding the tab must not drop the coalesced last position.
  function flushSession(){if(!sessionPending&&!sessionDue())return;sessionPending=false;cancel(sessionCooldown);sessionCooldown=null;void sendSession();}
  async function flush(){
   if(!ready||uploading||!uid||closed)return;const token=generation,user=uid;uploading=true;
   try{
    merge([]);
    for(;;){
     if(token!==generation)return;
     const state=store.get(),pending=state.history.map(ProgressSync.event).filter(e=>!known.has(e.id));
     const eligible=new Set(state.history.filter(h=>h.mode==='quiz').map(h=>h.id));
     const views=withViews?(state.explanationViews||[]).map(StudyCredit.explanation).filter(v=>eligible.has(v.id)&&known.has(v.id)&&(!knownViews.has(v.id)||v.openedAt<knownViews.get(v.id))):[];
     if(!pending.length&&!views.length)break;
     say('학습 기록 동기화 중…');const batch=db.batch(),isView=!pending.length,chunk=isView?views.slice(0,10):pending.slice(0,50);
     // Save the parent quiz first; view batches stay within rule document-access limits.
     for(const e of chunk)batch.set(db.collection('users').doc(user).collection(isView?'explanationViews':'events').doc(e.id),e);
     await batch.commit();if(token!==generation)return;
     if(isView)chunk.forEach(e=>knownViews.set(e.id,Math.min(knownViews.get(e.id)??Infinity,e.openedAt)));else chunk.forEach(e=>known.add(e.id));
    }
    if(token===generation)say('학습 기록 동기화됨');
   }catch(e){if(token===generation)say(e.code==='permission-denied'?'동기화 권한을 확인해야 해요. 기록은 이 기기에 보관돼요.':'전송 대기 중 · 기록은 이 기기에 저장됐어요.');}
   finally{uploading=false;if(token!==generation&&ready)void flush();}
  }
  // Not on the allowlist: study stays local in this browser, and one read tells the requester
  // whether their ask is already filed so a repeat visit shows the confirmation, not the button.
  const FILED='요청이 접수됐습니다 · 승인되면 이 계정으로 자동 동기화돼요.';
  async function denied(user,token){
   if(!access){say('허용된 계정으로 로그인해 주세요.');return;}
   let state=null;
   try{state=await gate.status(user.uid);}catch{}
   if(token!==generation)return;
   if(!state){say('승인 상태를 확인하지 못했어요 · 학습 기록은 이 기기에 저장돼요.');return;}
   const waiting=state.filed&&!state.rejected;
   say(waiting?FILED:state.rejected?'승인 요청이 거절되었습니다 · 다시 요청할 수 있어요. 학습 기록은 이 기기에 저장돼요.'
    :'허용된 계정이 아니에요. 승인 요청을 보내면 관리자가 확인해요 · 그때까지 학습 기록은 이 기기에 저장돼요.');
   access.request({waiting,rejected:!!state.rejected,
    async submit(){await (state.filed?gate.reask(user.uid):gate.submit(user));if(token===generation)say(FILED);}});
  }
  async function account(user){
   const token=++generation;unsubscribe?.();unsubscribeViews?.();unsubscribeSession?.();unsubscribe=null;unsubscribeViews=null;unsubscribeSession=null;cancel(sessionCooldown);sessionCooldown=null;sessionPending=false;sentPosition='';knownSession=0;sessionReady=false;ready=false;reviewsReady=false;viewsReady=!withViews;known=new Set();knownViews=new Map();uid=null;
   access?.reset();
   if(!user){try{store.switchUser(null);say('이 기기에 저장 중 · 로그인하면 자동 동기화돼요.');}catch{say('이 기기의 저장 공간을 확인해 주세요.');}return;}
   say('동기화 계정 확인 중…');
   try{
    const allowed=await db.collection('allowedUsers').doc(user.uid).get({source:'server'});if(token!==generation)return;
    if(!allowed.exists){store.switchUser(null);await denied(user,token);return;}
    store.switchUser(user.uid);uid=user.uid;
    // The rules mark the owner on their own allowlist document, which was just read: the admin
    // section costs no extra read, and an approved account without the flag renders nothing.
    if(allowed.data?.()?.admin===true)access?.admin(gate);
    unsubscribe=db.collection('users').doc(uid).collection('events').onSnapshot({includeMetadataChanges:true},snapshot=>{
     if(token!==generation)return;
     try{
      const rows=snapshot.docs.map(d=>{const row=ProgressSync.event(d.data());if(row.id!==d.id)throw Error('Mismatched event');return row;});
      merge(rows);
      if(snapshot.metadata.fromCache||snapshot.metadata.hasPendingWrites){say('연결 대기 중 · 이 기기에 저장돼요.');return;}
      known=new Set(rows.map(r=>r.id));reviewsReady=true;ready=reviewsReady&&viewsReady;void flush();
     }catch(e){reviewsReady=false;ready=false;say('동기화 기록을 확인해야 해요. 기존 기록은 보관돼요.');}
    },()=>{reviewsReady=false;ready=false;say('서버 연결을 확인해야 해요. 기록은 이 기기에 보관돼요.');});
    if(withViews)unsubscribeViews=db.collection('users').doc(uid).collection('explanationViews').onSnapshot({includeMetadataChanges:true},snapshot=>{
     if(token!==generation)return;
     try{
      const rows=snapshot.docs.map(d=>{const row=StudyCredit.explanation(d.data());if(row.id!==d.id)throw Error('Mismatched explanation');return row;});mergeViews(rows);
      if(snapshot.metadata.fromCache||snapshot.metadata.hasPendingWrites){say('연결 대기 중 · 이 기기에 저장돼요.');return;}
      knownViews=new Map(rows.map(v=>[v.id,v.openedAt]));viewsReady=true;ready=reviewsReady&&viewsReady;void flush();
     }catch{viewsReady=false;ready=false;say('해설 열기 기록을 확인해야 해요. 기존 기록은 보관돼요.');}
    },()=>{viewsReady=false;ready=false;say('해설 기록 연결 대기 중 · 이 기기에 저장돼요.');});
    // Position sync is independent: its failure never blocks answer records.
    if(withSession)unsubscribeSession=sessionRef(uid).onSnapshot({includeMetadataChanges:true},doc=>{
     if(token!==generation)return;
     try{
      const row=doc.exists?ProgressSync.session(doc.data()):null;if(row){merging=true;try{store.mergeSession(row);}finally{merging=false;}}
      if(doc.metadata.fromCache||doc.metadata.hasPendingWrites)return;
      knownSession=Math.max(knownSession,row?.at||0);sessionReady=true;void pushSession();
     }catch{sessionReady=false;}
    },()=>{sessionReady=false;});
   }catch(e){if(token===generation)say('연결 대기 중 · 기록은 이 기기에 저장돼요.');}
  }
  const stopAuth=auth.onAuthStateChanged(user=>{void account(user);});
  const saved=()=>{if(!merging){void flush();void pushSession();}},retry=()=>{if(!ready)void account(auth.currentUser);else{void flush();void pushSession();}};
  const hidden=()=>{if(!root.document||root.document.visibilityState!=='visible')flushSession();};
  root.addEventListener('study-progress-saved',saved);root.addEventListener('online',retry);
  root.addEventListener('visibilitychange',hidden);root.addEventListener('pagehide',flushSession);
  const timer=setInterval(()=>{if(root.navigator.onLine)retry();},60000);
  return {flush,retry,close(){closed=true;generation++;unsubscribe?.();unsubscribeViews?.();unsubscribeSession?.();stopAuth();clearInterval(timer);cancel(sessionCooldown);sessionCooldown=null;root.removeEventListener('study-progress-saved',saved);root.removeEventListener('online',retry);root.removeEventListener('visibilitychange',hidden);root.removeEventListener('pagehide',flushSession);}};
 }
 root.ProgressCloud={connect};
 // Screen wiring for the approval flow. Everything starts hidden: an approved account that is
 // not the owner never shows a control here and never issues one of the reads above.
 function accessUI(output){
  const ask=document.querySelector('#syncRequest'),open=document.querySelector('#adminOpen'),panel=document.querySelector('#adminPanel'),note=document.querySelector('#adminStatus'),list=document.querySelector('#adminRequests');
  if(!ask||!open||!panel||!note||!list)return null;
  const elem=(tag,text,cls)=>{const el=document.createElement(tag);if(text)el.textContent=text;if(cls)el.className=cls;return el;};
  const when=at=>{try{return new Date(at).toLocaleString('ko-KR',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});}catch{return '';}};
  function reset(){ask.hidden=true;ask.disabled=false;open.hidden=true;panel.hidden=true;note.textContent='';list.replaceChildren();}
  reset();
  function card(row,gate,reload){
   const item=elem('div','','request-item');
   const label=row.rejected?'거절됨 · '+when(row.rejectedAt):row.repeat?'다시 요청 (이전에 거절) · '+when(row.at):when(row.at);
   item.append(elem('strong',row.email||row.uid),elem('span',(row.displayName||'이름 없음')+' · '+label));
   const actions=elem('div','','request-actions'),yes=elem('button','승인','primary'),no=elem('button',row.rejected?'삭제':'거절','secondary');
   yes.type='button';no.type='button';
   const act=async(fn,busy)=>{yes.disabled=true;no.disabled=true;note.textContent=busy;
    try{await fn();await reload();}catch{yes.disabled=false;no.disabled=false;note.textContent='처리하지 못했어요. 다시 시도해 주세요.';}};
   yes.onclick=()=>act(()=>gate.approve(row),'승인 중…');
   no.onclick=()=>act(()=>row.rejected?gate.remove(row.uid):gate.reject(row.uid),row.rejected?'삭제 중…':'거절 중…');
   actions.append(yes,no);item.append(actions);return item;
  }
  // One read per opening of the section, and one more after each decision. The privileged listing
  // decides whether the section may render at all: a denied list hides it again, so the client
  // never needs to know the owner's UID.
  async function load(gate){
   panel.hidden=false;note.textContent='승인 요청을 불러오는 중…';list.replaceChildren();
   let rows;
   try{rows=await gate.list();}
   catch{panel.hidden=true;open.hidden=true;note.textContent='';output.textContent='승인 관리 권한을 확인하지 못했어요.';return;}
   const waiting=rows.filter(r=>!r.rejected),declined=rows.filter(r=>r.rejected),reload=()=>load(gate);
   note.textContent=(waiting.length?'대기 중인 요청 '+waiting.length+'건':'대기 중인 요청이 없어요.')+(declined.length?' · 거절한 요청 '+declined.length+'건':'');
   list.replaceChildren(...waiting.map(r=>card(r,gate,reload)),...declined.map(r=>card(r,gate,reload)));
  }
  return {
   reset,
   // 미신청이거나 거절된 계정만 버튼을 본다. 접수 대기 중이면 확인 문구만 남는다.
   request({waiting,rejected,submit}){
    if(waiting)return;
    ask.hidden=false;ask.disabled=false;ask.textContent=rejected?'다시 요청':'승인 요청';
    ask.onclick=async()=>{ask.disabled=true;try{await submit();ask.hidden=true;}catch{ask.disabled=false;output.textContent='요청을 보내지 못했어요. 잠시 뒤 다시 시도해 주세요.';}};
   },
   admin(gate){open.hidden=false;open.onclick=()=>{if(panel.hidden)void load(gate);else{panel.hidden=true;list.replaceChildren();note.textContent='';}};}
  };
 }
 async function boot(){
  const output=document.querySelector('#syncStatus'),button=document.querySelector('#syncAccount'),config=root.STUDY_FIREBASE_CONFIG;
  if(!config?.apiKey||!config?.projectId||!config?.authDomain||!config?.appId){output.textContent='이 기기에 저장 중';return;}
  output.textContent='동기화 연결 중…';
  try{
   for(const file of ['firebase-app-compat.js','firebase-auth-compat.js','firebase-firestore-compat.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='./vendor/'+file;script.onload=resolve;script.onerror=reject;document.head.append(script);});
   firebase.initializeApp(config);const auth=firebase.auth(),db=firebase.firestore();
   // Persist the Firestore cache before the first query runs: onSnapshot then resumes from its
   // stored resume token and is billed for changed documents only, instead of re-reading the
   // whole event log on every load. A second tab, private window or blocked storage rejects
   // here; that is swallowed so the app keeps working exactly as it does without a cache.
   try{db.enablePersistence({synchronizeTabs:true}).catch(()=>{});}catch{}
   button.hidden=false;auth.onAuthStateChanged(user=>{button.textContent=user?'로그아웃':'Google 로그인';});
   button.onclick=async()=>{button.disabled=true;try{if(auth.currentUser)await auth.signOut();else await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());}catch(e){output.textContent=e.code==='auth/popup-closed-by-user'?'로그인이 취소됐어요.':'로그인하지 못했어요. 다시 시도해 주세요.';}finally{button.disabled=false;}};
   connect({auth,db,store:root.StudyProgress,status:text=>{output.textContent=text;},access:accessUI(output)});
  }catch(e){output.textContent='동기화 연결 대기 중 · 학습 기록은 이 기기에 저장돼요.';}
 }
 if(typeof document!=='undefined')void boot();
})(globalThis);
