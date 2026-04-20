import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { AppLayout } from '../components/layout/AppLayout';
import { camundaService } from '../services/camundaService';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../services/camundaService', () => ({
  camundaService: {
    getMetrics: vi.fn(),
    getProcessDefinitions: vi.fn(),
    getEngineVersion: vi.fn(),
  }
}));

describe('Dashboard UI Removals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (camundaService.getMetrics as any).mockResolvedValue({
      processStats: { totalInstances: 123, runningInstances: 10, completedInstances: 100, suspendedInstances: 13 },
      taskMetrics: { taskBacklogs: 5, avgCompletionTime: 500, failureRate: 0.1 },
      systemHealth: { cpuUsage: 0.5, memoryUsage: 1024, dbConnections: 5 }
    });
    (camundaService.getProcessDefinitions as any).mockResolvedValue([]);
    (camundaService.getEngineVersion as any).mockResolvedValue({ version: '7.20.0' });
  });

  it('should NOT render the Control Panel section', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    expect(screen.queryByText('控制面板')).not.toBeInTheDocument();
  });

  it('should NOT render Logs, Alerts, Support, and Management links in the Header', () => {
    render(
      <BrowserRouter>
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </BrowserRouter>
    );
    expect(screen.queryByText('日志')).not.toBeInTheDocument();
    expect(screen.queryByText('警报')).not.toBeInTheDocument();
    expect(screen.queryByText('支持')).not.toBeInTheDocument();
    expect(screen.queryByText('管理控制')).not.toBeInTheDocument();
  });
});
