import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, GitBranch, Activity, Clock, Server, Zap, Settings, BarChart3 } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const navItems = [
    { name: '整体概览', path: '/', icon: LayoutDashboard },
    { name: '模型仓库', path: '/models', icon: GitBranch },
    { name: '实例干预', path: '/instances', icon: Activity },
    { name: '执行历史', path: '/history', icon: Clock },
    { name: 'Worker节点', path: '/workers', icon: Server },
  ];

  return (
    <aside className="w-64 bg-surface-container text-on-surface h-screen flex flex-col fixed left-0 top-0 shadow-[12px_0_32px_-4px_rgba(48,52,42,0.08)] py-8 px-4 z-50">
      <div className="mb-10 px-2">
        <span className="font-headline text-xl font-bold italic text-on-surface">The Engine</span>
        <p className="font-headline text-[10px] tracking-tight text-on-surface-variant/70 uppercase">生产环境</p>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-3 py-2.5 transition-colors font-body
              ${isActive 
                ? 'text-on-surface font-bold border-r-2 border-primary bg-surface/50' 
                : 'text-on-surface-variant font-medium hover:bg-surface/50'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`mr-3 w-4 h-4 ${isActive ? 'text-primary' : 'text-on-surface-variant/70'}`} />
                <span className="tracking-tight text-sm">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto space-y-1 pt-6 border-t border-outline-variant/20">
        <button 
          onClick={() => navigate('/models')}
          className="w-full mb-6 py-3 bg-primary text-on-primary font-medium shadow-sm hover:scale-[1.02] transition-transform duration-200 font-body text-xs rounded-sm"
        >
          部署模型
        </button>
        <a className="flex items-center px-3 py-2 text-on-surface-variant font-body tracking-tight hover:bg-surface/50 rounded-sm" href="#">
          <BarChart3 className="mr-3 w-4 h-4" />
          <span className="text-sm">系统健康</span>
        </a>
        <a className="flex items-center px-3 py-2 text-on-surface-variant font-body tracking-tight hover:bg-surface/50 rounded-sm" href="#">
          <Settings className="mr-3 w-4 h-4" />
          <span className="text-sm">设置</span>
        </a>
        
        <div className="flex items-center px-3 py-4 mt-4 bg-surface-container-high rounded-lg">
          <div className="w-8 h-8 rounded-full border border-outline-variant/30 mr-3 bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">
            ADM
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate">运维管理员</p>
            <p className="text-[10px] text-on-surface-variant truncate">会话已激活</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
