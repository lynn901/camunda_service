import React from 'react';

interface WidgetGridProps {
  children: React.ReactNode;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {children}
    </div>
  );
};

interface WidgetCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ElementType;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({ title, children, className = '', icon: Icon }) => {
  return (
    <div className={`bg-white rounded-generous border border-border-cream p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-sans font-bold text-stone-gray uppercase tracking-widest">{title}</h3>
        {Icon && <Icon className="w-4 h-4 text-stone-gray/50" />}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
