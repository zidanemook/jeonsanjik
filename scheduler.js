'use strict';
// A small, explicit scheduling heuristic, not a fitted memory prediction model.
(function (root) {
  const day = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  function plus(date, n) { const [y,m,d] = date.split('-').map(Number); return day(new Date(y,m-1,d+n)); }
  // v131 사용자 규칙: "문제 맞춘 경우 7일이 지나기 전까지 안 나옴. 또 맞추면 14일, 또 맞추면 30일 이후에는 랜덤하게 나올 수 있음."
  // streak = 제때(due 이후) 맞힌 횟수. 1 → 7일, 2 → 14일, 3 → 30일, 4 이상 = 외운 문제(30일마다, 과목 전체 풀기에서만 가끔 무작위).
  // due 전에 맞힌 것(범위 다시 풀기 등)은 단계를 바꾸지 않는다. 틀리면 0으로 — 다시 맞힌 날부터 7일.
  const STAGE_DAYS = [7, 14, 30], MASTER_STREAK = 4;
  const stageDays = streak => STAGE_DAYS[Math.min(streak, STAGE_DAYS.length) - 1];
  function schedule(card, result, today = day()) {
    let {ease, interval, streak} = card;
    if (!['correct','unsure','wrong'].includes(result)) throw Error('Unknown grade');
    if (result === 'correct') {
      if (streak > 0 && card.due && today < card.due) return {ease, interval, streak, due:card.due};
      streak++;
      interval = stageDays(streak);
      ease = Math.min(3, Math.round((ease+.1)*100)/100);
    } else {
      interval = result === 'wrong' ? 1 : Math.min(3, Math.max(1, Math.round(interval*.5)));
      ease = Math.max(1.3, Math.round((ease-(result==='wrong'?.2:.15))*100)/100);
      streak = 0;
    }
    return {ease, interval, streak, due:plus(today,interval)};
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
  const api = {day, plus, schedule, migrate, STAGE_DAYS, MASTER_STREAK};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ReviewSchedule = api;
})(globalThis);
