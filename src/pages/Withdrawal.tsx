import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, Landmark, Hash, ShoppingCart, X, Loader2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const BANKS = ['Opay', 'Palmpay', 'First Bank', 'Zenith Bank', 'Wema Bank'];

export default function Withdrawal({ user }: { user: any }) {
  const [amountType, setAmountType] = useState<'30%' | '50%' | '100%'>('100%');
  const [withdrawalCode, setWithdrawalCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyingCode, setBuyingCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const withdrawalOptions = [
    { type: '30%', percentage: 0.3, codePrice: 3000, label: '30% Withdrawal' },
    { type: '50%', percentage: 0.5, codePrice: 5000, label: '50% Withdrawal' },
    { type: '100%', percentage: 1.0, codePrice: 8000, label: '100% Withdrawal' },
  ];

  const selectedOption = withdrawalOptions.find(opt => opt.type === amountType)!;
  const withdrawalAmount = (user?.totalEarnings || 0) * selectedOption.percentage;

  const handleBuyCode = async () => {
    if (user.totalEarnings < selectedOption.codePrice) {
      alert('Insufficient balance to buy this code.');
      return;
    }

    setBuyingCode(true);
    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Deduct balance
      await updateDoc(doc(db, 'users', user.uid), {
        totalEarnings: increment(-selectedOption.codePrice)
      });

      // Save code
      await addDoc(collection(db, 'withdrawal_codes'), {
        code,
        userId: user.uid,
        price: selectedOption.codePrice,
        type: amountType,
        used: false,
        createdAt: serverTimestamp()
      });

      setGeneratedCode(code);
    } catch (error) {
      console.error('Error buying code:', error);
      alert('Failed to purchase code. Please try again.');
    } finally {
      setBuyingCode(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalCode) return alert('Please enter your withdrawal code');
    if (accountNumber.length !== 10) return alert('Account number must be 10 digits');
    if (!bankName) return alert('Please select a bank');
    
    setLoading(true);
    try {
      // Validate code
      const codeQuery = query(
        collection(db, 'withdrawal_codes'),
        where('code', '==', withdrawalCode),
        where('userId', '==', user.uid),
        where('used', '==', false),
        where('type', '==', amountType)
      );
      
      const codeSnap = await getDocs(codeQuery);
      if (codeSnap.empty) {
        alert('Invalid or already used withdrawal code for this tier.');
        setLoading(false);
        return;
      }

      const codeDoc = codeSnap.docs[0];

      // Create withdrawal request
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        amount: withdrawalAmount,
        type: amountType,
        code: withdrawalCode,
        accountNumber,
        bankName,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Mark code as used
      await updateDoc(doc(db, 'withdrawal_codes', codeDoc.id), {
        used: true,
        usedAt: serverTimestamp()
      });

      setSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'withdrawals');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-8"
      >
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 bg-emerald-500 blur-3xl rounded-full"
          />
          <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/50">
            <CheckCircle2 size={48} />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-white tracking-tight">Request Sent!</h2>
          <p className="text-zinc-400 max-w-xs mx-auto text-lg leading-relaxed">
            Your withdrawal of <span className="text-white font-bold">{formatCurrency(withdrawalAmount)}</span> is being processed.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full max-w-xs py-5 bg-white text-black font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Done
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32 pt-16 px-6 max-w-2xl mx-auto space-y-10"
    >
      <div className="space-y-2">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400"
        >
          <CreditCard size={12} />
          Payout Center
        </motion.div>
        <h1 className="text-5xl font-black tracking-tighter text-white">Withdraw</h1>
        <p className="text-zinc-500 text-lg font-medium">Liquidate your earnings instantly.</p>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent blur-2xl rounded-[40px] -z-10" />
        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Available Balance</p>
              <h2 className="text-4xl font-black text-white tracking-tighter">{formatCurrency(user?.totalEarnings || 0)}</h2>
            </div>
            <button 
              onClick={() => setShowBuyModal(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <ShoppingCart size={14} />
              Buy Code
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Withdrawal Tier</p>
            <div className="grid grid-cols-1 gap-4">
              {withdrawalOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setAmountType(opt.type as any)}
                  className={`relative overflow-hidden p-6 rounded-[24px] border transition-all group/btn ${
                    amountType === opt.type 
                      ? 'bg-white border-white text-black shadow-xl shadow-white/10' 
                      : 'bg-zinc-950/50 border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  {amountType === opt.type && (
                    <motion.div
                      layoutId="active-bg"
                      className="absolute inset-0 bg-white"
                    />
                  )}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-black text-lg tracking-tight">{opt.label}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${amountType === opt.type ? 'text-zinc-500' : 'text-zinc-600'}`}>
                        Code: {formatCurrency(opt.codePrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-2xl tracking-tighter">{formatCurrency((user?.totalEarnings || 0) * opt.percentage)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Bank Name</label>
                <div className="relative">
                  <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                  <select
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  >
                    <option value="" disabled className="bg-zinc-900">Select Bank</option>
                    {BANKS.map(bank => (
                      <option key={bank} value={bank} className="bg-zinc-900">{bank}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Account Number</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="10-digit account number"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Withdrawal Code</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                  <input
                    type="text"
                    placeholder="Enter unique code"
                    required
                    value={withdrawalCode}
                    onChange={(e) => setWithdrawalCode(e.target.value.toUpperCase())}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-black py-5 rounded-[24px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-white/5"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Withdraw {formatCurrency(withdrawalAmount)} <ArrowRight size={20} /></>}
            </button>
          </form>
        </div>
      </div>

      {/* Buy Code Modal */}
      <AnimatePresence>
        {showBuyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBuyModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[32px] p-8 space-y-6 shadow-2xl"
            >
              <button 
                onClick={() => setShowBuyModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-black text-white">Purchase Code</h3>
                <p className="text-zinc-500 text-sm">Buy a unique code for your withdrawal.</p>
              </div>

              {!generatedCode ? (
                <div className="space-y-6">
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-zinc-400 font-bold">{selectedOption.label}</span>
                    <span className="text-white font-black">{formatCurrency(selectedOption.codePrice)}</span>
                  </div>
                  <button
                    onClick={handleBuyCode}
                    disabled={buyingCode}
                    className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {buyingCode ? <Loader2 className="animate-spin" /> : 'Confirm Purchase'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Code Generated Successfully</p>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                      <span className="text-3xl font-mono font-black text-emerald-500 tracking-widest">{generatedCode}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500">Copy this code and use it in the withdrawal form. This code is valid for one-time use only.</p>
                  </div>
                  <button
                    onClick={() => {
                      setWithdrawalCode(generatedCode);
                      setShowBuyModal(false);
                      setGeneratedCode(null);
                    }}
                    className="w-full bg-zinc-800 text-white font-black py-4 rounded-xl"
                  >
                    Copy & Close
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
