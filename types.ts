
export interface User {
  id: string; 
  name: string;
  email: string;
  password?: string;
  bio: string;
  avatarUrl: string;
  skillsOffered: string[]; 
  skillsWanted: string[]; 
  verifiedSkills?: string[]; 
  availability: string;
  rating: number;
  role: 'user' | 'admin';
  blockedUsers: string[]; 
  credits: number; 
  badges: string[]; 
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Skill {
  id: string; 
  name: string;
  category: string;
  description: string;
  ownerId: string; 
  tags: string[];
  level: SkillLevel;
}

export interface Match {
  id: string; 
  user1Id: string;
  user2Id: string;
  skillOfferedId: string;
  skillWantedId: string;
  status: 'pending' | 'accepted' | 'declined';
  scheduledTime?: string | null;
  meetLink?: string | null;
}

export interface Session {
  id: string;
  matchId: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Feedback {
  id: string;
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  rating: number; 
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'match' | 'message' | 'session' | 'system' | 'badge';
  read: boolean;
  createdAt: string;
  matchId?: string; 
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  creditsReward: number;
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; 
  color: string; 
  category: 'achievement' | 'appreciation' | 'trust';
}

export interface Report {
    id: string;
    reporterId: string;
    reportedId: string;
    reason: string; 
    description: string;
    status: 'pending' | 'resolved' | 'dismissed';
    timestamp: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  type: 'text' | 'image';
  timestamp: string; 
  read: boolean;
}

export interface Comment {
    id: string;
    userId: string;
    text: string;
    createdAt: string;
}

export interface Post {
    id: string;
    userId: string;
    title: string;
    content: string;
    tags: string[];
    likes: string[]; 
    comments: Comment[];
    createdAt: string;
    type: 'question' | 'tip';
}

export interface AiSkillRecommendation {
  skillName: string;
  reason: string;
}

export interface AiPeerRecommendation {
  userId: string; 
  reason: string;
}

export interface AiResource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'course' | 'book';
}

export interface AiRoadmapStep {
  step: number;
  title: string;
  description: string;
  resources: AiResource[];
  duration: string;
  topics: string[]; 
}

export interface AiRoadmap {
  skill: string;
  overview: string;
  steps: AiRoadmapStep[];
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}
