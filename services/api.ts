
import { USERS, SKILLS, MATCHES, SESSIONS, FEEDBACKS, NOTIFICATIONS, TASKS, BADGES, REPORTS, POSTS } from '../constants';
import { User, Skill, Match, Session, Feedback, Notification, Task, Badge, Report, Message, Post, Comment } from '../types';
import { supabase } from '../lib/supabase';

// Helper for Mock DB / Simulation delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const DB_KEYS = {
    USERS: 'skillhive_db_users_v2', 
    SKILLS: 'skillhive_db_skills',
    MATCHES: 'skillhive_db_matches',
    SESSIONS: 'skillhive_db_sessions',
    FEEDBACKS: 'skillhive_db_feedbacks',
    NOTIFICATIONS: 'skillhive_db_notifications',
    TASKS: 'skillhive_db_tasks',
    REPORTS: 'skillhive_db_reports',
    MESSAGES: 'skillhive_db_messages_v4',
    TYPING: 'skillhive_typing',
    POSTS: 'skillhive_db_posts',
    WHITEBOARD: 'skillhive_db_whiteboard'
};

const MESSAGES_SEED: Message[] = [];

const getDB = <T>(key: string, seedData: T[]): T[] => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (key === DB_KEYS.USERS && parsed.length < 10) {
                localStorage.setItem(key, JSON.stringify(seedData));
                return seedData;
            }
            return parsed;
        }
        localStorage.setItem(key, JSON.stringify(seedData));
        return seedData;
    } catch (e) {
        return seedData;
    }
};

const setDB = <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
    // CRITICAL: Force a global UI refresh signal
    window.dispatchEvent(new Event('storage'));
};

const createInternalNotification = async (userId: string, message: string, type: Notification['type'], matchId?: string) => {
    if (supabase) {
        await supabase.from('notifications').insert([{
            user_id: userId,
            message,
            type,
            read: false,
            created_at: new Date().toISOString(),
            match_id: matchId
        }]);
        window.dispatchEvent(new Event('storage'));
        return;
    }
    const notifications = getDB(DB_KEYS.NOTIFICATIONS, NOTIFICATIONS);
    notifications.unshift({
        id: Math.random().toString(36).substr(2, 9),
        userId,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString(),
        matchId
    });
    setDB(DB_KEYS.NOTIFICATIONS, notifications);
};

