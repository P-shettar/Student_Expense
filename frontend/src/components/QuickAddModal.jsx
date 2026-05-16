import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function QuickAddModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ amount: '', merchant: '', category: 'Food' });
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/transactions', formData, {
        headers: { Authorization: token }
      });
      if (onSuccess) onSuccess();
      onClose();
      setFormData({ amount: '', merchant: '', category: 'Food' });
      // Dispatch an event so dashboard can refresh if it's listening
      window.dispatchEvent(new Event('transaction-added'));
    } catch (err) {
      alert('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 bottom-0 z-[100] h-[100dvh] w-full flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-[#12121A] w-full max-w-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 relative my-auto mt-safe"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"><X size={20}/></button>
            <h2 className="font-sora text-xl font-bold mb-6 text-white">Quick Add</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Amount (₹)</label>
                <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"/>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Merchant / Description</label>
                <input type="text" required value={formData.merchant} onChange={e => setFormData({...formData, merchant: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"/>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors appearance-none">
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[var(--color-primary)] hover:bg-[#7e76ff] text-white font-sora font-semibold py-3 rounded-xl mt-4 flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_var(--color-primary-glow)]">
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Add Expense'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
