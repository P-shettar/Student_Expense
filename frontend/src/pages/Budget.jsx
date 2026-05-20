import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';
import useCountUp from '../hooks/useCountUp';

const STAGGER = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const FADE_UP = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' } } };

export default function Budget() {
  const [data, setData] = useState({ transactions: [], user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [txRes, userRes] = await Promise.all([
          axios.get('http://localhost:5000/api/transactions', { headers: { Authorization: token } }),
          axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: token } })
        ]);
        setData({ transactions: txRes.data, user: userRes.data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data.user) return <div className="p-8 text-center text-slate-400 font-sora animate-pulse">Loading Budget...</div>;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthTransactions = (data.transactions || []).filter(t => {
    const d = new Date(t.date || t.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpent = thisMonthTransactions.reduce((acc, t) => acc + (t.type?.toLowerCase() === 'credit' ? -t.amount : t.amount), 0);
  const remaining = Math.max(0, data.user.monthlyBudget - totalSpent);
  const percentage = data.user.monthlyBudget > 0 ? Math.min(100, Math.round((totalSpent / data.user.monthlyBudget) * 100)) : 0;

  const chartData = [
    { name: 'Spent', value: totalSpent, color: 'var(--color-danger)' },
    { name: 'Remaining', value: remaining, color: 'var(--color-secondary)' }
  ];

  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="p-6 space-y-8 max-w-5xl mx-auto pb-24">
      <motion.div variants={FADE_UP} className="glass-panel p-8 rounded-3xl relative overflow-hidden">
        <h2 className="font-sora text-2xl font-bold mb-6 text-white">Monthly Budget Planner</h2>
        
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-64 h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-mono font-bold text-white">{percentage}%</span>
              <span className="text-xs text-slate-400">Used</span>
            </div>
          </div>
          
          <div className="flex-1 w-full space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
               <p className="text-slate-400 text-sm mb-1">Total Budget</p>
               <p className="font-mono text-3xl text-white font-bold">₹{data.user.monthlyBudget.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--color-danger)]/10 p-4 rounded-xl border border-[var(--color-danger)]/20">
                 <p className="text-[var(--color-danger)] text-sm mb-1">Spent</p>
                 <p className="font-mono text-xl text-white font-bold">₹{totalSpent.toLocaleString()}</p>
              </div>
              <div className="bg-[var(--color-secondary)]/10 p-4 rounded-xl border border-[var(--color-secondary)]/20">
                 <p className="text-[var(--color-secondary)] text-sm mb-1">Remaining</p>
                 <p className="font-mono text-xl text-white font-bold">₹{remaining.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
