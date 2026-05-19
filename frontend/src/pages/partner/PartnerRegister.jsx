import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/logo.png';

const API = 'https://turfx.metaqode.co.in/api';

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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: '100%', padding: '14px 18px', borderRadius: '10px',
    border: '1.5px solid #DCEFB8', fontSize: '0.95rem',
    outline: 'none', transition: '0.2s', boxSizing: 'border-box',
    fontWeight: '600', background: 'white', color: '#161616'
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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAF7', fontFamily: "'Inter', sans-serif" }}>
      {/* LEFT: REGISTRATION FORM */}
      <div style={{ width: '580px', background: 'white', display: 'flex', flexDirection: 'column', padding: '3rem 4rem', justifyContent: 'center', boxShadow: '10px 0 30px rgba(0,0,0,0.02)', zIndex: 10 }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Link to="/"><img src={logo} alt="TurfX" style={{ height: '32px' }} /></Link>
            <span style={{ fontWeight: '700', fontSize: '0.8rem', color: '#CEF17B', letterSpacing: '1.5px', background: '#DCEFB8', padding: '4px 10px', borderRadius: '6px' }}>PARTNER PORTAL</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#161616', marginBottom: '8px', letterSpacing: '-0.5px' }}>Partner Registration</h2>
          <p style={{ color: '#98A2B3', fontWeight: '500', fontSize: '1rem' }}>Join our network of premium venue partners and accelerate your business growth.</p>
        </div>

        {error && <div style={{ background: '#fff1f2', color: '#be123c', padding: '14px', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '700', textAlign: 'center', border: '1px solid #fecdd3' }}>{error}</div>}

        <form onSubmit={handleRegister}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '1.2rem' }}>
            <div>
               <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#98A2B3', marginBottom: '8px', textTransform: 'uppercase' }}>Full Name *</label>
               <input type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} required />
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#98A2B3', marginBottom: '8px', textTransform: 'uppercase' }}>Turf Name</label>
               <input type="text" placeholder="Turf Empire" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#98A2B3', marginBottom: '8px', textTransform: 'uppercase' }}>Mobile Number *</label>
             <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ ...inputStyle, width: '75px', textAlign: 'center', background: '#F8FAF7', border: '1.5px solid #DCEFB8' }}>+91</div>
                <input type="tel" placeholder="98765 43210" value={formData.phone} maxLength={10} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g,'')})} style={inputStyle} required />
             </div>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#98A2B3', marginBottom: '8px', textTransform: 'uppercase' }}>Email Address</label>
             <input type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#98A2B3', marginBottom: '8px', textTransform: 'uppercase' }}>Create Password *</label>
             <div style={{ position: 'relative' }}>
               <input 
                 type={showPassword ? "text" : "password"} 
                 placeholder="••••••••" 
                 value={formData.password} 
                 onChange={e => setFormData({...formData, password: e.target.value})} 
                 style={inputStyle} 
                 required 
               />
               <button
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 style={{
                   position: 'absolute',
                   right: '16px',
                   top: '50%',
                   transform: 'translateY(-50%)',
                   background: 'none',
                   border: 'none',
                   cursor: 'pointer',
                   color: '#98A2B3',
                   padding: '4px',
                   display: 'flex',
                   alignItems: 'center',
                 }}
               >
                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
             </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', background: '#CEF17B', color: '#084734', border: 'none', padding: '18px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '1.1rem', transition: '0.3s', boxShadow: '0 10px 25px rgba(30,190,116,0.25)' }}>
            {loading ? 'Creating Account...' : 'Register as Partner'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
           <p style={{ color: '#98A2B3', fontSize: '0.95rem', fontWeight: '500' }}>
             Already a registered partner? <Link to="/partner/login" style={{ color: '#CEF17B', fontWeight: '800', textDecoration: 'none' }}>Sign in to your account</Link>
           </p>
        </div>
      </div>

      {/* RIGHT: BRANDING & FEATURES */}
      <div style={{ flex: 1, background: '#F8FAF7', padding: '5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '500px' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '900', color: '#161616', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-1px' }}>
            Transform Your<br /><span style={{ color: '#CEF17B' }}>Venue Business</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#98A2B3', marginBottom: '3rem', fontWeight: '500' }}>Join 500+ venue partners who have scaled their operations and maximized revenue with TurfX.</p>
          
          <div>
             <div style={featureItemStyle}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#CEF17B', color: '#084734', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '800', boxShadow: '0 8px 16px rgba(30,190,116,0.2)' }}>✓</div>
                <div>
                   <div style={{ fontWeight: '800', color: '#161616', fontSize: '1.1rem' }}>Rapid Onboarding</div>
                   <div style={{ color: '#98A2B3', fontWeight: '500', marginTop: '4px' }}>Get your venue live and accepting bookings within 24 hours.</div>
                </div>
             </div>
             <div style={featureItemStyle}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#CEF17B', color: '#084734', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '800', boxShadow: '0 8px 16px rgba(30,190,116,0.2)' }}>✓</div>
                <div>
                   <div style={{ fontWeight: '800', color: '#161616', fontSize: '1.1rem' }}>Performance-Based Pricing</div>
                   <div style={{ color: '#98A2B3', fontWeight: '500', marginTop: '4px' }}>Zero setup fees. Pay only when you receive confirmed bookings.</div>
                </div>
             </div>
             <div style={featureItemStyle}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#CEF17B', color: '#084734', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '800', boxShadow: '0 8px 16px rgba(30,190,116,0.2)' }}>✓</div>
                <div>
                   <div style={{ fontWeight: '800', color: '#161616', fontSize: '1.1rem' }}>Business Intelligence</div>
                   <div style={{ color: '#98A2B3', fontWeight: '500', marginTop: '4px' }}>Access comprehensive analytics on revenue trends and customer behavior.</div>
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
