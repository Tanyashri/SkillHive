
import React, { useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MenuIcon, XIcon, UserIcon, CogIcon, BarChartIcon, UsersIcon, LogOutIcon, TrendingUpIcon, ClipboardIcon, ZapIcon, BellIcon, InfoIcon, LockIcon, MessageSquareIcon, LinkIcon, BookOpenIcon } from './icons';
import ThemeToggle from './ThemeToggle';
import ChatAssistant from './ChatAssistant';
import AnimatedBackground from './AnimatedBackground';
import NotificationsModal from './NotificationsModal';
import { api } from '../services/api';
import { Notification } from '../types';

interface Toast {
    id: string;
    message: string;
    type: Notification['type'];
}

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Notification State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const prevUnreadCount = useRef(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
        const data = await api.getNotificationsForUser(user.id);
        const newUnreadCount = data.filter(n => !n.read).length;
        
        // Trigger Toast if unread count increased
        if (newUnreadCount > prevUnreadCount.current) {
            const latest = data.find(n => !n.read && !notifications.some(old => old.id === n.id));
            if (latest) {
                const toastId = Math.random().toString(36).substr(2, 9);
                setToasts(prev => [...prev, { id: toastId, message: latest.message, type: latest.type }]);
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== toastId));
                }, 4000);
            }
        }
        
        setNotifications(data);
        setUnreadCount(newUnreadCount);
        prevUnreadCount.current = newUnreadCount;
    } catch (e) {
        console.error("Failed to fetch notifications", e);
    }
  }, [user, notifications.length]);

  useEffect(() => {
    if (user) {
        fetchNotifications();
        const handleRefresh = () => fetchNotifications();
        window.addEventListener('storage', handleRefresh);
        const interval = setInterval(fetchNotifications, 5000);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleRefresh);
        };
    } else {
        setNotifications([]);
        setUnreadCount(0);
        prevUnreadCount.current = 0;
    }
  }, [user, fetchNotifications]);

  const handleMarkRead = async (id: string) => {
      await api.markNotificationAsRead(id);
      fetchNotifications();
  };

  const handleMarkAllRead = async () => {
      if (user) {
          await api.markAllNotificationsAsRead(user.id);
          fetchNotifications();
      }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  let navItems = [];
  if (user?.role === 'admin') {
      navItems = [{ to: "/admin", icon: <LockIcon className="w-5 h-5" />, label: "Admin Dashboard" }];
  } else {
      navItems = [
        { to: "/", icon: <BarChartIcon className="w-5 h-5" />, label: "Dashboard" },
        { to: "/feed", icon: <UsersIcon className="w-5 h-5" />, label: "Community" },
        { to: "/messages", icon: <MessageSquareIcon className="w-5 h-5" />, label: "Messages" },
        { to: "/profile", icon: <UserIcon className="w-5 h-5" />, label: "Profile" },
        { to: "/tasks", icon: <ClipboardIcon className="w-5 h-5" />, label: "Tasks & Goals" },
        { to: "/skills", icon: <CogIcon className="w-5 h-5" />, label: "Skills" },
        { to: "/matches", icon: <LinkIcon className="w-5 h-5" />, label: "Matches" },
        { to: "/skillup", icon: <TrendingUpIcon className="w-5 h-5" />, label: "SkillUp" },
      ];
  }

  const SidebarContent: React.FC = () => (
    <div className="flex flex-col h-full text-gray-700 dark:text-gray-200">
      <div className="flex items-center justify-center h-20 border-b border-white/20 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm transition-all duration-300">
        <Link to={user?.role === 'admin' ? "/admin" : "/"} className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-transform duration-200 cursor-pointer">
            {user?.role === 'admin' ? 'SkillHive Admin' : 'SkillHive'}
        </Link>
      </div>
      <nav className="flex-1 px-3 md:px-4 py-4 md:py-6 space-y-2 md:space-y-3 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-in-out group ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 translate-x-1'
                  : 'hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
                <>
                    <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                    </span>
                    <span className="ml-4">{item.label}</span>
                </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/20 dark:border-gray-700/50">
         <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300">
            <LogOutIcon className="w-5 h-5" />
            <span className="ml-4">Logout</span>
         </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300 overflow-hidden relative">
      <AnimatedBackground />

      {/* Toast Overlay */}
      <div className="fixed top-6 right-6 z-[110] flex flex-col gap-2 pointer-events-none">
          {toasts.map(toast => (
              <div key={toast.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-primary-100 dark:border-primary-900 p-4 rounded-2xl shadow-2xl flex items-center space-x-3 pointer-events-auto animate-drop-in max-w-sm">
                  <div className="bg-primary-100 dark:bg-primary-900/40 p-2 rounded-full text-primary-600">
                      {toast.type === 'message' ? <MessageSquareIcon className="w-5 h-5" /> : <BellIcon className="w-5 h-5" />}
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{toast.message}</p>
                  <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-gray-400 hover:text-gray-600">
                      <XIcon className="w-4 h-4" />
                  </button>
              </div>
          ))}
      </div>

      <aside className="hidden md:flex md:flex-shrink-0 w-72 lg:w-80 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/50 shadow-xl z-20">
        <SidebarContent />
      </aside>
      
      <div className={`fixed inset-0 z-50 flex transition-opacity duration-300 md:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)}></div>
        <aside className={`relative w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl flex-shrink-0 shadow-2xl transition-transform duration-300 ease-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
          <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg">
             <XIcon className="w-6 h-6" />
          </button>
        </aside>
      </div>

      <div className="flex flex-col flex-1 w-full overflow-hidden relative z-10">
        <header className="relative z-10 flex items-center justify-between h-20 px-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all duration-300">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-xl md:hidden hover:bg-white/50 dark:hover:bg-gray-800 transition-all mr-3">
                {sidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
            <Link to={user?.role === 'admin' ? "/admin" : "/"} className="md:hidden font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">SkillHive</Link>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
             <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-full border border-gray-200 dark:border-gray-700">
                <ThemeToggle />
                <button 
                    onClick={() => setIsNotificationsOpen(true)}
                    className="relative p-2 text-gray-500 hover:bg-white dark:hover:bg-gray-700 dark:text-gray-400 rounded-full transition-all duration-200 shadow-sm hover:shadow active:scale-95 group"
                >
                    <BellIcon className={`w-5 h-5 group-hover:text-primary-500 transition-colors ${unreadCount > 0 ? 'animate-bounce text-primary-500' : ''}`} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></span>
                    )}
                </button>
             </div>

             {user?.role === 'user' ? (
                <NavLink to="/profile" className="flex items-center gap-3 pl-1 pr-1 py-1 rounded-full hover:bg-white/60 dark:hover:bg-gray-800/60 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 group">
                    <div className="hidden sm:flex flex-col items-end text-right">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none group-hover:text-primary-600 transition-colors">{user?.name}</span>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-end">
                             <ZapIcon className="w-3 h-3 text-cyan-500 mr-1" />
                             {user?.credits} Credits
                        </span>
                    </div>
                    <div className="relative">
                        <img className="relative h-10 w-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm group-hover:scale-105 transition-transform duration-300" src={user?.avatarUrl} alt={user?.name} />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full z-10"></div>
                    </div>
                </NavLink>
             ) : (
                 <div className="flex items-center gap-3 pl-1 pr-1 py-1 rounded-full border border-transparent">
                     <div className="hidden sm:flex flex-col items-end text-right">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none">{user?.name}</span>
                        <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 mt-1 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">Admin</span>
                     </div>
                     <div className="relative">
                         <img className="relative h-10 w-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm" src={user?.avatarUrl} alt={user?.name} />
                         <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-purple-500 border-2 border-white dark:border-gray-800 rounded-full z-10"></div>
                     </div>
                 </div>
             )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-transparent p-4 md:p-6 scroll-smooth relative z-10 custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full animate-fade-in-up">
                 {children}
            </div>
        </main>
      </div>
      <ChatAssistant />
      
      <NotificationsModal 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
};

export default Layout;
