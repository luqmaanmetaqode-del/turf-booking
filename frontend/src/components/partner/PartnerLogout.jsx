import {
  LogOut, CheckCircle,
  TrendingUp, Wallet, Star,
  Shield, Key, Lock, Bell
} from 'lucide-react';

export default function PartnerLogout({ onCancel, onLogout, data }) {
  const confirmedBookings = data?.bookings?.filter(b => b.status === 'confirmed') || [];
  const totalEarnings = confirmedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const walletBalance = Math.round(totalEarnings * 0.95);

  const accountStats = [
    { label: 'Total Bookings', value: (data?.totalBookings || 0).toString(), sub: 'View all bookings', icon: <CalIcon size={20} />, color: '#1ebe74' },
    { label: 'Total Earnings', value: `Rs.${totalEarnings.toLocaleString()}`, sub: 'View payouts', icon: <TrendingUp size={20} />, color: '#3b82f6' },
    { label: 'Wallet Balance', value: `Rs.${walletBalance.toLocaleString()}`, sub: 'Go to wallet', icon: <Wallet size={20} />, color: '#8b5cf6' },
    { label: 'Partner Rating', value: (data?.avgRating || 0).toString(), sub: 'View reviews', icon: <Star size={20} />, color: '#f59e0b' },
  ];

  const securityTips = [
    { title: 'Always logout from shared devices', icon: <Shield size={20} /> },
    { title: 'Never share your login credentials', icon: <Key size={20} /> },
    { title: 'We keep your data safe and secure', icon: <Lock size={20} /> },
    { title: 'Enable notifications for account activity', icon: <Bell size={20} /> },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111', marginBottom: '8px' }}>Confirm Logout</h2>
        <p style={{ color: '#64748b', fontWeight: '500' }}>Are you sure you want to logout from your partner account?</p>
      </div>

      <div style={{ background: 'white', padding: '3rem', borderRadius: '32px', border: '1.5px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2rem' }}>
         <div style={{ width: '120px', height: '120px', background: '#f8fafc', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1ebe74', marginBottom: '2.5rem' }}>
            <LogOut size={72} />
         </div>

         <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1.5rem' }}>You're about to logout</h3>
         <p style={{ color: '#64748b', fontWeight: '500', marginBottom: '2.5rem' }}>For your security, please confirm your logout.</p>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '3rem', width: '100%', maxWidth: '400px' }}>
            <div style={checkItem}><CheckCircle size={18} color="#1ebe74" /> You will be logged out from this device</div>
            <div style={checkItem}><CheckCircle size={18} color="#1ebe74" /> You may need to login again to access your account</div>
            <div style={checkItem}><CheckCircle size={18} color="#1ebe74" /> Any unsaved changes will be lost</div>
         </div>

         <div style={{ display: 'flex', gap: '1.5rem', width: '100%', maxWidth: '500px' }}>
            <button onClick={onCancel} style={{ flex: 1, padding: '18px', borderRadius: '16px', border: '1.5px solid #f1f5f9', background: 'white', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' }}>Cancel</button>
            <button onClick={onLogout} style={{ flex: 1, padding: '18px', borderRadius: '16px', border: 'none', background: '#1ebe74', color: 'white', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(30,190,116,0.3)' }}>
               <CheckCircle size={20} /> Yes, Logout
            </button>
         </div>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1.5px solid #f1f5f9', marginBottom: '2rem' }}>
         <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '2rem' }}>Account Summary</h3>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {accountStats.map((s, i) => (
              <div key={i} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1.5px solid #f1f5f9' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                    <div style={{ color: s.color }}>{s.icon}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900' }}>{s.value}</div>
                 </div>
                 <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>{s.label}</div>
                 <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1ebe74', cursor: 'pointer' }}>{s.sub}</div>
              </div>
            ))}
         </div>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
         <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '2rem' }}>Security Tips</h3>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {securityTips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
                 <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdf4', color: '#1ebe74', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {tip.icon}
                 </div>
                 <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', lineHeight: 1.5 }}>{tip.title}</div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}

function CalIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }

const checkItem = { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', fontWeight: '600', color: '#64748b' };
