
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAIRecommendations } from '../services/geminiService';
import { api } from '../services/api';
import { User, Skill, AiPeerRecommendation, AiSkillRecommendation } from '../types';
import { ExternalLinkIcon, ZapIcon } from '../components/icons';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [peerRecs, setPeerRecs] = useState<AiPeerRecommendation[]>([]);
  const [skillRecs, setSkillRecs] = useState<AiSkillRecommendation[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (user && allUsers.length > 0 && allSkills.length > 0) {
      try {
        setLoading(true);
        setError(null);

        const [matches, sessions, feedback, tasks] = await Promise.all([
             api.getMatchesForUser(user.id),
             api.getSessionsForUser(user.id),
             api.getFeedbackForUser(user.id),
             api.getTasksForUser(user.id)
        ]);

        const { peers, skills } = await getAIRecommendations(
            user, 
            allUsers, 
            allSkills, 
            matches, 
            sessions, 
            feedback,
            tasks
        );
        setPeerRecs(peers);
        setSkillRecs(skills);
      } catch (e) {
        setError('Failed to fetch AI recommendations.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  }, [user, allUsers, allSkills]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, skillsData] = await Promise.all([
          api.getUsers(),
          api.getSkills(),
        ]);
        setAllUsers(usersData);
        setAllSkills(skillsData);
      } catch (e) {
        setError('Failed to load initial data.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (allUsers.length > 0 && allSkills.length > 0) {
      fetchRecommendations();
    }
  }, [allUsers, allSkills, fetchRecommendations]);

  const handleConnect = async (targetUserId: string) => {
    if (!user) return;
    const targetUser = allUsers.find(u => u.id === targetUserId);
    if (!targetUser) return;
    
    try {
        const skillOfferedId = user.skillsOffered[0] || '1'; 
        const skillWantedId = targetUser.skillsOffered[0] || '1'; 
        const result = await api.createMatch({
            user1Id: user.id,
            user2Id: targetUser.id,
            skillOfferedId,
            skillWantedId
        });
        if (result) {
            alert(`Connection request sent to ${targetUser.name}!`);
            fetchRecommendations();
        }
    } catch (e) {
        alert("Failed to send request.");
    }
  };

  const SkeletonCard: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-6"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your personalized AI insights are ready based on your recent activity and goals.
          </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r shadow-sm animate-pop-in" role="alert">
            <p className="font-bold">Notice</p>
            <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
             <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Recommended Peers</h2>
             <span className="px-2 py-1 text-[10px] font-black uppercase tracking-widest bg-cyan-100 text-cyan-700 rounded-lg dark:bg-cyan-900/30 dark:text-cyan-400">Deep Match</span>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : peerRecs.length > 0 ? (
              peerRecs.map((rec, index) => {
                const peer = allUsers.find(u => u.id === rec.userId);
                if (!peer) return null;
                return (
                  <div 
                    key={rec.userId} 
                    className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    <div className="flex items-start space-x-5">
                      <div className="relative">
                          <img src={peer.avatarUrl} alt={peer.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-primary-500 transition-all duration-300" />
                          <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{peer.name}</h3>
                                <div className="flex items-center mt-1 space-x-3">
                                    <p className="text-xs font-bold text-yellow-500 flex items-center">
                                        <span className="mr-1">★</span> {peer.rating.toFixed(1)}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center">
                                        <ZapIcon className="w-3 h-3 text-orange-500 mr-0.5" />
                                        {peer.credits} Rep
                                    </p>
                                </div>
                             </div>
                             <button 
                                onClick={() => handleConnect(peer.id)}
                                className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary-500/30"
                             >
                                Connect
                             </button>
                        </div>
                        <div className="mt-4 relative bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-600 group-hover:bg-primary-50/30 dark:group-hover:bg-primary-900/10 transition-colors">
                            <div className="absolute -top-2 left-4 px-2 bg-white dark:bg-gray-800 text-[9px] font-black text-primary-500 uppercase tracking-widest border border-gray-100 dark:border-gray-700 rounded shadow-sm">AI Analysis</div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                "{rec.reason}"
                            </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">No active matches found. Try updating your 'Skills Wanted' in your profile!</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
             <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Learning Curations</h2>
             <span className="px-2 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">Smart Picks</span>
          </div>

          <div className="space-y-4">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : skillRecs.length > 0 ? (
              skillRecs.map((rec, index) => (
                <div 
                    key={rec.skillName} 
                    className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                   <div className="flex justify-between items-start">
                       <div className="flex flex-col">
                           <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{rec.skillName}</h3>
                           <span className="mt-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest">Suggested Expansion</span>
                       </div>
                       <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                           <ExternalLinkIcon className="w-5 h-5" />
                       </div>
                   </div>
                   <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed border-l-4 border-indigo-200 dark:border-indigo-800 pl-4">
                       {rec.reason}
                   </p>
                   <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                       <button className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors flex items-center">
                           Add to Learning Path <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                       </button>
                   </div>
                </div>
              ))
            ) : (
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">Complete more tasks to unlock personalized skill suggestions.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
