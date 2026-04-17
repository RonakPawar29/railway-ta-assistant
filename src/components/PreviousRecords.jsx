import React, { useState, useEffect } from 'react';
import { Trash2, FileText, Calendar, Wallet } from 'lucide-react';
import './Dashboard.css'; // Reuse common glass card styles

const PreviousRecords = ({ profile, onOpen }) => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('taEntries');
    if (saved) {
      setRecords(JSON.parse(saved).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  }, []);

  const deleteRecord = (id) => {
    if (window.confirm("Bhai, kya aap sach me is journal ko delete karna chahte hain?")) {
      const updated = records.filter(r => r.id !== id);
      setRecords(updated);
      localStorage.setItem('taEntries', JSON.stringify(updated));
    }
  };

  return (
    <div className="records-container animate-fade-in">
      <div className="header mb-6">
        <h2 className="text-2xl font-bold text-primary">Journal History</h2>
        <p className="text-text-muted">Poore saal ke TA journals ki list yahan milegi.</p>
      </div>

      <div className="records-list grid gap-4">
        {records.length === 0 ? (
          <div className="premium-card glass text-center py-20">
            <p className="text-text-muted italic">Abhi tak koi journal save nahi kiya gaya.</p>
          </div>
        ) : (
          records.map(record => {
            const amount = Math.round(record.totalUnits * (parseFloat(profile?.baseTaRate) || 500));
            return (
              <div key={record.id} className="record-item premium-card glass flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="icon-badge bg-primary-light text-white p-3 rounded-xl">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{record.journalPeriod.month} {record.journalPeriod.year}</h4>
                    <div className="flex gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {record.dayBlocks.length} Days</span>
                      <span className="flex items-center gap-1"><Wallet size={12} /> ₹{amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="premium-btn py-2 px-4 text-sm" onClick={() => onOpen(record)}>
                    Open PDF
                  </button>
                  <button className="text-red-400 hover:text-red-600 p-2" onClick={() => deleteRecord(record.id)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PreviousRecords;
