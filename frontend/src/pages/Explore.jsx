import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import TurfCard from '../components/TurfCard';
import SportFilter from '../components/SportFilter';

const API = 'http://localhost:5000/api';

// Simple city list (you can expand later)
const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai'];

export default function Explore() {
  const [turfs, setTurfs] = useState([]);
  const [sport, setSport] = useState('All');
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();

  // Load city from URL
  useEffect(() => {
    const urlCity = searchParams.get('city');
    if (urlCity) setCity(urlCity);
  }, []);

  // Auto detect city using browser location
  useEffect(() => {
    if (city) return; // don't override if already selected

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          // Free reverse geocoding API
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: 'json',
              },
            }
          );

          const detectedCity =
            res.data.address.city ||
            res.data.address.town ||
            res.data.address.state;

          if (detectedCity) {
            setCity(detectedCity);
            setSearchParams({ city: detectedCity });
          }
        } catch (err) {
          console.log('Location detect failed');
        }
      });
    }
  }, [city, setSearchParams]);

  // Fetch turfs
  useEffect(() => {
    axios.get(`${API}/turfs`)
      .then(res => {
        setTurfs(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Handle city change
  const handleCityChange = (value) => {
    setCity(value);
    setSearchParams(value ? { city: value } : {});
  };

  // Filtering
  const filtered = turfs.filter(t => {
    const matchSport = sport === 'All' || t.sport === sport;

    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase());

    const matchPrice = maxPrice
      ? t.price_per_hour <= parseInt(maxPrice)
      : true;

    const matchCity = city
      ? t.location.toLowerCase().includes(city.toLowerCase())
      : true;

    return matchSport && matchSearch && matchPrice && matchCity;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
        Explore Turfs {city && `in ${city}`}
      </h2>

      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Find and book the perfect turf near you
      </p>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        background: 'white',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid #eee',
        marginBottom: '1.5rem',
      }}>

        {/* 🔽 City Dropdown */}
        <select
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid #ddd',
          }}
        >
          <option value="">All Cities</option>
          {cities.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Search */}
        <input
          placeholder="🔍 Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid #ddd',
            minWidth: '200px',
          }}
        />

        {/* Price */}
        <input
          type="number"
          placeholder="Max ₹/hr"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          style={{
            width: '150px',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid #ddd',
          }}
        />
      </div>

      <SportFilter selected={sport} onSelect={setSport} />

      {/* Results */}
      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No turfs found</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {filtered.map(t => (
            <TurfCard key={t.id} turf={t} />
          ))}
        </div>
      )}
    </div>
  );
}