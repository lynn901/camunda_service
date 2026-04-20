import React from 'react';
import { Search, Bell, History, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full h-16 sticky top-0 z-40 bg-surface/80 backdrop-blur-md flex items-center justify-between px-8 border-b border-on-surface/5">
      <div className="flex items-center space-x-6">
        <span className="font-headline text-lg font-semibold text-on-surface">Camunda 运维</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="全局搜索..." 
            className="bg-surface-container-low border-none ring-1 ring-outline-variant/20 focus:ring-tertiary py-1.5 pl-9 pr-4 text-xs w-64 rounded font-body outline-none"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <History className="w-4 h-4" />
          </button>
        </div>

        <button className="px-4 py-1.5 bg-primary text-on-primary font-body text-[10px] uppercase tracking-widest font-bold ring-1 ring-outline-variant/30 shadow-sm hover:bg-primary-dim transition-colors">
          干预
        </button>
      </div>
    </header>
  );
};
