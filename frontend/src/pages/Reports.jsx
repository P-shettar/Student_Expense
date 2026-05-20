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

  const exportCSV = () => {
    if (!data.transactions.length) return alert('No data to export');
    const headers = ['Date', 'Time', 'Merchant', 'Category', 'Amount', 'Type', 'Payment Method'];
    const csvContent = [
      headers.join(','),
      ...data.transactions.map(t => {
        const d = new Date(t.createdAt);
        const dateStr = t.date || d.toISOString().split('T')[0];
        return [
          dateStr,
          d.toISOString().split('T')[1].substring(0,8),
          `"${(t.merchant || '').replace(/"/g, '""')}"`,
          `"${t.category || ''}"`,
          t.amount,
          t.type,
          t.paymentMethod
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'spendsense_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process data for Category Bar Chart
  const initialCategories = { Food: 0, Transport: 0, Groceries: 0, Entertainment: 0, Shopping: 0, Health: 0, Utilities: 0 };
  const categoryTotals = (data.transactions || []).reduce((acc, tx) => {
    const cat = tx.category || 'Other';
    acc[cat] = (acc[cat] || 0) + tx.amount;
    return acc;
  }, { ...initialCategories });

  const barData = Object.entries(categoryTotals).map(([name, amount]) => ({
    name,
    amount
  }));

  // Process data for Daily Spend Bar Chart (last 7 days)
  let latestDate = new Date();
  if (data.transactions && data.transactions.length > 0) {
    const maxDateStr = data.transactions.reduce((maxStr, tx) => {
      const dStr = tx.date || new Date(tx.createdAt).toISOString().split('T')[0];
      return dStr > maxStr ? dStr : maxStr;
    }, "0000-00-00");
    if (maxDateStr !== "0000-00-00") {
      const [y, m, d] = maxDateStr.split('-').map(Number);
      latestDate = new Date(y, m - 1, d);
    }
  }

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date(latestDate);
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }).reverse();

  const dailyTotals = (data.transactions || []).reduce((acc, tx) => {
    const txDateStr = tx.date || new Date(tx.createdAt).toISOString().split('T')[0];
    const [y, m, d] = txDateStr.split('-').map(Number);
    const txDateObj = new Date(y, m - 1, d);
    const dateLabel = txDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (last7Days.includes(dateLabel)) {
      acc[dateLabel] = (acc[dateLabel] || 0) + tx.amount;
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-sora text-2xl font-bold text-white">Financial Reports</h2>
          <button onClick={exportCSV} className="bg-[var(--color-primary)] hover:bg-[#7e76ff] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-[var(--color-primary)]/20">
            Export Dataset (CSV)
          </button>
        </div>
        
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
                    <XAxis dataKey="name" interval={0} stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} angle={-45} textAnchor="end" height={60} dy={10} dx={-5} axisLine={false} tickLine={false} />
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
                    <XAxis dataKey="day" interval={0} stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} angle={-45} textAnchor="end" height={50} dy={10} dx={-5} axisLine={false} tickLine={false} />
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
