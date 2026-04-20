import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProcessStatsCard, TaskMetricsCard, SystemHealthCard } from './MetricCards';
import { BrowserRouter } from 'react-router-dom';

const mockStats = {
  totalInstances: 123,
  runningInstances: 10,
  completedInstances: 100,
  suspendedInstances: 13,
};

const mockMetrics = {
  taskBacklogs: 5,
  avgCompletionTime: 500,
  failureRate: 0.082,
};

const mockHealth = {
  cpuUsage: 0.5,
  memoryUsage: 1024,
  dbConnections: 5,
};

describe('MetricCards Components (Refactor)', () => {
  it('ProcessStatsCard should render the new layout and labels', () => {
    render(
      <BrowserRouter>
        <ProcessStatsCard stats={mockStats} />
      </BrowserRouter>
    );
    
    // New design expectations (to fail initially)
    // The design uses "运行中实例" and "已完成实例" as primary KPIs
    expect(screen.getByText('运行中实例')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('TaskMetricsCard should render the new layout and labels', () => {
    render(
      <BrowserRouter>
        <TaskMetricsCard metrics={mockMetrics} />
      </BrowserRouter>
    );

    // New design expectation
    expect(screen.getByText('异常率')).toBeInTheDocument();
    expect(screen.getByText('8.2%')).toBeInTheDocument(); // 0.082 * 100
  });

  it('SystemHealthCard should render the new layout and labels', () => {
    render(
      <BrowserRouter>
        <SystemHealthCard health={mockHealth} />
      </BrowserRouter>
    );

    // New design expectation
    expect(screen.getByText('节点健康度')).toBeInTheDocument();
  });
});
