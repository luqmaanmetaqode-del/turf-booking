import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { 
  LayoutDashboard, MapPin, Calendar, Clock, 
  IndianRupee, TrendingUp, Star, Settings, 
  LogOut, Bell, User as UserIcon, Wallet, Percent, HelpCircle
} from 'lucide-react';

// Components
import PartnerVenues from '../../components/partner/PartnerVenues';
import AddVenueForm from '../../components/partner/AddVenueForm';
import PartnerBookings from '../../components/partner/PartnerBookings';
import CreateBooking from '../../components/partner/CreateBooking';
import PartnerWallet from '../../components/partner/PartnerWallet';
import PartnerPayouts from '../../components/partner/PartnerPayouts';
import PartnerSupport from '../../components/partner/PartnerSupport';
import PartnerProfile from '../../components/partner/PartnerProfile';
import PartnerLogout from '../../components/partner/PartnerLogout';
import PartnerPricing from '../../components/partner/PartnerPricing';
import PartnerReviews from '../../components/partner/PartnerReviews';
import PartnerSettings from '../../components/partner/PartnerSettings';
import PartnerSlots from '../../components/partner/PartnerSlots';
import PartnerEarnings from '../../components/partner/PartnerEarnings';
import PartnerOffers from '../../components/partner/PartnerOffers';

const API = 'http://localhost:5001/api';

