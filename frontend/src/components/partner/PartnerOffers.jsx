import { useState } from 'react';
import axios from 'axios';
import { Percent, Plus, Tag, Trash2, Edit2 } from 'lucide-react';

const API = 'https://turfx.metaqode.co.in/api';

export default function PartnerOffers({ data, token, onChange }) {
  const offers = data?.offers || [];
  const turfs = data?.turfs || [];
  const now = new Date();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    discount: '',
    description: '',
    valid_until: '',
    turf_id: turfs[0]?._id || '',
  });
  const [saving, setSaving] = useState(false);

  const createOffer = async (e) => {
    e.preventDefault();
    if (!form.turf_id) return;
    setSaving(true);
    try {
      await axios.post(`${API}/offers`, form, { headers: { Authorization: `Bearer ${token}` } });
      setForm({ title: '', discount: '', description: '', valid_until: '', turf_id: turfs[0]?._id || '' });
      setShowForm(false);
      onChange?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteOffer = async (id) => {
    try {
      await axios.delete(`${API}/offers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      onChange?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111', marginBottom: '8px' }}>Offers & Promotions</h2>
          <p style={{ color: '#64748b', fontWeight: '500' }}>Offers attached to your venues</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnPrimary}><Plus size={18} /> Create New Offer</button>
      </div>

      {showForm && (
        <form onSubmit={createOffer} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1.5px solid #f1f5f9', marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Offer title" style={inputStyle} />
          <input required value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} placeholder="Discount, e.g. 20% OFF" style={inputStyle} />
          <select required value={form.turf_id} onChange={e => setForm({ ...form, turf_id: e.target.value })} style={inputStyle}>
            <option value="">Select venue</option>
            {turfs.map(turf => <option key={turf._id} value={turf._id}>{turf.name}</option>)}
          </select>
          <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} style={inputStyle} />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" style={{ ...inputStyle, gridColumn: '1 / -1', minHeight: '90px', resize: 'vertical' }} />
          <button disabled={saving || turfs.length === 0} style={{ ...btnPrimary, width: 'fit-content' }}>{saving ? 'Saving...' : 'Save Offer'}</button>
        </form>
      )}

      {offers.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
           {offers.map(o => {
             const expired = o.valid_until && new Date(o.valid_until) < now;
             const status = expired ? 'Expired' : 'Active';
             return (
               <div key={o._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1.5px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, padding: '8px 15px', background: status === 'Active' ? '#f0fdf4' : '#f1f5f9', color: status === 'Active' ? '#1ebe74' : '#64748b', fontSize: '0.7rem', fontWeight: '800', borderRadius: '0 0 0 16px' }}>
                     {status.toUpperCase()}
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#1ebe74', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                     <Percent size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#111', marginBottom: '4px' }}>{o.title}</h3>
                  <p style={{ fontSize: '1rem', fontWeight: '800', color: '#1ebe74', marginBottom: '10px' }}>{o.discount || 'Offer'}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500', marginBottom: '1.5rem' }}>{o.description || 'No description added'}</p>

                  <div style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>
                       {o.turf_id?.name || 'All venues'}{o.valid_until ? ` | Valid until ${new Date(o.valid_until).toLocaleDateString('en-IN')}` : ''}
                     </div>
                     <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={iconBtn}><Edit2 size={16} /></button>
                        <button onClick={() => deleteOffer(o._id)} style={iconBtn}><Trash2 size={16} /></button>
                     </div>
                  </div>
               </div>
             );
           })}
        </div>
      ) : (
        <div style={{ background: 'white', padding: '4rem', borderRadius: '24px', border: '1.5px solid #f1f5f9', textAlign: 'center', color: '#94a3b8', fontWeight: '700', marginBottom: '2.5rem' }}>
          No offers have been created for your venues yet.
        </div>
      )}

      <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1.5px solid #f1f5f9', display: 'flex', gap: '2rem', alignItems: 'center' }}>
         <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0fdf4', color: '#1ebe74', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Tag size={28} />
         </div>
         <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>Grow your business with smart offers</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', lineHeight: 1.5 }}>
               Offers saved in the backend will appear here for the venues owned by this account.
            </p>
         </div>
         <button style={{ ...btnPrimary, background: 'white', color: '#1ebe74', border: '1.5px solid #1ebe74', boxShadow: 'none' }}>Learn More</button>
      </div>
    </div>
  );
}

const btnPrimary = { background: '#1ebe74', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(30,190,116,0.2)' };
const iconBtn = { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' };
const inputStyle = { padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', fontSize: '0.9rem', fontWeight: '600', outline: 'none' };
