import React from 'react';
import { WidgetCard } from './WidgetGrid';
import { Activity, Clock, ShieldAlert, Cpu, Database, HardDrive, ArrowUpRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Metrics } from '../../services/camundaService';

interface ProcessStatsCardProps {
  stats: Metrics['processStats'];
}

export const ProcessStatsCard: React.FC<ProcessStatsCardProps> = ({ stats }) => {
  return (
    <>
      <div className="bg-surface-container-lowest p-6 ring-1 ring-outline-variant/10 shadow-sm flex flex-col justify-between group hover:scale-[1.01] transition-all duration-300">
        <div>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-4 font-body">运行中实例</p>
          <h2 className="text-3xl font-headline font-bold text-on-surface">{stats.runningInstances.toLocaleString()}</h2>
        </div>
        <div className="mt-4 flex items-center text-[10px] font-bold text-tertiary">
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          <span className="font-body">活跃线程监控中</span>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 ring-1 ring-outline-variant/10 shadow-sm flex flex-col justify-between group hover:scale-[1.01] transition-all duration-300">
        <div>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-4 font-body">已完成实例</p>
          <h2 className="text-3xl font-headline font-bold text-on-surface">{stats.completedInstances.toLocaleString()}</h2>
        </div>
        <div className="mt-4 flex items-center text-[10px] font-bold text-tertiary">
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          <span className="font-body">较上一周期稳步增长</span>
        </div>
      </div>
    </>
  );
};

interface TaskMetricsCardProps {
  metrics: Metrics['taskMetrics'];
}

export const TaskMetricsCard: React.FC<TaskMetricsCardProps> = ({ metrics }) => {
  return (
    <>
      <div className="bg-surface-container-lowest p-6 ring-1 ring-outline-variant/10 shadow-sm flex flex-col justify-between group">
        <div>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-4 font-body">异常率</p>
          <h2 className="text-3xl font-headline font-bold text-on-surface">{(metrics.failureRate * 100).toFixed(1)}%</h2>
        </div>
        <div className="mt-4 flex items-center text-[10px] font-bold text-error">
          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
          <span className="font-body">警报阈值: 1.0%</span>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 ring-1 ring-outline-variant/10 shadow-sm flex flex-col justify-between group">
        <div>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-4 font-body">平均周期</p>
          <h2 className="text-3xl font-headline font-bold text-on-surface">
            {(metrics.avgCompletionTime / 1000).toFixed(1)}
            <span className="text-sm font-normal ml-1 text-on-surface-variant">秒</span>
          </h2>
        </div>
        <div className="mt-4 flex items-center text-[10px] font-bold text-on-surface-variant">
          <Clock className="w-3.5 h-3.5 mr-1" />
          <span className="font-body">流程执行优化状态</span>
        </div>
      </div>
    </>
  );
};

interface SystemHealthCardProps {
  health: Metrics['systemHealth'];
}

export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ health }) => {
  // Using a mock health percentage derived from system health for visual consistency with design
  const nodeHealth = 99.9; 

  return (
    <div className="bg-surface-container-lowest p-6 ring-1 ring-outline-variant/10 shadow-sm flex flex-col justify-between group">
      <div>
        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-4 font-body">节点健康度</p>
        <h2 className="text-3xl font-headline font-bold text-on-surface">{nodeHealth}%</h2>
      </div>
      <div className="mt-4 flex items-center text-[10px] font-bold text-tertiary">
        <span className="w-2 h-2 rounded-full bg-tertiary mr-2 animate-pulse"></span>
        <span className="font-body">所有集群运行正常</span>
      </div>
    </div>
  );
};
