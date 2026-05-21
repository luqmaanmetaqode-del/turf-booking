import { useNavigate } from 'react-router-dom';

const SPORT_EMOJI = {
  Football: '⚽', Cricket: '🏏', Badminton: '🏸',
  Tennis: '🎾', Basketball: '🏀', Volleyball: '🏐',
  Swimming: '🏊', 'Table Tennis': '🏓',
};

export default function TurfCard({ turf, listView }) {
  const navigate = useNavigate();
  const emoji = SPORT_EMOJI[turf.sport] || '🏟';

  if (listView) {
    return (
      <div onClick={() => navigate(`/turf/${turf._id}`)} style={{
        background: 'white', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex',
        transition: 'all 0.3s',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
      >
        <div style={{ width: '200px', background: '#084734', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
          {turf.images && turf.images.length > 0
            ? <img src={turf.images[0]} alt={turf.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : emoji}
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '0.65rem', fontWeight: '800', padding: '3px 8px', borderRadius: '5px', textTransform: 'uppercase' }}>{turf.sport}</div>
        </div>
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#161616', marginBottom: '4px', fontFamily: "'Sora', sans-serif" }}>{turf.name}</h3>
            <p style={{ color: '#98A2B3', fontSize: '0.85rem', marginBottom: '10px' }}>📍 {turf.location}, {turf.city}</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {turf.amenities?.slice(0, 3).map((a, i) => (
                <span key={i} style={{ background: '#DCEFB8', color: '#084734', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '5px', fontWeight: '700', textTransform: 'uppercase' }}>{a}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#161616' }}>₹{turf.price_per_hour}<span style={{ fontSize: '0.85rem', color: '#98A2B3', fontWeight: '400' }}> / hr</span></div>
            <div style={{ fontSize: '0.8rem', color: '#98A2B3', marginBottom: '10px' }}>★ {turf.rating || 0}</div>
            <button onClick={e => { e.stopPropagation(); navigate(`/turf/${turf._id}`); }} style={{ background: '#084734', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
              onMouseEnter={e => { e.target.style.background = '#CEF17B'; e.target.style.color = '#084734'; }}
              onMouseLeave={e => { e.target.style.background = '#084734'; e.target.style.color = 'white'; }}
            >Book Now</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => navigate(`/turf/${turf._id}`)} style={{
      background: 'white', borderRadius: '16px', overflow: 'hidden',
      border: '1px solid #e5e7eb', cursor: 'pointer',
      transition: 'all 0.3s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Image area */}
      <div style={{ height: '200px', position: 'relative', background: '#084734', overflow: 'hidden' }}>
        {turf.images && turf.images.length > 0 ? (
          <img src={turf.images[0]} alt={turf.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
            {emoji}
          </div>
        )}

        {/* Sport badge - top right */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', color: 'white', fontSize: '0.65rem', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {turf.sport}
        </div>

        {/* Premium badge - top left */}
        {turf.rating >= 4.5 && (
          <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#CEF17B', color: '#084734', fontSize: '0.65rem', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
            Premium
          </div>
        )}

        {/* Available dot - bottom left */}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CEF17B' }}></div>
          <span style={{ color: 'white', fontSize: '0.72rem', fontWeight: '600' }}>Available</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#161616', marginBottom: '4px', fontFamily: "'Sora', sans-serif" }}>{turf.name}</h3>
        <p style={{ color: '#98A2B3', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          📍 {turf.location}, {turf.city}
        </p>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {turf.amenities?.slice(0, 3).map((a, i) => (
            <span key={i} style={{ background: '#DCEFB8', color: '#084734', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', textTransform: 'uppercase' }}>
              {a}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#161616' }}>₹{turf.price_per_hour}</span>
            <span style={{ color: '#98A2B3', fontSize: '0.85rem' }}> / hr</span>
            <div style={{ fontSize: '0.8rem', color: '#98A2B3', marginTop: '2px' }}>★ {turf.rating || 0}</div>
          </div>
          <button onClick={e => { e.stopPropagation(); navigate(`/turf/${turf._id}`); }} style={{
            background: '#084734', color: 'white', border: 'none',
            padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem',
            fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
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
