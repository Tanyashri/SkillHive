
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Skill, Match, Report } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PencilIcon, TrashIcon, UsersIcon, BookOpenIcon, ZapIcon, ShieldIcon, AlertTriangleIcon, CheckIcon, EyeIcon } from '../components/icons';
import EditUserModal from '../components/EditUserModal';

type Tab = 'overview' | 'users' | 'matches' | 'security';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [users, setUsers] = useState<User[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Edit User State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSavingUser, setIsSavingUser] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, skillsData, matchesData, reportsData] = await Promise.all([
                api.getUsers(),
                api.getSkills(),
                api.getMatchesForUser('-1'), // Fetch all matches using admin flag
                api.getReports()
            ]);
            
            setUsers(usersData);
            setSkills(skillsData);
            setMatches(matchesData);
            setReports(reportsData);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Stats Calculation ---
    const totalUsers = users.length;
    const totalSkills = skills.length;
    const totalMatches = matches.length;
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    
    // Mock Data for the new Rising Curve Graph (Platform Growth)
    const growthData = [
      { name: 'Week 1', value: 120 },
      { name: 'Week 2', value: 180 },
      { name: 'Week 3', value: 250 },
      { name: 'Week 4', value: 310 },
      { name: 'Week 5', value: 480 },
      { name: 'Week 6', value: 650 },
      { name: 'Week 7', value: 980 },
    ];
    
    const matchesByStatus = matches.reduce((acc: any, match: Match) => {
        acc[match.status] = (acc[match.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const matchesChartData = Object.entries(matchesByStatus).map(([name, value]) => ({ name, value: value as number }));
    // Updated Chart Colors to Glacier Theme
    const COLORS = ['#0ea5e9', '#06b6d4', '#6366f1', '#3b82f6'];


    // --- User Management Handlers ---

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            const success = await api.deleteUser(userId);
            if (success) {
                setUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                alert("Failed to delete user.");
            }
        }
    };

    const handleSaveUser = async (updatedUser: User) => {
        setIsSavingUser(true);
        const result = await api.updateUser(updatedUser);
        if (result) {
            setUsers(prev => prev.map(u => u.id === result.id ? result : u));
            setIsEditModalOpen(false);
            setEditingUser(null);
        } else {
            alert("Failed to update user.");
        }
        setIsSavingUser(false);
    };

    // --- Report Management ---
    const handleResolveReport = async (reportId: string, action: 'resolved' | 'dismissed') => {
        const success = await api.resolveReport(reportId, action);
        if(success) {
            setReports(prev => prev.map(r => r.id === reportId ? {...r, status: action} : r));
        }
    };

    const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
        <div className={`p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 ${color} text-white relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
             <div className="relative z-10 flex justify-between items-center">
                <div>
                     <h3 className="text-sm font-bold opacity-90 uppercase tracking-wider">{title}</h3>
                     <p className="mt-2 text-4xl font-extrabold tracking-tight">{value}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                    {icon}
                </div>
             </div>
             {/* Decorative elements */}
             <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out blur-xl"></div>
             <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent opacity-50 blur-lg"></div>
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-8 animate-fade-in-up">
             {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Users" 
                    value={loading ? "..." : totalUsers} 
                    icon={<UsersIcon className="w-8 h-8" />}
                    color="bg-gradient-to-br from-cyan-500 to-cyan-700 dark:from-cyan-600 dark:to-cyan-800"
                />
                <StatCard 
                    title="Total Skills" 
                    value={loading ? "..." : totalSkills} 
                    icon={<BookOpenIcon className="w-8 h-8" />}
                    color="bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800"
                />
                <StatCard 
                    title="Total Matches" 
                    value={loading ? "..." : totalMatches} 
                    icon={<ZapIcon className="w-8 h-8" />}
                    color="bg-gradient-to-br from-sky-400 to-sky-600 dark:from-sky-500 dark:to-sky-700"
                />
                 <StatCard 
                    title="Security Alerts" 
                    value={loading ? "..." : pendingReports} 
                    icon={<AlertTriangleIcon className="w-8 h-8" />}
                    color={pendingReports > 0 ? "bg-gradient-to-br from-red-500 to-red-700" : "bg-gradient-to-br from-green-500 to-green-700"}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Platform Growth Chart - Smooth Rising Curve */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div>
                            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Platform Growth</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Weekly user activity & engagement</p>
                        </div>
                        <div className="bg-cyan-50 dark:bg-cyan-900/20 px-3 py-1 rounded-full text-xs font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/30">
                            +24% this week
                        </div>
                    </div>
                    
                    <div className="h-[300px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        color: '#374151'
                                    }}
                                    itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                                    cursor={{ stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '4 4' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#0ea5e9" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#0369a1' }}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Background glow effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-0"></div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Matches by Status</h2>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={matchesChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={6}
                                >
                                    {matchesChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                 <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        borderColor: '#374151',
                                        color: '#fff',
                                        borderRadius: '0.75rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        border: 'none'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                        {matchesChartData.map((entry, index) => (
                            <div key={index} className="flex items-center text-sm">
                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="text-gray-600 dark:text-gray-300 font-medium">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUserManagement = () => (
         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">User Management</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                             <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 relative">
                                            <img className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700" src={user.avatarUrl} alt="" />
                                            {/* Flag users with multiple reports */}
                                            {reports.filter(r => r.reportedId === user.id && r.status === 'pending').length > 0 && (
                                                <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 border-2 border-white dark:border-gray-800" title="Reported for abuse">
                                                    <AlertTriangleIcon className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <span className="text-yellow-400 mr-1">★</span>
                                        <span className="font-medium">{user.rating.toFixed(1)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                     {user.blockedUsers.length > 0 ? (
                                         <span className="text-orange-500 flex items-center gap-1 text-xs">
                                             <ShieldIcon className="w-3 h-3" /> Has Blocks
                                         </span>
                                     ) : (
                                         <span className="text-green-500 text-xs">Good Standing</span>
                                     )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button 
                                            onClick={() => handleEditUser(user)}
                                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                            title="Edit User"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete User"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMatches = () => (
         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Match History</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Match ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Participants</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Exchange</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {matches.map(match => {
                            const u1 = users.find(u => u.id === match.user1Id);
                            const u2 = users.find(u => u.id === match.user2Id);
                            const s1 = skills.find(s => s.id === match.skillOfferedId);
                            const s2 = skills.find(s => s.id === match.skillWantedId);
                            return (
                                <tr key={match.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                                        #{match.id.substring(0,8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex -space-x-2">
                                                <img src={u1?.avatarUrl} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" title={u1?.name} alt="" />
                                                <img src={u2?.avatarUrl} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" title={u2?.name} alt="" />
                                            </div>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {u1?.name} & {u2?.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {s1?.name || 'Skill'} <span className="mx-1 text-gray-400">&harr;</span> {s2?.name || 'Skill'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            match.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                            match.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                        }`}>
                                            {match.status}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
         </div>
    );

    const renderSecurity = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {/* Reports List */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-red-50 dark:bg-red-900/10">
                    <h2 className="text-xl font-bold text-red-700 dark:text-red-400 flex items-center">
                        <ShieldIcon className="w-6 h-6 mr-2" />
                        Security & Trust Reports
                    </h2>
                </div>
                <div className="p-0">
                    {reports.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No reports found. Clean record!</div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {reports.map(report => {
                                const reporter = users.find(u => u.id === report.reporterId);
                                const reported = users.find(u => u.id === report.reportedId);
                                return (
                                    <div key={report.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                 <div className="flex items-center space-x-2 mb-1">
                                                     <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded border ${
                                                         report.status === 'pending' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400'
                                                     }`}>
                                                         {report.status}
                                                     </span>
                                                     <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                         Reason: {report.reason}
                                                     </span>
                                                 </div>
                                                 <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">"{report.description}"</p>
                                            </div>
                                            <div className="text-right text-xs text-gray-400">
                                                {new Date(report.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center text-sm">
                                                <span className="font-bold text-gray-700 dark:text-gray-200">{reporter?.name || 'Unknown'}</span>
                                                <span className="mx-2 text-gray-400">reported</span>
                                                <span className="font-bold text-red-600 dark:text-red-400 flex items-center">
                                                    {reported?.name || 'Unknown'}
                                                    <a href={`mailto:${reported?.email}`} className="ml-2 p-1 text-gray-400 hover:text-gray-600"><EyeIcon className="w-3 h-3"/></a>
                                                </span>
                                            </div>
                                            
                                            {report.status === 'pending' && (
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => handleResolveReport(report.id, 'dismissed')}
                                                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100"
                                                    >
                                                        Dismiss
                                                    </button>
                                                    <button 
                                                        onClick={() => handleResolveReport(report.id, 'resolved')}
                                                        className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 shadow-sm"
                                                    >
                                                        Resolve & Warn
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Abusive Behavior Alerts / Watchlist */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <AlertTriangleIcon className="w-5 h-5 text-orange-500 mr-2" />
                    Abusive Behavior Alert
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Users flagged multiple times or with low reputation scores.
                </p>
                
                <div className="space-y-4">
                    {users.filter(u => reports.some(r => r.reportedId === u.id && r.status === 'pending')).map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <img src={u.avatarUrl} className="w-10 h-10 rounded-full" alt="" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{u.name}</p>
                                    <p className="text-xs text-red-500 font-medium">
                                        {reports.filter(r => r.reportedId === u.id).length} Active Reports
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                            >
                                Ban User
                            </button>
                        </div>
                    ))}
                    {users.filter(u => reports.some(r => r.reportedId === u.id && r.status === 'pending')).length === 0 && (
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg text-green-700 dark:text-green-400 text-sm">
                            <CheckIcon className="w-6 h-6 mx-auto mb-2" />
                            No critical alerts.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white bg-clip-text">Admin Dashboard</h1>
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-gray-600 shadow text-primary-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'users' ? 'bg-white dark:bg-gray-600 shadow text-primary-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('matches')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'matches' ? 'bg-white dark:bg-gray-600 shadow text-primary-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        Matches
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center ${activeTab === 'security' ? 'bg-red-50 dark:bg-red-900/30 shadow text-red-600 dark:text-red-300 border border-red-100 dark:border-red-800' : 'text-gray-500 hover:text-red-500 dark:text-gray-400'}`}
                    >
                        <ShieldIcon className="w-4 h-4 mr-1" />
                        Security
                        {pendingReports > 0 && <span className="ml-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUserManagement()}
            {activeTab === 'matches' && renderMatches()}
            {activeTab === 'security' && renderSecurity()}

            <EditUserModal 
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setEditingUser(null); }}
                user={editingUser}
                onSave={handleSaveUser}
                isSaving={isSavingUser}
            />
        </div>
    );
};

export default AdminDashboard;
