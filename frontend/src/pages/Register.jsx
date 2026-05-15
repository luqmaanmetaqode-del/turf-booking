import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const API = 'https://turfx.metaqode.co.in/api';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your full name'); return; }
    if (phone.length < 10) { setError('Enter a valid 10-digit mobile number'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/auth/register-password`, {
        name,
        phone: `+91${phone}`,
        password,
        role: 'user',
      });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '16px 20px', borderRadius: '14px',
    border: '1.5px solid #f1f5f9', fontSize: '1rem',
    outline: 'none', boxSizing: 'border-box',
    fontWeight: '600', background: '#f8fafc', color: '#111',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#fafafa' }}>
      {/* LEFT — Branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', padding: '3rem',
        background: 'linear-gradient(135deg, #0a3d2e 0%, #1ebe74 100%)',
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <img src={logo} alt="TurfX" style={{ height: '100px', marginBottom: '2.5rem' }} />
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-1.5px' }}>
          Begin Your Journey
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '400px', textAlign: 'center', fontWeight: '500', lineHeight: 1.6 }}>
          Join thousands of players who trust TurfX for seamless venue bookings and exceptional sports experiences.
        </p>
      </div>

      {/* RIGHT — Register Form */}
      <div style={{
        width: '520px', background: 'white', display: 'flex',
        flexDirection: 'column', justifyContent: 'center',
        padding: '4rem', boxShadow: '-10px 0 40px rgba(0,0,0,0.02)',
      }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#111', marginBottom: '0.5rem', letterSpacing: '-0.7px' }}>
          Create Your Account
        </h2>
        <p style={{ color: '#64748b', fontWeight: '500', marginBottom: '2.5rem' }}>
          Register with TurfX to unlock premium venue access
        </p>

        {error && (
          <div style={{
            background: '#fff1f2', color: '#be123c', padding: '14px 18px',
            borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem',
            border: '1.5px solid #fecdd3', fontWeight: '700',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              style={inputStyle}
              autoFocus
            />
          </div>

          <div>
            <label style={labelStyle}>Mobile Number</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px 18px', borderRadius: '14px', border: '1.5px solid #f1f5f9',
                background: '#f8fafc', fontSize: '1rem', fontWeight: '700', color: '#111',
                minWidth: '68px',
              }}>+91</div>
              <input
                type="tel"
                placeholder="Enter your mobile number"
                value={phone}
                maxLength={10}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#94d3b2' : '#1ebe74',
              color: 'white', border: 'none', padding: '18px',
              borderRadius: '14px', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '800', fontSize: '1.1rem',
              boxShadow: '0 8px 25px rgba(30,190,116,0.3)',
              marginTop: '0.5rem',
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#1ebe74', textDecoration: 'none', fontWeight: '700' }}>
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: '0.8rem', fontWeight: '800',
  color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px',
};
