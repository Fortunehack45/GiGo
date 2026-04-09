import { motion } from 'motion/react';
import { Users, Copy, Share2, Gift, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function Referrals({ user }: { user: any }) {
  const referralLink = `https://gigoapp.com/signup?ref=${user?.username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32 pt-12 px-6 space-y-8"
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Refer & Earn</h1>
        <p className="text-zinc-500">Invite your friends and earn ₦5,000 per referral</p>
      </div>

      {/* Referral Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl rounded-full -mr-24 -mt-24" />
        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
            <Gift size={32} className="text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Invite Friends</h2>
            <p className="text-blue-100/80 text-sm leading-relaxed">
              Share your unique link with friends. When they sign up, you both get rewarded!
            </p>
          </div>
          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
            <p className="text-white font-mono text-sm truncate">{referralLink}</p>
            <button 
              onClick={copyToClipboard}
              className="p-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <Copy size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[24px] space-y-2">
          <Users className="text-blue-500" size={24} />
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Referrals</p>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[24px] space-y-2">
          <TrendingUp className="text-emerald-500" size={24} />
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Earned</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(user?.referralEarnings || 0)}</p>
        </div>
      </div>

      {/* How it works */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">How it works</h3>
        <div className="space-y-4">
          {[
            { step: '01', title: 'Share Link', desc: 'Copy and send your referral link to friends.' },
            { step: '02', title: 'Friend Joins', desc: 'Your friend signs up using your unique link.' },
            { step: '03', title: 'Get Paid', desc: 'Receive your referral bonus instantly in your wallet.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <span className="text-2xl font-black text-zinc-800">{item.step}</span>
              <div className="space-y-1">
                <h4 className="font-bold text-white">{item.title}</h4>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
