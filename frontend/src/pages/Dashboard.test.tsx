import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { camundaService } from '../services/camundaService';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../services/camundaService', () => ({
  camundaService: {
    getMetrics: vi.fn(),
    getProcessDefinitions: vi.fn(),
    getEngineVersion: vi.fn(),
  }
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render metrics and dashboard title', async () => {
    (camundaService.getMetrics as any).mockResolvedValue({
      processStats: { totalInstances: 123, runningInstances: 10, completedInstances: 100, suspendedInstances: 13 },
      taskMetrics: { taskBacklogs: 5, avgCompletionTime: 500, failureRate: 0.1 },
      systemHealth: { cpuUsage: 0.5, memoryUsage: 1024, dbConnections: 5 }
    });
    (camundaService.getProcessDefinitions as any).mockResolvedValue([]);
    (camundaService.getEngineVersion as any).mockResolvedValue({ version: '7.20.0' });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('整体概览')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByText('流程统计 (Process Stats)')).toBeInTheDocument();
    });
  });
});
