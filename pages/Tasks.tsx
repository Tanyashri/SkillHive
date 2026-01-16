
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Task } from '../types';
import { PlusIcon, CheckIcon, ClipboardIcon, ZapIcon } from '../components/icons';
import CreateTaskModal from '../components/CreateTaskModal';

const Tasks: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            if (user) {
                setLoading(true);
                const userTasks = await api.getTasksForUser(user.id);
                // Sort: Pending first, then by date desc
                const sortedTasks = userTasks.sort((a, b) => {
                    if (a.status === b.status) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                    return a.status === 'pending' ? -1 : 1;
                });
                setTasks(sortedTasks);
                setLoading(false);
            }
        };
        fetchTasks();
    }, [user]);

    const handleCreateTask = async (taskData: { title: string; description: string; difficulty: 'Easy' | 'Medium' | 'Hard'; creditsReward: number }) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const newTask = await api.createTask({
                userId: user.id,
                ...taskData
            });
            if (newTask) {
                setTasks(prev => [newTask, ...prev]);
                setIsCreateModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to create task", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        if (!user) return;
        try {
            const completedTask = await api.completeTask(taskId, user.id);
            if (completedTask) {
                // Update local tasks state
                setTasks(prev => prev.map(t => t.id === taskId ? completedTask : t));
                // Update user credits in context
                const updatedUser = { ...user, credits: (user.credits || 0) + completedTask.creditsReward };
                updateProfile(updatedUser);
            }
        } catch (error) {
            console.error("Failed to complete task", error);
        }
    };

    // Gamification Logic
    const currentCredits = user?.credits || 0;
    const getLevel = (credits: number) => {
        if (credits < 100) return { name: 'Novice', min: 0, max: 100 };
        if (credits < 300) return { name: 'Apprentice', min: 100, max: 300 };
        if (credits < 600) return { name: 'Pro', min: 300, max: 600 };
        if (credits < 1000) return { name: 'Expert', min: 600, max: 1000 };
        return { name: 'Master', min: 1000, max: 10000 };
    };
    
    const levelInfo = getLevel(currentCredits);
    const progressPercent = Math.min(100, Math.max(0, ((currentCredits - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100));

    if (loading) return <div className="p-8 text-center text-gray-500">Loading learning tasks...</div>;

    const activeTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header & Gamification Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 md:p-10 shadow-xl text-white relative overflow-hidden animate-fade-in-up">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ZapIcon className="w-48 h-48" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Learning Journey</h1>
                        <p className="text-gray-300">Complete tasks to earn credits and level up!</p>
                        
                        <div className="mt-6">
                            <div className="flex items-end mb-2">
                                <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{currentCredits}</span>
                                <span className="text-xl text-gray-400 mb-1 ml-2 font-medium">Credits</span>
                            </div>
                            <div className="text-sm font-semibold uppercase tracking-wider text-primary-400 mb-2">
                                Current Rank: {levelInfo.name}
                            </div>
                            
                            <div className="w-full max-w-md h-3 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex justify-between max-w-md">
                                <span>{levelInfo.min}</span>
                                <span>Next Level: {levelInfo.max}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 md:mt-0">
                         <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95 font-semibold text-white shadow-lg"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Create New Task
                        </button>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Tasks */}
                <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center space-x-2 mb-2">
                        <ClipboardIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Active Tasks</h2>
                        <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 text-xs px-2 py-0.5 rounded-full font-bold">{activeTasks.length}</span>
                    </div>

                    {activeTasks.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">No active tasks. Create one to get started!</p>
                        </div>
                    ) : (
                        activeTasks.map(task => (
                            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mr-2 ${
                                                task.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                task.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                                {task.difficulty}
                                            </span>
                                            <span className="text-xs text-orange-500 font-bold flex items-center">
                                                <ZapIcon className="w-3 h-3 mr-0.5" />
                                                +{task.creditsReward} Credits
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{task.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleCompleteTask(task.id)}
                                        className="ml-4 p-2 bg-gray-100 hover:bg-green-100 text-gray-400 hover:text-green-600 dark:bg-gray-700 dark:hover:bg-green-900/30 dark:text-gray-500 dark:hover:text-green-400 rounded-xl transition-all"
                                        title="Mark as Complete"
                                    >
                                        <CheckIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Completed Tasks */}
                <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                     <div className="flex items-center space-x-2 mb-2">
                        <CheckIcon className="w-5 h-5 text-green-500" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Completed History</h2>
                    </div>

                    {completedTasks.length === 0 ? (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">You haven't completed any tasks yet.</p>
                        </div>
                    ) : (
                        completedTasks.map(task => (
                            <div key={task.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 opacity-75 hover:opacity-100 transition-opacity">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 line-through decoration-gray-400">{task.title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            Completed on {new Date(task.completedAt!).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                            Earned +{task.creditsReward}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <CreateTaskModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onAdd={handleCreateTask}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default Tasks;
