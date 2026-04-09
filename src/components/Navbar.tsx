import React from 'react';
import { motion } from 'motion/react';
import { Home, ClipboardList, Users, User, ShieldCheck, CreditCard, Headset } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

function NavItem({ to, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Link to={to} className="relative flex flex-col items-center justify-center w-14 h-14 group">
      {isActive && (
        <motion.div
          layoutId="nav-glow"
          className="absolute inset-0 bg-white/10 blur-xl rounded-full"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
      <div className={cn(
        "relative z-10 flex flex-col items-center transition-all duration-300",
        isActive ? "text-white scale-110" : "text-zinc-500 hover:text-zinc-300"
      )}>
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[8px] mt-1 font-medium">{label}</span>
      </div>
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
}

export function Navbar({ isAdmin }: { isAdmin?: boolean }) {
  const location = useLocation();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90%] sm:max-w-md">
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-around px-4 py-3 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl shadow-black/50"
      >
        <NavItem to="/" icon={Home} label="Home" isActive={location.pathname === '/'} />
        <NavItem to="/tasks" icon={ClipboardList} label="Tasks" isActive={location.pathname === '/tasks'} />
        <NavItem to="/referrals" icon={Users} label="Refer" isActive={location.pathname === '/referrals'} />
        <NavItem to="/withdrawal" icon={CreditCard} label="Withdraw" isActive={location.pathname === '/withdrawal'} />
        <NavItem to="/support" icon={Headset} label="Support" isActive={location.pathname === '/support'} />
        <NavItem to="/profile" icon={User} label="Profile" isActive={location.pathname === '/profile'} />
        {isAdmin && (
          <NavItem to="/admin" icon={ShieldCheck} label="Admin" isActive={location.pathname === '/admin'} />
        )}
      </motion.nav>
    </div>
  );
}
