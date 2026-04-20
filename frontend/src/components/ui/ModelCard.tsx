import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetGrid';
import { camundaService } from '../../services/camundaService';
import type { ProcessDefinition } from '../../services/camundaService';
import { useNavigate } from 'react-router-dom';

interface ModelCardProps {
  model: ProcessDefinition;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  const [running, setRunning] = useState<number>(0);
  const [completed, setCompleted] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [runCount, compCount] = await Promise.all([
          camundaService.getRunningInstanceCount(model.key),
          camundaService.getCompletedInstanceCount(model.key)
        ]);
        setRunning(runCount);
        setCompleted(compCount);
      } catch (err) {
        console.error('Failed to fetch counts for model', model.key, err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [model.key]);

  return (
    <WidgetCard 
      title={model.name || model.key}
      className="cursor-pointer p-8"
      onClick={() => navigate('/instances')}
    >
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-headline font-semibold">
              {loading ? '...' : running.toLocaleString()}
            </span>
            <span className="text-[10px] font-label text-on-surface-variant/60 uppercase">运行中</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-headline font-semibold">
              {loading ? '...' : completed.toLocaleString()}
            </span>
            <span className="text-[10px] font-label text-on-surface-variant/60 uppercase">已完成</span>
          </div>
        </div>
        
        <div className="h-16 w-full flex items-end space-x-1">
          {Array(15).fill(0).map((_, idx) => (
            <div 
              key={idx} 
              className={`flex-1 ${model.suspended ? 'bg-error/30' : 'bg-tertiary/30'} hover:opacity-100 transition-opacity`}
              style={{ height: `${20 + Math.random() * 80}%` }}
            />
          ))}
        </div>

        <div className="flex justify-between items-center text-[10px] font-label text-on-surface-variant/60 uppercase pt-4 border-t border-outline-variant/10">
          <span>版本 V{model.version}</span>
          <span className={model.suspended ? 'text-error' : 'text-tertiary'}>
            {model.suspended ? '已挂起' : '运行中状态'}
          </span>
        </div>
      </div>
    </WidgetCard>
  );
};
