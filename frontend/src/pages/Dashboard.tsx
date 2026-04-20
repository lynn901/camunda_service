import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayCircle, GitBranch, RefreshCw, Calendar, Clock, Download, Zap } from 'lucide-react';
import { camundaService } from '../services/camundaService';
import type { Metrics, ProcessDefinition } from '../services/camundaService';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { WidgetGrid, WidgetCard } from '../components/ui/WidgetGrid';
import { ProcessStatsCard, TaskMetricsCard, SystemHealthCard } from '../components/ui/MetricCards';
import { Button } from '../components/ui/Button';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [models, setModels] = useState<ProcessDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [engineStatus, setEngineStatus] = useState<'online' | 'offline'>('offline');
  const [autoRefresh, setAutoRefresh] = useState(true); // Default to true for design
  const [refreshInterval, setRefreshInterval] = useState(10); // Default to 10s
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  // TODO: Implement backend support for date range filtering in future tracks
  const [dateRange, setDateRange] = useState('all-time');
  
  const navigate = useNavigate();
  const syncTimerRef = useRef<number>(0);

  const handleExport = useCallback(() => {
    if (!metrics) return;
    
    const dataStr = JSON.stringify(metrics, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [metrics]);

  const fetchDashboardData = useCallback(async () => {
    const start = performance.now();
    try {
      const [metricsData, processModels] = await Promise.all([
        camundaService.getMetrics(),
        camundaService.getProcessDefinitions(),
        camundaService.getEngineVersion()
      ]);
      setMetrics(metricsData);
      setModels(processModels);
      setEngineStatus('online');
      setLastSyncTime(Math.round(performance.now() - start));
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      setEngineStatus('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const timer = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval * 1000);
    
    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, fetchDashboardData]);

  return (
    <div className="p-8 max-w-7xl w-full mx-auto space-y-8 animate-in fade-in duration-700 font-body">
      {/* Hero Header Section */}
      <section className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight">整体概览</h1>
          <p className="text-on-surface-variant text-sm mt-1 max-w-xl">生产集群和活动流程编排周期的实时遥测数据。</p>
        </div>
        <div className="flex space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-container-highest text-on-surface-variant uppercase tracking-wider">
            <span className={`w-2 h-2 rounded-full mr-2 ${engineStatus === 'online' ? 'bg-tertiary animate-pulse' : 'bg-error'}`}></span>
            同步中: {lastSyncTime}ms
          </span>
          <button 
            className="px-4 py-1.5 bg-surface-container-highest text-on-surface text-[10px] uppercase tracking-widest font-bold hover:bg-surface-container-high transition-colors"
            onClick={handleExport}
          >
            导出
          </button>
        </div>
      </section>

      {/* KPI Row - Using custom Grid for 5 columns */}
      {metrics ? (
        <WidgetGrid className="lg:grid-cols-5">
          <ProcessStatsCard stats={metrics.processStats} />
          <TaskMetricsCard metrics={metrics.taskMetrics} />
          <SystemHealthCard health={metrics.systemHealth} />
        </WidgetGrid>
      ) : (
        <WidgetGrid className="lg:grid-cols-5">
          {Array(5).fill(0).map((_, i) => (
            <Card key={i} className="p-6 h-32 bg-surface-container-low animate-pulse border-outline-variant/10">
              <div className="h-full w-full" />
            </Card>
          ))}
        </WidgetGrid>
      )}

      {/* Control & Model Matrix Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Model Matrix Section - 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
            <h3 className="text-xl font-headline font-semibold text-on-surface">模型矩阵</h3>
            <button 
              onClick={() => navigate('/models')}
              className="text-xs font-label uppercase tracking-widest text-tertiary flex items-center hover:underline"
            >
              查看仓库 <PlayCircle className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="p-6 h-48 bg-surface-container-low animate-pulse border-outline-variant/10" />
              ))
            ) : models.length === 0 ? (
              <div className="col-span-full p-12 text-center text-on-surface-variant italic bg-surface-container-low rounded-comfortable border border-dashed border-outline-variant">
                暂无已部署的工作流模型。
              </div>
            ) : models.slice(0, 6).map((model) => (
              <WidgetCard 
                key={model.id} 
                title={model.name || model.key}
                className="cursor-pointer"
                onClick={() => navigate('/instances')}
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-headline font-semibold">
                      {/* Random threads for visual consistency with design mockup */}
                      {Math.floor(Math.random() * 5000).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-label text-on-surface-variant/60 uppercase">活动线程</span>
                  </div>
                  
                  <div className="h-12 w-full flex items-end space-x-0.5">
                    {Array(10).fill(0).map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`flex-1 ${model.suspended ? 'bg-error/30' : 'bg-tertiary/30'} hover:opacity-100 transition-opacity`}
                        style={{ height: `${20 + Math.random() * 80}%` }}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-label text-on-surface-variant/60 uppercase pt-2 border-t border-outline-variant/10">
                    <span>版本 V{model.version}</span>
                    <span className={model.suspended ? 'text-error' : 'text-tertiary'}>
                      {model.suspended ? '已挂起' : '运行中'}
                    </span>
                  </div>
                </div>
              </WidgetCard>
            ))}
          </div>
        </div>

        {/* Quick Actions & Sync Controls - 1 col */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
            <h3 className="text-xl font-headline font-semibold text-on-surface">控制面板</h3>
          </div>
          
          <div className="space-y-4">
            <WidgetCard title="同步设置" icon={RefreshCw}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">自动刷新</span>
                  <input 
                    type="checkbox" 
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4 accent-tertiary cursor-pointer"
                  />
                </div>
                {autoRefresh && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant">间隔频率</span>
                    <select 
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="bg-surface-container text-xs font-bold text-tertiary outline-none p-1 rounded"
                    >
                      <option value={5}>5s</option>
                      <option value={10}>10s</option>
                      <option value={30}>30s</option>
                      <option value={60}>60s</option>
                    </select>
                  </div>
                )}
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={fetchDashboardData}
                  className="w-full flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>立即同步数据</span>
                </Button>
              </div>
            </WidgetCard>

            <WidgetCard title="快速干预" icon={Zap}>
              <div className="flex flex-col gap-3">
                <Button size="sm" onClick={() => navigate('/models')} className="bg-primary hover:bg-primary-dim text-on-primary text-[10px] font-bold uppercase tracking-widest py-2">
                  部署新模型
                </Button>
                <Button variant="secondary" size="sm" onClick={() => navigate('/instances')} className="text-[10px] font-bold uppercase tracking-widest py-2 border-outline-variant/30">
                  活跃实例监控
                </Button>
              </div>
            </WidgetCard>
          </div>
        </div>
      </div>

      {/* Bottom Content: Recent Interventions & Anomaly Alert Stream */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-low p-6 ring-1 ring-outline-variant/10">
          <h3 className="text-xl font-headline font-semibold mb-6 text-on-surface">最近干预</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-surface-container-lowest border-l-4 border-tertiary">
              <div className="flex items-center space-x-4">
                <Zap className="w-4 h-4 text-tertiary" />
                <div>
                  <p className="text-xs font-bold">节点扩容: AWS-EAST-1</p>
                  <p className="text-[10px] text-on-surface-variant">实例激增触发自动扩容组。</p>
                </div>
              </div>
              <p className="text-[10px] font-label text-on-surface-variant">2分钟前</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container-lowest border-l-4 border-error">
              <div className="flex items-center space-x-4">
                <Zap className="w-4 h-4 text-error" />
                <div>
                  <p className="text-xs font-bold">模型停止: Settlement-Core</p>
                  <p className="text-[10px] text-on-surface-variant">由于数据库锁定，由运维管理员手动干预。</p>
                </div>
              </div>
              <p className="text-[10px] font-label text-on-surface-variant">14分钟前</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container-lowest border-l-4 border-outline-variant">
              <div className="flex items-center space-x-4">
                <Zap className="w-4 h-4 text-outline-variant" />
                <div>
                  <p className="text-xs font-bold">部署: Analytics-V4</p>
                  <p className="text-[10px] text-on-surface-variant">滚动更新成功同步至所有节点。</p>
                </div>
              </div>
              <p className="text-[10px] font-label text-on-surface-variant">1小时前</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 ring-1 ring-outline-variant/10 flex flex-col">
          <h3 className="text-xl font-headline font-semibold mb-6 text-on-surface">异常警报流</h3>
          <div className="flex-1 space-y-4">
            <div className="flex items-start space-x-3 pb-4 border-b border-outline-variant/10">
              <Zap className="w-4 h-4 text-error mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold truncate">内存使用峰值 - 集群-B</h4>
                  <span className="text-[10px] text-on-surface-variant/60 whitespace-nowrap ml-2">刚刚</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">节点: node-production-04</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 pb-4 border-b border-outline-variant/10">
              <Zap className="w-4 h-4 text-error mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold truncate">模型执行超时</h4>
                  <span className="text-[10px] text-on-surface-variant/60 whitespace-nowrap ml-2">5分钟前</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">流程: 贷款审批 V2</p>
              </div>
            </div>
          </div>
          <button className="mt-6 w-full py-2 text-[10px] font-bold uppercase tracking-widest border border-outline-variant/30 hover:bg-surface-container-highest transition-colors">
            查看所有警报
          </button>
        </div>
      </section>
    </div>
  );
};
