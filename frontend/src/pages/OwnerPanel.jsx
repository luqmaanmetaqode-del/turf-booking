import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function OwnerPanel() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('bookings');
  const [form, setForm] = useState({
    name: '', location: '', price_per_hour: '',
    sport: 'Football', amenities: '', lat: '', lng: '',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    axios.get(`${API}/owner/dashboard`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(res => setData(res.data))
     .catch(err => console.error(err));
  }, [token]);

  const handleAddTurf = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/turfs`, {
        ...form,
        price_per_hour: parseInt(form.price_per_hour),
        amenities: form.amenities.split(',').map(a => a.trim()),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMsg('✅ Turf added successfully!');
      setForm({ name: '', location: '', price_per_hour: '', sport: 'Football', amenities: '', lat: '', lng: '' });
    } catch (err) {
      setMsg('❌ Failed to add turf.');
    }
  };

  const tabStyle = (t) => ({
    padding: '10px 24px', borderRadius: '10px', border: 'none',
    background: tab === t ? '#1ebe74' : '#f0f0f0',
    color: tab === t ? 'white' : '#333',
    cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem',
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Owner Dashboard 🏟️</h2>

      {data && (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {[
            { label: 'Total Turfs', value: data.turfs?.length || 0 },
            { label: 'Total Bookings', value: data.bookings?.length || 0 },
            { label: 'Total Earnings', value: `₹${data.totalEarnings || 0}` },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '16px', padding: '1.5rem 2rem',
              border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              flex: 1, minWidth: '150px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1ebe74' }}>{s.value}</div>
              <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <button style={tabStyle('bookings')} onClick={() => setTab('bookings')}>📋 Bookings</button>
        <button style={tabStyle('add')} onClick={() => setTab('add')}>➕ Add Turf</button>
      </div>

      {tab === 'bookings' && data && (
        <div>
          {data.bookings?.length === 0 && <p style={{ color: '#999' }}>No bookings yet.</p>}
          {data.bookings?.map(b => (
            <div key={b.id} style={{
              background: 'white', borderRadius: '12px', padding: '1.25rem',
              marginBottom: '1rem', border: '1px solid #eee',
              display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
            }}>
              <div>
                <strong>{b.Turf?.name}</strong>
                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>
                  👤 {b.User?.name} — {b.User?.email}
                </p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>📅 {b.date} at {b.time_slot}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', color: '#1ebe74' }}>₹{b.total_price}</div>
                <span style={{
                  display: 'inline-block', marginTop: '6px',
                  padding: '3px 12px', borderRadius: '20px',
                  fontSize: '0.8rem', fontWeight: '600',
                  background: b.status === 'confirmed' ? '#f0fdf4' : '#fff1f2',
                  color: b.status === 'confirmed' ? '#166534' : '#be123c',
                }}>{b.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'add' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #eee' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Add New Turf</h3>
          {msg && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px',
              background: msg.includes('✅') ? '#f0fdf4' : '#fff1f2',
              color: msg.includes('✅') ? '#166534' : '#be123c',
              marginBottom: '1.5rem', fontSize: '0.9rem',
            }}>{msg}</div>
          )}
          <form onSubmit={handleAddTurf}>
            {[
              { label: 'Turf Name', key: 'name', placeholder: 'e.g. Green Arena' },
              { label: 'Location', key: 'location', placeholder: 'e.g. Koramangala, Bengaluru' },
              { label: 'Price per Hour (₹)', key: 'price_per_hour', placeholder: 'e.g. 800', type: 'number' },
              { label: 'Amenities (comma separated)', key: 'amenities', placeholder: 'Floodlights, Parking, Washroom' },
              { label: 'Latitude', key: 'lat', placeholder: 'e.g. 12.9352' },
              { label: 'Longitude', key: 'lng', placeholder: 'e.g. 77.6245' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>{field.label}</label>
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  required
                  style={{
                    width: '100%', padding: '10px 14px',
                    borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem',
                  }}
                />
              </div>
            ))}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Sport</label>
              <select
                value={form.sport}
                onChange={e => setForm({ ...form, sport: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }}
              >
                {['Football', 'Cricket', 'Badminton', 'Tennis', 'Basketball'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <button type="submit" style={{
              width: '100%', background: '#1ebe74', color: 'white',
              border: 'none', padding: '13px', borderRadius: '12px',
              cursor: 'pointer', fontWeight: '700', fontSize: '1rem',
            }}>Add Turf 🏟️</button>
          </form>
        </div>
      )}
    </div>
  );
}