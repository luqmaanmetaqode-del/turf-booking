import { useEffect, useState } from 'react';
import axios from 'axios';
import TurfCard from '../components/TurfCard';
import StatsBar from '../components/StatsBar';
import HowItWorks from '../components/HowItWorks';
import OffersSection from '../components/OffersSection';
import SportFilter from '../components/SportFilter';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const API = 'http://localhost:5000/api';

const POPULAR_CITIES = [
  { name: 'Bengaluru', emoji: '🏙️' },
  { name: 'Mumbai', emoji: '🌊' },
  { name: 'Delhi', emoji: '🕌' },
  { name: 'Hyderabad', emoji: '💎' },
  { name: 'Chennai', emoji: '🏖️' },
  { name: 'Pune', emoji: '🎓' },
  { name: 'Kolkata', emoji: '🎭' },
  { name: 'Ahmedabad', emoji: '🪁' },
];

const SPORTS = [
  { name: 'Football', emoji: '⚽' },
  { name: 'Cricket', emoji: '🏏' },
  { name: 'Badminton', emoji: '🏸' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Basketball', emoji: '🏀' },
];

export default function Home() {
  const [turfs, setTurfs] = useState([]);
  const [sport, setSport] = useState('All');
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/turfs`)
      .then(res => setTurfs(res.data))
      .catch(err => console.error('Failed to fetch turfs:', err));
  }, []);

  const fetchNearby = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await axios.get(
          `${API}/turfs/nearby?lat=${latitude}&lng=${longitude}&radius=10000`
        );
        setTurfs(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }, () => {
      alert('Location access denied');
      setLoading(false);
    });
  };

  const filtered = sport === 'All' ? turfs : turfs.filter(t => t.sport === sport);

  return (
    <div style={{ background: '#fafafa' }}>

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #062c1e 0%, #0a3d2e 40%, #1ebe74 100%)',
        padding: '5rem 2rem 4rem',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(30,190,116,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(30,190,116,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <img src={logo} alt="TurfX" style={{ height: '160px', objectFit: 'contain', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))' }} />

        <h1 style={{
          fontSize: '3.5rem', fontWeight: '900',
          marginBottom: '1rem', letterSpacing: '-2px',
          lineHeight: 1.1,
        }}>
          Book • Play • Enjoy
        </h1>
        <p style={{
          fontSize: '1rem', opacity: 0.7,
          letterSpacing: '3px', fontWeight: '600',
          marginBottom: '1rem',
        }}>
          ONE TURF. EVERY GAME.
        </p>
        <p style={{ fontSize: '1.1rem', opacity: 0.85, marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>
          Find and book premium sports turfs near you in seconds.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <button onClick={() => navigate('/explore')} style={{
            background: 'white', color: '#0a3d2e',
            border: 'none', padding: '16px 40px',
            borderRadius: '50px', fontSize: '1rem',
            fontWeight: '800', cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            transition: 'all 0.2s',
            letterSpacing: '0.5px',
          }}>
            🏟️ Book a Turf
          </button>
          <button onClick={fetchNearby} style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.5)',
            padding: '16px 40px',
            borderRadius: '50px', fontSize: '1rem',
            fontWeight: '700', cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s',
          }}>
            {loading ? '⏳ Locating...' : '📍 Near Me'}
          </button>
        </div>

        {/* Sport Quick Select */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {SPORTS.map(s => (
            <button
              key={s.name}
              onClick={() => { setSport(s.name); navigate('/explore'); }}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'white', padding: '10px 20px',
                borderRadius: '50px', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: '600',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.12)'}
            >
              {s.emoji} {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* STATS */}
      <StatsBar />

      {/* POPULAR CITIES */}
      <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111' }}>
          Popular Cities
        </h2>
        <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Find turfs in your city
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '1rem',
        }}>
          {POPULAR_CITIES.map(c => (
            <div
              key={c.name}
              onClick={() => { setSelectedCity(c.name); navigate(`/explore?city=${c.name}`); }}
              style={{
                background: selectedCity === c.name ? '#f0fdf4' : 'white',
                border: `2px solid ${selectedCity === c.name ? '#1ebe74' : '#eee'}`,
                borderRadius: '16px', padding: '1.25rem 1rem',
                textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1ebe74'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = selectedCity === c.name ? '#1ebe74' : '#eee'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{c.emoji}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: selectedCity === c.name ? '#1ebe74' : '#333' }}>
                {c.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED TURFS */}
      <div style={{ padding: '1rem 2rem 3rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111' }}>Featured Turfs</h2>
          <button
            onClick={() => navigate('/explore')}
            style={{
              background: 'none', border: '1.5px solid #1ebe74',
              color: '#1ebe74', padding: '8px 20px',
              borderRadius: '25px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: '700',
            }}
          >
            View All →
          </button>
        </div>
        <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Top rated venues near you</p>

        <SportFilter selected={sport} onSelect={setSport} />

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟️</div>
            <p>No turfs found. Try a different sport or city.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem',
          }}>
            {filtered.slice(0, 6).map(turf => <TurfCard key={turf.id} turf={turf} />)}
          </div>
        )}
      </div>

      {/* HOW IT WORKS */}
      <HowItWorks />

      {/* OFFERS */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <OffersSection />
      </div>

    </div>
  );
}