export default function SlotPicker({ slots, selected, onSelect }) {
  if (!slots.length) return null;

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Select Time Slot</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: '10px',
      }}>
        {slots.map((slot, i) => (
          <button
            key={i}
            disabled={!slot.available}
            onClick={() => slot.available && onSelect(slot.time)}
            style={{
              padding: '10px 8px',
              borderRadius: '10px',
              border: `1px solid ${selected === slot.time ? '#1ebe74' : slot.available ? '#ddd' : '#f5f5f5'}`,
              background: selected === slot.time
                ? '#1ebe74'
                : slot.available ? 'white' : '#f5f5f5',
              color: selected === slot.time
                ? 'white'
                : slot.available ? '#333' : '#ccc',
              cursor: slot.available ? 'pointer' : 'not-allowed',
              fontSize: '0.85rem',
              fontWeight: selected === slot.time ? '600' : '400',
              transition: 'all 0.15s',
            }}
          >
            {slot.time}
            {!slot.available && (
              <div style={{ fontSize: '0.7rem', marginTop: '2px', color: '#bbb' }}>
                Booked
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}