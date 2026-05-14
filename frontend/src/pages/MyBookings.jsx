import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5001/api';

const TIME_SLOTS = [
  '06:00 AM to 07:00 AM', '07:00 AM to 08:00 AM', '08:00 AM to 09:00 AM',
  '09:00 AM to 10:00 AM', '10:00 AM to 11:00 AM', '11:00 AM to 12:00 PM',
  '12:00 PM to 01:00 PM', '01:00 PM to 02:00 PM', '02:00 PM to 03:00 PM',
  '03:00 PM to 04:00 PM', '04:00 PM to 05:00 PM', '05:00 PM to 06:00 PM',
  '06:00 PM to 07:00 PM', '07:00 PM to 08:00 PM', '08:00 PM to 09:00 PM',
  '09:00 PM to 10:00 PM', '10:00 PM to 11:00 PM',
];

export default function MyBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('06:00 AM to 07:00 AM');

  useEffect(() => {
    if (token) {
      axios.get(`${API}/bookings/mine`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(res => { 
        const bookingData = Array.isArray(res.data) ? res.data : (res.data.bookings || []);
        setBookings(bookingData); 
        setLoading(false); 
      })
       .catch(() => setLoading(false));
    }
  }, [token]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.put(`${API}/bookings/cancel/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(prev => prev.map(b =>
        b._id === id ? { ...b, status: 'cancelled' } : b
      ));
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  const handleReschedule = async (id) => {
    try {
      const res = await axios.put(`${API}/bookings/reschedule/${id}`, 
        { newDate, newTimeSlot: newSlot },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(prev => prev.map(b => b._id === id ? { ...res.data, turf_id: b.turf_id } : b));
      setRescheduleId(null);
      alert('Rescheduled successfully! ✅');
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to reschedule');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem', minHeight: '80vh' }}>
      <h2 style={{ marginBottom: '0.5rem', fontWeight: '800' }}>My Bookings</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem', fontWeight: '500' }}>Manage your upcoming and past turf experiences</p>

      {loading && <p style={{ color: '#666' }}>Loading...</p>}
      {!loading && bookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟️</div>
          <p style={{ color: '#64748b', fontWeight: '700', fontSize: '1.1rem' }}>No bookings yet.</p>
          <button onClick={() => window.location.href='/explore'} style={{ marginTop: '1.5rem', padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#1ebe74', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Explore Venues</button>
        </div>
      )}

      {bookings.map(b => (
        <div key={b._id} style={{
          background: 'white', borderRadius: '20px', padding: '1.5rem',
          marginBottom: '1.5rem', border: '1.5px solid #f1f5f9',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{b.turf_id?.name}</h3>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '6px' }}>{b.turf_id?.sport}</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 📍 {b.turf_id?.location}, {b.turf_id?.city}
              </p>
              <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Date</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#111' }}>{b.date}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Time Slot</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#111' }}>{b.time_slot}</div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '900', color: '#1ebe74', fontSize: '1.4rem' }}>₹{b.total_price}</div>
                <span style={{
                  display: 'inline-block', marginTop: '6px',
                  padding: '4px 14px', borderRadius: '20px',
                  fontSize: '0.75rem', fontWeight: '800',
                  background: b.status === 'confirmed' ? '#f0fdf4' : '#fff1f2',
                  color: b.status === 'confirmed' ? '#166534' : '#be123c',
                  border: `1.5px solid ${b.status === 'confirmed' ? '#dcfce7' : '#fee2e2'}`,
                }}>
                  {b.status.toUpperCase()}
                </span>
              </div>

              {b.status === 'confirmed' && rescheduleId !== b._id && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => { setRescheduleId(b._id); setNewDate(b.date); setNewSlot(b.time_slot); }} 
                    style={btnStyle}
                  >Reschedule</button>
                  <button 
                    onClick={() => handleCancel(b._id)} 
                    style={{ ...btnStyle, color: '#ef4444', borderColor: '#fee2e2' }}
                  >Cancel</button>
                </div>
              )}
            </div>
          </div>

          {rescheduleId === b._id && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1.5px dashed #f1f5f9' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>New Date</label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={inputStyle} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label style={labelStyle}>New Time Slot</label>
                  <select value={newSlot} onChange={e => setNewSlot(e.target.value)} style={inputStyle}>
                    {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                <button onClick={() => handleReschedule(b._id)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#1ebe74', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Confirm Postpone / Prepone</button>
                <button onClick={() => setRescheduleId(null)} style={{ padding: '12px 20px', borderRadius: '10px', border: '1.5px solid #f1f5f9', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Back</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const btnStyle = {
  background: 'white', border: '1.5px solid #f1f5f9', color: '#64748b',
  padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
  fontSize: '0.85rem', fontWeight: '800', transition: '0.2s all'
};

const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #f1f5f9', fontSize: '0.9rem', fontWeight: '700', outline: 'none' };

