import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{
      background: 'white',
      padding: '0 2rem',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
      borderBottom: '1px solid #f0f0f0',
    }}>
      {/* Left — Logo + Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/">
          <img src={logo} alt="TurfX" style={{ height: '60px', objectFit: 'contain' }} />
        </Link>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#f5f5f5', borderRadius: '20px',
          padding: '8px 16px', cursor: 'pointer',
        }}>
          <span style={{ fontSize: '1rem' }}>📍</span>
          <span style={{ fontSize: '0.95rem', color: '#444', fontWeight: '500' }}>Bengaluru</span>
        </div>
      </div>

      {/* Right — Links */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#444', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>Home</Link>
        <Link to="/explore" style={{ color: '#444', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>Explore</Link>
        {user ? (
          <>
            <Link to="/my-bookings" style={{ color: '#444', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>My Bookings</Link>
            {user.role === 'owner' && (
              <Link to="/owner" style={{ color: '#444', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>Dashboard</Link>
            )}
            <span style={{ color: '#1ebe74', fontSize: '0.9rem', fontWeight: '600' }}>Hi, {user.name}</span>
            <button
              onClick={() => { logout(); navigate('/'); }}
              style={{
                background: 'none', border: '1.5px solid #ccc',
                padding: '7px 18px', borderRadius: '20px',
                cursor: 'pointer', fontSize: '0.9rem', color: '#444',
                fontWeight: '500',
              }}
            >Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#444', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>Login</Link>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: '#1ebe74', color: 'white',
                border: 'none', padding: '8px 20px',
                borderRadius: '20px', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: '600',
              }}
            >Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}