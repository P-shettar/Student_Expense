import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email: formData.email, password: formData.password } : formData;
      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('auth-change'));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--color-dark-bg)] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-primary)] opacity-20 blur-[150px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-10 rounded-3xl relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-[0_0_20px_var(--color-primary-glow)] mb-6">
            <span className="font-sora font-bold text-white text-xl">S</span>
          </div>
          <h2 className="font-sora text-3xl font-bold tracking-tight text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join SpendSense'}
          </h2>
          <p className="text-slate-400">Enter your details to proceed.</p>
        </div>
        
        {error && (
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/50 text-[var(--color-danger)] p-4 rounded-xl mb-6 text-sm text-center font-medium">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5 font-sans">Full Name</label>
              <input 
                type="text" required 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] focus:bg-white/10 transition-colors"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5 font-sans">Email Address</label>
            <input 
              type="email" required 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] focus:bg-white/10 transition-colors font-sans"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5 font-sans">Password</label>
            <input 
              type="password" required 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] focus:bg-white/10 transition-colors font-sans"
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button type="submit" className="w-full bg-[var(--color-primary)] hover:bg-[#7e76ff] text-white font-sora font-semibold py-4 rounded-xl transition-all hover-lift shadow-[0_0_20px_var(--color-primary-glow)] mt-6">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400 text-sm font-sans">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-[var(--color-primary)] hover:text-white font-medium transition-colors">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