export default function PartnerDashboard() {
  const { token, user, logout } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCreateBooking, setShowCreateBooking] = useState(false);

  const fetchDashboard = () => {
    if (!token) return Promise.resolve();
    setLoading(true);
    return axios.get(`${API}/owner/dashboard`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) { navigate('/partner/login'); return; }
    fetchDashboard();
  }, [token, user, navigate]);

  const menuItems = [
    { id:'dashboard', label:'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id:'venues', label:'Venues', icon: <MapPin size={20} /> },
    { id:'bookings', label:'Bookings', icon: <Calendar size={20} /> },
    { id:'slots', label:'Slots', icon: <Clock size={20} /> },
    { id:'pricing', label:'Pricing', icon: <IndianRupee size={20} /> },
    { id:'earnings', label:'Earnings', icon: <TrendingUp size={20} /> },
    { id:'payouts', label:'Payouts', icon: <IndianRupee size={20} /> },
    { id:'wallet', label:'Wallet', icon: <Wallet size={20} /> },
    { id:'offers', label:'Offers', icon: <Percent size={20} /> },
    { id:'support', label:'Support', icon: <HelpCircle size={20} /> },
    { id:'profile', label:'Profile', icon: <UserIcon size={20} /> },
    { id:'settings', label:'Settings', icon: <Settings size={20} /> },
  ];

  const sidebarStyle = {
    width: '260px', background: colors.cardBg, height: '100vh', position: 'fixed',
    borderRight: `1.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column',
    padding: '1.5rem 0', zIndex: 100
  };

  const navItemStyle = (id) => ({
    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 24px',
    cursor: 'pointer', color: tab === id ? '#1ebe74' : colors.textSecondary,
    background: tab === id ? colors.primaryLight : 'transparent',
    borderLeft: `4px solid ${tab === id ? '#1ebe74' : 'transparent'}`,
    fontWeight: tab === id ? '700' : '500', fontSize: '0.95rem',
    transition: '0.2s all'
  });

  const chartHeights = (() => {
    if (!data?.bookings) return [40, 60, 45, 80, 55, 90, 75, 100];
    const last8Days = Array(8).fill(0);
    const today = new Date();
    today.setHours(0,0,0,0);
    data.bookings.forEach(b => {
       if (b.status === 'cancelled') return;
       const bDate = new Date(b.date);
       bDate.setHours(0,0,0,0);
       const diffTime = today - bDate;
       const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
       if (diffDays >= 0 && diffDays < 8) {
          last8Days[7 - diffDays] += b.total_price || 0;
       }
    });
    const maxVal = Math.max(...last8Days, 1);
    return last8Days.map(val => Math.max((val / maxVal) * 100, 5));
  })();

  return (
    <div style={{ display:'flex', minHeight:'100vh', background: colors.background, fontFamily: "'Inter', sans-serif" }}>
      {/* SIDEBAR */}
      <div style={sidebarStyle}>
        <div style={{ padding: '0 24px', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={logo} alt="TurfX" style={{ height: '40px' }} />
          <span style={{ fontWeight: '800', fontSize: '0.8rem', color: colors.textSecondary, letterSpacing: '1px' }}>PARTNER</span>
        </div>
        
        <div style={{ flex: 1 }}>
          {menuItems.map(item => (
            <div key={item.id} onClick={() => { setTab(item.id); setShowAddForm(false); setShowCreateBooking(false); }} style={navItemStyle(item.id)}>
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 24px' }}>
          <div onClick={() => setTab('logout')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderTop: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
            <LogOut size={18} /> Logout
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, marginLeft: '260px' }}>
        {/* TOP BAR */}
        <div style={{ background: colors.cardBg, padding: '1rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1.5px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 90 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: colors.text, textTransform: 'capitalize' }}>
            {showAddForm ? 'Add New Venue' : tab}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <ThemeToggle />
            <div style={{ position: 'relative', color: colors.textSecondary, cursor: 'pointer' }}>
              <Bell size={22} />
              {(data?.notificationCount > 0) && (
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', background: '#ef4444', border: `2px solid ${colors.cardBg}`, borderRadius: '50%', fontSize: '10px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                  {data.notificationCount > 9 ? '9+' : data.notificationCount}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: colors.text }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: colors.textSecondary, fontWeight: '600' }}>Partner Owner</div>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: colors.hover, color: '#1ebe74', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', border: `1.5px solid ${colors.border}` }}>
                <UserIcon size={24} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '2.5rem 3rem' }}>
          {/* DASHBOARD TAB */}
          {tab === 'dashboard' && data && (
            <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
              {/* STATS ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                  { label: 'Total Bookings', value: data.totalBookings || 0, trend: '+0%', trendUp: true, icon: <Calendar /> },
                  { label: 'Total Earnings', value: `₹${(data.totalEarnings || 0).toLocaleString()}`, trend: '+0%', trendUp: true, icon: <IndianRupee /> },
                  { label: 'Upcoming Bookings', value: data.upcomingBookingsCount || 0, trend: '+0%', trendUp: true, icon: <Clock /> },
                  { label: 'Total Venues', value: data.turfs?.length || 0, trend: 'No change', trendUp: null, icon: <MapPin /> },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>{s.label}</div>
                      <div style={{ color: '#1ebe74' }}>{s.icon}</div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111', marginBottom: '8px' }}>{s.value}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: s.trendUp ? '#1ebe74' : '#94a3b8' }}>
                      {s.trendUp && '▲'} {s.trend} <span style={{ color: '#94a3b8', fontWeight: '500' }}>vs last month</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* UPCOMING BOOKINGS */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1.5px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontWeight: '800', fontSize: '1.1rem' }}>Upcoming Bookings</h3>
                    <span onClick={() => setTab('bookings')} style={{ color: '#1ebe74', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>View All</span>
                  </div>
                  {data.upcomingBookings?.length > 0 ? data.upcomingBookings.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: i < data.upcomingBookings.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: i < data.upcomingBookings.length - 1 ? '1.5rem' : '0' }}>
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', textAlign: 'center', minWidth: '70px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                          {new Date(b.date).toLocaleString('default', { month: 'short' })}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111' }}>
                          {new Date(b.date).getDate()}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', color: '#111', fontSize: '0.95rem' }}>{b.turf_id?.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500', marginTop: '4px' }}>{b.time_slot}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>{b.user_id?.name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '800', color: '#111', fontSize: '1rem' }}>₹{b.total_price}</div>
                        <div style={{ color: '#1ebe74', background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-block', marginTop: '6px' }}>{b.status.toUpperCase()}</div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontWeight: '600' }}>No upcoming bookings</div>
                  )}
                </div>

                {/* EARNINGS CHART */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1.5px solid #f1f5f9' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontWeight: '800', fontSize: '1.1rem' }}>Earnings Overview</h3>
                    <select style={{ border: 'none', background: 'none', color: '#64748b', fontWeight: '600', outline: 'none', cursor: 'pointer' }}>
                      <option>Total</option>
                    </select>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem' }}>₹{(data.totalEarnings || 0).toLocaleString()}</div>
                  <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    {chartHeights.map((h, i) => (
                      <div key={i} style={{ flex: 1, background: '#f0fdf4', borderRadius: '6px', height: `${h}%`, position: 'relative', cursor: 'pointer' }}>
                        <div style={{ position: 'absolute', bottom: 0, width: '100%', background: '#1ebe74', height: '30%', borderRadius: '6px' }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VENUES TAB */}
          {tab === 'venues' && !showAddForm && (
            <PartnerVenues data={data} onAddClick={() => setShowAddForm(true)} onTabChange={(t) => setTab(t)} />
          )}

          {/* ADD VENUE FORM */}
          {showAddForm && (
            <AddVenueForm onCancel={() => setShowAddForm(false)} onComplete={() => { setShowAddForm(false); fetchDashboard(); }} />
          )}
          
          {/* BOOKINGS TAB */}
          {tab === 'bookings' && !showCreateBooking && (
            <PartnerBookings data={data} onCreateClick={() => setShowCreateBooking(true)} token={token} />
          )}

          {/* CREATE BOOKING FLOW */}
          {showCreateBooking && (
            <CreateBooking turfs={data?.turfs} onCancel={() => setShowCreateBooking(false)} onComplete={() => { setShowCreateBooking(false); fetchDashboard(); }} />
          )}

          {/* WALLET TAB */}
          {tab === 'wallet' && (
            <PartnerWallet data={data} />
          )}

          {/* PRICING TAB */}
          {tab === 'pricing' && (
            <PartnerPricing data={data} />
          )}

          {/* PAYOUTS TAB */}
          {tab === 'payouts' && (
            <PartnerPayouts data={data} />
          )}

          {/* EARNINGS TAB */}
          {tab === 'earnings' && (
            <PartnerEarnings data={data} />
          )}

          {/* SLOTS TAB */}
          {tab === 'slots' && (
            <PartnerSlots data={data} token={token} onChange={fetchDashboard} />
          )}

          {/* REVIEWS TAB */}
          {tab === 'reviews' && (
            <PartnerReviews data={data} />
          )}

          {/* SETTINGS TAB */}
          {tab === 'settings' && (
            <PartnerSettings user={user} data={data} />
          )}

          {/* OFFERS TAB */}
          {tab === 'offers' && (
            <PartnerOffers data={data} token={token} onChange={fetchDashboard} />
          )}

          {/* SUPPORT TAB */}
          {tab === 'support' && (
            <PartnerSupport data={data} />
          )}

          {/* PROFILE TAB */}
          {tab === 'profile' && (
            <PartnerProfile user={user} data={data} />
          )}

          {/* LOGOUT TAB */}
          {tab === 'logout' && (
            <PartnerLogout onCancel={() => setTab('dashboard')} onLogout={() => { logout(); navigate('/'); }} data={data} />
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const btnActionStyle = {
  background: 'white', border: '1.5px solid #f1f5f9', padding: '8px 16px',
  borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', color: '#64748b',
  cursor: 'pointer'
};

const smallLabelStyle = { fontSize: '0.75rem', color: '#64748b', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' };
const smallValStyle = { fontSize: '1.1rem', fontWeight: '800', color: '#111' };
const labelStyle = { display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#111', marginBottom: '8px', textTransform: 'uppercase' };
const formInputStyle = { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #f1f5f9', fontSize: '1rem', background: '#f8fafc', fontWeight: '500', outline: 'none' };
