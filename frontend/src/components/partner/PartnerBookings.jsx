import { useState } from 'react';
import axios from 'axios';
import {
  Search, Download, ChevronLeft, ChevronRight,
  Clock, IndianRupee,
  Calendar as CalIcon,
} from 'lucide-react';

const API = 'https://turfx.metaqode.co.in/api';
const GREEN = '#084734';
const LIME  = '#CEF17B';

export default function PartnerBookings({ data, token }) {
  const [activeTab, setActiveTab]   = useState('All Bookings');
  const [search, setSearch]         = useState('');
  const [venueFilter, setVenue]     = useState('All Venues');
  const [sportFilter, setSport]     = useState('All Sports');
  const [dateFilter, setDate]       = useState('All Dates');
  const [cancellingId, setCancelling] = useState(null);
  const [notice, setNotice]         = useState(null);
  const [page, setPage]             = useState(1);
  const PER_PAGE = 8;

  const bookings = data?.bookings || [];
  const today    = new Date().toISOString().split('T')[0];

  const tabs = [
    { label: 'All Bookings', count: bookings.length },
    { label: 'Upcoming',     count: bookings.filter(b => b.date >= today && b.status === 'confirmed').length },
    { label: 'Today',        count: bookings.filter(b => b.date === today).length },
    { label: 'Completed',    count: bookings.filter(b => b.status === 'completed').length },
    { label: 'Cancelled',    count: bookings.filter(b => b.status === 'cancelled').length },
  ];

  const stats = [
    { label: 'Total · Lifetime',    value: bookings.length,                                                          icon: '📅', color: '#3B82F6' },
    { label: 'Upcoming · Active',   value: tabs[1].count,                                                            icon: '🕐', color: '#F59E0B' },
    { label: 'Today · Scheduled',   value: tabs[2].count,                                                            icon: '📆', color: GREEN },
    { label: 'Completed · History', value: tabs[3].count,                                                            icon: '✓',  color: '#10B981' },
    { label: 'Cancelled · Lost',    value: tabs[4].count,                                                            icon: '✕',  color: '#EF4444' },
  ];

  /* ── filter ── */
  const filtered = bookings.filter(b => {
    if (activeTab === 'Upcoming')  return b.date >= today && b.status === 'confirmed';
    if (activeTab === 'Today')     return b.date === today;
    if (activeTab === 'Completed') return b.status === 'completed';
    if (activeTab === 'Cancelled') return b.status === 'cancelled';
    return true;
  }).filter(b => {
    const q = search.toLowerCase();
    if (q && !(
      (b.user_id?.name || '').toLowerCase().includes(q) ||
      (b.user_id?.phone || '').includes(q) ||
      b._id.toLowerCase().includes(q)
    )) return false;
    if (venueFilter !== 'All Venues' && (b.turf_id?.name || '') !== venueFilter) return false;
    if (sportFilter !== 'All Sports' && (b.turf_id?.sport || '').toLowerCase() !== sportFilter.toLowerCase()) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await axios.put(`${API}/owner/bookings/cancel/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotice({ type: 'success', text: 'Booking cancelled.' });
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.msg || 'Failed to cancel.' });
    } finally {
      setCancelling(null);
    }
  };

  /* ── upcoming summary (right panel) ── */
  const upcoming       = bookings.filter(b => b.date >= today && b.status === 'confirmed');
  const upcomingRev    = upcoming.reduce((s, b) => s + (b.total_price || 0), 0);
  const upcomingHours  = upcoming.length;

  /* ── calendar ── */
  const now         = new Date();
  const firstDay    = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const todayDate   = now.getDate();
  const bookedDates = new Set(
    bookings
      .filter(b => b.status !== 'cancelled')
      .map(b => { const d = new Date(b.date); return d.getMonth() === now.getMonth() ? d.getDate() : null; })
      .filter(Boolean)
  );

  /* ── venue names for filter ── */
  const venueNames = [...new Set(bookings.map(b => b.turf_id?.name).filter(Boolean))];
  const sportNames = [...new Set(bookings.map(b => b.turf_id?.sport).filter(Boolean))];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>

      {/* ══════════ LEFT ══════════ */}
      <div>

        {/* TABS + EXPORT */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #E9EDE8' }}>
            {tabs.map(t => (
              <button
                key={t.label}
                onClick={() => { setActiveTab(t.label); setPage(1); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '10px 16px', fontWeight: '700', fontSize: '0.85rem',
                  color: activeTab === t.label ? GREEN : '#9CA3AF',
                  borderBottom: activeTab === t.label ? `3px solid ${GREEN}` : '3px solid transparent',
                  marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.label}
                <span style={{
                  background: activeTab === t.label ? GREEN : '#F3F4F6',
                  color: activeTab === t.label ? LIME : '#9CA3AF',
                  fontSize: '0.7rem', fontWeight: '800',
                  padding: '1px 7px', borderRadius: '20px',
                }}>{t.count}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => window.open(`${API}/exports/bookings/csv`, '_blank')}
            style={{ ...btnOutline, gap: '6px' }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>

        {/* STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '14px',
              border: '1.5px solid #E9EDE8', padding: '1rem',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${s.color}15`, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', flexShrink: 0,
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0D1F0F', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: '600', marginTop: '3px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* NOTICE */}
        {notice && (
          <div style={{
            marginBottom: '1rem', padding: '12px 16px', borderRadius: '10px',
            background: notice.type === 'success' ? '#D1FAE5' : '#FEE2E2',
            color: notice.type === 'success' ? '#065F46' : '#991B1B',
            fontWeight: '700', fontSize: '0.88rem',
          }}>
            {notice.text}
          </div>
        )}

        {/* SEARCH + FILTERS */}
        <div style={{
          background: '#fff', borderRadius: '14px', border: '1.5px solid #E9EDE8',
          padding: '1rem', display: 'flex', gap: '10px', marginBottom: '1.2rem', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search by booking ID, customer name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: '100%', padding: '9px 12px 9px 36px', borderRadius: '10px',
                border: '1.5px solid #E9EDE8', fontSize: '0.85rem', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <select value={venueFilter} onChange={e => setVenue(e.target.value)} style={filterSelect}>
            <option>All Venues</option>
            {venueNames.map(v => <option key={v}>{v}</option>)}
          </select>
          <select value={sportFilter} onChange={e => setSport(e.target.value)} style={filterSelect}>
            <option>All Sports</option>
            {sportNames.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={dateFilter} onChange={e => setDate(e.target.value)} style={filterSelect}>
            <option>All Dates</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
          <button style={{ ...btnOutline, padding: '9px 14px', fontSize: '0.82rem' }}>
            More Filters
          </button>
        </div>

        {/* TABLE */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #E9EDE8', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1.5px solid #E9EDE8' }}>
                {['Booking ID','Customer','Mobile','Venue','Date','Time','Price','Status','Actions'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length > 0 ? paged.map((b, i) => (
                <BookingRow
                  key={b._id}
                  b={b}
                  today={today}
                  onCancel={handleCancel}
                  cancelling={cancellingId === b._id}
                  isLast={i === paged.length - 1}
                />
              )) : (
                <tr>
                  <td colSpan="9" style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF', fontWeight: '600' }}>
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div style={{
            padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', background: '#F9FAFB', borderTop: '1px solid #E9EDE8',
          }}>
            <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: '600' }}>
              Showing {filtered.length} of {bookings.length} bookings
            </span>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} style={pageBtn} disabled={page === 1}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{ ...pageBtn, background: page === p ? GREEN : '#fff', color: page === p ? LIME : '#374151', borderColor: page === p ? GREEN : '#E9EDE8' }}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={pageBtn} disabled={page === totalPages}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ RIGHT SIDEBAR ══════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

        {/* BOOKING CALENDAR */}
        <div style={sideCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0D1F0F', margin: 0 }}>Booking Calendar</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button style={calNavBtn}><ChevronLeft size={14} /></button>
            <span style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0D1F0F' }}>
              {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button style={calNavBtn}><ChevronRight size={14} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', textAlign: 'center' }}>
            {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
              <div key={d} style={{ fontSize: '0.6rem', fontWeight: '700', color: '#9CA3AF', padding: '4px 0' }}>{d}</div>
            ))}
            {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const isToday   = d === todayDate;
              const hasBooking = bookedDates.has(d);
              return (
                <div key={d} style={{
                  fontSize: '0.75rem', fontWeight: '700', padding: '6px 0', borderRadius: '8px',
                  background: isToday ? GREEN : 'transparent',
                  color: isToday ? LIME : '#374151',
                  position: 'relative', cursor: 'pointer',
                }}>
                  {d}
                  {hasBooking && !isToday && (
                    <div style={{ width: '4px', height: '4px', background: GREEN, borderRadius: '50%', margin: '1px auto 0' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* UPCOMING SUMMARY */}
        <div style={sideCard}>
          <h3 style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0D1F0F', marginBottom: '1.2rem' }}>Upcoming Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SummaryRow icon={<CalIcon size={15} />}      label="Total Bookings"     value={upcoming.length.toString()} />
            <SummaryRow icon={<IndianRupee size={15} />}  label="Total Revenue"      value={`₹${upcomingRev.toLocaleString()}`} highlight />
            <SummaryRow icon={<Clock size={15} />}        label="Total Hours Booked" value={`${upcomingHours}h`} />
          </div>
          <button
            onClick={() => setActiveTab('Upcoming')}
            style={{ width: '100%', marginTop: '1.2rem', padding: '10px', borderRadius: '10px', border: '1.5px solid #E9EDE8', background: '#fff', color: GREEN, fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
          >
            View All Bookings →
          </button>
        </div>

        {/* DID YOU KNOW */}
        <div style={{ ...sideCard, background: GREEN, border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span>💡</span>
            <h4 style={{ fontWeight: '800', fontSize: '0.85rem', color: LIME, margin: 0 }}>Did you know?</h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0 }}>
            You have <strong style={{ color: LIME }}>{tabs[2].count} booking{tabs[2].count !== 1 ? 's' : ''}</strong> scheduled for today.
          </p>
          <button
            onClick={() => setActiveTab('Today')}
            style={{ background: 'none', border: 'none', color: LIME, fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', padding: 0, marginTop: '8px', textDecoration: 'underline' }}
          >
            View today's schedule →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BOOKING ROW
───────────────────────────────────────────── */
function BookingRow({ b, today, onCancel, cancelling, isLast }) {
  const statusMap = {
    confirmed:  { bg: '#D1FAE5', color: '#065F46', label: 'TODAY' },
    pending:    { bg: '#FEF3C7', color: '#92400E', label: 'PENDING' },
    completed:  { bg: '#F3F4F6', color: '#6B7280', label: 'COMPLETED' },
    cancelled:  { bg: '#FEE2E2', color: '#DC2626', label: 'CANCELLED' },
    'checked-in': { bg: '#DBEAFE', color: '#1D4ED8', label: 'CHECKED IN' },
  };

  const s      = b.status?.toLowerCase();
  const isToday = b.date === today && s === 'confirmed';
  const badge  = isToday
    ? { bg: '#D1FAE5', color: '#065F46', label: 'TODAY' }
    : statusMap[s] || statusMap['pending'];

  const dateStr = b.date
    ? new Date(b.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const timeStr = Array.isArray(b.time_slots) ? b.time_slots[0] : (b.time_slot || '—');

  const initials = (b.user_id?.name || 'U')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const avatarColors = ['#DBEAFE:#1D4ED8', '#D1FAE5:#065F46', '#FEF3C7:#92400E', '#EDE9FE:#5B21B6', '#FCE7F3:#9D174D'];
  const [abg, afg] = avatarColors[initials.charCodeAt(0) % avatarColors.length].split(':');

  return (
    <tr style={{ borderBottom: isLast ? 'none' : '1px solid #F3F4F6' }}>
      {/* Booking ID */}
      <td style={tdStyle}>
        <span style={{
          fontFamily: 'monospace', fontWeight: '800', fontSize: '0.82rem',
          color: GREEN, background: '#F0FDF4',
          padding: '3px 8px', borderRadius: '6px',
        }}>
          #TFX-{b._id.slice(-4).toUpperCase()}
        </span>
      </td>

      {/* Customer */}
      <td style={tdStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: abg, color: afg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: '800', flexShrink: 0,
          }}>{initials}</div>
          <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#111827' }}>
            {b.user_id?.name || 'Unknown'}
          </span>
        </div>
      </td>

      {/* Mobile */}
      <td style={tdStyle}>
        <span style={{ fontWeight: '600', fontSize: '0.82rem', color: '#374151' }}>
          {b.user_id?.phone
            ? b.user_id.phone.replace('+91', '').replace(/(\d{5})(\d{5})/, '$1 $2')
            : '—'}
        </span>
      </td>

      {/* Venue */}
      <td style={tdStyle}>
        <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#111827' }}>
          {b.turf_id?.name || '—'}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '2px', textTransform: 'capitalize' }}>
          {b.turf_id?.sport || ''}
        </div>
      </td>

      {/* Date */}
      <td style={tdStyle}>
        <span style={{ fontWeight: '700', fontSize: '0.82rem', color: '#111827' }}>{dateStr}</span>
      </td>

      {/* Time */}
      <td style={tdStyle}>
        <span style={{ fontWeight: '600', fontSize: '0.82rem', color: '#374151' }}>{timeStr}</span>
      </td>

      {/* Price */}
      <td style={tdStyle}>
        <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#111827' }}>
          ₹{(b.total_price || 0).toLocaleString()}
        </span>
      </td>

      {/* Status */}
      <td style={tdStyle}>
        <span style={{
          background: badge.bg, color: badge.color,
          fontSize: '0.68rem', fontWeight: '800',
          padding: '4px 10px', borderRadius: '6px',
          letterSpacing: '0.5px',
        }}>
          {badge.label}
        </span>
      </td>

      {/* Actions */}
      <td style={tdStyle}>
        {s === 'confirmed' && (
          <button
            onClick={() => onCancel(b._id)}
            disabled={cancelling}
            style={{
              background: '#FEE2E2', color: '#DC2626',
              border: 'none', padding: '5px 10px', borderRadius: '7px',
              fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer',
            }}
          >
            {cancelling ? '...' : 'Cancel'}
          </button>
        )}
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────
   SUMMARY ROW (right panel)
───────────────────────────────────────────── */
function SummaryRow({ icon, label, value, highlight }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '8px',
        background: '#F3F4F6', color: '#6B7280',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.68rem', fontWeight: '600', color: '#9CA3AF' }}>{label}</div>
        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: highlight ? GREEN : '#0D1F0F' }}>{value}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SHARED STYLES
───────────────────────────────────────────── */
const thStyle = {
  textAlign: 'left', padding: '12px 14px',
  fontSize: '0.72rem', fontWeight: '700',
  color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px',
};

const tdStyle = {
  padding: '12px 14px', verticalAlign: 'middle',
};

const btnOutline = {
  background: '#fff', color: '#374151',
  border: '1.5px solid #E9EDE8',
  padding: '9px 16px', borderRadius: '10px',
  fontWeight: '700', fontSize: '0.85rem',
  display: 'flex', alignItems: 'center',
  cursor: 'pointer',
};

const filterSelect = {
  padding: '9px 12px', borderRadius: '10px',
  border: '1.5px solid #E9EDE8', fontSize: '0.85rem',
  fontWeight: '600', color: '#374151', outline: 'none',
  background: '#fff', cursor: 'pointer',
};

const pageBtn = {
  width: '30px', height: '30px', borderRadius: '8px',
  border: '1.5px solid #E9EDE8', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', color: '#374151',
};

const sideCard = {
  background: '#fff', padding: '1.2rem',
  borderRadius: '14px', border: '1.5px solid #E9EDE8',
};

const calNavBtn = {
  background: 'none', border: '1.5px solid #E9EDE8',
  borderRadius: '8px', width: '28px', height: '28px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: '#6B7280',
};
