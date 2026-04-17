import React from 'react';
import { WidgetCard } from './WidgetGrid';
import { Activity, Clock, ShieldAlert, Cpu, Database, HardDrive, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Metrics } from '../../services/camundaService';

interface ProcessStatsCardProps {
  stats: Metrics['processStats'];
}

export const ProcessStatsCard: React.FC<ProcessStatsCardProps> = ({ stats }) => {
  const items = [
    { label: '总实例', value: stats.totalInstances, color: 'text-anthropic-black' },
    { label: '进行中', value: stats.runningInstances, color: 'text-terracotta' },
    { label: '已完成', value: stats.completedInstances, color: 'text-olive-gray' },
    { label: '已挂起', value: stats.suspendedInstances, color: 'text-crimson' },
  ];

  return (
    <WidgetCard title="流程统计 (Process Stats)" icon={Activity}>
      <div className="grid grid-cols-2 gap-4 mt-2">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col">
            <span className="text-[10px] text-stone-gray font-sans uppercase tracking-tight">{item.label}</span>
            <span className={`text-2xl font-serif font-bold ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border-cream flex justify-end">
        <Link to="/instances" className="text-[10px] font-sans font-bold text-terracotta uppercase tracking-widest flex items-center gap-1 hover:underline">
          查看所有实例 <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </WidgetCard>
  );
};

interface TaskMetricsCardProps {
  metrics: Metrics['taskMetrics'];
}

export const TaskMetricsCard: React.FC<TaskMetricsCardProps> = ({ metrics }) => {
  return (
    <WidgetCard title="任务指标 (Task Metrics)" icon={Clock}>
      <div className="space-y-4 mt-2">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-gray font-sans uppercase tracking-tight">待办任务</span>
            <span className="text-2xl font-serif font-bold text-anthropic-black">{metrics.taskBacklogs}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-stone-gray font-sans uppercase tracking-tight">平均耗时</span>
            <span className="text-sm font-sans font-bold text-stone-gray">{metrics.avgCompletionTime.toFixed(1)}ms</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-sans uppercase tracking-tighter">
            <span className="text-stone-gray">系统异常率</span>
            <span className={metrics.failureRate > 0.05 ? 'text-crimson font-bold' : 'text-olive-gray'}>
              {(metrics.failureRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-border-cream h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${metrics.failureRate > 0.05 ? 'bg-crimson' : 'bg-terracotta'}`}
              style={{ width: `${Math.min(metrics.failureRate * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border-cream flex justify-end">
        <Link to="/history" className="text-[10px] font-sans font-bold text-terracotta uppercase tracking-widest flex items-center gap-1 hover:underline">
          分析历史趋势 <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </WidgetCard>
  );
};

interface SystemHealthCardProps {
  health: Metrics['systemHealth'];
}

export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ health }) => {
  const stats = [
    { label: 'CPU 负载', value: health.cpuUsage < 0 ? 'N/A' : health.cpuUsage.toFixed(2), icon: Cpu },
    { label: '内存使用', value: `${health.memoryUsage}MB`, icon: HardDrive },
    { label: 'DB 连接', value: health.dbConnections, icon: Database },
  ];

  return (
    <WidgetCard title="系统健康 (System Health)" icon={ShieldAlert}>
      <div className="space-y-3 mt-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center p-2 rounded-comfortable bg-ivory/50 border border-border-cream">
            <div className="flex items-center gap-2">
              <stat.icon className="w-3 h-3 text-stone-gray" />
              <span className="text-[10px] text-stone-gray font-sans uppercase tracking-tight">{stat.label}</span>
            </div>
            <span className="text-xs font-sans font-bold text-anthropic-black">{stat.value}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};
