'use strict';
// A small, explicit scheduling heuristic, not a fitted memory prediction model.
(function (root) {
  const day = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  function plus(date, n) { const [y,m,d] = date.split('-').map(Number); return day(new Date(y,m-1,d+n)); }
  // 단계 규칙(복습 일정 · 동기화 재계산 · 경험치 · 뱃지가 모두 이 step 하나를 쓴다).
  // v131 사용자: "맞춘 경우 7일이 지나기 전까지 안 나옴. 또 맞추면 14일, 또 맞추면 30일 이후에는 랜덤하게."
  // v139 사용자: 틀리면 0이 아니라 "한 단계 낮추는 거 좋네", "단계 낮추기 전에 해당 문제 1번 더 맞출 기회".
  // streak = 제때 맞힌 횟수. 1 → 7일 대기, 2 → 14일, 3 → 30일, 4 이상 = 외운 문제(30일마다). 단계 = streak-1 (0~3).
  //  · 맞힘: due 전이면 그대로. 제때면 streak+1. 기회 중이면 단계 그대로 그 단계 대기를 다시. 다시 익히는 중이면 그 단계에서 이어 감.
  //  · 틀림(설명 보고 맞힘 포함): 단계가 있으면(streak ≥ 2) 먼저 기회 한 번 — 단계 유지, 5분 뒤·다음 날 다시.
  //    기회에서도 틀리면 한 단계 내림(외움 → 14일 통과, 14일 → 7일, 7일 → 처음). 다시 익히는 중에 또 틀려도 더 내리지 않는다.
  const STAGE_DAYS = [7, 14, 30], MASTER_STREAK = 4;
  const stageDays = streak => STAGE_DAYS[Math.min(Math.max(streak,1), STAGE_DAYS.length) - 1];
  const stageOf = streak => Math.min(STAGE_DAYS.length, Math.max(0, streak - 1));
  function step(st, result, today) {
    if (!['correct','unsure','wrong'].includes(result)) throw Error('Unknown grade');
    let {streak = 0, due = null, chance = false, relearn = false} = st || {};
    if (result === 'correct') {
      let event;
      if (relearn) { relearn = false; if (!streak) streak = 1; event = 'relearned'; }
      else if (chance) { chance = false; event = 'kept'; }
      else if (streak > 0 && due && today < due) return {state:{streak, due, chance, relearn}, event:'early', interval:null};
      // 외운 뒤에는 streak을 MASTER_STREAK에서 멈춘다 — 그래야 한 단계 내림이 실제로 한 단계다.
      else { const was = streak; streak = Math.min(streak + 1, MASTER_STREAK); event = was === 0 ? 'learned' : streak > was ? 'advance' : 'kept'; }
      const interval = stageDays(streak);
      return {state:{streak, due:plus(today, interval), chance, relearn}, event, interval};
    }
    let event;
    if (relearn) event = 'still';
    else if (chance) { chance = false; relearn = true; streak = streak >= 2 ? streak - 1 : 0; event = 'demote'; }
    else if (streak >= 2) { chance = true; event = 'chance'; }
    else { streak = 0; relearn = true; event = 'lapse'; }
    return {state:{streak, due:plus(today, 1), chance, relearn}, event, interval:1};
  }
  function schedule(card, result, today = day()) {
    let {ease = 2.5, interval = 0} = card;
    const out = step(card, result, today);
    if (out.event === 'early') return {ease, interval, streak:card.streak, due:card.due, chance:!!card.chance, relearn:!!card.relearn};
    ease = result === 'correct' ? Math.min(3, Math.round((ease+.1)*100)/100) : Math.max(1.3, Math.round((ease-(result==='wrong'?.2:.15))*100)/100);
    return {ease, interval:out.interval, ...out.state};
  }
  function migrate(input, today = day()) {
    const data = structuredClone(input);
    if (data.version === 2 || data.version === 3) return data;
    data.cards = data.cards.map(c => {
      const history = data.history.filter(h=>h.cardId===c.id).sort((a,b)=>a.date.localeCompare(b.date));
      const last = history.at(-1);
      const interval = c.due === null ? 30 : [0,3,4,7,16][c.stage];
      const streak = last && last.result !== 'correct' ? 0 : c.stage;
      const next = {...c, ease:2.5, interval, streak, due:c.due ?? plus(last?.date || today,30)};
      delete next.stage;
      return next;
    });
    data.version = 2;
    return data;
  }
  const api = {day, plus, schedule, step, stageOf, migrate, STAGE_DAYS, MASTER_STREAK};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ReviewSchedule = api;
})(globalThis);
