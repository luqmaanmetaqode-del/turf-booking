export default function StatsBar() {
  const stats = [
    { value: '10K+', label: 'Active Players' },
    { value: '500+', label: 'Turfs Listed' },
    { value: '50K+', label: 'Bookings Made' },
    { value: '4.8★', label: 'Average Rating' },
  ];

  return (
    <div style={{
      background: '#0a3d2e',
      padding: '2rem',
      display: 'flex',
      justifyContent: 'center',
      gap: '4rem',
      flexWrap: 'wrap',
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1ebe74' }}>
            {s.value}
          </div>
          <div style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '4px' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}