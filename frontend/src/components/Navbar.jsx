import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { useState, useEffect, useRef } from 'react';

const CITIES = [
  'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
  'Visakhapatnam', 'Coimbatore', 'Kochi', 'Guwahati', 'Chandigarh'
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [city, setCity] = useState('Bengaluru');
  const [showCities, setShowCities] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const cityRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleClick = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setShowCities(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/explore', label: 'Book' },
    { path: '/explore', label: 'Venues' },
  ];

  return (
    <nav style={{
      background: '#084734',
      padding: '0 2.5rem',
      height: '68px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>

      {/* Left — Logo + City */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="TurfX" style={{ height: '44px', objectFit: 'contain' }} />
        </Link>

        {/* City Selector */}
        <div style={{ position: 'relative' }} ref={cityRef}>
          <button
            onClick={() => setShowCities(!showCities)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '6px 14px', cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: '600' }}>📍 {city}</span>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', transform: showCities ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
          </button>

          {showCities && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0,
              background: 'white', borderRadius: '16px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
              padding: '1rem', width: '300px',
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '4px', zIndex: 999,
            }}>
              <div style={{ gridColumn: '1/-1', fontSize: '0.7rem', color: '#999', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '8px', textTransform: 'uppercase', paddingLeft: '8px' }}>
                Select City
              </div>
              {CITIES.map(c => (
                <button key={c} onClick={() => { setCity(c); setShowCities(false); navigate(`/explore?city=${c}`); }}
                  style={{ padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', color: city === c ? '#084734' : '#444', background: city === c ? '#DCEFB8' : 'transparent', fontWeight: city === c ? '700' : '500', transition: 'all 0.15s', border: 'none', textAlign: 'left', width: '100%' }}
                  onMouseEnter={e => { if (city !== c) e.target.style.background = '#f5f5f5'; }}
                  onMouseLeave={e => { if (city !== c) e.target.style.background = 'transparent'; }}
                >{c}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center — Nav Links (hidden on mobile) */}
      {!isMobile && (
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {navLinks.map(({ path, label }) => (
            <Link key={label} to={path} style={{
              color: isActive(path) && label !== 'Venues' ? '#CEF17B' : 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
              fontSize: '0.9rem', fontWeight: isActive(path) ? '700' : '500',
              padding: '8px 18px',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.color = '#CEF17B'; }}
              onMouseLeave={e => { e.target.style.color = isActive(path) && label !== 'Venues' ? '#CEF17B' : 'rgba(255,255,255,0.85)'; }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* Right — Auth (NO dark mode toggle, NO admin, NO list venue buttons) */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {/* User menu / Login button */}
        {user ? (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 14px 6px 6px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.3)', transition: 'all 0.2s', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#CEF17B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#084734', fontWeight: '800', fontSize: '0.85rem' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!isMobile && <span style={{ color: 'white', fontWeight: '600', fontSize: '0.88rem' }}>{user.name.split(' ')[0]}</span>}
            </button>

            {showUserMenu && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', borderRadius: '14px', boxShadow: '0 12px 48px rgba(0,0,0,0.2)', padding: '8px', width: '200px', zIndex: 999 }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #f0f0f0', marginBottom: '4px' }}>
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#161616' }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>{user.email}</div>
                </div>
                {isMobile && (
                  <>
                    <Link to="/" onClick={() => setShowUserMenu(false)} style={{ display: 'block', padding: '10px 14px', borderRadius: '8px', color: '#444', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600' }}>Home</Link>
                    <Link to="/explore" onClick={() => setShowUserMenu(false)} style={{ display: 'block', padding: '10px 14px', borderRadius: '8px', color: '#444', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600' }}>Explore Venues</Link>
                    <div style={{ borderTop: '1px solid #f0f0f0', margin: '4px 0' }} />
                  </>
                )}
                <Link to="/my-bookings" onClick={() => setShowUserMenu(false)} style={{ display: 'block', padding: '10px 14px', borderRadius: '8px', color: '#444', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600' }}
                  onMouseEnter={e => e.target.style.background = '#f5f5f5'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >My Bookings</Link>
                <button onClick={() => { logout(); navigate('/'); setShowUserMenu(false); }}
                  style={{ padding: '10px 14px', borderRadius: '8px', color: '#ef4444', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >Logout</button>
              </div>
            )}
          </div>
        ) : (
          isMobile ? (
            /* Mobile: hamburger opens a simple menu */
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}
                aria-label="Menu"
              >
                <span style={{ width: '18px', height: '2px', background: 'white', borderRadius: '2px' }} />
                <span style={{ width: '18px', height: '2px', background: 'white', borderRadius: '2px' }} />
                <span style={{ width: '18px', height: '2px', background: 'white', borderRadius: '2px' }} />
              </button>
              {showUserMenu && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', borderRadius: '14px', boxShadow: '0 12px 48px rgba(0,0,0,0.2)', padding: '8px', width: '200px', zIndex: 999 }}>
                  <Link to="/" onClick={() => setShowUserMenu(false)} style={{ display: 'block', padding: '10px 14px', borderRadius: '8px', color: '#444', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600' }}>Home</Link>
                  <Link to="/explore" onClick={() => setShowUserMenu(false)} style={{ display: 'block', padding: '10px 14px', borderRadius: '8px', color: '#444', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600' }}>Explore Venues</Link>
                  <div style={{ borderTop: '1px solid #f0f0f0', margin: '4px 0' }} />
                  <button onClick={() => { navigate('/login'); setShowUserMenu(false); }} style={{ padding: '10px 14px', borderRadius: '8px', color: '#084734', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>Login / Signup</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/login')} style={{
              background: '#CEF17B', color: '#084734',
              border: 'none', padding: '10px 24px',
              borderRadius: '25px', cursor: 'pointer',
              fontSize: '0.88rem', fontWeight: '800',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.opacity = '0.9'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }}
            >
              Login / Signup
            </button>
          )
        )}
      </div>
    </nav>
  );
}