import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2, Calendar } from 'lucide-react';
import clsx from 'clsx';

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' } }
};

function normalizeCategory(raw) {
  const map = {
    "food & dining": "Food",
    "food":          "Food",
    "groceries":     "Groceries",
    "transport":     "Transport",
    "entertainment": "Entertainment",
    "shopping":      "Shopping",
    "health":        "Health",
    "utilities":     "Utilities",
    "income":        "Income",
  }
  return map[raw?.toLowerCase().trim()] ?? "Other";
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const fileRef = useRef(null);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const resetInput = () => { e.target.value = null; };

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      if (lines.length < 2) {
        resetInput();
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const newTxns = lines.slice(1).map(line => {
        if (!line.trim()) return null;
        const values = line.split(',');
        return headers.reduce((obj, h, i) => {
          obj[h] = values[i]?.trim() || '';
          return obj;
        }, {});
      }).filter(Boolean);

      let imported = 0;
      const allowedCategories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Other'];

      for (const row of newTxns) {
        const amount = parseFloat(row.amount || row.withdrawal || 0);
        if (!isNaN(amount) && amount > 0) {
          const category = normalizeCategory(row.category);

          let dateStr = row.date;
          if (dateStr) {
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            if (isNaN(date.getTime())) {
              console.warn('Invalid date in row:', row);
              continue; // skip bad rows, don't use today
            }
            // dateStr is good to use
          } else {
            console.warn('Missing date in row:', row);
            continue; // skip bad rows, don't use today
          }

          try {
            await axios.post('http://localhost:5000/api/transactions', {
              amount,
              merchant: row.merchant || row.description || row.payee || 'Unknown',
              category,
              type: (row.type || 'debit').toLowerCase() === 'credit' ? 'Credit' : 'Debit',
              paymentMethod: row.paymentmode || row.paymentmethod || 'UPI',
              date: dateStr
            }, { headers: { Authorization: localStorage.getItem('token') }});
            imported++;
          } catch(err) {
            console.error('Import error for row', row, err.response?.data || err);
          }
        }
      }
      if (imported > 0) {
        alert(`Successfully imported ${imported} transactions!\nAI Categorisation (Claude 3.5 Sonnet) will automatically run in the background to tag merchants.`);
        window.dispatchEvent(new Event('transaction-added'));
      } else {
        alert('No valid transactions found to import. Please check your CSV format.');
      }
      resetInput();
    };
    reader.onerror = resetInput;
    reader.readAsText(file);
  };

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
          
          <input type="file" accept=".csv" ref={fileRef} className="hidden" onChange={handleImport} />
          <button 
            onClick={() => fileRef.current?.click()} 
            className="bg-[var(--color-primary)] hover:bg-[#7e76ff] text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shadow-lg shadow-[var(--color-primary)]/20"
          >
            Import CSV
          </button>
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
                      <Calendar size={14} /> {tx.date || new Date(tx.createdAt).toISOString().split('T')[0]}
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
