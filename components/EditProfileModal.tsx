
import React, { useState, useEffect } from 'react';
import { User, Skill, SkillLevel } from '../types';
import { XIcon, TrashIcon, PlusIcon, RefreshCwIcon } from './icons';
import { api } from '../services/api';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedData: Partial<User>) => Promise<void>;
  isSaving: boolean;
  allSkills: Skill[];
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave, isSaving, allSkills }) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState<'general' | 'skills'>('general');
  
  // New Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technology');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Beginner');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        bio: user.bio,
        availability: user.availability,
        avatarUrl: user.avatarUrl,
        password: user.password,
        skillsWanted: user.skillsWanted || [],
        skillsOffered: user.skillsOffered || [],
      });
      // Reset tab to general when opening
      setActiveTab('general');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleToggleWantedSkill = (skillId: string) => {
      setFormData(prev => {
          const currentWanted = prev.skillsWanted || [];
          if (currentWanted.includes(skillId)) {
              return { ...prev, skillsWanted: currentWanted.filter(id => id !== skillId) };
          } else {
              return { ...prev, skillsWanted: [...currentWanted, skillId] };
          }
      });
  };

  const handleDeleteOfferedSkill = async (skillId: string) => {
      if(window.confirm("Are you sure you want to stop offering this skill? This will delete the skill listing.")) {
          await api.deleteSkill(skillId);
          // Update local state
          setFormData(prev => ({
              ...prev,
              skillsOffered: (prev.skillsOffered || []).filter(id => id !== skillId)
          }));
      }
  };

  const handleAddOfferedSkill = async () => {
      if (!newSkillName.trim()) return;
      setIsAddingSkill(true);
      try {
          const newSkill = await api.addSkill({
              name: newSkillName,
              category: newSkillCategory,
              level: newSkillLevel,
              description: newSkillDesc || `I can teach ${newSkillName} at a ${newSkillLevel} level.`,
              ownerId: user.id,
              tags: [newSkillCategory.toLowerCase()]
          });
          
          if (newSkill) {
              setFormData(prev => ({
                  ...prev,
                  skillsOffered: [...(prev.skillsOffered || []), newSkill.id]
              }));
              // Reset form
              setNewSkillName('');
              setNewSkillDesc('');
              setNewSkillLevel('Beginner');
          }
      } catch (error) {
          console.error("Failed to add skill", error);
      } finally {
          setIsAddingSkill(false);
      }
  };

  const handleRandomizeAvatar = () => {
      const randomSeed = Math.random().toString(36).substring(7);
      const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
      setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
  };

  const userOfferedSkills = allSkills.filter(s => formData.skillsOffered?.includes(s.id));
  const otherSkills = allSkills.filter(s => s.ownerId !== user.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl animate-pop-in overflow-hidden border border-white/20 dark:border-gray-700 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Your Profile</h2>
          <button onClick={onClose} disabled={isSaving} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
            <XIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button 
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'general' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50 dark:bg-primary-900/10' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
                General Info
            </button>
            <button 
                onClick={() => setActiveTab('skills')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'skills' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50 dark:bg-primary-900/10' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
                Manage Skills
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' ? (
                 <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input
                            type="text"
                            id="name"
                            required
                            disabled={isSaving}
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                            type="email"
                            id="email"
                            required
                            disabled={isSaving}
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input
                        type="password"
                        id="password"
                        disabled={isSaving}
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 transition-all"
                        placeholder="Leave blank to keep current password"
                        />
                    </div>

                    <div>
                        <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar</label>
                        <div className="flex items-center space-x-3">
                             <img src={formData.avatarUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-100 dark:ring-primary-900" />
                             <div className="flex-1 flex space-x-2">
                                 <input
                                    type="text"
                                    id="avatarUrl"
                                    required
                                    disabled={isSaving}
                                    value={formData.avatarUrl || ''}
                                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 transition-all text-sm"
                                    placeholder="Avatar URL"
                                 />
                                 <button
                                    type="button"
                                    onClick={handleRandomizeAvatar}
                                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors text-gray-600 dark:text-gray-300"
                                    title="Generate Random Avatar"
                                 >
                                    <RefreshCwIcon className="w-5 h-5" />
                                 </button>
                             </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter a URL or click the button to generate a random avatar.</p>
                    </div>

                    <div>
                        <label htmlFor="availability" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability</label>
                        <input
                        type="text"
                        id="availability"
                        required
                        disabled={isSaving}
                        value={formData.availability || ''}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 transition-all"
                        placeholder="e.g. Mon-Fri 6pm-9pm"
                        />
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                        <textarea
                        id="bio"
                        rows={4}
                        disabled={isSaving}
                        value={formData.bio || ''}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 transition-all resize-none"
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                     {/* Skills Offered Section */}
                     <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center">
                            <span className="w-2 h-6 bg-green-500 rounded-full mr-2"></span>
                            Skills You Offer
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                             <div className="flex flex-wrap gap-2 mb-4">
                                {userOfferedSkills.length > 0 ? userOfferedSkills.map(skill => (
                                    <div key={skill.id} className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-full shadow-sm">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{skill.name}</span>
                                        <button 
                                            onClick={() => handleDeleteOfferedSkill(skill.id)}
                                            className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Stop offering this skill"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )) : <p className="text-sm text-gray-500 italic">You haven't offered any skills yet.</p>}
                             </div>
                             
                             {/* Add New Skill Mini Form */}
                             <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                 <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Add a new skill to offer:</h4>
                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                     <input 
                                        type="text" 
                                        placeholder="Skill Name (e.g. Photoshop)" 
                                        value={newSkillName}
                                        onChange={(e) => setNewSkillName(e.target.value)}
                                        className="col-span-1 sm:col-span-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-white"
                                     />
                                     <select
                                        value={newSkillLevel}
                                        onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-white"
                                     >
                                         <option value="Beginner">Beginner</option>
                                         <option value="Intermediate">Intermediate</option>
                                         <option value="Advanced">Advanced</option>
                                         <option value="Expert">Expert</option>
                                     </select>
                                 </div>
                                 <button 
                                    onClick={handleAddOfferedSkill}
                                    disabled={!newSkillName.trim() || isAddingSkill}
                                    className="mt-3 w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                                 >
                                     <PlusIcon className="w-4 h-4 mr-1" />
                                     {isAddingSkill ? 'Adding...' : 'Add Skill'}
                                 </button>
                             </div>
                        </div>
                     </div>

                     {/* Skills Wanted Section */}
                     <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center">
                            <span className="w-2 h-6 bg-purple-500 rounded-full mr-2"></span>
                            Skills You Want to Learn
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Select skills you are interested in learning from the community.</p>
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {otherSkills.map(skill => (
                                    <label key={skill.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${formData.skillsWanted?.includes(skill.id) ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="form-checkbox h-4 w-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                            checked={formData.skillsWanted?.includes(skill.id) || false}
                                            onChange={() => handleToggleWantedSkill(skill.id)}
                                        />
                                        <div className="ml-3 flex flex-col min-w-0">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{skill.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{skill.category} • {skill.level}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                     </div>
                </div>
            )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end space-x-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/30 flex items-center"
            >
               {isSaving ? (
                 <>
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Saving...
                 </>
               ) : 'Save Changes'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
