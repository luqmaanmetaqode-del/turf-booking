import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const API = 'http://localhost:5001/api';

export default function PartnerRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: '100%', padding: '14px 18px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '0.95rem',
    outline: 'none', transition: '0.2s', boxSizing: 'border-box',
    fontWeight: '600', background: 'white', color: '#111'
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, phone, password, email } = formData;
    if (!name || !phone || !password) { setError('Please fill in required fields'); return; }
    if (phone.length < 10) { setError('Enter a valid phone number'); return; }

    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/auth/register-password`, {
        name,
        phone: `+91${phone}`,
        email,
        password,
        role: 'owner'
      });
      login(res.data.user, res.data.token);
      navigate('/partner/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const featureItemStyle = { display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-start' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#fafafa', fontFamily: "'Inter', sans-serif" }}>
      {/* LEFT: REGISTRATION FORM */}
      <div style={{ width: '580px', background: 'white', display: 'flex', flexDirection: 'column', padding: '3rem 4rem', justifyContent: 'center', boxShadow: '10px 0 30px rgba(0,0,0,0.02)', zIndex: 10 }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Link to="/"><img src={logo} alt="TurfX" style={{ height: '32px' }} /></Link>
            <span style={{ fontWeight: '700', fontSize: '0.8rem', color: '#1ebe74', letterSpacing: '1.5px', background: '#f0fdf4', padding: '4px 10px', borderRadius: '6px' }}>PARTNER PORTAL</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#111', marginBottom: '8px', letterSpacing: '-0.5px' }}>Partner Registration</h2>
          <p style={{ color: '#64748b', fontWeight: '500', fontSize: '1rem' }}>Join our network of premium venue partners and accelerate your business growth.</p>
        </div>

        {error && <div style={{ background: '#fff1f2', color: '#be123c', padding: '14px', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '700', textAlign: 'center', border: '1px solid #fecdd3' }}>{error}</div>}

        <form onSubmit={handleRegister}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '1.2rem' }}>
            <div>
               <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Full Name *</label>
               <input type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} required />
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Turf Name</label>
               <input type="text" placeholder="Turf Empire" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Mobile Number *</label>
             <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ ...inputStyle, width: '75px', textAlign: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>+91</div>
                <input type="tel" placeholder="98765 43210" value={formData.phone} maxLength={10} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g,'')})} style={inputStyle} required />
             </div>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Email Address</label>
             <input type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Create Password *</label>
             <input type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={inputStyle} required />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', background: '#1ebe74', color: 'white', border: 'none', padding: '18px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '1.1rem', transition: '0.3s', boxShadow: '0 10px 25px rgba(30,190,116,0.25)' }}>
            {loading ? 'Creating Account...' : 'Register as Partner'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
           <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>
             Already a registered partner? <Link to="/partner/login" style={{ color: '#1ebe74', fontWeight: '800', textDecoration: 'none' }}>Sign in to your account</Link>
           </p>
        </div>
      </div>

      {/* RIGHT: BRANDING & FEATURES */}
      <div style={{ flex: 1, background: '#f8fafc', padding: '5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '500px' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '900', color: '#111', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-1px' }}>
            Transform Your<br /><span style={{ color: '#1ebe74' }}>Venue Business</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem', fontWeight: '500' }}>Join 500+ venue partners who have scaled their operations and maximized revenue with TurfX.</p>
          
          <div>
             <div style={featureItemStyle}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#1ebe74', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '800', boxShadow: '0 8px 16px rgba(30,190,116,0.2)' }}>✓</div>
                <div>
                   <div style={{ fontWeight: '800', color: '#111', fontSize: '1.1rem' }}>Rapid Onboarding</div>
                   <div style={{ color: '#64748b', fontWeight: '500', marginTop: '4px' }}>Get your venue live and accepting bookings within 24 hours.</div>
                </div>
             </div>
             <div style={featureItemStyle}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#1ebe74', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '800', boxShadow: '0 8px 16px rgba(30,190,116,0.2)' }}>✓</div>
                <div>
                   <div style={{ fontWeight: '800', color: '#111', fontSize: '1.1rem' }}>Performance-Based Pricing</div>
                   <div style={{ color: '#64748b', fontWeight: '500', marginTop: '4px' }}>Zero setup fees. Pay only when you receive confirmed bookings.</div>
                </div>
             </div>
             <div style={featureItemStyle}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#1ebe74', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '800', boxShadow: '0 8px 16px rgba(30,190,116,0.2)' }}>✓</div>
                <div>
                   <div style={{ fontWeight: '800', color: '#111', fontSize: '1.1rem' }}>Business Intelligence</div>
                   <div style={{ color: '#64748b', fontWeight: '500', marginTop: '4px' }}>Access comprehensive analytics on revenue trends and customer behavior.</div>
                </div>
             </div>
          </div>
        </div>

        {/* Decorative element */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,190,116,0.05) 0%, transparent 70%)' }}></div>
      </div>
    </div>
  );
}
