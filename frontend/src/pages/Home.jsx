import { useEffect, useState } from 'react';
import axios from 'axios';
import TurfCard from '../components/TurfCard';
import StatsBar from '../components/StatsBar';
import HowItWorks from '../components/HowItWorks';
import OffersSection from '../components/OffersSection';
import SportFilter from '../components/SportFilter';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const API = 'http://localhost:5001/api';

const POPULAR_CITIES = [
  { name: 'Bengaluru' },
  { name: 'Mumbai' },
  { name: 'Delhi' },
  { name: 'Hyderabad' },
  { name: 'Chennai' },
  { name: 'Pune' },
  { name: 'Kolkata' },
  { name: 'Ahmedabad' },
];

const SPORTS = [
  { name: 'Football' },
  { name: 'Cricket' },
  { name: 'Badminton' },
  { name: 'Tennis' },
  { name: 'Basketball' },
];

export default function Home() {
  const [turfs, setTurfs] = useState([]);
  const [sport, setSport] = useState('All');
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/turfs`)
      .then(res => {
        // Handle both array response and object with turfs property
        const turfData = Array.isArray(res.data) ? res.data : (res.data.turfs || []);
        setTurfs(turfData);
      })
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
        // Handle both array response and object with turfs property
        const turfData = Array.isArray(res.data) ? res.data : (res.data.turfs || []);
        setTurfs(turfData);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }, () => {
      alert('Location access denied');
      setLoading(false);
    });
  };

  // Ensure turfs is always an array
  const turfsList = Array.isArray(turfs) ? turfs : [];
  const filtered = sport === 'All' ? turfsList : turfsList.filter(t => t.sport === sport);

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
          fontSize: '3.5rem', fontWeight: '800',
          marginBottom: '1rem', letterSpacing: '-2px',
          lineHeight: 1.1,
        }}>
          Book Play Enjoy
        </h1>
        <p style={{
          fontSize: '1rem', opacity: 0.7,
          letterSpacing: '3px', fontWeight: '500',
          marginBottom: '1rem',
        }}>
          ONE TURF. EVERY GAME.
        </p>
        <p style={{ fontSize: '1.1rem', opacity: 0.85, marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem', fontWeight: '400' }}>
          Find and book premium sports turfs near you in seconds.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <button onClick={() => navigate('/explore')} style={{
            background: 'white', color: '#0a3d2e',
            border: 'none', padding: '18px 48px',
            borderRadius: '50px', fontSize: '1.05rem',
            fontWeight: '800', cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            transition: 'all 0.3s',
            letterSpacing: '0.5px',
          }}>
            Book a Turf
          </button>
          <button onClick={fetchNearby} style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.5)',
            padding: '18px 48px',
            borderRadius: '50px', fontSize: '1.05rem',
            fontWeight: '700', cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
          }}>
            {loading ? 'Locating...' : 'Venues Near Me'}
          </button>
        </div>

        {/* Sport Quick Select */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {SPORTS.map(s => (
            <button
              key={s.name}
              onClick={() => { setSport(s.name); navigate('/explore'); }}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'white', padding: '12px 24px',
                borderRadius: '50px', cursor: 'pointer',
                fontSize: '0.95rem', fontWeight: '700',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.12)'}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* STATS */}
      <StatsBar />

      {/* POPULAR CITIES */}
      <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.75rem', color: '#111' }}>
          Popular Cities
        </h2>
        <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '1rem', fontWeight: '400' }}>
          Find turfs in your city
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '1.25rem',
        }}>
          {POPULAR_CITIES.map(c => (
            <div
              key={c.name}
              onClick={() => { setSelectedCity(c.name); navigate(`/explore?city=${c.name}`); }}
              style={{
                background: selectedCity === c.name ? '#f0fdf4' : 'white',
                border: `2px solid ${selectedCity === c.name ? '#1ebe74' : '#eee'}`,
                borderRadius: '20px', padding: '1.5rem 1rem',
                textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1ebe74'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(30,190,116,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = selectedCity === c.name ? '#1ebe74' : '#eee'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
            >
              <div style={{ fontSize: '1rem', fontWeight: '700', color: selectedCity === c.name ? '#1ebe74' : '#111' }}>
                {c.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED TURFS */}
      <div style={{ padding: '2rem 2rem 5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#111' }}>Featured Turfs</h2>
          <button
            onClick={() => navigate('/explore')}
            style={{
              background: 'none', border: '2px solid #1ebe74',
              color: '#1ebe74', padding: '10px 24px',
              borderRadius: '50px', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: '700',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.background = '#1ebe74'; e.target.style.color = 'white'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#1ebe74'; }}
          >
            View All Venues
          </button>
        </div>
        <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '1rem', fontWeight: '400' }}>Discover top rated sports facilities</p>

        <SportFilter selected={sport} onSelect={setSport} />

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No venues match your current selection.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem',
            marginTop: '2rem',
          }}>
            {filtered.slice(0, 6).map(turf => <TurfCard key={turf._id} turf={turf} />)}
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
