
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Match, User, Message } from '../types';
import { CalendarIcon, VideoIcon, CheckIcon, CheckCheckIcon, PaperclipIcon, MoreVerticalIcon, LockIcon, BanIcon, FlagIcon, PencilIcon } from '../components/icons';
import SchedulerModal from '../components/SchedulerModal';

const Chat: React.FC = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const { user } = useAuth();
    const [match, setMatch] = useState<Match | null>(null);
    const [partner, setPartner] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [partnerTyping, setPartnerTyping] = useState(false); 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();
    const partnerIdRef = useRef<string | null>(null);

    const refreshMessages = async () => {
        if (matchId) {
            const msgs = await api.getMessages(matchId);
            setMessages(prev => {
                if (prev.length !== msgs.length || (msgs.length > 0 && prev.length > 0 && prev[prev.length - 1].id !== msgs[msgs.length - 1].id)) {
                    return msgs;
                }
                const lastMsg = prev[prev.length-1];
                const lastNewMsg = msgs[msgs.length-1];
                if (lastMsg && lastNewMsg && lastMsg.id === lastNewMsg.id && lastMsg.read !== lastNewMsg.read) {
                    return msgs;
                }
                return prev;
            });
            
            if (user) {
                const unreadFromPartner = msgs.some(m => m.senderId !== user.id && !m.read);
                if (unreadFromPartner) {
                    await api.markMessagesAsRead(matchId, user.id);
                }
            }
        }
    };

    useEffect(() => {
        const loadMatchData = async () => {
             if (!matchId || !user) return;
             setLoading(prev => !match ? true : prev);
             
             const matches = await api.getMatchesForUser(user.id);
             const currentMatch = matches.find(m => m.id === matchId);
             
             if(currentMatch){
                setMatch(currentMatch);
                const pId = currentMatch.user1Id === user.id ? currentMatch.user2Id : currentMatch.user1Id;
                partnerIdRef.current = pId;
                const p = await api.getUserById(pId);
                setPartner(p || null);
                if (p) {
                   const currentUser = await api.getUserById(user.id);
                   if (currentUser && currentUser.blockedUsers.includes(p.id)) setIsBlocked(true);
                }
            }
            setLoading(false);
        };
        loadMatchData();
        window.addEventListener('storage', loadMatchData);
        return () => window.removeEventListener('storage', loadMatchData);
    }, [matchId, user?.id]);

    useEffect(() => {
        if (!matchId) return;
        refreshMessages();
        const interval = setInterval(() => {
            refreshMessages();
            if (matchId && partnerIdRef.current) {
                api.getTypingStatus(matchId, partnerIdRef.current).then(status => setPartnerTyping(status));
            }
        }, 1500);

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'skillhive_db_messages_v4') refreshMessages();
            if (e.key === 'skillhive_typing' && matchId && partnerIdRef.current) {
                api.getTypingStatus(matchId, partnerIdRef.current).then(status => setPartnerTyping(status));
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [matchId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, partnerTyping]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNewMessage(val);
        if (user && matchId) {
            api.setTypingStatus(matchId, user.id, true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                api.setTypingStatus(matchId, user.id, false);
            }, 2000);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if(newMessage.trim() === '' || !user || !matchId) return;
        
        api.setTypingStatus(matchId, user.id, false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        const tempId = Date.now().toString();
        const pendingMsg: Message = {
            id: tempId, 
            matchId: matchId,
            text: newMessage, 
            type: 'text',
            senderId: user.id, 
            timestamp: new Date().toISOString(),
            read: false
        };

        setMessages(prev => [...prev, pendingMsg]);
        setNewMessage('');
        
        await api.sendMessage({
            matchId: matchId,
            senderId: user.id,
            text: pendingMsg.text,
            type: 'text',
            timestamp: pendingMsg.timestamp,
            read: false
        });
        refreshMessages();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user && matchId) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                if (event.target?.result) {
                    await api.sendMessage({
                        matchId: matchId,
                        mediaUrl: event.target.result as string,
                        type: 'image',
                        senderId: user.id,
                        timestamp: new Date().toISOString(),
                        read: false
                    });
                    refreshMessages();
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSchedule = async (id: string, dateTime: string) => {
        const meetLink = `https://meet.google.com/skillhive-${Math.random().toString(36).substring(7)}`;
        if (match && user) {
            const updatedMatchData = { ...match, scheduledTime: new Date(dateTime).toISOString(), meetLink };
            try {
                const result = await api.updateMatch(updatedMatchData);
                if (result) {
                    setMatch(updatedMatchData);
                    await api.sendMessage({
                        matchId: matchId!,
                        text: `📅 Session scheduled for ${new Date(dateTime).toLocaleString()}. GMeet: ${meetLink}`,
                        type: 'text',
                        senderId: '0', 
                        timestamp: new Date().toISOString(),
                        read: false
                    });
                    refreshMessages();
                    setIsSchedulerOpen(false);
                }
            } catch (error) {
                console.error("Failed to update match", error);
            }
        }
    };

    const handleBlockUser = async () => {
        if (user && partner) {
            await api.blockUser(user.id, partner.id);
            setIsBlocked(true);
            setIsMenuOpen(false);
            refreshMessages();
        }
    };

    const handleUnblockUser = async () => {
        if (user && partner) {
            await api.unblockUser(user.id, partner.id);
            setIsBlocked(false);
            refreshMessages();
        }
    };

    const handleReportUser = async () => {
        if (user && partner) {
            await api.reportUser(user.id, partner.id, "Spam/Abuse");
            alert("Report submitted. We will investigate.");
            setIsMenuOpen(false);
        }
    };

    const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    if (loading) return <div className="p-8 text-center">Loading chat...</div>;
    if (!match || !partner) return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Match not found</h2>
            <Link to="/matches" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Go to Matches</Link>
        </div>
    );

    if (match.status !== 'accepted') return (
         <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Connection Pending</h2>
            <Link to="/matches" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Back to Matches</Link>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-7.5rem)] md:h-[calc(100vh-9.5rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden relative transition-all duration-300">
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 relative z-20">
                <div className="flex items-center overflow-hidden">
                    <img src={partner.avatarUrl} alt={partner.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2 md:mr-3 object-cover ring-2 ring-primary-100 dark:ring-gray-700 flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="flex items-center">
                            <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white truncate">{partner.name}</h2>
                            {isBlocked && <span className="ml-2 px-1.5 py-0.5 text-[10px] md:text-xs bg-red-100 text-red-600 rounded-full">Blocked</span>}
                            {partnerTyping && <span className="ml-3 text-xs text-primary-500 animate-pulse font-medium italic">typing...</span>}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                             <LockIcon className="w-3 h-3 mr-1 text-green-500" />
                             <span className="text-green-600 dark:text-green-400 font-medium mr-2 hidden sm:inline">Encrypted</span>
                             <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                             <span>Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                    <button onClick={() => navigate(`/whiteboard-view?matchId=${matchId}`)} className="p-2 text-gray-500 hover:text-primary-600 rounded-full" title="Whiteboard"><PencilIcon className="w-5 h-5" /></button>
                    {match.scheduledTime ? (
                         <a href={match.meetLink || '#'} target="_blank" rel="noopener noreferrer" className="p-2 text-green-600 bg-green-50 rounded-full" title="Join Meeting"><VideoIcon className="w-5 h-5" /></a>
                    ) : (
                        <button onClick={() => setIsSchedulerOpen(true)} className="p-2 text-gray-500 hover:text-primary-600 rounded-full" title="Schedule"><CalendarIcon className="w-5 h-5" /></button>
                    )}
                    <div className="relative">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><MoreVerticalIcon className="w-5 h-5" /></button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600 overflow-hidden z-50 animate-pop-in">
                                {isBlocked ? <button onClick={handleUnblockUser} className="w-full text-left px-4 py-3 text-sm flex items-center"><BanIcon className="w-4 h-4 mr-2" /> Unblock</button> : <button onClick={handleBlockUser} className="w-full text-left px-4 py-3 text-sm text-red-600 flex items-center"><BanIcon className="w-4 h-4 mr-2" /> Block</button>}
                                <button onClick={handleReportUser} className="w-full text-left px-4 py-3 text-sm flex items-center border-t"><FlagIcon className="w-4 h-4 mr-2" /> Report</button>
                            </div>
                        )}
                        {isMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>}
                    </div>
                </div>
            </div>
            
            <div className="flex-1 p-3 md:p-4 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex justify-center mb-6">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-[10px] md:text-xs px-3 py-1.5 rounded-lg flex items-center shadow-sm">
                        <LockIcon className="w-3 h-3 mr-1.5" /> Messages are end-to-end encrypted.
                    </div>
                </div>

                {messages.map(msg => {
                    const isOwn = msg.senderId === user!.id;
                    const isSystem = msg.senderId === '0';
                    if (isSystem) return <div key={msg.id} className="flex justify-center my-4"><span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">{msg.text}</span></div>;
                    return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            <div className={`max-w-[85%] sm:max-w-[75%] ${isOwn ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-600'} p-3 rounded-2xl text-sm relative shadow-sm`}>
                                {msg.type === 'image' ? <img src={msg.mediaUrl} className="rounded-lg mb-1" /> : <p className="break-words">{msg.text}</p>}
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className={`text-[9px] ${isOwn ? 'text-primary-100' : 'text-gray-400'}`}>{formatTime(msg.timestamp)}</span>
                                    {isOwn && (msg.read ? <CheckCheckIcon className="w-3 h-3 text-primary-200" /> : <CheckIcon className="w-3 h-3 text-primary-200 opacity-70" />)}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 md:p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                {isBlocked ? (
                    <div className="text-center p-3 text-gray-500 text-sm">You have blocked this user. <button onClick={handleUnblockUser} className="text-primary-600 hover:underline">Unblock</button> to message.</div>
                ) : (
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-primary-600 rounded-xl"><PaperclipIcon className="w-5 h-5" /></button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                        <input type="text" value={newMessage} onChange={handleInputChange} placeholder="Type a message..." className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700/50 border border-transparent focus:bg-white focus:border-primary-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all text-sm" />
                        <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg disabled:opacity-50 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
                    </form>
                )}
            </div>

            {isSchedulerOpen && <SchedulerModal isOpen={isSchedulerOpen} onClose={() => setIsSchedulerOpen(false)} onSchedule={handleSchedule} match={match} partner={partner} />}
        </div>
    );
};

export default Chat;
