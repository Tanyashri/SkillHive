
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpenIcon, ZapIcon, UserPlusIcon } from '../components/icons';
import { SKILLS } from '../constants';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';
import IntroAnimation from '../components/IntroAnimation';
import RevealOnScroll from '../components/RevealOnScroll';
import LogoLoop from '../components/LogoLoop';

const Landing: React.FC = () => {
  const { user } = useAuth();
  // If user is already logged in, we skip the splash animation for a faster experience
  const [showIntro, setShowIntro] = useState(!user);
  const featuredSkills = SKILLS.slice(0, 4);
  
  // Animation State for "How It Works"
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const howItWorksRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Only set up observer if intro is finished and ref exists
    if (showIntro) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHowItWorksVisible(true);
          observer.disconnect(); // Trigger only once
        }
      },
      { threshold: 0.1 } 
    );

    const timer = setTimeout(() => {
        if (howItWorksRef.current) {
            observer.observe(howItWorksRef.current);
        }
    }, 100);
    
    return () => {
        observer.disconnect();
        clearTimeout(timer);
    };
  }, [showIntro]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 relative selection:bg-primary-500 selection:text-white overflow-hidden">
      
      {/* GLOBAL ANIMATED BACKGROUND */}
      <AnimatedBackground />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 transition-all animate-fade-in-up" style={{ animationDuration: '0.4s' }}>
        <div className="container mx-auto flex h-16 md:h-20 items-center justify-between">
          <Link to="/" className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-transform duration-300">SkillHive</Link>
          <div className="flex items-center space-x-2 md:space-x-4">
            <nav className="hidden md:flex items-center space-x-8">
              <a 
                href="#features" 
                onClick={(e) => scrollToSection(e, 'features')}
                className="text-sm font-medium hover:text-primary-500 transition-colors relative group"
              >
                Features
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </a>
              <a 
                href="#how-it-works" 
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="text-sm font-medium hover:text-primary-500 transition-colors relative group"
              >
                How It Works
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </a>
            </nav>
            <ThemeToggle />
            {user ? (
                <Link to="/" className="px-4 py-2 text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl shadow-lg hover:from-primary-700 hover:to-primary-600 transform hover:-translate-y-1 transition-all duration-300">
                  Dashboard
                </Link>
            ) : (
                <Link to="/login" className="px-4 py-2 text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl shadow-lg hover:from-primary-700 hover:to-primary-600 transform hover:-translate-y-1 transition-all duration-300">
                  Get Started
                </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-32 bg-transparent">
          <div className="container mx-auto px-4 text-center">
            <RevealOnScroll>
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs md:text-sm font-semibold tracking-wide">
                🚀 The Future of Learning
              </div>
            </RevealOnScroll>
            
            <RevealOnScroll delay={0.1}>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl mb-6 leading-tight">
                <span className="block text-gray-900 dark:text-white drop-shadow-sm">Learn a Skill.</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Share a Passion.</span>
              </h2>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <p className="mt-4 md:mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300 px-4">
                Join a vibrant community of learners and teachers. SkillHive is the premier peer-to-peer platform where knowledge is the only currency you need.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.3}>
              <div className="mt-8 md:mt-10 flex flex-col sm:flex-row justify-center gap-4 px-8">
                {user ? (
                    <Link to="/" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-primary-600 rounded-xl shadow-xl hover:bg-primary-700 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group text-center">
                        <span className="relative z-10">Go to my Dashboard</span>
                        <div className="absolute inset-0 bg-white/20 transform -translate-x-full skew-x-12 group-hover:animate-shine"></div>
                    </Link>
                ) : (
                    <Link to="/signup" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-primary-600 rounded-xl shadow-xl hover:bg-primary-700 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group text-center">
                        <span className="relative z-10">Join for Free</span>
                        <div className="absolute inset-0 bg-white/20 transform -translate-x-full skew-x-12 group-hover:animate-shine"></div>
                    </Link>
                )}
                <a 
                  href="#features" 
                  onClick={(e) => scrollToSection(e, 'features')}
                  className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-gray-700 dark:text-white bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:bg-white dark:hover:bg-gray-800 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg text-center"
                >
                  Explore Skills
                </a>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" ref={howItWorksRef} className="relative py-16 md:py-24 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm border-y border-white/20 dark:border-gray-800/20 overflow-hidden">
          <div className="container mx-auto px-4">
            <RevealOnScroll>
              <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">How It Works</h3>
                <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-400">Get started in three simple steps and unlock your potential.</p>
              </div>
            </RevealOnScroll>
            
            <div className="grid gap-8 md:gap-10 md:grid-cols-3">
              <div 
                className={`transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
                    howItWorksVisible 
                    ? 'opacity-100 translate-x-0 scale-100' 
                    : 'opacity-0 translate-y-10 md:translate-y-0 md:translate-x-[120%] scale-75'
                }`}
              >
                  <div className="h-full text-center p-6 md:p-8 rounded-3xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md hover:bg-white/90 dark:hover:bg-gray-800/90 shadow-lg hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-white/50 dark:border-gray-700/50 group cursor-default">
                    <div className="flex items-center justify-center h-16 w-16 mx-auto bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 rounded-2xl mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                      <UserPlusIcon className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Create Profile</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Sign up and showcase your talents. Tell the community what you can teach and what you're eager to learn.
                    </p>
                  </div>
              </div>

              <div 
                className={`transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-100 transform ${
                    howItWorksVisible 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-50'
                }`}
              >
                  <div className="h-full text-center p-6 md:p-8 rounded-3xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md hover:bg-white/90 dark:hover:bg-gray-800/90 shadow-lg hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-white/50 dark:border-gray-700/50 group cursor-default">
                    <div className="flex items-center justify-center h-16 w-16 mx-auto bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl mb-6 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-inner">
                      <ZapIcon className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Find a Match</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Our AI-powered matching system connects you with the perfect learning partners based on your goals.
                    </p>
                  </div>
              </div>

              <div 
                className={`transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-200 transform ${
                    howItWorksVisible 
                    ? 'opacity-100 translate-x-0 scale-100' 
                    : 'opacity-0 translate-y-10 md:translate-y-0 md:-translate-x-[120%] scale-75'
                }`}
              >
                  <div className="h-full text-center p-6 md:p-8 rounded-3xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md hover:bg-white/90 dark:hover:bg-gray-800/90 shadow-lg hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-white/50 dark:border-gray-700/50 group cursor-default">
                    <div className="flex items-center justify-center h-16 w-16 mx-auto bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                      <BookOpenIcon className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Learn & Grow</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Connect, schedule sessions, and start exchanging wisdom. Expand your horizons one skill at a time.
                    </p>
                  </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOGO LOOP SECTION */}
        <LogoLoop />

        {/* Featured Skills Section */}
        <section id="features" className="py-16 md:py-24 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm relative">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] opacity-20 -z-10"></div>
          
          <div className="container mx-auto px-4">
            <RevealOnScroll>
              <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Featured Skills</h3>
                <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-400">Explore some of the popular skills being exchanged right now.</p>
              </div>
            </RevealOnScroll>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredSkills.map((skill, index) => (
                <RevealOnScroll key={skill.id} delay={index * 0.1} className="h-full">
                  <div className="group h-72 [perspective:1000px]">
                    <div className="relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-sm group-hover:shadow-2xl rounded-2xl">
                      
                      {/* Front Side */}
                      <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                        
                        <div>
                            <div className="h-1.5 w-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-6"></div>
                            <span className="inline-block px-2.5 py-1 mb-3 text-xs font-bold tracking-wide text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg uppercase">
                                {skill.category}
                            </span>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{skill.name}</h4>
                        </div>
                        
                        <div className="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            <span className="mr-2">Learn More</span>
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                      </div>

                      {/* Back Side */}
                      <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-inner border border-white/10">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                          <h4 className="text-xl font-bold mb-4">{skill.name}</h4>
                          <p className="text-sm leading-relaxed opacity-95 mb-6 line-clamp-5">{skill.description}</p>
                          
                          <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider">
                              Level: {skill.level}
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 relative z-10">
        <div className="container mx-auto py-10 px-4 text-center">
            <h2 className="text-2xl font-bold text-primary-600 mb-4">SkillHive</h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8">
                <Link to="/about" className="text-gray-400 hover:text-gray-500 transition-colors hover:underline decoration-primary-500 decoration-2 underline-offset-4">About</Link>
                <Link to="/blog" className="text-gray-400 hover:text-gray-500 transition-colors hover:underline decoration-primary-500 decoration-2 underline-offset-4">Blog</Link>
                <Link to="/privacy" className="text-gray-400 hover:text-gray-500 transition-colors hover:underline decoration-primary-500 decoration-2 underline-offset-4">Privacy</Link>
                <Link to="/terms" className="text-gray-400 hover:text-gray-500 transition-colors hover:underline decoration-primary-500 decoration-2 underline-offset-4">Terms</Link>
            </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} SkillHive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
