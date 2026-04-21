import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  GitBranch, 
  CalendarClock, 
  Server, 
  History,
  Terminal,
  Settings,
  Search,
  Archive
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  alertCount?: number;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, alertCount }: SidebarItemProps) => (
  <div 
    onClick={onClick}
    className={cn(
      "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
      active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    )}
  >
    <div className="flex items-center space-x-3">
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {alertCount && alertCount > 0 ? (
      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        {alertCount}
      </span>
    ) : null}
  </div>
);

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout = ({ children, activeTab, setActiveTab }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-900 font-sans relative">
      <aside className="w-[220px] bg-[#0f172a] flex flex-col shrink-0 shadow-2xl z-20 border-r border-slate-800">
        <div className="flex items-center space-x-3 p-4 mb-6 border-b border-slate-800/80 bg-[#1e293b]/30">
          <div className="w-8 h-8 bg-indigo-500 rounded border border-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <GitBranch size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide leading-tight">OpsFlow<span className="text-indigo-400">Engine</span></h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">运维控制台</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 overflow-y-auto pb-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2 px-2">监控与干预</div>
          <SidebarItem icon={LayoutDashboard} label="整体概览" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Activity} label="干预中心" active={activeTab === 'instances'} onClick={() => setActiveTab('instances')} alertCount={6} />
          <SidebarItem icon={Archive} label="执行历史" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">模型与自动化调度</div>
          <SidebarItem icon={GitBranch} label="BPMN 模型库" active={activeTab === 'models'} onClick={() => setActiveTab('models')} />
          <SidebarItem icon={CalendarClock} label="定时任务" active={activeTab === 'schedules'} onClick={() => setActiveTab('schedules')} />
          <SidebarItem icon={Server} label="外部工作节点" active={activeTab === 'workers'} onClick={() => setActiveTab('workers')} />
          
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">系统安全</div>
          <SidebarItem icon={History} label="审计日志" active={activeTab === 'audits'} onClick={() => setActiveTab('audits')} />
        </nav>

        <div className="p-4 border-t border-slate-800/80 bg-[#1e293b]/30 shrink-0">
          <div className="flex items-center space-x-3 p-2 hover:bg-slate-800 cursor-pointer rounded transition-colors">
            <div className="w-8 h-8 rounded bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-indigo-300 font-mono">
              OP
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-200 truncate">系统管理员</p>
              <p className="text-[9px] text-emerald-400 truncate flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1 animate-pulse"></span> 在线</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative bg-slate-50">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-2">
            <Terminal size={16} className="text-slate-400" />
            <span className="text-slate-400 font-medium text-xs font-mono uppercase tracking-wider">/ OpsConsole /</span>
            <span className="text-slate-800 font-bold text-sm capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="搜索流程 ID / 业务 Key..." 
                className="pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white w-64 transition-all"
              />
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <Settings size={16} className="text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors" />
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 w-full mx-auto max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
};
