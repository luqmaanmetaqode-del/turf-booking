import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import AdminWallet from '../../components/admin/AdminWallet';
import {
  IndianRupee, TrendingUp, Users, MapPin,
  Receipt, Percent, LogOut, RefreshCw,
  Download, Phone
} from 'lucide-react';

// ── Pure SVG Pie Chart (no external library) ──────────────────────────────────
function PieChart({ slices, size = 220 }) {
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No data</div>;

  let startAngle = -Math.PI / 2;
  const paths = slices.map((slice) => {
    const angle = (slice.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle);
    const y2 = cy + r * Math.sin(startAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    const midAngle = startAngle + angle / 2;
    const lx = cx + (r * 0.65) * Math.cos(midAngle);
    const ly = cy + (r * 0.65) * Math.sin(midAngle);
    const pct = Math.round((slice.value / total) * 100);
    startAngle += angle;
    return { d, color: slice.color, label: slice.label, value: slice.value, lx, ly, pct };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth="2">
            <title>{p.label}: ₹{p.value.toLocaleString()} ({p.pct}%)</title>
          </path>
        ))}
        {/* Donut hole */}
        <circle cx={cx} cy={cy} r={r * 0.45} fill="white" />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fontWeight="800" fill="#64748b">TOTAL</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="13" fontWeight="900" fill="#0f172a">₹{total.toLocaleString()}</text>
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {paths.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: p.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#374151' }}>{p.label}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>₹{p.value.toLocaleString()} ({p.pct}%)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const API = 'http://localhost:5001/api';

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [expandedMonth, setExpandedMonth] = useState(null);

  useEffect(() => {
    // If not logged in at all → go to admin login
    if (!token || !user) {
      navigate('/admin/login');
      return;
    }
    // If logged in but not admin/owner → go to admin login
    if (user.role !== 'admin' && user.role !== 'owner') {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [token, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/revenue`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Booking Ref', 'Customer', 'Phone', 'Turf', 'Date', 'Time Slot', 'Court Amount', 'Platform Fee', 'GST', 'Total Paid'],
      ...data.recentTransactions.map(t => [
        t.bookingRef, t.userName, t.userPhone, t.turfName,
        t.date, t.timeSlot, t.courtAmount, t.platformFee, t.gst, t.totalPaid
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turfx-revenue-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: colors.background }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: `4px solid ${colors.border}`, borderTop: '4px solid #1ebe74', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: colors.textSecondary, fontWeight: '700' }}>Loading admin data...</p>
      </div>
    </div>
  );

  const s = data?.summary || {};
  const monthly = data?.monthly || [];
  const perTurf = data?.perTurf || [];
  const transactions = data?.recentTransactions || [];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'monthly', label: 'Monthly Breakdown' },
    { id: 'turfs', label: 'Per Venue' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'wallet', label: 'Platform Wallet' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.background, fontFamily: "'Inter', sans-serif" }}>

      {/* SIDEBAR */}
      <div style={{ width: '260px', background: colors.cardBg, height: '100vh', position: 'fixed', borderRight: `1.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column', padding: '1.5rem 0', zIndex: 100 }}>
        <div style={{ padding: '0 24px', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: colors.text, letterSpacing: '-0.5px' }}>TurfX</div>
          <span style={{ fontWeight: '800', fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '1px' }}>ADMIN</span>
        </div>

        <div style={{ flex: 1 }}>
          {tabs.map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 24px',
              cursor: 'pointer', color: tab === t.id ? '#1ebe74' : '#64748b',
              background: tab === t.id ? '#f0fdf4' : 'transparent',
              borderLeft: `4px solid ${tab === t.id ? '#1ebe74' : 'transparent'}`,
              fontWeight: tab === t.id ? '700' : '500', fontSize: '0.95rem',
              transition: '0.2s all'
            }}>
              {t.label}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 24px' }}>
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
            <div style={{ color: '#111', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>{user?.name}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', marginBottom: '1rem' }}>Administrator</div>
            <div onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
              <LogOut size={16} /> Logout
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, marginLeft: '260px' }}>
        {/* TOP BAR */}
        <div style={{ background: 'white', padding: '1rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 90 }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111' }}>
              {tab === 'overview' && 'Revenue Overview'}
              {tab === 'monthly' && 'Monthly Breakdown'}
              {tab === 'turfs' && 'Revenue Per Venue'}
              {tab === 'transactions' && 'All Transactions'}
              {tab === 'wallet' && 'Platform Wallet'}
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', marginTop: '2px' }}>
              Platform fee: ₹{s.platformFeePerBooking}/booking + GST ₹{s.gstPerBooking} = ₹{s.totalFeePerBooking} total per booking
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={fetchData} style={btnSecondary}><RefreshCw size={16} /> Refresh</button>
            <button onClick={handleExportCSV} style={btnPrimary}><Download size={16} /> Export CSV</button>
          </div>
        </div>

        <div style={{ padding: '2.5rem 3rem' }}>

          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <div>
              {/* TOP STAT CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard label="Total Platform Revenue" value={`₹${s.totalRevenue?.toLocaleString()}`} sub={`${s.totalBookings} confirmed bookings`} icon={<IndianRupee size={22} />} color="#1ebe74" />
                <StatCard label="Platform Fees Collected" value={`₹${s.totalPlatformFee?.toLocaleString()}`} sub={`₹${s.platformFeePerBooking} × ${s.totalBookings} bookings`} icon={<Receipt size={22} />} color="#3b82f6" />
                <StatCard label="GST Collected" value={`₹${s.totalGST?.toLocaleString()}`} sub={`18% on platform fee`} icon={<Percent size={22} />} color="#f59e0b" />
                <StatCard label="Gross Booking Value" value={`₹${s.totalGMV?.toLocaleString()}`} sub="Total money transacted" icon={<TrendingUp size={22} />} color="#8b5cf6" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard label="Total Users" value={s.totalUsers} sub="Registered customers" icon={<Users size={22} />} color="#06b6d4" />
                <StatCard label="Total Partners" value={s.totalPartners} sub="Venue owners" icon={<Users size={22} />} color="#ec4899" />
                <StatCard label="Total Venues" value={s.totalTurfs} sub="Listed turfs" icon={<MapPin size={22} />} color="#10b981" />
              </div>

              {/* FEE BREAKDOWN BOX */}
              <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '1.5rem', color: '#0f172a' }}>Fee Structure (Per Booking)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  <FeeBox label="Platform Fee" amount={`₹${s.platformFeePerBooking}`} desc="Flat fee charged per booking" color="#3b82f6" />
                  <FeeBox label="GST (18%)" amount={`₹${s.gstPerBooking}`} desc="18% GST on platform fee" color="#f59e0b" />
                  <FeeBox label="Total per Booking" amount={`₹${s.totalFeePerBooking}`} desc="TurfX earns this per booking" color="#1ebe74" highlight />
                </div>
              </div>

              {/* CHARTS ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                {/* PIE CHART — Monthly Revenue Split */}
                <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>Monthly Revenue (Pie)</h3>
                    <span onClick={() => setTab('monthly')} style={{ color: '#1ebe74', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>View Table →</span>
                  </div>
                  {monthly.length > 0 ? (
                    <PieChart
                      size={200}
                      slices={monthly.slice(0, 6).reverse().map((m, i) => ({
                        label: new Date(m.month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
                        value: m.revenue,
                        color: ['#1ebe74','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#06b6d4'][i % 6],
                      }))}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontWeight: '600' }}>No data yet</div>
                  )}
                </div>

                {/* PIE CHART — Revenue Breakdown (Fee vs GST vs Court) */}
                <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '2rem' }}>
                  <h3 style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a', marginBottom: '1.5rem' }}>Revenue Composition</h3>
                  <PieChart
                    size={200}
                    slices={[
                      { label: 'Platform Fee', value: s.totalPlatformFee || 0, color: '#3b82f6' },
                      { label: 'GST Collected', value: s.totalGST || 0, color: '#f59e0b' },
                    ]}
                  />
                  <div style={{ marginTop: '1rem', padding: '12px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                    <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '700' }}>
                      Total TurfX Revenue = Platform Fee + GST = <strong>₹{s.totalRevenue?.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MONTHLY TAB ── */}
          {tab === 'monthly' && (
            <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #f1f5f9', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    {['Month', 'Bookings', 'Gross Value (GMV)', 'Platform Fee', 'GST Collected', 'Total Revenue', ''].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthly.length > 0 ? monthly.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: '800', color: '#0f172a' }}>
                          {new Date(m.month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={tdStyle}><span style={numBadge}>{m.bookings}</span></td>
                      <td style={tdStyle}><span style={{ fontWeight: '700', color: '#8b5cf6' }}>₹{m.gmv.toLocaleString()}</span></td>
                      <td style={tdStyle}><span style={{ fontWeight: '700', color: '#3b82f6' }}>₹{m.platformFee.toLocaleString()}</span></td>
                      <td style={tdStyle}><span style={{ fontWeight: '700', color: '#f59e0b' }}>₹{m.gst.toLocaleString()}</span></td>
                      <td style={tdStyle}><span style={{ fontWeight: '900', color: '#1ebe74', fontSize: '1rem' }}>₹{m.revenue.toLocaleString()}</span></td>
                      <td style={tdStyle}>
                        <div style={{ width: '80px', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min((m.revenue / (monthly[monthly.length - 1]?.revenue || 1)) * 100, 100)}%`, background: '#1ebe74', borderRadius: '4px' }} />
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>No bookings yet</td></tr>
                  )}
                </tbody>
                {monthly.length > 0 && (
                  <tfoot style={{ background: '#f0fdf4', borderTop: '2px solid #dcfce7' }}>
                    <tr>
                      <td style={{ ...tdStyle, fontWeight: '900', color: '#0f172a' }}>TOTAL</td>
                      <td style={tdStyle}><span style={{ ...numBadge, background: '#dcfce7', color: '#166534' }}>{s.totalBookings}</span></td>
                      <td style={{ ...tdStyle, fontWeight: '900', color: '#8b5cf6' }}>₹{s.totalGMV?.toLocaleString()}</td>
                      <td style={{ ...tdStyle, fontWeight: '900', color: '#3b82f6' }}>₹{s.totalPlatformFee?.toLocaleString()}</td>
                      <td style={{ ...tdStyle, fontWeight: '900', color: '#f59e0b' }}>₹{s.totalGST?.toLocaleString()}</td>
                      <td style={{ ...tdStyle, fontWeight: '900', color: '#1ebe74', fontSize: '1.1rem' }}>₹{s.totalRevenue?.toLocaleString()}</td>
                      <td style={tdStyle} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {/* ── PER TURF TAB ── */}
          {tab === 'turfs' && (
            <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #f1f5f9', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    {['#', 'Venue Name', 'Bookings', 'Gross Value', 'Platform Fee', 'GST', 'Revenue'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {perTurf.length > 0 ? perTurf.map((t, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...tdStyle, color: '#94a3b8', fontWeight: '700' }}>{i + 1}</td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: '800', color: '#0f172a' }}>{t.turfName}</div>
                      </td>
                      <td style={tdStyle}><span style={numBadge}>{t.bookings}</span></td>
                      <td style={{ ...tdStyle, fontWeight: '700', color: '#8b5cf6' }}>₹{t.gmv.toLocaleString()}</td>
                      <td style={{ ...tdStyle, fontWeight: '700', color: '#3b82f6' }}>₹{t.platformFee.toLocaleString()}</td>
                      <td style={{ ...tdStyle, fontWeight: '700', color: '#f59e0b' }}>₹{t.gst.toLocaleString()}</td>
                      <td style={{ ...tdStyle, fontWeight: '900', color: '#1ebe74' }}>₹{t.revenue.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>No data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── TRANSACTIONS TAB ── */}
          {tab === 'transactions' && (
            <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #f1f5f9', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '800', color: '#0f172a' }}>Recent {transactions.length} Transactions</div>
                <button onClick={handleExportCSV} style={btnPrimary}><Download size={16} /> Export CSV</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    {['Booking ID', 'Customer', 'Phone', 'Venue', 'Date', 'Time', 'Court Amt', 'Platform Fee', 'GST', 'Total'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? transactions.map((t, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#1ebe74', background: '#f0fdf4', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                          #{t.bookingRef}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: '700', color: '#0f172a' }}>{t.userName}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>
                          <Phone size={13} /> {t.userPhone}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: '600', color: '#374151', fontSize: '0.85rem' }}>{t.turfName}</td>
                      <td style={{ ...tdStyle, fontWeight: '600', color: '#374151', fontSize: '0.85rem' }}>{t.date}</td>
                      <td style={{ ...tdStyle, fontWeight: '600', color: '#374151', fontSize: '0.85rem' }}>{t.timeSlot}</td>
                      <td style={{ ...tdStyle, fontWeight: '700', color: '#374151' }}>₹{t.courtAmount?.toLocaleString()}</td>
                      <td style={{ ...tdStyle, fontWeight: '700', color: '#3b82f6' }}>₹{t.platformFee}</td>
                      <td style={{ ...tdStyle, fontWeight: '700', color: '#f59e0b' }}>₹{t.gst}</td>
                      <td style={{ ...tdStyle, fontWeight: '900', color: '#0f172a' }}>₹{t.totalPaid?.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>No transactions yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── WALLET TAB ── */}
          {tab === 'wallet' && (
            <AdminWallet bookings={data?.allBookings || []} />
          )}

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1.5px solid #f1f5f9', animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>{label}</div>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginBottom: '6px' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8' }}>{sub}</div>
    </div>
  );
}

function FeeBox({ label, amount, desc, color, highlight }) {
  return (
    <div style={{ padding: '1.5rem', borderRadius: '16px', background: highlight ? '#f0fdf4' : '#f8fafc', border: `1.5px solid ${highlight ? '#bbf7d0' : '#f1f5f9'}` }}>
      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: '900', color, marginBottom: '6px' }}>{amount}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8' }}>{desc}</div>
    </div>
  );
}

const thStyle = {
  textAlign: 'left', padding: '1rem 1.2rem', fontSize: '0.72rem',
  fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px'
};
const tdStyle = { padding: '1rem 1.2rem', verticalAlign: 'middle' };
const numBadge = {
  background: '#f1f5f9', color: '#374151', padding: '3px 10px',
  borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem'
};
const btnPrimary = {
  background: '#1ebe74', color: 'white', border: 'none', padding: '10px 18px',
  borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem',
  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
};
const btnSecondary = {
  background: 'white', color: '#374151', border: '1.5px solid #e2e8f0', padding: '10px 18px',
  borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem',
  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
};
