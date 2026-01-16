
import React, { useState } from 'react';
import { Notification } from '../types';
import { XIcon, BellIcon, ZapIcon, UsersIcon, CalendarIcon, CheckIcon } from './icons';
import { api } from '../services/api';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ 
    isOpen, 
    onClose, 
    notifications, 
    onMarkRead, 
    onMarkAllRead 
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const getIcon = (type: Notification['type']) => {
      switch(type) {
          case 'match': return <UsersIcon className="w-4 h-4 text-blue-500" />;
          case 'session': return <CalendarIcon className="w-4 h-4 text-green-500" />;
          case 'badge': return <ZapIcon className="w-4 h-4 text-yellow-500" />;
          default: return <BellIcon className="w-4 h-4 text-gray-500" />;
      }
  };

  const getTimeAgo = (dateStr: string) => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleMatchAction = async (notificationId: string, matchId: string, action: 'accepted' | 'declined') => {
      setProcessingId(notificationId);
      try {
          const match = await api.getMatchById(matchId);
          if (match) {
              const updatedMatch = { ...match, status: action };
              // Perform action
              await api.updateMatch(updatedMatch, match.user2Id);
              // Clean up notification
              await api.markNotificationAsRead(notificationId);
              
              // Small visual delay before clearing processing state
              setTimeout(() => {
                  setProcessingId(null);
                  // refresh will happen automatically via api.ts's storage event dispatch
              }, 300);
          }
      } catch (error) {
          console.error("Match action failed", error);
          setProcessingId(null);
      }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div 
        className="absolute inset-0 cursor-default" 
        onClick={onClose}
      ></div>

      <div className="absolute top-20 right-4 md:right-6 w-full max-w-sm h-auto max-h-[32rem] bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-white/40 dark:border-gray-700/50 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-pop-in ring-1 ring-white/20 origin-top-right transform transition-all">
        <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-700/50 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md shrink-0">
            <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white drop-shadow-sm">Notifications</h2>
                {notifications.filter(n => !n.read).length > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                        {notifications.filter(n => !n.read).length}
                    </span>
                )}
            </div>
            <div className="flex items-center space-x-1">
                <button 
                    onClick={onMarkAllRead}
                    className="text-[10px] uppercase font-bold tracking-wider text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                    Mark read
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {notifications.length > 0 ? (
                notifications.map(notification => (
                    <div 
                        key={notification.id} 
                        className={`group relative p-3 rounded-xl border transition-all duration-200 ${
                            notification.read 
                            ? 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5' 
                            : 'bg-white/60 dark:bg-gray-800/60 border-white/50 dark:border-gray-700 shadow-sm'
                        }`}
                    >
                        <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 p-2 rounded-full ${notification.read ? 'bg-gray-100/50 dark:bg-gray-700/50 grayscale opacity-70' : 'bg-white dark:bg-gray-700 shadow-sm'}`}>
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-tight ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-semibold'}`}>
                                    {notification.message}
                                </p>
                                
                                {/* Match Actions: Only show if unread and is a match request */}
                                {!notification.read && notification.type === 'match' && notification.matchId && (
                                    <div className="mt-2 flex gap-2">
                                        <button 
                                            disabled={processingId === notification.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMatchAction(notification.id, notification.matchId!, 'accepted');
                                            }}
                                            className="px-3 py-1 bg-primary-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {processingId === notification.id ? '...' : 'Accept'}
                                        </button>
                                        <button 
                                            disabled={processingId === notification.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMatchAction(notification.id, notification.matchId!, 'declined');
                                            }}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 text-[10px] font-black uppercase rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                )}

                                <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                                    {getTimeAgo(notification.createdAt)}
                                </p>
                            </div>
                            {!notification.read && !processingId && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMarkRead(notification.id);
                                    }}
                                    className="text-gray-300 hover:text-primary-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <CheckIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500 dark:text-gray-400 opacity-60">
                    <BellIcon className="w-10 h-10 mb-2 stroke-1" />
                    <p className="text-sm">No notifications</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
