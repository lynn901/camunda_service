import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Filter, 
  Activity, 
  ShieldAlert, 
  Terminal, 
  PauseCircle, 
  StopCircle, 
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  FastForward,
  Settings,
  ChevronRight,
  Search
} from 'lucide-react';
import { workflowApi } from '../lib/api';
import { BpmnViewer } from './BpmnViewer';
import { ProcessInstance, Incident } from '../types';

export const InstanceCenter = ({ initialModelKey }: { initialModelKey?: string | null }) => {
  const queryClient = useQueryClient();
  const [selectedInstance, setSelectedInstance] = useState<ProcessInstance | null>(null);
  const [modelFilter, setModelFilter] = useState(initialModelKey || 'All');

  // Queries
  const { data: instances, isLoading: isInstancesLoading } = useQuery({
    queryKey: ['instances'],
    queryFn: () => workflowApi.getHistoryInstances(),
    refetchInterval: 5000,
  });

  const { data: definitions } = useQuery({
    queryKey: ['definitions'],
    queryFn: workflowApi.getDefinitions,
  });

  const { data: incidents } = useQuery({
    queryKey: ['incidents', selectedInstance?.instanceId],
    queryFn: () => workflowApi.getIncidents(selectedInstance!.instanceId),
    enabled: !!selectedInstance,
  });

  const { data: variables } = useQuery({
    queryKey: ['variables', selectedInstance?.instanceId],
    queryFn: () => workflowApi.getVariables(selectedInstance!.instanceId),
    enabled: !!selectedInstance,
  });

  const { data: activities } = useQuery({
    queryKey: ['activities', selectedInstance?.instanceId],
    queryFn: () => workflowApi.getHistoryActivities(selectedInstance!.instanceId),
    enabled: !!selectedInstance,
  });

  // Mutations
  const terminateMutation = useMutation({
    mutationFn: (id: string) => workflowApi.terminateInstance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
      setSelectedInstance(null);
    }
  });

  const retryMutation = useMutation({
    mutationFn: ({ jobId }: { jobId: string }) => workflowApi.setJobRetries(jobId, 1),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidents'] })
  });

  const filteredInstances = instances?.filter(inst => {
    if (modelFilter !== 'All' && inst.processDefinitionKey !== modelFilter) return false;
    // For Intervention Center, we typically only show ACTIVE/SUSPENDED (which can have incidents)
    return inst.state !== 'COMPLETED';
  });

  const getStatusBadge = (state: string, hasIncidents: boolean) => {
    if (hasIncidents) return "bg-rose-100 text-rose-700 border border-rose-200 animate-pulse";
    if (state === 'ACTIVE') return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    if (state === 'SUSPENDED') return "bg-amber-100 text-amber-700 border border-amber-200";
    return "bg-slate-100 text-slate-700 border border-slate-200";
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 animate-in fade-in">
      {/* Sidebar List */}
      <div className="w-[380px] shrink-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 mb-3">干预中心</h3>
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
            <Filter size={16} className="text-slate-400 ml-2 mr-1" />
            <select 
              className="w-full text-xs bg-transparent focus:outline-none py-1 text-slate-700 font-medium cursor-pointer"
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
            >
              <option value="All">查看所有模型实例</option>
              {definitions?.map(m => <option key={m.id} value={m.key}>{m.name}</option>)}
            </select>
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
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate w-40" title={inst.businessKey}>业务标识: {inst.businessKey}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded flex items-center font-bold ${getStatusBadge(inst.state, (incidents?.length || 0) > 0 && selectedInstance?.instanceId === inst.instanceId)}`}>
                  {inst.state === 'ACTIVE' ? '运行中' : inst.state === 'SUSPENDED' ? '已挂起' : '异常'}
                </span>
              </div>
              
              <div className="bg-slate-50 p-2 rounded border border-slate-100 mb-2">
                <p className="text-xs font-medium text-slate-700 truncate">{inst.processDefinitionKey}</p>
              </div>

              <div className="flex items-center text-[10px] text-slate-400">
                 <Activity size={12} className="mr-1" />
                 启动于: {new Date(inst.startTime).toLocaleString()}
              </div>
            </div>
          ))}
          {filteredInstances?.length === 0 && (
            <div className="text-center p-8 text-slate-400 text-sm">当前无活跃或异常实例</div>
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {selectedInstance ? (
          <>
            <div className="p-5 border-b border-slate-200 bg-slate-800 text-white flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <Terminal size={18} className="text-indigo-400" />
                  <h2 className="text-lg font-bold font-mono tracking-tight">{selectedInstance.instanceId}</h2>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600">{selectedInstance.processDefinitionKey}</span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-2">上下文: {selectedInstance.businessKey}</p>
              </div>
              <div className="flex space-x-2">
                <button className="flex items-center px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-xs font-medium transition-colors">
                  <PauseCircle size={14} className="mr-1.5" /> 挂起
                </button>
                <button 
                  onClick={() => terminateMutation.mutate(selectedInstance.instanceId)}
                  className="flex items-center px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 rounded text-xs font-medium transition-colors"
                >
                  <StopCircle size={14} className="mr-1.5" /> 删除
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 border-r border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center">
                  <Activity size={16} className="mr-2 text-indigo-500" /> 执行链路与诊断
                </h3>
                
                <div className="space-y-6">
                  {/* Incident Alert if any */}
                  {incidents && incidents.length > 0 && incidents.map(inc => (
                    <div key={inc.id} className="p-4 bg-rose-50 border border-rose-200 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-rose-800 flex items-center">
                          <ShieldAlert size={16} className="mr-2" />
                          节点故障: {inc.activityId}
                        </h4>
                        <span className="text-[10px] font-mono bg-rose-100 px-2 py-0.5 rounded text-rose-600 uppercase font-bold">{inc.incidentType}</span>
                      </div>
                      <div className="bg-slate-900 text-rose-300 p-3 rounded text-xs font-mono whitespace-pre-wrap mb-4 max-h-32 overflow-y-auto">
                        {inc.incidentMessage}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => inc.jobId && retryMutation.mutate({ jobId: inc.jobId })}
                          className="flex-1 flex justify-center items-center text-xs bg-indigo-600 text-white px-2 py-2 rounded shadow-sm hover:bg-indigo-700 font-medium transition-all"
                        >
                          <RefreshCw size={14} className="mr-1.5" /> 重置重试次数
                        </button>
                        <button className="flex-1 flex justify-center items-center text-xs bg-white border border-slate-300 text-slate-700 px-2 py-2 rounded shadow-sm hover:bg-slate-50 font-medium transition-all">
                          <FastForward size={14} className="mr-1.5" /> 节点跳转
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Execution Steps */}
                  <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                    {activities?.map((act, i) => (
                      <div key={act.activityId} className="relative pl-8">
                        <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-sm ${
                          act.endTime ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white animate-pulse'
                        }`}>
                          {act.endTime ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                        </div>
                        
                        <div className={`p-4 rounded-lg border bg-white border-slate-200 shadow-sm`}>
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-sm text-slate-800">
                              {act.activityName || act.activityId}
                              <span className="ml-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                                {act.activityType}
                              </span>
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(act.startTime).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {act.endTime ? `耗时: ${act.durationInMillis}ms` : '正在执行...'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Variables Sidebar */}
              <div className="w-72 bg-white flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                    <Settings size={14} className="mr-1" /> 流程变量
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {variables && Object.entries(variables).map(([k, v]) => (
                    <div key={k}>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">{k}</label>
                      <input 
                        type="text" 
                        readOnly
                        value={typeof v === 'object' ? JSON.stringify(v) : String(v)} 
                        className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 outline-none"
                      />
                    </div>
                  ))}
                  {!variables && <div className="text-center text-slate-400 text-xs">无变量</div>}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <Activity size={64} className="mb-4 opacity-10" />
            <p className="font-medium text-slate-500">选择左侧活跃实例进入干预控制台</p>
          </div>
        )}
      </div>
    </div>
  );
};
