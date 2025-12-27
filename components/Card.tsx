
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = React.memo(({ children, className = '', delay = 0, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      backdrop-blur-lg md:backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl 
      transition-all duration-500 hover:bg-slate-900/50 hover:border-white/20
      ${onClick ? 'cursor-pointer active:scale-95' : ''}
      ${className}
    `}
    style={{ 
      animation: `fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s backwards`,
      willChange: 'transform, opacity' // Hint browser for optimization
    }}
  >
    {children}
  </div>
));

export const FloatingCard: React.FC<CardProps> = React.memo(({ children, className = '', delay = 0 }) => (
  <div 
    className={`
      backdrop-blur-lg md:backdrop-blur-2xl bg-slate-900/60 border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl animate-float
      ${className}
    `}
    style={{ 
      animation: `float 6s ease-in-out infinite ${delay}s, fadeIn 1s ease-out ${delay}s backwards`,
      willChange: 'transform'
    }}
  >
    {children}
  </div>
));
