import { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

export default function OffersSection() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    axios.get(`${API}/offers`)
      .then(res => setOffers(res.data))
      .catch(() => {});
  }, []);

  if (offers.length === 0) return null;

  return (
    <section style={{ padding: '3rem 2rem' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🔥 Exclusive Offers</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Limited time deals you can't miss</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.5rem',
      }}>
        {offers.map(offer => (
          <div key={offer.id} style={{
            background: 'linear-gradient(135deg, #0a3d2e, #1ebe74)',
            borderRadius: '16px', padding: '1.5rem',
            color: 'white', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'white', color: '#0a3d2e',
              borderRadius: '20px', padding: '4px 12px',
              fontWeight: '700', fontSize: '0.85rem',
            }}>{offer.discount}</div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{offer.title}</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>{offer.description}</p>
            <button style={{
              marginTop: '1rem', background: 'white', color: '#0a3d2e',
              border: 'none', padding: '8px 20px', borderRadius: '8px',
              cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
            }}>Claim Offer</button>
          </div>
        ))}
      </div>
    </section>
  );
}