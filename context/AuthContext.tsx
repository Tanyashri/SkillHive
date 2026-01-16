
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (user: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('skillhive_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession?.user) {
            await handleUserSync(initialSession.user);
        }
        setIsLoading(false);

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
                await handleUserSync(session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem('skillhive_user');
            }
        });

        return () => subscription.unsubscribe();
    };

    initAuth();
  }, []);

  const handleUserSync = async (supabaseUser: any) => {
    let appUser = await api.getUserById(supabaseUser.id);
    
    // Auto-create profile for OAuth users if missing
    if (!appUser && supabase) {
       const metadata = supabaseUser.user_metadata;
       const newProfileData = {
           id: supabaseUser.id,
           name: metadata.full_name || supabaseUser.email?.split('@')[0] || 'SkillHive User',
           email: supabaseUser.email!,
           avatar_url: metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.email}`,
           bio: "Professional learner & mentor.",
           skills_offered: [],
           skills_wanted: [],
           availability: "Flexible",
           rating: 5.0,
           role: 'user',
           blocked_users: [],
           credits: 100, // Welcome credits bonus
           badges: ['b1']
       };

       const { error } = await supabase.from('profiles').insert([newProfileData]);
       
       if (!error) {
           await supabase.from('notifications').insert([{
               user_id: supabaseUser.id,
               message: "🎉 Welcome! Your SkillHive profile is ready. Start by adding skills you want to learn.",
               type: "system",
               read: false,
               created_at: new Date().toISOString()
           }]);

           appUser = {
               id: newProfileData.id,
               name: newProfileData.name,
               email: newProfileData.email,
               bio: newProfileData.bio,
               avatarUrl: newProfileData.avatar_url,
               skillsOffered: [],
               skillsWanted: [],
               availability: newProfileData.availability,
               rating: newProfileData.rating,
               role: 'user',
               blockedUsers: [],
               credits: 100,
               badges: ['b1']
           };
       }
    }

    if (appUser) {
       setUser(appUser);
       localStorage.setItem('skillhive_user', JSON.stringify(appUser));
       // Trigger global UI refresh
       window.dispatchEvent(new Event('storage'));
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    const foundUser = await api.login(email, password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('skillhive_user', JSON.stringify(foundUser));
      window.dispatchEvent(new Event('storage'));
      return true;
    }
    return false;
  };

  const signup = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    const newUser = await api.registerUser(userData);
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('skillhive_user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('storage'));
      return true;
    }
    return false;
  };

  const logout = async () => {
    if (supabase) {
        await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('skillhive_user');
    window.location.href = '/'; 
  };

  const updateProfile = (updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem('skillhive_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));
  };

  const value = useMemo(() => ({ user, isLoading, login, signup, logout, updateProfile }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
