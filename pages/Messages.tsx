
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Match, User, Message } from '../types';
import { SearchIcon, MessageSquareIcon, CheckCheckIcon } from '../components/icons';

const Messages: React.FC = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState<Match[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [lastMessages, setLastMessages] = useState<Record<string, Message | null>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        if (user) {
            const [matchesData, usersData] = await Promise.all([
                api.getMatchesForUser(user.id),
                api.getUsers()
            ]);
            
            // Filter only accepted matches for DMs
            const acceptedMatches = matchesData.filter(m => m.status === 'accepted');
            setMatches(acceptedMatches);
            setUsers(usersData);

            // Fetch last message for each match
            const msgMap: Record<string, Message | null> = {};
            for (const m of acceptedMatches) {
                msgMap[m.id] = await api.getLastMessage(m.id);
            }
            setLastMessages(msgMap);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Real-time updates via storage event (cross-tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'skillhive_db_messages_v4') {
                fetchData();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Polling (same-tab/fallback)
        const interval = setInterval(fetchData, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [user]);

    const getPartner = (match: Match) => {
        const partnerId = match.user1Id === user?.id ? match.user2Id : match.user1Id;
        return users.find(u => u.id === partnerId);
    };

    const filteredMatches = matches.filter(match => {
        const partner = getPartner(match);
        return partner && partner.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    // Helper to format time for inbox view
    const formatInboxTime = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading messages...</div>;

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Your conversations with learning partners.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col flex-1 animate-fade-in-up">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredMatches.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredMatches.map(match => {
                                const partner = getPartner(match);
                                if (!partner) return null;
                                const lastMsg = lastMessages[match.id];

                                return (
                                    <Link 
                                        key={match.id} 
                                        to={`/chat/${match.id}`}
                                        className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img src={partner.avatarUrl} alt={partner.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-primary-200 dark:group-hover:ring-primary-900 transition-all" />
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                                        </div>
                                        
                                        <div className="ml-4 flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{partner.name}</h3>
                                                {lastMsg && (
                                                    <span className="text-xs text-gray-400 flex-shrink-0">{formatInboxTime(lastMsg.timestamp)}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className={`text-sm truncate pr-4 ${!lastMsg ? 'text-gray-400 italic' : lastMsg.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white font-semibold'}`}>
                                                    {lastMsg ? lastMsg.text || 'Shared a file' : 'Start a conversation'}
                                                </p>
                                                {lastMsg && lastMsg.read && (
                                                     <CheckCheckIcon className="w-4 h-4 text-blue-400 ml-2 flex-shrink-0" />
                                                )}
                                                {lastMsg && !lastMsg.read && lastMsg.senderId !== user?.id && (
                                                    <span className="w-2 h-2 bg-primary-500 rounded-full ml-2 flex-shrink-0"></span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                                <MessageSquareIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No messages yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
                                Connect with peers in the Matches section to start a conversation.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
