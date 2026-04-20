import React from 'react';

interface WidgetGridProps {
  children: React.ReactNode;
  className?: string;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({ children, className = '' }) => {
  const baseClasses = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500";
  // If className includes grid-cols, we should probably not include the default ones, 
  // but for simplicity in this refactor we'll just allow appending/overriding via tailwind cascading if possible,
  // or just replace if className is provided.
  const classes = className ? `grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}` : baseClasses;

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

interface WidgetCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ElementType;
  onClick?: () => void;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({ title, children, className = '', icon: Icon, onClick }) => {
  return (
    <div 
      className={`bg-surface-container-lowest p-6 ring-1 ring-outline-variant/10 shadow-sm hover:scale-[1.01] transition-all duration-300 flex flex-col gap-4 ${className}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">{title}</h3>
        {Icon && <Icon className="w-4 h-4 text-on-surface-variant/50" />}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
