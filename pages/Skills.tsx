
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Skill, User, SkillLevel } from '../types';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, RefreshCwIcon, XIcon, ZapIcon, ShieldIcon, CheckIcon } from '../components/icons';
import AddSkillModal from '../components/AddSkillModal';
import SkillVerificationModal from '../components/SkillVerificationModal';

const Skills: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTag, setSelectedTag] = useState('All');
    const [selectedLevel, setSelectedLevel] = useState<SkillLevel | 'All'>('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State for Profile Modal
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Verification State
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [skillToVerify, setSkillToVerify] = useState<Skill | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const [skillsData, usersData] = await Promise.all([
            api.getSkills(),
            api.getUsers()
        ]);
        setSkills(skillsData);
        setUsers(usersData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const categories = useMemo(() => ['All', ...new Set(skills.map(s => s.category))], [skills]);
    const availableCategories = useMemo(() => {
        const cats = new Set(skills.map(s => s.category));
        if (cats.size === 0) return ['Technology', 'Business', 'Arts', 'Design', 'Language', 'Lifestyle'];
        return Array.from(cats);
    }, [skills]);

    const tags = useMemo(() => {
        const allTags = skills.flatMap(s => s.tags);
        return ['All', ...new Set(allTags)];
    }, [skills]);

    const levels: (SkillLevel | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

    const filteredSkills = useMemo(() => {
        return skills.filter(skill => {
            const owner = users.find(u => u.id === skill.ownerId);
            if (owner?.role === 'admin') return false;

            const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  skill.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
            const matchesTag = selectedTag === 'All' || skill.tags.includes(selectedTag);
            const matchesLevel = selectedLevel === 'All' || skill.level === selectedLevel;
            return matchesSearch && matchesCategory && matchesTag && matchesLevel;
        });
    }, [skills, users, searchTerm, selectedCategory, selectedTag, selectedLevel]);

    const getUserById = (id: string) => users.find(u => u.id === id);

    const handleAddSkill = async (skillData: { name: string; category: string; description: string; tags: string[]; level: SkillLevel }) => {
        if (!user) return;
        
        setIsSubmitting(true);
        try {
            await api.addSkill({
                ...skillData,
                ownerId: user.id
            });
            setIsAddModalOpen(false);
            await fetchData();
        } catch (error) {
            console.error("Failed to add skill", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('All');
        setSelectedTag('All');
        setSelectedLevel('All');
    };

    const handleViewProfile = (userId: string) => {
        const foundUser = users.find(u => u.id === userId);
        if (foundUser) {
            setSelectedUser(foundUser);
        }
    };

    const handleVerifyClick = (skill: Skill) => {
        setSkillToVerify(skill);
        setIsVerifyModalOpen(true);
    };

    const handleVerificationSuccess = async (skillId: string) => {
        if(!user) return;
        const success = await api.verifySkill(user.id, skillId);
        if(success) {
            const updatedUser = await api.getUserById(user.id);
            if(updatedUser) updateProfile(updatedUser);
            await fetchData();
        }
    };

    const getLevelBadgeStyle = (level: SkillLevel) => {
        switch (level) {
            case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'Intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'Expert': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto relative">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 animate-fade-in-up">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Explore Skills</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Discover what the community has to offer.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 md:mt-0 flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all duration-300 shadow-lg shadow-primary-500/30 hover:-translate-y-0.5"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Offer a Skill
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col xl:flex-row space-y-4 xl:space-y-0 xl:space-x-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex-grow relative">
                     <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search for skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="flex-1 md:flex-none px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer transition-all"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="flex-1 md:flex-none px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer transition-all"
                    >
                        {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                    </select>
                     <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value as SkillLevel | 'All')}
                        className="flex-1 md:flex-none px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer transition-all"
                    >
                        {levels.map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                    <button 
                        onClick={handleResetFilters}
                        className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        title="Reset all filters"
                    >
                        <RefreshCwIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 h-64 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSkills.map((skill, index) => {
                        const owner = getUserById(skill.ownerId);
                        const isOwnSkill = user?.id === skill.ownerId;
                        const isVerified = owner?.verifiedSkills?.includes(skill.id);

                        return (
                            <div 
                                key={skill.id} 
                                className={`group bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col justify-between border ${isOwnSkill ? 'border-primary-300 dark:border-primary-700 ring-2 ring-primary-500/10' : 'border-gray-100 dark:border-gray-700'} hover:shadow-2xl hover:border-primary-200 dark:hover:border-primary-900 transition-all duration-300 hover:-translate-y-2 animate-fade-in-up`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full text-primary-700 bg-primary-50 dark:bg-primary-900/40 dark:text-primary-300 w-fit">
                                                {skill.category}
                                            </span>
                                            {isOwnSkill && <span className="mt-1 text-[10px] font-black text-primary-500 uppercase tracking-tighter">Your Skill</span>}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {isVerified && (
                                                <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full flex items-center text-[10px] font-bold uppercase tracking-tighter" title="Skill Verified">
                                                    <CheckIcon className="w-3 h-3 mr-1" /> Verified
                                                </div>
                                            )}
                                            <span className={`text-xs font-bold py-1 px-2 rounded-full ${getLevelBadgeStyle(skill.level)}`}>
                                                {skill.level}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold my-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{skill.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">{skill.description}</p>
                                    
                                    <div className="flex flex-wrap mb-4 gap-2">
                                        {skill.tags.map(tag => (
                                            <span key={tag} className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">{tag}</span>
                                        ))}
                                    </div>
                                    
                                    {isOwnSkill && !isVerified && (
                                        <button 
                                            onClick={() => handleVerifyClick(skill)}
                                            className="w-full mb-4 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/10 group-hover/btn:translate-x-full transition-transform duration-500 skew-x-12 -translate-x-full"></div>
                                            <ShieldIcon className="w-3.5 h-3.5 animate-pulse" />
                                            Verify Skill Now
                                        </button>
                                    )}
                                </div>
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                                   {owner && (
                                    <div className="flex items-center">
                                        <img src={owner.avatarUrl} alt={owner.name} className="w-9 h-9 rounded-full mr-3 ring-2 ring-white dark:ring-gray-700 object-cover" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{owner.name}</p>
                                            <div className="flex items-center text-xs text-yellow-500">
                                                <span>★</span>
                                                <span className="ml-1 text-gray-500 dark:text-gray-400">{owner.rating}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleViewProfile(owner.id)}
                                            className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 p-2 rounded-lg transition-colors group-hover:scale-110 active:scale-95"
                                            title="View Glassmorphism Profile Card"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </button>
                                    </div>
                                   )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {filteredSkills.length === 0 && !loading && (
                <div className="text-center py-12">
                     <p className="text-gray-500 text-lg">No skills found matching your criteria.</p>
                     <button onClick={handleResetFilters} className="mt-4 text-primary-600 hover:underline">Clear filters</button>
                </div>
            )}

            <AddSkillModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddSkill}
                availableCategories={availableCategories}
                isSubmitting={isSubmitting}
            />

            {skillToVerify && (
                <SkillVerificationModal 
                    isOpen={isVerifyModalOpen}
                    onClose={() => {
                        setIsVerifyModalOpen(false);
                        setSkillToVerify(null);
                    }}
                    skill={skillToVerify}
                    onVerify={handleVerificationSuccess}
                />
            )}

            {/* REFINED Glassmorphism User Profile Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity" 
                        onClick={() => setSelectedUser(null)}
                    ></div>
                    <div className="relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl border border-white/30 dark:border-gray-700/50 p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full animate-pop-in flex flex-col items-center ring-1 ring-white/10">
                        <button 
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/40 transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>

                        <div className="relative mb-6">
                            <div className="w-28 h-28 rounded-full p-1.5 bg-gradient-to-br from-cyan-400 via-primary-500 to-blue-600 shadow-xl">
                                <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-full h-full rounded-full object-cover border-4 border-white/50 dark:border-gray-900/50" />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-yellow-500 text-sm font-black px-3 py-1 rounded-full shadow-lg border border-white/20 flex items-center">
                                ★ {selectedUser.rating.toFixed(1)}
                            </div>
                        </div>

                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1 drop-shadow-sm">{selectedUser.name}</h2>
                        <p className="text-xs text-primary-600 dark:text-primary-400 font-bold uppercase tracking-[0.2em] mb-6">
                            {selectedUser.role === 'admin' ? 'Administrator' : 'Verified Member'}
                        </p>
                        
                        <div className="bg-white/10 dark:bg-black/10 rounded-2xl p-4 w-full mb-6 border border-white/5">
                            <p className="text-gray-700 dark:text-gray-200 text-sm text-center italic leading-relaxed">
                                "{selectedUser.bio || 'This user prefers to keep their bio a mystery.'}"
                            </p>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 dark:border-gray-700 shadow-sm">
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1 text-center">Reputation</div>
                                <div className="text-xl font-bold text-gray-900 dark:text-white flex justify-center items-center">
                                    <ZapIcon className="w-5 h-5 text-orange-500 mr-2" />
                                    {selectedUser.credits}
                                </div>
                            </div>
                            <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 dark:border-gray-700 shadow-sm">
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1 text-center">Available</div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white text-center truncate" title={selectedUser.availability}>
                                    {selectedUser.availability}
                                </div>
                            </div>
                        </div>

                        <div className="w-full space-y-4 mb-8">
                            {/* Offered Section */}
                            {selectedUser.skillsOffered && selectedUser.skillsOffered.length > 0 && (
                                <div className="w-full text-left">
                                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-2 block">Teaching</span>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.filter(s => selectedUser.skillsOffered.includes(s.id)).slice(0, 4).map(skill => (
                                            <span key={skill.id} className="text-[10px] font-bold bg-green-500/10 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-lg border border-green-500/20">
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Wanted Section */}
                            {selectedUser.skillsWanted && selectedUser.skillsWanted.length > 0 && (
                                <div className="w-full text-left">
                                    <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2 block">Learning</span>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.filter(s => selectedUser.skillsWanted.includes(s.id)).slice(0, 4).map(skill => (
                                            <span key={skill.id} className="text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500/20">
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="w-full">
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-1 active:scale-95 transition-all"
                            >
                                Back to Discovery
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Skills;
