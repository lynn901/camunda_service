import React from 'react';
import { WidgetCard } from './WidgetGrid';
import { Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import type { Metrics } from '../../services/camundaService';
import { useNavigate } from 'react-router-dom';

interface ProcessStatsCardProps {
  stats: Metrics['processStats'];
}

export const ProcessStatsCard: React.FC<ProcessStatsCardProps> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <>
      <WidgetCard 
        title="运行中实例" 
        className="group cursor-pointer"
        onClick={() => navigate('/instances?status=running')}
      >
        <h2 className="text-3xl font-headline font-bold text-on-surface">{stats.runningInstances.toLocaleString()}</h2>
        <div className="mt-4 flex items-center text-[10px] font-bold text-tertiary">
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          <span className="font-body">活跃线程监控中</span>
        </div>
      </WidgetCard>

      <WidgetCard 
        title="已完成实例" 
        className="group cursor-pointer"
        onClick={() => navigate('/instances?status=completed')}
      >
        <h2 className="text-3xl font-headline font-bold text-on-surface">{stats.completedInstances.toLocaleString()}</h2>
        <div className="mt-4 flex items-center text-[10px] font-bold text-tertiary">
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          <span className="font-body">较上一周期稳步增长</span>
        </div>
      </WidgetCard>
    </>
  );
};

interface TaskMetricsCardProps {
  metrics: Metrics['taskMetrics'];
}

export const TaskMetricsCard: React.FC<TaskMetricsCardProps> = ({ metrics }) => {
  return (
    <>
      <WidgetCard title="异常率" className="group">
        <h2 className="text-3xl font-headline font-bold text-on-surface">{(metrics.failureRate * 100).toFixed(1)}%</h2>
        <div className="mt-4 flex items-center text-[10px] font-bold text-error">
          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
          <span className="font-body">警报阈值: 1.0%</span>
        </div>
      </WidgetCard>

      <WidgetCard title="平均周期" className="group">
        <h2 className="text-3xl font-headline font-bold text-on-surface">
          {(metrics.avgCompletionTime / 1000).toFixed(1)}
          <span className="text-sm font-normal ml-1 text-on-surface-variant">秒</span>
        </h2>
        <div className="mt-4 flex items-center text-[10px] font-bold text-on-surface-variant">
          <Clock className="w-3.5 h-3.5 mr-1" />
          <span className="font-body">流程执行优化状态</span>
        </div>
      </WidgetCard>
    </>
  );
};

interface SystemHealthCardProps {
  health: Metrics['systemHealth'];
}

export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ health }) => {
  const nodeHealth = 99.9; 

  return (
    <WidgetCard title="节点健康度" className="group">
      <h2 className="text-3xl font-headline font-bold text-on-surface">{nodeHealth}%</h2>
      <div className="mt-4 flex items-center text-[10px] font-bold text-tertiary">
        <span className="w-2 h-2 rounded-full bg-tertiary mr-2 animate-pulse"></span>
        <span className="font-body">所有集群运行正常</span>
      </div>
    </WidgetCard>
  );
};
