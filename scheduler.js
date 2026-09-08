'use strict';
// A small, explicit scheduling heuristic, not a fitted memory prediction model.
(function (root) {
  const day = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  function plus(date, n) { const [y,m,d] = date.split('-').map(Number); return day(new Date(y,m-1,d+n)); }
  function schedule(card, result, today = day()) {
    let {ease, interval, streak} = card;
    if (!['correct','unsure','wrong'].includes(result)) throw Error('Unknown grade');
    if (result === 'correct') {
      interval = streak === 0 ? 1 : streak === 1 ? 3 : Math.min(365, Math.max(interval+1, Math.round(interval*ease)));
      ease = Math.min(3, Math.round((ease+.1)*100)/100);
      streak++;
    } else {
      interval = result === 'wrong' ? 1 : Math.min(3, Math.max(1, Math.round(interval*.5)));
      ease = Math.max(1.3, Math.round((ease-(result==='wrong'?.2:.15))*100)/100);
      streak = 0;
    }
    return {ease, interval, streak, due:plus(today,interval)};
  }
  function migrate(input, today = day()) {
    const data = structuredClone(input);
    if (data.version === 2) return data;
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
  const api = {day, plus, schedule, migrate};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ReviewSchedule = api;
})(globalThis);
