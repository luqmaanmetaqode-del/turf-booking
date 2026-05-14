import { useEffect, useState } from 'react';
import axios from 'axios';
import TurfCard from '../components/TurfCard';
import SportFilter from '../components/SportFilter';
import { useSearchParams } from 'react-router-dom';

const API = 'http://localhost:5001/api';

const CITIES = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];

export default function Explore() {
  const [turfs, setTurfs] = useState([]);
  const [sport, setSport] = useState('All');
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [city, setCity] = useState('All Cities');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cityParam = searchParams.get('city');
    if (cityParam) setCity(cityParam);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/turfs`)
      .then(res => { 
        // Handle both array response and object with turfs property
        const turfData = Array.isArray(res.data) ? res.data : (res.data.turfs || []);
        setTurfs(turfData); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  // Ensure turfs is always an array
  const turfsList = Array.isArray(turfs) ? turfs : [];
  
  const filtered = turfsList.filter(t => {
    const matchSport = sport === 'All' || t.sport === sport;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase());
    const matchPrice = maxPrice ? t.price_per_hour <= parseInt(maxPrice) : true;
    const matchCity = city === 'All Cities' || t.city.toLowerCase() === city.toLowerCase();
    return matchSport && matchSearch && matchPrice && matchCity;
  });

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1240px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.75rem', color: '#111', letterSpacing: '-1px' }}>Explore Venues</h2>
      <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '1.05rem', fontWeight: '500' }}>Find and book the perfect arena for your game</p>

      {/* Search & Filter Bar */}
      <div style={{
        display: 'flex', gap: '1.25rem', flexWrap: 'wrap',
        background: 'white', padding: '1.5rem',
        borderRadius: '24px', border: '1px solid #eee',
        marginBottom: '2.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      }}>
        {/* City dropdown */}
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          style={{
            padding: '12px 18px', borderRadius: '14px',
            border: '1.5px solid #eee', fontSize: '0.95rem',
            background: '#f8fafc', cursor: 'pointer',
            fontWeight: '700', color: '#111',
            outline: 'none',
          }}
        >
          {CITIES.map(c => <option key={c}>{c}</option>)}
        </select>

        <input
          placeholder="Search by name, location or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, padding: '12px 20px', borderRadius: '14px',
            border: '1.5px solid #f1f5f9', fontSize: '1rem', minWidth: '250px',
            fontWeight: '600', outline: 'none', background: '#f8fafc',
          }}
        />
        <input
          placeholder="Max price"
          type="number"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          style={{
            width: '140px', padding: '12px 18px', borderRadius: '14px',
            border: '1.5px solid #f1f5f9', fontSize: '1rem',
            fontWeight: '700', background: '#f8fafc', outline: 'none',
          }}
        />
      </div>

      <SportFilter selected={sport} onSelect={setSport} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
           <p style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: '600' }}>Fetching premium venues...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: '700' }}>No venues match your criteria.</p>
          <button onClick={() => { setSport('All'); setCity('All Cities'); setSearch(''); setMaxPrice(''); }} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: '#1ebe74', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>Clear All Filters</button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2.5rem',
          marginTop: '2rem',
        }}>
          {filtered.map(turf => <TurfCard key={turf._id} turf={turf} />)}
        </div>
      )}
    </div>
  );
}
