import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AIAnalytics from './pages/AIAnalytics';
import UpiPay from './pages/UpiPay';
import Budget from './pages/Budget';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Transactions from './pages/Transactions';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AIChatBot from './components/AIChatBot';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function AnimatedRoutes() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(!!localStorage.getItem('token'));
    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  return (
    <div className="flex min-h-[100dvh] bg-[var(--color-dark-bg)] text-slate-50 overflow-hidden font-sans">
      {isAuthenticated && <Sidebar />}
      <div className="flex-1 flex flex-col relative h-[100dvh] overflow-y-auto overflow-x-hidden scroll-smooth">
        {isAuthenticated && <TopBar />}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AIAnalytics /></ProtectedRoute>} />
            <Route path="/pay" element={<ProtectedRoute><UpiPay /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
        {isAuthenticated && <AIChatBot />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}
