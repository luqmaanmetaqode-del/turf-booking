import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SlotPicker from '../components/SlotPicker';

const API = 'http://localhost:5000/api';

export default function Checkout() {
  const { state } = useLocation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const turf = state?.turf;
  const [date, setDate] = useState(state?.date || '');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    if (turf && date) {
      axios.get(`${API}/slots/${turf.id}/${date}`)
        .then(res => setSlots(res.data))
        .catch(err => console.error(err));
    }
  }, [turf, date]);

  const handleBook = async () => {
    if (!selectedSlot) return alert('Please select a time slot');
    try {
      await axios.post(`${API}/bookings`,
        {
          turf_id: turf.id,
          date,
          time_slot: selectedSlot,
          total_price: turf.price_per_hour,
          payment_id: 'PAY_' + Date.now(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBooked(true);
    } catch (err) {
      alert('Booking failed. Please try again.');
    }
  };

  if (!turf) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p>No turf selected.</p>
      <button onClick={() => navigate('/explore')} style={{
        marginTop: '1rem', background: '#1ebe74', color: 'white',
        border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer',
      }}>Browse Turfs</button>
    </div>
  );

  if (booked) return (
    <div style={{ textAlign: 'center', padding: '4rem', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
      <h2 style={{ color: '#1ebe74', marginBottom: '0.5rem' }}>Booking Confirmed!</h2>
      <p style={{ color: '#666', marginBottom: '0.5rem' }}>{turf.name}</p>
      <p style={{ color: '#666', marginBottom: '0.5rem' }}>📅 {date} at {selectedSlot}</p>
      <p style={{ color: '#1ebe74', fontWeight: '700', fontSize: '1.2rem', marginBottom: '2rem' }}>
        ₹{turf.price_per_hour} paid
      </p>
      <button onClick={() => navigate('/my-bookings')} style={{
        background: '#1ebe74', color: 'white', border: 'none',
        padding: '12px 32px', borderRadius: '12px',
        cursor: 'pointer', fontWeight: '700', fontSize: '1rem',
      }}>View My Bookings</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Complete Your Booking</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>{turf.name} · ₹{turf.price_per_hour}/hr</p>

      <div style={{
        background: 'white', borderRadius: '16px', padding: '1.5rem',
        border: '1px solid #eee', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.5rem',
      }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Select Date</label>
        <input
          type="date" value={date}
          onChange={e => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          style={{
            width: '100%', padding: '10px', borderRadius: '10px',
            border: '1px solid #ddd', marginBottom: '1.5rem', fontSize: '1rem',
          }}
        />
        <SlotPicker slots={slots} selected={selectedSlot} onSelect={setSelectedSlot} />
      </div>

      <div style={{
        background: '#f0fdf4', borderRadius: '12px',
        padding: '1rem 1.5rem', marginBottom: '1.5rem', border: '1px solid #d1fae5',
      }}>
        {[['Turf', turf.name], ['Date', date || '—'], ['Slot', selectedSlot || '—']].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ color: '#666' }}>{label}</span>
            <span>{val}</span>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: '12px', paddingTop: '12px',
          borderTop: '1px solid #d1fae5', fontWeight: '700', fontSize: '1.1rem',
        }}>
          <span>Total</span>
          <span style={{ color: '#1ebe74' }}>₹{turf.price_per_hour}</span>
        </div>
      </div>

      <button onClick={handleBook} style={{
        width: '100%', background: '#1ebe74', color: 'white',
        border: 'none', padding: '14px', borderRadius: '12px',
        cursor: 'pointer', fontWeight: '700', fontSize: '1.1rem',
      }}>Confirm Booking ✅</button>
    </div>
  );
}