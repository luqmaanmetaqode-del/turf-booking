import { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5001/api';

export default function OffersSection() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    axios.get(`${API}/offers`)
      .then(res => setOffers(res.data))
      .catch(() => {});
  }, []);

  if (offers.length === 0) return null;

  return (
    <section style={{ padding: '4rem 2rem' }}>
      <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '0.75rem', color: '#111', letterSpacing: '-0.5px' }}>Exclusive Offers</h2>
      <p style={{ color: '#666', marginBottom: '3rem', fontSize: '1rem', fontWeight: '500' }}>Limited time deals for our regular players</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem',
      }}>
        {offers.map(offer => (
          <div key={offer.id} style={{
            background: 'linear-gradient(135deg, #0a3d2e, #1ebe74)',
            borderRadius: '24px', padding: '2rem',
            color: 'white', position: 'relative', overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(30,190,116,0.2)',
          }}>
            <div style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              background: 'white', color: '#0a3d2e',
              borderRadius: '12px', padding: '6px 16px',
              fontWeight: '800', fontSize: '0.9rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}>{offer.discount}</div>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.3rem', fontWeight: '800' }}>{offer.title}</h3>
            <p style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: 1.6, fontWeight: '500' }}>{offer.description}</p>
            <button style={{
              marginTop: '1.5rem', background: 'white', color: '#0a3d2e',
              border: 'none', padding: '12px 28px', borderRadius: '12px',
              cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              Claim Offer
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
