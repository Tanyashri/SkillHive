
import React, { useState } from 'react';
import { getAIRoadmap } from '../services/geminiService';
import { AiRoadmap, AiRoadmapStep, AiResource } from '../types';
import { TrendingUpIcon, MapIcon, ListIcon, YoutubeIcon, FileTextIcon, BookOpenIcon, LinkIcon } from '../components/icons';

const SkillUp: React.FC = () => {
    const [skillName, setSkillName] = useState('');
    const [roadmap, setRoadmap] = useState<AiRoadmap | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'timeline' | 'mindmap'>('timeline');

    const handleGenerateRoadmap = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!skillName.trim()) {
            setError('Please enter a skill name.');
            return;
        }

        setLoading(true);
        setError(null);
        setRoadmap(null);
        try {
            const result = await getAIRoadmap(skillName);
            setRoadmap(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const RoadmapSkeleton: React.FC = () => (
        <div className="mt-8 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-6"></div>
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    const ResourceCard: React.FC<{ resource: AiResource }> = ({ resource }) => {
        const getIcon = () => {
            switch(resource.type) {
                case 'video': return <YoutubeIcon className="w-5 h-5 text-red-500" />;
                case 'article': return <FileTextIcon className="w-5 h-5 text-blue-500" />;
                case 'book': return <BookOpenIcon className="w-5 h-5 text-yellow-600" />;
                default: return <LinkIcon className="w-5 h-5 text-gray-500" />;
            }
        };

        return (
            <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-primary-400 transition-all duration-200 group"
            >
                <div className="mr-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-full group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{resource.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize flex items-center">
                        {resource.type} 
                        <span className="mx-1">•</span> 
                        <span className="text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">Open Link &rarr;</span>
                    </p>
                </div>
            </a>
        );
    };

    const TimelineView: React.FC<{ steps: AiRoadmapStep[] }> = ({ steps }) => (
        <div className="relative mt-8 space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent dark:before:via-gray-600">
            {steps.map((step, index) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-800 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">
                        {index + 1}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-2xl text-gray-900 dark:text-white">{step.title}</h3>
                             <span className="text-sm font-semibold px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full whitespace-nowrap">
                                {step.duration}
                             </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg leading-relaxed">{step.description}</p>
                        
                        {step.topics && step.topics.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {step.topics.map(topic => (
                                    <span key={topic} className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">
                                        #{topic}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Recommended Resources</h4>
                            {step.resources.map((res, i) => (
                                <ResourceCard key={i} resource={res} />
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const MindMapView: React.FC<{ steps: AiRoadmapStep[], title: string }> = ({ steps, title }) => (
        <div className="mt-12 overflow-x-auto pb-12 custom-scrollbar">
            <div className="min-w-[800px] flex flex-col items-center">
                {/* Central Node */}
                <div className="relative z-10 p-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full shadow-xl shadow-cyan-500/20 text-center w-64 border-4 border-white dark:border-gray-800 mb-12 animate-pop-in">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <p className="text-sm text-white/80 mt-1">Learning Path</p>
                    <div className="absolute top-full left-1/2 w-0.5 h-12 bg-gray-300 dark:bg-gray-600 -translate-x-1/2"></div>
                </div>

                {/* Steps Tree */}
                <div className="flex justify-center gap-8 w-full relative">
                    {/* Horizontal Connector Line */}
                     <div className="absolute top-0 left-12 right-12 h-0.5 bg-gray-300 dark:bg-gray-600 -translate-y-px"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center relative w-64 animate-fade-in-up" style={{ animationDelay: `${index * 0.15}s` }}>
                            {/* Vertical Connector */}
                            <div className="h-8 w-0.5 bg-gray-300 dark:bg-gray-600 absolute -top-12"></div>
                            
                            {/* Step Node */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-t-4 border-primary-500 shadow-md w-full relative z-10">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 text-sm font-bold px-2 py-0.5 rounded-full border border-white dark:border-gray-700 shadow-sm">
                                    Step {step.step}
                                </div>
                                <h3 className="font-bold text-center mt-2 text-lg text-gray-800 dark:text-white mb-1">{step.title}</h3>
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-3">{step.duration}</p>
                                
                                {/* Mind Map Topics */}
                                <div className="space-y-1.5">
                                    {step.topics.map((topic, i) => (
                                        <div key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mr-2"></div>
                                            {topic}
                                        </div>
                                    ))}
                                </div>

                                {/* Resource Preview (Collapsed) */}
                                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-center text-gray-400">
                                        {step.resources.length} Resources Available
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <p className="text-center mt-8 text-base text-gray-500 italic">
                    * Switch to List View to access detailed resource links.
                </p>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-8 animate-fade-in-up">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <TrendingUpIcon className="w-64 h-64" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4">AI SkillUp Roadmap</h1>
                    <p className="text-lg text-white/90 mb-8">
                        Enter a skill you want to master, and we'll generate a personalized, step-by-step curriculum with timeline estimates and curated learning resources.
                    </p>
                    
                    <form onSubmit={handleGenerateRoadmap} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={skillName}
                            onChange={(e) => setSkillName(e.target.value)}
                            placeholder="e.g., Python for Data Science, Digital Marketing..."
                            className="flex-grow w-full px-6 py-4 rounded-xl text-gray-900 border-0 focus:ring-4 focus:ring-cyan-300 shadow-lg placeholder-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            {loading ? (
                                <>
                                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                   Generating...
                                </>
                            ) : (
                                <>
                                    <TrendingUpIcon className="w-5 h-5 mr-2" />
                                    Generate
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
            
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-r-lg shadow-sm mb-8 animate-pop-in" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {loading && <RoadmapSkeleton />}

            {roadmap && (
                <div className="animate-fade-in-up">
                     <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                         <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                <span className="bg-primary-100 text-primary-600 p-2 rounded-lg mr-3">
                                    <MapIcon className="w-6 h-6" />
                                </span>
                                {roadmap.skill} Roadmap
                            </h2>
                            <p className="text-lg text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">{roadmap.overview}</p>
                         </div>

                         {/* View Toggles */}
                         <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl mt-4 md:mt-0">
                             <button 
                                onClick={() => setViewMode('timeline')}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    viewMode === 'timeline' 
                                    ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                             >
                                 <ListIcon className="w-4 h-4 mr-2" />
                                 Timeline
                             </button>
                             <button 
                                onClick={() => setViewMode('mindmap')}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    viewMode === 'mindmap' 
                                    ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                             >
                                 <MapIcon className="w-4 h-4 mr-2" />
                                 Mind Map
                             </button>
                         </div>
                     </div>

                    {viewMode === 'timeline' ? (
                        <TimelineView steps={roadmap.steps} />
                    ) : (
                        <MindMapView steps={roadmap.steps} title={roadmap.skill} />
                    )}
                </div>
            )}
        </div>
    );
};

export default SkillUp;
    