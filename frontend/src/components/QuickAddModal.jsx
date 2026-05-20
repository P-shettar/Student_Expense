import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function QuickAddModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ 
    amount: '', 
    merchant: '', 
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/transactions/add', formData, {
        headers: { Authorization: token }
      });
      onClose(); // Auto close on success
      window.location.reload(); // Refresh to show new data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  // Use createPortal at the top level so AnimatePresence can track the DOM nodes properly
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="bg-[#12121A] w-full max-w-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 p-1.5 rounded-full transition-colors">
              <X size={20} />
            </button>
            
            <h2 className="font-sora text-xl font-bold mb-6">Quick Add Expense</h2>
            
            {error && <p className="text-[var(--color-danger)] text-sm mb-4">{error}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Amount (₹)</label>
                <input 
                  type="number" required autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] font-mono text-lg"
                  value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Merchant / Title</label>
                <input 
                  type="text" required 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)]"
                  value={formData.merchant} onChange={e => setFormData({...formData, merchant: e.target.value})}
                  placeholder="e.g. Starbucks"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
                <select 
                  className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] appearance-none"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Entertainment</option>
                  <option>Shopping</option>
                  <option>Utilities</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Date</label>
                <input 
                  type="date" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)]"
                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full bg-[var(--color-primary)] hover:bg-[#7e76ff] text-white font-sora font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_15px_var(--color-primary-glow)] mt-2 flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Expense'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
