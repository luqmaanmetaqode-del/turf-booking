import { useState } from 'react';
import axios from 'axios';
import { Search, Filter, Plus, Eye, Edit2, MoreVertical, ChevronDown, ChevronUp, MapPin, Phone, Mail, Clock, Star, TrendingUp, Users, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = 'https://turfx.metaqode.co.in/api';

export default function PartnerVenues({ data, onAddClick, onTabChange }) {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [expandedVenue, setExpandedVenue] = useState(null);
  const [activeTab, setActiveTab] = useState('All Venues');
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState(null);

  const handleSeedVenues = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await axios.get(`${API}/turfs/seed`, { headers: { Authorization: `Bearer ${token}` } });
      setSeedMessage({ type: 'success', text: res.data.msg });
      // Refresh the page after 2 seconds
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setSeedMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to seed venues' });
    } finally {
      setSeeding(false);
    }
  };

  const totalSports = new Set(data?.turfs?.map(t => t.sport).filter(Boolean)).size || 1;
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = data?.bookings?.filter(b => b.date === today && b.status !== 'cancelled') || [];
  const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

  const stats = [
    { label: 'Total Venues', value: data?.turfs?.length || 0, icon: <MapPin size={20} />, sub: 'Active venues', color: '#1ebe74' },
    { label: 'Total Sports', value: totalSports, icon: <TrendingUp size={20} />, sub: 'Across all venues', color: '#3b82f6' },
    { label: 'Today Bookings', value: todayBookings.length, icon: <Calendar size={20} />, sub: 'Today', color: '#f59e0b' },
    { label: 'Today Revenue', value: `₹${todayRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, sub: 'Today', color: '#8b5cf6' },
  ];

  const filteredTurfs = data?.turfs?.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* SEED MESSAGE */}
      {seedMessage && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '12px 16px',
          borderRadius: '12px',
          border: `1.5px solid ${seedMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          background: seedMessage.type === 'success' ? '#f0fdf4' : '#fff1f2',
          color: seedMessage.type === 'success' ? '#166534' : '#991b1b',
          fontWeight: '700',
          fontSize: '0.9rem'
        }}>
          {seedMessage.text}
        </div>
      )}

      {/* NO VENUES STATE */}
      {(!data?.turfs || data.turfs.length === 0) && (
        <div style={{ background: 'white', borderRadius: '24px', border: '1.5px solid #f1f5f9', padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏟️</div>
          <h3 style={{ fontWeight: '800', fontSize: '1.5rem', color: '#111', marginBottom: '12px' }}>No Venues Yet</h3>
          <p style={{ color: '#64748b', fontWeight: '500', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Get started by adding your first venue or load sample venues to test the platform.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={onAddClick} style={{ 
              background: '#1ebe74', color: 'white', border: 'none', padding: '14px 28px', 
              borderRadius: '12px', fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px',
              cursor: 'pointer', boxShadow: '0 8px 20px rgba(30,190,116,0.2)'
            }}>
              <Plus size={20} /> Add Your First Venue
            </button>
            <button onClick={handleSeedVenues} disabled={seeding} style={{ 
              background: 'white', color: '#111', border: '1.5px solid #f1f5f9', padding: '14px 28px', 
              borderRadius: '12px', fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px',
              cursor: seeding ? 'not-allowed' : 'pointer', opacity: seeding ? 0.6 : 1
            }}>
              {seeding ? 'Loading...' : 'Load Sample Venues'}
            </button>
          </div>
        </div>
      )}

      {/* SHOW NORMAL UI ONLY IF VENUES EXIST */}
      {data?.turfs && data.turfs.length > 0 && (
        <>
      {/* TABS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '10px' }}>
          {['All Venues', 'Add New Venue'].map((tab, i) => (
            <div key={tab} onClick={() => { if (tab === 'Add New Venue') onAddClick(); else setActiveTab(tab); }} style={{ 
              fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer',
              color: activeTab === tab ? '#1ebe74' : '#64748b',
              position: 'relative', padding: '0 10px'
            }}>
              {tab}
              {activeTab === tab && <div style={{ position: 'absolute', bottom: '-11.5px', left: 0, width: '100%', height: '3px', background: '#1ebe74', borderRadius: '10px' }} />}
            </div>
          ))}
        </div>
        <button onClick={onAddClick} style={{ 
          background: '#1ebe74', color: 'white', border: 'none', padding: '12px 24px', 
          borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer', transition: '0.3s', boxShadow: '0 8px 20px rgba(30,190,116,0.2)'
        }}>
          <Plus size={20} /> Add New Venue
        </button>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ 
            background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1.5px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: '20px'
          }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '16px', background: `${s.color}10`, color: s.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1ebe74', marginTop: '2px' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH & FILTER */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search venues by name or location" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '16px 20px 16px 56px', borderRadius: '16px', border: '1.5px solid #f1f5f9',
              fontSize: '0.95rem', fontWeight: '600', outline: 'none', transition: '0.2s',
              boxSizing: 'border-box'
            }} 
          />
        </div>
        <div style={filterBtnStyle}>All Status <ChevronDown size={18} /></div>
        <div style={filterBtnStyle}><Filter size={18} /> Filters <ChevronDown size={18} /></div>
      </div>

      {/* VENUE LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredTurfs?.map((turf) => (
          <VenueCard 
            key={turf._id} 
            turf={turf} 
            isExpanded={expandedVenue === turf._id}
            onToggle={() => setExpandedVenue(expandedVenue === turf._id ? null : turf._id)}
            bookings={data?.bookings}
            token={token}
            onTabChange={onTabChange}
          />
        ))}
      </div>
        </>
      )}
    </div>
  );
}

function VenueCard({ turf, isExpanded, onToggle, bookings, token, onTabChange }) {
  const [actionMenu, setActionMenu] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: turf.name, location: turf.location, city: turf.city, price_per_hour: turf.price_per_hour, description: turf.description || '' });
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [isActive, setIsActive] = useState(turf.isActive !== false);

  const turfBookings = bookings?.filter(b => b.turf_id?._id === turf._id || b.turf_id === turf._id) || [];
  const today = new Date().toISOString().split('T')[0];
  const todayB = turfBookings.filter(b => b.date === today && b.status !== 'cancelled');
  const todayRev = todayB.reduce((sum, b) => sum + (b.total_price || 0), 0);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyB = turfBookings.filter(b => new Date(b.date) >= sevenDaysAgo && b.status !== 'cancelled');
  const weeklyRev = weeklyB.reduce((sum, b) => sum + (b.total_price || 0), 0);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/turfs/${turf._id}`, editData, { headers: { Authorization: `Bearer ${token}` } });
      setEditMode(false);
      // Refresh will happen via parent's onChange
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update venue');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    setStatusUpdating(true);
    try {
      const res = await axios.patch(`${API}/turfs/${turf._id}/status`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setIsActive(res.data.isActive);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
      setActionMenu(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${turf.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await axios.delete(`${API}/turfs/${turf._id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert('Venue deleted successfully');
      window.location.reload(); // Refresh to show updated list
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete venue');
    } finally {
      setActionMenu(null);
    }
  };

  return (
    <div style={{ 
      background: 'white', borderRadius: '24px', border: '1.5px solid #f1f5f9', overflow: 'hidden',
      transition: '0.3s all'
    }}>
      <div style={{ padding: '1.5rem', display: 'flex', gap: '2rem' }}>
        <div style={{ width: '280px', height: '180px', borderRadius: '16px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          <img src={turf.images?.[0] || '/images/football.png'} alt={turf.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: '12px', left: '12px', background: isActive ? '#1ebe74' : '#64748b', color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>{isActive ? 'ACTIVE' : 'INACTIVE'}</div>
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.7rem', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={12} /> {turf.images?.length || 0}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} style={editInputStyle} placeholder="Venue name" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} style={editInputStyle} placeholder="Location" />
                <input value={editData.city} onChange={e => setEditData({...editData, city: e.target.value})} style={editInputStyle} placeholder="City" />
              </div>
              <input type="number" value={editData.price_per_hour} onChange={e => setEditData({...editData, price_per_hour: e.target.value})} style={editInputStyle} placeholder="Price per hour" />
              <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} style={{ ...editInputStyle, height: '80px', resize: 'none' }} placeholder="Description" />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSaveEdit} disabled={saving} style={{ ...actionBtnStyle, background: '#1ebe74', color: 'white', border: 'none' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
                <button onClick={() => setEditMode(false)} style={actionBtnStyle}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111' }}>{turf.name}</h3>
                <span style={{ background: '#f0fdf4', color: '#1ebe74', fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '6px' }}>Featured</span>
              </div>
              <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                <MapPin size={16} /> {turf.location}, {turf.city}
              </p>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                <span style={tagStyle}>{turf.sport || 'Multi-sport'}</span>
                {turf.amenities?.slice(0, 2).map((a, i) => (
                  <span key={i} style={{ ...tagStyle, background: '#f1f5f9', color: '#64748b' }}>{a}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
               <button onClick={() => window.open(`/turf/${turf._id}`, '_blank')} style={actionBtnStyle}><Eye size={16} /> View</button>
               <button onClick={() => setEditMode(true)} style={actionBtnStyle}><Edit2 size={16} /> Edit</button>
               <button onClick={() => setActionMenu(actionMenu ? null : turf._id)} style={actionBtnStyle}><MoreVertical size={16} /></button>
               
               {actionMenu === turf._id && (
                 <div style={dropdownStyle}>
                   <div onClick={() => { onTabChange?.('slots'); setActionMenu(null); }} style={dropdownItem}>Manage Slots</div>
                   <div onClick={() => { onTabChange?.('pricing'); setActionMenu(null); }} style={dropdownItem}>Update Pricing</div>
                   <div onClick={handleToggleStatus} style={{ ...dropdownItem, color: isActive ? '#ef4444' : '#1ebe74' }}>
                     {statusUpdating ? 'Updating...' : isActive ? 'Mark as Inactive' : 'Mark as Active'}
                   </div>
                   <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }}></div>
                   <div onClick={handleDelete} style={{ ...dropdownItem, color: '#ef4444' }}>
                     Delete Venue
                   </div>
                 </div>
               )}

               <button onClick={onToggle} style={{ ...actionBtnStyle, background: isExpanded ? '#f1f5f9' : 'transparent' }}>
                 {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
               </button>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>
              <Clock size={16} /> Open {turf.openTime || '6:00 AM'} - {turf.closeTime || '11:00 PM'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111', fontSize: '0.85rem', fontWeight: '800' }}>
              <span style={{ color: '#64748b' }}>₹</span> {turf.price_per_hour?.toLocaleString()} <span style={{ color: '#64748b', fontWeight: '500' }}>per hour</span>
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div style={{ borderTop: '1.5px solid #f1f5f9', background: 'white' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '1.5rem 2rem', gap: '2rem' }}>
             <OverviewCard label="Today's Overview" stats={[
               { label: 'Bookings', value: todayB.length.toString(), icon: <Calendar size={14} /> },
               { label: 'Revenue', value: `₹${todayRev.toLocaleString()}`, icon: <TrendingUp size={14} />, color: '#1ebe74' },
             ]} />
             <OverviewCard label="Weekly Overview" stats={[
               { label: 'Bookings', value: weeklyB.length.toString(), icon: <Calendar size={14} /> },
               { label: 'Revenue', value: `₹${weeklyRev.toLocaleString()}`, icon: <TrendingUp size={14} />, color: '#1ebe74' },
             ]} />
             <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#111', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Venue Status</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isActive ? '#1ebe74' : '#64748b' }}></div>
                    <div>
                       <div style={{ fontSize: '0.9rem', fontWeight: '800', color: isActive ? '#1ebe74' : '#64748b' }}>{isActive ? 'Active' : 'Inactive'}</div>
                       <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>{isActive ? 'Listed on TurfX' : 'Hidden from search'}</div>
                    </div>
                  </div>
                  <div 
                    onClick={handleToggleStatus}
                    style={{ width: '44px', height: '24px', background: isActive ? '#1ebe74' : '#e2e8f0', borderRadius: '20px', padding: '2px', cursor: 'pointer', position: 'relative', transition: '0.3s' }}>
                    <div style={{ position: 'absolute', top: '2px', right: isActive ? '2px' : 'auto', left: isActive ? 'auto' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.3s' }}></div>
                  </div>
                </div>
             </div>
          </div>

          <div style={{ padding: '0 2rem 2rem' }}>
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '12px', marginBottom: '2rem' }}>
              {['Overview', 'Photos', 'Sports', 'Slots', 'Pricing', 'Amenities', 'Reviews', 'Bookings'].map((sub, i) => (
                <div key={sub} style={{ fontSize: '0.85rem', fontWeight: '700', color: i === 0 ? '#1ebe74' : '#64748b', cursor: 'pointer' }}>{sub}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <InfoItem label="Venue ID" value={`#${turf._id?.slice(-8)?.toUpperCase()}`} />
                  <InfoItem label="Created On" value={turf.createdAt ? new Date(turf.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'} />
                  <InfoItem label="Sport" value={turf.sport || 'Multi-sport'} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <InfoItem label="Surface Type" value={turf.surfaceType || 'Standard'} />
                  <InfoItem label="Venue Size" value={turf.venueSize || 'N/A'} />
                  <InfoItem label="Address" value={`${turf.location}, ${turf.city}`} />
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Description</div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', lineHeight: 1.6 }}>
                    {turf.description || turf.shortDescription || 'No description available.'}
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewCard({ label, stats }) {
  return (
    <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#111', marginBottom: '1.5rem', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {stats.map((s, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px' }}>
              {s.icon} {s.label}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: s.color || '#111' }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#111' }}>{value}</span>
    </div>
  );
}

const filterBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px',
  borderRadius: '16px', border: '1.5px solid #f1f5f9', background: 'white',
  fontSize: '0.9rem', fontWeight: '600', color: '#111', cursor: 'pointer'
};

const editInputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
  fontSize: '0.9rem', fontWeight: '600', outline: 'none', background: 'white', boxSizing: 'border-box'
};

const tagStyle = {
  background: '#f8fafc', border: '1.5px solid #f1f5f9', color: '#64748b',
  padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700'
};

const actionBtnStyle = {
  background: 'white', border: '1.5px solid #f1f5f9', padding: '8px 16px',
  borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', color: '#111',
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s'
};

const dropdownStyle = {
  position: 'absolute', top: '100%', right: 0, width: '180px',
  background: 'white', borderRadius: '12px', border: '1.5px solid #f1f5f9',
  boxShadow: '0 8px 30px rgba(0,0,0,0.08)', zIndex: 1000,
  padding: '8px', marginTop: '8px', overflow: 'hidden'
};

const dropdownItem = {
  padding: '10px 14px', fontSize: '0.85rem', fontWeight: '700', color: '#64748b',
  cursor: 'pointer', borderRadius: '8px', transition: '0.2s', display: 'flex',
  alignItems: 'center', gap: '10px'
};
