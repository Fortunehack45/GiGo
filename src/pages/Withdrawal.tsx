import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export default function Withdrawal({ user }: { user: any }) {
  const [amountType, setAmountType] = useState<'30%' | '50%' | '100%'>('100%');
  const [withdrawalCode, setWithdrawalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const withdrawalOptions = [
    { type: '30%', percentage: 0.3, codePrice: 3000, label: '30% Withdrawal' },
    { type: '50%', percentage: 0.5, codePrice: 5000, label: '50% Withdrawal' },
    { type: '100%', percentage: 1.0, codePrice: 8000, label: '100% Withdrawal' },
  ];

  const selectedOption = withdrawalOptions.find(opt => opt.type === amountType)!;
  const withdrawalAmount = (user?.totalEarnings || 0) * selectedOption.percentage;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalCode) return alert('Please enter your withdrawal code');
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        amount: withdrawalAmount,
        type: amountType,
        code: withdrawalCode,
        status: 'pending',
        createdAt: serverTimestamp(),
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
        className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6"
      >
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
          <CheckCircle2 size={64} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Request Sent!</h2>
          <p className="text-zinc-400 max-w-xs mx-auto">
            Your withdrawal request of {formatCurrency(withdrawalAmount)} is being processed. It usually takes 24-48 hours.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white text-black font-bold rounded-2xl"
        >
          Back to Dashboard
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32 pt-12 px-6 space-y-8"
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Withdraw Funds</h1>
        <p className="text-zinc-500">Securely transfer your earnings to your bank</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <CreditCard size={20} />
            <span className="text-sm font-medium">Available for Withdrawal</span>
          </div>
          <span className="text-emerald-500 font-bold">{formatCurrency(user?.totalEarnings || 0)}</span>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Select Withdrawal Type</p>
          <div className="grid grid-cols-1 gap-3">
            {withdrawalOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setAmountType(opt.type as any)}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  amountType === opt.type 
                    ? 'bg-white border-white text-black' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="text-left">
                  <p className="font-bold">{opt.label}</p>
                  <p className={`text-xs ${amountType === opt.type ? 'text-zinc-600' : 'text-zinc-500'}`}>
                    Code Price: {formatCurrency(opt.codePrice)}
                  </p>
                </div>
                <p className="font-black text-lg">{formatCurrency((user?.totalEarnings || 0) * opt.percentage)}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
          <AlertCircle className="text-amber-500 shrink-0" size={20} />
          <p className="text-xs text-amber-200/80 leading-relaxed">
            To complete this withdrawal, you must provide a valid <strong>Withdrawal Code</strong>. 
            Contact support to purchase a code for your selected withdrawal tier.
          </p>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Withdrawal Code</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
              <input
                type="text"
                placeholder="Enter 8-digit code"
                required
                value={withdrawalCode}
                onChange={(e) => setWithdrawalCode(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : `Withdraw ${formatCurrency(withdrawalAmount)}`}
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
