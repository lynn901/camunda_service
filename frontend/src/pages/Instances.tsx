import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Filter, 
  Terminal, 
  PauseCircle, 
  PlayCircle as PlayIcon,
  StopCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  FastForward,
  Settings,
  Save,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { camundaService } from '../services/camundaService';
import type { 
  ProcessInstance, 
  ProcessDefinition, 
  HistoricActivityInstance, 
  Incident,
  Variable
} from '../services/camundaService';

export const Instances: React.FC = () => {
  const [instances, setInstances] = useState<ProcessInstance[]>([]);
  const [definitions, setDefinitions] = useState<ProcessDefinition[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<ProcessInstance | null>(null);
  const [steps, setSteps] = useState<HistoricActivityInstance[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [variables, setVariables] = useState<Record<string, Variable>>({});
  const [editingVariables, setEditingVariables] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterDefinition, setFilterDefinition] = useState<string>('All');

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInstances, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchInstances();
  }, [filterDefinition]);

  useEffect(() => {
    if (selectedInstance) {
      fetchInstanceDetails(selectedInstance.id);
    }
  }, [selectedInstance]);

  const fetchInitialData = async () => {
    try {
      const defs = await camundaService.getProcessDefinitions();
      setDefinitions(defs);
    } catch (err) {
      console.error('Failed to fetch definitions', err);
    }
  };

  const fetchInstances = async () => {
    try {
      const filter = filterDefinition === 'All' ? {} : { processDefinitionKey: filterDefinition };
      const data = await camundaService.getProcessInstances(filter);
      
      const allIncidents = await camundaService.getIncidents();
      
      const instancesWithState = data.map(inst => {
        const hasIncident = allIncidents.some(inc => inc.processInstanceId === inst.id);
        return {
          ...inst,
          state: hasIncident ? 'Failed' : (inst.suspended ? 'Suspended' : 'Running')
        } as ProcessInstance;
      });
      
      setInstances(instancesWithState);
    } catch (err) {
      console.error('Failed to fetch instances', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstanceDetails = async (id: string) => {
    setDetailLoading(true);
    try {
      const [historicSteps, instanceIncidents, instanceVars] = await Promise.all([
        camundaService.getHistoricActivityInstances(id),
        camundaService.getIncidents(id),
        camundaService.getVariables(id)
      ]);
      
      const stepsWithStatus = historicSteps.map(step => {
        const incident = instanceIncidents.find(inc => inc.activityId === step.activityId);
        return {
          ...step,
          status: incident ? 'Failed' : (step.endTime ? 'Completed' : 'Running')
        } as HistoricActivityInstance;
      });
      
      setSteps(stepsWithStatus);
      setIncidents(instanceIncidents);
      setVariables(instanceVars);
      
      // Initialize editing state
      const initialEdit: Record<string, any> = {};
      Object.entries(instanceVars).forEach(([k, v]) => {
        initialEdit[k] = v.value;
      });
      setEditingVariables(initialEdit);
    } catch (err) {
      console.error('Failed to fetch details', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRetry = async (incident: Incident) => {
    if (!incident.jobId) return;
    setActionLoading(`retry-${incident.id}`);
    try {
      await camundaService.retryJob(incident.jobId, 3);
      // Wait a bit for engine to process
      setTimeout(() => {
        fetchInstances();
        if (selectedInstance) fetchInstanceDetails(selectedInstance.id);
        setActionLoading(null);
      }, 1000);
    } catch (err) {
      alert('重试操作失败');
      setActionLoading(null);
    }
  };

  const handleSaveVariable = async (name: string) => {
    if (!selectedInstance) return;
    const value = editingVariables[name];
    const type = variables[name].type;
    setActionLoading(`var-${name}`);
    try {
      await camundaService.updateVariable(selectedInstance.id, name, value, type);
      fetchInstanceDetails(selectedInstance.id);
    } catch (err) {
      alert('保存变量失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async () => {
    if (!selectedInstance) return;
    try {
      await camundaService.suspendProcessInstance(selectedInstance.id);
      fetchInstances();
    } catch (err) {
      alert('挂起操作失败');
    }
  };

  const handleActivate = async () => {
    if (!selectedInstance) return;
    try {
      await camundaService.activateProcessInstance(selectedInstance.id);
      fetchInstances();
    } catch (err) {
      alert('激活操作失败');
    }
  };

  const handleTerminate = async () => {
    if (!selectedInstance || !confirm('确定要终止该流程实例吗？此操作不可撤销。')) return;
    try {
      await camundaService.terminateProcessInstance(selectedInstance.id);
      setSelectedInstance(null);
      fetchInstances();
    } catch (err) {
      alert('终止失败');
    }
  };

  const getDefinitionName = (defId: string) => {
    return definitions.find(d => d.id === defId)?.name || defId.split(':')[0];
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-8 animate-in fade-in">
      {/* Left Sidebar: Instance List */}
      <div className="w-96 shrink-0 flex flex-col bg-white rounded-comfortable border border-border-cream shadow-whisper overflow-hidden">
        <div className="p-6 border-b border-border-cream bg-ivory">
          <h3 className="text-lg font-serif text-anthropic-black mb-4">实例干预与排障</h3>
          <div className="relative group">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-gray" />
            <select 
              className="w-full bg-white border border-border-warm rounded-generous pl-10 pr-4 py-2 text-xs font-sans font-medium text-anthropic-black focus:outline-none focus:ring-1 focus:ring-terracotta appearance-none transition-all cursor-pointer"
              value={filterDefinition}
              onChange={(e) => setFilterDefinition(e.target.value)}
            >
              <option value="All">所有流程模型 ({instances.length})</option>
              {definitions.map(def => (
                <option key={def.key} value={def.key}>{def.name || def.key}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-parchment/30">
          {loading ? (
            <div className="h-full flex items-center justify-center italic text-stone-gray font-sans text-sm">
              正在同步引擎数据...
            </div>
          ) : instances.length === 0 ? (
            <div className="h-full flex items-center justify-center italic text-stone-gray font-sans text-sm text-center px-8">
              当前筛选条件下未发现活跃或失败的实例。
            </div>
          ) : instances.map(inst => (
            <Card 
              key={inst.id} 
              onClick={() => setSelectedInstance(inst)}
              className={`p-4 cursor-pointer transition-all ${
                selectedInstance?.id === inst.id ? 'ring-2 ring-terracotta bg-white' : 'hover:bg-white'
              } ${inst.state === 'Failed' ? 'border-crimson/30 animate-pulse-subtle' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    {inst.state === 'Failed' && <ShieldAlert size={12} className="text-crimson" />}
                    <span className="font-mono text-[10px] font-bold text-stone-gray block truncate">{inst.id}</span>
                  </div>
                  <p className="text-[10px] text-stone-gray mt-1 truncate">流水号: <span className="text-anthropic-black font-medium">{inst.businessKey || '无'}</span></p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-highly uppercase tracking-tighter border ${
                  inst.state === 'Failed' ? 'bg-crimson/5 text-crimson border-crimson/20 shadow-[0_0_8px_rgba(181,51,51,0.1)]' : 
                  inst.state === 'Suspended' ? 'bg-stone-gray/5 text-stone-gray border-stone-gray/20' : 
                  'bg-terracotta/5 text-terracotta border-terracotta/20'
                }`}>
                  {inst.state === 'Failed' ? '执行异常' : inst.state === 'Suspended' ? '已挂起' : '运行中'}
                </span>
              </div>
              <div className="p-2 bg-ivory rounded border border-border-cream">
                <p className="text-[11px] font-serif font-bold text-anthropic-black truncate">{getDefinitionName(inst.definitionId)}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Content: Instance Details */}
      <div className="flex-1 bg-white rounded-comfortable border border-border-cream shadow-whisper overflow-hidden flex flex-col">
        {selectedInstance ? (
          <>
            {/* Detail Header */}
            <div className="p-6 border-b border-border-cream bg-dark-surface text-warm-silver flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Terminal size={18} className="text-terracotta" />
                  <h2 className="text-xl font-serif text-ivory tracking-tight">{selectedInstance.id}</h2>
                  <span className="text-[10px] bg-anthropic-black text-stone-gray px-2 py-0.5 rounded border border-dark-warm font-mono">
                    {getDefinitionName(selectedInstance.definitionId)}
                  </span>
                </div>
                <div className="flex gap-4 text-[10px] font-sans text-stone-gray">
                  <span>业务流水号: <span className="text-warm-silver font-mono">{selectedInstance.businessKey || '无'}</span></span>
                  <span className="w-[1px] bg-dark-warm h-3 mt-0.5" />
                  <span>状态: <span className={selectedInstance.state === 'Failed' ? 'text-crimson font-bold' : 'text-terracotta font-bold'}>{selectedInstance.state}</span></span>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedInstance.suspended ? (
                  <Button size="sm" variant="outline" className="border-dark-warm text-stone-gray hover:text-ivory" onClick={handleActivate}>
                    <PlayIcon size={14} className="mr-2" /> 激活
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="border-dark-warm text-stone-gray hover:text-ivory" onClick={handleSuspend}>
                    <PauseCircle size={14} className="mr-2" /> 挂起
                  </Button>
                )}
                <Button size="sm" variant="primary" className="bg-crimson/20 border-crimson/30 text-crimson hover:bg-crimson/30" onClick={handleTerminate}>
                  <StopCircle size={14} className="mr-2" /> 终止释放
                </Button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Timeline / Pipeline */}
              <div className="flex-1 p-8 overflow-y-auto bg-parchment/30 border-r border-border-cream">
                <h3 className="text-sm font-serif font-bold text-anthropic-black mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-terracotta" />
                  执行链路 (Execution Pipeline)
                </h3>

                {detailLoading ? (
                  <div className="italic text-stone-gray text-sm font-sans flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> 正在加载链路状态...
                  </div>
                ) : (
                  <div className="relative border-l border-border-warm ml-4 space-y-8 pb-8">
                    {steps.filter(s => s.activityType !== 'processDefinition').map((step, idx) => {
                      const incident = incidents.find(inc => inc.activityId === step.activityId);
                      return (
                        <div key={step.id} className="relative pl-10">
                          <div className={`
                            absolute -left-[13px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-ring ring-border-cream
                            ${step.status === 'Completed' ? 'bg-terracotta text-ivory' : 
                              step.status === 'Running' ? 'bg-anthropic-black text-ivory animate-pulse' : 
                              step.status === 'Failed' ? 'bg-crimson text-ivory shadow-[0_0_12px_rgba(181,51,51,0.4)]' : 'bg-ivory text-stone-gray'}
                          `}>
                            {step.status === 'Completed' ? <CheckCircle size={12} /> : 
                             step.status === 'Failed' ? <XCircle size={12} /> : 
                             <span className="text-[10px] font-bold">{idx + 1}</span>}
                          </div>

                          <Card className={`p-4 transition-all ${step.status === 'Failed' ? 'bg-crimson/5 border-crimson/10 ring-1 ring-crimson/20' : 'bg-white'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-sm font-serif font-bold text-anthropic-black flex items-center gap-2">
                                {step.activityName || step.activityId}
                                <span className="text-[9px] font-mono font-bold bg-ivory border border-border-cream text-stone-gray px-1.5 py-0.5 rounded-subtle uppercase tracking-widest">
                                  {step.activityType}
                                </span>
                              </h4>
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] font-mono text-stone-gray">
                                  {new Date(step.startTime).toLocaleTimeString()}
                                </span>
                                {step.durationInMillis && (
                                  <span className="text-[9px] text-dark-warm font-sans">耗时: {(step.durationInMillis / 1000).toFixed(1)}s</span>
                                )}
                              </div>
                            </div>
                            
                            {step.status === 'Failed' && incident && (
                              <div className="mt-4 border-t border-crimson/10 pt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                  <p className="text-[10px] font-sans font-bold text-crimson uppercase tracking-widest flex items-center gap-1">
                                    <ShieldAlert size={10} /> 异常堆栈日志
                                  </p>
                                  <span className="text-[9px] font-mono text-dark-warm">Job ID: {incident.jobId || 'N/A'}</span>
                                </div>
                                <div className="bg-anthropic-black text-coral p-4 rounded-generous text-[11px] font-mono whitespace-pre-wrap overflow-x-auto border border-dark-surface shadow-inner max-h-40 overflow-y-auto leading-relaxed">
                                  {incident.incidentMessage}
                                </div>
                                <div className="flex gap-3">
                                  <Button 
                                    size="sm" 
                                    variant="terracotta" 
                                    className="flex-1"
                                    disabled={actionLoading === `retry-${incident.id}`}
                                    onClick={() => handleRetry(incident)}
                                  >
                                    {actionLoading === `retry-${incident.id}` ? <Loader2 size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />}
                                    原点重试 (Retry)
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <FastForward size={14} className="mr-2" /> 强制跳过 (Skip)
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Variables Panel */}
              <div className="w-80 bg-ivory flex flex-col shrink-0 border-l border-border-cream">
                <div className="p-6 border-b border-border-cream bg-white/50">
                  <h3 className="text-xs font-sans font-bold text-stone-gray uppercase tracking-widest flex items-center gap-2">
                    <Settings size={14} />
                    上下文变量 (Variables)
                  </h3>
                  <p className="text-[10px] text-dark-warm mt-1 font-sans">运行时变量热修改，支持即时干预。</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {Object.entries(variables).map(([name, varObj]) => (
                    <div key={name} className="space-y-1 group">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono font-bold text-stone-gray uppercase tracking-widest">
                          {name}
                        </label>
                        <span className="text-[9px] lowercase opacity-50 font-sans italic">{varObj.type}</span>
                      </div>
                      <div className="relative flex gap-2">
                        <input 
                          type="text" 
                          value={editingVariables[name] !== undefined ? (typeof editingVariables[name] === 'object' ? JSON.stringify(editingVariables[name]) : editingVariables[name]) : ''}
                          onChange={(e) => setEditingVariables({...editingVariables, [name]: e.target.value})}
                          className="flex-1 bg-white border border-border-warm rounded-subtle px-3 py-1.5 text-xs font-mono text-anthropic-black focus:outline-none focus:ring-1 focus:ring-terracotta transition-all"
                        />
                        <button 
                          onClick={() => handleSaveVariable(name)}
                          disabled={actionLoading === `var-${name}`}
                          className="p-1.5 text-stone-gray hover:text-terracotta transition-colors bg-white border border-border-warm rounded-subtle"
                          title="保存变量"
                        >
                          {actionLoading === `var-${name}` ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full text-[10px] font-bold border-dashed text-stone-gray hover:text-terracotta">
                    + 注入新变量
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-gray/40">
            <Terminal size={64} className="mb-6 opacity-20" />
            <p className="text-lg font-serif text-stone-gray">选择左侧异常实例进入诊断控制台</p>
            <p className="text-sm font-sans mt-2">支持智能日志分析、变量热修改与节点重试</p>
          </div>
        )}
      </div>
    </div>
  );
};
