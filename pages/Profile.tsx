
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Skill, User, Badge } from '../types';
import EditProfileModal from '../components/EditProfileModal';
import SkillVerificationModal from '../components/SkillVerificationModal';
import { PencilIcon, ZapIcon, ShieldIcon } from '../components/icons';

const Profile: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [skillsOffered, setSkillsOffered] = useState<Skill[]>([]);
    const [skillsWanted, setSkillsWanted] = useState<Skill[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Verification State
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [skillToVerify, setSkillToVerify] = useState<Skill | null>(null);

    const fetchProfileData = async () => {
        if (user) {
            setLoading(true);
            const [skillsData, badgesData] = await Promise.all([
                api.getSkills(),
                api.getBadges()
            ]);
            setAllSkills(skillsData);
            setBadges(badgesData);
            setSkillsOffered(skillsData.filter(s => user.skillsOffered.includes(s.id)));
            setSkillsWanted(skillsData.filter(s => user.skillsWanted.includes(s.id)));
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [user]);

    const handleSaveProfile = async (updatedData: Partial<User>) => {
        if (!user) return;
        setIsSaving(true);
        try {
            const updatedUser = { ...user, ...updatedData };
            const result = await api.updateUser(updatedUser);
            if (result) {
                updateProfile(result);
                // Refresh skills in case they were modified
                await fetchProfileData(); 
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleVerifyClick = (skill: Skill) => {
        setSkillToVerify(skill);
        setVerifyModalOpen(true);
    };

    const handleVerificationSuccess = async (skillId: string) => {
        if(!user) return;
        const success = await api.verifySkill(user.id, skillId);
        if(success) {
            const updatedUser = await api.getUserById(user.id);
            if(updatedUser) updateProfile(updatedUser);
        }
    };

    if (!user) {
        return <div className="text-center p-8">Please log in to view your profile.</div>;
    }
    
    if(loading) {
        return <div className="text-center p-8">Loading profile...</div>;
    }

    const SkillPill: React.FC<{skill: Skill, isOffered?: boolean}> = ({ skill, isOffered = false }) => {
        const isVerified = user.verifiedSkills?.includes(skill.id);
        
        return (
            <div className="bg-primary-100 text-primary-800 text-sm font-medium mr-2 mb-2 pl-3 pr-2 py-1 rounded-full dark:bg-primary-900 dark:text-primary-300 flex items-center group border border-primary-200 dark:border-primary-800">
                <span>{skill.name}</span>
                <span className="ml-2 text-xs opacity-75 border-l border-primary-300 dark:border-primary-700 pl-2">{skill.level}</span>
                {isOffered && isVerified && (
                    <span className="ml-2 text-green-600 dark:text-green-400" title="Verified Skill">
                        <ShieldIcon className="w-3.5 h-3.5 fill-current" />
                    </span>
                )}
                {isOffered && !isVerified && (
                    <button 
                        onClick={() => handleVerifyClick(skill)}
                        className="ml-2 px-2 py-0.5 text-[9px] bg-primary-600 hover:bg-primary-700 text-white rounded-lg uppercase font-bold tracking-wider transition-all shadow-sm active:scale-95"
                        title="Click to take the AI verification quiz"
                    >
                        Verify Now
                    </button>
                )}
            </div>
        );
    }

    const BadgeItem: React.FC<{badgeId: string}> = ({ badgeId }) => {
        const badge = badges.find(b => b.id === badgeId);
        if (!badge) return null;

        const colorClasses: {[key: string]: string} = {
            blue: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
            green: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400',
            yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
            purple: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
            orange: 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
            teal: 'bg-teal-100 text-teal-600 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400',
        };

        return (
            <div className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border ${colorClasses[badge.color] || colorClasses.blue} transition-transform hover:scale-105`}>
                <span className="text-3xl mb-2">{badge.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-center">{badge.name}</span>
                
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs p-2 rounded w-40 text-center pointer-events-none z-10 shadow-lg">
                    {badge.description}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    <div className="relative group">
                        <img className="w-32 h-32 rounded-full ring-4 ring-primary-100 dark:ring-primary-900/50 object-cover" src={user.avatarUrl} alt="Profile" />
                         <span className="absolute bottom-1 right-1 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full w-5 h-5"></span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start">
                                    {user.name}
                                    {user.badges.includes('b6') && (
                                        <span className="ml-2 text-blue-500" title="Verified Identity">
                                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 000.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        </span>
                                    )}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
                            </div>
                            <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="mt-4 md:mt-0 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm flex items-center justify-center self-center md:self-start"
                            >
                                <PencilIcon className="w-4 h-4 mr-2" />
                                Edit Profile
                            </button>
                        </div>
                        
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">{user.bio}</p>
                        
                        <div className="mt-6 flex flex-wrap justify-center md:justify-start items-center gap-4">
                           <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                <span className="text-yellow-400 mr-2">★</span>
                                <span className="font-bold text-gray-800 dark:text-gray-200">{user.rating.toFixed(1)}</span>
                                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">Rating</span>
                           </div>
                           <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
                               <span className="text-sm text-gray-600 dark:text-gray-300">Availability: <span className="font-semibold text-gray-900 dark:text-white">{user.availability}</span></span>
                           </div>
                           <div className="flex items-center bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg border border-orange-100 dark:border-orange-900/30">
                               <ZapIcon className="w-4 h-4 text-orange-500 mr-1" />
                               <span className="font-bold text-gray-800 dark:text-gray-200">{user.credits}</span>
                               <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">Credits</span>
                           </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 border border-gray-100 dark:border-gray-700 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                    <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-1.5 rounded-lg mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                    </span>
                    Badges & Achievements
                </h3>
                {user.badges && user.badges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {user.badges.map(badgeId => (
                            <BadgeItem key={badgeId} badgeId={badgeId} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                        <p className="text-gray-500 dark:text-gray-400">No badges earned yet. Complete tasks and sessions to unlock them!</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1.5 rounded-lg mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </span>
                        Skills Offered
                    </h3>
                    <div className="flex flex-wrap">
                        {skillsOffered.length > 0 ? skillsOffered.map(skill => <SkillPill key={skill.id} skill={skill} isOffered={true} />) : <p className="text-gray-500 dark:text-gray-400 italic">No skills offered yet.</p>}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-1.5 rounded-lg mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </span>
                        Skills Wanted
                    </h3>
                    <div className="flex flex-wrap">
                        {skillsWanted.length > 0 ? skillsWanted.map(skill => <SkillPill key={skill.id} skill={skill} />) : <p className="text-gray-500 dark:text-gray-400 italic">No skills wanted yet.</p>}
                    </div>
                </div>
            </div>

            <EditProfileModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onSave={handleSaveProfile}
                isSaving={isSaving}
                allSkills={allSkills}
            />

            {skillToVerify && (
                <SkillVerificationModal 
                    isOpen={verifyModalOpen}
                    onClose={() => setVerifyModalOpen(false)}
                    skill={skillToVerify}
                    onVerify={handleVerificationSuccess}
                />
            )}
        </div>
    );
};

export default Profile;
