export default function HowItWorks() {
  const steps = [
    { num: '1', title: 'Search', desc: 'Find turfs near you by sport, city, or location' },
    { num: '2', title: 'Select Slot', desc: 'Pick your preferred date, time, and duration' },
    { num: '3', title: 'Book & Pay', desc: 'Confirm your booking with secure payment' },
    { num: '4', title: 'Play!', desc: 'Show up at the venue and enjoy the game' },
  ];

  return (
    <section style={{ background: '#084734', padding: '5rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#CEF17B', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
            Simple process
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
            Simplified Booking Process
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>
            Get on the field in 4 quick steps
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px', padding: '2.5rem 2rem',
              textAlign: 'center', transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(206,241,123,0.1)'; e.currentTarget.style.borderColor = 'rgba(206,241,123,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <div style={{
                width: '56px', height: '56px',
                background: '#CEF17B', color: '#084734',
                borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', fontWeight: '900',
                margin: '0 auto 1.5rem',
              }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
                {step.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
