
import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { FileTextIcon } from '../components/icons';
import RevealOnScroll from '../components/RevealOnScroll';

const Terms: React.FC = () => {
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
        <div className="max-w-4xl mx-auto pb-12">
            
            <RevealOnScroll>
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700 p-8 md:p-12 rounded-3xl shadow-2xl">
                    <div className="flex items-center mb-8">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mr-4">
                            <FileTextIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Terms of Service</h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed space-y-6">
                        <p className="font-medium text-lg">Last Updated: October 2024</p>
                        
                        <p>
                            Welcome to SkillHive. By accessing or using our website and services, you agree to be bound by these Terms of Service. If you do not agree to abide by the terms of this Agreement, you are not authorized to use or access the Website.
                        </p>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">1. Acceptance of Terms</h3>
                        <p>
                            The Service is offered subject to your acceptance without modification of all of the terms and conditions contained herein and all other operating rules, policies, and procedures that may be published from time to time on this Site by SkillHive.
                        </p>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">2. User Accounts</h3>
                        <p>
                            To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.
                        </p>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">3. Code of Conduct</h3>
                        <p>
                            SkillHive is a community built on trust and respect. You agree not to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Harass, abuse, or harm another person.</li>
                            <li>Use the Service for any illegal purpose.</li>
                            <li>Impersonate any person or entity.</li>
                            <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
                        </ul>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">4. Intellectual Property</h3>
                        <p>
                            The Service and its original content, features, and functionality are and will remain the exclusive property of SkillHive and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                        </p>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">5. Termination</h3>
                        <p>
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                        </p>
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">6. Changes to Terms</h3>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
                        </p>
                    </div>
                </div>
            </RevealOnScroll>

        </div>
      </main>
    </div>
  );
};

export default Terms;
