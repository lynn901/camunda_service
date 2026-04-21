import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  History, 
  Search, 
  Activity, 
  CheckCircle, 
  Clock,
  Settings,
  Database,
  Calendar,
  Filter
} from 'lucide-react';
import { workflowApi } from '../lib/api';
import { ProcessInstance } from '../types';

export const HistoryArchive = () => {
  const [selectedInstance, setSelectedInstance] = useState<ProcessInstance | null>(null);
  const [businessKeySearch, setBusinessKeySearch] = useState('');
  const [modelFilter, setModelFilter] = useState('All');

  // Queries
  const { data: instances, isLoading: isInstancesLoading } = useQuery({
    queryKey: ['history-instances', businessKeySearch],
    queryFn: () => workflowApi.getHistoryInstances(businessKeySearch, true),
  });

  const { data: definitions } = useQuery({
    queryKey: ['definitions'],
    queryFn: workflowApi.getDefinitions,
  });

  const { data: variables } = useQuery({
    queryKey: ['history-variables', selectedInstance?.instanceId],
    queryFn: () => workflowApi.getHistoricVariables(selectedInstance!.instanceId),
    enabled: !!selectedInstance,
  });

  const { data: activities } = useQuery({
    queryKey: ['history-activities', selectedInstance?.instanceId],
    queryFn: () => workflowApi.getHistoryActivities(selectedInstance!.instanceId),
    enabled: !!selectedInstance,
  });

  const filteredInstances = instances?.filter(inst => {
    if (modelFilter !== 'All' && inst.processDefinitionKey !== modelFilter) return false;
    return true;
  });

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 animate-in fade-in">
      {/* Sidebar List */}
      <div className="w-[400px] shrink-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center">
            <History size={18} className="mr-2 text-indigo-600" />
            历史归档
          </h3>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="搜索业务标识..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                value={businessKeySearch}
                onChange={(e) => setBusinessKeySearch(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
              <Filter size={14} className="text-slate-400 ml-2 mr-1" />
              <select 
                className="w-full text-xs bg-transparent focus:outline-none py-1 text-slate-700 font-medium cursor-pointer"
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
              >
                <option value="All">所有模型</option>
                {definitions?.map(m => <option key={m.id} value={m.key}>{m.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
          {isInstancesLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">加载中...</div>
          ) : filteredInstances?.map(inst => (
            <div 
              key={inst.instanceId} 
              onClick={() => setSelectedInstance(inst)}
              className={`p-4 rounded-lg cursor-pointer border transition-all ${
                selectedInstance?.instanceId === inst.instanceId ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-tight">{inst.instanceId.substring(0, 8)}...</span>
                  <p className="text-[11px] font-bold text-slate-700 mt-0.5 truncate w-48">{inst.businessKey}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded flex items-center font-bold ${
                  inst.state === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {inst.state === 'COMPLETED' ? '已完成' : '已终止'}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-medium">
                <div className="flex items-center">
                  <Calendar size={12} className="mr-1" />
                  {new Date(inst.startTime).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  耗时: {formatDuration(inst.durationInMillis)}
                </div>
              </div>
            </div>
          ))}
          {filteredInstances?.length === 0 && (
            <div className="text-center p-12 text-slate-400 text-sm">
               <Database size={32} className="mx-auto mb-2 opacity-10" />
               未找到符合条件的历史实例
            </div>
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {selectedInstance ? (
          <>
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <History size={18} className="text-indigo-500" />
                  <h2 className="text-lg font-bold text-slate-800 font-mono tracking-tight">{selectedInstance.instanceId}</h2>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">{selectedInstance.processDefinitionKey}</span>
                  <p className="text-[10px] text-slate-400 font-mono">业务主键: {selectedInstance.businessKey}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">执行周期</p>
                 <p className="text-xs text-slate-600 font-mono">
                   {new Date(selectedInstance.startTime).toLocaleString()} → {selectedInstance.endTime ? new Date(selectedInstance.endTime).toLocaleString() : 'N/A'}
                 </p>
              </div>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto bg-white border-r border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                  <Activity size={14} className="mr-2 text-indigo-500" /> 执行审计追踪 (Audit Log)
                </h3>
                
                <div className="relative border-l-2 border-slate-100 ml-4 space-y-6">
                  {activities?.map((act) => (
                    <div key={act.activityId} className="relative pl-8">
                      <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                        act.endTime ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white'
                      }`}>
                        <CheckCircle size={16} />
                      </div>
                      
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-sm text-slate-800">
                            {act.activityName || act.activityId}
                            <span className="ml-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-400 border border-slate-100 uppercase">
                              {act.activityType}
                            </span>
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(act.startTime).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                           <p className="text-[10px] text-slate-500">
                             {act.endTime ? `执行耗时: ${act.durationInMillis}ms` : '未完成'}
                           </p>
                           <p className="text-[10px] text-slate-300 font-mono">
                             ID: {act.activityId}
                           </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variables Sidebar */}
              <div className="w-80 bg-slate-50/50 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-100 bg-white">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                    <Settings size={14} className="mr-1" /> 最终变量快照
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {variables && Object.entries(variables).map(([k, v]) => (
                    <div key={k} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <label className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2 font-mono">{k}</label>
                      <div className="bg-slate-900 rounded p-2 overflow-x-auto">
                        <code className="text-[10px] text-indigo-300 font-mono whitespace-pre">
                          {typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}
                        </code>
                      </div>
                    </div>
                  ))}
                  {(!variables || Object.keys(variables).length === 0) && (
                    <div className="text-center py-12 text-slate-400 text-xs italic">无流程变量记录</div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <History size={64} className="mb-4 opacity-10 text-indigo-500" />
            <p className="font-medium text-slate-500">从归档列表中选择一个实例查看详细执行历史</p>
            <p className="text-xs text-slate-400 mt-2">支持查看已完成及已终止的流程生命周期</p>
          </div>
        )}
      </div>
    </div>
  );
};
