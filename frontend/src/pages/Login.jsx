import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/auth/login`, form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'owner' ? '/owner' : '/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '80vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f9f9f9', padding: '2rem',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px',
        padding: '2.5rem', width: '420px', maxWidth: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>Welcome back 👋</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Login to book your turf</p>

        {error && (
          <div style={{
            background: '#fff1f2', color: '#be123c',
            padding: '10px 14px', borderRadius: '10px',
            marginBottom: '1.5rem', fontSize: '0.9rem',
            border: '1px solid #fecdd3',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Email</label>
          <input
            type="email" placeholder="you@email.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '10px',
              border: '1px solid #ddd', marginBottom: '1.25rem', fontSize: '1rem',
            }}
          />
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Password</label>
          <input
            type="password" placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '10px',
              border: '1px solid #ddd', marginBottom: '1.5rem', fontSize: '1rem',
            }}
          />
          <button type="submit" disabled={loading} style={{
            width: '100%', background: '#1ebe74', color: 'white',
            border: 'none', padding: '13px', borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '700', fontSize: '1rem', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#1ebe74', fontWeight: '600' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}