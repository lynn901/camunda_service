import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Terminal, 
  Clock,
  CheckCircle,
  Loader2,
  Search
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { BpmnViewer } from '../components/ui/BpmnViewer';
import { camundaService } from '../services/camundaService';
import type { 
  ProcessInstance, 
  ProcessDefinition, 
  HistoricActivityInstance
} from '../services/camundaService';
import './History.css';

export const History: React.FC = () => {
  const [instances, setInstances] = useState<ProcessInstance[]>([]);
  const [definitions, setDefinitions] = useState<ProcessDefinition[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<ProcessInstance | null>(null);
  const [activities, setActivities] = useState<HistoricActivityInstance[]>([]);
  const [xml, setXml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [businessKeyFilter, setBusinessKeyFilter] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInstances();
    }, 500);
    return () => clearTimeout(timer);
  }, [businessKeyFilter]);

  useEffect(() => {
    if (selectedInstance) {
      fetchInstanceDetails(selectedInstance);
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
      const data = await camundaService.getHistoricInstances(businessKeyFilter || undefined);
      setInstances(data);
    } catch (err) {
      console.error('Failed to fetch instances', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstanceDetails = async (instance: ProcessInstance) => {
    setDetailLoading(true);
    try {
      const [historicActivities, xmlData] = await Promise.all([
        camundaService.getHistoricActivities(instance.id),
        camundaService.getProcessDefinitionXml(instance.definitionId)
      ]);
      setActivities(historicActivities);
      setXml(xmlData.bpmn20Xml);
    } catch (err) {
      console.error('Failed to fetch details', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const getDefinitionName = (defId: string) => {
    return definitions.find(d => d.id === defId || d.key === defId)?.name || defId.split(':')[0];
  };

  return (
    <div className="history-container">
      {/* Left Sidebar: Instance List */}
      <div className="history-sidebar">
        <div className="history-sidebar-header">
          <h3 className="history-sidebar-title">
            <Clock size={18} className="text-terracotta" />
            执行历史 (History)
          </h3>
          <div className="history-search-container">
            <Search size={14} className="history-search-icon" />
            <input 
              type="text"
              placeholder="搜索业务流水号..."
              className="history-search-input"
              value={businessKeyFilter}
              onChange={(e) => setBusinessKeyFilter(e.target.value)}
            />
          </div>
        </div>
        
        <div className="history-list">
          {loading ? (
            <div className="loading-overlay">
              <Loader2 size={16} className="spinning-icon" /> 正在查询历史数据...
            </div>
          ) : instances.length === 0 ? (
            <div className="loading-overlay text-center px-8">
              未找到匹配的历史实例。
            </div>
          ) : instances.map(inst => (
            <Card 
              key={inst.id} 
              onClick={() => setSelectedInstance(inst)}
              className={`history-item-card ${selectedInstance?.id === inst.id ? 'selected' : ''}`}
            >
              <div className="history-item-header">
                <div style={{ overflow: 'hidden' }}>
                  <span className="history-item-id">{inst.id}</span>
                  <p className="history-item-business-key">流水号: <span>{inst.businessKey || '无'}</span></p>
                </div>
                <span className={`history-status-badge ${
                  inst.state === 'COMPLETED' ? 'status-completed' : 
                  inst.state === 'EXTERNALLY_TERMINATED' ? 'status-terminated' : 
                  'status-active'
                }`}>
                  {inst.state === 'COMPLETED' ? '已完成' : inst.state === 'EXTERNALLY_TERMINATED' ? '已终止' : '进行中'}
                </span>
              </div>
              <div className="history-item-definition">
                <p>{getDefinitionName(inst.definitionId)}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Content: Instance Details */}
      <div className="history-detail-container">
        {selectedInstance ? (
          <>
            {/* Detail Header */}
            <div className="history-detail-header">
              <div>
                <div className="history-detail-title-row">
                  <Terminal size={18} className="text-terracotta" />
                  <h2 className="history-detail-id">{selectedInstance.id}</h2>
                  <span className="history-detail-badge">
                    {getDefinitionName(selectedInstance.definitionId)}
                  </span>
                </div>
                <div className="history-detail-meta">
                  <span>业务流水号: <span style={{ color: 'var(--color-warm-silver)', fontFamily: 'var(--font-mono)' }}>{selectedInstance.businessKey || '无'}</span></span>
                  <span className="history-detail-meta-separator" />
                  <span>状态: <span style={{ color: 'var(--color-terracotta)', fontWeight: 'bold' }}>{selectedInstance.state}</span></span>
                </div>
              </div>
            </div>

            <div className="history-detail-content">
              {/* Diagram */}
              <div className="history-diagram-section">
                <h3 className="history-section-title">
                  <Activity size={16} className="text-terracotta" />
                  流程执行可视化 (Execution Path)
                </h3>
                {detailLoading ? (
                  <div className="loading-overlay">
                    <Loader2 size={16} className="spinning-icon" /> 正在渲染流程图...
                  </div>
                ) : (
                  <BpmnViewer 
                    xml={xml} 
                    highlightedActivities={activities.map(a => a.activityId)} 
                  />
                )}
              </div>

              {/* Timeline */}
              <div className="history-timeline-section">
                <h3 className="history-section-title">
                  <Clock size={16} className="text-terracotta" />
                  历史轨迹 (Events)
                </h3>

                {detailLoading ? (
                  <div className="loading-overlay" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                    <Loader2 size={14} className="spinning-icon" /> 正在回溯执行路径...
                  </div>
                ) : (
                  <div className="timeline-track">
                    {activities.map((activity, idx) => (
                      <div key={activity.id} className="timeline-item">
                        <div className={`timeline-dot ${activity.endTime ? 'completed' : 'active'}`}>
                          {activity.endTime ? <CheckCircle size={12} /> : <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{idx + 1}</span>}
                        </div>

                        <Card className="timeline-card">
                          <div className="timeline-card-header">
                            <h4 className="timeline-card-title">
                              {activity.activityName || activity.activityId}
                              <span className="timeline-type-tag">
                                {activity.activityType}
                              </span>
                            </h4>
                            <div className="timeline-card-time">
                              <span className="timeline-time">
                                {new Date(activity.startTime).toLocaleString()}
                              </span>
                              {activity.durationInMillis && (
                                <span className="timeline-duration">耗时: {(activity.durationInMillis / 1000).toFixed(1)}s</span>
                              )}
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Clock size={64} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
            <p className="empty-state-title">选择左侧历史实例查看完整执行轨迹</p>
            <p className="empty-state-subtitle">可视化路径分析与耗时统计</p>
          </div>
        )}
      </div>
    </div>
  );
};
