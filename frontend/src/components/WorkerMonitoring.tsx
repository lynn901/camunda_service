import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  Lock, 
  Server, 
  RefreshCw,
  Search,
  Code,
  Power,
  Unlock
} from 'lucide-react';
import { workflowApi } from '../lib/api';

export const WorkerMonitoring = () => {
  const { data: workers, isLoading, refetch } = useQuery({
    queryKey: ['workers'],
    queryFn: workflowApi.getWorkers,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">正在加载节点数据...</div>;
  }

  const activeCount = workers?.filter(w => w.status === 'Online').length || 0;
  const highLoadCount = workers?.filter(w => w.status === 'HighLoad').length || 0;
  const lockedTasksCount = workers?.reduce((acc, w) => acc + w.activeTasks, 0) || 0;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Radio size={24} className="mr-2 text-indigo-600" /> 
            外部工作节点
          </h2>
          <p className="text-sm text-slate-500 mt-1">监控长轮询工作节点的存活状态、订阅队列与任务锁获取情况</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => refetch()}
            className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={16} className="mr-2" />
            刷新状态
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">活跃节点</p>
            <h3 className="text-2xl font-black text-emerald-600">{activeCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg"><Wifi size={24} className="text-emerald-500" /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">高负载节点</p>
            <h3 className="text-2xl font-black text-amber-600">{highLoadCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg"><Wifi size={24} className="text-amber-500" /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">当前锁定任务</p>
            <h3 className="text-2xl font-black text-amber-600">{lockedTasksCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg"><Lock size={24} className="text-amber-500" /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between border-r-4 border-r-indigo-500">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">监控覆盖率</p>
            <h3 className="text-2xl font-black text-slate-800">100%</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg"><Server size={24} className="text-indigo-500" /></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">节点注册列表</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="搜索节点 ID..." 
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-bold">节点 ID</th>
              <th className="px-6 py-4 font-bold">订阅队列 (Topics)</th>
              <th className="px-6 py-4 font-bold">运行状态 / 最近活动</th>
              <th className="px-6 py-4 font-bold text-center">锁定任务</th>
              <th className="px-6 py-4 font-bold text-right">运维操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workers?.map(worker => (
              <tr key={worker.workerId} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-mono font-bold text-slate-800 text-sm">{worker.workerId}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {worker.topics.map(topic => (
                      <span key={topic} className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        {topic}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {worker.status === 'Online' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        worker.status === 'Online' ? 'bg-emerald-500' : 
                        worker.status === 'HighLoad' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></span>
                    </span>
                    <span className={`text-xs font-bold ${
                      worker.status === 'Online' ? 'text-emerald-700' : 
                      worker.status === 'HighLoad' ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {worker.status === 'HighLoad' ? '高负载' : worker.status === 'Offline' ? '节点失联' : '正常运行'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">过期时间: {new Date(worker.lastSeen).toLocaleTimeString()}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`text-sm font-black font-mono ${worker.activeTasks > 50 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {worker.activeTasks}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                  <button className="flex items-center px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors" title="强制释放该节点持有的任务锁">
                    <Unlock size={14} className="mr-1" /> 释放锁
                  </button>
                  <button className="flex items-center px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors" title="阻止该节点继续拉取新任务">
                    <Power size={14} className="mr-1" /> 隔离
                  </button>
                </td>
              </tr>
            ))}
            {(!workers || workers.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                  当前无活跃的外部工作节点锁定任务
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
