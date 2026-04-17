import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GitBranch, Activity, Server, Zap } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Models', path: '/models', icon: GitBranch },
    { name: 'Instances', path: '/instances', icon: Activity },
    { name: 'Workers', path: '/workers', icon: Server },
  ];

  return (
    <aside className="w-64 bg-dark-surface text-warm-silver h-screen flex flex-col border-r border-border-dark">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-terracotta rounded-comfortable flex items-center justify-center">
          <Zap className="text-ivory w-5 h-5" />
        </div>
        <h1 className="text-xl font-serif text-ivory tracking-tight">OpsFlow<span className="text-terracotta">Engine</span></h1>
      </div>
      
      <nav className="flex-1 px-4 mt-6">
        <div className="text-[10px] font-sans font-medium text-stone-gray uppercase tracking-widest mb-4 px-2">
          Operations Hub
        </div>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-generous transition-all
                  ${isActive 
                    ? 'bg-anthropic-black text-ivory ring-shadow ring-dark-warm' 
                    : 'text-stone-gray hover:text-warm-silver hover:bg-anthropic-black'}
                `}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-sans">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-6 border-t border-border-dark">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-stone-gray flex items-center justify-center text-[10px] text-ivory font-bold">
            OP
          </div>
          <div>
            <div className="text-sm font-sans font-medium text-warm-silver">SysAdmin</div>
            <div className="text-[10px] text-stone-gray">Connected</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
