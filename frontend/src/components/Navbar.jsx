import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { useState } from 'react';

const CITIES = [
  'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
  'Visakhapatnam', 'Coimbatore', 'Kochi', 'Guwahati', 'Chandigarh'
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [city, setCity] = useState('Bengaluru');
  const [showCities, setShowCities] = useState(false);

  return (
    <nav style={{
      background: 'white',
      padding: '0 2.5rem',
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
      borderBottom: '1px solid #f0f0f0',
    }}>

      {/* Left — Logo + City */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/">
          <img src={logo} alt="TurfX" style={{ height: '58px', objectFit: 'contain' }} />
        </Link>

        {/* City Selector */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowCities(!showCities)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#f8f8f8', borderRadius: '25px',
              padding: '8px 16px', cursor: 'pointer',
              border: '1px solid #eee', transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '1rem' }}>📍</span>
            <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: '600' }}>{city}</span>
            <span style={{ fontSize: '0.7rem', color: '#888' }}>▼</span>
          </div>

          {showCities && (
            <div style={{
              position: 'absolute', top: '110%', left: 0,
              background: 'white', borderRadius: '16px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
              padding: '1rem', width: '280px',
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '6px', zIndex: 999,
              border: '1px solid #f0f0f0',
            }}>
              <div style={{
                gridColumn: '1/-1', fontSize: '0.75rem',
                color: '#888', fontWeight: '700',
                letterSpacing: '1px', marginBottom: '6px',
                textTransform: 'uppercase',
              }}>
                Select City
              </div>
              {CITIES.map(c => (
                <div
                  key={c}
                  onClick={() => { setCity(c); setShowCities(false); navigate(`/explore?city=${c}`); }}
                  style={{
                    padding: '8px 12px', borderRadius: '10px',
                    cursor: 'pointer', fontSize: '0.88rem',
                    color: city === c ? '#1ebe74' : '#333',
                    background: city === c ? '#f0fdf4' : 'transparent',
                    fontWeight: city === c ? '700' : '500',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background = '#f5f5f5'}
                  onMouseLeave={e => e.target.style.background = city === c ? '#f0fdf4' : 'transparent'}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center — Nav Links */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {[['/', 'Home'], ['/explore', 'Book'], ['/my-bookings', 'My Bookings']].map(([path, label]) => (
          <Link key={path} to={path} style={{
            color: '#333', textDecoration: 'none',
            fontSize: '0.95rem', fontWeight: '600',
            letterSpacing: '0.3px',
            borderBottom: '2px solid transparent',
            paddingBottom: '2px',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.color = '#1ebe74'; e.target.style.borderBottomColor = '#1ebe74'; }}
            onMouseLeave={e => { e.target.style.color = '#333'; e.target.style.borderBottomColor = 'transparent'; }}
          >
            {label}
          </Link>
        ))}
        {user?.role === 'owner' && (
          <Link to="/owner" style={{
            color: '#333', textDecoration: 'none',
            fontSize: '0.95rem', fontWeight: '600',
          }}>Dashboard</Link>
        )}
      </div>

      {/* Right — Auth */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#f0fdf4', padding: '8px 16px',
              borderRadius: '25px', border: '1px solid #d1fae5',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#1ebe74', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '700', fontSize: '0.85rem',
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: '#0a3d2e', fontWeight: '600', fontSize: '0.9rem' }}>
                {user.name.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={() => { logout(); navigate('/'); }}
              style={{
                background: 'none', border: '1.5px solid #ddd',
                padding: '8px 20px', borderRadius: '25px',
                cursor: 'pointer', fontSize: '0.9rem',
                color: '#555', fontWeight: '600',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = '#ff4444'; e.target.style.color = '#ff4444'; }}
              onMouseLeave={e => { e.target.style.borderColor = '#ddd'; e.target.style.color = '#555'; }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              color: '#333', textDecoration: 'none',
              fontSize: '0.95rem', fontWeight: '600',
              padding: '8px 20px', borderRadius: '25px',
              border: '1.5px solid #ddd',
              transition: 'all 0.2s',
            }}>
              Login
            </Link>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: '#1ebe74', color: 'white',
                border: 'none', padding: '10px 24px',
                borderRadius: '25px', cursor: 'pointer',
                fontSize: '0.95rem', fontWeight: '700',
                boxShadow: '0 4px 15px rgba(30,190,116,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
            >
              Sign Up Free
            </button>
          </>
        )}
      </div>
    </nav>
  );
}