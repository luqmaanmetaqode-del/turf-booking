import { useState } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Calendar as CalIcon, Download, Plus, 
  MoreVertical, Eye, ChevronLeft, ChevronRight, X as XIcon,
  Clock, IndianRupee, CheckCircle, Phone
} from 'lucide-react';

const API = 'https://turfx.metaqode.co.in/api';

export default function PartnerBookings({ data, onCreateClick, token }) {
  const [activeTab, setActiveTab] = useState('All Bookings');
  const [search, setSearch] = useState('');
  const [actionMenu, setActionMenu] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const bookings = data?.bookings || [];
  const today = new Date().toISOString().split('T')[0];

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking? The slot will be freed.')) return;
    setCancellingId(bookingId);
    try {
      await axios.put(`${API}/owner/bookings/cancel/${bookingId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotice({ type: 'success', text: 'Booking cancelled successfully.' });
      // Trigger parent refresh if available
      data.bookings = data.bookings.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b);
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.msg || 'Failed to cancel booking.' });
    } finally {
      setCancellingId(null);
      setActionMenu(null);
    }
  };

  const filteredByTab = bookings.filter(b => {
    if (activeTab === 'Upcoming') return b.date >= today && b.status === 'confirmed';
    if (activeTab === 'Today') return b.date === today;
    if (activeTab === 'Completed') return b.status === 'completed';
    if (activeTab === 'Cancelled') return b.status === 'cancelled';
    return true; // All Bookings
  });

  const upcomingBookings = bookings.filter(b => b.date >= today && b.status === 'confirmed');
  const upcomingRevenue = upcomingBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const upcomingHours = upcomingBookings.length;

  const finalBookings = filteredByTab.filter(b => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (b.turf_id?.name || '').toLowerCase().includes(q) ||
      (b.user_id?.name || '').toLowerCase().includes(q) ||
      (b.user_id?.phone || '').includes(q) ||
      b._id.toLowerCase().includes(q)
    );
  });

  const tabs = [
    { label: 'All Bookings', count: bookings.length },
    { label: 'Upcoming', count: bookings.filter(b => b.date >= today && b.status === 'confirmed').length },
    { label: 'Today', count: bookings.filter(b => b.date === today).length },
    { label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
    { label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
  ];

  const stats = [
    { label: 'Total Bookings', value: bookings.length, sub: 'Lifetime', icon: <CalIcon size={20} />, color: '#3b82f6' },
    { label: 'Upcoming', value: tabs[1].count, sub: 'Active', icon: <Clock size={20} />, color: '#f59e0b' },
    { label: 'Today', value: tabs[2].count, sub: 'Scheduled', icon: <CalIcon size={20} />, color: '#1ebe74' },
    { label: 'Completed', value: tabs[3].count, sub: 'History', icon: <CheckCircle size={20} />, color: '#10b981' },
    { label: 'Cancelled', value: tabs[4].count, sub: 'Lost', icon: <XIcon size={20} />, color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
      {/* LEFT SIDE - LIST & FILTERS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
           <div style={{ display: 'flex', gap: '2rem', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '10px' }}>
            {tabs.map((t) => (
              <div 
                key={t.label} 
                onClick={() => setActiveTab(t.label)}
                style={{ 
                  fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                  color: activeTab === t.label ? '#1ebe74' : '#64748b',
                  position: 'relative', padding: '0 5px', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {t.label} <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{t.count}</span>
                {activeTab === t.label && <div style={{ position: 'absolute', bottom: '-11.5px', left: 0, width: '100%', height: '3px', background: '#1ebe74', borderRadius: '10px' }} />}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button onClick={() => window.open(`http://localhost:5001/api/exports/bookings/csv`, '_blank')} style={btnSecondary}><Download size={18} /> Export</button>
          </div>
        </div>

        {/* STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
           {stats.map((s, i) => (
             <div key={i} style={statCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}10`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.icon}
                   </div>
                   <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>{s.label}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111' }}>{s.value}</div>
                   </div>
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8' }}>{s.sub}</div>
             </div>
           ))}
        </div>

        {notice && (
          <div style={{ marginBottom: '1.5rem', padding: '12px 16px', borderRadius: '12px', border: `1.5px solid ${notice.type === 'success' ? '#bbf7d0' : '#fecaca'}`, background: notice.type === 'success' ? '#f0fdf4' : '#fff1f2', color: notice.type === 'success' ? '#166534' : '#991b1b', fontWeight: '700', fontSize: '0.9rem' }}>
            {notice.text}
          </div>
        )}

        {/* SEARCH & FILTERS */}
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: '16px', border: '1.5px solid #f1f5f9', display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
           <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search by booking ID, customer name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '12px', border: '1.5px solid #f1f5f9', fontSize: '0.9rem', outline: 'none' }} 
              />
           </div>
           <select style={filterSelect}><option>All Venues</option></select>
           <select style={filterSelect}><option>All Sports</option></select>
           <div style={filterBtn}><CalIcon size={18} /> Select Date</div>
           <div style={filterBtn}><Filter size={18} /> Filters</div>
        </div>

        {/* TABLE */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #f1f5f9', overflow: 'hidden' }}>
           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' }}>
                 <tr>
                    <th style={thStyle}>Booking ID</th>
                    <th style={thStyle}>Customer Name</th>
                    <th style={thStyle}>Mobile Number</th>
                    <th style={thStyle}>Venue</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Time</th>
                    <th style={thStyle}>Price</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {finalBookings.length > 0 ? finalBookings.map((b, i) => (
                   <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>

                      {/* BOOKING ID */}
                      <td style={tdStyle}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '0.85rem', color: '#1ebe74', background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px' }}>
                          #{b._id.slice(-6).toUpperCase()}
                        </span>
                      </td>

                      {/* CUSTOMER NAME */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800', flexShrink: 0 }}>
                            {(b.user_id?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#111' }}>
                            {b.user_id?.name || 'Unknown User'}
                          </div>
                        </div>
                      </td>

                      {/* MOBILE NUMBER */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} style={{ color: '#94a3b8' }} />
                          <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#374151' }}>
                            {b.user_id?.phone ? `+91 ${b.user_id.phone}` : '—'}
                          </span>
                        </div>
                      </td>

                      {/* VENUE */}
                      <td style={tdStyle}>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#111' }}>{b.turf_id?.name || '—'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '500', marginTop: '2px' }}>{b.turf_id?.sport || 'Multi-sport'}</div>
                      </td>

                      {/* DATE */}
                      <td style={tdStyle}>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#111' }}>
                          {b.date ? new Date(b.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </div>
                      </td>

                      {/* TIME */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} style={{ color: '#94a3b8' }} />
                          <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#374151' }}>{b.time_slot || '—'}</span>
                        </div>
                      </td>

                      {/* PRICE */}
                      <td style={tdStyle}>
                        <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#111' }}>₹{(b.total_price || 0).toLocaleString()}</div>
                      </td>

                      {/* STATUS */}
                      <td style={tdStyle}>
                        <StatusBadge status={b.status} />
                      </td>

                      {/* ACTIONS */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                          <button onClick={() => setActionMenu(actionMenu === b._id ? null : b._id)}
                            style={{ ...iconBtn, background: actionMenu === b._id ? '#f1f5f9' : 'none' }}>
                            <MoreVertical size={16} />
                          </button>
                          {actionMenu === b._id && (
                            <div style={dropdownStyle}>
                              <div onClick={() => { setActionMenu(null); }} style={dropdownItem}>
                                <Eye size={14} /> View Details
                              </div>
                              {b.status === 'confirmed' && (
                                <div onClick={() => handleCancelBooking(b._id)} style={{ ...dropdownItem, color: '#ef4444' }}>
                                  <XIcon size={14} /> {cancellingId === b._id ? 'Cancelling...' : 'Cancel Booking'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan="9" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>
                       No bookings found
                     </td>
                   </tr>
                 )}
              </tbody>
           </table>
           <div style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Showing {finalBookings.length} of {bookings.length} bookings</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                 <button style={pageBtn}><ChevronLeft size={16} /></button>
                 <button style={{ ...pageBtn, background: '#1ebe74', color: 'white' }}>1</button>
                 <button style={pageBtn}><ChevronRight size={16} /></button>
              </div>
           </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
         {/* MINI CALENDAR */}
         <div style={sidebarCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h3 style={{ fontWeight: '800', fontSize: '0.9rem' }}>Booking Calendar</h3>
            </div>
            <div style={{ textAlign: 'center', fontWeight: '800', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '800' }}>{d}</div>)}
               {(() => {
                 const now = new Date();
                 const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
                 const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                 const todayDate = now.getDate();
                 const bookingDates = new Set(bookings.filter(b => b.status !== 'cancelled').map(b => {
                   const d = new Date(b.date);
                   if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) return d.getDate();
                   return null;
                 }).filter(Boolean));
                 const cells = [];
                 for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);
                 for (let d = 1; d <= daysInMonth; d++) {
                   cells.push(
                     <div key={d} style={{ 
                       fontSize: '0.75rem', fontWeight: '700', padding: '8px 0', borderRadius: '8px',
                       background: d === todayDate ? '#1ebe74' : bookingDates.has(d) ? '#f0fdf4' : 'transparent',
                       color: d === todayDate ? 'white' : '#111',
                       cursor: 'pointer', position: 'relative'
                     }}>
                       {d}
                       {bookingDates.has(d) && d !== todayDate && <div style={{ width: '4px', height: '4px', background: '#1ebe74', borderRadius: '50%', margin: '2px auto 0' }}></div>}
                     </div>
                   );
                 }
                 return cells;
               })()}
            </div>
         </div>

         {/* TODAY'S SUMMARY */}
         <div style={sidebarCard}>
            <h3 style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Upcoming Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
               <SummaryItem icon={<CalIcon size={16} />} label="Total Bookings" value={tabs[1].count.toString()} />
               <SummaryItem icon={<IndianRupee size={16} />} label="Total Revenue" value={`₹${upcomingRevenue.toLocaleString()}`} color="#1ebe74" />
               <SummaryItem icon={<Clock size={16} />} label="Total Hours Booked" value={`${upcomingHours}h`} />
            </div>
            <button style={{ width: '100%', marginTop: '1.5rem', padding: '12px', borderRadius: '10px', border: '1.5px solid #f1f5f9', background: 'white', color: '#1ebe74', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
               View All Bookings
            </button>
         </div>

         {/* DID YOU KNOW */}
         <div style={{ ...sidebarCard, background: '#f0fdf4', border: '1.5px solid #dcfce7' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#166534', marginBottom: '8px' }}>Did you know?</h4>
            <p style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '600', lineHeight: 1.5 }}>
               You have **{tabs[2].count} bookings** scheduled for today. 
               <span onClick={() => setActiveTab('Today')} style={{ display: 'block', marginTop: '8px', textDecoration: 'underline', cursor: 'pointer' }}>View today's schedule →</span>
            </p>
         </div>
      </div>
    </div>
  );
}

function SummaryItem({ icon, label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
       <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8fafc', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
       </div>
       <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8' }}>{label}</div>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: color || '#111' }}>{value}</div>
       </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase();
  const map = {
    'confirmed': { bg: '#f0fdf4', text: '#16a34a' },
    'pending':   { bg: '#fffbeb', text: '#d97706' },
    'completed': { bg: '#f1f5f9', text: '#475569' },
    'cancelled': { bg: '#fef2f2', text: '#dc2626' },
    'checked-in':{ bg: '#eff6ff', text: '#2563eb' },
  };
  const style = map[s] || map['pending'];
  return (
    <span style={{ 
      background: style.bg, color: style.text, padding: '5px 12px', borderRadius: '8px', 
      fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px'
    }}>{status || 'Pending'}</span>
  );
}

const btnPrimary = {
  background: '#1ebe74', color: 'white', border: 'none', padding: '10px 20px',
  borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', display: 'flex',
  alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(30,190,116,0.2)'
};

const btnSecondary = {
  background: 'white', color: '#111', border: '1.5px solid #f1f5f9', padding: '10px 20px',
  borderRadius: '12px', fontWeight: '700', fontSize: '0.85rem', display: 'flex',
  alignItems: 'center', gap: '8px', cursor: 'pointer'
};

const statCard = {
  background: 'white', padding: '1rem', borderRadius: '16px', border: '1.5px solid #f1f5f9'
};

const filterSelect = {
  padding: '10px 15px', borderRadius: '12px', border: '1.5px solid #f1f5f9',
  fontSize: '0.85rem', fontWeight: '600', color: '#111', outline: 'none'
};

const filterBtn = {
  display: 'flex', alignItems: 'center', gap: '8px', padding: '0 15px',
  borderRadius: '12px', border: '1.5px solid #f1f5f9', fontSize: '0.85rem',
  fontWeight: '600', color: '#64748b', cursor: 'pointer'
};

const thStyle = {
  textAlign: 'left', padding: '1.2rem', fontSize: '0.75rem', fontWeight: '800',
  color: '#94a3b8', textTransform: 'uppercase'
};

const tdStyle = {
  padding: '1.2rem', verticalAlign: 'middle'
};

const iconBtn = {
  background: 'none', border: '1.5px solid #f1f5f9', padding: '6px',
  borderRadius: '8px', color: '#64748b', cursor: 'pointer'
};

const pageBtn = {
  width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #f1f5f9',
  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer'
};

const sidebarCard = {
  background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1.5px solid #f1f5f9'
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
