import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { AlertCircle, Activity, Play, Square, Trash2, RefreshCw, Clock, User, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
// @ts-ignore
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import { authFetch } from '../utils';

interface ProcessDefinition {
  id: string;
  key: string;
  name: string | null;
  version: number;
}

interface ProcessInstance {
  id: string;
  definitionId: string;
  businessKey: string | null;
  suspended: boolean;
  tenantId: string | null;
}

export default function Monitor() {
  const [definitions, setDefinitions] = useState<ProcessDefinition[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [instances, setInstances] = useState<ProcessInstance[]>([]);
  const [historyTasks, setHistoryTasks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'instances' | 'tasks'>('instances');
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [stats, setStats] = useState<{ active: number, incidents: number, completedTasks: number }>({ active: 0, incidents: 0, completedTasks: 0 });
  const [loadingXml, setLoadingXml] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const bpmnViewerInstance = useRef<any>(null);
  const activeMarkers = useRef<string[]>([]);

  useEffect(() => {
    authFetch('/engine-rest/process-definition?latestVersion=true')
      .then(res => res.json())
      .then(data => {
        setDefinitions(data);
        if (data.length > 0) {
          handleSelectProcess(data[0].id);
        }
      });

    return () => {
      if (bpmnViewerInstance.current) {
        bpmnViewerInstance.current.destroy();
      }
    };
  }, []);

  const handleSelectProcess = async (id: string) => {
    setSelectedProcess(id);
    setLoadingXml(true);

    // Fetch stats
    try {
      const activeRes = await authFetch(`/engine-rest/process-instance/count?processDefinitionId=${id}`);
      const activeData = await activeRes.json();
      
      const incidentsRes = await authFetch(`/engine-rest/incident/count?processDefinitionId=${id}`);
      const incidentsData = await incidentsRes.json();

      const historyCountRes = await authFetch(`/engine-rest/history/activity-instance/count?processDefinitionId=${id}&finished=true`);
      const historyCountData = await historyCountRes.json();
      
      setStats({
        active: activeData.count || 0,
        incidents: incidentsData.count || 0,
        completedTasks: historyCountData.count || 0
      });

      // Fetch list based on current view mode
      if (viewMode === 'instances') {
        fetchInstances(id);
      } else {
        fetchHistoryTasks(id);
      }
    } catch (e) {
      console.error(e);
    }

    // Fetch XML
    try {
      const xmlRes = await authFetch(`/engine-rest/process-definition/${id}/xml`);
      const xmlData = await xmlRes.json();
      const bpmnXml = xmlData.bpmn20Xml;

      if (!bpmnViewerInstance.current) {
        bpmnViewerInstance.current = new BpmnViewer({
          container: viewerRef.current || undefined,
          width: '100%',
          height: '100%'
        });
      }

      await bpmnViewerInstance.current.importXML(bpmnXml);
      bpmnViewerInstance.current.get('canvas').zoom('fit-viewport');
      
      // Clear markers if no instance selected
      if (!selectedInstance) {
        clearMarkers();
      }
    } catch (e) {
      console.error('Error rendering BPMN', e);
    } finally {
      setLoadingXml(false);
    }
  };

  const fetchInstances = async (definitionId: string) => {
    setLoadingList(true);
    try {
      const res = await authFetch(`/engine-rest/process-instance?processDefinitionId=${definitionId}&maxResults=20`);
      const data = await res.json();
      setInstances(data);
    } catch (e) {
      console.error('Error fetching instances', e);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchHistoryTasks = async (definitionId: string) => {
    setLoadingList(true);
    try {
      // Use history/activity-instance instead of history/task to see all types of steps (Service Tasks, User Tasks, etc.)
      const res = await authFetch(`/engine-rest/history/activity-instance?processDefinitionId=${definitionId}&finished=true&maxResults=50&sortBy=endTime&sortOrder=desc`);
      const data = await res.json();
      
      // Filter out sequence flows and start/end events to keep the list focused on actual work steps
      const filteredData = data.filter((item: any) => 
        ['userTask', 'serviceTask', 'externalTask', 'callActivity', 'businessRuleTask', 'sendTask', 'receiveTask'].includes(item.activityType)
      );
      
      setHistoryTasks(filteredData);
    } catch (e) {
      console.error('Error fetching history activities', e);
    } finally {
      setLoadingList(false);
    }
  };

  const clearMarkers = () => {
    if (bpmnViewerInstance.current) {
      const canvas = bpmnViewerInstance.current.get('canvas');
      activeMarkers.current.forEach(id => {
        canvas.removeMarker(id, 'highlight');
      });
      activeMarkers.current = [];
    }
  };

  const handleSelectInstance = async (instanceId: string | null) => {
    setSelectedInstance(instanceId);
    clearMarkers();

    if (!instanceId || !bpmnViewerInstance.current) return;

    try {
      const res = await authFetch(`/engine-rest/process-instance/${instanceId}/activity-instances`);
      if (!res.ok) {
        // Might be a completed instance, try history
        const historyRes = await authFetch(`/engine-rest/history/activity-instance?processInstanceId=${instanceId}`);
        const historyData = await historyRes.json();
        const canvas = bpmnViewerInstance.current.get('canvas');
        historyData.forEach((act: any) => {
          if (act.activityId && act.activityId !== selectedProcess) {
            canvas.addMarker(act.activityId, 'highlight');
            activeMarkers.current.push(act.activityId);
          }
        });
        return;
      }
      const data = await res.json();
      
      const canvas = bpmnViewerInstance.current.get('canvas');
      const collectActivities = (node: any) => {
        if (node.activityId && node.activityId !== selectedProcess) {
          canvas.addMarker(node.activityId, 'highlight');
          activeMarkers.current.push(node.activityId);
        }
        if (node.childActivityInstances) {
          node.childActivityInstances.forEach(collectActivities);
        }
      };
      collectActivities(data);
    } catch (e) {
      console.error('Error highlighting activities', e);
    }
  };

  const handleInstanceAction = async (instanceId: string, action: 'suspend' | 'resume' | 'delete') => {
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this process instance?')) return;
        await authFetch(`/engine-rest/process-instance/${instanceId}`, { method: 'DELETE' });
      } else {
        await authFetch(`/engine-rest/process-instance/${instanceId}/suspended`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ suspended: action === 'suspend' })
        });
      }
      
      // Refresh
      if (selectedProcess) {
        fetchInstances(selectedProcess);
        if (action === 'delete') {
          setSelectedInstance(null);
          clearMarkers();
        } else {
          // Update local state for immediate feedback
          setInstances(prev => prev.map(inst => 
            inst.id === instanceId ? { ...inst, suspended: action === 'suspend' } : inst
          ));
        }
      }
    } catch (e) {
      console.error('Action failed', e);
      alert('Action failed');
    }
  };

  return (
    <div className="container section">
      <div className="mb-8">
        <h2>Process Monitor</h2>
        <p className="text-secondary">Track process instances and inspect BPMN diagrams dynamically.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
        {/* Sidebar */}
        <div className="flex-col gap-4" style={{ display: 'flex' }}>
          <h4 className="mb-2">Definitions</h4>
          {definitions.map(def => (
            <div 
              key={def.id}
              onClick={() => handleSelectProcess(def.id)}
              style={{
                padding: '16px',
                backgroundColor: selectedProcess === def.id ? 'var(--surface-prominent)' : 'var(--surface-raised)',
                border: `1px solid ${selectedProcess === def.id ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div className="mono-label mb-2">{def.key}</div>
              <div style={{ fontWeight: 500, fontSize: '15px' }}>{def.name || def.key}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-col gap-6" style={{ display: 'flex' }}>
          {/* Stats Bar */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <Card variant="feature" style={{ flex: 1, padding: '24px' }}>
              <div className="flex items-center gap-4">
                <div style={{ padding: '16px', backgroundColor: 'rgba(0, 82, 239, 0.1)', borderRadius: 'var(--radius-pill)', color: 'var(--brand-hover)' }}>
                  <Activity size={24} />
                </div>
                <div>
                  <div className="mono-label">Active Instances</div>
                  <h2 style={{ margin: 0, marginTop: '4px' }}>{stats.active}</h2>
                </div>
              </div>
            </Card>

            <Card variant="feature" style={{ flex: 1, padding: '24px' }}>
              <div className="flex items-center gap-4">
                <div style={{ padding: '16px', backgroundColor: 'rgba(0, 201, 153, 0.1)', borderRadius: 'var(--radius-pill)', color: 'var(--accent-green)' }}>
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="mono-label" style={{ color: 'var(--accent-green)' }}>Completed Tasks</div>
                  <h2 style={{ margin: 0, marginTop: '4px' }}>{stats.completedTasks}</h2>
                </div>
              </div>
            </Card>

            <Card variant="feature" style={{ flex: 1, padding: '24px' }}>
              <div className="flex items-center gap-4">
                <div style={{ padding: '16px', backgroundColor: 'rgba(221, 0, 0, 0.1)', borderRadius: 'var(--radius-pill)', color: 'var(--accent-red)' }}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <div className="mono-label" style={{ color: 'var(--accent-red)' }}>Incidents</div>
                  <h2 style={{ margin: 0, marginTop: '4px' }}>{stats.incidents}</h2>
                </div>
              </div>
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '32px' }}>
            {/* BPMN Viewer Wrapper */}
            <div className="flex-col gap-6">
              <Card style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '20px' }}>Process Diagram</h4>
                  <div className="flex gap-2">
                    {selectedInstance && (
                      <Badge variant="filled" style={{ backgroundColor: 'var(--brand-hover)' }}>
                        Instance: {selectedInstance.substring(0, 8)}...
                      </Badge>
                    )}
                    {loadingXml && <Badge variant="subtle">Loading XML...</Badge>}
                  </div>
                </div>
                
                <div 
                  ref={viewerRef} 
                  style={{ flex: 1, width: '100%', backgroundColor: 'var(--bg-canvas)' }}
                  className="bjs-container"
                />
              </Card>
            </div>

            {/* Instance/Task List */}
            <div className="flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1 p-1 bg-surface-raised rounded-md border border-subtle">
                  <Button 
                    variant="label" 
                    size="sm"
                    onClick={() => { setViewMode('instances'); selectedProcess && fetchInstances(selectedProcess); }}
                    style={{ 
                      backgroundColor: viewMode === 'instances' ? 'var(--surface-prominent)' : 'transparent',
                      color: viewMode === 'instances' ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    Active
                  </Button>
                  <Button 
                    variant="label" 
                    size="sm"
                    onClick={() => { setViewMode('tasks'); selectedProcess && fetchHistoryTasks(selectedProcess); }}
                    style={{ 
                      backgroundColor: viewMode === 'tasks' ? 'var(--surface-prominent)' : 'transparent',
                      color: viewMode === 'tasks' ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    History
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => selectedProcess && (viewMode === 'instances' ? fetchInstances(selectedProcess) : fetchHistoryTasks(selectedProcess))} disabled={!selectedProcess || loadingList}>
                  <RefreshCw size={14} className={loadingList ? 'spin' : ''} />
                </Button>
              </div>

              <div className="flex-col gap-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {viewMode === 'instances' ? (
                  instances.map(inst => (
                    <div 
                      key={inst.id}
                      onClick={() => handleSelectInstance(inst.id)}
                      style={{
                        padding: '16px',
                        backgroundColor: selectedInstance === inst.id ? 'var(--surface-prominent)' : 'var(--surface-raised)',
                        border: `1px solid ${selectedInstance === inst.id ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="mono-label" style={{ fontSize: '10px' }}>ID: <span className="mono">{inst.id.substring(0, 8)}...</span></div>
                        {inst.suspended && <Badge variant="subtle" style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}>Suspended</Badge>}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <User size={14} />
                        <span className="mono">{inst.businessKey || 'No Business Key'}</span>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-subtle" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderColor: 'var(--border-subtle)' }}>
                        {inst.suspended ? (
                          <Button variant="ghost" size="sm" style={{ flex: 1, fontSize: '12px' }} onClick={(e) => { e.stopPropagation(); handleInstanceAction(inst.id, 'resume'); }}>
                            <Play size={12} style={{ marginRight: '4px' }} /> Resume
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" style={{ flex: 1, fontSize: '12px' }} onClick={(e) => { e.stopPropagation(); handleInstanceAction(inst.id, 'suspend'); }}>
                            <Square size={12} style={{ marginRight: '4px' }} /> Suspend
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" style={{ flex: 1, fontSize: '12px', color: 'var(--accent-red)' }} onClick={(e) => { e.stopPropagation(); handleInstanceAction(inst.id, 'delete'); }}>
                          <Trash2 size={12} style={{ marginRight: '4px' }} /> Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  historyTasks.map(act => (
                    <div 
                      key={act.id}
                      onClick={() => handleSelectInstance(act.processInstanceId)}
                      style={{
                        padding: '16px',
                        backgroundColor: selectedInstance === act.processInstanceId ? 'var(--surface-prominent)' : 'var(--surface-raised)',
                        border: `1px solid ${selectedInstance === act.processInstanceId ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="mono-label" style={{ fontSize: '10px' }}>ACT: <span className="mono">{act.id.substring(0, 8)}...</span></div>
                        <Badge variant="subtle" style={{ color: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}>{act.activityType}</Badge>
                      </div>
                      
                      <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '8px' }}>{act.activityName || act.activityId}</div>
                      
                      <div className="flex items-center gap-2 text-tertiary" style={{ fontSize: '12px' }}>
                        <Clock size={12} />
                        <span className="mono">End: {new Date(act.endTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-tertiary" style={{ fontSize: '12px', marginTop: '4px' }}>
                        <Activity size={12} />
                        <span className="mono">ID: {act.activityId}</span>
                      </div>
                    </div>
                  ))
                )}
                
                {viewMode === 'instances' && instances.length === 0 && !loadingList && (
                  <div className="text-center p-8 text-tertiary mono" style={{ border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '12px' }}>
                    No active instances
                  </div>
                )}
                {viewMode === 'tasks' && historyTasks.length === 0 && !loadingList && (
                  <div className="text-center p-8 text-tertiary mono" style={{ border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '12px' }}>
                    No completed tasks
                  </div>
                )}
                {loadingList && <div className="text-center p-8 text-tertiary">Loading...</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
