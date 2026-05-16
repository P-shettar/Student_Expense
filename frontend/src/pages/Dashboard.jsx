import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Coffee, Bus, Film, ShoppingBag, Zap, CircleDollarSign, 
  MoreHorizontal, Flag, Split, Tag 
} from 'lucide-react';
import useCountUp from '../hooks/useCountUp';
import clsx from 'clsx';

// Constants
const STAGGER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};
const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const CATEGORY_ICONS = {
  Food: <Coffee size={18} />,
  Transport: <Bus size={18} />,
  Entertainment: <Film size={18} />,
  Shopping: <ShoppingBag size={18} />,
  Utilities: <Zap size={18} />,
  Other: <CircleDollarSign size={18} />
};

export default function Dashboard() {
  const [data, setData] = useState({ transactions: [], user: null, riskScore: 0, weakPoints: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [txRes, userRes, wpRes] = await Promise.all([
        axios.get('http://localhost:5000/api/transactions', { headers: { Authorization: token } }),
        axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: token } }),
        axios.get('http://localhost:5000/api/ai/weak-points', { headers: { Authorization: token } }).catch(() => ({ data: null }))
      ]);
      setData({ 
        transactions: txRes.data, 
        user: userRes.data,
        riskScore: Math.floor(Math.random() * 40) + 10, // Mock risk score 10-50 for UI
        weakPoints: wpRes.data
      });
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data. Please try logging in again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('transaction-added', fetchData);
    
    const handleSearch = (e) => setSearchQuery(e.detail.toLowerCase());
    window.addEventListener('search-transactions', handleSearch);
    
    return () => {
      window.removeEventListener('transaction-added', fetchData);
      window.removeEventListener('search-transactions', handleSearch);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="w-1/3 h-12 bg-white/5 animate-pulse rounded-lg glass-panel"></div>
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl glass-panel"></div>)}
        </div>
        <div className="h-64 bg-white/5 animate-pulse rounded-2xl glass-panel"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="p-6 text-[var(--color-danger)] bg-[var(--color-danger)]/10 rounded-xl border border-[var(--color-danger)]/20 font-sora">
          {error}
        </div>
      </div>
    );
  }

  if (!data.user) return null;

  const { transactions, user, riskScore } = data;
  
  const filteredTransactions = transactions.filter(t => {
    const merchant = t.merchant || '';
    const category = t.category || '';
    return merchant.toLowerCase().includes(searchQuery) || 
           category.toLowerCase().includes(searchQuery);
  });
  
  // Calculations
  const totalSpent = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  const remaining = Math.max(0, user.monthlyBudget - totalSpent);
  const biggestTx = filteredTransactions.length ? Math.max(...filteredTransactions.map(t => t.amount)) : 0;

  // Chart Data Preparation
  const chartData = [...filteredTransactions].reverse().slice(0, 30).map(t => ({
    date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: t.amount,
    category: t.category
  }));

  const categoryTotals = filteredTransactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const greeting = time.getHours() < 12 ? 'Good morning' : time.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div 
      variants={STAGGER} initial="hidden" animate="show"
      className="p-6 space-y-8 pb-24 md:pb-6 max-w-7xl mx-auto"
    >
      {/* Hero */}
      <motion.div variants={FADE_UP} className="flex justify-between items-end">
        <div>
          <h1 className="font-sora text-3xl md:text-4xl font-semibold tracking-tight">
            {greeting}, {user.name.split(' ')[0]} <span className="animate-pulse">👋</span>
          </h1>
          <p className="text-slate-400 mt-2">
            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={FADE_UP} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard title="Total Spent" value={totalSpent} color="primary" />
        <MetricCard title="Remaining Budget" value={remaining} color="secondary" />
        <MetricCard title="Biggest Expense" value={biggestTx} color="warning" />
        <MetricCard title="AI Risk Score" value={riskScore} isCurrency={false} color="danger" suffix="/100" />
      </motion.div>

      {/* AI Suggestion Panel */}
      {data.weakPoints && data.weakPoints.suggestion && (
        <motion.div variants={FADE_UP} className="glass-panel p-6 rounded-2xl border-l-4 border-l-[var(--color-warning)] bg-[var(--color-warning)]/5 flex items-start gap-4">
          <div className="p-3 bg-[var(--color-warning)]/20 rounded-full text-[var(--color-warning)]">
            <Zap size={24} />
          </div>
          <div>
            <h3 className="font-sora font-semibold text-lg text-white mb-1">AI Spending Analysis</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{data.weakPoints.suggestion}</p>
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Chart & Categories */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={FADE_UP} className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <h2 className="font-sora text-lg font-semibold mb-6">Spending Overview</h2>
            <div className="h-[280px] w-full">
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 font-sora">No transaction data available yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'var(--font-sans)' }} 
                      dy={10}
                      minTickGap={30}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="var(--color-primary)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Categories Horizontal Scroll */}
          <motion.div variants={FADE_UP} className="space-y-4">
            <h2 className="font-sora text-lg font-semibold px-2">Category Breakdown</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
              {Object.keys(categoryTotals).length === 0 ? (
                <div className="text-slate-500 font-sora px-4">No categories to display.</div>
              ) : (
                Object.entries(categoryTotals).map(([cat, amount]) => (
                  <div key={cat} className="glass-panel p-4 rounded-2xl min-w-[200px] shrink-0 snap-center hover-lift flex items-center gap-4">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <PieChart width={48} height={48}>
                        <Pie data={[{value: amount}, {value: user.monthlyBudget - amount}]} cx="50%" cy="50%" innerRadius={20} outerRadius={24} dataKey="value" stroke="none">
                          <Cell fill="var(--color-secondary)" />
                          <Cell fill="rgba(255,255,255,0.05)" />
                        </Pie>
                      </PieChart>
                      <div className="absolute text-slate-300">
                        {CATEGORY_ICONS[cat] || <CircleDollarSign size={14}/>}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-300">{cat}</p>
                      <p className="font-mono text-white font-semibold">₹{amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Transactions */}
        <motion.div variants={FADE_UP} className="glass-panel rounded-3xl overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="font-sora text-lg font-semibold">Recent Transactions</h2>
            <button className="text-sm text-[var(--color-primary)] hover:text-white transition-colors">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredTransactions.length === 0 ? (
               <div className="text-center text-slate-500 py-10 text-sm">No transactions found.</div>
            ) : filteredTransactions.slice(0, 8).map((tx) => (
              <div key={tx._id} className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 font-bold uppercase">
                    {(tx.merchant || 'U').charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{tx.merchant || 'Unknown'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{tx.category || 'Other'} • {new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-[var(--color-warning)] rounded-lg hover:bg-white/10"><Flag size={14}/></button>
                    <button className="p-1.5 text-slate-400 hover:text-[var(--color-secondary)] rounded-lg hover:bg-white/10"><Split size={14}/></button>
                  </div>
                  <span className={clsx("font-mono font-medium", tx.type === 'Debit' ? 'text-[var(--color-danger)]' : 'text-[var(--color-secondary)]')}>
                    {tx.type === 'Debit' ? '-' : '+'}₹{tx.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Subcomponents

function MetricCard({ title, value, color, isCurrency = true, suffix = '' }) {
  const animatedValue = useCountUp(value);
  
  return (
    <div className={clsx(
      "glass-panel p-6 rounded-3xl relative overflow-hidden hover-lift group",
      `border-t-[var(--color-${color})] border-t-2 shadow-[0_4px_30px_rgba(0,0,0,0.1)]`
    )}>
      <div className={clsx(
        "absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-12 blur-[30px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity",
        `bg-[var(--color-${color})]`
      )}/>
      <p className="text-slate-400 font-medium text-sm mb-2 relative z-10">{title}</p>
      <p className="font-mono text-3xl font-bold text-white relative z-10 tracking-tight">
        {isCurrency && '₹'}{animatedValue.toLocaleString()}{suffix}
      </p>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-panel p-4 rounded-xl border border-white/20 shadow-2xl backdrop-blur-3xl">
        <p className="text-xs text-slate-400 mb-2">{data.date}</p>
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-primary)]">{CATEGORY_ICONS[data.category] || <CircleDollarSign size={16}/>}</span>
          <span className="font-mono text-xl font-bold text-white">₹{data.amount}</span>
        </div>
      </div>
    );
  }
  return null;
};
