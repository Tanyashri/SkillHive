
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getAISynergyDiscoveries } from '../services/geminiService';
import { Match, User, Skill, AiPeerRecommendation } from '../types';
import { Link } from 'react-router-dom';
import SchedulerModal from '../components/SchedulerModal';
import { CalendarIcon, VideoIcon, MessageSquareIcon, CheckIcon, SearchIcon, UserPlusIcon, XIcon, UserIcon, ZapIcon, BotIcon } from '../components/icons';

const Matches: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [matches, setMatches] = useState<Match[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [synergyDiscoveries, setSynergyDiscoveries] = useState<AiPeerRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [discovering, setDiscovering] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        if (!user) return;
        const [matchesData, usersData, skillsData] = await Promise.all([
            api.getMatchesForUser(user.id),
            api.getUsers(),
            api.getSkills(),
        ]);
        setMatches([...matchesData]); 
        setUsers(usersData);
        setSkills(skillsData);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchData();
        // Sync with any changes made via notifications or other tabs
        window.addEventListener('storage', fetchData);
        return () => window.removeEventListener('storage', fetchData);
    }, [fetchData]);

    // AI Synergy Discovery Logic
    useEffect(() => {
        const fetchDiscoveries = async () => {
            if (user && users.length > 0 && skills.length > 0 && synergyDiscoveries.length === 0) {
                setDiscovering(true);
                try {
                    const discoveries = await getAISynergyDiscoveries(user, users, skills);
                    setSynergyDiscoveries(discoveries);
                } catch (e) {
                    console.error("Discovery failed", e);
                } finally {
                    setDiscovering(false);
                }
            }
        };
        fetchDiscoveries();
    }, [user, users, skills, synergyDiscoveries.length]);
    
    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return users.filter(u => 
            u.id !== user?.id && 
            u.role !== 'admin' && 
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, users, user]);

    const handleAcceptRequest = async (match: Match) => {
        if (!user) return;
        try {
            const updatedMatch = { ...match, status: 'accepted' as const };
            await api.updateMatch(updatedMatch, user.id);
            // fetchData called automatically via storage event if using localDB
            await fetchData();
        } catch (e) {
            alert("Error accepting request.");
        }
    };

    const handleDeclineRequest = async (match: Match) => {
        if (!user) return;
        try {
            const updatedMatch = { ...match, status: 'declined' as const };
            await api.updateMatch(updatedMatch, user.id);
            await fetchData();
        } catch (e) {
            alert("Error declining request.");
        }
    };

    const handleScheduleClick = (match: Match) => {
        setSelectedMatch(match);
        setIsModalOpen(true);
    };
    
    const handleSchedule = async (matchId: string, dateTime: string) => {
        const meetLink = `https://meet.google.com/skillhive-${Math.random().toString(36).substring(7)}`;
        if (selectedMatch && user) {
            const updatedMatchData = { ...selectedMatch, scheduledTime: new Date(dateTime).toISOString(), meetLink };
            try {
                await api.updateMatch(updatedMatchData, user.id);
                await fetchData();
                setIsModalOpen(false);
            } catch (error) {
                console.error("Failed to update match", error);
            }
        }
    };

    const handleCompleteSession = async (matchId: string) => {
        if(window.confirm("Mark this session as completed? This will award credits to your partner.") && user) {
            try {
                await api.completeSession(matchId, user.id);
                const updatedUser = await api.getUserById(user.id);
                if (updatedUser) updateProfile(updatedUser);
                await fetchData();
            } catch (error) {
                console.error("Failed to complete session", error);
            }
        }
    };

    const handleConnect = async (targetUser: User) => {
        if (!user) return;
        const skillOfferedId = user.skillsOffered[0] || '1'; 
        const skillWantedId = targetUser.skillsOffered[0] || '1'; 
        try {
            const newMatch = await api.createMatch({
                user1Id: user.id,
                user2Id: targetUser.id,
                skillOfferedId,
                skillWantedId
            });
            if (newMatch) {
                await fetchData();
                setSearchTerm('');
            }
        } catch (error) {
            console.error("Failed to connect", error);
        }
    };

    const incomingRequests = matches.filter(m => m.user2Id === user?.id && m.status === 'pending');
    const outgoingRequests = matches.filter(m => m.user1Id === user?.id && m.status === 'pending');
    const activeMatches = matches.filter(m => m.status === 'accepted');

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Synchronizing your connections...</p>
        </div>
    );

    return (
        <div className="space-y-10 max-w-6xl mx-auto pb-20">
            <div className="animate-fade-in-up">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Connections</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Manage requests and plan sessions with your global network.</p>
            </div>

            {/* AI Synergy Discovery Carousel */}
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <BotIcon className="w-6 h-6 text-primary-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Synergy Discoveries</h2>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-lg">Real-time Analysis</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {discovering ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="h-48 bg-white dark:bg-gray-800 rounded-3xl animate-pulse border border-gray-100 dark:border-gray-700"></div>
                        ))
                    ) : synergyDiscoveries.length > 0 ? (
                        synergyDiscoveries.map((rec, idx) => {
                            const peer = users.find(u => u.id === rec.userId);
                            if (!peer) return null;
                            return (
                                <div key={rec.userId} className="group bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                                    <div>
                                        <div className="flex items-center space-x-3 mb-4">
                                            <img src={peer.avatarUrl} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm" alt="" />
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-white truncate">{peer.name}</p>
                                                <p className="text-[10px] text-yellow-500 font-bold">★ {peer.rating}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed italic mb-4">
                                            "{rec.reason}"
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleConnect(peer)}
                                        className="w-full py-2.5 bg-gray-900 dark:bg-gray-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <ZapIcon className="w-3 h-3 text-orange-400" />
                                        Connect Now
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                             <p className="text-gray-500">Update your 'Skills Wanted' for AI discoveries!</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Search Section */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl border border-white/20 dark:border-gray-700 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="relative">
                     <SearchIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for a specific peer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-gray-100/50 dark:bg-gray-900/50 border-none rounded-3xl focus:ring-4 focus:ring-primary-500/20 transition-all dark:text-white font-medium"
                    />
                </div>
                
                {searchTerm && (
                    <div className="mt-6 space-y-4 animate-pop-in">
                         {searchResults.length > 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                 {searchResults.map(resultUser => {
                                     const existingMatch = matches.find(m => (m.user1Id === resultUser.id || m.user2Id === resultUser.id) && m.status !== 'declined');
                                     return (
                                         <div key={resultUser.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                             <div className="flex items-center space-x-3 overflow-hidden">
                                                 <img src={resultUser.avatarUrl} alt={resultUser.name} className="w-10 h-10 rounded-full object-cover" />
                                                 <div>
                                                     <p className="font-bold text-gray-900 dark:text-white truncate">{resultUser.name}</p>
                                                     <p className="text-[10px] text-gray-400 uppercase font-black">★ {resultUser.rating} Rating</p>
                                                 </div>
                                             </div>
                                             {existingMatch ? (
                                                  <span className="px-3 py-1 text-[10px] font-black uppercase rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-700">
                                                      {existingMatch.status}
                                                  </span>
                                             ) : (
                                                 <button 
                                                    onClick={() => handleConnect(resultUser)}
                                                    className="px-4 py-2 bg-primary-600 text-white text-xs font-black uppercase rounded-xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                                                 >
                                                     Connect
                                                 </button>
                                             )}
                                         </div>
                                     );
                                 })}
                             </div>
                         ) : (
                             <p className="text-center py-4 text-gray-500 text-sm italic">No matching peers found.</p>
                         )}
                    </div>
                )}
            </div>

            {/* Connection Requests (Incoming) */}
            {incomingRequests.length > 0 && (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
                            Incoming Requests
                        </h2>
                        <span className="text-xs font-black text-orange-500 uppercase tracking-widest">{incomingRequests.length} Pending</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {incomingRequests.map(match => {
                            const partner = users.find(u => u.id === match.user1Id);
                            const skillWanted = skills.find(s => s.id === match.skillWantedId);
                            if (!partner) return null;
                            return (
                                <div key={match.id} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-orange-100 dark:border-orange-900/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
                                            <UserPlusIcon className="w-6 h-6 text-orange-500" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-6">
                                        <div className="flex items-center space-x-5">
                                            <img src={partner.avatarUrl} className="w-20 h-20 rounded-3xl object-cover ring-4 ring-orange-50 dark:ring-orange-900/10" alt="" />
                                            <div>
                                                <h3 className="font-black text-gray-900 dark:text-white text-2xl tracking-tight">{partner.name}</h3>
                                                <p className="text-sm text-gray-500 font-medium">Interested in: <span className="text-orange-500 font-bold">{skillWanted?.name || 'Skill'}</span></p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => handleDeclineRequest(match)}
                                                className="flex-1 py-4 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                <XIcon className="w-5 h-5" />
                                                Decline
                                            </button>
                                            <button 
                                                onClick={() => handleAcceptRequest(match)}
                                                className="flex-1 py-4 bg-primary-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-500/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <CheckIcon className="w-5 h-5" />
                                                Accept Request
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Active Connections List */}
            <div className="space-y-4 animate-fade-in-up">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                     <span className="w-2 h-6 bg-primary-500 rounded-full"></span>
                     Established Connections
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                            <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Peer Partner</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Status & Plan</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {activeMatches.map(match => {
                                    const pId = match.user1Id === user?.id ? match.user2Id : match.user1Id;
                                    const partner = users.find(u => u.id === pId);
                                    if (!partner) return null;
                                    return (
                                        <tr key={match.id} className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors">
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="relative">
                                                        <img className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white dark:ring-gray-700 shadow-sm" src={partner.avatarUrl} alt="" />
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></div>
                                                    </div>
                                                    <div className="ml-5">
                                                        <div className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{partner.name}</div>
                                                        <div className="flex items-center text-xs font-bold text-primary-500 uppercase tracking-tighter">
                                                            <ZapIcon className="w-3 h-3 mr-1" /> Verified Peer
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {match.scheduledTime ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Session Booked</span>
                                                        <div className="flex items-center text-gray-900 dark:text-gray-100 font-bold text-sm">
                                                            <CalendarIcon className="w-4 h-4 mr-2 text-primary-500"/>
                                                            {new Date(match.scheduledTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Waiting to Schedule</span>
                                                        <span className="text-xs text-gray-500 italic">No session set yet</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end space-x-3">
                                                    {!match.scheduledTime ? (
                                                        <button onClick={() => handleScheduleClick(match)} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-white bg-primary-600 rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-1 active:scale-95">
                                                            Plan Session
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <a href={match.meetLink || '#'} target="_blank" rel="noopener noreferrer" className="p-3 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-2xl hover:bg-green-100 transition-all border border-green-100 dark:border-green-800/30" title="Join GMeet">
                                                                <VideoIcon className="w-5 h-5"/>
                                                            </a>
                                                            <button onClick={() => handleCompleteSession(match.id)} className="p-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-2xl hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-800/30" title="Mark as Completed">
                                                                <CheckIcon className="w-5 h-5"/>
                                                            </button>
                                                        </>
                                                    )}
                                                    <Link to={`/chat/${match.id}`} className="p-3 text-primary-600 bg-primary-50 dark:bg-primary-900/20 rounded-2xl hover:bg-primary-100 transition-all border border-primary-100 dark:border-primary-800/30">
                                                        <MessageSquareIcon className="w-5 h-5"/>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {activeMatches.length === 0 && (
                        <div className="p-20 text-center flex flex-col items-center">
                            <div className="bg-gray-50 dark:bg-gray-700 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6">
                                <UserIcon className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Active Exchange Partners</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm font-medium">Connect with peers to start teaching and learning!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pending Outgoing Requests */}
            {outgoingRequests.length > 0 && (
                 <div className="space-y-4 opacity-80 animate-fade-in-up">
                    <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center px-1">
                        <span className="w-1.5 h-4 bg-gray-400 rounded-full mr-3"></span>
                        Sent Proposals
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {outgoingRequests.map(match => {
                            const partner = users.find(u => u.id === match.user2Id);
                            if (!partner) return null;
                            return (
                                <div key={match.id} className="bg-white/40 dark:bg-gray-800/40 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex items-center justify-between group hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <img src={partner.avatarUrl} className="w-12 h-12 rounded-2xl grayscale group-hover:grayscale-0 transition-all" alt="" />
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate w-24">{partner.name}</p>
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Pending</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeclineRequest(match)} 
                                        className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase tracking-tighter"
                                    >
                                        Recall
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                 </div>
            )}

            {selectedMatch && (
                <SchedulerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSchedule={handleSchedule}
                    match={selectedMatch}
                    partner={users.find(u => u.id === (selectedMatch.user1Id === user?.id ? selectedMatch.user2Id : selectedMatch.user1Id))}
                />
            )}
        </div>
    );
};

export default Matches;
