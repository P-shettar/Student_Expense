import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Send, ScanLine, Search, Check, Loader2, ArrowDownLeft 
} from 'lucide-react';
import useCountUp from '../hooks/useCountUp';

export default function UpiPay() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  
  // Modal states
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendStep, setSendStep] = useState(1); // 1: Search, 2: Amount, 3: Processing, 4: Success
  const [sendData, setSendData] = useState({ merchant: '', amount: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [userRes, txRes] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: token } }),
          axios.get('http://localhost:5000/api/transactions', { headers: { Authorization: token } })
        ]);
        setBalance(userRes.data.walletBalance);
        setUser(userRes.data);
        setTransactions(txRes.data);
      } catch (err) {}
    };
    fetchData();
  }, [showSendModal]); // Refresh when modal closes

  const handleSendMoney = async () => {
    setSendStep(3);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/transactions/upi-pay', 
        { amount: Number(sendData.amount), merchant: sendData.merchant || 'Unknown', category: 'Other' },
        { headers: { Authorization: token } }
      );
      if (res.data.limitWarning) {
        setSendData(s => ({ ...s, warning: res.data.limitWarning }));
      }
      setTimeout(() => setSendStep(4), 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed');
      setSendStep(2);
    }
  };

  const closeSendModal = () => {
    setShowSendModal(false);
    setTimeout(() => { setSendStep(1); setSendData({ merchant: '', amount: '' }); }, 300);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12 pb-24">
      {/* Wallet Section */}
      <div className="flex flex-col items-center pt-8">
        <VirtualCard balance={balance} userName={user?.name || 'User'} />
        
        <div className="mt-10 flex gap-4 w-full max-w-md">
          <button 
            onClick={() => setShowSendModal(true)}
            className="flex-1 bg-[var(--color-primary)] hover:bg-[#7e76ff] text-white py-4 rounded-2xl font-sora font-semibold flex items-center justify-center gap-2 hover-lift shadow-[0_0_20px_var(--color-primary-glow)]"
          >
            <Send size={20} /> Send Money
          </button>
          <button className="flex-1 glass-button py-4 rounded-2xl font-sora font-semibold flex items-center justify-center gap-2 hover-lift text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
            <ScanLine size={20} /> Scan QR
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-sora text-xl font-semibold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {transactions.slice(0, 10).map((tx, i) => (
            <div key={i} className="glass-panel p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                  <ArrowDownLeft className="text-[var(--color-danger)]" size={20} />
                </div>
                <div>
                  <p className="font-medium text-white">{tx.merchant || 'Unknown'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="font-mono text-lg font-semibold text-white tracking-tight">
                -₹{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Send Money Modal */}
      <AnimatePresence>
        {showSendModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pb-0 sm:pb-4"
          >
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#12121A] w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[600px]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex justify-between items-center relative">
                <button onClick={closeSendModal} className="text-slate-400 p-2">Cancel</button>
                <span className="font-sora font-semibold">Send Money</span>
                <div className="w-14"></div>
              </div>

              {/* Content area */}
              <div className="flex-1 p-6 relative">
                
                {sendStep === 1 && (
                  <motion.div initial={{x:20, opacity:0}} animate={{x:0, opacity:1}} className="space-y-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Enter name or UPI ID..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                        value={sendData.merchant}
                        onChange={e => setSendData({...sendData, merchant: e.target.value})}
                      />
                    </div>
                    {sendData.merchant.length > 2 && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider pl-2">Recents</p>
                        <button 
                          onClick={() => setSendStep(2)}
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-sora font-bold">
                            {sendData.merchant.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">{sendData.merchant}</p>
                            <p className="text-xs text-slate-400">UPI ID: {sendData.merchant.toLowerCase().replace(' ','')}@spendsense</p>
                          </div>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {sendStep === 2 && (
                  <motion.div initial={{x:20, opacity:0}} animate={{x:0, opacity:1}} className="flex flex-col h-full">
                    <div className="text-center mb-8">
                      <p className="text-slate-400 mb-2">Sending to {sendData.merchant}</p>
                      <div className="flex justify-center items-center gap-1 font-mono text-5xl font-bold text-white">
                        <span>₹</span>
                        <span>{sendData.amount || '0'}</span>
                      </div>
                    </div>

                    {/* Numpad */}
                    <div className="grid grid-cols-3 gap-3 mt-auto mb-6">
                      {[1,2,3,4,5,6,7,8,9,'.',0,'<'].map((key, i) => (
                        <button 
                          key={i}
                          onClick={() => {
                            if(key === '<') setSendData(s => ({...s, amount: s.amount.slice(0,-1)}));
                            else setSendData(s => ({...s, amount: s.amount + key}));
                          }}
                          className="bg-white/5 hover:bg-white/10 rounded-2xl h-16 text-2xl font-mono text-white active-press"
                        >
                          {key}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={handleSendMoney}
                      disabled={!sendData.amount || Number(sendData.amount) <= 0}
                      className="w-full bg-[var(--color-primary)] disabled:opacity-50 text-white py-4 rounded-2xl font-sora font-bold text-lg shadow-[0_0_20px_var(--color-primary-glow)]"
                    >
                      Pay Now
                    </button>
                  </motion.div>
                )}

                {sendStep === 3 && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} className="h-full flex flex-col items-center justify-center space-y-6">
                    <Loader2 className="animate-spin text-[var(--color-primary)]" size={64} />
                    <p className="font-sora text-lg animate-pulse">Processing Payment...</p>
                  </motion.div>
                )}

                {sendStep === 4 && (
                  <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                      <motion.div
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Check size={48} />
                      </motion.div>
                    </div>
                    <div>
                      <h3 className="font-sora text-2xl font-bold text-white mb-2">₹{sendData.amount} Sent!</h3>
                      <p className="text-slate-400">To {sendData.merchant}</p>
                    </div>
                    {sendData.warning && (
                      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20 p-3 rounded-xl text-sm font-medium mt-4">
                        ⚠️ {sendData.warning}
                      </motion.div>
                    )}
                    <button 
                      onClick={closeSendModal}
                      className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-sora mt-8 transition-colors"
                    >
                      Done
                    </button>
                  </motion.div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 3D Virtual Card Component
function VirtualCard({ balance, userName }) {
  const cardRef = useRef(null);
  const animatedBalance = useCountUp(balance);

  const handleMouseMove = (e) => {
    if(!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if(!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full max-w-[380px] aspect-[1.586/1] rounded-3xl p-6 relative overflow-hidden transition-transform duration-200 ease-out shadow-2xl border border-white/20"
      style={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #0F3443 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(108, 99, 255, 0.2)'
      }}
    >
      {/* Decorative Gradients */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-primary)] rounded-full blur-[60px] opacity-40"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--color-secondary)] rounded-full blur-[60px] opacity-20"></div>

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <CreditCard className="text-white/80" size={32} />
          <p className="font-sora font-medium text-white/60 tracking-wider">SPENDSENSE</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-white/60 font-medium">Available Balance</p>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-4xl font-bold tracking-tight text-white">₹{animatedBalance.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <p className="font-sora font-semibold tracking-wider text-white/80 uppercase">{userName}</p>
          <p className="font-mono text-sm text-white/50 tracking-widest">**** **** 4209</p>
        </div>
      </div>
    </div>
  );
}
