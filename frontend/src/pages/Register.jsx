import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/auth/register`, form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'owner' ? '/owner' : '/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Make sure backend is running.');
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
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>Create Account 🚀</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Join TurfTime today</p>

        {error && (
          <div style={{
            background: '#fff1f2', color: '#be123c',
            padding: '10px 14px', borderRadius: '10px',
            marginBottom: '1.5rem', fontSize: '0.9rem',
            border: '1px solid #fecdd3',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Name</label>
          <input
            placeholder="Your full name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            style={{
              width: '100%', padding: '12px 14px',
              borderRadius: '10px', border: '1px solid #ddd',
              marginBottom: '1.25rem', fontSize: '1rem',
            }}
          />

          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Email</label>
          <input
            type="email" placeholder="you@email.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            style={{
              width: '100%', padding: '12px 14px',
              borderRadius: '10px', border: '1px solid #ddd',
              marginBottom: '1.25rem', fontSize: '1rem',
            }}
          />

          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Password</label>
          <input
            type="password" placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            style={{
              width: '100%', padding: '12px 14px',
              borderRadius: '10px', border: '1px solid #ddd',
              marginBottom: '1.25rem', fontSize: '1rem',
            }}
          />

          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>I am a</label>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            {['user', 'owner'].map(r => (
              <button
                key={r} type="button"
                onClick={() => setForm({ ...form, role: r })}
                style={{
                  flex: 1, padding: '10px',
                  borderRadius: '10px',
                  border: `2px solid ${form.role === r ? '#1ebe74' : '#ddd'}`,
                  background: form.role === r ? '#f0fdf4' : 'white',
                  color: form.role === r ? '#0a3d2e' : '#666',
                  cursor: 'pointer', fontWeight: '600',
                  fontSize: '0.95rem',
                }}
              >
                {r === 'user' ? '🏃 Player' : '🏟️ Turf Owner'}
              </button>
            ))}
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', background: '#1ebe74',
            color: 'white', border: 'none',
            padding: '13px', borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '700', fontSize: '1rem',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1ebe74', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}