
import React, { useEffect, useRef, useState } from 'react';

const FluidCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Refs for positions to avoid state re-renders on every frame
  const mouse = useRef({ x: 0, y: 0 });
  const follower = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      if (!isVisible) setIsVisible(true);

      // Optimized clickable check
      const target = e.target as HTMLElement;
      const isClickable = target.closest('a, button, input, textarea, [role="button"], .clickable');
      setIsHovering(!!isClickable);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (cursorRef.current && followerRef.current) {
        // 1. Move small cursor instantly
        cursorRef.current.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0)`;

        // 2. Physics for follower (Lerp for fluid delay)
        const friction = 0.12; // Smoother catchup
        
        follower.current.x += (mouse.current.x - follower.current.x) * friction;
        follower.current.y += (mouse.current.y - follower.current.y) * friction;

        followerRef.current.style.transform = `translate3d(${follower.current.x}px, ${follower.current.y}px, 0)`;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Don't render on touch devices
  if (typeof navigator !== 'undefined' &&  (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
      return null;
  }

  return (
    <>
      <div 
        ref={cursorRef}
        className={`fixed top-0 left-0 w-2 h-2 bg-cyan-500 rounded-full z-[9999] pointer-events-none mix-blend-difference transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} -mt-1 -ml-1 will-change-transform`}
      />

      <div 
        ref={followerRef}
        className={`fixed top-0 left-0 z-[9998] pointer-events-none transition-all duration-500 ease-out will-change-transform -mt-6 -ml-6 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div 
            className={`
                relative rounded-full transition-all duration-300 ease-out
                ${isHovering ? 'w-20 h-20 bg-cyan-400/20 border-cyan-300/30 -mt-4 -ml-4' : 'w-12 h-12 bg-white/10 border-white/20'}
                backdrop-blur-[2px] border shadow-sm
            `}
        ></div>
      </div>
    </>
  );
};

export default FluidCursor;
