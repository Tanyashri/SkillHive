
import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { ShieldIcon } from '../components/icons';
import RevealOnScroll from '../components/RevealOnScroll';

const Privacy: React.FC = () => {
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
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl mr-4">
                            <ShieldIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Privacy Policy</h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed space-y-6">
                        <p className="font-medium text-lg">Last Updated: October 2024</p>
                        
                        <p>
                            At SkillHive, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website or use our application.
                        </p>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">1. Information We Collect</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and biographical data that you voluntarily give to us when you register.</li>
                            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, browser type, and operating system.</li>
                            <li><strong>Skill Data:</strong> Information about the skills you offer and wish to learn, which allows our AI algorithms to match you with peers.</li>
                        </ul>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">2. Use of Your Information</h3>
                        <p>
                            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we use information collected about you via the Site to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Create and manage your account.</li>
                            <li>Email you regarding your account or order.</li>
                            <li>Enable user-to-user communications.</li>
                            <li>Generate personalized AI recommendations for learning paths and peer matches.</li>
                            <li>Monitor and analyze usage and trends to improve your experience.</li>
                        </ul>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">3. Disclosure of Your Information</h3>
                        <p>
                            We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
                        </p>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">4. Security of Your Information</h3>
                        <p>
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </p>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">5. Contact Us</h3>
                        <p>
                            If you have questions or comments about this Privacy Policy, please contact us at: <br/>
                            <a href="mailto:support@skillhive.com" className="text-primary-600 hover:underline">support@skillhive.com</a>
                        </p>
                    </div>
                </div>
            </RevealOnScroll>

        </div>
      </main>
    </div>
  );
};

export default Privacy;
