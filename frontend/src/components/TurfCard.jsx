import { useNavigate } from 'react-router-dom';

const SPORT_EMOJI = {
  Football: '⚽', Cricket: '🏏', Badminton: '🏸',
  Tennis: '🎾', Basketball: '🏀', Volleyball: '🏐',
  Swimming: '🏊', 'Table Tennis': '🏓',
};

export default function TurfCard({ turf }) {
  const navigate = useNavigate();
  const emoji = SPORT_EMOJI[turf.sport] || '🏟';

  return (
    <div
      onClick={() => navigate(`/turf/${turf._id}`)}
      style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'all 0.3s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
    >
      {/* Image / Sport Area */}
      <div style={{ height: '180px', position: 'relative', background: '#084734', overflow: 'hidden' }}>
        {turf.images && turf.images.length > 0 ? (
          <img src={turf.images[0]} alt={turf.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
            {emoji}
          </div>
        )}

        {/* Sport badge */}
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          color: 'white', fontSize: '0.7rem', fontWeight: '800',
          padding: '4px 10px', borderRadius: '6px',
          textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          {turf.sport}
        </div>

        {/* Premium badge */}
        {turf.rating >= 4.5 && (
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            background: '#CEF17B', color: '#084734',
            fontSize: '0.65rem', fontWeight: '800',
            padding: '4px 10px', borderRadius: '6px',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            Premium
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#161616', marginBottom: '4px' }}>{turf.name}</h3>
        <p style={{ color: '#98A2B3', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          📍 {turf.location}, {turf.city}
        </p>

        {/* Amenity tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {turf.amenities?.slice(0, 3).map((a, i) => (
            <span key={i} style={{
              background: '#DCEFB8', color: '#084734',
              fontSize: '0.7rem', padding: '4px 10px',
              borderRadius: '6px', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '0.3px',
            }}>
              {a}
            </span>
          ))}
        </div>

        {/* Price + Book */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#161616' }}>₹{turf.price_per_hour}</span>
            <span style={{ color: '#98A2B3', fontSize: '0.85rem' }}> / hr</span>
            <div style={{ fontSize: '0.8rem', color: '#98A2B3', marginTop: '2px' }}>★ {turf.rating || 0}</div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/turf/${turf._id}`); }}
            style={{
              background: '#084734', color: 'white',
              border: 'none', padding: '10px 20px',
              borderRadius: '10px', fontSize: '0.85rem',
              fontWeight: '700', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.background = '#CEF17B'; e.target.style.color = '#084734'; }}
            onMouseLeave={e => { e.target.style.background = '#084734'; e.target.style.color = 'white'; }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
