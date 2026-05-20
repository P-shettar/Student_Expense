import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BrainCircuit, LineChart, ShieldCheck } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col items-center pt-8 pb-20 min-h-screen text-center space-y-12 bg-[var(--color-dark-bg)] px-6 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-primary)] opacity-20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-secondary)] opacity-10 blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center z-20 py-4 px-6 rounded-2xl glass-panel mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-[0_0_15px_var(--color-primary-glow)]">
            <span className="font-sora font-bold text-white text-xl">S</span>
          </div>
          <span className="font-sora font-bold text-xl text-white tracking-wide">SpendSense</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-6 py-2 glass-button text-white rounded-xl font-sora font-medium hover-lift">
            Log In
          </Link>
          <Link to="/login" className="px-6 py-2 bg-[var(--color-primary)] hover:bg-[#7e76ff] text-white rounded-xl font-sora font-medium hover-lift shadow-[0_0_15px_var(--color-primary-glow)]">
            Sign Up
          </Link>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl space-y-8 relative z-10"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-[0_0_30px_var(--color-primary-glow)] mb-8">
          <span className="font-sora font-bold text-white text-3xl">S</span>
        </div>

        <h1 className="font-sora text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Financial Intelligence <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
            for the Modern Student
          </span>
        </h1>
        
        <p className="text-xl text-slate-400 font-sans max-w-2xl mx-auto">
          SpendSense tracks, simulates, and predicts your financial future using advanced Machine Learning, wrapped in a luxury experience.
        </p>
        
        <div className="flex justify-center gap-4 pt-6">
          <Link to="/login" className="px-8 py-4 bg-[var(--color-primary)] hover:bg-[#7e76ff] text-white rounded-2xl font-sora font-semibold text-lg hover-lift shadow-[0_0_20px_var(--color-primary-glow)]">
            Get Started Free
          </Link>
          <a href="#features" className="px-8 py-4 glass-button text-white rounded-2xl font-sora font-semibold text-lg hover-lift">
            Explore Features
          </a>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="grid md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl relative z-10"
        id="features"
      >
        <FeatureCard 
          icon={BrainCircuit}
          title="AI Forecasting" 
          desc="Predict next month's expenses and get warnings before you overspend."
        />
        <FeatureCard 
          icon={LineChart}
          title="Pattern Analysis" 
          desc="Discover spending combinations and find smart saving opportunities."
        />
        <FeatureCard 
          icon={ShieldCheck}
          title="Simulated UPI Wallet" 
          desc="A sandbox environment to simulate payments and test limits safely."
        />
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="glass-panel p-8 rounded-3xl hover-lift group border-t-2 border-t-[var(--color-primary)]/50 text-left">
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="text-[var(--color-primary)]" size={28} />
      </div>
      <h3 className="font-sora text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 leading-relaxed font-sans">{desc}</p>
    </div>
  );
}
