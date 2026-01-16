
import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Config: Reduced counts for better performance
    const particleCount = Math.min(Math.floor((width * height) / 20000), 60); 
    const connectionDistance = 150;
    const mouseDistance = 200;
    
    // Theme Colors
    const colors = {
        light: {
            bgStart: '#f0f9ff',
            bgEnd: '#bae6fd',
            particle: '#0ea5e9',
            line: 'rgba(14, 165, 233, '
        },
        dark: {
            bgStart: '#0b1121',
            bgEnd: '#111827',
            particle: '#38bdf8',
            line: 'rgba(56, 189, 248, '
        }
    };

    const currentTheme = theme === 'dark' ? colors.dark : colors.light;
    let mouse = { x: width / 2, y: height / 2 };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      depth: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5; 
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 1.5 + 1;
        this.depth = Math.random() * 1.5 + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseDistance) {
            const force = (mouseDistance - distance) / mouseDistance;
            this.vx -= (dx / distance) * force * 0.02;
            this.vy -= (dy / distance) * force * 0.02;
        }
      }

      draw(parallaxX: number, parallaxY: number) {
        if (!ctx) return null;
        const drawX = this.x + (parallaxX * this.depth);
        const drawY = this.y + (parallaxY * this.depth);
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
        ctx.fillStyle = currentTheme.particle;
        ctx.fill();
        return { x: drawX, y: drawY };
      }
    }

    const particles: Particle[] = Array.from({ length: particleCount }, () => new Particle());

    const animate = () => {
      if (!ctx) return;
      
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, currentTheme.bgStart);
      gradient.addColorStop(1, currentTheme.bgEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const parallaxX = (mouse.x - width / 2) * 0.01;
      const parallaxY = (mouse.y - height / 2) * 0.01;

      const positions = particles.map(p => {
        p.update();
        return p.draw(parallaxX * -1, parallaxY * -1);
      });

      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = positions[i];
            const p2 = positions[j];
            if (!p1 || !p2) continue;
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDistance) {
                const alpha = (1 - dist / connectionDistance) * 0.3;
                ctx.strokeStyle = `${currentTheme.line}${alpha})`;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
      }
      requestAnimationFrame(animate);
    };

    const animReq = requestAnimationFrame(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animReq);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};

export default AnimatedBackground;
