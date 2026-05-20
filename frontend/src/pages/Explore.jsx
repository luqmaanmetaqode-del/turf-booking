import { useEffect, useState } from 'react';
import axios from 'axios';
import TurfCard from '../components/TurfCard';
import { useSearchParams } from 'react-router-dom';

const API = 'https://turfx.metaqode.co.in/api';
const CITIES = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
const ITEMS_PER_PAGE = 9;
const SPORT_FILTERS = [
  { label: '⚡ All', value: 'All' },
  { label: '⚽ Football', value: 'Football' },
  { label: '🏏 Cricket', value: 'Cricket' },
  { label: '🏸 Badminton', value: 'Badminton' },
  { label: '🎾 Tennis', value: 'Tennis' },
];
const SORT_OPTIONS = ['Top Rated', 'Price: Low to High', 'Price: High to Low'];

export default function Explore() {
  const [turfs, setTurfs] = useState([]);
  const [sport, setSport] = useState('All');
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [city, setCity] = useState('All Cities');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('Top Rated');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
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

  useEffect(() => { setCurrentPage(1); }, [sport, search, maxPrice, city, sortBy]);

  const turfsList = Array.isArray(turfs) ? turfs : [];

  let filtered = turfsList.filter(t => {
    const matchSport = sport === 'All' || t.sport === sport;
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase());
    const matchPrice = !maxPrice || t.price_per_hour <= parseInt(maxPrice);
    const matchCity = city === 'All Cities' || t.city.toLowerCase() === city.toLowerCase();
    return matchSport && matchSearch && matchPrice && matchCity;
  });

  // Sort
  if (sortBy === 'Top Rated') filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (sortBy === 'Price: Low to High') filtered = [...filtered].sort((a, b) => a.price_per_hour - b.price_per_hour);
  else if (sortBy === 'Price: High to Low') filtered = [...filtered].sort((a, b) => b.price_per_hour - a.price_per_hour);

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

  const pageBtnStyle = (active) => ({
    width: '40px', height: '40px', borderRadius: '50%',
    border: active ? 'none' : '1.5px solid #e5e7eb',
    background: active ? '#084734' : 'white',
    color: active ? '#CEF17B' : '#161616',
    fontWeight: active ? '800' : '500',
    fontSize: '0.9rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
    fontFamily: "'DM Sans', sans-serif",
  });

  return (
    <div style={{ background: '#F8FAF7', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#084734', padding: '3rem 2rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#CEF17B', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '20px', height: '2px', background: '#CEF17B' }}></span>
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
        {/* Search Bar */}
        <div style={{
          display: 'flex', gap: '0', flexWrap: 'nowrap',
          background: 'white', borderRadius: '16px',
          border: '1px solid #e5e7eb', marginBottom: '2rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          overflow: 'hidden', alignItems: 'center',
        }}>
          {/* City */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 20px', borderRight: '1px solid #e5e7eb', minWidth: '160px' }}>
            <span style={{ fontSize: '1rem' }}>📍</span>
            <select value={city} onChange={e => setCity(e.target.value)} style={{
              border: 'none', outline: 'none', fontSize: '0.9rem',
              fontWeight: '600', color: '#161616', background: 'transparent',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 20px', flex: 1, borderRight: '1px solid #e5e7eb' }}>
            <span style={{ color: '#98A2B3', fontSize: '1rem' }}>🔍</span>
            <input placeholder="Search by name, location or city..." value={search}
              onChange={e => setSearch(e.target.value)} style={{
                border: 'none', outline: 'none', fontSize: '0.9rem', width: '100%',
                fontWeight: '400', color: '#161616', background: 'transparent',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>

          {/* Price slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderRight: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '0.82rem', color: '#98A2B3', fontWeight: '600', whiteSpace: 'nowrap' }}>Max price</span>
            <input type="range" min="0" max="5000" step="100"
              value={maxPrice || 5000}
              onChange={e => setMaxPrice(e.target.value === '5000' ? '' : e.target.value)}
              style={{ width: '100px', accentColor: '#084734' }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#161616', whiteSpace: 'nowrap' }}>
              ₹{maxPrice || '2000'}/hr
            </span>
          </div>

          {/* Search button */}
          <button onClick={() => setCurrentPage(1)} style={{
            background: '#084734', color: '#CEF17B', border: 'none',
            padding: '14px 28px', fontSize: '0.9rem',
            fontWeight: '700', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#0a5c3e'}
            onMouseLeave={e => e.currentTarget.style.background = '#084734'}
          >
            🔍 Search
          </button>
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Sport filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {SPORT_FILTERS.map(s => (
              <button key={s.value} onClick={() => setSport(s.value)} style={{
                background: sport === s.value ? '#161616' : 'white',
                color: sport === s.value ? 'white' : '#161616',
                border: `1.5px solid ${sport === s.value ? '#161616' : '#e5e7eb'}`,
                padding: '8px 18px', borderRadius: '50px',
                fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
              }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Right side: count + sort + view toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.88rem', color: '#98A2B3', fontWeight: '500' }}>
              {filtered.length} venues found
            </span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
              padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
              fontSize: '0.85rem', fontWeight: '600', color: '#161616',
              background: 'white', cursor: 'pointer', outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            {/* Grid/List toggle */}
            <div style={{ display: 'flex', border: '1.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
              <button onClick={() => setViewMode('grid')} style={{
                padding: '8px 12px', border: 'none', cursor: 'pointer',
                background: viewMode === 'grid' ? '#084734' : 'white',
                color: viewMode === 'grid' ? '#CEF17B' : '#98A2B3',
                fontSize: '1rem', transition: 'all 0.2s',
              }}>⊞</button>
              <button onClick={() => setViewMode('list')} style={{
                padding: '8px 12px', border: 'none', cursor: 'pointer',
                background: viewMode === 'list' ? '#084734' : 'white',
                color: viewMode === 'list' ? '#CEF17B' : '#98A2B3',
                fontSize: '1rem', transition: 'all 0.2s',
              }}>☰</button>
            </div>
          </div>
        </div>

        {/* Turf Grid/List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <p style={{ color: '#98A2B3', fontSize: '1.1rem', fontWeight: '600' }}>Fetching premium venues...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#98A2B3' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟</div>
            <p style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', fontFamily: "'Sora', sans-serif" }}>No venues match your criteria</p>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Try adjusting your filters or search term</p>
            <button onClick={() => { setSport('All'); setCity('All Cities'); setSearch(''); setMaxPrice(''); }}
              style={{ background: '#084734', color: '#CEF17B', border: 'none', padding: '12px 28px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div style={{
              display: viewMode === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
              flexDirection: viewMode === 'list' ? 'column' : undefined,
              gap: '1.5rem',
            }}>
              {paginated.map(turf => <TurfCard key={turf._id} turf={turf} listView={viewMode === 'list'} />)}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '3rem', flexWrap: 'wrap' }}>
                <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                  disabled={currentPage === 1}
                  style={{ ...pageBtnStyle(false), opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
                  ←
                </button>
                {getPageNumbers().map(page => (
                  <button key={page} onClick={() => { setCurrentPage(page); window.scrollTo(0, 0); }}
                    style={pageBtnStyle(currentPage === page)}
                    onMouseEnter={e => { if (currentPage !== page) { e.currentTarget.style.background = '#DCEFB8'; e.currentTarget.style.borderColor = '#084734'; } }}
                    onMouseLeave={e => { if (currentPage !== page) { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e5e7eb'; } }}
                  >{page}</button>
                ))}
                <button onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                  disabled={currentPage === totalPages}
                  style={{ ...pageBtnStyle(false), opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
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
