import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Loader2, Save } from 'lucide-react';

const STAGGER = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const FADE_UP = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' } } };

export default function Settings() {
  const [formData, setFormData] = useState({ name: '', monthlyBudget: '', dailyLimit: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: token } });
        setFormData({ 
          name: res.data.name || '', 
          monthlyBudget: res.data.monthlyBudget || '', 
          dailyLimit: res.data.dailyLimit || '' 
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/auth/settings', formData, {
        headers: { Authorization: token }
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('auth-change'));
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 font-sora animate-pulse">Loading Settings...</div>;

  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="p-6 space-y-8 max-w-3xl mx-auto pb-24">
      <motion.div variants={FADE_UP} className="glass-panel p-8 rounded-3xl relative overflow-hidden">
        <h2 className="font-sora text-2xl font-bold mb-6 text-white">Account Settings</h2>
        
        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.includes('Failed') ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Full Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"/>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Monthly Budget (₹)</label>
            <input type="number" value={formData.monthlyBudget} onChange={e => setFormData({...formData, monthlyBudget: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"/>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Daily UPI Limit (₹)</label>
            <input type="number" value={formData.dailyLimit} onChange={e => setFormData({...formData, dailyLimit: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"/>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">AI Auto-Categorisation Model</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] appearance-none">
              <option className="bg-[#12121A]">Claude 3.5 Sonnet (Recommended)</option>
              <option className="bg-[#12121A]">GPT-4o</option>
              <option className="bg-[#12121A]">Gemini 1.5 Pro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Anomaly Detection Sensitivity</label>
            <input type="range" min="1" max="100" defaultValue="5" className="w-full accent-[var(--color-primary)]" />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>Conservative (1%)</span>
              <span>Aggressive (10%)</span>
            </div>
          </div>
          
          <button type="submit" disabled={saving} className="bg-[var(--color-primary)] hover:bg-[#7e76ff] text-white font-sora font-semibold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_var(--color-primary-glow)]">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Save Changes
          </button>

          <div className="pt-6 mt-6 border-t border-white/10 flex flex-col gap-4">
            <button 
              type="button" 
              onClick={() => {
                if (window.confirm('Are you sure? This will delete all your local data and log you out.')) {
                  localStorage.clear();
                  window.dispatchEvent(new Event('auth-change'));
                  window.location.reload();
                }
              }} 
              className="text-left w-max px-6 py-2 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl font-medium hover:bg-[var(--color-danger)]/20 transition-colors"
            >
              Delete Account / Clear Data
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
