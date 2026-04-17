/**
 * taCalculator.js
 * Core Railway TA Engine ported to React Native.
 */

export function calculateDayBlocksTA(dayBlocks, hqStation = "") {
  if (!dayBlocks || dayBlocks.length === 0) return { totalUnits: 0, dayLog: [] };

  const HQ = hqStation ? hqStation.trim().toUpperCase() : "";
  let legs = [];

  // 1. Prepare timeline
  dayBlocks.forEach(block => {
    block.legs.forEach(leg => {
      if (leg.depTime && leg.arrTime && block.date) {
        const dep = new Date(`${block.date}T${leg.depTime}:00`);
        let arr = new Date(`${block.date}T${leg.arrTime}:00`);
        if (arr < dep) arr.setDate(arr.getDate() + 1); // Overnight

        legs.push({
          dep,
          arr,
          from: (leg.fromStation || "").trim().toUpperCase(),
          to: (leg.toStation || "").trim().toUpperCase()
        });
      }
    });
  });

  if (legs.length === 0) return { totalUnits: 0, dayLog: [] };
  legs.sort((a, b) => a.dep.getTime() - b.dep.getTime());

  // 2. Identify Absence Spells
  const originHQ = HQ || legs[0].from;
  let spells = [];
  let currentSpell = null;

  legs.forEach(leg => {
    if (!currentSpell) {
      currentSpell = { start: leg.dep, end: leg.arr };
    } else {
      currentSpell.end = leg.arr;
    }
    if (leg.to === originHQ) {
      spells.push(currentSpell);
      currentSpell = null;
    }
  });
  if (currentSpell) spells.push(currentSpell);

  // 3. Daily Segments
  const dailyAbsence = {};
  spells.forEach(spell => {
    let cursor = new Date(spell.start.getTime());
    const end = spell.end;
    let limit = 0;
    while (cursor < end && limit < 366) {
      limit++;
      const y = cursor.getFullYear(), m = cursor.getMonth(), d = cursor.getDate();
      const dateKey = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const nextMidnight = new Date(y, m, d + 1, 0, 0, 0);
      const segmentEnd = end < nextMidnight ? end : nextMidnight;

      const durationMs = segmentEnd.getTime() - cursor.getTime();
      if (durationMs > 0) {
        dailyAbsence[dateKey] = (dailyAbsence[dateKey] || 0) + durationMs;
      }
      cursor = nextMidnight;
    }
  });

  // 4. Units & Log
  let totalUnits = 0;
  let dayLog = [];
  Object.keys(dailyAbsence).sort().forEach(date => {
    const hours = dailyAbsence[date] / 3600000;
    let units = hours >= 12 ? 1.0 : hours >= 6 ? 0.7 : hours > 0 ? 0.3 : 0;
    
    const [y, m, d] = date.split('-');
    dayLog.push({ date: `${d}/${m}/${y}`, hours: hours.toFixed(2), units });
    totalUnits += units;
  });

  return { totalUnits, dayLog };
}
