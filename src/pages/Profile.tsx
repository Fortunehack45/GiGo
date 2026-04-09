import { motion } from 'motion/react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { User, Mail, Shield, LogOut, ChevronRight, Settings, Bell, HelpCircle } from 'lucide-react';

export default function Profile({ user }: { user: any }) {
  const handleLogout = () => {
    signOut(auth);
  };

  const menuItems = [
    { icon: Settings, label: 'Settings', color: 'text-zinc-400' },
    { icon: Bell, label: 'Notifications', color: 'text-zinc-400' },
    { icon: HelpCircle, label: 'Support', color: 'text-zinc-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32 pt-12 px-6 space-y-8"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-full flex items-center justify-center border-4 border-zinc-800 shadow-xl">
            <User size={48} className="text-zinc-500" />
          </div>
          {user?.role === 'admin' && (
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-1.5 rounded-full border-4 border-black">
              <Shield size={16} />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
          <p className="text-zinc-500 font-medium">@{user?.username}</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] overflow-hidden">
        <div className="p-6 border-bottom border-zinc-800 flex items-center gap-4">
          <Mail className="text-zinc-500" size={20} />
          <div className="flex-1">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Email</p>
            <p className="text-white font-medium">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="w-full bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-2xl flex items-center justify-between group hover:bg-zinc-800/50 transition-all"
          >
            <div className="flex items-center gap-4">
              <item.icon className={item.color} size={20} />
              <span className="text-white font-medium">{item.label}</span>
            </div>
            <ChevronRight size={20} className="text-zinc-600 group-hover:text-white transition-colors" />
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all"
      >
        <LogOut size={20} />
        Log Out
      </button>
    </motion.div>
  );
}
