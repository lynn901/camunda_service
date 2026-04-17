import React from 'react';
import { Search, Settings, Terminal } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-border-cream px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Terminal className="text-stone-gray w-4 h-4" />
        <span className="text-[10px] text-stone-gray uppercase tracking-widest font-sans font-medium">/ 运维控制台 (OpsConsole) /</span>
        <h2 className="text-sm font-sans font-bold text-anthropic-black">系统概览</h2>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-gray w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="搜索实例 ID / 业务标识..." 
            className="pl-9 pr-4 py-2 bg-ivory border border-border-cream rounded-generous text-xs font-sans w-64 focus:outline-none focus:ring-1 focus:ring-terracotta transition-all"
          />
        </div>
        
        <div className="h-4 w-[1px] bg-border-warm" />
        
        <button className="text-stone-gray hover:text-terracotta transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
