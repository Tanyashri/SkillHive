
import React from 'react';
import { Link } from 'react-router-dom';
import { GithubIcon, LinkedinIcon, ZapIcon } from '../components/icons';
import AnimatedBackground from '../components/AnimatedBackground';
import RevealOnScroll from '../components/RevealOnScroll';

const About: React.FC = () => {
    const developers = [
        {
            name: "Tanyashri M",
            role: "Core Developer, AI Specialist & Lead",
            description: "Spearheaded the project's architecture, integrated complex AI logic, and led the team towards a successful launch.",
            github: "#",
            linkedin: "#"
        },
        {
            name: "Syeda Inshiraah",
            role: "UI/UX Designer",
            description: "Designed the intuitive glassmorphism interface and crafted the user experience for a seamless and beautiful journey.",
            github: "#",
            linkedin: "#"
        },
        {
            name: "Lekhana Gowda D",
            role: "Application Manager",
            description: "Managed the application lifecycle, oversaw project timelines, and ensured all features aligned with the core vision.",
            github: "#",
            linkedin: "#"
        },
        {
            name: "Thushar S B",
            role: "Researcher",
            description: "Conducted in-depth research on peer-to-peer learning models and gamification strategies to drive user engagement.",
            github: "#",
            linkedin: "#"
        }
    ];

    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-200 relative selection:bg-primary-500 selection:text-white overflow-hidden font-sans">
            <AnimatedBackground />

            {/* Header / Nav */}
            <header className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-transform duration-200">
                    SkillHive
                </Link>
                <Link to="/" className="px-5 py-2.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl text-sm font-semibold hover:bg-white dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md">
                    &larr; Back to Home
                </Link>
            </header>

            <main className="relative z-10 px-4 py-12">
                <div className="max-w-6xl mx-auto space-y-12 pb-12">
                    {/* Hero Section */}
                    <RevealOnScroll>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center p-3 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full mb-6 shadow-inner">
                                <ZapIcon className="w-6 h-6 mr-2" />
                                <span className="font-bold tracking-wide uppercase text-sm">Our Mission</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
                                    Building the Future
                                </span>
                                <br />
                                <span className="text-gray-900 dark:text-white">of Peer Learning</span>
                            </h1>
                            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                SkillHive was built with a singular vision: to democratize education by connecting learners and teachers directly. 
                                We believe that everyone has something to teach, and everyone has something to learn.
                            </p>
                        </div>
                    </RevealOnScroll>

                    {/* Developers Grid */}
                    <RevealOnScroll delay={0.2}>
                        <div>
                            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">Meet the Team</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {developers.map((dev, index) => (
                                    <div 
                                        key={index}
                                        className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center h-full"
                                    >
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{dev.name}</h3>
                                        <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-4 uppercase tracking-wider">{dev.role}</div>
                                        
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed flex-grow">
                                            {dev.description}
                                        </p>
                                        
                                        <div className="flex space-x-4 mt-auto">
                                            <a href={dev.github} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                                                <GithubIcon className="w-5 h-5" />
                                            </a>
                                            <a href={dev.linkedin} className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                                                <LinkedinIcon className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </RevealOnScroll>

                    {/* Tech Stack Summary */}
                    <RevealOnScroll delay={0.4}>
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6">Powered By</h3>
                            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-gray-300 font-semibold">
                                <span className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">React 19</span>
                                <span className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">TypeScript</span>
                                <span className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">Tailwind CSS</span>
                                <span className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">Google Gemini AI</span>
                                <span className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">Supabase</span>
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>
            </main>
        </div>
    );
};

export default About;
