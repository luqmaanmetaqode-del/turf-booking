import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5001/api';
const SPORTS = ['Football', 'Cricket', 'Tennis'];

export default function Checkout() {
  const { state } = useLocation();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const turf = state?.turf;
  const [date, setDate] = useState(state?.date || new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState([]); // Array of selected slots
  const [sport, setSport] = useState(turf?.sport || 'Football');
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const turfId = turf?._id || turf?.id;

  // Generate hourly slots (6 AM to 11 PM)
  const generateHourlySlots = () => {
    const hourlySlots = [];
    for (let hour = 6; hour < 23; hour++) {
      const startHour = hour > 12 ? hour - 12 : (hour === 12 ? 12 : hour);
      const endHour = (hour + 1) > 12 ? (hour + 1) - 12 : (hour + 1 === 12 ? 12 : hour + 1);
      const startPeriod = hour >= 12 ? 'PM' : 'AM';
      const endPeriod = (hour + 1) >= 12 ? 'PM' : 'AM';
      
      const slotLabel = `${startHour}-${endHour} ${startPeriod === endPeriod ? endPeriod : startPeriod + '-' + endPeriod}`;
      hourlySlots.push({
        label: slotLabel,
        value: slotLabel,
        hour: hour
      });
    }
    return hourlySlots;
  };

  const hourlySlots = generateHourlySlots();

  // PRICE CALCULATIONS (per slot)
  const pricePerSlot = turf ? turf.price_per_hour : 0;
  const numberOfSlots = selectedSlots.length;
  const courtPrice = pricePerSlot * numberOfSlots;
  const platformFee = 25; // Flat Rs. 25 platform fee
  const gstOnFee = Math.round(platformFee * 0.18); // 18% GST on platform fee
  const totalConvenienceFee = platformFee + gstOnFee;
  const totalAmount = courtPrice + totalConvenienceFee;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!turfId || !date) return;

    setSlotsLoading(true);
    axios.get(`${API}/bookings/booked-slots/${turfId}/${date}`)
      .then(res => {
        const slots = res.data.bookedSlots || [];
        setBookedSlots(slots);
      })
      .catch(err => {
        console.error(err);
        setBookedSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [turfId, date]);

  const isSlotBooked = (slotLabel) => {
    return bookedSlots.includes(slotLabel);
  };

  const toggleSlotSelection = (slotLabel) => {
    if (selectedSlots.includes(slotLabel)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slotLabel));
    } else {
      setSelectedSlots([...selectedSlots, slotLabel]);
    }
  };

  const handleSendRequest = async () => {
    if (!token) return navigate('/login');
    if (selectedSlots.length === 0) return alert('Please select at least one time slot');
    
    setLoading(true);
    try {
      await axios.post(`${API}/bookings/request`, {
        turf_id: turfId,
        date,
        time_slots: selectedSlots,
        total_price: totalAmount,
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setRequestSent(true);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.msg || err.message;
      alert(`Failed to send booking request: ${errorMsg}`);
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

  if (requestSent) return (
    <div style={{ textAlign:'center', padding:'4rem 2rem', maxWidth:'500px', margin:'0 auto', minHeight:'calc(100vh - 72px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'#fff7ed', border: '2px solid #f59e0b', display:'flex', alignItems:'center', justifyContent:'center', color:'#f59e0b', fontSize:'2.5rem', marginBottom:'1.5rem', fontWeight: '900' }}>⏳</div>
      <h2 style={{ color:'#111', marginBottom:'0.75rem', fontSize:'2.2rem', fontWeight: '900' }}>Request Sent!</h2>
      <p style={{ color:'#111', fontWeight: '700', fontSize: '1.1rem', marginBottom:'0.5rem' }}>{turf.name}</p>
      <p style={{ color:'#666', marginBottom:'1.5rem', fontWeight: '500' }}>{date} | {selectedSlots.join(', ')}</p>
      <div style={{ background:'#f8f9fa', borderRadius:'20px', padding:'1.5rem 2.5rem', marginTop:'1rem', marginBottom:'2.5rem', border:'1.5px solid #eee' }}>
        <div style={{ fontSize:'0.9rem', color:'#888', fontWeight: '600', marginBottom: '4px' }}>Waiting for Partner Approval</div>
        <div style={{ fontSize:'1.2rem', fontWeight:'800', color:'#f59e0b', marginTop: '8px' }}>You'll be notified once approved</div>
      </div>
      <p style={{ color:'#666', fontSize:'0.9rem', marginBottom:'2rem', textAlign:'center', lineHeight: 1.6 }}>
        The venue partner will review your request. Once approved, you'll receive a notification to complete the payment.
      </p>
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
              <label style={{ fontWeight:'800', color:'#111', fontSize: '1rem' }}>Select Time Slot</label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
              {slotsLoading ? (
                <div style={{ gridColumn: '1 / -1', color: '#94a3b8', fontWeight: '700', textAlign: 'center', padding: '1rem' }}>Loading slots...</div>
              ) : (
                hourlySlots.map((slot) => {
                  const isBooked = isSlotBooked(slot.label);
                  const isSelected = selectedSlots.includes(slot.label);
                  return (
                    <button
                      key={slot.value}
                      disabled={isBooked}
                      onClick={() => !isBooked && toggleSlotSelection(slot.label)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '12px',
                        border: `2px solid ${isSelected ? '#1ebe74' : isBooked ? '#f5f5f5' : '#eee'}`,
                        background: isSelected ? '#1ebe74' : isBooked ? '#f5f5f5' : 'white',
                        color: isSelected ? 'white' : isBooked ? '#ccc' : '#111',
                        cursor: isBooked ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? '800' : '600',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                        position: 'relative'
                      }}
                    >
                      {isSelected && <span style={{ position: 'absolute', top: '4px', right: '6px', fontSize: '0.9rem' }}>✓</span>}
                      {slot.label}
                      {isBooked && (
                        <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: '600' }}>
                          Booked
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            {selectedSlots.length > 0 && (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #dcfce7', borderRadius: '12px', padding: '12px 16px', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#166534', marginBottom: '6px' }}>
                  Selected Slots ({selectedSlots.length})
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#15803d' }}>
                  {selectedSlots.join(', ')}
                </div>
              </div>
            )}
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
              <div style={{ fontSize:'0.9rem', color:'#64748b', fontWeight: '600' }}>{date}</div>
              {selectedSlots.length > 0 && (
                <div style={{ fontSize:'0.85rem', color:'#1ebe74', fontWeight: '700', marginTop: '8px' }}>
                  {selectedSlots.join(', ')}
                </div>
              )}
            </div>
          </div>

          <div style={{ background:'white', borderRadius:'24px', padding:'2rem', border:'1px solid #eee', marginBottom:'1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize:'1.2rem', fontWeight:'900', marginBottom:'1.5rem', color: '#111' }}>Price Breakdown</h3>
            
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'14px', fontSize: '0.95rem' }}>
              <span style={{ color:'#64748b', fontWeight: '600' }}>Court Rental ({numberOfSlots} {numberOfSlots === 1 ? 'Slot' : 'Slots'})</span>
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

          <button onClick={handleSendRequest} disabled={loading || selectedSlots.length === 0} style={{
            width:'100%', background: loading || selectedSlots.length === 0 ? '#94d3b2' : '#1ebe74',
            color:'white', border:'none', padding:'20px', borderRadius:'20px',
            cursor: loading || selectedSlots.length === 0 ? 'not-allowed' : 'pointer', fontWeight:'900', fontSize:'1.15rem',
            boxShadow:'0 10px 30px rgba(30,190,116,0.3)', transition:'all 0.3s',
          }}>{loading ? 'Sending Request...' : selectedSlots.length === 0 ? 'Select Slots' : 'Send Booking Request'}</button>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
             <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '700' }}>Partner will review your request</p>
          </div>
        </div>
      </div>
    </div>
  );
}
