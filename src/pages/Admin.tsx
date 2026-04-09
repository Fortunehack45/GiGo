import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { formatCurrency } from '../lib/utils';
import { Users, Plus, ClipboardList, Activity, Search } from 'lucide-react';

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'tasks'>('users');
  
  // New Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskReward, setTaskReward] = useState('');
  const [taskType, setTaskType] = useState('social');

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubUsers();
      unsubTasks();
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
        createdAt: serverTimestamp(),
      });
      setTaskTitle('');
      setTaskDesc('');
      setTaskReward('');
      alert('Task added successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tasks');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32 pt-12 px-6 space-y-8"
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Panel</h1>
        <p className="text-zinc-500">Manage platform users and tasks</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'users' ? 'bg-white text-black' : 'text-zinc-500'}`}
        >
          <Users size={18} />
          Users
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'tasks' ? 'bg-white text-black' : 'text-zinc-500'}`}
        >
          <ClipboardList size={18} />
          Tasks
        </button>
      </div>

      {activeTab === 'users' ? (
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
      ) : (
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
                </div>
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                  <Activity size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
