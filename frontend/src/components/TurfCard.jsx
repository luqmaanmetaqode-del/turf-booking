import { useNavigate } from 'react-router-dom';

const SPORT_EMOJI = {
  Football: '⚽',
  Cricket: '🏏',
  Badminton: '🏸',
  Tennis: '🎾',
  Basketball: '🏀',
};

export default function TurfCard({ turf }) {
  const navigate = useNavigate();

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #eee',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
      }}
      onClick={() => navigate(`/turf/${turf.id}`)}
    >
      {/* Image */}
      <div style={{
        background: 'linear-gradient(135deg, #0a3d2e, #1ebe74)',
        height: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '4rem',
        position: 'relative',
      }}>
        {SPORT_EMOJI[turf.sport] || '🏟️'}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'white',
          borderRadius: '20px',
          padding: '3px 10px',
          fontSize: '0.8rem',
          fontWeight: '600',
          color: '#0a3d2e',
        }}>
          {turf.sport}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{ marginBottom: '4px', fontSize: '1.1rem' }}>{turf.name}</h3>
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '8px' }}>
          📍 {turf.location}
        </p>

        {turf.distance_meters && (
          <p style={{ color: '#1ebe74', fontSize: '0.85rem', marginBottom: '8px' }}>
            📏 {(turf.distance_meters / 1000).toFixed(1)} km away
          </p>
        )}

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {turf.amenities?.slice(0, 3).map((a, i) => (
            <span key={i} style={{
              background: '#f0fdf4',
              color: '#0a3d2e',
              fontSize: '0.75rem',
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid #d1fae5',
            }}>
              {a}
            </span>
          ))}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1ebe74' }}>
              ₹{turf.price_per_hour}
            </span>
            <span style={{ color: '#999', fontSize: '0.85rem' }}>/hr</span>
          </div>
          <div style={{ color: '#666', fontSize: '0.85rem' }}>⭐ {turf.rating}</div>
        </div>

        <button
          style={{
            width: '100%',
            marginTop: '12px',
            background: '#1ebe74',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
          }}
          onClick={e => { e.stopPropagation(); navigate(`/turf/${turf.id}`); }}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}