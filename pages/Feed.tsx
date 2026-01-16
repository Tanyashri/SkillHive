
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Post, User } from '../types';
import { MessageSquareIcon, ZapIcon, BotIcon, UserIcon, PlusIcon, SearchIcon } from '../components/icons';
import { getAIResponseForPost } from '../services/geminiService';

const Feed: React.FC = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostTags, setNewPostTags] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'questions' | 'tips'>('all');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [aiThinking, setAiThinking] = useState<string | null>(null); // Post ID

    const fetchData = async () => {
        setLoading(true);
        const [postsData, usersData] = await Promise.all([
            api.getFeedPosts(),
            api.getUsers()
        ]);
        setPosts(postsData);
        setUsers(usersData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getUser = (userId: string) => users.find(u => u.id === userId);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user || !newPostTitle.trim() || !newPostContent.trim()) return;

        const tags = newPostTags.split(',').map(t => t.trim()).filter(t => t);
        
        await api.createPost({
            userId: user.id,
            title: newPostTitle,
            content: newPostContent,
            tags,
            type: activeTab === 'tips' ? 'tip' : 'question'
        });

        // Reset and refresh
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostTags('');
        fetchData();
    };

    const handleLike = async (postId: string) => {
        if(!user) return;
        const updatedPost = await api.togglePostLike(postId, user.id);
        if(updatedPost) {
            setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
        }
    };

    const handleReply = async (postId: string) => {
        if(!user || !replyContent.trim()) return;
        const updatedPost = await api.addComment(postId, user.id, replyContent);
        if(updatedPost) {
            setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
            setReplyingTo(null);
            setReplyContent('');
        }
    };

    const handleAIHelp = async (post: Post) => {
        setAiThinking(post.id);
        const aiResponse = await getAIResponseForPost(post.title, post.content);
        // Add AI response as a comment from a "system" user or bot
        // For simplicity, we assume user '0' or just display distinctly
        // Here we simulate an 'AI Bot' user comment
        const aiUserMockId = 'ai-bot';
        const updatedPost = await api.addComment(post.id, aiUserMockId, `🤖 AI Suggestion: ${aiResponse}`);
        if(updatedPost) {
            setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
        }
        setAiThinking(null);
    };

    const filteredPosts = posts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || p.type === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in-up">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hive Feed</h1>
                    <p className="text-gray-500 dark:text-gray-400">Ask questions, share tips, and grow together.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                    {(['all', 'questions', 'tips'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-600 shadow text-primary-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Create Post */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Create a Post</h3>
                <form onSubmit={handleCreatePost} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Title (e.g., Best way to learn Python?)" 
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                        value={newPostTitle}
                        onChange={e => setNewPostTitle(e.target.value)}
                        required
                    />
                    <textarea 
                        placeholder="Share your thoughts or questions..." 
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none"
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                        required
                    />
                    <div className="flex justify-between items-center">
                        <input 
                            type="text" 
                            placeholder="Tags (comma separated)" 
                            className="w-1/2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                            value={newPostTags}
                            onChange={e => setNewPostTags(e.target.value)}
                        />
                        <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors shadow-lg shadow-primary-500/30 flex items-center">
                            <PlusIcon className="w-4 h-4 mr-2" /> Post
                        </button>
                    </div>
                </form>
            </div>

            {/* Feed List */}
            <div className="space-y-6">
                {filteredPosts.map((post, idx) => {
                    const author = getUser(post.userId);
                    return (
                        <div key={post.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in-up" style={{ animationDelay: `${0.2 + idx * 0.05}s` }}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <img src={author?.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{author?.name || 'Unknown'}</h4>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${post.type === 'question' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                                    {post.type}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{post.content}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                                {post.tags.map((tag, i) => (
                                    <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">#{tag}</span>
                                ))}
                            </div>

                            <div className="flex items-center space-x-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                <button 
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center text-sm font-medium transition-colors ${post.likes.includes(user?.id || '') ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                >
                                    <ZapIcon className={`w-5 h-5 mr-1 ${post.likes.includes(user?.id || '') ? 'fill-current' : ''}`} />
                                    {post.likes.length} Likes
                                </button>
                                <button 
                                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                                    className="flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
                                >
                                    <MessageSquareIcon className="w-5 h-5 mr-1" />
                                    {post.comments.length} Comments
                                </button>
                                {post.type === 'question' && (
                                    <button 
                                        onClick={() => handleAIHelp(post)}
                                        disabled={aiThinking === post.id}
                                        className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 ml-auto disabled:opacity-50"
                                    >
                                        <BotIcon className="w-5 h-5 mr-1" />
                                        {aiThinking === post.id ? 'Thinking...' : 'Ask AI'}
                                    </button>
                                )}
                            </div>

                            {/* Comments Section */}
                            {(replyingTo === post.id || post.comments.length > 0) && (
                                <div className="mt-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 space-y-4">
                                    {post.comments.map(comment => {
                                        const commenter = getUser(comment.userId);
                                        const isAi = comment.userId === 'ai-bot';
                                        return (
                                            <div key={comment.id} className="flex space-x-3">
                                                {isAi ? (
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                                        <BotIcon className="w-5 h-5" />
                                                    </div>
                                                ) : (
                                                    <img src={commenter?.avatarUrl} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                                                )}
                                                <div className="flex-1">
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm">
                                                        <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">{isAi ? 'SkillHive Bot' : commenter?.name}</p>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {replyingTo === post.id && (
                                        <div className="flex gap-2 mt-4">
                                            <input 
                                                type="text" 
                                                placeholder="Write a reply..." 
                                                className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                                value={replyContent}
                                                onChange={e => setReplyContent(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleReply(post.id)}
                                            />
                                            <button 
                                                onClick={() => handleReply(post.id)}
                                                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium"
                                            >
                                                Reply
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Feed;
