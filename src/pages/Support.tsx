import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Headset, MessageSquare } from 'lucide-react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export default function Support({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'support_chats'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'support_chats');
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'support_chats'), {
        userId: user.uid,
        userName: user.username,
        text: newMessage,
        createdAt: serverTimestamp(),
        isAdmin: false
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-[calc(100vh-120px)] flex flex-col pb-24 pt-12 px-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
          <Headset size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Live Support</h1>
          <p className="text-zinc-500 text-sm">We're here to help you 24/7</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-700">
              <MessageSquare size={32} />
            </div>
            <p className="text-zinc-500 text-sm">No messages yet. Start a conversation!</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.isAdmin 
                ? 'bg-zinc-900 text-white rounded-tl-none' 
                : 'bg-white text-black rounded-tr-none'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-[10px] mt-1 opacity-50 ${msg.isAdmin ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="mt-4 relative">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-4 pr-14 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:bg-zinc-200 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </motion.div>
  );
}
