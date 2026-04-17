import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ProfileSetup from './components/ProfileSetup';
import NewTAEntry from './components/NewTAEntry';
import PreviousRecords from './components/PreviousRecords';
import TAJournalPDF from './components/TAJournalPDF';
import { Train, LayoutDashboard, History, User, PlusCircle } from 'lucide-react';
import './index.css';

function App() {
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedProfile = localStorage.getItem('railwayProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      // Smart startup: If profile exists, go directly to dashboard
      setView('dashboard');
    } else {
      setView('profile');
    }
    setLoading(false);

    // Listen to hash changes for quick navigation
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'profile', 'history', 'new'].includes(hash)) {
        setView(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleProfileSave = (data) => {
    setProfile(data);
    localStorage.setItem('railwayProfile', JSON.stringify(data));
    setView('dashboard');
    window.location.hash = 'dashboard';
  };

  const handleOpenPreview = (record) => {
    setSelectedRecord(record);
    setView('preview');
  };

  if (loading) return <div className="loading-screen">Preparing Station...</div>;

  return (
    <div className="app-shell flex flex-col md:flex-row min-h-screen">
      {/* Sidebar Navigation */}
      <nav className="no-print sidebar glass m-4 md:mr-0">
        <div className="sidebar-logo">
          <Train size={32} />
          <span>TA Journal</span>
        </div>
        
        <div className="nav-items">
          <button 
            className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setView('dashboard'); window.location.hash = 'dashboard'; }}
          >
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-btn ${view === 'new' ? 'active' : ''}`}
            onClick={() => { setView('new'); window.location.hash = 'new'; }}
          >
            <PlusCircle size={20} /> <span>New Entry</span>
          </button>

          <button 
            className={`nav-btn ${view === 'history' ? 'active' : ''}`}
            onClick={() => { setView('history'); window.location.hash = 'history'; }}
          >
            <History size={20} /> <span>Records</span>
          </button>

          <button 
            className={`nav-btn ${view === 'profile' ? 'active' : ''}`}
            onClick={() => { setView('profile'); window.location.hash = 'profile'; }}
          >
            <User size={20} /> <span>Profile</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <p>Railway TA Assistant v2.1</p>
        </div>
      </nav>

      {/* Main viewport */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto main-content">
        {view === 'profile' && (
          <ProfileSetup initialData={profile} onSave={handleProfileSave} />
        )}
        
        {view === 'dashboard' && profile && (
          <Dashboard 
            profile={profile} 
            onNewRecord={() => setView('new')} 
            onViewHistory={() => setView('history')} 
          />
        )}

        {view === 'new' && profile && (
          <NewTAEntry 
            profile={profile} 
            onBack={() => setView('dashboard')} 
            onComplete={handleOpenPreview} 
          />
        )}

        {view === 'history' && profile && (
          <PreviousRecords 
            profile={profile} 
            onOpen={handleOpenPreview} 
          />
        )}

        {view === 'preview' && profile && selectedRecord && (
          <TAJournalPDF 
            record={selectedRecord} 
            profile={profile} 
            onBack={() => setView('history')} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
