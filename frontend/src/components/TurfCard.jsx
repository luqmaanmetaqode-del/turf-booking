import { useNavigate } from 'react-router-dom';

export default function TurfCard({ turf }) {
  const navigate = useNavigate();

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1.5px solid #f1f5f9',
      boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)';
      }}
      onClick={() => navigate(`/turf/${turf._id}`)}
    >
      {/* Image */}
      <div style={{
        height: '180px',
        position: 'relative',
        background: '#f8fafc',
      }}>
        {turf.images && turf.images.length > 0 ? (
          <img 
            src={turf.images[0]} 
            alt={turf.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: '700' }}>
            PREMIUM VENUE
          </div>
        )}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          padding: '6px 14px',
          fontSize: '0.75rem',
          fontWeight: '800',
          color: '#0a3d2e',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {turf.sport}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '6px', fontSize: '1.2rem', fontWeight: '800', color: '#111', letterSpacing: '-0.3px' }}>{turf.name}</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px', fontWeight: '500' }}>
          {turf.location}, {turf.city}
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {turf.amenities?.slice(0, 3).map((a, i) => (
            <span key={i} style={{
              background: '#f0fdf4',
              color: '#166534',
              fontSize: '0.75rem',
              padding: '6px 12px',
              borderRadius: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}>
              {a}
            </span>
          ))}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1.5px solid #f1f5f9',
        }}>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1ebe74', letterSpacing: '-0.5px' }}>
              ₹{turf.price_per_hour}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}> / hr</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Rating</span>
             <span style={{ color: '#111', fontSize: '1rem', fontWeight: '700' }}>{turf.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
