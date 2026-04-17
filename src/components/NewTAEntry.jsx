import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Calendar, Clock, MapPin, Train as TrainIcon } from 'lucide-react';
import { calculateDayBlocksTA } from '../utils/taCalculator';
import './NewTAEntry.css';

const NewTAEntry = ({ profile, onBack, onComplete }) => {
  const [journalPeriod, setJournalPeriod] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString()
  });

  const [dayBlocks, setDayBlocks] = useState([
    {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      objectOfJourney: '',
      legs: [{ id: Date.now() + 1, depTime: '', arrTime: '', fromStation: profile?.headquarter || '', toStation: '', mode: 'Train', trainNo: '' }]
    }
  ]);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString());

  const addBlock = () => {
    const lastDate = new Date(dayBlocks[dayBlocks.length - 1].date);
    lastDate.setDate(lastDate.getDate() + 1);
    
    setDayBlocks([...dayBlocks, {
      id: Date.now(),
      date: lastDate.toISOString().split('T')[0],
      objectOfJourney: '',
      legs: [{ id: Date.now() + 1, depTime: '', arrTime: '', fromStation: profile?.headquarter || '', toStation: '', mode: 'Train', trainNo: '' }]
    }]);
  };

  const removeBlock = (id) => {
    if (dayBlocks.length > 1) {
      setDayBlocks(dayBlocks.filter(b => b.id !== id));
    }
  };

  const addLeg = (blockId) => {
    setDayBlocks(dayBlocks.map(b => {
      if (b.id === blockId) {
        const lastLeg = b.legs[b.legs.length - 1];
        return {
          ...b,
          legs: [...b.legs, { 
            id: Date.now(), 
            depTime: lastLeg.arrTime || '', 
            arrTime: '', 
            fromStation: lastLeg.toStation || '', 
            toStation: '', 
            mode: 'Train', 
            trainNo: '' 
          }]
        };
      }
      return b;
    }));
  };

  const updateLeg = (blockId, legId, field, value) => {
    setDayBlocks(dayBlocks.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          legs: b.legs.map(l => l.id === legId ? { ...l, [field]: value } : l)
        };
      }
      return b;
    }));
  };

  const handleSaveAll = () => {
    const { totalUnits, dayLog } = calculateDayBlocksTA(dayBlocks, profile.headquarter);
    const newRecord = {
      id: Date.now(),
      journalPeriod,
      dayBlocks,
      totalUnits,
      calculationLog: dayLog,
      createdAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('taEntries') || '[]');
    localStorage.setItem('taEntries', JSON.stringify([...existing, newRecord]));
    onComplete(newRecord);
  };

  return (
    <div className="new-entry-container glass animate-fade-in">
      <div className="entry-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={20} /> Dashboard</button>
        <h2>Create TA Journal</h2>
      </div>

      {/* Period Selection */}
      <div className="period-section premium-card glass">
        <label><Calendar size={16} /> Journal Period</label>
        <div className="period-inputs">
          <select value={journalPeriod.month} onChange={e => setJournalPeriod({...journalPeriod, month: e.target.value})}>
            {months.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={journalPeriod.year} onChange={e => setJournalPeriod({...journalPeriod, year: e.target.value})}>
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Entry Blocks */}
      <div className="blocks-list">
        {dayBlocks.map((block, bIdx) => (
          <div key={block.id} className="day-block premium-card glass">
            <div className="block-header">
              <input 
                type="date" 
                className="date-input" 
                value={block.date} 
                onChange={e => setDayBlocks(dayBlocks.map(b => b.id === block.id ? {...b, date: e.target.value} : b))}
              />
              <input 
                type="text" 
                placeholder="Object of Journey (e.g. Unusual at KM 45)" 
                className="obj-input"
                value={block.objectOfJourney}
                onChange={e => setDayBlocks(dayBlocks.map(b => b.id === block.id ? {...b, objectOfJourney: e.target.value} : b))}
              />
              <button className="delete-btn" onClick={() => removeBlock(block.id)}><Trash2 size={18} /></button>
            </div>

            <div className="legs-list">
              {block.legs.map((leg, lIdx) => (
                <div key={leg.id} className="leg-row">
                  <div className="leg-station-group">
                    <div className="input-with-icon"><MapPin size={14} /><input type="text" placeholder="From" value={leg.fromStation} onChange={e => updateLeg(block.id, leg.id, 'fromStation', e.target.value)} /></div>
                    <span>→</span>
                    <div className="input-with-icon"><MapPin size={14} /><input type="text" placeholder="To" value={leg.toStation} onChange={e => updateLeg(block.id, leg.id, 'toStation', e.target.value)} /></div>
                  </div>
                  
                  <div className="leg-time-group">
                    <div className="input-with-icon"><Clock size={14} /><input type="time" value={leg.depTime} onChange={e => updateLeg(block.id, leg.id, 'depTime', e.target.value)} /></div>
                    <div className="input-with-icon"><Clock size={14} /><input type="time" value={leg.arrTime} onChange={e => updateLeg(block.id, leg.id, 'arrTime', e.target.value)} /></div>
                  </div>

                  <div className="leg-train-group">
                    <div className="input-with-icon"><TrainIcon size={14} /><input type="text" placeholder="Train No" value={leg.trainNo} onChange={e => updateLeg(block.id, leg.id, 'trainNo', e.target.value)} /></div>
                  </div>
                </div>
              ))}
              <button className="add-leg-btn" onClick={() => addLeg(block.id)}><Plus size={14} /> Add Another Leg (Return / Multi)</button>
            </div>
          </div>
        ))}
      </div>

      <div className="entry-footer">
        <button className="premium-btn secondary-glow" onClick={addBlock}><Plus size={20} /> Add New Date</button>
        <button className="premium-btn primary-glow" onClick={handleSaveAll}><Save size={20} /> Finish & Generate Journal</button>
      </div>
    </div>
  );
};

export default NewTAEntry;
