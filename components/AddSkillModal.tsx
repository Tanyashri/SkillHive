
import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';
import { SkillLevel } from '../types';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (skillData: { name: string; category: string; description: string; tags: string[]; level: SkillLevel }) => Promise<void> | void;
  availableCategories: string[];
  isSubmitting?: boolean;
}

const AddSkillModal: React.FC<AddSkillModalProps> = ({ isOpen, onClose, onAdd, availableCategories, isSubmitting = false }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || 'Technology');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [level, setLevel] = useState<SkillLevel>('Beginner');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset confirmation state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowConfirmation(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    await onAdd({
      name,
      category,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      level,
    });
    // Reset form
    setName('');
    setDescription('');
    setTags('');
    setCategory(availableCategories[0] || 'Technology');
    setLevel('Beginner');
    setShowConfirmation(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-pop-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {showConfirmation ? 'Confirm Skill Details' : 'Offer a New Skill'}
          </h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        {showConfirmation ? (
            <div className="p-6 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600 space-y-3">
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Skill Name</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</span>
                             <p className="text-sm text-gray-800 dark:text-gray-200">{category}</p>
                        </div>
                        <div>
                             <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Level</span>
                             <p className="text-sm text-gray-800 dark:text-gray-200">{level}</p>
                        </div>
                    </div>
                     <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tags</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {tags ? tags.split(',').map((t, i) => (
                                <span key={i} className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">{t.trim()}</span>
                            )) : <span className="text-xs text-gray-400 italic">None</span>}
                        </div>
                    </div>
                     <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{description}"</p>
                    </div>
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => setShowConfirmation(false)}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center shadow-md"
                    >
                         {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding...
                            </>
                         ) : 'Confirm & Add'}
                    </button>
                </div>
            </div>
        ) : (
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="skillName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skill Name</label>
                <input
                  type="text"
                  id="skillName"
                  required
                  disabled={isSubmitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                  placeholder="e.g. Advanced Python"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <input
                    type="text"
                    id="category"
                    list="category-options"
                    required
                    disabled={isSubmitting}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                    placeholder="Select or type"
                    />
                    <datalist id="category-options">
                    {availableCategories.map(cat => (
                        <option key={cat} value={cat} />
                    ))}
                    </datalist>
                </div>
                <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proficiency Level</label>
                    <select
                        id="level"
                        required
                        disabled={isSubmitting}
                        value={level}
                        onChange={(e) => setLevel(e.target.value as SkillLevel)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                    >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                    </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  id="description"
                  required
                  rows={3}
                  disabled={isSubmitting}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                  placeholder="Describe what you will teach..."
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
                <input
                  type="text"
                  id="tags"
                  disabled={isSubmitting}
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                  placeholder="coding, data, web"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                 <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Review Skill
                </button>
              </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default AddSkillModal;
