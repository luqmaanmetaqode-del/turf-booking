import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import logo from '../../assets/logo.png';

const API = 'https://turfx.metaqode.co.in/api';

export default function PartnerLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      {/* ── LEFT PANEL ── */}
      <div style={{
        width: '480px', minWidth: '480px', background: '#fff',
        display: 'flex', flexDirection: 'column',
        padding: '3rem 3.5rem', justifyContent: 'center',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem' }}>
          <Link to="/"><img src={logo} alt="TurfX" style={{ height: '36px' }} /></Link>
          <span style={{
            background: '#E8F5D0', color: '#4A7C2F', fontWeight: '800',
            fontSize: '0.75rem', letterSpacing: '1.5px', padding: '4px 10px',
            borderRadius: '6px',
          }}>PARTNER</span>
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0D1F0F', marginBottom: '8px', lineHeight: 1.2 }}>
          Partner Access
        </h2>
        <p style={{ color: '#6B7280', fontWeight: '500', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
          Sign in to manage your venue operations and bookings
        </p>

        {error && (
          <div style={{
            background: '#fff1f2', color: '#be123c', padding: '14px 16px',
            borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.88rem',
            fontWeight: '600', border: '1px solid #fecdd3',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Mobile */}
          <div>
            <label style={labelStyle}>Mobile Number</label>
            <div style={{ display: 'flex', gap: '0', borderRadius: '12px', border: '1.5px solid #E5E7EB', overflow: 'hidden', background: '#fff' }}>
              <div style={{
                padding: '14px 16px', background: '#F9FAFB', borderRight: '1.5px solid #E5E7EB',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '0.95rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap',
              }}>
                🇮🇳 +91
              </div>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={phone}
                maxLength={10}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                style={{
                  flex: 1, padding: '14px 16px', border: 'none', outline: 'none',
                  fontSize: '0.95rem', fontWeight: '500', color: '#111827', background: '#fff',
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative', borderRadius: '12px', border: '1.5px solid #E5E7EB', overflow: 'hidden' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                style={{
                  width: '100%', padding: '14px 48px 14px 16px', border: 'none', outline: 'none',
                  fontSize: '0.95rem', fontWeight: '500', color: '#111827', background: '#fff',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
                  display: 'flex', alignItems: 'center', padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <Link to="/partner/forgot-password" style={{ color: '#2D6A4F', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#b5d96a' : '#CEF17B',
              color: '#0D2B14', border: 'none', padding: '16px',
              borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '800', fontSize: '1rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background 0.2s', marginTop: '0.5rem',
            }}
          >
            <LogIn size={18} />
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #F3F4F6' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.88rem' }}>new here?</p>
          <Link to="/partner/register" style={{ color: '#111827', fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem' }}>
            New partner? <span style={{ color: '#2D6A4F', fontWeight: '800', textDecoration: 'underline' }}>Register your venue</span>
          </Link>
        </div>

        <p style={{ color: '#D1D5DB', fontSize: '0.78rem', textAlign: 'center', marginTop: '3rem' }}>
          © 2024 MetaQode Technologies Pvt. Ltd.
        </p>
      </div>

      {/* ── RIGHT PANEL (dark green) ── */}
      <div style={{
        flex: 1, background: '#0A3728',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '5rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid LINE pattern — like the mockup */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          pointerEvents: 'none',
        }} />

        {/* Decorative circle */}
        <div style={{
          position: 'absolute', top: '6%', right: '8%',
          width: '130px', height: '130px', borderRadius: '50%',
          border: '1.5px solid rgba(206,241,123,0.2)',
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ color: '#CEF17B', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>
            — VENUE PARTNERS
          </p>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#fff', lineHeight: 1.15, marginBottom: '1.5rem' }}>
            Scale Your<br />
            <span style={{ color: '#CEF17B' }}>Sports Business.</span>
          </h1>
          <p style={{ color: '#9DB8A0', fontSize: '1rem', fontWeight: '400', lineHeight: 1.7, maxWidth: '480px', marginBottom: '3rem' }}>
            Join India's largest sports turf network and put your venue in front of thousands of players every day.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '4rem' }}>
            {[
              { n: '1', title: 'Expand Your Reach', sub: 'Connect with thousands of active players in your city and fill your slots every day' },
              { n: '2', title: 'Streamlined Operations', sub: 'Manage bookings, pricing, and availability from one powerful dashboard' },
              { n: '3', title: 'Real-Time Analytics', sub: 'Track revenue, peak hours, and customer insights to grow smarter' },
            ].map(f => (
              <div key={f.n} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: '#CEF17B', color: '#0D2B14',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: '900', flexShrink: 0,
                }}>{f.n}</div>                <div>
                  <div style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>{f.title}</div>
                  <div style={{ color: '#7A9E80', fontWeight: '400', marginTop: '4px', fontSize: '0.88rem', lineHeight: 1.5 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats badges */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { val: '500+', label: 'Partner venues' },
              { val: '10K+', label: 'Active players' },
              { val: '4.8★', label: 'Avg rating' },
            ].map(s => (
              <div key={s.val} style={{
                background: 'rgba(206,241,123,0.1)', border: '1px solid rgba(206,241,123,0.2)',
                borderRadius: '50px', padding: '10px 20px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ color: '#CEF17B', fontWeight: '800', fontSize: '1rem' }}>{s.val}</span>
                <span style={{ color: '#7A9E80', fontSize: '0.85rem' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: '0.75rem', fontWeight: '700',
  color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px',
};
