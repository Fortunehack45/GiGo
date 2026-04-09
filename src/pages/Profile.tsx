import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { User, Mail, Shield, LogOut, ChevronRight, Settings, Bell, HelpCircle, Smartphone, Download, X, Share } from 'lucide-react';

export default function Profile({ user }: { user: any }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

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
      className="pb-32 pt-12 px-6 space-y-8 max-w-2xl mx-auto"
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

      {/* PWA Install Card */}
      <div className="relative overflow-hidden bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-2xl group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold">GiGo App</h3>
              <p className="text-zinc-500 text-xs">Access GiGo from your home screen</p>
            </div>
          </div>
          <button 
            onClick={handleInstall}
            className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Add to Home Screen
          </button>
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

      {/* Install Guide Modal */}
      <AnimatePresence>
        {showInstallGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstallGuide(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[32px] p-8 space-y-6 shadow-2xl"
            >
              <button 
                onClick={() => setShowInstallGuide(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                  <Smartphone className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-black text-white">Add to Home Screen</h3>
                <p className="text-zinc-500 text-sm">Access GiGo instantly like a native app.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-xs font-black shrink-0">1</div>
                    <p className="text-zinc-300 text-xs leading-relaxed">
                      Open your browser's <span className="text-white font-bold">Options</span> or <span className="text-white font-bold">Menu</span>.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-xs font-black shrink-0">2</div>
                    <p className="text-zinc-300 text-xs leading-relaxed">
                      Find and tap the <span className="text-white font-bold">"Add to Home Screen"</span> button.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-xs font-black shrink-0">3</div>
                    <p className="text-zinc-300 text-xs leading-relaxed">
                      Confirm by tapping <span className="text-white font-bold">"Add"</span> or <span className="text-white font-bold">"Install"</span>.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowInstallGuide(false)}
                className="w-full bg-white text-black font-black py-4 rounded-xl"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
