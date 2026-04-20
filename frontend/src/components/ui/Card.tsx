import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'ivory' | 'white' | 'dark';
  elevated?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'ivory',
  elevated = false,
  onClick
}) => {
  const baseStyles = 'rounded-comfortable border border-border-cream transition-shadow';
  
  const variants = {
    ivory: 'bg-ivory text-anthropic-black',
    white: 'bg-white text-anthropic-black',
    dark: 'bg-dark-surface text-warm-silver border-border-dark'
  };

  const shadowStyles = elevated ? 'whisper-shadow' : 'ring-shadow ring-border-cream';

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${shadowStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
