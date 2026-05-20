import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Save } from 'lucide-react';
import axios from 'axios';

export default function SettingsModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: '', monthlyBudget: '', dailyLimit: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setFormData({
        name: user.name || '',
        monthlyBudget: user.monthlyBudget || 15000,
        dailyLimit: user.dailyLimit || 2000
      });
      setSuccess(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/auth/settings', formData, {
        headers: { Authorization: token }
      });
      
      // Update local storage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="bg-[#12121A] w-full max-w-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 p-1.5 rounded-full transition-colors">
              <X size={20} />
            </button>
            
            <h2 className="font-sora text-xl font-bold mb-6">Account Settings</h2>
            
            {error && <p className="text-[var(--color-danger)] text-sm mb-4">{error}</p>}
            {success && <p className="text-[var(--color-secondary)] text-sm mb-4">Settings saved successfully!</p>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Display Name</label>
                <input 
                  type="text" required 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)]"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Monthly Budget (₹)</label>
                <input 
                  type="number" required 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  value={formData.monthlyBudget} onChange={e => setFormData({...formData, monthlyBudget: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Daily Spending Limit (₹)</label>
                <input 
                  type="number" required 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  value={formData.dailyLimit} onChange={e => setFormData({...formData, dailyLimit: e.target.value})}
                />
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-sora font-semibold py-3.5 rounded-xl transition-all mt-2 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />} Save Changes
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
