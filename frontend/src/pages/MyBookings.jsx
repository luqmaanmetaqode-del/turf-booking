import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function MyBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/bookings/mine`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(res => { setBookings(res.data); setLoading(false); })
     .catch(() => setLoading(false));
  }, [token]);

  const handleCancel = async (id) => {
    await axios.put(`${API}/bookings/cancel/${id}`, {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setBookings(prev => prev.map(b =>
      b.id === id ? { ...b, status: 'cancelled' } : b
    ));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>My Bookings</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Your upcoming and past bookings</p>

      {loading && <p style={{ color: '#666' }}>Loading...</p>}
      {!loading && bookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          <div style={{ fontSize: '3rem' }}>📭</div>
          <p style={{ marginTop: '1rem' }}>No bookings yet. Go book a turf!</p>
        </div>
      )}

      {bookings.map(b => (
        <div key={b.id} style={{
          background: 'white', borderRadius: '16px', padding: '1.5rem',
          marginBottom: '1rem', border: '1px solid #eee',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ marginBottom: '4px' }}>{b.Turf?.name}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>📍 {b.Turf?.location}</p>
              <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>
                📅 {b.date} &nbsp; 🕐 {b.time_slot}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', color: '#1ebe74', fontSize: '1.1rem' }}>₹{b.total_price}</div>
              <span style={{
                display: 'inline-block', marginTop: '6px',
                padding: '4px 12px', borderRadius: '20px',
                fontSize: '0.8rem', fontWeight: '600',
                background: b.status === 'confirmed' ? '#f0fdf4' : '#fff1f2',
                color: b.status === 'confirmed' ? '#166534' : '#be123c',
                border: `1px solid ${b.status === 'confirmed' ? '#d1fae5' : '#fecdd3'}`,
              }}>
                {b.status.toUpperCase()}
              </span>
              {b.status === 'confirmed' && (
                <div>
                  <button onClick={() => handleCancel(b.id)} style={{
                    marginTop: '8px', background: 'none',
                    border: '1px solid #ef4444', color: '#ef4444',
                    padding: '4px 14px', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '0.85rem',
                  }}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}