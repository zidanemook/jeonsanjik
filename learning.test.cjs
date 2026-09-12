const assert=require('node:assert/strict');global.ReviewSchedule=require('./scheduler.js');const L=require('./learning.js');
const now=new Date(2026,8,9,12),card={id:'a',due:'2026-09-09',ease:2.5,interval:3,streak:2},history=[{cardId:'a',date:'2026-09-06',result:'correct'}];
let c={...card,pendingAttempt:L.begin(card,history,'none',now)};assert.equal(c.pendingAttempt.delayedFirst,true);assert.throws(()=>L.assess(c,history,'correct',now));let r=L.assess(c,history,'wrong',now);assert.equal(r.entry.delayedFirst,true);assert.equal(L.queue([r.card],now).length,0);const later=new Date(now.getTime()+L.RETRY_MS);assert.equal(L.queue([r.card],later).length,1);const hs=[...history,r.entry];c={...r.card,pendingAttempt:L.begin(r.card,hs,'remember',later)};const success=L.assess(c,hs,'correct',later);assert.equal(success.card.interval,1);assert.equal(success.card.streak,0);assert.equal(success.card.retryAt,undefined);assert.equal(success.entry.delayedFirst,false);assert.deepEqual(L.metrics([card],[...hs,success.entry]),{total:1,correct:0});assert.deepEqual(L.metrics([card],history),{total:0,correct:0});assert.equal(L.begin(card,[],'remember',now).delayedFirst,false);assert.equal(L.queue([r.card],new Date(2026,8,10,12)).length,1);assert.equal(card.interval,3);assert.equal(L.begin({...card,pendingAttempt:c.pendingAttempt},history,'remember',now).delayedFirst,false);// 하루 새 문제 할당량(app.js): 복습 대기열의 순서 변경일 뿐, 카드가 빠지거나 없던 카드가 due가 되지 않는다.
{
 const fs=require('node:fs'),vm=require('node:vm'),src=fs.readFileSync(__dirname+'/app.js','utf8');
 const from=src.indexOf('// 하루에 끼워 넣는'),to=src.indexOf('let creditHistoryLimit');
 assert(from>0&&to>from,'app.js에서 새 문제 할당량 블록을 찾지 못했습니다');
 const box={data:{history:[]},day:()=>'2026-09-12',ReviewPolicy:{concept:id=>id.replace(/-\d+$/,'')}};
 vm.createContext(box);vm.runInContext(src.slice(from,to),box);
 assert.equal(Number(/const NEW_CARDS_PER_DAY=(\d+);/.exec(src)[1]),5,'하루 새 문제 수는 한 줄 상수로 남아 있어야 한다');
 const order=Array.from({length:40},(_,i)=>({id:'g'+Math.floor(i/2)+'-'+i})),ready=[...order];
 const seen=order.slice(0,30).map(c=>({cardId:c.id,date:'2026-09-01'}));
 box.data.history=[...seen];
 assert.equal(box.newCardRoom(order),5,'미풀이 10개 중 하루 몫 5개');
 const out=Array.from(box.withNewCards(order,ready));
 assert.deepEqual(Array.from(out,c=>c.id).sort(),[...ready.map(c=>c.id)].sort(),'대기열은 순열이어야 한다');
 const fresh=new Set(order.slice(30).map(c=>c.id)),at=out.map((c,i)=>fresh.has(c.id)?i:-1).filter(i=>i>=0);
 assert.deepEqual(Array.from(at.slice(0,5)),[3,7,11,15,19],'새 문제는 복습 3개마다 끼워 넣는다');
 for(const i of at.slice(0,5))assert.notEqual(box.ReviewPolicy.concept(out[i].id),box.ReviewPolicy.concept(out[i-1].id),'형제 문항이 연달아 나오면 안 된다');
 box.data.history=[...seen,...order.slice(30,35).map(c=>({cardId:c.id,date:'2026-09-12'}))];
 assert.equal(box.newCardRoom(order),0,'오늘 몫을 다 쓰면 0');
 assert.deepEqual(Array.from(box.withNewCards(order,ready),c=>c.id),ready.map(c=>c.id),'몫을 다 쓰면 기본 순서 그대로');
 box.data.history=box.data.history.map(h=>({...h,date:'2026-09-11'}));
 assert.equal(box.newCardRoom(order),5,'몫은 날마다 되돌아온다');
 box.data.history=order.map(c=>({cardId:c.id,date:'2026-09-01'}));
 assert.equal(box.newCardRoom(order),0,'미풀이가 없으면 0');
 assert.deepEqual(Array.from(box.withNewCards(order,ready),c=>c.id),ready.map(c=>c.id));
 box.data.history=[...seen];
 const held=ready.filter(c=>c.id!==order[31].id);
 assert(!Array.from(box.withNewCards(order,held)).some(c=>c.id===order[31].id),'형제 간격으로 빠진 카드를 되살리지 않는다');
}
console.log('PASS learning: recall guard, retry timing, next day rollover, no same-day interval inflation, delayed metrics, legacy exclusion, daily new-card quota');
