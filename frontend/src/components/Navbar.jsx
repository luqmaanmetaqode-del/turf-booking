import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
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
  const [scrolled, setScrolled] = useState(false);
  const cityRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { path: '/', label: 'HOME' },
    { path: '/explore', label: 'BOOK' },
  ];

  return (
    <nav style={{
      background: scrolled ? 'rgba(255,255,255,0.97)' : 'white',
      padding: '0 2.5rem',
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.1)' : '0 1px 0 rgba(0,0,0,0.06)',
      backdropFilter: 'blur(12px)',
      transition: 'all 0.3s ease',
    }}>

      {/* Left — Logo + City */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="TurfX" style={{ height: '52px', objectFit: 'contain' }} />
        </Link>

        {/* City Selector */}
        <div style={{ position: 'relative' }} ref={cityRef}>
          <div
            onClick={() => setShowCities(!showCities)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: showCities ? '#f0fdf4' : '#f8f9fa',
              borderRadius: '25px',
              padding: '8px 16px', cursor: 'pointer',
              border: showCities ? '1.5px solid #1ebe74' : '1.5px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '0.88rem', color: '#333', fontWeight: '700' }}>{city}</span>
            <span style={{
              fontSize: '0.65rem', color: '#888',
              transform: showCities ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }}>v</span>
          </div>

          {showCities && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0,
              background: 'white', borderRadius: '16px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
              padding: '1rem', width: '300px',
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '4px', zIndex: 999,
              border: '1px solid #f0f0f0',
              animation: 'fadeIn 0.15s ease-out',
            }}>
              <div style={{
                gridColumn: '1/-1', fontSize: '0.7rem',
                color: '#999', fontWeight: '700',
                letterSpacing: '1.5px', marginBottom: '8px',
                textTransform: 'uppercase', paddingLeft: '8px',
              }}>
                Select City
              </div>
              {CITIES.map(c => (
                <div
                  key={c}
                  onClick={() => { setCity(c); setShowCities(false); navigate(`/explore?city=${c}`); }}
                  style={{
                    padding: '8px 12px', borderRadius: '10px',
                    cursor: 'pointer', fontSize: '0.85rem',
                    color: city === c ? '#1ebe74' : '#444',
                    background: city === c ? '#f0fdf4' : 'transparent',
                    fontWeight: city === c ? '700' : '500',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (city !== c) e.target.style.background = '#f5f5f5'; }}
                  onMouseLeave={e => { if (city !== c) e.target.style.background = 'transparent'; }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center — Nav Links */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {navLinks.map(({ path, label }) => (
          <Link key={path} to={path} style={{
            color: isActive(path) ? '#1ebe74' : '#555',
            textDecoration: 'none',
            fontSize: '0.85rem', fontWeight: '700',
            letterSpacing: '1px',
            padding: '8px 18px',
            borderRadius: '8px',
            background: isActive(path) ? '#f0fdf4' : 'transparent',
            transition: 'all 0.2s',
            position: 'relative',
          }}
            onMouseEnter={e => { if (!isActive(path)) { e.target.style.color = '#1ebe74'; e.target.style.background = '#f8fdf9'; }}}
            onMouseLeave={e => { if (!isActive(path)) { e.target.style.color = '#555'; e.target.style.background = 'transparent'; }}}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right — Auth */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Admin Link */}
        <Link to="/admin" style={{
          color: '#6366f1', textDecoration: 'none',
          fontSize: '0.85rem', fontWeight: '700',
          padding: '7px 16px', borderRadius: '20px',
          border: '1.5px solid #6366f1',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.target.style.background = '#6366f1'; e.target.style.color = 'white'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#6366f1'; }}
        >
          Admin
        </Link>

        {/* List your venue CTA */}
        <Link to="/partner" style={{
          color: '#1ebe74', textDecoration: 'none',
          fontSize: '0.85rem', fontWeight: '700',
          padding: '7px 16px', borderRadius: '20px',
          border: '1.5px solid #1ebe74',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.target.style.background = '#1ebe74'; e.target.style.color = 'white'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#1ebe74'; }}
        >
          List Your Venue
        </Link>

        {user ? (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                cursor: 'pointer', padding: '6px 14px 6px 6px',
                borderRadius: '30px', border: '1.5px solid #eee',
                transition: 'all 0.2s',
                background: showUserMenu ? '#f8f8f8' : 'white',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#ddd'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#eee'}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1ebe74, #0a9d5c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '800', fontSize: '0.85rem',
                boxShadow: '0 2px 8px rgba(30,190,116,0.3)',
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: '#333', fontWeight: '700', fontSize: '0.88rem' }}>
                {user.name.split(' ')[0]}
              </span>
            </div>

            {showUserMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'white', borderRadius: '14px',
                boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                padding: '8px', width: '200px', zIndex: 999,
                border: '1px solid #f0f0f0',
                animation: 'fadeIn 0.15s ease-out',
              }}>
                <div style={{
                  padding: '12px 14px', borderBottom: '1px solid #f0f0f0',
                  marginBottom: '4px',
                }}>
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#111' }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>{user.email}</div>
                </div>
                <Link to="/my-bookings" onClick={() => setShowUserMenu(false)} style={{
                  display: 'block', padding: '10px 14px', borderRadius: '8px',
                  color: '#444', textDecoration: 'none', fontSize: '0.88rem',
                  fontWeight: '600', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.target.style.background = '#f5f5f5'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  My Bookings
                </Link>
                <div
                  onClick={() => { logout(); navigate('/'); setShowUserMenu(false); }}
                  style={{
                    padding: '10px 14px', borderRadius: '8px',
                    color: '#ef4444', fontSize: '0.88rem',
                    fontWeight: '600', cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background = '#fef2f2'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#1ebe74', color: 'white',
              border: 'none', padding: '10px 24px',
              borderRadius: '25px', cursor: 'pointer',
              fontSize: '0.88rem', fontWeight: '800',
              boxShadow: '0 4px 15px rgba(30,190,116,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(30,190,116,0.4)'; }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(30,190,116,0.3)'; }}
          >
            Login / Signup
          </button>
        )}
      </div>
    </nav>
  );
}
