import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Navbar } from './components/Navbar';
import { motion, AnimatePresence } from 'motion/react';

// Pages
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Referrals from './pages/Referrals';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Withdrawal from './pages/Withdrawal';
import Support from './pages/Support';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 bg-white rounded-full blur-xl"
        />
      </div>
    );
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isAdmin = user?.email === 'fortunedomination@gmail.com' || userData?.role === 'admin';

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
          
          <Route path="/" element={user ? <Dashboard user={userData} /> : <Navigate to="/login" />} />
          <Route path="/tasks" element={user ? <Tasks user={userData} /> : <Navigate to="/login" />} />
          <Route path="/referrals" element={user ? <Referrals user={userData} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={userData} /> : <Navigate to="/login" />} />
          <Route path="/withdrawal" element={user ? <Withdrawal user={userData} /> : <Navigate to="/login" />} />
          <Route path="/support" element={user ? <Support user={userData} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </AnimatePresence>

      {user && !isAuthPage && <Navbar isAdmin={isAdmin} />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
