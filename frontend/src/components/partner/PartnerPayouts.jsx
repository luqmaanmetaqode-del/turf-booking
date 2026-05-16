import {
  Download, Filter,
  ChevronLeft, ChevronRight, Wallet, Clock,
  TrendingUp, Calendar, Building2
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'https://turfx.metaqode.co.in/api';

export default function PartnerPayouts({ data }) {
  const confirmedBookings = data?.bookings?.filter(b => b.status === 'confirmed') || [];
  const totalEarnings = confirmedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const today = new Date();
  const monthLabel = today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const weeklyGroups = confirmedBookings.reduce((groups, booking) => {
    const bookingDate = new Date(booking.date);
    const weekStart = new Date(bookingDate);
    weekStart.setDate(bookingDate.getDate() - bookingDate.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const key = weekStart.toISOString().split('T')[0];
    groups[key] = groups[key] || { date: weekStart, amount: 0, count: 0 };
    groups[key].amount += Math.round((booking.total_price || 0) * 0.95);
    groups[key].count += 1;
    return groups;
  }, {});

  const payouts = Object.values(weeklyGroups)
    .sort((a, b) => b.date - a.date)
    .map((group, index) => {
      const payoutDate = new Date(group.date);
      payoutDate.setDate(payoutDate.getDate() + 5);
      const status = payoutDate <= today ? 'Completed' : 'Processing';
      return {
        id: `PAYOUT-${group.date.toISOString().slice(0, 10).replace(/-/g, '')}`,
        date: payoutDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: '10:00 AM',
        amount: group.amount,
        method: 'Bank Transfer',
        bank: 'Settlement account',
        status,
        ref: status === 'Completed' ? `SETTLED-${index + 1}-${group.count}` : 'Awaiting settlement',
      };
    });

  const totalPayouts = payouts.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayouts = payouts.filter(p => p.status !== 'Completed').reduce((sum, p) => sum + p.amount, 0);
  const thisMonth = confirmedBookings
    .filter(b => {
      const d = new Date(b.date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    })
    .reduce((sum, b) => sum + Math.round((b.total_price || 0) * 0.95), 0);

  const stats = [
    { label: 'Total Earnings', value: `Rs.${totalEarnings.toLocaleString()}`, icon: <TrendingUp size={22} />, color: '#1ebe74', sub: 'All Time' },
    { label: 'Total Payouts', value: `Rs.${totalPayouts.toLocaleString()}`, icon: <Wallet size={22} />, color: '#3b82f6', sub: 'Settled' },
    { label: 'Pending Payouts', value: `Rs.${pendingPayouts.toLocaleString()}`, icon: <Clock size={22} />, color: '#f59e0b', sub: 'Will be paid soon' },
    { label: 'This Month', value: `Rs.${thisMonth.toLocaleString()}`, icon: <Calendar size={22} />, color: '#8b5cf6', sub: monthLabel },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111', marginBottom: '8px' }}>Payouts</h2>
          <p style={{ color: '#64748b', fontWeight: '500' }}>Estimated weekly settlements from confirmed bookings</p>
        </div>
        <button onClick={() => window.open(`${API}/exports/payouts/csv`, '_blank')} style={btnPrimary}><Download size={18} /> Download Statement</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((s, i) => (
          <div key={i} style={statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${s.color}10`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111' }}>{s.value}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '24px', border: '1.5px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ display: 'flex', gap: '1rem' }}>
              <select style={filterSelect}><option>All Dates</option></select>
              <select style={filterSelect}><option>All Status</option></select>
              <select style={filterSelect}><option>All Payout Methods</option></select>
           </div>
           <button style={filterBtn}><Filter size={18} /> Filters</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' }}>
            <tr>
              <th style={thStyle}>Payout ID</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Payout Method</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Reference ID</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.length > 0 ? payouts.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}><div style={{ fontWeight: '800', fontSize: '0.85rem' }}>{p.id}</div></td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{p.date}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.time}</div>
                </td>
                <td style={tdStyle}><div style={{ fontWeight: '800', fontSize: '0.9rem' }}>Rs.{p.amount.toLocaleString()}</div></td>
                <td style={tdStyle}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Building2 size={18} color="#64748b" />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{p.method}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.bank}</div>
                      </div>
                   </div>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800',
                    background: p.status === 'Completed' ? '#f0fdf4' : '#fff7ed',
                    color: p.status === 'Completed' ? '#1ebe74' : '#f59e0b'
                  }}>{p.status.toUpperCase()}</span>
                </td>
                <td style={tdStyle}><div style={{ fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>{p.ref}</div></td>
                <td style={tdStyle}><Download size={18} style={{ cursor: 'pointer', color: '#94a3b8' }} /></td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', fontWeight: '700' }}>No payouts yet</td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
           <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Showing {payouts.length} payout{payouts.length === 1 ? '' : 's'}</div>
           <div style={{ display: 'flex', gap: '6px' }}>
              <button style={pageBtn}><ChevronLeft size={16} /></button>
              <button style={{ ...pageBtn, background: '#1ebe74', color: 'white', border: 'none' }}>1</button>
              <button style={pageBtn}><ChevronRight size={16} /></button>
           </div>
        </div>
      </div>
    </div>
  );
}

const statCard = { background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1.5px solid #f1f5f9' };
const btnPrimary = { background: '#1ebe74', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(30,190,116,0.2)' };
const filterSelect = { padding: '10px 15px', borderRadius: '12px', border: '1.5px solid #f1f5f9', fontSize: '0.85rem', fontWeight: '600', color: '#111', outline: 'none', background: 'white' };
const filterBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', borderRadius: '12px', border: '1.5px solid #f1f5f9', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', cursor: 'pointer', background: 'white' };
const thStyle = { textAlign: 'left', padding: '1.2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' };
const tdStyle = { padding: '1.2rem', verticalAlign: 'middle' };
const pageBtn = { width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' };
