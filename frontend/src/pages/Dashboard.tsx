import React, { useState, useEffect, useCallback } from 'react';
import { PlayCircle, GitBranch, RefreshCw, Calendar, Clock } from 'lucide-react';
import { camundaService, Metrics, ProcessDefinition } from '../services/camundaService';
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
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  // TODO: Implement backend support for date range filtering in future tracks
  const [dateRange, setDateRange] = useState('all-time');
  
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    // Note: Date range filtering is placeholder as backend currently aggregates all historic data
    try {
      const [metricsData, processModels] = await Promise.all([
        camundaService.getMetrics(),
        camundaService.getProcessDefinitions(),
        camundaService.getEngineVersion()
      ]);
      setMetrics(metricsData);
      setModels(processModels);
      setEngineStatus('online');
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/40 p-6 rounded-generous border border-border-cream backdrop-blur-sm">
        <div>
          <h1 className="text-4xl font-serif text-anthropic-black mb-2">整体概览</h1>
          <p className="text-olive-gray font-sans text-lg">工作流引擎运行状态与全站核心指标实时监控。</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-ivory border border-border-cream rounded-generous px-3 py-1.5 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-stone-gray mr-2" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs font-sans font-bold text-anthropic-black outline-none cursor-pointer"
            >
              <option value="last-1h">最近 1 小时</option>
              <option value="last-24h">最近 24 小时</option>
              <option value="last-7d">最近 7 天</option>
              <option value="all-time">所有时间</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-ivory border border-border-cream rounded-generous px-3 py-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-stone-gray" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-gray">自动刷新</span>
            <input 
              type="checkbox" 
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-3 h-3 accent-terracotta cursor-pointer"
            />
            {autoRefresh && (
              <select 
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-[10px] font-sans font-bold text-terracotta outline-none cursor-pointer border-l border-border-cream pl-2 ml-1"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>
            )}
          </div>

          <Button 
            variant="secondary" 
            size="sm" 
            onClick={fetchDashboardData}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-stone-gray' : ''}`} />
            <span>立即刷新</span>
          </Button>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-highly border ${engineStatus === 'online' ? 'bg-terracotta/5 border-terracotta/20 text-terracotta' : 'bg-crimson/5 border-crimson/20 text-crimson'}`}>
            <div className={`w-2 h-2 rounded-full ${engineStatus === 'online' ? 'bg-terracotta animate-pulse' : 'bg-crimson'}`} />
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest">
              Engine: {engineStatus === 'online' ? 'Healthy' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      {metrics ? (
        <WidgetGrid>
          <ProcessStatsCard stats={metrics.processStats} />
          <TaskMetricsCard metrics={metrics.taskMetrics} />
          <SystemHealthCard health={metrics.systemHealth} />
          
          <WidgetCard title="快捷操作" icon={PlayCircle}>
            <div className="flex flex-col gap-3 mt-2">
              <Button size="sm" onClick={() => navigate('/models')} className="justify-start">
                部署新流程模型
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/instances')} className="justify-start">
                查看活跃任务
              </Button>
            </div>
          </WidgetCard>
        </WidgetGrid>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-6 h-48 bg-white/50 animate-pulse border-border-cream" />
          ))}
        </div>
      )}

      {/* Model Matrix Section (Kept from original dashboard) */}
      <div className="space-y-6 pt-4">
        <div className="flex justify-between items-center px-2 border-l-4 border-terracotta pl-4">
          <h3 className="text-2xl font-serif text-anthropic-black">流程模型矩阵 (Model Matrix)</h3>
          <button 
            onClick={() => navigate('/models')}
            className="text-xs text-stone-gray font-sans font-bold uppercase tracking-widest hover:text-terracotta transition-colors"
          >
            管理所有模型 →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="p-6 h-48 bg-white/50 animate-pulse border-border-cream" />
            ))
          ) : models.length === 0 ? (
            <div className="col-span-full p-12 text-center text-stone-gray font-sans italic bg-white rounded-comfortable border border-dashed border-border-warm">
              暂无已部署的工作流模型。
            </div>
          ) : models.slice(0, 8).map((model) => {
            // Stats logic here would need to be integrated with the new Metrics if per-model stats are needed
            // For now, keeping the visual structure but we might need per-model stats from backend too later
            return (
              <Card 
                key={model.id} 
                className="p-6 hover:ring-2 hover:ring-terracotta transition-all cursor-pointer group bg-white flex flex-col justify-between h-56 border-border-cream"
                onClick={() => navigate('/instances')}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-comfortable bg-parchment text-terracotta border border-border-warm">
                      <GitBranch size={18} />
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1 text-terracotta transition-opacity">
                      <PlayCircle size={20} />
                    </button>
                  </div>
                  <h4 className="font-serif font-bold text-anthropic-black text-sm mb-1 truncate" title={model.name || model.key}>
                    {model.name || model.key}
                  </h4>
                  <p className="text-[10px] text-stone-gray font-mono mb-4">{model.key}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-sans uppercase tracking-tighter">
                    <span className="text-stone-gray">版本 <b>V{model.version}</b></span>
                    <span className="text-olive-gray">{model.suspended ? '已挂起' : '活跃中'}</span>
                  </div>
                  
                  <div className="w-full bg-border-cream h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-terracotta transition-all duration-1000"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
