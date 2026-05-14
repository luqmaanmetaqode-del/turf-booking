import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer style={{
      background: '#f7f7f7',
      borderTop: '1px solid #e8e8e8',
      padding: '4rem 2rem 2rem',
      marginTop: '4rem',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '2.5rem',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        {/* Logo */}
        <div>
          <img src={logo} alt="TurfX" style={{ height: '80px', objectFit: 'contain', marginBottom: '1rem' }} />
          <p style={{ color: '#999', fontSize: '0.85rem', lineHeight: 1.7 }}>
            © 2024 MetaQode Technologies<br />Pvt. Ltd. All Rights Reserved.
          </p>
        </div>

        {/* Company */}
        <div>
          <h4 style={{ color: '#aaa', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            Company
          </h4>
          {[
            { label: 'About Us', path: '/' },
            { label: 'Blogs', path: '/' },
            { label: 'Contact', path: '/' },
            { label: 'Careers', path: '/' },
            { label: 'Partner With Us', path: '/partner/register' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: '14px' }}>
              <Link to={item.path} style={{ color: '#444', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700', letterSpacing: '0.5px' }}
                onMouseEnter={e => e.target.style.color = '#1ebe74'}
                onMouseLeave={e => e.target.style.color = '#444'}
              >
                {item.label.toUpperCase()}
              </Link>
            </div>
          ))}
        </div>

        {/* Social */}
        <div>
          <h4 style={{ color: '#aaa', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            Social
          </h4>
          {[
            { name: 'Instagram', icon: '📸' },
            { name: 'Facebook', icon: '👥' },
            { name: 'LinkedIn', icon: '💼' },
            { name: 'Twitter', icon: '🐦' },
          ].map(item => (
            <div key={item.name} style={{ marginBottom: '14px' }}>
              <Link to="/" style={{ color: '#444', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700', letterSpacing: '0.5px' }}
                onMouseEnter={e => e.target.style.color = '#1ebe74'}
                onMouseLeave={e => e.target.style.color = '#444'}
              >
                {item.name.toUpperCase()}
              </Link>
            </div>
          ))}
        </div>

        {/* Legal */}
        <div>
          <h4 style={{ color: '#aaa', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            Privacy & Terms
          </h4>
          {['FAQs', 'Privacy Policy', 'Terms of Service', 'Cancellation Policy'].map(item => (
            <div key={item} style={{ marginBottom: '14px' }}>
              <Link to="/" style={{ color: '#444', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700', letterSpacing: '0.5px' }}
                onMouseEnter={e => e.target.style.color = '#1ebe74'}
                onMouseLeave={e => e.target.style.color = '#444'}
              >
                {item.toUpperCase()}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid #e0e0e0',
        marginTop: '3rem', paddingTop: '1.5rem',
        maxWidth: '1100px', margin: '3rem auto 0',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
      }}>
        <p style={{ color: '#aaa', fontSize: '0.85rem' }}>
          Powered by <strong style={{ color: '#1ebe74' }}>MetaQode Technologies Pvt. Ltd.</strong>
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Book', 'Play', 'Enjoy'].map(w => (
            <span key={w} style={{ color: '#ccc', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px' }}>
              {w}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
