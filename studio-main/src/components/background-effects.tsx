"use client";

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

const BackgroundEffects = () => {
  const [particles, setParticles] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map(() => ({
      id: Math.random(),
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 20 + 15}s`,
      delay: `${Math.random() * 15}s`,
      size: `${Math.random() * 2 + 1}px`,
    }));
    setParticles(newParticles);
  }, []);

  if (theme === 'light') {
    return null; // Don't render effects on light mode
  }

  return (
    <div className="fixed inset-0 -z-50 h-full w-full overflow-hidden">
      <div className="absolute top-0 -left-1/4 w-[32rem] h-[32rem] bg-primary/20 rounded-full filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute top-0 -right-1/4 w-[32rem] h-[32rem] bg-accent/20 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-[32rem] h-[32rem] bg-purple-500/20 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

      <div className="absolute inset-0">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white/50 animate-particle"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default BackgroundEffects;
