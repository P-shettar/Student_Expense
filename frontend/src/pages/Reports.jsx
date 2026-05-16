import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import axios from 'axios';

const STAGGER = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const FADE_UP = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' } } };

export default function Reports() {
  const [data, setData] = useState({ transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/transactions', { headers: { Authorization: token } });
        setData({ transactions: res.data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400 font-sora animate-pulse">Loading Reports...</div>;

  // Process data for Category Bar Chart
  const categoryTotals = data.transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const barData = Object.entries(categoryTotals).map(([name, amount]) => ({
    name,
    amount
  }));

  // Process data for Daily Spend Bar Chart (last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }).reverse();

  const dailyTotals = data.transactions.reduce((acc, tx) => {
    const d = new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (last7Days.includes(d)) {
      acc[d] = (acc[d] || 0) + tx.amount;
    }
    return acc;
  }, {});

  const dailyData = last7Days.map(day => ({
    day,
    amount: dailyTotals[day] || 0
  }));

  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="p-6 space-y-8 max-w-6xl mx-auto pb-24">
      <motion.div variants={FADE_UP} className="glass-panel p-8 rounded-3xl relative overflow-hidden">
        <h2 className="font-sora text-2xl font-bold mb-6 text-white">Financial Reports</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="font-sora text-lg font-semibold mb-4 text-slate-300">Spend by Category</h3>
            <div className="h-[300px] w-full">
              {barData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="amount" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="font-sora text-lg font-semibold mb-4 text-slate-300">Last 7 Days Spend</h3>
            <div className="h-[300px] w-full">
              {dailyData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="amount" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}