export const api = {
  signInWithGoogle: async (): Promise<User | null> => {
    if (supabase) {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { 
                    redirectTo: window.location.origin,
                    queryParams: { access_type: 'offline', prompt: 'consent' }
                }
            });
            if (error) throw error;
            return null; // Redirect logic will take over
        } catch (e) { 
            console.error("Supabase OAuth Error:", e);
            throw e; 
        }
    }
    await delay(500);
    const users = getDB(DB_KEYS.USERS, USERS);
    const user = users.find(u => u.id === '2') || null; 
    window.dispatchEvent(new Event('storage'));
    return user;
  },

  login: async (email: string, password?: string): Promise<User | undefined> => {
      if (supabase) {
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password: password || 'placeholder',
            });
            if (authError || !authData.user) return undefined;
            return await api.getUserById(authData.user.id);
        } catch (e) { return undefined; }
      }
      await delay(300);
      const users = getDB(DB_KEYS.USERS, USERS);
      const found = users.find(u => u.email === email);
      if (found && password === (found.password || 'password123')) {
          window.dispatchEvent(new Event('storage'));
          return found;
      }
      return undefined;
  },

  registerUser: async (newUser: Omit<User, 'id'>): Promise<User | null> => {
      if (supabase) {
          try {
              const { data: authData, error: authError } = await supabase.auth.signUp({
                  email: newUser.email,
                  password: newUser.password || 'password123',
              });
              if (authError || !authData.user) return null;
              
              const userId = authData.user.id;
              const profileData = {
                  id: userId,
                  name: newUser.name,
                  email: newUser.email,
                  bio: newUser.bio,
                  avatar_url: newUser.avatarUrl,
                  skills_offered: [],
                  skills_wanted: [],
                  availability: newUser.availability,
                  rating: 5.0,
                  role: 'user',
                  blocked_users: [],
                  credits: 100,
                  badges: ['b1']
              };
              
              await supabase.from('profiles').insert([profileData]);
              await createInternalNotification(userId, "Welcome to SkillHive!", "system");
              window.dispatchEvent(new Event('storage'));
              return { ...newUser, id: userId, skillsOffered: [], skillsWanted: [], blockedUsers: [], credits: 100, badges: ['b1'] };
          } catch (e) { return null; }
      }
      await delay(500);
      const users = getDB(DB_KEYS.USERS, USERS);
      if (users.find(u => u.email === newUser.email)) return null;
      const newId = Math.random().toString(36).substr(2, 9);
      const userWithId = { ...newUser, id: newId, credits: 100, badges: ['b1'] };
      users.push(userWithId);
      setDB(DB_KEYS.USERS, users);
      return userWithId;
  },

  getUsers: async (): Promise<User[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data) {
            return data.map((p: any) => ({
                id: p.id,
                name: p.name,
                email: p.email,
                bio: p.bio,
                avatarUrl: p.avatar_url,
                skillsOffered: p.skills_offered || [],
                skillsWanted: p.skills_wanted || [],
                verifiedSkills: p.verified_skills || [],
                availability: p.availability,
                rating: p.rating,
                role: p.role,
                blockedUsers: p.blocked_users || [],
                credits: p.credits || 0,
                badges: p.badges || []
            }));
        }
    }
    return getDB(DB_KEYS.USERS, USERS);
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    if (supabase) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (!error && data) {
            return {
                id: data.id,
                name: data.name,
                email: data.email,
                bio: data.bio,
                avatarUrl: data.avatar_url,
                skillsOffered: data.skills_offered || [],
                skillsWanted: data.skills_wanted || [],
                verifiedSkills: data.verified_skills || [],
                availability: data.availability,
                rating: data.rating,
                role: data.role,
                blockedUsers: data.blocked_users || [],
                credits: data.credits || 0,
                badges: data.badges || []
            };
        }
    }
    const users = getDB(DB_KEYS.USERS, USERS);
    return users.find(u => u.id === id);
  },

  updateUser: async (updatedUser: User): Promise<User | null> => {
    if (supabase) {
        const { error } = await supabase.from('profiles').update({
            name: updatedUser.name,
            bio: updatedUser.bio,
            availability: updatedUser.availability,
            avatar_url: updatedUser.avatarUrl,
            skills_wanted: updatedUser.skillsWanted,
            skills_offered: updatedUser.skillsOffered,
            verified_skills: updatedUser.verifiedSkills,
            credits: updatedUser.credits,
            badges: updatedUser.badges,
            blocked_users: updatedUser.blockedUsers
        }).eq('id', updatedUser.id);
        window.dispatchEvent(new Event('storage'));
        return error ? null : updatedUser;
    }
    const users = getDB(DB_KEYS.USERS, USERS);
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
        users[index] = { ...users[index], ...updatedUser };
        setDB(DB_KEYS.USERS, users);
        return users[index];
    }
    return null;
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        window.dispatchEvent(new Event('storage'));
        return !error;
    }
    let users = getDB(DB_KEYS.USERS, USERS);
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    if (users.length < initialLength) {
        setDB(DB_KEYS.USERS, users);
        return true;
    }
    return false;
  },

  getSkills: async (): Promise<Skill[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('skills').select('*');
        if (!error && data) {
            return data.map((s: any) => ({
                id: s.id,
                name: s.name,
                category: s.category,
                description: s.description,
                ownerId: s.owner_id,
                tags: s.tags || [],
                level: s.level
            }));
        }
    }
    return getDB(DB_KEYS.SKILLS, SKILLS);
  },

  addSkill: async (skill: Omit<Skill, 'id'>): Promise<Skill | null> => {
    if (supabase) {
        const { data, error } = await supabase.from('skills').insert([{
            name: skill.name,
            category: skill.category,
            description: skill.description,
            owner_id: skill.ownerId,
            tags: skill.tags,
            level: skill.level
        }]).select().single();
        
        if (!error && data) {
            const { data: profile } = await supabase.from('profiles').select('skills_offered').eq('id', skill.ownerId).single();
            const updatedSkills = [...(profile?.skills_offered || []), data.id];
            await supabase.from('profiles').update({ skills_offered: updatedSkills }).eq('id', skill.ownerId);
            window.dispatchEvent(new Event('storage'));
            return { id: data.id, name: data.name, category: data.category, description: data.description, ownerId: data.owner_id, tags: data.tags || [], level: data.level };
        }
    }
    const skills = getDB(DB_KEYS.SKILLS, SKILLS);
    const newId = Math.random().toString(36).substr(2, 9);
    const newSkill = { ...skill, id: newId };
    skills.push(newSkill);
    setDB(DB_KEYS.SKILLS, skills);
    const users = getDB(DB_KEYS.USERS, USERS);
    const userIndex = users.findIndex(u => u.id === skill.ownerId);
    if (userIndex !== -1) {
        users[userIndex].skillsOffered.push(newId);
        setDB(DB_KEYS.USERS, users);
    }
    return newSkill;
  },

  deleteSkill: async (skillId: string): Promise<boolean> => {
      if (supabase) {
          await supabase.from('skills').delete().eq('id', skillId);
          window.dispatchEvent(new Event('storage'));
          return true;
      }
      let skills = getDB(DB_KEYS.SKILLS, SKILLS);
      skills = skills.filter(s => s.id !== skillId);
      setDB(DB_KEYS.SKILLS, skills);
      return true;
  },

  verifySkill: async (userId: string, skillId: string): Promise<boolean> => {
      if (supabase) {
          const { data: profile } = await supabase.from('profiles').select('verified_skills').eq('id', userId).single();
          const verified = profile?.verified_skills || [];
          if (!verified.includes(skillId)) {
              await supabase.from('profiles').update({ verified_skills: [...verified, skillId] }).eq('id', userId);
              await createInternalNotification(userId, "Skill verified! Badge earned.", 'badge');
              window.dispatchEvent(new Event('storage'));
              return true;
          }
          return false;
      }
      const users = getDB(DB_KEYS.USERS, USERS);
      const userIndex = users.findIndex(u => u.id === userId);
      if(userIndex !== -1) {
          const user = users[userIndex];
          if(!user.verifiedSkills) user.verifiedSkills = [];
          if(!user.verifiedSkills.includes(skillId)) {
              user.verifiedSkills.push(skillId);
              setDB(DB_KEYS.USERS, users);
              await createInternalNotification(userId, "Skill Verified!", 'badge');
              return true;
          }
      }
      return false;
  },

  getMatchesForUser: async (userId: string): Promise<Match[]> => {
    if (supabase) {
        let query = supabase.from('matches').select('*');
        if (userId !== '-1') query = query.or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
        const { data, error } = await query;
        if (!error && data) {
            return data.map((m: any) => ({
                id: m.id,
                user1Id: m.user1_id,
                user2Id: m.user2_id,
                skillOfferedId: m.skill_offered_id,
                skillWantedId: m.skill_wanted_id,
                status: m.status,
                scheduledTime: m.scheduled_time,
                meetLink: m.meet_link
            }));
        }
    }
    const matches = getDB(DB_KEYS.MATCHES, MATCHES);
    if (userId === '-1') return matches;
    return matches.filter(m => m.user1Id === userId || m.user2Id === userId);
  },

  getMatchById: async (matchId: string): Promise<Match | null> => {
      if (supabase) {
          const { data } = await supabase.from('matches').select('*').eq('id', matchId).single();
          if (data) return { id: data.id, user1Id: data.user_id_1, user2Id: data.user_id_2, skillOfferedId: data.skill_offered_id, skillWantedId: data.skill_wanted_id, status: data.status, scheduledTime: data.scheduled_time, meetLink: data.meet_link };
      }
      const matches = getDB(DB_KEYS.MATCHES, MATCHES);
      return matches.find(m => m.id === matchId) || null;
  },

  createMatch: async (match: Omit<Match, 'id' | 'status' | 'scheduledTime' | 'meetLink'>): Promise<Match | null> => {
      if (supabase) {
          const { data, error } = await supabase.from('matches').insert([{
              user1_id: match.user1Id,
              user2_id: match.user2Id,
              skill_offered_id: match.skillOfferedId,
              skill_wanted_id: match.skillWantedId,
              status: 'pending'
          }]).select().single();
          if (!error && data) {
               await createInternalNotification(match.user2Id, "New connection request received!", 'match', data.id);
               window.dispatchEvent(new Event('storage'));
              return { id: data.id, user1Id: data.user1_id, user2Id: data.user2_id, skillOfferedId: data.skill_offered_id, skillWantedId: data.skill_wanted_id, status: 'pending', scheduledTime: null, meetLink: null };
          }
      }
      const matches = getDB(DB_KEYS.MATCHES, MATCHES);
      const newMatch: Match = { ...match, id: Math.random().toString(36).substr(2, 9), status: 'pending', scheduledTime: null, meetLink: null };
      matches.push(newMatch);
      setDB(DB_KEYS.MATCHES, matches);
      await createInternalNotification(match.user2Id, `A user sent you a connection request!`, 'match', newMatch.id);
      return newMatch;
  },

  updateMatch: async (match: Match, initiatorId?: string): Promise<Match | null> => {
    if (supabase) {
        await supabase.from('matches').update({ status: match.status, scheduled_time: match.scheduledTime, meet_link: match.meetLink }).eq('id', match.id);
        window.dispatchEvent(new Event('storage'));
    }
    const matches = getDB(DB_KEYS.MATCHES, MATCHES);
    const index = matches.findIndex(m => m.id === match.id);
    if (index !== -1) {
      const oldMatch = matches[index];
      matches[index] = match;
      setDB(DB_KEYS.MATCHES, matches);
      if (oldMatch.status === 'pending' && match.status === 'accepted') {
          await createInternalNotification(match.user1Id, `Your match request was accepted!`, 'match', match.id);
      }
      return match;
    }
    return null;
  },

  getMessages: async (matchId: string): Promise<Message[]> => {
      if (supabase) {
          const { data } = await supabase.from('messages').select('*').eq('match_id', matchId).order('timestamp', { ascending: true });
          return (data || []).map((m: any) => ({
              id: m.id, matchId: m.match_id, senderId: m.sender_id, text: m.text, mediaUrl: m.media_url, type: m.type, timestamp: m.timestamp, read: m.read
          }));
      }
      const messages = getDB(DB_KEYS.MESSAGES, MESSAGES_SEED); 
      return messages.filter(m => m.matchId === matchId).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  
  // FIX: Added markMessagesAsRead
  markMessagesAsRead: async (matchId: string, userId: string): Promise<boolean> => {
      if (supabase) {
          await supabase.from('messages').update({ read: true }).eq('match_id', matchId).neq('sender_id', userId);
          window.dispatchEvent(new Event('storage'));
          return true;
      }
      const messages = getDB(DB_KEYS.MESSAGES, MESSAGES_SEED);
      let changed = false;
      messages.forEach(m => {
          if (m.matchId === matchId && m.senderId !== userId && !m.read) {
              m.read = true;
              changed = true;
          }
      });
      if (changed) setDB(DB_KEYS.MESSAGES, messages);
      return true;
  },

  sendMessage: async (message: Omit<Message, 'id'>): Promise<Message> => {
      if (supabase) {
          const { data } = await supabase.from('messages').insert([{
              match_id: message.matchId,
              sender_id: message.senderId,
              text: message.text,
              media_url: message.mediaUrl,
              type: message.type,
              timestamp: message.timestamp,
              read: false
          }]).select().single();
          if (data) {
              window.dispatchEvent(new Event('storage'));
              return { ...message, id: data.id };
          }
      }
      const messages = getDB(DB_KEYS.MESSAGES, MESSAGES_SEED);
      const newMessage = { ...message, id: Math.random().toString(36).substr(2, 9) };
      messages.push(newMessage);
      setDB(DB_KEYS.MESSAGES, messages);
      return newMessage;
  },

  // FIX: Added getLastMessage
  getLastMessage: async (matchId: string): Promise<Message | null> => {
      const messages = await api.getMessages(matchId);
      return messages.length > 0 ? messages[messages.length - 1] : null;
  },

  // FIX: Added typing status methods
  getTypingStatus: async (matchId: string, userId: string): Promise<boolean> => {
      const typing = JSON.parse(localStorage.getItem(DB_KEYS.TYPING) || '{}');
      return !!typing[`${matchId}_${userId}`];
  },

  setTypingStatus: async (matchId: string, userId: string, isTyping: boolean): Promise<void> => {
      const typing = JSON.parse(localStorage.getItem(DB_KEYS.TYPING) || '{}');
      if (isTyping) typing[`${matchId}_${userId}`] = true;
      else delete typing[`${matchId}_${userId}`];
      localStorage.setItem(DB_KEYS.TYPING, JSON.stringify(typing));
      window.dispatchEvent(new Event('storage'));
  },

  getFeedPosts: async (): Promise<Post[]> => {
      if (supabase) {
          const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
          return (data || []).map((p: any) => ({
              id: p.id, userId: p.user_id, title: p.title, content: p.content, tags: p.tags || [], likes: p.likes || [], comments: p.comments || [], createdAt: p.created_at, type: p.type
          }));
      }
      return getDB(DB_KEYS.POSTS, POSTS).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // FIX: Added createPost
  createPost: async (post: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt'>): Promise<Post> => {
      if (supabase) {
          const { data } = await supabase.from('posts').insert([{
              user_id: post.userId,
              title: post.title,
              content: post.content,
              tags: post.tags,
              type: post.type,
              likes: [],
              comments: [],
              created_at: new Date().toISOString()
          }]).select().single();
          window.dispatchEvent(new Event('storage'));
          return { ...post, id: data.id, likes: [], comments: [], createdAt: data.created_at };
      }
      const posts = getDB(DB_KEYS.POSTS, POSTS);
      const newPost: Post = { 
          ...post, 
          id: Math.random().toString(36).substr(2, 9), 
          likes: [], 
          comments: [], 
          createdAt: new Date().toISOString() 
      };
      posts.unshift(newPost);
      setDB(DB_KEYS.POSTS, posts);
      return newPost;
  },

  // FIX: Added togglePostLike
  togglePostLike: async (postId: string, userId: string): Promise<Post | null> => {
      if (supabase) {
          const { data: post } = await supabase.from('posts').select('*').eq('id', postId).single();
          if (post) {
              let likes = post.likes || [];
              if (likes.includes(userId)) likes = likes.filter((id: string) => id !== userId);
              else likes.push(userId);
              const { data } = await supabase.from('posts').update({ likes }).eq('id', postId).select().single();
              window.dispatchEvent(new Event('storage'));
              return { ...data, id: data.id, userId: data.user_id, createdAt: data.created_at, tags: data.tags || [], likes: data.likes || [], comments: data.comments || [] };
          }
          return null;
      }
      const posts = getDB(DB_KEYS.POSTS, POSTS);
      const idx = posts.findIndex(p => p.id === postId);
      if (idx !== -1) {
          if (posts[idx].likes.includes(userId)) {
              posts[idx].likes = posts[idx].likes.filter(id => id !== userId);
          } else {
              posts[idx].likes.push(userId);
          }
          setDB(DB_KEYS.POSTS, posts);
          return posts[idx];
      }
      return null;
  },

  // FIX: Added addComment
  addComment: async (postId: string, userId: string, text: string): Promise<Post | null> => {
      if (supabase) {
          const { data: post } = await supabase.from('posts').select('*').eq('id', postId).single();
          if (post) {
              const comments = post.comments || [];
              const newComment = { id: Math.random().toString(36).substr(2, 9), userId, text, createdAt: new Date().toISOString() };
              comments.push(newComment);
              const { data } = await supabase.from('posts').update({ comments }).eq('id', postId).select().single();
              window.dispatchEvent(new Event('storage'));
              return { ...data, id: data.id, userId: data.user_id, createdAt: data.created_at, tags: data.tags || [], likes: data.likes || [], comments: data.comments || [] };
          }
          return null;
      }
      const posts = getDB(DB_KEYS.POSTS, POSTS);
      const idx = posts.findIndex(p => p.id === postId);
      if (idx !== -1) {
          const newComment = { id: Math.random().toString(36).substr(2, 9), userId, text, createdAt: new Date().toISOString() };
          posts[idx].comments.push(newComment);
          setDB(DB_KEYS.POSTS, posts);
          return posts[idx];
      }
      return null;
  },

  getSessionsForUser: async (userId: string): Promise<Session[]> => {
    if (supabase) {
        const matches = await api.getMatchesForUser(userId);
        const ids = matches.map(m => m.id);
        if(ids.length === 0) return [];
        const { data } = await supabase.from('sessions').select('*').in('match_id', ids);
        return (data || []).map((s: any) => ({ id: s.id, matchId: s.match_id, startTime: s.start_time, endTime: s.end_time, status: s.status }));
    }
    const matches = getDB(DB_KEYS.MATCHES, MATCHES);
    const sessions = getDB(DB_KEYS.SESSIONS, SESSIONS);
    const ids = matches.filter(m => m.user1Id === userId || m.user2Id === userId).map(m => m.id);
    return sessions.filter(s => ids.includes(s.matchId));
  },

  // FIX: Added getFeedbackForUser
  getFeedbackForUser: async (userId: string): Promise<Feedback[]> => {
    if (supabase) {
        const { data } = await supabase.from('feedbacks').select('*').eq('to_user_id', userId);
        return (data || []).map((f: any) => ({
            id: f.id, sessionId: f.session_id, fromUserId: f.from_user_id, toUserId: f.to_user_id, rating: f.rating, comment: f.comment, createdAt: f.created_at
        }));
    }
    return getDB(DB_KEYS.FEEDBACKS, FEEDBACKS).filter(f => f.toUserId === userId);
  },

  completeSession: async (matchId: string, currentUserId: string): Promise<Session | null> => {
      if (supabase) {
          const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).single();
          if (match) {
            await supabase.from('matches').update({ scheduled_time: null, meet_link: null }).eq('id', matchId);
            const { data } = await supabase.from('sessions').insert([{
                match_id: matchId,
                start_time: match.scheduled_time || new Date().toISOString(),
                end_time: new Date().toISOString(),
                status: 'completed'
            }]).select().single();
            await api.checkAndAwardBadges(match.user1_id);
            await api.checkAndAwardBadges(match.user2_id);
            window.dispatchEvent(new Event('storage'));
            return data;
          }
          return null;
      }
      const matches = getDB(DB_KEYS.MATCHES, MATCHES);
      const matchIndex = matches.findIndex(m => m.id === matchId);
      if(matchIndex === -1) return null;
      const match = matches[matchIndex];
      match.scheduledTime = null; match.meetLink = null;
      setDB(DB_KEYS.MATCHES, matches);
      const sessions = getDB(DB_KEYS.SESSIONS, SESSIONS);
      const newSession: Session = { id: Math.random().toString(36).substr(2, 9), matchId, startTime: new Date().toISOString(), endTime: new Date().toISOString(), status: 'completed' };
      sessions.push(newSession);
      setDB(DB_KEYS.SESSIONS, sessions);
      await api.checkAndAwardBadges(match.user1Id);
      await api.checkAndAwardBadges(match.user2Id);
      return newSession;
  },

  getNotificationsForUser: async (userId: string): Promise<Notification[]> => {
    if (supabase) {
         const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
         return (data || []).map((n: any) => ({ id: n.id, userId: n.user_id, message: n.message, type: n.type, read: n.read, createdAt: n.created_at, matchId: n.match_id }));
    }
    return getDB(DB_KEYS.NOTIFICATIONS, NOTIFICATIONS).filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markNotificationAsRead: async (id: string): Promise<boolean> => {
    if (supabase) {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
        window.dispatchEvent(new Event('storage'));
        return true;
    }
    const notifications = getDB(DB_KEYS.NOTIFICATIONS, NOTIFICATIONS);
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) { notifications[idx].read = true; setDB(DB_KEYS.NOTIFICATIONS, notifications); return true; }
    return false;
  },

  // FIX: Added markAllNotificationsAsRead
  markAllNotificationsAsRead: async (userId: string): Promise<boolean> => {
    if (supabase) {
        await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
        window.dispatchEvent(new Event('storage'));
        return true;
    }
    const notifications = getDB(DB_KEYS.NOTIFICATIONS, NOTIFICATIONS);
    notifications.forEach(n => { if (n.userId === userId) n.read = true; });
    setDB(DB_KEYS.NOTIFICATIONS, notifications);
    return true;
  },

  getTasksForUser: async (userId: string): Promise<Task[]> => {
      if (supabase) {
          const { data } = await supabase.from('tasks').select('*').eq('user_id', userId);
          return (data || []).map((t: any) => ({
              id: t.id, userId: t.user_id, title: t.title, description: t.description, difficulty: t.difficulty, creditsReward: t.credits_reward, status: t.status, createdAt: t.created_at, completedAt: t.completed_at
          }));
      }
      return getDB(DB_KEYS.TASKS, TASKS).filter(t => t.userId === userId);
  },

  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'status'>): Promise<Task | null> => {
      if (supabase) {
          const { data } = await supabase.from('tasks').insert([{
              user_id: task.userId, title: task.title, description: task.description, difficulty: task.difficulty, credits_reward: task.creditsReward, status: 'pending'
          }]).select().single();
          window.dispatchEvent(new Event('storage'));
          return { ...task, id: data.id, createdAt: data.created_at, status: 'pending' };
      }
      const tasks = getDB(DB_KEYS.TASKS, TASKS);
      const newTask: Task = { ...task, id: Math.random().toString(36).substr(2, 9), status: 'pending', createdAt: new Date().toISOString() };
      tasks.push(newTask);
      setDB(DB_KEYS.TASKS, tasks);
      return newTask;
  },

  completeTask: async (id: string, userId: string): Promise<Task | null> => {
      if (supabase) {
          const { data: task } = await supabase.from('tasks').select('*').eq('id', id).single();
          if (task && task.status !== 'completed') {
              const { data } = await supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id).select().single();
              const user = await api.getUserById(userId);
              if (user) {
                  user.credits += data.credits_reward;
                  await api.updateUser(user);
              }
              window.dispatchEvent(new Event('storage'));
              return { ...data, id: data.id, userId: data.user_id, creditsReward: data.credits_reward, createdAt: data.created_at, completedAt: data.completed_at };
          }
      }
      const tasks = getDB(DB_KEYS.TASKS, TASKS);
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1 && tasks[idx].status !== 'completed') {
          tasks[idx].status = 'completed';
          tasks[idx].completedAt = new Date().toISOString();
          const user = getDB(DB_KEYS.USERS, USERS).find(u => u.id === userId);
          if (user) {
              user.credits += tasks[idx].creditsReward;
              setDB(DB_KEYS.USERS, getDB(DB_KEYS.USERS, USERS));
          }
          setDB(DB_KEYS.TASKS, tasks);
          return tasks[idx];
      }
      return null;
  },

  getBadges: async (): Promise<Badge[]> => BADGES,

  checkAndAwardBadges: async (userId: string) => {
      const user = await api.getUserById(userId);
      if (!user) return;
      const tasks = await api.getTasksForUser(userId);
      const completedTasks = tasks.filter(t => t.status === 'completed');
      if (completedTasks.length >= 5 && !user.badges.includes('b2')) {
          user.badges = [...(user.badges || []), 'b2'];
          await api.updateUser(user);
          window.dispatchEvent(new Event('storage'));
      }
  },

  // FIX: Added blockUser
  blockUser: async (userId: string, targetId: string): Promise<void> => {
      const user = await api.getUserById(userId);
      if (user) {
          if (!user.blockedUsers.includes(targetId)) {
              user.blockedUsers.push(targetId);
              await api.updateUser(user);
          }
      }
  },

  // FIX: Added unblockUser
  unblockUser: async (userId: string, targetId: string): Promise<void> => {
      const user = await api.getUserById(userId);
      if (user) {
          user.blockedUsers = user.blockedUsers.filter(id => id !== targetId);
          await api.updateUser(user);
      }
  },

  // FIX: Added reportUser
  reportUser: async (reporterId: string, reportedId: string, reason: string): Promise<void> => {
      if (supabase) {
          await supabase.from('reports').insert([{
              reporter_id: reporterId,
              reported_id: reportedId,
              reason,
              description: reason,
              status: 'pending',
              timestamp: new Date().toISOString()
          }]);
          window.dispatchEvent(new Event('storage'));
          return;
      }
      const reports = getDB(DB_KEYS.REPORTS, REPORTS);
      reports.push({
          id: Math.random().toString(36).substr(2, 9),
          reporterId,
          reportedId,
          reason,
          description: reason,
          status: 'pending',
          timestamp: new Date().toISOString()
      });
      setDB(DB_KEYS.REPORTS, reports);
  },

  // FIX: Added getReports
  getReports: async (): Promise<Report[]> => {
      if (supabase) {
          const { data } = await supabase.from('reports').select('*');
          return (data || []).map((r: any) => ({
              id: r.id, reporterId: r.reporter_id, reportedId: r.reported_id, reason: r.reason, description: r.description, status: r.status, timestamp: r.timestamp
          }));
      }
      return getDB(DB_KEYS.REPORTS, REPORTS);
  },

  // FIX: Added resolveReport
  resolveReport: async (reportId: string, action: 'resolved' | 'dismissed'): Promise<boolean> => {
      if (supabase) {
          await supabase.from('reports').update({ status: action }).eq('id', reportId);
          window.dispatchEvent(new Event('storage'));
          return true;
      }
      const reports = getDB(DB_KEYS.REPORTS, REPORTS);
      const idx = reports.findIndex(r => r.id === reportId);
      if (idx !== -1) {
          reports[idx].status = action;
          setDB(DB_KEYS.REPORTS, reports);
          return true;
      }
      return false;
  },

  saveWhiteboardData: async (id: string, data: any) => {
      const all = JSON.parse(localStorage.getItem(DB_KEYS.WHITEBOARD) || '{}');
      all[id] = data;
      localStorage.setItem(DB_KEYS.WHITEBOARD, JSON.stringify(all));
      window.dispatchEvent(new Event('storage'));
  },

  getWhiteboardData: async (id: string): Promise<any> => {
      const all = JSON.parse(localStorage.getItem(DB_KEYS.WHITEBOARD) || '{}');
      return all[id] || null;
  },
};
