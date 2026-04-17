import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Activity, ShieldAlert, GitBranch, PlayCircle } from 'lucide-react';
import { camundaService } from '../services/camundaService';
import type { ProcessDefinition } from '../services/camundaService';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    activeInstances: 0,
    incidents: 0,
    totalModels: 0
  });
  const [models, setModels] = useState<ProcessDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statistics, processModels] = await Promise.all([
        camundaService.getStatistics(),
        camundaService.getProcessDefinitions()
      ]);
      setStats(statistics);
      setModels(processModels);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const kpiData = [
    { label: 'Active Instances', value: stats.activeInstances, icon: Activity, color: 'text-terracotta' },
    { label: 'Total Models', value: stats.totalModels, icon: GitBranch, color: 'text-stone-gray' },
    { label: 'System Incidents', value: stats.incidents, icon: ShieldAlert, color: 'text-crimson' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in">
      <div>
        <h1 className="text-4xl font-serif text-anthropic-black mb-3">System Dashboard</h1>
        <p className="text-olive-gray font-sans text-lg">Real-time monitoring and operational status of your workflow engine.</p>
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
          <h3 className="text-2xl font-serif text-anthropic-black">Model Matrix</h3>
          <button 
            onClick={() => navigate('/models')}
            className="text-sm text-terracotta font-sans font-bold hover:underline"
          >
            Manage All Models →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="p-6 h-40 bg-white/50 animate-pulse">
                <div />
              </Card>
            ))
          ) : models.length === 0 ? (
            <div className="col-span-full p-12 text-center text-stone-gray font-sans italic bg-white rounded-comfortable border border-dashed border-border-warm">
              No workflow models deployed yet.
            </div>
          ) : models.slice(0, 8).map((model) => (
            <Card 
              key={model.id} 
              className="p-6 hover:ring-2 hover:ring-terracotta transition-all cursor-pointer group bg-white"
              onClick={() => navigate('/instances')}
            >
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
              
              <div className="flex justify-between items-center text-[10px] font-sans">
                <span className="font-bold text-stone-gray uppercase tracking-tighter">Version V{model.version}</span>
                <span className="text-olive-gray">{model.suspended ? 'Suspended' : 'Active'}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
