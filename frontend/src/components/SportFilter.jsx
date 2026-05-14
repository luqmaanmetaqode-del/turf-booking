const SPORTS = ['All', 'Football', 'Cricket', 'Tennis'];

export default function SportFilter({ selected, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '1.5rem 0' }}>
      {SPORTS.map(sport => (
        <button
          key={sport}
          onClick={() => onSelect(sport)}
          style={{
            padding: '8px 20px',
            borderRadius: '20px',
            border: `1px solid ${selected === sport ? '#1ebe74' : '#ddd'}`,
            background: selected === sport ? '#1ebe74' : 'white',
            color: selected === sport ? 'white' : '#333',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: selected === sport ? '600' : '400',
            transition: 'all 0.2s',
          }}
        >
          {sport}
        </button>
      ))}
    </div>
  );
}
