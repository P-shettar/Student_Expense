import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListOrdered, 
  WalletCards, 
  BrainCircuit, 
  PieChart, 
  BarChart3, 
  LogOut, 
  Settings,
  ChevronLeft,
  ChevronRight,
  QrCode
} from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ListOrdered },
  { name: 'UPI Wallet', path: '/pay', icon: WalletCards },
  { name: 'AI Insights', path: '/analytics', icon: BrainCircuit },
  { name: 'Budget Planner', path: '/budget', icon: PieChart },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ width: 240 }}
        animate={{ width: collapsed ? 80 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="hidden md:flex flex-col h-[100dvh] glass-panel border-r border-white/10 relative z-50 shrink-0"
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 bg-[#1A1A24] border border-white/10 rounded-full p-1 hover-lift text-slate-400 hover:text-white"
        >
          {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>

        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-[0_0_15px_var(--color-primary-glow)] shrink-0">
            <span className="font-sora font-bold text-white text-lg">S</span>
          </div>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="font-sora font-semibold text-xl tracking-tight text-white whitespace-nowrap"
            >
              SpendSense
            </motion.span>
          )}
        </div>

        {/* User Profile */}
        <div className="px-6 pb-6 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-sora font-medium shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0A0F]"></div>
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">Online</p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} to={item.path} className="relative block">
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-[var(--color-primary-glow)] border border-[var(--color-primary)] rounded-xl shadow-[0_0_15px_var(--color-primary-glow)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  />
                )}
                <div className={clsx(
                  "relative z-10 flex items-center gap-3 px-4 py-3 rounded-xl transition-colors active-press",
                  isActive ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}>
                  <Icon size={20} className={clsx("shrink-0", isActive && "fill-[var(--color-primary)]/20")} />
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium whitespace-nowrap">
                      {item.name}
                    </motion.span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2">
          <Link to="/pay" className={clsx(
            "flex items-center justify-center gap-2 w-full py-3 rounded-xl transition-all active-press",
            "bg-[var(--color-primary)] text-white shadow-[0_0_20px_var(--color-primary-glow)] hover:bg-[#7e76ff]"
          )}>
            <QrCode size={20} />
            {!collapsed && <span className="font-semibold whitespace-nowrap">Quick Pay</span>}
          </Link>
          
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
            <Settings size={20} className="shrink-0" />
            {!collapsed && <span className="font-medium">Settings</span>}
          </Link>
          
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 p-2 z-50 flex justify-around items-center pb-safe">
         {NAV_ITEMS.slice(0, 5).map((item) => {
           const isActive = location.pathname === item.path;
           const Icon = item.icon;
           return (
             <Link key={item.path} to={item.path} className="relative p-3 rounded-xl flex flex-col items-center gap-1 active-press">
               {isActive && (
                 <motion.div 
                   layoutId="mobile-active-pill"
                   className="absolute inset-0 bg-[var(--color-primary-glow)] border border-[var(--color-primary)] rounded-xl shadow-[0_0_15px_var(--color-primary-glow)]"
                   transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                 />
               )}
               <Icon size={24} className={clsx("relative z-10", isActive ? "text-[var(--color-primary)] fill-[var(--color-primary)]/20" : "text-slate-400")} />
             </Link>
           );
         })}
      </div>
    </>
  );
}
