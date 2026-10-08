// 검사용: 풀이 N건짜리 옛 형식(version 3) 저장 상태를 만든다. 사용자의 실제 기록이 아니다.
// 바탕은 state-v246-44days.json.gz(v246 앱 코드로 44일에 걸쳐 푼 820건 — 문제 15,622줄, 풀이 한 줄의 모양과 사본 길이가 실제와 같다).
//  · 풀이 한 줄 = 바탕의 줄에서 문제 · 보기 · 해설 사본을 빌리고 id · 문제 · 시각만 새로 준다(하루 250건, 푼 문제를 7일쯤 뒤에 다시, 15%쯤 틀림, 다섯에 둘은 해설 열람).
//  · 문제 일정은 앱과 같은 ProgressSync.merge로 기록에서 다시 계산한다. 문제를 넣은 날(created)은 여섯 날짜로 나눈다.
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const Sync=require('../sync-core.js'),Policy=require('../review-policy.js');
const baseRaw=()=>zlib.gunzipSync(fs.readFileSync(path.join(__dirname,'state-v246-44days.json.gz'))).toString('utf8');
function make(N,opt={}){
 const base=JSON.parse(baseRaw()),pool=base.history.filter(h=>h.detail),CARDS=opt.cards||base.cards.length;
 let seed=20261008;const rnd=()=>{seed=(Math.imul(seed,1103515245)+12345)>>>0;return seed/4294967296;};
 const installs=['2026-08-25','2026-09-03','2026-09-12','2026-09-21','2026-09-30','2026-10-07'];
 const cards=[];for(let i=0;i<CARDS;i++){const c=base.cards[i%base.cards.length],id=i<base.cards.length?c.id:c.id+'-x'+Math.floor(i/base.cards.length),d=installs[Math.min(installs.length-1,Math.floor(i/CARDS*installs.length))];cards.push({id,created:d,due:d,ease:2.5,interval:0,streak:0});}
 const perDay=250,days=Math.max(1,Math.ceil(N/perDay)),DAY=86400000,T0=Date.parse(opt.end||'2026-10-08T03:00:00Z')-(days-1)*DAY;
 const hex=(n,w)=>n.toString(16).padStart(w,'0'),history=[],views=[],seenAt=[];let fresh=0;
 for(let n=0;n<N;n++){
  const dayIndex=Math.floor(n/perDay),at=new Date(T0+dayIndex*DAY+(n%perDay)*40000),date=new Date(at.getTime()+9*3600000).toISOString().slice(0,10);
  let ci;const again=seenAt.length&&seenAt[0].day<=dayIndex-7&&rnd()<.45;
  if(again)ci=seenAt.shift().ci;else if(fresh<CARDS)ci=fresh++;else ci=Math.floor(rnd()*CARDS);
  seenAt.push({ci,day:dayIndex});
  const src=pool[n%pool.length],id='5eed'+hex(n>>>16,4)+'-0000-4000-8000-'+hex(n,12),cardId=cards[ci].id,wrong=rnd()<.15;
  const detail={...src.detail,exerciseId:(cardId+'-'+hex((n*2654435761)>>>0,8)).slice(0,160),conceptId:Policy.concept(cardId)};
  if(wrong){const opts=detail.options.split('\n');if(opts.length>1)detail.submittedAnswer=opts.find(o=>o!==detail.correctAnswer)||detail.submittedAnswer;}
  history.push({id,cardId,date,at:at.toISOString(),result:wrong?'wrong':'correct',mode:'quiz',detail});
  if(n%5<2)views.push({id,openedAt:at.getTime()+20000});
 }
 const state={...base,version:3,scheduleVersion:3,cards,history:[],explanationViews:views};delete state.activePractice;delete state.quizFeedback;
 return Sync.merge({...state,history},[]);
}
module.exports={make,baseRaw};
