import { Bell, Search, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import QuickAddModal from './QuickAddModal';

export default function TopBar() {
  const location = useLocation();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  
  // Format page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/analytics') return 'AI Insights';
    if (path === '/pay') return 'UPI Wallet';
    if (path === '/transactions') return 'Transactions';
    return 'SpendSense';
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-dark-bg)]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <h1 className="font-sora font-semibold text-2xl text-white">
        {getPageTitle()}
      </h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-400 focus-within:border-[var(--color-primary)] transition-colors">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="bg-transparent border-none outline-none text-sm text-white w-48"
            onChange={(e) => window.dispatchEvent(new CustomEvent('search-transactions', { detail: e.target.value }))}
          />
          <kbd className="ml-2 font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded text-slate-300">⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-danger)] rounded-full shadow-[0_0_8px_var(--color-danger-glow)]"></span>
        </button>

        {/* Quick Add Expense */}
        <button 
          onClick={() => setIsQuickAddOpen(true)}
          className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          Quick Add
        </button>
      </div>

      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
        onSuccess={() => {}}
      />
    </header>
  );
}
