import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function TurfDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [turf, setTurf] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    axios.get(`${API}/turfs/${id}`)
      .then(res => setTurf(res.data))
      .catch(err => console.error(err));
    axios.get(`${API}/reviews/${id}`)
      .then(res => setReviews(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleReview = async () => {
    if (!token) return navigate('/login');
    try {
      await axios.post(`${API}/reviews`,
        { turf_id: id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment('');
      const res = await axios.get(`${API}/reviews/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!turf) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>Loading...</div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #0a3d2e, #1ebe74)',
        borderRadius: '20px', height: '220px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '5rem', marginBottom: '2rem',
      }}>🏟️</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{turf.name}</h1>
          <p style={{ color: '#666' }}>📍 {turf.location}</p>
          <p style={{ color: '#666' }}>🏅 {turf.sport} &nbsp; ⭐ {turf.rating}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1ebe74' }}>
            ₹{turf.price_per_hour}<span style={{ fontSize: '1rem', color: '#999', fontWeight: '400' }}>/hr</span>
          </div>
          <button
            onClick={() => navigate('/checkout', { state: { turf } })}
            style={{
              marginTop: '10px', background: '#1ebe74', color: 'white',
              border: 'none', padding: '12px 28px', borderRadius: '12px',
              cursor: 'pointer', fontWeight: '700', fontSize: '1rem',
            }}
          >Book Now</button>
        </div>
      </div>

      {turf.amenities?.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Amenities</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {turf.amenities.map((a, i) => (
              <span key={i} style={{
                background: '#f0fdf4', color: '#0a3d2e',
                border: '1px solid #d1fae5',
                padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem',
              }}>✅ {a}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Reviews ({reviews.length})</h3>
        {reviews.length === 0 && <p style={{ color: '#999' }}>No reviews yet. Be the first!</p>}
        {reviews.map(r => <ReviewCard key={r.id} review={r} />)}

        {user && (
          <div style={{
            marginTop: '2rem', background: '#f9f9f9',
            borderRadius: '12px', padding: '1.5rem', border: '1px solid #eee',
          }}>
            <h4 style={{ marginBottom: '1rem' }}>Write a Review</h4>
            <select
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1rem', width: '100%' }}
            >
              {[5, 4, 3, 2, 1].map(r => (
                <option key={r} value={r}>{'⭐'.repeat(r)} ({r} star{r > 1 ? 's' : ''})</option>
              ))}
            </select>
            <textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px',
                border: '1px solid #ddd', fontSize: '0.95rem',
                marginBottom: '1rem', resize: 'none',
              }}
            />
            <button onClick={handleReview} style={{
              background: '#1ebe74', color: 'white', border: 'none',
              padding: '10px 24px', borderRadius: '10px',
              cursor: 'pointer', fontWeight: '600',
            }}>Submit Review</button>
          </div>
        )}
      </div>
    </div>
  );
}