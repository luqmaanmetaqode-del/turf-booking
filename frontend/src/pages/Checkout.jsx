import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SlotPicker from '../components/SlotPicker';

const API = 'http://localhost:5001/api';
const SPORTS = ['Football', 'Cricket', 'Tennis'];

export default function Checkout() {
  const { state } = useLocation();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const turf = state?.turf;
  const [date, setDate] = useState(state?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('6:00 AM');
  const [duration, setDuration] = useState(1);
  const [sport, setSport] = useState(turf?.sport || 'Football');
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showFeeBreakup, setShowFeeBreakup] = useState(false);
  const turfId = turf?._id || turf?.id;

  // PRICE CALCULATIONS
  const courtPrice = turf ? turf.price_per_hour * duration : 0;
  const platformFee = 25; // Flat Rs. 25 platform fee
  const gstOnFee = Math.round(platformFee * 0.18); // 18% GST on platform fee
  const totalConvenienceFee = platformFee + gstOnFee;
  const totalAmount = courtPrice + totalConvenienceFee;
  
  // Split payment logic (if any) or just full payment
  const advancePayable = totalAmount; // For simplicity in this flow, but can be partial

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!turfId || !date) return;

    setSlotsLoading(true);
    axios.get(`${API}/slots/${turfId}/${date}`)
      .then(res => {
        const nextSlots = res.data || [];
        setSlots(nextSlots);
        const currentSlot = nextSlots.find(slot => slot.time === startTime);
        if (!currentSlot?.available) {
          const firstAvailable = nextSlots.find(slot => slot.available);
          if (firstAvailable) setStartTime(firstAvailable.time);
        }
      })
      .catch(err => {
        console.error(err);
        setSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [turfId, date, startTime]);

  const getEndTime = () => {
    const match = startTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return '';

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const endDate = new Date();
    endDate.setHours(hours + duration, minutes, 0, 0);
    return endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleBook = async () => {
    if (!token) return navigate('/login');
    if (!startTime) return alert('Please select an available time slot');
    setLoading(true);
    try {
      const orderRes = await axios.post(`${API}/bookings/razorpay-order`, 
        { amount: totalAmount }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { id: order_id, amount, currency, demo } = orderRes.data;

      if (demo) {
        // Bypass Razorpay for demo
        await axios.post(`${API}/bookings`, {
          turf_id: turfId, date,
          time_slot: startTime,
          total_price: totalAmount,
          payment_id: "demo_payment_" + Date.now(),
        }, { headers: { Authorization: `Bearer ${token}` } });
        setBooked(true);
        setLoading(false);
        return;
      }

      const options = {
        key: 'rzp_test_placeholder',
        amount,
        currency,
        name: 'TurfX',
        description: `Booking for ${turf.name}`,
        order_id,
        handler: async (response) => {
          try {
            await axios.post(`${API}/bookings`, {
              turf_id: turfId, date,
              time_slot: startTime,
              total_price: totalAmount,
              payment_id: response.razorpay_payment_id,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setBooked(true);
          } catch (err) {
            alert('Payment successful but booking failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name,
          contact: user?.phone,
        },
        theme: { color: '#1ebe74' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.msg || err.message;
      alert(`Failed to initiate payment: ${errorMsg}`);
    }
    setLoading(false);
  };

  if (!turf) return (
    <div style={{ textAlign:'center', padding:'6rem 2rem', minHeight:'calc(100vh - 72px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <h2 style={{ color:'#111', marginBottom:'1rem', fontSize: '2rem', fontWeight: '900' }}>No Venue Selected</h2>
      <p style={{ color:'#666', marginBottom:'2rem', fontWeight: '500' }}>Please choose a turf to book first</p>
      <button onClick={() => navigate('/explore')} style={{ background:'#1ebe74', color:'white', border:'none', padding:'14px 40px', borderRadius:'14px', cursor:'pointer', fontWeight:'800', fontSize: '1rem' }}>Browse Venues</button>
    </div>
  );

  if (booked) return (
    <div style={{ textAlign:'center', padding:'4rem 2rem', maxWidth:'500px', margin:'0 auto', minHeight:'calc(100vh - 72px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'#f0fdf4', border: '2px solid #1ebe74', display:'flex', alignItems:'center', justifyContent:'center', color:'#1ebe74', fontSize:'2.5rem', marginBottom:'1.5rem', fontWeight: '900' }}>V</div>
      <h2 style={{ color:'#111', marginBottom:'0.75rem', fontSize:'2.2rem', fontWeight: '900' }}>Booking Confirmed</h2>
      <p style={{ color:'#111', fontWeight: '700', fontSize: '1.1rem', marginBottom:'0.5rem' }}>{turf.name}</p>
      <p style={{ color:'#666', marginBottom:'1.5rem', fontWeight: '500' }}>{date} | {startTime} to {getEndTime()}</p>
      <div style={{ background:'#f8f9fa', borderRadius:'20px', padding:'1.5rem 2.5rem', marginTop:'1rem', marginBottom:'2.5rem', border:'1.5px solid #eee' }}>
        <div style={{ fontSize:'0.9rem', color:'#888', fontWeight: '600', marginBottom: '4px' }}>Total Amount Paid</div>
        <div style={{ fontSize:'1.8rem', fontWeight:'900', color:'#1ebe74' }}>INR {totalAmount.toLocaleString()}</div>
      </div>
      <button onClick={() => navigate('/my-bookings')} style={{ background:'#1ebe74', color:'white', border:'none', padding:'16px 48px', borderRadius:'16px', cursor:'pointer', fontWeight:'800', fontSize: '1.05rem', boxShadow: '0 8px 25px rgba(30,190,116,0.3)' }}>View My Bookings</button>
    </div>
  );

  const inputStyle = { padding:'12px 16px', borderRadius:'12px', border:'1.5px solid #eee', fontSize:'0.95rem', fontWeight:'700', cursor:'pointer', minWidth:'180px', outline:'none', background: 'white' };
  const rowStyle = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' };

  return (
    <div style={{ background:'#fafafa', minHeight:'calc(100vh - 72px)' }}>
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'3rem 2rem', display:'grid', gridTemplateColumns:'1fr 400px', gap:'3rem', alignItems:'start' }}>
        {/* LEFT */}
        <div>
          <div style={{ background:'white', borderRadius:'24px', padding:'2rem', border:'1px solid #eee', marginBottom:'2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <h2 style={{ fontSize:'1.8rem', fontWeight:'900', color:'#111', marginBottom:'8px', letterSpacing: '-0.5px' }}>{turf.name}</h2>
                <p style={{ color:'#64748b', fontSize:'1rem', fontWeight: '500' }}>{turf.location}, {turf.city}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8f9fa', padding: '6px 14px', borderRadius: '12px', border: '1px solid #eee' }}>
                 <span style={{ fontWeight: '800', fontSize: '1rem', color: '#111' }}>{turf.rating} Rating</span>
              </div>
            </div>
          </div>

          <div style={{ background:'white', borderRadius:'24px', padding:'2rem', border:'1px solid #eee', marginBottom:'2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={rowStyle}>
              <label style={{ fontWeight:'800', color:'#111', fontSize: '1rem' }}>Activity</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {SPORTS.map(s => (
                  <button 
                    key={s}
                    onClick={() => setSport(s)}
                    style={{
                      padding: '10px 18px', borderRadius: '12px',
                      border: `1.5px solid ${sport === s ? '#1ebe74' : '#eee'}`,
                      background: sport === s ? '#f0fdf4' : 'white',
                      color: sport === s ? '#1ebe74' : '#64748b',
                      fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer',
                      transition: '0.2s all', outline: 'none'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div style={rowStyle}>
              <label style={{ fontWeight:'800', color:'#111', fontSize: '1rem' }}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={inputStyle} />
            </div>
            <div style={rowStyle}>
              <label style={{ fontWeight:'800', color:'#111', fontSize: '1rem' }}>Start Time</label>
              <div style={{ width: '100%', maxWidth: '520px' }}>
                {slotsLoading ? (
                  <div style={{ color: '#94a3b8', fontWeight: '700', textAlign: 'right' }}>Loading slots...</div>
                ) : (
                  <SlotPicker slots={slots} selected={startTime} onSelect={setStartTime} />
                )}
              </div>
            </div>
            <div style={{...rowStyle, marginBottom:0}}>
              <label style={{ fontWeight:'800', color:'#111', fontSize: '1rem' }}>Duration</label>
              <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                <button onClick={() => setDuration(Math.max(1,duration-1))} style={{ width:'36px', height:'36px', borderRadius:'12px', border:'none', background:'#f8f9fa', color:'#111', fontSize:'1.4rem', cursor:'pointer', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', border: '1.5px solid #eee' }}>-</button>
                <span style={{ fontSize:'1.1rem', fontWeight:'800', minWidth:'50px', textAlign:'center' }}>{duration} Hr</span>
                <button onClick={() => setDuration(Math.min(5,duration+1))} style={{ width:'36px', height:'36px', borderRadius:'12px', border:'none', background:'#1ebe74', color:'white', fontSize:'1.4rem', cursor:'pointer', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
              </div>
            </div>
          </div>

          <div style={{ background:'white', borderRadius:'24px', padding:'2rem', border:'1px solid #eee' }}>
            <h3 style={{ fontSize:'1.1rem', fontWeight:'800', marginBottom:'1rem', color: '#111' }}>Policies</h3>
            <p style={{ fontSize:'0.9rem', color:'#666', lineHeight:1.7, marginBottom:'1.5rem', fontWeight: '500' }}>Cancellations allowed up to 2 hours before the slot. A 15% fee applies for late cancellations.</p>
            <h3 style={{ fontSize:'1.1rem', fontWeight:'800', marginBottom:'1rem', color: '#111' }}>Venue Rules</h3>
            <ul style={{ fontSize:'0.9rem', color:'#666', lineHeight:2, paddingLeft:'1.25rem', margin:0, fontWeight: '500' }}>
              <li>Please wear appropriate sports gear.</li>
              <li>Outside food and drinks are not allowed.</li>
              <li>Arrive 10 minutes early for check-in.</li>
            </ul>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ position:'sticky', top:'100px' }}>
          <div style={{ background:'white', borderRadius:'24px', padding:'2rem', border:'1px solid #eee', marginBottom:'1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize:'1.2rem', fontWeight:'900', color: '#111', marginBottom: '1.5rem' }}>Booking Summary</h3>
            <div style={{ background:'#f8fafc', borderRadius:'16px', padding:'1.25rem', border:'1.5px solid #f1f5f9' }}>
              <div style={{ fontWeight:'800', fontSize:'1rem', marginBottom:'8px', color: '#111' }}>{turf.name}</div>
              <div style={{ fontSize:'0.9rem', color:'#64748b', fontWeight: '600' }}>{date} | {startTime} to {getEndTime()}</div>
            </div>
          </div>

          <div style={{ background:'white', borderRadius:'24px', padding:'2rem', border:'1px solid #eee', marginBottom:'1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize:'1.2rem', fontWeight:'900', marginBottom:'1.5rem', color: '#111' }}>Price Breakdown</h3>
            
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'14px', fontSize: '0.95rem' }}>
              <span style={{ color:'#64748b', fontWeight: '600' }}>Court Rental ({duration} Hr)</span>
              <span style={{ fontWeight:'800', color: '#111' }}>INR {courtPrice.toLocaleString()}</span>
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'14px', fontSize: '0.95rem' }}>
              <span style={{ color:'#64748b', fontWeight: '600' }}>Platform Fee</span>
              <span style={{ fontWeight:'800', color: '#111' }}>INR {platformFee.toLocaleString()}</span>
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'14px', fontSize: '0.95rem' }}>
              <span style={{ color:'#64748b', fontWeight: '600' }}>GST (18%)</span>
              <span style={{ fontWeight:'800', color: '#111' }}>INR {gstOnFee.toLocaleString()}</span>
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'16px', borderTop:'1.5px solid #f1f5f9', marginTop: '8px' }}>
              <span style={{ fontWeight:'900', fontSize:'1.2rem', color: '#111' }}>Total Amount</span>
              <span style={{ fontWeight:'900', fontSize:'1.2rem', color: '#1ebe74' }}>INR {totalAmount.toLocaleString()}</span>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '12px', fontWeight: '600', textAlign: 'center' }}>
               GST is applicable only on platform fees as per government norms.
            </p>
          </div>

          <button onClick={handleBook} disabled={loading} style={{
            width:'100%', background: loading ? '#94d3b2' : '#1ebe74',
            color:'white', border:'none', padding:'20px', borderRadius:'20px',
            cursor: loading ? 'not-allowed' : 'pointer', fontWeight:'900', fontSize:'1.15rem',
            boxShadow:'0 10px 30px rgba(30,190,116,0.3)', transition:'all 0.3s',
          }}>{loading ? 'Processing...' : `Pay INR ${totalAmount.toLocaleString()}`}</button>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
             <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '700' }}>Secure Transaction via Razorpay</p>
          </div>
        </div>
      </div>
    </div>
  );
}
