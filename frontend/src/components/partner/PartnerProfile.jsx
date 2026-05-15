import { useState } from 'react';
import axios from 'axios';
import {
  User, Mail, Phone, MapPin, Calendar,
  Globe, Shield, Bell, Lock, Edit2, Check, X,
  TrendingUp, Wallet, Star, Calendar as CalIcon,
  ChevronRight, Camera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = 'https://turfx.metaqode.co.in/api';

export default function PartnerProfile({ user, data }) {
  const { token, login } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const confirmedBookings = data?.bookings?.filter(b => b.status === 'confirmed') || [];
  const totalEarnings = confirmedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const walletBalance = Math.round(totalEarnings * 0.95);
  const primaryTurf = data?.turfs?.[0];
  const initials = (user?.name || 'Partner Owner').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not available';

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await axios.put(`${API}/owner/profile`, { name: editName, email: editEmail }, { headers: { Authorization: `Bearer ${token}` } });
      login(res.data, token);
      setEditMode(false);
    } catch (err) {
      setSaveError(err.response?.data?.msg || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const accountStats = [
    { label: 'Total Bookings', value: (data?.totalBookings || 0).toString(), sub: 'View all bookings', icon: <CalIcon size={20} />, color: '#1ebe74' },
    { label: 'Total Earnings', value: `Rs.${totalEarnings.toLocaleString()}`, sub: 'View payouts', icon: <TrendingUp size={20} />, color: '#3b82f6' },
    { label: 'Wallet Balance', value: `Rs.${walletBalance.toLocaleString()}`, sub: 'Go to wallet', icon: <Wallet size={20} />, color: '#8b5cf6' },
    { label: 'Partner Rating', value: (data?.avgRating || 0).toString(), sub: 'View reviews', icon: <Star size={20} />, color: '#f59e0b' },
  ];

  const personalInfo = [
    { label: 'Full Name', value: user?.name || 'Partner Owner', icon: <User size={18} /> },
    { label: 'Email Address', value: user?.email || 'Not added', icon: <Mail size={18} /> },
    { label: 'Phone Number', value: user?.phone ? `+91 ${user.phone}` : 'Not added', icon: <Phone size={18} /> },
    { label: 'Member Since', value: memberSince, icon: <Calendar size={18} /> },
    { label: 'Preferred Language', value: 'English', icon: <Globe size={18} /> },
    { label: 'Primary Venue', value: primaryTurf ? `${primaryTurf.location}, ${primaryTurf.city}` : 'No venue added', icon: <MapPin size={18} /> },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111', marginBottom: '8px' }}>My Profile</h2>
          <p style={{ color: '#64748b', fontWeight: '500' }}>Manage your personal information and account settings.</p>
        </div>
        {editMode ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSaveProfile} disabled={saving} style={btnPrimary}><Check size={18} /> {saving ? 'Saving...' : 'Save Profile'}</button>
            <button onClick={() => { setEditMode(false); setSaveError(''); }} style={btnSecondary}><X size={18} /> Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditMode(true)} style={btnSecondary}><Edit2 size={18} /> Edit Profile</button>
        )}
      </div>

      {saveError && (
        <div style={{ marginBottom: '1.5rem', padding: '12px 16px', borderRadius: '12px', background: '#fff1f2', border: '1.5px solid #fecdd3', color: '#be123c', fontWeight: '700', fontSize: '0.9rem' }}>
          {saveError}
        </div>
      )}

      <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1.5px solid #f1f5f9', display: 'flex', gap: '3rem', alignItems: 'center', marginBottom: '2rem' }}>
         <div style={{ position: 'relative' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#111', color: '#1ebe74', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '900', border: '4px solid #f8fafc' }}>
               {initials}
            </div>
            <button style={{ position: 'absolute', bottom: '5px', right: '5px', width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
               <Camera size={18} />
            </button>
         </div>

         <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px' }}>
               {editMode ? (
                 <input value={editName} onChange={e => setEditName(e.target.value)} style={{ fontSize: '1.4rem', fontWeight: '800', padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none' }} />
               ) : (
                 <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>{user?.name || 'Partner Owner'}</h3>
               )}
               <span style={{ background: '#f0fdf4', color: '#1ebe74', fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={12} /> Verified Partner
               </span>
            </div>
            {editMode ? (
              <input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" placeholder="Business email" style={{ padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }} />
            ) : (
              <p style={{ color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                 <span>{user?.email || 'No email added'}</span>
                 <span>|</span>
                 <span>{user?.phone ? `+91 ${user.phone}` : 'No phone added'}</span>
              </p>
            )}
            <p style={{ color: '#64748b', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
               <MapPin size={16} /> {primaryTurf ? `${primaryTurf.city}, ${primaryTurf.location}` : 'No venue added'}
            </p>
         </div>

         <div style={{ display: 'flex', gap: '3rem', borderLeft: '1.5px solid #f1f5f9', paddingLeft: '3rem' }}>
            <div>
               <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Partner ID</div>
               <div style={{ fontWeight: '800', color: '#111' }}>{(user?.id || user?._id)?.slice(-8)?.toUpperCase() || 'NEW'} <Edit2 size={12} cursor="pointer" /></div>
               <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginTop: '12px', marginBottom: '4px' }}>Member Since</div>
               <div style={{ fontWeight: '800', color: '#111' }}>{memberSince}</div>
            </div>
            <div>
               <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
               <div style={{ fontWeight: '800', color: '#1ebe74' }}>Active</div>
               <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginTop: '12px', marginBottom: '4px' }}>Last Login</div>
               <div style={{ fontWeight: '800', color: '#111' }}>Current session</div>
            </div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
         <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '2rem' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
               {personalInfo.map((info, i) => (
                 <div key={i}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                       {info.icon} {info.label}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111' }}>{info.value}</div>
                 </div>
               ))}
            </div>
         </div>

         <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '2rem' }}>Account Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
               {accountStats.map((s, i) => (
                 <div key={i} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1.5px solid #f1f5f9' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid #f1f5f9' }}>
                       {s.icon}
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#111', marginBottom: '4px' }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '10px' }}>{s.label}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1ebe74', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       {s.sub} <ChevronRight size={12} />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
         <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '2rem' }}>Security & Preferences</h3>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
               { title: 'Change Password', sub: 'Update your password regularly', icon: <Lock size={20} />, color: '#1ebe74' },
               { title: 'Two-Factor Authentication', sub: 'Add an extra layer of security', icon: <Shield size={20} />, color: '#3b82f6', badge: 'Enabled' },
               { title: 'Notification Preferences', sub: 'Manage how you receive alerts', icon: <Bell size={20} />, color: '#f59e0b' },
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem', borderRadius: '20px', border: '1.5px solid #f1f5f9', cursor: 'pointer', transition: '0.2s' }}>
                 <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${p.color}10`, color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.icon}
                 </div>
                 <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#111' }}>{p.title}</span>
                       {p.badge && <span style={{ fontSize: '0.65rem', fontWeight: '800', background: '#f0fdf4', color: '#1ebe74', padding: '2px 8px', borderRadius: '6px' }}>{p.badge}</span>}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>{p.sub}</p>
                 </div>
                 <ChevronRight size={18} style={{ color: '#94a3b8' }} />
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}

const btnSecondary = { background: 'white', color: '#111', border: '1.5px solid #f1f5f9', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' };
const btnPrimary = { background: '#1ebe74', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(30,190,116,0.2)' };
