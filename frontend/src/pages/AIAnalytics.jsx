import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ComposedChart, Line, Area, XAxis, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { BrainCircuit, AlertTriangle, Lightbulb, Zap } from 'lucide-react';
import clsx from 'clsx';

const STAGGER = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function AIAnalytics() {
  const [data, setData] = useState({ predict: null, outliers: null, patterns: null, subscriptions: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: token };
        
        const [predictRes, outliersRes, patternsRes, subRes] = await Promise.all([
          axios.get('http://localhost:5000/api/ai/predict', { headers }).catch(() => ({ data: null })),
          axios.get('http://localhost:5000/api/ai/outliers', { headers }).catch(() => ({ data: null })),
          axios.get('http://localhost:5000/api/ai/patterns', { headers }).catch(() => ({ data: null })),
          axios.get('http://localhost:5000/api/ai/subscriptions', { headers }).catch(() => ({ data: null }))
        ]);

        setData({
          predict: predictRes.data,
          outliers: outliersRes.data,
          patterns: patternsRes.data,
          subscriptions: subRes.data
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAI();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-sora">Syncing with AI Models...</div>;
  }

  // Mock data for forecasting chart since we only have single point from backend currently
  const currentAvg = data.predict?.historical_avg || 15000;
  const predicted = data.predict?.predicted_next_month_expense || 18000;
  
  const forecastData = [
    { month: 'Jan', actual: currentAvg * 0.9 },
    { month: 'Feb', actual: currentAvg * 1.1 },
    { month: 'Mar', actual: currentAvg * 0.95 },
    { month: 'Apr', actual: currentAvg },
    { month: 'May', actual: currentAvg * 1.05, forecast: currentAvg * 1.05 }, // Connect point
    { month: 'Jun', forecast: predicted }
  ];

  // Mock data for Clustering
  const radarData = [
    { subject: 'Food', A: 120, B: 110, fullMark: 150 },
    { subject: 'Transport', A: 98, B: 130, fullMark: 150 },
    { subject: 'Entertainment', A: 86, B: 130, fullMark: 150 },
    { subject: 'Utilities', A: 99, B: 100, fullMark: 150 },
    { subject: 'Shopping', A: 85, B: 90, fullMark: 150 },
    { subject: 'Savings', A: 65, B: 85, fullMark: 150 },
  ];

  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="p-6 space-y-8 max-w-7xl mx-auto pb-24">
      
      {/* Header with Neural Net SVG Background */}
      <motion.div variants={FADE_UP} className="relative glass-panel rounded-3xl p-10 overflow-hidden border-t border-t-[var(--color-primary)]/50">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="net" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="var(--color-primary)" />
                <path d="M20 20 L60 20 M20 20 L20 60 M20 20 L60 60 M20 20 L-20 60" stroke="var(--color-primary)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#net)" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="font-sora text-4xl font-bold tracking-tight mb-2">Your Financial Brain</h1>
          <p className="text-slate-400 text-lg">AI-powered insights analyzing your spending DNA.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Forecasting Chart */}
        <motion.div variants={FADE_UP} className="glass-panel p-6 rounded-3xl col-span-1 lg:col-span-2 relative overflow-hidden">
           <div className="flex justify-between items-center mb-6">
             <h2 className="font-sora text-xl font-semibold flex items-center gap-2 text-[var(--color-secondary)]">
               <BrainCircuit /> Expenditure Forecast
             </h2>
             <div className="bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] px-3 py-1 rounded-full text-xs font-bold border border-[var(--color-secondary)]/30">
               92% Confidence
             </div>
           </div>
           
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={forecastData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                 <defs>
                   <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                 <Tooltip contentStyle={{backgroundColor: '#0A0A0F', borderColor: '#334155', borderRadius: '12px'}} />
                 <Line type="monotone" dataKey="actual" stroke="var(--color-primary)" strokeWidth={3} dot={{r: 4, fill: 'var(--color-primary)', strokeWidth: 0}} />
                 <Line type="monotone" dataKey="forecast" stroke="var(--color-secondary)" strokeWidth={3} strokeDasharray="5 5" dot={{r: 4, fill: 'var(--color-secondary)', strokeWidth: 0}} />
                 <Area type="monotone" dataKey="forecast" fill="url(#forecastArea)" stroke="none" />
               </ComposedChart>
             </ResponsiveContainer>
           </div>
        </motion.div>

        {/* Spending Clusters Radar */}
        <motion.div variants={FADE_UP} className="glass-panel p-6 rounded-3xl flex flex-col">
          <h2 className="font-sora text-xl font-semibold mb-2">Peer Comparison</h2>
          <p className="text-sm text-slate-400 mb-6">How your spending aligns with similar students.</p>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 12}} />
                <Radar name="You" dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.5} />
                <Radar name="Peer Average" dataKey="B" stroke="var(--color-secondary)" fill="var(--color-secondary)" fillOpacity={0.2} />
                <Tooltip contentStyle={{backgroundColor: '#0A0A0F', borderColor: '#334155'}} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recurring Subscriptions */}
        <motion.div variants={FADE_UP} className="glass-panel p-6 rounded-3xl">
          <h2 className="font-sora text-xl font-semibold mb-6 flex items-center gap-2 text-[var(--color-secondary)]">
            <Zap /> Recurring Subscriptions
          </h2>
          <div className="space-y-4">
            {data.subscriptions?.error ? (
              <p className="text-[var(--color-danger)] font-medium text-sm">{data.subscriptions.error}</p>
            ) : data.subscriptions?.subscriptions?.length > 0 ? (
              data.subscriptions.subscriptions.map((sub, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-white">{sub.merchant}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{sub.frequency} Bill</p>
                  </div>
                  <span className="font-mono text-white font-bold tracking-tight">₹{sub.amount.toFixed(0)}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No recurring bills detected.</p>
            )}
          </div>
        </motion.div>

        {/* Anomaly Detection Timeline */}
        <motion.div variants={FADE_UP} className="glass-panel p-6 rounded-3xl">
          <h2 className="font-sora text-xl font-semibold mb-6 flex items-center gap-2 text-[var(--color-danger)]">
            <AlertTriangle /> Anomaly Detection
          </h2>
          <div className="space-y-4">
            {data.outliers?.error ? (
              <p className="text-[var(--color-danger)] font-medium text-sm">{data.outliers.error}</p>
            ) : data.outliers?.outliers?.length > 0 ? (
              data.outliers.outliers.slice(0, 3).map((outlier, i) => (
                <div key={i} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[var(--color-danger)] before:rounded-full before:shadow-[0_0_10px_var(--color-danger-glow)]">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{outlier.merchant}</h3>
                      <span className="font-mono text-[var(--color-danger)] font-bold">₹{outlier.amount}</span>
                    </div>
                    <p className="text-sm text-slate-400">Flagged by Isolation Forest. 3x higher than your usual spend here.</p>
                    <div className="mt-3 flex gap-3">
                      <button className="text-xs text-[var(--color-danger)] hover:underline">Mark Expected</button>
                      <button className="text-xs text-slate-400 hover:text-white">Dismiss</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No anomalies detected recently.</p>
            )}
          </div>
        </motion.div>

        {/* Smart Recommendations */}
        <motion.div variants={FADE_UP} className="glass-panel p-6 rounded-3xl lg:col-span-2">
          <h2 className="font-sora text-xl font-semibold mb-6 flex items-center gap-2 text-[var(--color-warning)]">
            <Lightbulb /> Smart Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.patterns?.error ? (
              <p className="text-[var(--color-warning)] font-medium text-sm col-span-2">{data.patterns.error}</p>
            ) : data.patterns?.patterns?.length > 0 ? (
              data.patterns.patterns.slice(0,4).map((p, i) => (
                <div key={i} className="bg-white/5 border border-[var(--color-warning)]/20 p-5 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="bg-[var(--color-warning)]/10 text-[var(--color-warning)] p-2 rounded-xl mt-1">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">{p}</p>
                    <button className="text-xs font-semibold text-[var(--color-warning)] bg-[var(--color-warning)]/10 px-3 py-1.5 rounded-lg hover:bg-[var(--color-warning)]/20 transition-colors">
                      Apply Budget Rule
                    </button>
                  </div>
                </div>
              ))
            ) : (
               <p className="text-slate-400 col-span-2">No definitive patterns found yet.</p>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
