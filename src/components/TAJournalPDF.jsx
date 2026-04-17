import React from 'react';
import { ArrowLeft, Printer, Share2 } from 'lucide-react';
import { numberToWords } from '../utils/numberToWords';
import './TAJournalPDF.css';

const TAJournalPDF = ({ record, profile, onBack }) => {
  if (!record || !profile) return <div>No data found.</div>;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = `Railway TA Journal for ${profile.fullName}\nPeriod: ${record.journalPeriod.month} ${record.journalPeriod.year}\nTotal Units: ${record.totalUnits.toFixed(1)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'TA Journal Info', text });
      } catch (err) { console.log(err); }
    } else {
      alert("Copy this to share:\n" + text);
    }
  };

  // Pagination Logic: 18 rows per page for official S4 look
  const ROWS_PER_PAGE = 18;
  const allRows = [];
  record.dayBlocks.forEach(block => {
    block.legs.forEach((leg, lIdx) => {
      const dayReport = record.calculationLog.find(l => {
        const [d, m, y] = l.date.split('/');
        return `${y}-${m}-${d}` === block.date;
      });
      allRows.push({
        date: lIdx === 0 ? block.date.split('-').reverse().join('/') : '',
        train: leg.trainNo || leg.mode,
        depTime: leg.depTime,
        arrTime: leg.arrTime,
        from: leg.fromStation,
        to: leg.toStation,
        km: '8 KM ABOVE',
        units: lIdx === 0 && dayReport ? dayReport.units : '',
        rate: lIdx === 0 && dayReport ? profile.baseTaRate : '',
        amount: lIdx === 0 && dayReport ? (dayReport.units * profile.baseTaRate).toFixed(2) : '',
        object: lIdx === 0 ? block.objectOfJourney : ''
      });
    });
  });

  const pageChunks = [];
  for (let i = 0; i < allRows.length; i += ROWS_PER_PAGE) {
    pageChunks.push(allRows.slice(i, i + ROWS_PER_PAGE));
  }
  if (pageChunks.length === 0) pageChunks.push([]);

  return (
    <div className="pdf-parent">
      <div className="pdf-controls no-print">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={18} /> Back to Records</button>
        <div className="flex gap-2">
          <button className="premium-btn secondary" onClick={handleShare}><Share2 size={18} /> Share Info</button>
          <button className="premium-btn" onClick={handlePrint}><Printer size={18} /> Print S4 Journal ({pageChunks.length} Pages)</button>
        </div>
      </div>

      <div className="pdf-pages-area">
        {pageChunks.map((chunk, pIdx) => (
          <div key={pIdx} className="s4-page">
            <div className="s4-header">
              <div className="flex justify-between">
                <span className="form-id">G. 33 F / S4</span>
                <span className="railway-logo text-lg font-bold">WESTERN RAILWAY</span>
                <span className="page-num">Sheet No: {pIdx + 1}</span>
              </div>
              <h2 className="text-center font-bold underline mt-2">TRAVELLING ALLOWANCE JOURNAL</h2>
              
              <div className="profile-box border-t border-b border-black mt-2 py-1 text-[11px] grid grid-cols-2 gap-x-8">
                <div><strong>Name:</strong> {profile.fullName}</div>
                <div><strong>Designation:</strong> {profile.designation}</div>
                <div><strong>H.Q. Station:</strong> {profile.headquarter}</div>
                <div><strong>P.F. / Staff No:</strong> {profile.pfNumber}</div>
                <div><strong>Level / Pay:</strong> Level {profile.payScale} / ₹{profile.gradePay}</div>
                <div><strong>Month:</strong> {record.journalPeriod.month} {record.journalPeriod.year}</div>
              </div>
            </div>

            <table className="s4-table mt-2">
              <thead>
                <tr>
                  <th rowSpan="2">Date</th>
                  <th rowSpan="2">Train No</th>
                  <th colSpan="2">Time</th>
                  <th rowSpan="2">Station From</th>
                  <th rowSpan="2">Station To</th>
                  <th rowSpan="2">KM</th>
                  <th rowSpan="2">Units</th>
                  <th rowSpan="2">Rate</th>
                  <th rowSpan="2">Amount (₹)</th>
                </tr>
                <tr>
                  <th>Arr</th>
                  <th>Dep</th>
                </tr>
              </thead>
              <tbody>
                {chunk.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td>{row.date}</td>
                    <td>{row.train}</td>
                    <td>{row.arrTime}</td>
                    <td>{row.depTime}</td>
                    <td>{row.from}</td>
                    <td>{row.to}</td>
                    <td className="text-[9px]">{row.km}</td>
                    <td>{row.units}</td>
                    <td>{row.rate}</td>
                    <td className="font-bold">{row.amount}</td>
                  </tr>
                ))}
                {/* Pad empty rows */}
                {Array.from({ length: ROWS_PER_PAGE - chunk.length }).map((_, i) => (
                  <tr key={`empty-${i}`} className="empty-row"><td colSpan="11">&nbsp;</td></tr>
                ))}
              </tbody>
            </table>

            {pIdx === pageChunks.length - 1 && (
              <div className="s4-footer mt-4 text-[11px]">
                <div className="flex justify-between font-bold border-b border-black pb-1">
                  <span>GRAND TOTAL (Claimed)</span>
                  <span>{record.totalUnits.toFixed(1)} Units | ₹{(record.totalUnits * profile.baseTaRate).toFixed(2)}</span>
                </div>
                <div className="mt-2 font-bold">Amount in Words: Rupee {numberToWords(Math.round(record.totalUnits * profile.baseTaRate))} Only.</div>
                
                <div className="grid grid-cols-3 mt-12 gap-10 text-center">
                  <div className="border-t border-black pt-1 uppercase">Signature of Employee</div>
                  <div className="border-t border-black pt-1 uppercase">In-Charge / SSE</div>
                  <div className="border-t border-black pt-1 uppercase">Countersigned</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TAJournalPDF;
