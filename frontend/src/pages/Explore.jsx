import { useEffect, useState } from 'react';
import axios from 'axios';
import TurfCard from '../components/TurfCard';
import SportFilter from '../components/SportFilter';
import { useSearchParams } from 'react-router-dom';

const API = 'https://turfx.metaqode.co.in/api';
const CITIES = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
const ITEMS_PER_PAGE = 9;

export default function Explore() {
  const [turfs, setTurfs] = useState([]);
  const [sport, setSport] = useState('All');
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [city, setCity] = useState('All Cities');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cityParam = searchParams.get('city');
    const sportParam = searchParams.get('sport');
    if (cityParam) setCity(cityParam);
    if (sportParam) setSport(sportParam);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/turfs`)
      .then(res => {
        const turfData = Array.isArray(res.data) ? res.data : (res.data.turfs || []);
        setTurfs(turfData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [sport, search, maxPrice, city]);

  const turfsList = Array.isArray(turfs) ? turfs : [];

  const filtered = turfsList.filter(t => {
    const matchSport = sport === 'All' || t.sport === sport;
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase());
    const matchPrice = !maxPrice || t.price_per_hour <= parseInt(maxPrice);
    const matchCity = city === 'All Cities' || t.city.toLowerCase() === city.toLowerCase();
    return matchSport && matchSearch && matchPrice && matchCity;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const btnStyle = (active) => ({
    width: '40px', height: '40px', borderRadius: '50%',
    border: active ? 'none' : '1.5px solid #e5e7eb',
    background: active ? '#084734' : 'white',
    color: active ? '#CEF17B' : '#161616',
    fontWeight: active ? '800' : '500',
    fontSize: '0.9rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ background: '#F8FAF7', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#084734', padding: '3rem 2rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#CEF17B', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
            Explore venues
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '900', color: 'white', marginBottom: '8px', fontFamily: "'Sora', sans-serif" }}>
            Find Your <span style={{ color: '#CEF17B' }}>Perfect</span> Arena
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem' }}>
            Book premium sports turfs near you — football, cricket, badminton & more
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Search & Filter Bar */}
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap',
          background: 'white', padding: '1.25rem 1.5rem',
          borderRadius: '16px', border: '1px solid #e5e7eb',
          marginBottom: '2rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          alignItems: 'center',
        }}>
          <select value={city} onChange={e => setCity(e.target.value)} style={{
            padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
            fontSize: '0.9rem', background: 'white', cursor: 'pointer',
            fontWeight: '600', color: '#161616', outline: 'none',
          }}>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>

          <input placeholder="Search by name, location or city..." value={search}
            onChange={e => setSearch(e.target.value)} style={{
              flex: 1, padding: '10px 16px', borderRadius: '10px',
              border: '1.5px solid #e5e7eb', fontSize: '0.9rem', minWidth: '200px',
              fontWeight: '500', outline: 'none', background: 'white',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: '#98A2B3', fontWeight: '600', whiteSpace: 'nowrap' }}>
              Max price
            </span>
            <input type="range" min="0" max="5000" step="100"
              value={maxPrice || 5000}
              onChange={e => setMaxPrice(e.target.value === '5000' ? '' : e.target.value)}
              style={{ width: '120px', accentColor: '#084734' }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#161616', whiteSpace: 'nowrap' }}>
              ₹{maxPrice || '5000'}/hr
            </span>
          </div>

          <button onClick={() => { setSport('All'); setCity('All Cities'); setSearch(''); setMaxPrice(''); }}
            style={{
              background: '#084734', color: '#CEF17B', border: 'none',
              padding: '10px 24px', borderRadius: '10px', fontSize: '0.9rem',
              fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
            🔍 Search
          </button>
        </div>

        {/* Results header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <SportFilter selected={sport} onSelect={setSport} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#98A2B3', fontWeight: '500' }}>
              {filtered.length} venues found
            </span>
          </div>
        </div>

        {/* Turf Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <p style={{ color: '#98A2B3', fontSize: '1.1rem', fontWeight: '600' }}>Fetching premium venues...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#98A2B3' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟</div>
            <p style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>No venues match your criteria</p>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Try adjusting your filters or search term to find available turfs</p>
            <button onClick={() => { setSport('All'); setCity('All Cities'); setSearch(''); setMaxPrice(''); }}
              style={{ background: '#084734', color: '#CEF17B', border: 'none', padding: '12px 28px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {paginated.map(turf => <TurfCard key={turf._id} turf={turf} />)}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '3rem', flexWrap: 'wrap' }}>
                {/* Prev */}
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                  disabled={currentPage === 1}
                  style={{ ...btnStyle(false), opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  ←
                </button>

                {/* Page numbers */}
                {getPageNumbers().map(page => (
                  <button key={page}
                    onClick={() => { setCurrentPage(page); window.scrollTo(0, 0); }}
                    style={btnStyle(currentPage === page)}
                    onMouseEnter={e => { if (currentPage !== page) { e.currentTarget.style.background = '#DCEFB8'; e.currentTarget.style.borderColor = '#084734'; } }}
                    onMouseLeave={e => { if (currentPage !== page) { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e5e7eb'; } }}
                  >
                    {page}
                  </button>
                ))}

                {/* Next */}
                <button
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                  disabled={currentPage === totalPages}
                  style={{ ...btnStyle(false), opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
