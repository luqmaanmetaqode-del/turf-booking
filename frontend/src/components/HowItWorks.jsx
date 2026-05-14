export default function HowItWorks() {
  const steps = [
    { title: 'Search', desc: 'Find turfs near you by sport, city, or location' },
    { title: 'Select Slot', desc: 'Pick your preferred date, time, and duration' },
    { title: 'Book & Pay', desc: 'Confirm your booking with secure payment' },
    { title: 'Play!', desc: 'Show up at the venue and enjoy your game' },
  ];

  return (
    <section style={{
      padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#111', marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>
          Simplified Booking Process
        </h2>
        <p style={{ color: '#666', fontSize: '1rem', fontWeight: '400' }}>
          Get on the field in 4 quick steps
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2.5rem',
      }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            textAlign: 'center', padding: '3rem 2rem',
            background: 'white', borderRadius: '24px',
            border: '1px solid #eee',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            position: 'relative',
            transition: 'all 0.3s ease',
            cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}
          >
            {/* Step circle */}
            <div style={{
              width: '70px', height: '70px',
              background: '#f0fdf4',
              color: '#1ebe74',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: '800',
              margin: '0 auto 2rem',
              border: '2px solid #d1fae5',
            }}>
              {i + 1}
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111' }}>
              {step.title}
            </h3>
            <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: '500' }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
