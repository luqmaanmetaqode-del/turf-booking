import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const API = 'http://localhost:5001/api';

export default function PartnerLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (phone.length < 10) { setError('Enter a valid 10-digit mobile number'); return; }
    if (!password) { setError('Please enter your password'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/auth/password-login`, {
        phone: `+91${phone}`,
        password,
      });
      if (res.data.user.role !== 'owner' && res.data.user.role !== 'admin') {
        setError('This account is not registered as a partner. Please use the player login.');
        setLoading(false);
        return;
      }
      login(res.data.user, res.data.token);
      navigate('/partner/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '16px 20px', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', fontSize: '1rem',
    outline: 'none', boxSizing: 'border-box',
    fontWeight: '600', background: 'white', color: '#111',
    transition: 'border-color 0.2s',
  };

  const featureItemStyle = { display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-start' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#fafafa', fontFamily: "'Inter', sans-serif" }}>
      {/* LEFT — Login Form */}
      <div style={{
        width: '550px', background: 'white', display: 'flex',
        flexDirection: 'column', padding: '4rem', justifyContent: 'center',
      }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <Link to="/"><img src={logo} alt="TurfX" style={{ height: '36px' }} /></Link>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#64748b', letterSpacing: '1px' }}>PARTNER</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#111', marginBottom: '8px' }}>Partner Access</h2>
          <p style={{ color: '#64748b', fontWeight: '500' }}>Sign in to manage your venue operations and bookings.</p>
        </div>

        {error && (
          <div style={{
            background: '#fff1f2', color: '#be123c', padding: '14px',
            borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem',
            fontWeight: '700', textAlign: 'center', border: '1px solid #fecdd3',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={labelStyle}>Mobile Number</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{
                ...inputStyle, width: '70px', textAlign: 'center',
                background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+91</div>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={phone}
                maxLength={10}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                style={inputStyle}
                autoFocus
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#94d3b2' : '#1ebe74',
              color: 'white', border: 'none', padding: '18px',
              borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '800', fontSize: '1.1rem', transition: '0.3s',
              marginTop: '0.5rem',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>
            New partner?{' '}
            <Link to="/partner/register" style={{ color: '#1ebe74', fontWeight: '800', textDecoration: 'none' }}>
              Register your venue
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT — Branding */}
      <div style={{
        flex: 1, background: '#f8fafc', padding: '5rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Scale Your Sports Venue Business
          </h1>

          <div style={{ marginTop: '3rem' }}>
            {[
              { n: '1', title: 'Expand Your Reach', sub: 'Connect with thousands of active players in your city' },
              { n: '2', title: 'Streamlined Operations', sub: 'Manage bookings, pricing, and availability from one dashboard' },
              { n: '3', title: 'Real-Time Analytics', sub: 'Track revenue, peak hours, and customer insights instantly' },
            ].map(f => (
              <div key={f.n} style={featureItemStyle}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: '#f0fdf4', color: '#1ebe74',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: '800', flexShrink: 0,
                }}>{f.n}</div>
                <div>
                  <div style={{ fontWeight: '800', color: '#111', fontSize: '1.1rem' }}>{f.title}</div>
                  <div style={{ color: '#64748b', fontWeight: '500', marginTop: '4px' }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0, left: 0, height: '40%',
          background: 'linear-gradient(to top, rgba(30,190,116,0.08), transparent)',
        }} />
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: '0.8rem', fontWeight: '800',
  color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px',
};
