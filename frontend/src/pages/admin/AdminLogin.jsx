import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const API = 'http://localhost:5001/api';

const COUNTRY_CODES = [
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+95',  flag: '🇲🇲', name: 'Myanmar' },
  { code: '+63',  flag: '🇵🇭', name: 'Philippines' },
  { code: '+62',  flag: '🇮🇩', name: 'Indonesia' },
  { code: '+66',  flag: '🇹🇭', name: 'Thailand' },
  { code: '+84',  flag: '🇻🇳', name: 'Vietnam' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+82',  flag: '🇰🇷', name: 'South Korea' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: '+7',   flag: '🇷🇺', name: 'Russia' },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt' },
];

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 5) { setError('Enter a valid phone number'); return; }
    if (!password) { setError('Please enter your password'); return; }

    setLoading(true);
    setError('');
    const fullPhone = `${countryCode}${phone.replace(/^0+/, '')}`;
    try {
      const res = await axios.post(`${API}/auth/password-login`, { phone: fullPhone, password });
      const { token, user } = res.data;

      if (user.role !== 'admin' && user.role !== 'owner') {
        setError('Access denied. Admin accounts only.');
        setLoading(false);
        return;
      }

      login(user, token);
      navigate('/admin/dashboard');
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

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);

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
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#64748b', letterSpacing: '1px' }}>ADMIN</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#111', marginBottom: '8px' }}>Admin Login</h2>
          <p style={{ color: '#64748b', fontWeight: '500' }}>Sign in to access the TurfX admin panel.</p>
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

          {/* PHONE WITH COUNTRY CODE */}
          <div>
            <label style={labelStyle}>Mobile Number</label>
            <div style={{ display: 'flex', gap: '10px' }}>

              {/* Country Code Dropdown */}
              <div style={{ position: 'relative', flex: 1 }}>
                <select
                  value={countryCode}
                  onChange={e => { setCountryCode(e.target.value); setError(''); }}
                  style={{
                    appearance: 'none', WebkitAppearance: 'none',
                    width: '100%',
                    padding: '16px 40px 16px 16px',
                    borderRadius: '12px', border: '1.5px solid #e2e8f0',
                    fontSize: '0.95rem', fontWeight: '700',
                    background: 'white', color: '#111',
                    outline: 'none', cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag}  {c.name}  ({c.code})
                    </option>
                  ))}
                </select>
                {/* Dropdown arrow */}
                <div style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', pointerEvents: 'none',
                  color: '#94a3b8', fontSize: '0.7rem'
                }}>▼</div>
              </div>

              {/* Phone Number */}
              <input
                type="tel"
                placeholder="XXXXXXXXXX"
                value={phone}
                maxLength={12}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                style={{ ...inputStyle, flex: 1 }}
                autoFocus
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', marginTop: '6px' }}>
              {selectedCountry?.flag} {selectedCountry?.name} &nbsp;·&nbsp; Enter number without country code
            </div>
          </div>

          {/* PASSWORD */}
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
            {loading ? 'Signing in...' : 'Sign In to Admin Panel'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
            Partner portal?{' '}
            <Link to="/partner/login" style={{ color: '#1ebe74', fontWeight: '800', textDecoration: 'none' }}>
              Login here
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
            TurfX Admin Panel<br />Full platform control
          </h1>

          <div style={{ marginTop: '3rem' }}>
            {[
              { n: '1', title: 'Revenue Overview', sub: 'Track platform fees, GST and total earnings in real time' },
              { n: '2', title: 'Monthly Breakdown', sub: 'View month-wise revenue with pie charts and tables' },
              { n: '3', title: 'All Transactions', sub: 'Every booking, customer, and fee — exportable to CSV' },
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

        {/* Decorative gradient */}
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
