import { useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  IndianRupee, Save, Plus, Trash2, 
  Clock, Calendar, Zap, AlertCircle,
  ChevronDown, MapPin, Check
} from 'lucide-react';

const API = 'http://localhost:5001/api';

export default function PartnerPricing({ data }) {
  const { token } = useAuth();
  const [selectedTurf, setSelectedTurf] = useState(data?.turfs?.[0]?._id || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const currentTurf = data?.turfs?.find(t => t._id === selectedTurf) || data?.turfs?.[0];

  // Editable prices — sync when turf changes
  const [basePrice, setBasePrice] = useState(currentTurf?.price_per_hour || 0);
  const [primeMultiplier] = useState(1.25);
  const [weekendMultiplier] = useState(1.5);

  const handleTurfSelect = (id) => {
    setSelectedTurf(id);
    const turf = data?.turfs?.find(t => t._id === id);
    if (turf) setBasePrice(turf.price_per_hour || 0);
  };

  const pricingRules = useMemo(() => {
    if (!currentTurf) return [];
    return [
      { id: `${currentTurf._id}-base`, type: 'Weekday', startTime: '06:00', endTime: '16:00', price: basePrice, category: 'Base Rate' },
      { id: `${currentTurf._id}-prime`, type: 'Weekday', startTime: '16:00', endTime: '23:00', price: Math.round(basePrice * primeMultiplier), category: 'Prime Time' },
      { id: `${currentTurf._id}-weekend`, type: 'Weekend', startTime: '06:00', endTime: '23:00', price: Math.round(basePrice * weekendMultiplier), category: 'Weekend' },
    ];
  }, [currentTurf, basePrice, primeMultiplier, weekendMultiplier]);

  const handleSave = async () => {
    if (!currentTurf) return;
    setSaving(true);
    setError('');
    try {
      await axios.put(`${API}/turfs/${currentTurf._id}`, { price_per_hour: parseFloat(basePrice) }, { headers: { Authorization: `Bearer ${token}` } });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save pricing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111', marginBottom: '8px' }}>Pricing Management</h2>
          <p style={{ color: '#64748b', fontWeight: '500' }}>Set dynamic pricing based on time slots and days</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <button onClick={handleSave} disabled={saving} style={btnPrimary}>
            {saved ? <><Check size={18} /> Saved!</> : saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
          {error && <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '700' }}>{error}</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* LEFT: TURF SELECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#111', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Your Venues</h3>
           {data?.turfs?.map(t => (
             <div 
               key={t._id} 
               onClick={() => handleTurfSelect(t._id)}
               style={{ 
                 padding: '1.2rem', borderRadius: '16px', border: '1.5px solid #f1f5f9',
                 background: selectedTurf === t._id ? '#f0fdf4' : 'white',
                 borderColor: selectedTurf === t._id ? '#1ebe74' : '#f1f5f9',
                 cursor: 'pointer', transition: '0.2s'
               }}
             >
                <div style={{ fontWeight: '800', color: selectedTurf === t._id ? '#111' : '#64748b', fontSize: '0.95rem', marginBottom: '4px' }}>{t.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
                   <MapPin size={12} /> {t.location}
                </div>
             </div>
           ))}
        </div>

        {/* RIGHT: PRICING RULES */}
        <div>
           {/* QUICK STATS */}
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={priceStatCard}>
                 <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', marginBottom: '8px' }}>Base Hourly Rate</div>
                 <input 
                   type="number" 
                   value={basePrice} 
                   onChange={e => setBasePrice(parseFloat(e.target.value) || 0)}
                   style={{ fontSize: '1.5rem', fontWeight: '900', color: '#111', border: 'none', outline: 'none', width: '100%', background: 'transparent' }}
                 />
              </div>
              <div style={priceStatCard}>
                 <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', marginBottom: '8px' }}>Prime Time Price</div>
                 <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1ebe74' }}>Rs.{Math.round(basePrice * primeMultiplier)}</div>
              </div>
              <div style={priceStatCard}>
                 <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', marginBottom: '8px' }}>Active Rules</div>
                 <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#3b82f6' }}>{pricingRules.length}</div>
              </div>
           </div>

           {/* RULES LIST */}
           <div style={{ background: 'white', borderRadius: '24px', border: '1.5px solid #f1f5f9', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Pricing Rules</h3>
                 <button style={btnSmall}><Plus size={16} /> Add New Rule</button>
              </div>

              <div style={{ padding: '1.5rem' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                       <tr style={{ textAlign: 'left' }}>
                          <th style={thStyle}>Rule Category</th>
                          <th style={thStyle}>Day Type</th>
                          <th style={thStyle}>Time Slot</th>
                          <th style={thStyle}>Price /Hr</th>
                          <th style={thStyle}>Status</th>
                          <th style={thStyle}></th>
                       </tr>
                    </thead>
                    <tbody>
                       {pricingRules.map((rule) => (
                         <tr key={rule.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={tdStyle}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                     <Zap size={16} color="#f59e0b" />
                                  </div>
                                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{rule.category}</div>
                               </div>
                            </td>
                            <td style={tdStyle}>
                               <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#f1f5f9', fontSize: '0.75rem', fontWeight: '700' }}>{rule.type}</span>
                            </td>
                            <td style={tdStyle}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>
                                  <Clock size={14} /> {rule.startTime} - {rule.endTime}
                               </div>
                            </td>
                            <td style={tdStyle}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <input 
                                    type="number" 
                                    defaultValue={rule.price} 
                                    style={{ width: '80px', padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #f1f5f9', fontWeight: '800', outline: 'none', textAlign: 'center' }}
                                  />
                               </div>
                            </td>
                            <td style={tdStyle}>
                               <div style={{ width: '40px', height: '22px', background: '#1ebe74', borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
                                  <div style={{ position: 'absolute', right: '2px', top: '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'white' }}></div>
                               </div>
                            </td>
                            <td style={tdStyle}>
                               <button style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}><Trash2 size={18} /></button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              
              <div style={{ padding: '1.5rem', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1.5px solid #f1f5f9' }}>
                 <AlertCircle size={18} color="#3b82f6" />
                 <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                    Tip: Prime time pricing usually starts from 5 PM on weekdays.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const priceStatCard = {
  background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1.5px solid #f1f5f9'
};

const btnPrimary = {
  background: '#1ebe74', color: 'white', border: 'none', padding: '12px 24px',
  borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', display: 'flex',
  alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(30,190,116,0.2)'
};

const btnSmall = {
  background: '#f0fdf4', color: '#1ebe74', border: 'none', padding: '8px 16px',
  borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', display: 'flex',
  alignItems: 'center', gap: '6px', cursor: 'pointer'
};

const thStyle = { textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' };
const tdStyle = { padding: '1.2rem', verticalAlign: 'middle' };
