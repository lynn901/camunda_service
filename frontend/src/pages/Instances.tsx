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
  Settings
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
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filterDefinition, setFilterDefinition] = useState<string>('All');

  useEffect(() => {
    fetchInitialData();
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
    setLoading(true);
    try {
      const filter = filterDefinition === 'All' ? {} : { processDefinitionKey: filterDefinition };
      const data = await camundaService.getProcessInstances(filter);
      
      // Fetch incidents for each instance to determine state
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
      
      // Merge incident info into steps
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
    } catch (err) {
      console.error('Failed to fetch details', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedInstance) return;
    try {
      await camundaService.suspendProcessInstance(selectedInstance.id);
      fetchInstances();
      if (selectedInstance) fetchInstanceDetails(selectedInstance.id);
    } catch (err) {
      alert('Failed to suspend');
    }
  };

  const handleActivate = async () => {
    if (!selectedInstance) return;
    try {
      await camundaService.activateProcessInstance(selectedInstance.id);
      fetchInstances();
      if (selectedInstance) fetchInstanceDetails(selectedInstance.id);
    } catch (err) {
      alert('Failed to activate');
    }
  };

  const handleTerminate = async () => {
    if (!selectedInstance || !confirm('Are you sure you want to terminate this instance?')) return;
    try {
      await camundaService.terminateProcessInstance(selectedInstance.id);
      setSelectedInstance(null);
      fetchInstances();
    } catch (err) {
      alert('Failed to terminate');
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
          <h3 className="text-lg font-serif text-anthropic-black mb-4">Instance Intervention</h3>
          <div className="relative group">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-gray" />
            <select 
              className="w-full bg-white border border-border-warm rounded-generous pl-10 pr-4 py-2 text-xs font-sans font-medium text-anthropic-black focus:outline-none focus:ring-1 focus:ring-terracotta appearance-none transition-all cursor-pointer"
              value={filterDefinition}
              onChange={(e) => setFilterDefinition(e.target.value)}
            >
              <option value="All">All Models ({instances.length})</option>
              {definitions.map(def => (
                <option key={def.key} value={def.key}>{def.name || def.key}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-parchment/30">
          {loading ? (
            <div className="h-full flex items-center justify-center italic text-stone-gray font-sans text-sm">
              Syncing with engine...
            </div>
          ) : instances.length === 0 ? (
            <div className="h-full flex items-center justify-center italic text-stone-gray font-sans text-sm text-center px-8">
              No active or failed instances found for this selection.
            </div>
          ) : instances.map(inst => (
            <Card 
              key={inst.id} 
              onClick={() => setSelectedInstance(inst)}
              className={`p-4 cursor-pointer transition-all ${selectedInstance?.id === inst.id ? 'ring-2 ring-terracotta bg-white' : 'hover:bg-white'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="overflow-hidden">
                  <span className="font-mono text-[10px] font-bold text-stone-gray block truncate">{inst.id}</span>
                  <p className="text-[10px] text-stone-gray mt-1 truncate">Biz: <span className="text-anthropic-black font-medium">{inst.businessKey || 'N/A'}</span></p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-highly uppercase tracking-tighter border ${
                  inst.state === 'Failed' ? 'bg-crimson/5 text-crimson border-crimson/20' : 
                  inst.state === 'Suspended' ? 'bg-stone-gray/5 text-stone-gray border-stone-gray/20' : 
                  'bg-terracotta/5 text-terracotta border-terracotta/20'
                }`}>
                  {inst.state}
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
                  <span>Business Key: <span className="text-warm-silver font-mono">{selectedInstance.businessKey || 'N/A'}</span></span>
                  <span className="w-[1px] bg-dark-warm h-3 mt-0.5" />
                  <span>Status: <span className={selectedInstance.state === 'Failed' ? 'text-crimson' : 'text-terracotta'}>{selectedInstance.state}</span></span>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedInstance.suspended ? (
                  <Button size="sm" variant="outline" className="border-dark-warm text-stone-gray hover:text-ivory" onClick={handleActivate}>
                    <PlayIcon size={14} className="mr-2" /> Activate
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="border-dark-warm text-stone-gray hover:text-ivory" onClick={handleSuspend}>
                    <PauseCircle size={14} className="mr-2" /> Suspend
                  </Button>
                )}
                <Button size="sm" variant="primary" className="bg-crimson/20 border-crimson/30 text-crimson hover:bg-crimson/30" onClick={handleTerminate}>
                  <StopCircle size={14} className="mr-2" /> Terminate
                </Button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Timeline / Pipeline */}
              <div className="flex-1 p-8 overflow-y-auto bg-parchment/30 border-r border-border-cream">
                <h3 className="text-sm font-serif font-bold text-anthropic-black mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-terracotta" />
                  Execution Pipeline
                </h3>

                {detailLoading ? (
                  <div className="italic text-stone-gray text-sm font-sans">Loading timeline...</div>
                ) : (
                  <div className="relative border-l border-border-warm ml-4 space-y-8 pb-8">
                    {steps.filter(s => s.activityType !== 'processDefinition').map((step, idx) => (
                      <div key={step.id} className="relative pl-10">
                        {/* Dot */}
                        <div className={`
                          absolute -left-[13px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-ring ring-border-cream
                          ${step.status === 'Completed' ? 'bg-terracotta text-ivory' : 
                            step.status === 'Running' ? 'bg-anthropic-black text-ivory animate-pulse' : 
                            step.status === 'Failed' ? 'bg-crimson text-ivory' : 'bg-ivory text-stone-gray'}
                        `}>
                          {step.status === 'Completed' ? <CheckCircle size={12} /> : 
                           step.status === 'Failed' ? <XCircle size={12} /> : 
                           <span className="text-[10px] font-bold">{idx + 1}</span>}
                        </div>

                        {/* Step Card */}
                        <Card className={`p-4 ${step.status === 'Failed' ? 'bg-crimson/5 border-crimson/10' : 'bg-white'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-serif font-bold text-anthropic-black flex items-center gap-2">
                              {step.activityName || step.activityId}
                              <span className="text-[9px] font-mono font-bold bg-ivory border border-border-cream text-stone-gray px-1.5 py-0.5 rounded-subtle uppercase tracking-widest">
                                {step.activityType}
                              </span>
                            </h4>
                            <span className="text-[10px] font-mono text-stone-gray">
                              {new Date(step.startTime).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          {step.status === 'Failed' && incidents.find(inc => inc.activityId === step.activityId) && (
                            <div className="mt-4 border-t border-crimson/10 pt-4 space-y-3">
                              <p className="text-[10px] font-sans font-bold text-crimson uppercase tracking-widest">Exception Stack Trace</p>
                              <div className="bg-anthropic-black text-coral p-4 rounded-generous text-[11px] font-mono whitespace-pre-wrap overflow-x-auto border border-dark-surface shadow-inner max-h-40 overflow-y-auto leading-relaxed">
                                {incidents.find(inc => inc.activityId === step.activityId)?.incidentMessage}
                              </div>
                              <div className="flex gap-3">
                                <Button size="sm" variant="terracotta" className="flex-1">
                                  <RefreshCw size={14} className="mr-2" /> Retry Node
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1">
                                  <FastForward size={14} className="mr-2" /> Skip Step
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Variables Panel */}
              <div className="w-80 bg-ivory flex flex-col shrink-0 border-l border-border-cream">
                <div className="p-6 border-b border-border-cream bg-white/50">
                  <h3 className="text-xs font-sans font-bold text-stone-gray uppercase tracking-widest flex items-center gap-2">
                    <Settings size={14} />
                    Context Variables
                  </h3>
                  <p className="text-[10px] text-dark-warm mt-1 font-sans">Hot-edit runtime variables for intervention.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {Object.entries(variables).map(([name, varObj]) => (
                    <div key={name} className="space-y-1 group">
                      <label className="text-[10px] font-mono font-bold text-stone-gray uppercase tracking-widest flex justify-between">
                        {name}
                        <span className="text-[9px] lowercase opacity-50">{varObj.type}</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          defaultValue={JSON.stringify(varObj.value)}
                          className="w-full bg-white border border-border-warm rounded-subtle px-3 py-1.5 text-xs font-mono text-anthropic-black focus:outline-none focus:ring-1 focus:ring-terracotta transition-all"
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full text-[10px] font-bold border-dashed">
                    + Inject New Variable
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-gray/40">
            <Terminal size={64} className="mb-6 opacity-20" />
            <p className="text-lg font-serif">Select an instance to begin intervention.</p>
            <p className="text-sm font-sans mt-2">Support for log diagnostics, variable hot-editing, and node retries.</p>
          </div>
        )}
      </div>
    </div>
  );
};
