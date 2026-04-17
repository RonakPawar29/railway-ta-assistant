/**
 * taCalculator.js
 * Professional Railway TA logic with Midnight Splitting and Absence Spell grouping.
 */

/**
 * Calculates TA units based on 7th CPC standards.
 * Splitting absence into calendar days and applying 30/70/100 thresholds.
 */
export function calculateDayBlocksTA(dayBlocks, hqStation = "") {
  if (!dayBlocks || dayBlocks.length === 0) return { totalUnits: 0, dayLog: [] };

  // 1. Flatten all legs into a sorted timeline
  let legs = [];
  dayBlocks.forEach(block => {
    if (!block.date) return;
    block.legs.forEach(leg => {
      if (leg.depTime && leg.arrTime) {
        const depDateTime = new Date(`${block.date}T${leg.depTime}:00`);
        let arrDateTime = new Date(`${block.date}T${leg.arrTime}:00`);
        
        // Handle overnight leg within one block
        if (arrDateTime < depDateTime) {
          arrDateTime.setDate(arrDateTime.getDate() + 1);
        }
        
        legs.push({
          dep: depDateTime,
          arr: arrDateTime,
          from: (leg.fromStation || "").trim().toUpperCase(),
          to: (leg.toStation || "").trim().toUpperCase()
        });
      }
    });
  });

  if (legs.length === 0) return { totalUnits: 0, dayLog: [] };
  legs.sort((a, b) => a.dep.getTime() - b.dep.getTime());

  // 2. Identify Absence Spells (HQ to HQ)
  const HQ = hqStation ? hqStation.trim().toUpperCase() : legs[0].from;
  let spells = [];
  let currentSpell = null;

  legs.forEach(leg => {
    if (!currentSpell) {
      currentSpell = { start: leg.dep, end: leg.arr };
    } else {
      currentSpell.end = leg.arr;
    }
    if (leg.to === HQ) {
      spells.push(currentSpell);
      currentSpell = null;
    }
  });
  if (currentSpell) spells.push(currentSpell);

  // 3. Process spells into calendar days
  const dailyAbsence = {}; 

  spells.forEach(spell => {
    let cursor = new Date(spell.start.getTime());
    const end = spell.end;
    let iterations = 0;

    while (cursor < end && iterations < 366) {
      iterations++;
      const y = cursor.getFullYear();
      const m = cursor.getMonth();
      const d = cursor.getDate();
      const dateKey = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const currentMidnight = new Date(y, m, d, 0, 0, 0);
      const nextMidnight = new Date(y, m, d + 1, 0, 0, 0);
      
      const sessionStart = cursor > currentMidnight ? cursor : currentMidnight;
      const sessionEnd = end < nextMidnight ? end : nextMidnight;

      const durationMs = sessionEnd.getTime() - sessionStart.getTime();
      if (durationMs > 0) {
        dailyAbsence[dateKey] = (dailyAbsence[dateKey] || 0) + durationMs;
      }
      cursor = nextMidnight;
    }
  });

  // 4. Units conversion
  let totalUnits = 0;
  let dayLog = [];
  const sortedDates = Object.keys(dailyAbsence).sort();

  sortedDates.forEach(date => {
    const hours = dailyAbsence[date] / (1000 * 60 * 60);
    let units = 0;
    if (hours >= 12) units = 1.0;
    else if (hours >= 6) units = 0.7;
    else if (hours > 0) units = 0.3;

    const [y, m, d] = date.split('-');
    dayLog.push({
      date: `${d}/${m}/${y}`,
      hours: hours.toFixed(2),
      units: units
    });
    totalUnits += units;
  });

  return { totalUnits, dayLog };
}
