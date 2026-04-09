import { motion } from 'motion/react';
import { Wallet, Clock, Users, TrendingUp, Bell } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function Dashboard({ user }: { user: any }) {
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
        <div className="space-y-1">
          <h2 className="text-zinc-500 font-medium">Welcome back,</h2>
          <h1 className="text-3xl font-bold tracking-tight text-white">{user.username}</h1>
        </div>
        <button className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
          <Bell size={24} />
        </button>
      </div>

      {/* Main Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 rounded-[32px] p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -mr-32 -mt-32 rounded-full" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-zinc-400">
            <TrendingUp size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Available Balance</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-5xl font-bold text-white tracking-tighter">
              {formatCurrency(user.totalEarnings || 0)}
            </h3>
            <p className="text-emerald-500 text-sm font-medium">+15% from last week</p>
          </div>
          <div className="pt-4 flex gap-4">
            <button 
              onClick={() => window.location.href = '/withdrawal'}
              className="flex-1 bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-colors"
            >
              Withdraw
            </button>
            <button className="flex-1 bg-zinc-900 text-white font-bold py-4 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-colors">
              History
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[24px] flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Placeholder */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl" />
                <div>
                  <div className="w-24 h-4 bg-zinc-800 rounded mb-1" />
                  <div className="w-16 h-3 bg-zinc-900 rounded" />
                </div>
              </div>
              <div className="w-12 h-4 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
