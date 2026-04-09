import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { formatCurrency } from '../lib/utils';
import { Users, Plus, ClipboardList, Activity, Search, Headset, Send, MessageSquare, User } from 'lucide-react';

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'tasks' | 'support'>('users');
  
  // New Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskReward, setTaskReward] = useState('');
  const [taskType, setTaskType] = useState('social');
  const [taskLink, setTaskLink] = useState('');

  // Support Reply
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tasks');
    });

    const unsubChats = onSnapshot(
      query(collection(db, 'support_chats'), orderBy('createdAt', 'desc'), limit(100)),
      (snapshot) => {
        setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'support_chats');
      }
    );

    return () => {
      unsubUsers();
      unsubTasks();
      unsubChats();
    };
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'tasks'), {
        title: taskTitle,
        description: taskDesc,
        reward: Number(taskReward),
        type: taskType,
        link: taskLink,
        createdAt: serverTimestamp(),
      });
      setTaskTitle('');
      setTaskDesc('');
      setTaskReward('');
      setTaskLink('');
      alert('Task added successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tasks');
    }
  };

  const handleReply = async (userId: string) => {
    const text = replyText[userId];
    if (!text?.trim()) return;

    try {
      await addDoc(collection(db, 'support_chats'), {
        userId,
        text,
        isAdmin: true,
        createdAt: serverTimestamp(),
      });
      setReplyText(prev => ({ ...prev, [userId]: '' }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'support_chats');
    }
  };

  // Group chats by userId
  const groupedChats = chats.reduce((acc: any, chat: any) => {
    if (!acc[chat.userId]) acc[chat.userId] = [];
    acc[chat.userId].push(chat);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32 pt-12 px-6 space-y-8"
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Panel</h1>
        <p className="text-zinc-500">Manage platform users, tasks, and support</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'users' ? 'bg-white text-black' : 'text-zinc-500'}`}
        >
          <Users size={18} />
          Users
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'tasks' ? 'bg-white text-black' : 'text-zinc-500'}`}
        >
          <ClipboardList size={18} />
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'support' ? 'bg-white text-black' : 'text-zinc-500'}`}
        >
          <Headset size={18} />
          Support
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none"
            />
          </div>

          <div className="space-y-4">
            {users.map((u) => (
              <div key={u.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[24px] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{u.name}</h4>
                      <p className="text-zinc-500 text-xs">@{u.username}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {u.role}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/50">
                  <div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase">Total Earnings</p>
                    <p className="text-white font-bold">{formatCurrency(u.totalEarnings)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase">Referrals</p>
                    <p className="text-white font-bold">{formatCurrency(u.referralEarnings)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-8">
          {/* Add Task Form */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[32px] space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="text-emerald-500" /> Add New Task
            </h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <input
                type="text"
                placeholder="Task Title"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white"
              />
              <textarea
                placeholder="Description"
                required
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white h-24"
              />
              <input
                type="url"
                placeholder="Task Link (e.g., https://twitter.com/...)"
                value={taskLink}
                onChange={(e) => setTaskLink(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white"
              />
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Reward (₦)"
                  required
                  value={taskReward}
                  onChange={(e) => setTaskReward(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white"
                />
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white"
                >
                  <option value="social">Social</option>
                  <option value="survey">Survey</option>
                  <option value="video">Video</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors">
                Create Task
              </button>
            </form>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Existing Tasks</h3>
            {tasks.map((t) => (
              <div key={t.id} className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">{t.title}</h4>
                  <p className="text-zinc-500 text-xs">{formatCurrency(t.reward)} • {t.type}</p>
                  {t.link && <p className="text-blue-500 text-[10px] truncate max-w-[200px]">{t.link}</p>}
                </div>
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                  <Activity size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Support Inquiries</h3>
          {Object.keys(groupedChats).length === 0 && (
            <div className="text-center py-12 text-zinc-500">No support messages found.</div>
          )}
          {Object.entries(groupedChats).map(([userId, userMsgs]: [string, any]) => (
            <div key={userId} className="bg-zinc-900/50 border border-zinc-800 rounded-[24px] overflow-hidden">
              <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="text-zinc-400" size={16} />
                  <span className="font-bold text-sm text-white">
                    {userMsgs[0]?.userName || 'User'} ({userId.slice(0, 6)}...)
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500">{userMsgs.length} messages</span>
              </div>
              <div className="p-4 max-h-60 overflow-y-auto space-y-3 scrollbar-hide">
                {userMsgs.reverse().map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl text-xs ${msg.isAdmin ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-300'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-zinc-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Reply to user..."
                  value={replyText[userId] || ''}
                  onChange={(e) => setReplyText(prev => ({ ...prev, [userId]: e.target.value }))}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                />
                <button
                  onClick={() => handleReply(userId)}
                  className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:bg-zinc-200 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
