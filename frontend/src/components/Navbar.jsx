import { Link, useNavigate } from 'react-router-dom';
import { Wallet, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 py-4 px-6 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        <Wallet className="text-blue-400" />
        FinAI
      </Link>
      
      <div>
        {token ? (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        ) : (
          <Link to="/login" className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-medium transition-colors">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
