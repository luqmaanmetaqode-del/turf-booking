import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const API = 'https://turfx.metaqode.co.in/api';

const SPORT_ICONS = ['⚽', '🏏', '🏸', '🎾', '🏀'];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  // Login state
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (phone.length < 10) { setLoginError('Enter a valid 10-digit mobile number'); return; }
    if (!password) { setLoginError('Please enter your password'); return; }
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await axios.post(`${API}/auth/password-login`, {
        phone: `+91${phone}`,
        password,
      });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setLoginError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!firstName.trim()) { setRegError('Please enter your first name'); return; }
    if (regPhone.length < 10) { setRegError('Enter a valid 10-digit mobile number'); return; }
    if (regPassword.length < 6) { setRegError('Password must be at least 6 characters'); return; }
    setRegLoading(true);
    setRegError('');
    try {
      const res = await axios.post(`${API}/auth/register-password`, {
        name: fullName,
        phone: `+91${regPhone}`,
        password: regPassword,
        email: email || undefined,
        role: 'user',
      });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setRegError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAF7', fontFamily: "'Inter', sans-serif" }}>
      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg, #0a3d26 0%, #0d5c38 40%, #1a7a4a 70%, #2d9e5f 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }} />

        {/* Logo circle */}
        <div style={{
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          border: '2px solid rgba(206,241,123,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '2.5rem', position: 'relative', zIndex: 1,
        }}>
          <img src={logo} alt="TurfX" style={{ height: 90, objectFit: 'contain' }} />
        </div>

        {/* Badge */}
        <div style={{
          background: 'rgba(206,241,123,0.15)', border: '1px solid rgba(206,241,123,0.35)',
          borderRadius: 999, padding: '6px 18px', marginBottom: '1.5rem',
          fontSize: '0.75rem', fontWeight: 700, color: '#CEF17B',
          letterSpacing: '1px', textTransform: 'uppercase', position: 'relative', zIndex: 1,
        }}>
          🏟 India's #1 Booking Platform
        </div>

        <h1 style={{
          fontSize: '3.2rem', fontWeight: 900, color: 'white',
          lineHeight: 1.1, textAlign: 'center', marginBottom: '0.3rem',
          position: 'relative', zIndex: 1,
        }}>
          Elevate
        </h1>
        <h1 style={{
          fontSize: '3.2rem', fontWeight: 900, color: '#CEF17B',
          lineHeight: 1.1, textAlign: 'center', marginBottom: '1.5rem',
          position: 'relative', zIndex: 1,
        }}>
          Your Game.
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.75)', fontSize: '1rem', fontWeight: 500,
          maxWidth: 380, textAlign: 'center', lineHeight: 1.7,
          position: 'relative', zIndex: 1, marginBottom: '2.5rem',
        }}>
          Book premium sports venues instantly and experience world-class facilities at your fingertips.
        </p>

        {/* Sport icons */}
        <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
          {SPORT_ICONS.map((icon, i) => (
            <div key={i} style={{
              width: 52, height: 52, borderRadius: '14px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem',
            }}>
              {icon}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        width: 500, background: 'white',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem 3.5rem',
        boxShadow: '-4px 0 40px rgba(0,0,0,0.06)',
        overflowY: 'auto',
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '2px solid #EEF2E6',
          marginBottom: '2rem',
        }}>
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '14px 0', border: 'none', background: 'none',
                cursor: 'pointer', fontSize: '1rem', fontWeight: 700,
                color: tab === t ? '#084734' : '#98A2B3',
                borderBottom: tab === t ? '2.5px solid #084734' : '2.5px solid transparent',
                marginBottom: '-2px', transition: 'all 0.2s',
              }}
            >
              {t === 'login' ? 'Login' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* ── LOGIN FORM ── */}
        {tab === 'login' && (
          <div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#161616', marginBottom: '0.3rem' }}>
              Welcome Back
            </h2>
            <p style={{ color: '#98A2B3', fontWeight: 500, marginBottom: '2rem', fontSize: '0.95rem' }}>
              Access your TurfX account to continue
            </p>

            {loginError && <ErrorBox msg={loginError} />}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <Label>Mobile Number</Label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <PhonePrefix />
                  <input
                    type="tel" placeholder="Enter your mobile number"
                    value={phone} maxLength={10}
                    onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setLoginError(''); }}
                    style={inputStyle} autoFocus
                  />
                </div>
              </div>

              <div>
                <Label>Password</Label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                    style={{ ...inputStyle, paddingRight: '48px' }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={eyeBtn}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                <span style={{ color: '#084734', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                  Forgot password?
                </span>
              </div>

              <button type="submit" disabled={loginLoading} style={submitBtn(loginLoading)}>
                {loginLoading ? 'Logging in...' : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>→]</span>
                    <span>Login</span>
                  </span>
                )}
              </button>
            </form>

            <Divider />

            <GoogleBtn />

            <p style={{ textAlign: 'center', marginTop: '1.2rem', color: '#98A2B3', fontSize: '0.9rem', fontWeight: 500 }}>
              New to TurfX?{' '}
              <span onClick={() => setTab('register')} style={linkStyle}>Create an account</span>
            </p>
            <p style={{ textAlign: 'center', marginTop: '0.6rem', color: '#98A2B3', fontSize: '0.9rem', fontWeight: 500 }}>
              Venue owner?{' '}
              <Link to="/partner/login" style={linkStyle}>Partner Portal</Link>
            </p>
          </div>
        )}

        {/* ── REGISTER FORM ── */}
        {tab === 'register' && (
          <div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#161616', marginBottom: '0.3rem' }}>
              Create Account
            </h2>
            <p style={{ color: '#98A2B3', fontWeight: 500, marginBottom: '2rem', fontSize: '0.95rem' }}>
              Join TurfX and start booking in seconds
            </p>

            {regError && <ErrorBox msg={regError} />}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* First + Last name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <Label>First Name</Label>
                  <input
                    type="text" placeholder="First name"
                    value={firstName}
                    onChange={e => { setFirstName(e.target.value); setRegError(''); }}
                    style={inputStyle} autoFocus
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <input
                    type="text" placeholder="Last name"
                    value={lastName}
                    onChange={e => { setLastName(e.target.value); setRegError(''); }}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <Label>Mobile Number</Label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <PhonePrefix />
                  <input
                    type="tel" placeholder="Enter your mobile number"
                    value={regPhone} maxLength={10}
                    onChange={e => { setRegPhone(e.target.value.replace(/\D/g, '')); setRegError(''); }}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <Label>Email Address</Label>
                <input
                  type="email" placeholder="Enter your email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setRegError(''); }}
                  style={inputStyle}
                />
              </div>

              <div>
                <Label>Password</Label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    placeholder="Create a password (min 6 chars)"
                    value={regPassword}
                    onChange={e => { setRegPassword(e.target.value); setRegError(''); }}
                    style={{ ...inputStyle, paddingRight: '48px' }}
                  />
                  <button type="button" onClick={() => setShowRegPass(p => !p)} style={eyeBtn}>
                    {showRegPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={regLoading} style={submitBtn(regLoading)}>
                {regLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <Divider />

            <GoogleBtn />

            <p style={{ textAlign: 'center', marginTop: '1.2rem', color: '#98A2B3', fontSize: '0.9rem', fontWeight: 500 }}>
              Already have an account?{' '}
              <span onClick={() => setTab('login')} style={linkStyle}>Login</span>
            </p>

            <div style={{
              marginTop: '1.2rem', padding: '14px 18px', borderRadius: '12px',
              background: '#F0FDF4', border: '1.5px solid #DCEFB8',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '1.4rem' }}>🏟</span>
              <span style={{ fontSize: '0.85rem', color: '#084734', fontWeight: 600 }}>
                Venue owner?{' '}
                <Link to="/partner/login" style={{ color: '#084734', fontWeight: 800, textDecoration: 'underline' }}>
                  List your venue on TurfX →
                </Link>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */
function Label({ children }) {
  return (
    <label style={{
      display: 'block', fontSize: '0.75rem', fontWeight: 800,
      color: '#98A2B3', marginBottom: '7px',
      textTransform: 'uppercase', letterSpacing: '0.6px',
    }}>
      {children}
    </label>
  );
}

function PhonePrefix() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '0 14px', borderRadius: '12px',
      border: '1.5px solid #EEF2E6', background: '#F8FAF7',
      fontSize: '0.95rem', fontWeight: 700, color: '#161616',
      whiteSpace: 'nowrap',
    }}>
      🇮🇳 +91
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div style={{
      background: '#fff1f2', color: '#be123c', padding: '12px 16px',
      borderRadius: '10px', marginBottom: '1.2rem', fontSize: '0.88rem',
      border: '1.5px solid #fecdd3', fontWeight: 700,
    }}>
      {msg}
    </div>
  );
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.4rem 0' }}>
      <div style={{ flex: 1, height: 1, background: '#EEF2E6' }} />
      <span style={{ color: '#98A2B3', fontSize: '0.82rem', fontWeight: 600 }}>or continue with</span>
      <div style={{ flex: 1, height: 1, background: '#EEF2E6' }} />
    </div>
  );
}

