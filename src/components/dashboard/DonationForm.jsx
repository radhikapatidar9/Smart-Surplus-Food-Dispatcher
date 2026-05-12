import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, ChevronDown } from 'lucide-react';
import AIAnalysis from './AIAnalysis';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import useDonationStore from '../../store/useDonationStore';

const FOOD_TYPES = ['Biryani / Rice Dishes', 'Curry & Gravies', 'Bread / Roti / Naan', 'Snacks / Starters', 'Desserts / Sweets', 'Salads / Raw Foods', 'Soup / Beverages', 'Mixed Buffet Items', 'Packaged Food', 'Other'];

export default function DonationForm({ onSuccess }) {
  const { user } = useAuthStore();
  const { addDonation } = useDonationStore();
  const [form, setForm] = useState({ foodType: '', quantity: '', unit: 'kg', location: user?.location || '', notes: '', category: '' });
  const [aiResult, setAiResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  // Sync location when user data becomes available
  useEffect(() => {
    if (user?.location && !form.location) {
      setForm(p => ({ ...p, location: user.location }));
    }
  }, [user, form.location]);

  const validate = () => {
    const e = {};
    if (!form.foodType) e.foodType = 'Select food type';
    if (!form.quantity) e.quantity = 'Enter quantity';
    if (!form.location || !form.location.trim()) e.location = 'Enter pickup location';
    setErrors(e);
    
    if (Object.keys(e).length > 0) {
      toast.error('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleAIResult = (result) => {
    setAiResult(result);
    setForm(p => ({ ...p, category: result.category }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const donation = await addDonation({
        foodType: form.foodType,
        quantity: form.quantity,
        unit: form.unit,
        location: form.location,
        notes: form.notes,
        category: form.category || (aiResult?.category) || 'standard',
        expiresIn: aiResult?.estimatedExpiry || (form.category === 'critical' ? '2 hours' : '6 hours'),
        lat: 12.935 + (Math.random() - 0.5) * 0.05,
        lng: 77.624 + (Math.random() - 0.5) * 0.05,
      });
      setSubmitting(false);
      setDone(true);
      toast.success('Donation posted! NGOs have been notified.');
      setTimeout(() => {
        setDone(false);
        setForm({ foodType: '', quantity: '', unit: 'kg', location: user?.location || '', notes: '', category: '' });
        setAiResult(null);
        if (onSuccess) onSuccess(donation);
      }, 2000);
    } catch (err) {
      setSubmitting(false);
      toast.error('Failed to post donation. Please try again.');
    }
  };

  if (done) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-green/20 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-brand-green" />
        </div>
        <div>
          <p className="font-display font-bold text-xl text-white">Donation Posted!</p>
          <p className="text-gray-500 text-sm mt-1">NGOs and volunteers have been notified</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${form.category === 'critical' ? 'bg-red-400/10 text-red-400' : 'bg-green-400/10 text-green-400'}`}>
          {form.category === 'critical' ? '⚡ Critical — 2hr pickup' : '✓ Standard — scheduled pickup'}
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Food Type */}
      <div>
        <label>Food Type</label>
        <div className="relative">
          <select value={form.foodType} onChange={e => setForm(p => ({ ...p, foodType: e.target.value }))}>
            <option value="">Select food type...</option>
            {FOOD_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
        {errors.foodType && <p className="text-xs text-red-400 mt-1">{errors.foodType}</p>}
      </div>

      {/* Quantity */}
      <div>
        <label>Quantity</label>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="number"
              placeholder="0"
              value={form.quantity}
              onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
              className="w-20 pr-1 pl-3"
              style={{ width: '80px' }}
            />
          </div>
          <div className="flex-1 relative">
            <select 
              value={form.unit} 
              onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} 
              className="w-full pl-3 pr-8 appearance-none"
            >
              <option value="kg">kg</option>
              <option value="liters">liters</option>
              <option value="packets">packets</option>
              <option value="portions">portions</option>
              <option value="boxes">boxes</option>
              <option value="meals">meals</option>
              <option value="containers">containers</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
        {errors.quantity && <p className="text-xs text-red-400 mt-1">{errors.quantity}</p>}
      </div>

      {/* Location */}
      <div>
        <label className="flex items-center gap-1.5"><MapPin size={11} /> Pickup Location</label>
        <input
          type="text"
          placeholder="Street address or landmark"
          value={form.location}
          onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
        />
        {errors.location && <p className="text-xs text-red-400 mt-1">{errors.location}</p>}
      </div>

      {/* Priority override */}
      <div>
        <label>Priority (override AI)</label>
        <div className="flex gap-2">
          {['auto', 'critical', 'standard'].map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setForm(p => ({ ...p, category: c === 'auto' ? '' : c }))}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                (c === 'auto' && !form.category) || form.category === c
                  ? c === 'critical' ? 'bg-red-500/20 border-red-500/50 text-red-400' : c === 'standard' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/10 border-white/20 text-white'
                  : 'border-white/10 text-gray-500 hover:border-white/20'
              }`}
            >
              {c === 'auto' ? '🤖 Auto' : c === 'critical' ? '⚡ Critical' : '✓ Standard'}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label>Additional Notes (optional)</label>
        <textarea
          placeholder="Allergens, special handling instructions..."
          rows={2}
          value={form.notes}
          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
        />
      </div>

      {/* AI Analysis */}
      <div>
        <label className="flex items-center gap-1.5 mb-2">📸 Upload Photo for Analysis</label>
        <AIAnalysis onResult={handleAIResult} compact />
      </div>

      {/* AI Result display */}
      {aiResult && (
        <div className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${aiResult.category === 'critical' ? 'border-red-400/30 bg-red-400/5 text-red-400' : 'border-green-400/30 bg-green-400/5 text-green-400'}`}>
          <span className="font-bold">{aiResult.category === 'critical' ? '⚡ CRITICAL' : '✓ STANDARD'}</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-400 text-xs">Expires in {aiResult.estimatedExpiry}</span>
        </div>
      )}

      <button type="submit" className="btn-primary w-full justify-center py-3" disabled={submitting}>
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Posting Donation...
          </span>
        ) : '📢 Post Donation'}
      </button>
    </form>
  );
}
