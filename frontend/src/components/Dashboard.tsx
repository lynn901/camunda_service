import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  CheckCircle, 
  ShieldAlert, 
  CalendarClock, 
  PlayCircle,
  History,
  Terminal,
} from 'lucide-react';
import { workflowApi } from '../lib/api';

const StatCard = ({ title, value, icon: Icon, colorClass, borderClass }: any) => (
  <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 ${borderClass}`}>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
    <div className="flex items-end justify-between">
      <h3 className={`text-3xl font-black ${colorClass || 'text-slate-800'}`}>{value}</h3>
      <Icon size={24} className="text-slate-200" />
    </div>
  </div>
);

export const Dashboard = ({ onNavigateToModels, onNavigateToInstances }: any) => {
  const [timeRange, setTimeRange] = useState('24h');

  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: workflowApi.getMetrics,
    refetchInterval: 10000,
  });

  const { data: definitions, isLoading: isDefsLoading } = useQuery({
    queryKey: ['definitions'],
    queryFn: workflowApi.getDefinitions,
  });

  if (isMetricsLoading || isDefsLoading) {
    return <div className="p-8 text-center text-slate-500">正在加载数据...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">整体概览</h2>
          <p className="text-sm text-slate-500">平台所有自动化工作流的运行健康度</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <CalendarClock size={14} className="text-slate-400 ml-2 mr-1" />
            <select 
              className="w-full text-xs bg-transparent focus:outline-none py-1 pr-2 text-slate-700 font-medium cursor-pointer"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1h">最近 1 小时</option>
              <option value="24h">最近 24 小时</option>
              <option value="7d">最近 7 天</option>
              <option value="30d">最近 30 天</option>
            </select>
          </div>
          <div className="text-sm font-medium text-slate-500 flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <Activity size={16} className="text-emerald-500 mr-2" />
            引擎状态: <span className="text-emerald-600 ml-1 font-bold">健康</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="活跃实例总数" 
          value={metrics?.processStats.runningInstances || 0} 
          icon={Activity} 
          borderClass="border-l-indigo-500" 
        />
        <StatCard 
          title="完成实例总数" 
          value={metrics?.processStats.completedInstances || 0} 
          icon={CheckCircle} 
          borderClass="border-l-emerald-500" 
        />
        <StatCard 
          title="故障/节点失败" 
          value={metrics?.taskMetrics.taskBacklogs || 0} 
          icon={ShieldAlert} 
          colorClass="text-rose-600"
          borderClass="border-l-rose-500" 
        />
        <StatCard 
          title="CPU 负载" 
          value={`${((metrics?.systemHealth.cpuUsage || 0) * 100).toFixed(1)}%`} 
          icon={Terminal} 
          borderClass="border-l-purple-500" 
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
          <h3 className="font-bold text-slate-800">工作流模型矩阵</h3>
          <button className="text-xs text-indigo-600 font-medium hover:underline" onClick={onNavigateToModels}>管理所有模型</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {definitions?.slice(0, 4).map(model => (
            <div key={model.id} className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => onNavigateToInstances(model.key)}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                    <GitBranch size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm truncate w-32" title={model.name}>{model.name}</h4>
                    <p className="text-xs text-slate-500">{model.key}</p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-1.5 text-indigo-600 hover:bg-indigo-100 rounded transition-all">
                  <PlayCircle size={18} />
                </button>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">版本:</span>
                  <span className="font-mono font-medium">v{model.version}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">部署 ID:</span>
                  <span className="font-mono text-[10px] truncate w-24">{model.deploymentId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-rose-500 flex flex-col h-full min-h-[300px]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center">
              <ShieldAlert size={16} className="mr-2 text-rose-500" />
              全站故障监控 (Incidents)
            </h3>
            <button className="text-xs text-indigo-600 font-medium hover:underline" onClick={() => onNavigateToInstances()}>前往干预中心</button>
          </div>
          <div className="p-8 text-center flex flex-col items-center justify-center flex-1">
             <Activity size={32} className="text-slate-200 mb-2" />
             <p className="text-slate-400 text-sm">暂无全局故障监控概览，请进入干预中心查看详细实例状态。</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[300px]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
            <h3 className="font-bold text-slate-800 flex items-center">
              <History size={16} className="mr-2 text-indigo-500" />
              系统健康状况
            </h3>
          </div>
          <div className="p-6 space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">内存使用量</span>
                <span className="text-sm font-mono font-bold text-indigo-600">{metrics?.systemHealth.memoryUsage} MB</span>
             </div>
             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full" style={{ width: '45%' }}></div>
             </div>

             <div className="flex justify-between items-center pt-4">
                <span className="text-sm text-slate-600">数据库活跃连接</span>
                <span className="text-sm font-mono font-bold text-emerald-600">{metrics?.systemHealth.dbConnections}</span>
             </div>
             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '20%' }}></div>
             </div>

             <div className="flex justify-between items-center pt-4">
                <span className="text-sm text-slate-600">故障率 (Failure Rate)</span>
                <span className="text-sm font-mono font-bold text-rose-600">{((metrics?.taskMetrics.failureRate || 0) * 100).toFixed(2)}%</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GitBranch = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="6" y1="3" x2="6" y2="15"></line>
    <circle cx="18" cy="6" r="3"></circle>
    <circle cx="6" cy="18" r="3"></circle>
    <path d="M18 9a9 9 0 0 1-9 9"></path>
  </svg>
);
