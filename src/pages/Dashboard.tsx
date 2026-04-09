import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wallet, Clock, Users, TrendingUp, Bell, Copy, CheckCircle2, ArrowUpRight, Gift, Share2 } from 'lucide-react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { formatCurrency } from '../lib/utils';

export default function Dashboard({ user }: { user: any }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    // Fetch recent task completions
    const tasksQuery = query(
      collection(db, 'userTasks'),
      where('userId', '==', user.uid),
      orderBy('completedAt', 'desc'),
      limit(5)
    );

    // Fetch recent withdrawals
    const withdrawalsQuery = query(
      collection(db, 'withdrawals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const taskActivities = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'task',
        title: 'Task Completed',
        amount: 0, // We'll need to fetch the task reward if we want it here, or just show 'Completed'
        date: doc.data().completedAt?.toDate(),
        status: doc.data().status
      }));
      updateActivities(taskActivities, 'task');
    }, (error) => handleFirestoreError(error, OperationType.GET, 'userTasks'));

    const unsubWithdrawals = onSnapshot(withdrawalsQuery, (snapshot) => {
      const withdrawalActivities = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'withdrawal',
        title: 'Withdrawal Request',
        amount: doc.data().amount,
        date: doc.data().createdAt?.toDate(),
        status: doc.data().status
      }));
      updateActivities(withdrawalActivities, 'withdrawal');
    }, (error) => handleFirestoreError(error, OperationType.GET, 'withdrawals'));

    return () => {
      unsubTasks();
      unsubWithdrawals();
    };
  }, [user?.uid]);

  const updateActivities = (newItems: any[], type: string) => {
    setActivities(prev => {
      const filtered = prev.filter(item => item.type !== type);
      const combined = [...filtered, ...newItems].sort((a, b) => b.date - a.date).slice(0, 5);
      return combined;
    });
    setLoading(false);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${user.username}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  const stats = [
    {
      label: 'Total Earnings',
      value: formatCurrency(user.totalEarnings || 0),
      icon: Wallet,
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      label: 'Pending Earnings',
      value: formatCurrency(user.pendingEarnings || 0),
      icon: Clock,
      color: 'bg-amber-500/10 text-amber-500',
    },
    {
      label: 'Referral Earnings',
      value: formatCurrency(user.referralEarnings || 0),
      icon: Users,
      color: 'bg-blue-500/10 text-blue-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32 pt-12 px-6 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-black font-black text-xs">GiGo</span>
          </div>
          <div className="space-y-0.5">
            <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Welcome back,</h2>
            <h1 className="text-xl font-bold tracking-tight text-white">{user.username}</h1>
          </div>
        </div>
        <button className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
          <Bell size={20} />
        </button>
      </div>

      {/* Main Card */}
      <div className="relative overflow-hidden bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] -mr-40 -mt-40 rounded-full transition-all duration-700 group-hover:bg-white/20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -ml-32 -mb-32 rounded-full" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3 text-zinc-400">
            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Total Portfolio</span>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-6xl font-black text-white tracking-tighter">
              {formatCurrency(user.totalEarnings || 0)}
            </h3>
            <p className="text-emerald-500 text-xs font-bold flex items-center gap-1">
              <ArrowUpRight size={14} />
              +12.5% from last month
            </p>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              onClick={() => window.location.href = '/withdrawal'}
              className="flex-1 bg-white text-black font-black py-5 rounded-[24px] shadow-xl shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Withdraw
            </button>
            <button className="flex-1 bg-white/5 text-white font-black py-5 rounded-[24px] border border-white/10 hover:bg-white/10 transition-all">
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] space-y-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
        <div className="flex items-center gap-2 text-zinc-400">
          <Gift size={18} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Invite & Earn</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-5">
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Your Unique Code</p>
              <span className="text-2xl font-mono font-black text-white tracking-[0.2em]">{user.username}</span>
            </div>
            <button 
              onClick={copyReferralCode}
              className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            >
              {copied ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Copy size={20} />}
            </button>
          </div>

          <button 
            onClick={copyReferralLink}
            className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5"
          >
            <Share2 size={20} />
            Share Referral Link
          </button>
        </div>
        
        <p className="text-zinc-500 text-[11px] font-medium leading-relaxed text-center">
          Earn <span className="text-emerald-500 font-bold">₦2,000</span> for every successful signup using your link!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-3xl border border-white/10 p-6 rounded-[32px] flex items-center gap-5 shadow-xl"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color} backdrop-blur-xl border border-white/5 shadow-inner`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-black text-white tracking-tight">Activity</h3>
          <button className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">View All</button>
        </div>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/5 rounded-[32px] text-zinc-600 italic text-sm font-medium">
              No recent activity found
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="group relative overflow-hidden bg-zinc-900/30 backdrop-blur-xl border border-white/5 p-5 rounded-[24px] flex items-center justify-between hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-2xl border border-white/5 shadow-inner ${
                    activity.type === 'task' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {activity.type === 'task' ? <CheckCircle2 size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white tracking-tight">{activity.title}</h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                      {activity.date?.toLocaleDateString()} • {activity.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.amount > 0 && (
                    <p className="text-sm font-black text-white">-{formatCurrency(activity.amount)}</p>
                  )}
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-auto mt-1 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
