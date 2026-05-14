import { useState } from 'react';
import { Star, MessageCircle, Filter, Search, ChevronDown, User } from 'lucide-react';

export default function PartnerReviews({ data }) {
  const reviews = data?.reviews || [];
  const avgRating = data?.avgRating || 0;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111', marginBottom: '8px' }}>User Reviews</h2>
          <p style={{ color: '#64748b', fontWeight: '500' }}>Manage and respond to player feedback</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <div style={statBox}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Average Rating</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 {avgRating} <Star size={20} fill="#f59e0b" />
              </div>
           </div>
           <div style={statBox}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Total Reviews</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#111' }}>{reviews.length}</div>
           </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '24px', border: '1.5px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ display: 'flex', gap: '1rem' }}>
              <select style={filterSelect}><option>All Venues</option></select>
              <select style={filterSelect}><option>All Ratings</option></select>
           </div>
           <button style={filterBtn}><Filter size={18} /> Filters</button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           {reviews.length > 0 ? reviews.map((r) => (
             <div key={r._id} style={{ padding: '1.5rem', borderRadius: '16px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                   <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <User size={20} />
                      </div>
                      <div>
                         <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{r.user_id?.name || 'Anonymous'}</div>
                         <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>{new Date(r.createdAt).toLocaleDateString()} | Verified Player</div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < r.rating ? '#f59e0b' : 'none'} color={i < r.rating ? '#f59e0b' : '#cbd5e1'} />
                      ))}
                   </div>
                </div>
                
                <div style={{ fontSize: '0.8rem', color: '#1ebe74', fontWeight: '700', marginBottom: '8px' }}>@ {r.turf_id?.name}</div>
                <p style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500', lineHeight: 1.6, marginBottom: '1.5rem' }}>"{r.comment}"</p>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                   <button style={replyBtn}><MessageCircle size={16} /> Reply to Review</button>
                   <button style={{ ...replyBtn, background: 'none', border: 'none', color: '#64748b' }}>Report</button>
                </div>
             </div>
           )) : (
             <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontWeight: '700' }}>No reviews yet</div>
           )}
        </div>
      </div>
    </div>
  );
}

const statBox = { background: 'white', padding: '12px 20px', borderRadius: '16px', border: '1.5px solid #f1f5f9', textAlign: 'center' };
const filterSelect = { padding: '10px 15px', borderRadius: '12px', border: '1.5px solid #f1f5f9', fontSize: '0.85rem', fontWeight: '600', color: '#111', outline: 'none', background: 'white' };
const filterBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', borderRadius: '12px', border: '1.5px solid #f1f5f9', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', cursor: 'pointer', background: 'white' };
const replyBtn = { background: 'white', border: '1.5px solid #f1f5f9', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' };
