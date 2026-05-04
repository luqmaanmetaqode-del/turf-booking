import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BookingModal({ turf, onClose }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState('');

  const handleProceed = () => {
    if (!token) return navigate('/login');
    if (!date) return alert('Please select a date');
    navigate('/checkout', { state: { turf, date } });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999,
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        width: '400px',
        maxWidth: '95vw',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem' }}>{turf.name}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            fontSize: '1.5rem', cursor: 'pointer', color: '#666',
          }}>×</button>
        </div>

        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          📍 {turf.location} &nbsp;|&nbsp; ₹{turf.price_per_hour}/hr
        </p>

        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
          Select Date
        </label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          style={{
            width: '100%', padding: '10px',
            borderRadius: '10px', border: '1px solid #ddd',
            marginBottom: '1.5rem', fontSize: '1rem',
          }}
        />

        <button onClick={handleProceed} style={{
          width: '100%', background: '#1ebe74',
          color: 'white', border: 'none',
          padding: '12px', borderRadius: '10px',
          cursor: 'pointer', fontSize: '1rem', fontWeight: '600',
        }}>
          Select Time Slot →
        </button>
      </div>
    </div>
  );
}