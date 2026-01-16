
import React from 'react';

// Simple SVG Icons for the loop
const ReactLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 text-cyan-500">
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3z" stroke="currentColor" strokeWidth="1" />
    <path d="M15.89 18.36c.86.86-1.5 3.54-5.89 1.41-4.39-2.13-5.39-6.25-4.53-7.11.86-.86 1.5-3.54 5.89-1.41 4.39 2.13 5.39 6.25 4.53 7.11z" stroke="currentColor" strokeWidth="1" />
    <path d="M15.89 5.64c.86-.86 3.54 1.5 1.41 5.89-2.13 4.39-6.25 5.39-7.11 4.53-.86-.86-3.54-1.5-1.41-5.89 2.13-4.39 6.25-5.39 7.11-4.53z" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const TSLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 text-blue-600">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.2" />
    <path d="M7 9h6v9m-3-9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 14.5a2.5 2.5 0 0 1 3 0c.5.5.5 1.5 0 2s-2.5 1-2.5 1-2 .5-2-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TailwindLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 text-sky-400">
    <path d="M7 15c-3 0-4-2-3-4s2-3 4-3c1 0 1.5.5 2 1s2 1 3 1c2 0 3-2 2-4m-6 4c-3 0-4-2-3-4s2-3 4-3c1 0 1.5.5 2 1s2 1 3 1c2 0 3-2 2-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const GoogleGeminiLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 text-blue-400">
    <path d="M12 2l2.5 8.5L23 13l-8.5 2.5L12 24l-2.5-8.5L1 13l8.5-2.5L12 2z" fill="currentColor" />
  </svg>
);

const SupabaseLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 text-green-500">
    <path d="M13 2L4 13h7v9l9-11h-7V2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const NodeLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 text-green-600">
    <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

const GithubLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 text-gray-800 dark:text-white">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VercelLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 text-black dark:text-white">
    <path d="M12 2L22 20H2L12 2Z" fill="currentColor" />
  </svg>
);

const logos = [
  { name: 'React', Icon: ReactLogo },
  { name: 'TypeScript', Icon: TSLogo },
  { name: 'Tailwind CSS', Icon: TailwindLogo },
  { name: 'Gemini AI', Icon: GoogleGeminiLogo },
  { name: 'Supabase', Icon: SupabaseLogo },
  { name: 'Node.js', Icon: NodeLogo },
  { name: 'GitHub', Icon: GithubLogo },
  { name: 'Vercel', Icon: VercelLogo },
];

const LogoLoop: React.FC = () => {
  return (
    <section className="py-10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-y border-white/20 dark:border-gray-800/20 overflow-hidden">
      <div className="container mx-auto px-4 mb-8 text-center">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Powered by Modern Tech</p>
      </div>
      
      <div 
        className="flex overflow-hidden relative w-full"
        style={{
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
        }}
      >
        <div className="flex w-full overflow-hidden">
             {/* First Loop */}
             <div className="flex shrink-0 animate-marquee items-center justify-around gap-16 min-w-full px-8">
               {logos.map((logo, idx) => (
                 <div key={`${logo.name}-1-${idx}`} className="flex items-center space-x-3 group cursor-default grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300">
                    <logo.Icon />
                    <span className="font-bold text-lg text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{logo.name}</span>
                 </div>
               ))}
             </div>
             {/* Second Loop (Duplicate for seamless effect) */}
             <div className="flex shrink-0 animate-marquee items-center justify-around gap-16 min-w-full px-8" aria-hidden="true">
               {logos.map((logo, idx) => (
                 <div key={`${logo.name}-2-${idx}`} className="flex items-center space-x-3 group cursor-default grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300">
                    <logo.Icon />
                    <span className="font-bold text-lg text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{logo.name}</span>
                 </div>
               ))}
             </div>
        </div>
      </div>
    </section>
  );
};

export default LogoLoop;