function GoogleBtn() {
  return (
    <button style={{
      width: '100%', padding: '14px', borderRadius: '12px',
      border: '1.5px solid #EEF2E6', background: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
      cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700, color: '#161616',
      transition: 'border-color 0.2s',
    }}>
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      Continue with Google
    </button>
  );
}

const inputStyle = {
  width: '100%', padding: '14px 16px', borderRadius: '12px',
  border: '1.5px solid #EEF2E6', fontSize: '0.95rem',
  outline: 'none', boxSizing: 'border-box',
  fontWeight: 600, background: '#F8FAF7', color: '#161616',
  transition: 'border-color 0.2s',
};

const eyeBtn = {
  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0,
};

const submitBtn = (loading) => ({
  width: '100%',
  background: loading ? '#0a3d26' : '#0a3d26',
  color: '#CEF17B',
  border: 'none',
  padding: '17px',
  borderRadius: '12px',
  cursor: loading ? 'not-allowed' : 'pointer',
  fontWeight: 800,
  fontSize: '1.1rem',
  letterSpacing: '0.3px',
  boxShadow: loading ? 'none' : '0 6px 24px rgba(8,71,52,0.35)',
  marginTop: '0.3rem',
  transition: 'all 0.2s',
  opacity: loading ? 0.7 : 1,
});

const linkStyle = {
  color: '#084734', fontWeight: 800, cursor: 'pointer', textDecoration: 'none',
};
