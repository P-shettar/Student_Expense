import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2, Calendar } from 'lucide-react';
import clsx from 'clsx';

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' } }
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/transactions', {
          headers: { Authorization: token }
        });
        setTransactions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
    
    window.addEventListener('transaction-added', fetchTransactions);
    return () => window.removeEventListener('transaction-added', fetchTransactions);
  }, []);

  const filtered = transactions.filter(t => {
    const matchesSearch = (t.merchant || '').toLowerCase().includes(search.toLowerCase()) || 
                          (t.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-full pt-32"><Loader2 className="animate-spin text-slate-400" size={32}/></div>;
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{show: {transition: {staggerChildren: 0.1}}}} className="p-6 max-w-6xl mx-auto space-y-6 pb-24">
      <motion.div variants={FADE_UP} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-sora text-3xl font-bold text-white">All Transactions</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors w-full md:w-64"
            />
          </div>
          
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] appearance-none"
          >
            <option value="All">All Types</option>
            <option value="Debit">Debit</option>
            <option value="Credit">Credit</option>
          </select>
        </div>
      </motion.div>

      <motion.div variants={FADE_UP} className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-400 text-sm font-semibold">
                <th className="p-4 pl-6">Merchant</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4">Method</th>
                <th className="p-4 pr-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No transactions found.</td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                          {(tx.merchant || 'U').charAt(0)}
                        </div>
                        <span className="font-medium text-white">{tx.merchant || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 text-sm">{tx.category || 'Other'}</td>
                    <td className="p-4 text-slate-400 text-sm flex items-center gap-2">
                      <Calendar size={14} /> {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-slate-300 text-sm">{tx.paymentMethod || 'Cash'}</td>
                    <td className={clsx("p-4 pr-6 text-right font-mono font-bold", tx.type === 'Debit' ? 'text-[var(--color-danger)]' : 'text-[var(--color-secondary)]')}>
                      {tx.type === 'Debit' ? '-' : '+'}₹{tx.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
