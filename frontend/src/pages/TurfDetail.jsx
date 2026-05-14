import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';
const API = 'http://localhost:5001/api';

export default function TurfDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [turf, setTurf] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    axios.get(`${API}/turfs/${id}`).then(res => setTurf(res.data)).catch(console.error);
    axios.get(`${API}/reviews/${id}`).then(res => {
      // Handle both array and object response
      const reviewData = Array.isArray(res.data) ? res.data : (res.data.reviews || []);
      setReviews(reviewData);
    }).catch(console.error);
  }, [id]);

  const handleReview = async () => {
    if (!token) return navigate('/login');
    try {
      await axios.post(`${API}/reviews`, { turf_id:id, rating, comment }, { headers:{ Authorization:`Bearer ${token}` } });
      setComment('');
      const res = await axios.get(`${API}/reviews/${id}`);
      const reviewData = Array.isArray(res.data) ? res.data : (res.data.reviews || []);
      setReviews(reviewData);
    } catch (err) { console.error(err); }
  };

  if (!turf) return <div style={{ textAlign:'center', padding:'10rem', color:'#94a3b8', fontWeight: '700', fontSize: '1.2rem' }}>LOADING...</div>;

  return (
    <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'4rem 2rem' }}>
      {/* Hero Banner */}
      <div style={{
        borderRadius:'32px', height:'450px',
        marginBottom:'3.5rem', position:'relative', overflow:'hidden',
        background: '#f8fafc',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
      }}>
        {turf.images && turf.images.length > 0 ? (
          <img 
            src={turf.images[0]} 
            alt={turf.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '2rem', fontWeight: '900' }}>
            PREMIUM VENUE
          </div>
        )}
        <div style={{
          position:'absolute', bottom:'32px', left:'32px',
          background:'rgba(255,255,255,0.98)', backdropFilter:'blur(12px)',
          borderRadius:'20px', padding:'14px 32px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        }}>
          <span style={{ color:'#062c1e', fontWeight:'900', fontSize:'1.1rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            {turf.sport}
          </span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 400px', gap:'5rem', alignItems:'start' }}>
        {/* LEFT — Info */}
        <div>
          <h1 style={{ fontSize:'3.5rem', fontWeight:'900', marginBottom:'16px', color:'#111', letterSpacing: '-1.5px', lineHeight: 1.1 }}>{turf.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '1.15rem', marginBottom: '3rem', fontWeight: '500' }}>
             <span>{turf.location}, {turf.city}</span>
          </div>

          {turf.amenities?.length > 0 && (
            <div style={{ marginBottom:'4rem' }}>
              <h3 style={{ marginBottom:'1.75rem', fontSize:'1.5rem', fontWeight:'900', color: '#111', letterSpacing: '-0.5px' }}>Top Amenities</h3>
              <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
                {turf.amenities.map((a,i) => (
                  <span key={i} style={{ background:'#f8fafc', color:'#111', border:'1.5px solid #f1f5f9', padding:'12px 24px', borderRadius:'16px', fontSize:'1rem', fontWeight:'700' }}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div style={{ marginTop:'2rem' }}>
            <h3 style={{ marginBottom:'2rem', fontSize:'1.5rem', fontWeight:'900', color: '#111', letterSpacing: '-0.5px' }}>Player Experiences ({Array.isArray(reviews) ? reviews.length : 0})</h3>
            {(!Array.isArray(reviews) || reviews.length === 0) && <p style={{ color:'#94a3b8', fontSize: '1.1rem', fontWeight: '500' }}>No reviews yet. Be the first to share your experience!</p>}
            {Array.isArray(reviews) && reviews.map(r => <ReviewCard key={r._id} review={r} />)}
            {user && (
              <div style={{ marginTop:'4rem', background:'white', borderRadius:'32px', padding:'3rem', border:'1.5px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <h4 style={{ marginBottom:'2rem', fontSize:'1.4rem', fontWeight:'900', color: '#111' }}>Write a Review</h4>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Rate your experience</label>
                  <select value={rating} onChange={e => setRating(Number(e.target.value))} style={{ padding:'16px', borderRadius:'16px', border:'1.5px solid #f1f5f9', width:'100%', fontSize:'1.1rem', outline: 'none', background: '#f8fafc', fontWeight: '700', cursor: 'pointer' }}>
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} / 5 Rating</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Feedback</label>
                  <textarea placeholder="Tell us about the turf quality, lighting, and service..." value={comment} onChange={e => setComment(e.target.value)} rows={5} style={{ width:'100%', padding:'18px', borderRadius:'16px', border:'1.5px solid #f1f5f9', fontSize:'1.1rem', resize:'none', boxSizing:'border-box', outline: 'none', background: '#f8fafc', fontWeight: '600', lineHeight: 1.6 }} />
                </div>
                <button onClick={handleReview} style={{ background:'#1ebe74', color:'white', border:'none', padding:'18px 48px', borderRadius:'18px', cursor:'pointer', fontWeight:'900', fontSize:'1.1rem', boxShadow: '0 8px 25px rgba(30,190,116,0.3)', transition: 'all 0.3s' }}>Submit Review</button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Booking Card */}
        <div style={{ position:'sticky', top:'120px' }}>
          <div style={{ background:'white', borderRadius:'32px', padding:'3rem', border:'1.5px solid #f1f5f9', boxShadow:'0 30px 60px rgba(0,0,0,0.1)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'2.5rem' }}>
              <div>
                <span style={{ fontSize:'2.8rem', fontWeight:'900', color:'#111', letterSpacing: '-1px' }}>₹{turf.price_per_hour}</span>
                <span style={{ fontSize:'1.1rem', color:'#64748b', fontWeight:'600' }}> / hr</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', padding: '8px 16px', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                 <span style={{ color: '#166534', fontWeight: '900', fontSize: '1.2rem' }}>{turf.rating}</span>
                 <span style={{ color: '#166534', fontSize: '0.85rem', fontWeight: '800' }}>RATING</span>
              </div>
            </div>

            <div style={{ borderTop:'1.5px solid #f1f5f9', borderBottom: '1.5px solid #f1f5f9', padding:'1.5rem 0', marginBottom:'2.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'14px', fontSize:'1rem' }}>
                <span style={{ color:'#64748b', fontWeight: '600' }}>Sport</span><span style={{ fontWeight:'800', color: '#111' }}>{turf.sport}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'14px', fontSize:'1rem' }}>
                <span style={{ color:'#64748b', fontWeight: '600' }}>Location</span><span style={{ fontWeight:'800', color: '#111' }}>{turf.city}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'1rem' }}>
                <span style={{ color:'#64748b', fontWeight: '600' }}>Availability</span>
                <span style={{ fontWeight:'900', color: turf.isActive !== false ? '#1ebe74' : '#ef4444' }}>
                  {turf.isActive !== false ? 'OPEN TODAY' : 'TEMPORARILY CLOSED'}
                </span>
              </div>
            </div>

            <button onClick={() => navigate('/checkout', { state:{ turf } })} style={{
              width:'100%', background:'#1ebe74', color:'white',
              border:'none', padding:'20px', borderRadius:'20px',
              cursor:'pointer', fontWeight:'900', fontSize:'1.25rem',
              boxShadow:'0 10px 30px rgba(30,190,116,0.4)', transition:'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-4px)'; e.target.style.boxShadow = '0 15px 40px rgba(30,190,116,0.5)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 30px rgba(30,190,116,0.4)'; }}
            >
              Reserve Now
            </button>
            <div style={{ textAlign:'center', marginTop:'20px', fontSize:'0.9rem', color:'#94a3b8', fontWeight: '600' }}>
              Instant Booking Confirmation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
