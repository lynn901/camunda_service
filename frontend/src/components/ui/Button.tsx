import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'terracotta' | 'warm-sand';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'secondary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all rounded-generous focus:outline-none focus:ring-2 focus:ring-focus-blue focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-anthropic-black text-warm-silver hover:bg-dark-surface',
    secondary: 'bg-ivory text-anthropic-black border border-border-cream hover:bg-warm-sand',
    outline: 'bg-transparent border border-border-warm text-charcoal-warm hover:bg-warm-sand',
    ghost: 'bg-transparent text-olive-gray hover:bg-warm-sand',
    terracotta: 'bg-terracotta text-ivory hover:bg-coral shadow-ring ring-terracotta',
    'warm-sand': 'bg-warm-sand text-charcoal-warm hover:bg-border-warm shadow-ring ring-ring-warm'
  };

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
