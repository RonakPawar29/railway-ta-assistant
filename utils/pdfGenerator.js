import { numberToWords } from './numberToWords';

/**
 * Generates the Official S4 Railway TA Journal HTML template.
 */
export function generateS4HTML(record, profile) {
  const ROWS_PER_PAGE = 18;
  const totalAmount = Math.round(record.totalUnits * (parseFloat(profile?.baseTaRate) || 800));

  // Flatten legs to rows
  const allRows = [];
  record.dayBlocks.forEach(block => {
    block.legs.forEach((leg, idx) => {
      const calculation = record.calculationLog.find(l => {
        const [d, m, y] = l.date.split('/');
        return `${y}-${m}-${d}` === block.date;
      });

      allRows.push({
        date: idx === 0 ? block.date.split('-').reverse().join('/') : '',
        train: leg.trainNo || 'Duty',
        dep: leg.depTime,
        arr: leg.arrTime,
        from: leg.fromStation,
        to: leg.toStation,
        units: (idx === 0 && calculation) ? calculation.units : '',
        rate: (idx === 0 && calculation) ? profile.baseTaRate : '',
        amt: (idx === 0 && calculation) ? (calculation.units * profile.baseTaRate).toFixed(2) : '',
        obj: idx === 0 ? block.objectOfJourney : ''
      });
    });
  });

  const pages = [];
  for (let i = 0; i < allRows.length; i += ROWS_PER_PAGE) {
    pages.push(allRows.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #000; }
          .page { height: 1000px; padding: 20px; border: 1px solid #eee; margin-bottom: 20px; position: relative; }
          .header { text-align: center; }
          .railway { font-weight: bold; font-size: 20px; margin-bottom: 5px; }
          .form-id { float: left; font-size: 12px; }
          .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; margin-top: 15px; border-top: 1px solid #000; padding: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
          th, td { border: 1px solid #000; padding: 5px; text-align: center; }
          .footer { margin-top: 30px; font-size: 12px; }
          .signature-area { display: flex; justify-content: space-between; margin-top: 60px; }
          .sig-box { border-top: 1px solid #000; width: 150px; text-align: center; padding-top: 5px; font-size: 10px; }
        </style>
      </head>
      <body>
        ${pages.map((chunk, pIdx) => `
          <div class="page">
            <div class="form-id">G. 33 F / S4</div>
            <div class="header">
              <div class="railway">WESTERN RAILWAY</div>
              <div style="font-weight:bold; text-decoration: underline;">TRAVELLING ALLOWANCE JOURNAL</div>
            </div>

            <div class="profile-grid">
              <div><strong>Name:</strong> ${profile.fullName}</div>
              <div><strong>Designation:</strong> ${profile.designation}</div>
              <div><strong>HQ:</strong> ${profile.headquarter}</div>
              <div><strong>PF No:</strong> ${profile.pfNumber}</div>
              <div><strong>Level:</strong> ${profile.level}</div>
              <div><strong>Month:</strong> ${record.journalPeriod.month} ${record.journalPeriod.year}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th rowspan="2">Date</th><th rowspan="2">Train</th><th colspan="2">Time</th><th rowspan="2">From</th><th rowspan="2">To</th><th rowspan="2">Units</th><th rowspan="2">Rate</th><th rowspan="2">Amount</th>
                </tr>
                <tr><th>Arr</th><th>Dep</th></tr>
              </thead>
              <tbody>
                ${chunk.map(row => `
                  <tr>
                    <td>${row.date}</td><td>${row.train}</td><td>${row.arr}</td><td>${row.dep}</td><td>${row.from}</td><td>${row.to}</td><td>${row.units}</td><td>${row.rate}</td><td>${row.amt}</td>
                  </tr>
                `).join('')}
                ${Array(ROWS_PER_PAGE - chunk.length).fill(0).map(() => `<tr><td colspan="9">&nbsp;</td></tr>`).join('')}
              </tbody>
            </table>

            ${pIdx === pages.length - 1 ? `
              <div class="footer">
                <div style="font-weight:bold; border-bottom:1px solid #000; padding-bottom:5px;">
                  Grand Total: ${record.totalUnits.toFixed(1)} Units | ₹${totalAmount.toLocaleString()}
                </div>
                <div style="margin-top:10px;">
                  <strong>Amount in words:</strong> Rupee ${numberToWords(totalAmount)} Only.
                </div>
                <div class="signature-area">
                  <div class="sig-box">EMPLOYEE SIGNATURE</div>
                  <div class="sig-box">IN-CHARGE SSE</div>
                  <div class="sig-box">COUNTERSIGNED</div>
                </div>
              </div>
            ` : ''}
            
            <div style="position: absolute; bottom: 10px; right: 20px; font-size: 10px;">Sheet ${pIdx + 1}</div>
          </div>
        `).join('')}
      </body>
    </html>
  `;
}
