import React, { useState, useEffect } from 'react';
import { Plus, LayoutDashboard, Calendar, TrendingUp, History, User, MapPin } from 'lucide-react';
import { calculateDayBlocksTA } from '../utils/taCalculator';
import './Dashboard.css';

const Dashboard = ({ profile, onNewRecord, onViewHistory }) => {
  const [records, setRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('taEntries');
    if (saved) {
      const data = JSON.parse(saved);
      setRecords(data);
      aggregateChartData(data);
    }
  }, []);

  const aggregateChartData = (data) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentYear = now.getFullYear();

    const monthlyStats = Array(12).fill(0).map((_, i) => ({
      month: months[i],
      amount: 0,
      units: 0,
      fullMonth: i,
      year: currentYear
    }));

    data.forEach(record => {
      const monthIdx = months.indexOf(record.journalPeriod.month);
      if (monthIdx !== -1 && parseInt(record.journalPeriod.year) === currentYear) {
        const units = record.totalUnits || 0;
        const rate = parseFloat(profile?.baseTaRate) || 500;
        monthlyStats[monthIdx].amount += Math.round(units * rate);
        monthlyStats[monthIdx].units += units;
      }
    });

    setChartData(monthlyStats);
    
    // Default select current or last active month
    const currentMonthIdx = now.getMonth();
    setSelectedMonth(monthlyStats[currentMonthIdx]);
  };

  const maxAmount = Math.max(...chartData.map(d => d.amount), 5000);

  return (
    <div className="dashboard-container animate-fade-in">
      {/* 1. Header & Quick Actions */}
      <div className="dashboard-header">
        <div className="header-info">
          <h1>Railway TA Dashboard</h1>
          <p>Welcome back, <strong>{profile?.fullName}</strong>. Track your movements & claims.</p>
        </div>
        <button className="premium-btn primary-glow" onClick={onNewRecord}>
          <Plus size={20} /> New TA Journal
        </button>
      </div>

      {/* 2. Analytics Section */}
      <div className="analytics-grid">
        {/* Chart Card */}
        <div className="premium-card chart-card glass">
          <div className="card-header">
            <h3><TrendingUp size={18} /> TA Earnings Chart ({new Date().getFullYear()})</h3>
            <span className="badge">Click bar to view summary</span>
          </div>
          
          <div className="chart-wrapper">
            <div className="chart-bars">
              {chartData.map((d, i) => (
                <div 
                  key={i} 
                  className={`chart-bar-container ${selectedMonth?.month === d.month ? 'active' : ''}`}
                  onClick={() => setSelectedMonth(d)}
                >
                  <div className="bar-tooltip">
                    ₹{d.amount.toLocaleString()}<br/>{d.units.toFixed(1)} Units
                  </div>
                  <div 
                    className="bar-fill"
                    style={{ height: `${(d.amount / maxAmount) * 100}%` }}
                  ></div>
                  <span className="month-label">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Month Summary */}
        <div className="premium-card summary-card glass highlighted">
          <div className="card-header">
            <h3><Calendar size={18} /> {selectedMonth?.month} {selectedMonth?.year} Summary</h3>
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Units</span>
              <span className="stat-value text-glow">{selectedMonth?.units.toFixed(1) || "0.0"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Amount</span>
              <span className="stat-value text-primary">₹{(selectedMonth?.amount || 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="rate-info">
            <p>Calculated at ₹{profile?.baseTaRate}/day rate (Level {profile?.payScale})</p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Shortcuts */}
      <div className="shortcut-grid">
        <div className="shortcut-card glass" onClick={onViewHistory}>
          <History size={32} />
          <div>
            <h4>View Records</h4>
            <p>Manage all past journals</p>
          </div>
        </div>
        <div className="shortcut-card glass" onClick={() => (window.location.hash = "#profile")}>
          <User size={32} />
          <div>
            <h4>Profile Settings</h4>
            <p>Update Personal Details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
