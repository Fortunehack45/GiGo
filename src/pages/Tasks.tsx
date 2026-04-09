import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, Circle, ArrowRight, Star } from 'lucide-react';

export default function Tasks({ user }: { user: any }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, 'tasks'));
    const unsubTasks = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tasks');
      setLoading(false);
    });

    const userTasksQ = query(
      collection(db, 'userTasks'),
      where('userId', '==', user.uid)
    );
    const unsubUserTasks = onSnapshot(userTasksQ, (snapshot) => {
      const completed = snapshot.docs
        .filter(doc => doc.data().status === 'completed')
        .map(doc => doc.data().taskId);
      setCompletedTasks(completed);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'userTasks');
    });

    return () => {
      unsubTasks();
      unsubUserTasks();
    };
  }, [user?.uid]);

  const completeTask = async (task: any) => {
    if (completedTasks.includes(task.id)) return;

    try {
      // Record task completion
      await addDoc(collection(db, 'userTasks'), {
        userId: user.uid,
        taskId: task.id,
        status: 'completed',
        completedAt: serverTimestamp(),
      });

      // Update user earnings
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        totalEarnings: increment(task.reward),
      });

      alert(`Task completed! You earned ${formatCurrency(task.reward)}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'userTasks');
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
        <h1 className="text-3xl font-bold tracking-tight text-white">Daily Tasks</h1>
        <p className="text-zinc-500">Complete tasks to boost your earnings</p>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 && !loading && (
          <div className="text-center py-12 text-zinc-500">
            No tasks available at the moment.
          </div>
        )}

        {tasks.map((task, i) => {
          const isCompleted = completedTasks.includes(task.id);
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`group relative overflow-hidden bg-zinc-900/50 border border-zinc-800 p-6 rounded-[24px] transition-all ${isCompleted ? 'opacity-60' : 'hover:border-white/20'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {task.type}
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold uppercase">
                        <CheckCircle2 size={12} /> Completed
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white">{task.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{task.description}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-emerald-500 font-bold text-lg">+{formatCurrency(task.reward)}</p>
                  <Star size={20} className="ml-auto text-amber-500" />
                </div>
              </div>

              {!isCompleted && (
                <div className="mt-6 flex gap-3">
                  {task.link && (
                    <a
                      href={task.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-zinc-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all border border-zinc-700"
                    >
                      Go to Task
                      <ArrowRight size={18} />
                    </a>
                  )}
                  <button
                    onClick={() => completeTask(task)}
                    className={`flex-1 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                      task.link 
                        ? 'bg-white text-black hover:bg-zinc-200' 
                        : 'bg-zinc-800 text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    {task.link ? 'Claim Reward' : 'Complete Task'}
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
