import { useState } from 'react';
import axios from 'axios';
import { Search, Plus, Star, MapPin, Edit2, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = 'https://turfx.metaqode.co.in/api';

const GREEN = '#084734';
const LIME  = '#CEF17B';

const SPORT_ICONS = {
  football:   '⚽',
  cricket:    '🏏',
  badminton:  '🏸',
  tennis:     '🎾',
  basketball: '🏀',
  volleyball: '🏐',
};

function sportIcon(sport) {
  return SPORT_ICONS[(sport || '').toLowerCase()] || '🏟️';
}

export default function PartnerVenues({ data, onAddClick, onTabChange }) {
  const { token } = useAuth();
  const [search, setSearch]       = useState('');
  const [sportFilter, setSport]   = useState('All Sports');
  const [statusFilter, setStatus] = useState('All Status');
  const [activeTab, setActiveTab] = useState('All');

  const turfs = data?.turfs || [];

  /* ── filter helpers ── */
  const filtered = turfs.filter(t => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.location || '').toLowerCase().includes(search.toLowerCase());
    const matchSport  = sportFilter === 'All Sports' || (t.sport || '').toLowerCase() === sportFilter.toLowerCase();
    const matchStatus = statusFilter === 'All Status' || (t.isActive !== false ? 'Active' : 'Inactive') === statusFilter;
    const matchTab    = activeTab === 'All' ||
      (activeTab === 'Active'  && t.isActive !== false) ||
      (activeTab === 'Pending' && t.status === 'pending');
    return matchSearch && matchSport && matchStatus && matchTab;
  });

  const activeCount  = turfs.filter(t => t.isActive !== false).length;
  const pendingCount = turfs.filter(t => t.status === 'pending').length;

  /* ── empty state ── */
  if (turfs.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: '20px', border: '1.5px solid #E9EDE8', padding: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏟️</div>
        <h3 style={{ fontWeight: '800', fontSize: '1.5rem', color: '#0D1F0F', marginBottom: '12px' }}>No Venues Yet</h3>
        <p style={{ color: '#9CA3AF', marginBottom: '2rem' }}>Add your first venue to start accepting bookings.</p>
        <button onClick={onAddClick} style={btnPrimary}>
          <Plus size={18} /> Add Your First Venue
        </button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9CA3AF', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
            — MY PORTFOLIO
          </p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0D1F0F', margin: 0 }}>Your Venues</h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.88rem', marginTop: '4px' }}>
            Manage, edit, and track all your listed sports venues
          </p>
        </div>
        <button onClick={onAddClick} style={btnPrimary}>
          <Plus size={18} /> Add New Venue
        </button>
      </div>

      {/* ── FILTERS ROW ── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search venues..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 40px', borderRadius: '12px',
              border: '1.5px solid #E9EDE8', fontSize: '0.88rem', outline: 'none',
              fontWeight: '500', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Sport filter */}
        <select value={sportFilter} onChange={e => setSport(e.target.value)} style={selectStyle}>
          <option>All Sports</option>
          <option>Football</option>
          <option>Cricket</option>
          <option>Badminton</option>
          <option>Tennis</option>
        </select>

        {/* Status filter */}
        <select value={statusFilter} onChange={e => setStatus(e.target.value)} style={selectStyle}>
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Pending</option>
        </select>

        {/* Tab pills */}
        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
          {[
            { label: `All (${turfs.length})`,       key: 'All' },
            { label: `Active (${activeCount})`,      key: 'Active' },
            { label: `Pending (${pendingCount})`,    key: 'Pending' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '8px 16px', borderRadius: '10px', border: '1.5px solid',
                borderColor: activeTab === t.key ? GREEN : '#E9EDE8',
                background: activeTab === t.key ? GREEN : '#fff',
                color: activeTab === t.key ? LIME : '#6B7280',
                fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── VENUE CARDS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filtered.map(turf => (
          <VenueCard
            key={turf._id}
            turf={turf}
            bookings={data?.bookings}
            token={token}
            onTabChange={onTabChange}
          />
        ))}

        {/* Add new venue card */}
        <div
          onClick={onAddClick}
          style={{
            background: '#fff', borderRadius: '20px',
            border: '2px dashed #D1D5DB', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '3rem 2rem', cursor: 'pointer', minHeight: '320px',
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: '#F0FDF4', display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: '1rem',
          }}>
            <Plus size={28} color={GREEN} />
          </div>
          <h4 style={{ fontWeight: '800', fontSize: '1rem', color: '#0D1F0F', marginBottom: '8px' }}>Add a New Venue</h4>
          <p style={{ color: '#9CA3AF', fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            List another sports venue and start earning from more bookings
          </p>
          <button style={btnPrimary}>+ Add Venue</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VENUE CARD  (matches the design mockup)
───────────────────────────────────────────── */
function VenueCard({ turf, bookings, token, onTabChange }) {
  const { token: authToken } = useAuth();
  const tk = token || authToken;

  const [isActive, setIsActive]   = useState(turf.isActive !== false);

  const turfBookings = bookings?.filter(b =>
    (b.turf_id?._id || b.turf_id) === turf._id
  ) || [];

  const totalEarned = turfBookings
    .filter(b => b.status !== 'cancelled')
    .reduce((s, b) => s + (b.total_price || 0), 0);

  const rating    = turf.rating || 4.5;
  const reviews   = turf.reviewCount || 0;
  const amenities = (turf.amenities || []).slice(0, 3);

  // eslint-disable-next-line no-unused-vars
  const handleToggle = async () => {
    try {
      const res = await axios.patch(`${API}/turfs/${turf._id}/status`, {}, {
        headers: { Authorization: `Bearer ${tk}` },
      });
      setIsActive(res.data.isActive);
    } catch {
      /* silent */
    }
  };

  return (
    <div style={{
      background: '#fff', borderRadius: '20px',
      border: '1.5px solid #E9EDE8', overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Image / sport banner */}
      <div style={{ position: 'relative', height: '160px', background: GREEN, overflow: 'hidden' }}>
        {turf.images?.[0] ? (
          <img
            src={turf.images[0]}
            alt={turf.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '4rem',
          }}>
            {sportIcon(turf.sport)}
          </div>
        )}

        {/* Sport badge */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          background: 'rgba(0,0,0,0.55)', color: '#fff',
          fontSize: '0.68rem', fontWeight: '800', letterSpacing: '1px',
          padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase',
        }}>
          {turf.sport || 'Multi-sport'}
        </div>

        {/* Active badge */}
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: isActive ? '#D1FAE5' : '#F3F4F6',
          color: isActive ? '#065F46' : '#6B7280',
          fontSize: '0.68rem', fontWeight: '800',
          padding: '4px 10px', borderRadius: '6px',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#10B981' : '#9CA3AF', display: 'inline-block' }} />
          {isActive ? 'Active' : 'Inactive'}
        </div>

        {/* Rating */}
        {reviews > 0 && (
          <div style={{
            position: 'absolute', bottom: '12px', left: '12px',
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            fontSize: '0.72rem', fontWeight: '700',
            padding: '4px 10px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <Star size={12} fill="#FBBF24" color="#FBBF24" />
            {rating.toFixed(1)} · {reviews} reviews
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0D1F0F', marginBottom: '4px' }}>
          {turf.name}
        </h3>
        <p style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9CA3AF', fontSize: '0.82rem', marginBottom: '1rem' }}>
          <MapPin size={13} /> {turf.location}{turf.city ? `, ${turf.city}` : ''}
        </p>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem', marginBottom: '1rem',
          background: '#F9FAFB', borderRadius: '12px', padding: '0.8rem',
        }}>
          <StatCell label="Bookings" value={turfBookings.filter(b => b.status !== 'cancelled').length} />
          <StatCell
            label="Earned"
            value={totalEarned >= 1000 ? `₹${(totalEarned / 1000).toFixed(0)}K` : `₹${totalEarned}`}
            highlight
          />
          <StatCell label="Per Hour" value={`₹${(turf.price_per_hour || 0).toLocaleString()}`} />
        </div>

        {/* Amenity tags */}
        {amenities.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {amenities.map((a, i) => (
              <span key={i} style={{
                background: '#F0FDF4', color: '#065F46',
                fontSize: '0.7rem', fontWeight: '700',
                padding: '3px 10px', borderRadius: '6px', textTransform: 'capitalize',
              }}>
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <button
            onClick={() => onTabChange?.('bookings')}
            style={{ ...btnPrimary, flex: 1, justifyContent: 'center', padding: '10px' }}
          >
            Manage
          </button>
          <button
            style={{ ...btnOutline, flex: 1, justifyContent: 'center', padding: '10px' }}
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            onClick={() => onTabChange?.('slots')}
            style={{ ...btnOutline, flex: 1, justifyContent: 'center', padding: '10px' }}
          >
            <Settings size={14} /> Slots
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, highlight }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: '0.95rem', fontWeight: '800',
        color: highlight ? GREEN : '#0D1F0F',
      }}>{value}</div>
      <div style={{ fontSize: '0.65rem', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  );
}

/* ── shared styles ── */
const btnPrimary = {
  background: GREEN, color: LIME, border: 'none',
  padding: '10px 20px', borderRadius: '10px',
  fontWeight: '800', fontSize: '0.85rem',
  display: 'flex', alignItems: 'center', gap: '6px',
  cursor: 'pointer',
};

const btnOutline = {
  background: '#fff', color: '#374151',
  border: '1.5px solid #E9EDE8',
  padding: '10px 20px', borderRadius: '10px',
  fontWeight: '700', fontSize: '0.85rem',
  display: 'flex', alignItems: 'center', gap: '6px',
  cursor: 'pointer',
};

const selectStyle = {
  padding: '10px 14px', borderRadius: '12px',
  border: '1.5px solid #E9EDE8', fontSize: '0.88rem',
  fontWeight: '600', color: '#374151', outline: 'none',
  background: '#fff', cursor: 'pointer',
};
