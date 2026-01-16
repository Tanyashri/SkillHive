
import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { BookOpenIcon, CalendarIcon, UserIcon } from '../components/icons';
import RevealOnScroll from '../components/RevealOnScroll';

const Blog: React.FC = () => {
  const posts = [
    {
      id: 1,
      title: "The Art of Micro-Learning: Mastering Skills in 15 Minutes a Day",
      excerpt: "You don't need hours of free time to learn something new. Discover how micro-learning techniques can help you pick up coding, languages, or design during your coffee breaks.",
      author: "Tanyashri M",
      date: "Oct 12, 2024",
      category: "Learning Strategies",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      title: "Why Peer-to-Peer Mentorship is More Effective Than Online Courses",
      excerpt: "Online courses are great, but they lack the human connection. Learn why direct feedback and accountability from a peer mentor can accelerate your growth by 300%.",
      author: "Syeda Inshiraah",
      date: "Sep 28, 2024",
      category: "Community",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      title: "5 Soft Skills Every Developer Needs in 2025",
      excerpt: "Code is important, but communication is king. We explore the top soft skills that tech giants are looking for in senior engineering roles today.",
      author: "Thushar S B",
      date: "Sep 15, 2024",
      category: "Career Growth",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 relative selection:bg-primary-500 selection:text-white overflow-hidden font-sans">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-transform duration-200">
          SkillHive
        </Link>
        <Link to="/" className="px-5 py-2.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl text-sm font-semibold hover:bg-white dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md">
          &larr; Back to Home
        </Link>
      </header>

      <main className="relative z-10 px-4 py-12">
        <div className="max-w-6xl mx-auto pb-12">
          
          <RevealOnScroll>
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Hive Mind</span> Blog
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Insights, tutorials, and stories from the SkillHive community to help you learn faster and teach better.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <RevealOnScroll key={post.id} delay={index * 0.1}>
                <article 
                  className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="h-48 overflow-hidden relative">
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                     <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                     />
                     <div className="absolute top-4 left-4 z-20">
                       <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-xs font-bold uppercase tracking-wider rounded-full text-primary-600 dark:text-primary-400">
                         {post.category}
                       </span>
                     </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 space-x-4">
                      <span className="flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {post.date}
                      </span>
                      <span className="flex items-center">
                        <UserIcon className="w-3 h-3 mr-1" />
                        {post.author}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 flex-grow">
                      {post.excerpt}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors flex items-center group-hover:translate-x-1 duration-300">
                        Read Article &rarr;
                      </button>
                    </div>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll delay={0.3}>
            <div className="mt-16 text-center">
               <div className="inline-block p-8 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-xl text-white max-w-2xl mx-auto">
                  <BookOpenIcon className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
                  <h3 className="text-2xl font-bold mb-2">Want to contribute?</h3>
                  <p className="text-gray-300 mb-6">
                    We are always looking for guest writers from our community. Share your expertise and earn extra credits!
                  </p>
                  <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors shadow-lg">
                    Submit a Draft
                  </button>
               </div>
            </div>
          </RevealOnScroll>

        </div>
      </main>
    </div>
  );
};

export default Blog;
