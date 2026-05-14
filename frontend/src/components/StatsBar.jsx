export default function StatsBar() {
  const stats = [
    { value: '10K+', label: 'Active Players' },
    { value: '500+', label: 'Turfs Listed' },
    { value: '50K+', label: 'Bookings Made' },
    { value: '4.8 / 5', label: 'Average Rating' },
  ];

  return (
    <div style={{
      background: '#0a3d2e',
      padding: '3rem 2rem',
      display: 'flex',
      justifyContent: 'center',
      gap: '5rem',
      flexWrap: 'wrap',
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1ebe74', letterSpacing: '-1px' }}>
            {s.value}
          </div>
          <div style={{ color: '#8fbda5', fontSize: '1rem', marginTop: '6px', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
