
import React, { useEffect, useState } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'dropping' | 'zooming'>('dropping');
  const text = "SkillHive";
  const letters = text.split("");

  useEffect(() => {
    // Stage 1: Dropping finishes roughly after 1.5s (max delay + animation duration)
    const dropTimer = setTimeout(() => {
      setStage('zooming');
    }, 1800);

    // Stage 2: Zooming finishes after 0.8s
    const zoomTimer = setTimeout(() => {
      onComplete();
    }, 2600); // 1.8s + 0.8s

    return () => {
      clearTimeout(dropTimer);
      clearTimeout(zoomTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-gray-900 overflow-hidden">
      <div 
        className={`relative flex items-center justify-center ${stage === 'zooming' ? 'animate-zoom-out' : ''}`}
      >
        {letters.map((letter, index) => (
          <span
            key={index}
            className="text-6xl md:text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 inline-block opacity-0 animate-drop-in"
            style={{ 
              animationDelay: `${index * 0.1}s`,
              textShadow: '0 4px 10px rgba(0,0,0,0.1)' // Subtle shadow
            }}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
};

export default IntroAnimation;
