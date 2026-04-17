import React, { useState } from 'react';
import { Save, User, MapPin, Briefcase, CreditCard, Hash, Calendar } from 'lucide-react';
import './ProfileSetup.css';

const ProfileSetup = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    designation: '',
    station: '',
    pfNumber: '',
    basicPay: '',
    level: '6',
    dept: '',
    appointmentDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="profile-setup animate-fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary">Service Profile</h2>
        <p className="text-text-muted">Enter your official details for S4 Journal forms.</p>
      </div>

      <form onSubmit={handleSubmit} className="premium-card grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="input-group">
          <label><User size={16} /> Full Name</label>
          <input 
            type="text" name="name" value={formData.name} onChange={handleChange}
            placeholder="e.g. Ronak Pawar" required 
          />
        </div>

        <div className="input-group">
          <label><Briefcase size={16} /> Designation</label>
          <input 
            type="text" name="designation" value={formData.designation} onChange={handleChange}
            placeholder="e.g. SSE (P.WAY)" required 
          />
        </div>

        <div className="input-group">
          <label><MapPin size={16} /> Working Station / HQ</label>
          <input 
            type="text" name="station" value={formData.station} onChange={handleChange}
            placeholder="e.g. INDB" required 
          />
        </div>

        <div className="input-group">
          <label><Hash size={16} /> PF/NPS Number</label>
          <input 
            type="text" name="pfNumber" value={formData.pfNumber} onChange={handleChange}
            placeholder="e.g. 508138XXXXX" required 
          />
        </div>

        <div className="input-group">
          <label><CreditCard size={16} /> Basic Pay (7th CPC)</label>
          <input 
            type="number" name="basicPay" value={formData.basicPay} onChange={handleChange}
            placeholder="e.g. 47600" required 
          />
        </div>

        <div className="input-group">
          <label><LayoutDashboard size={16} /> Pay Level</label>
          <select name="level" value={formData.level} onChange={handleChange}>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(l => (
              <option key={l} value={l}>Level {l}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label><Briefcase size={16} /> Department</label>
          <input 
            type="text" name="dept" value={formData.dept} onChange={handleChange}
            placeholder="e.g. Civil Engineering" 
          />
        </div>

        <div className="input-group">
          <label><Calendar size={16} /> Appointment Date</label>
          <input 
            type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange}
          />
        </div>

        <div className="col-span-1 md:col-span-2 mt-4">
          <button type="submit" className="premium-btn w-full md:w-auto">
            <Save size={20} /> Save Official Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSetup;
