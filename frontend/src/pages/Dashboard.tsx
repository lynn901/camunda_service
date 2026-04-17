import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Activity, ShieldAlert, GitBranch, PlayCircle } from 'lucide-react';
import { camundaService } from '../services/camundaService';
import type { ProcessDefinition } from '../services/camundaService';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({
    activeInstances: 0,
    incidents: 0,
    totalModels: 0,
    modelStats: {}
  });
  const [models, setModels] = useState<ProcessDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [engineStatus, setEngineStatus] = useState<'online' | 'offline'>('offline');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statistics, processModels] = await Promise.all([
        camundaService.getStatistics(),
        camundaService.getProcessDefinitions(),
        camundaService.getEngineVersion()
      ]);
      setStats(statistics);
      setModels(processModels);
      setEngineStatus('online');
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      setEngineStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  const kpiData = [
    { label: '活跃实例数', value: stats.activeInstances, icon: Activity, color: 'text-terracotta' },
    { label: '已部署模型', value: stats.totalModels, icon: GitBranch, color: 'text-stone-gray' },
    { label: '系统异常数', value: stats.incidents, icon: ShieldAlert, color: 'text-crimson' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-anthropic-black mb-3">系统大盘</h1>
          <p className="text-olive-gray font-sans text-lg">工作流引擎运行状态与核心指标实时监控。</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-highly border ${engineStatus === 'online' ? 'bg-terracotta/5 border-terracotta/20 text-terracotta' : 'bg-crimson/5 border-crimson/20 text-crimson'}`}>
          <div className={`w-2 h-2 rounded-full ${engineStatus === 'online' ? 'bg-terracotta animate-pulse' : 'bg-crimson'}`} />
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest">
            Engine: {engineStatus === 'online' ? 'Healthy' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {kpiData.map((stat) => (
          <Card key={stat.label} className="p-8" elevated>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-sans font-bold text-stone-gray uppercase tracking-widest mb-3">{stat.label}</p>
                <h3 className="text-5xl font-serif text-anthropic-black leading-none">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-generous bg-ivory ring-shadow ring-border-warm`}>
                <stat.icon className={`${stat.color} w-6 h-6`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-2xl font-serif text-anthropic-black">流程模型矩阵 (Model Matrix)</h3>
          <button 
            onClick={() => navigate('/models')}
            className="text-sm text-terracotta font-sans font-bold hover:underline"
          >
            管理所有模型 →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="p-6 h-48 bg-white/50 animate-pulse">
                <div />
              </Card>
            ))
          ) : models.length === 0 ? (
            <div className="col-span-full p-12 text-center text-stone-gray font-sans italic bg-white rounded-comfortable border border-dashed border-border-warm">
              暂无已部署的工作流模型。
            </div>
          ) : models.slice(0, 8).map((model) => {
            const mStats = stats.modelStats[model.key] || { active: 0, failed: 0, completed: 0, successRate: '100%' };
            return (
              <Card 
                key={model.id} 
                className="p-6 hover:ring-2 hover:ring-terracotta transition-all cursor-pointer group bg-white flex flex-col justify-between h-56"
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
                  <div className="flex justify-between text-[10px] font-sans">
                    <span className="text-stone-gray uppercase tracking-tighter">活跃: <b>{mStats.active}</b></span>
                    <span className={`${mStats.failed > 0 ? 'text-crimson' : 'text-olive-gray'} uppercase tracking-tighter font-bold`}>异常: {mStats.failed}</span>
                  </div>
                  
                  {/* Success Rate Progress Bar */}
                  <div className="w-full bg-border-cream h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${mStats.failed > 0 ? 'bg-coral' : 'bg-terracotta'}`}
                      style={{ width: mStats.successRate }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-sans">
                    <span className="font-bold text-stone-gray uppercase tracking-tighter">成功率 {mStats.successRate}</span>
                    <span className="text-olive-gray">V{model.version}</span>
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
