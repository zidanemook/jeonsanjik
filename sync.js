'use strict';
// Immutable results include the original question and answer. Unsubmitted drafts stay local.
(function(root){
 function connect({auth,db,store,status}){
  const withViews=typeof store.mergeExplanations==='function',withSession=typeof store.session==='function'&&typeof store.mergeSession==='function';
  let generation=0,unsubscribe,unsubscribeViews,unsubscribeSession,knownSession=0,sessionReady=false,sessionSending=false,uid=null,known=new Set(),knownViews=new Map(),reviewsReady=false,viewsReady=!withViews,ready=false,uploading=false,merging=false,closed=false;
  const say=text=>status(text);
  function merge(rows){merging=true;try{store.merge(rows);}finally{merging=false;}}
  function mergeViews(rows){merging=true;try{store.mergeExplanations(rows);}finally{merging=false;}}
  function sessionRef(user){return db.collection('users').doc(user).collection('state').doc('session');}
  // Last explicit choice wins; the rules reject a write older than the stored position.
  async function pushSession(){
   if(!withSession||!sessionReady||sessionSending||!uid||closed)return;const token=generation,user=uid;
   let row;try{const local=store.session();if(!local)return;row=ProgressSync.session(local);}catch{return;}
   if(row.at<=knownSession)return;sessionSending=true;
   try{await sessionRef(user).set(row);if(token===generation)knownSession=Math.max(knownSession,row.at);}catch{}
   finally{sessionSending=false;}
  }
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
  async function account(user){
   const token=++generation;unsubscribe?.();unsubscribeViews?.();unsubscribeSession?.();unsubscribe=null;unsubscribeViews=null;unsubscribeSession=null;knownSession=0;sessionReady=false;ready=false;reviewsReady=false;viewsReady=!withViews;known=new Set();knownViews=new Map();uid=null;
   if(!user){try{store.switchUser(null);say('이 기기에 저장 중 · 로그인하면 자동 동기화돼요.');}catch{say('이 기기의 저장 공간을 확인해 주세요.');}return;}
   say('동기화 계정 확인 중…');
   try{
    const allowed=await db.collection('allowedUsers').doc(user.uid).get({source:'server'});if(token!==generation)return;
    if(!allowed.exists){store.switchUser(null);say('허용된 계정으로 로그인해 주세요.');return;}
    store.switchUser(user.uid);uid=user.uid;
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
  root.addEventListener('study-progress-saved',saved);root.addEventListener('online',retry);
  const timer=setInterval(()=>{if(root.navigator.onLine)retry();},60000);
  return {flush,retry,close(){closed=true;generation++;unsubscribe?.();unsubscribeViews?.();unsubscribeSession?.();stopAuth();clearInterval(timer);root.removeEventListener('study-progress-saved',saved);root.removeEventListener('online',retry);}};
 }
 root.ProgressCloud={connect};
 async function boot(){
  const output=document.querySelector('#syncStatus'),button=document.querySelector('#syncAccount'),config=root.STUDY_FIREBASE_CONFIG;
  if(!config?.apiKey||!config?.projectId||!config?.authDomain||!config?.appId){output.textContent='이 기기에 저장 중';return;}
  output.textContent='동기화 연결 중…';
  try{
   for(const file of ['firebase-app-compat.js','firebase-auth-compat.js','firebase-firestore-compat.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='./vendor/'+file;script.onload=resolve;script.onerror=reject;document.head.append(script);});
   firebase.initializeApp(config);const auth=firebase.auth(),db=firebase.firestore();
   button.hidden=false;auth.onAuthStateChanged(user=>{button.textContent=user?'로그아웃':'Google 로그인';});
   button.onclick=async()=>{button.disabled=true;try{if(auth.currentUser)await auth.signOut();else await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());}catch(e){output.textContent=e.code==='auth/popup-closed-by-user'?'로그인이 취소됐어요.':'로그인하지 못했어요. 다시 시도해 주세요.';}finally{button.disabled=false;}};
   connect({auth,db,store:root.StudyProgress,status:text=>{output.textContent=text;}});
  }catch(e){output.textContent='동기화 연결 대기 중 · 학습 기록은 이 기기에 저장돼요.';}
 }
 if(typeof document!=='undefined')void boot();
})(globalThis);
