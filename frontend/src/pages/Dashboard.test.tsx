import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { camundaService } from '../services/camundaService';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../services/camundaService', () => ({
  camundaService: {
    getMetrics: vi.fn(),
    getProcessDefinitions: vi.fn(),
    getEngineVersion: vi.fn(),
    getRunningInstanceCount: vi.fn(),
    getCompletedInstanceCount: vi.fn(),
  }
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (camundaService.getRunningInstanceCount as any).mockResolvedValue(10);
    (camundaService.getCompletedInstanceCount as any).mockResolvedValue(100);
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
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('运行中实例')).toBeInTheDocument();
    });
  });

  it('should show real-time sync indicator', async () => {
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

    await waitFor(() => {
      expect(screen.getByText(/同步中:/)).toBeInTheDocument();
    });
  });

  it('should render model matrix with instance counts', async () => {
    (camundaService.getMetrics as any).mockResolvedValue({
      processStats: { totalInstances: 123, runningInstances: 10, completedInstances: 100, suspendedInstances: 13 },
      taskMetrics: { taskBacklogs: 5, avgCompletionTime: 500, failureRate: 0.1 },
      systemHealth: { cpuUsage: 0.5, memoryUsage: 1024, dbConnections: 5 }
    });
    (camundaService.getProcessDefinitions as any).mockResolvedValue([
      { id: 'def-1', key: 'process-1', name: 'Process One', version: 1, suspended: false }
    ]);
    (camundaService.getEngineVersion as any).mockResolvedValue({ version: '7.20.0' });
    (camundaService.getRunningInstanceCount as any).mockResolvedValue(5);
    (camundaService.getCompletedInstanceCount as any).mockResolvedValue(42);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Process One')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Running
      expect(screen.getByText('42')).toBeInTheDocument(); // Completed
      expect(screen.getByText('运行中')).toBeInTheDocument();
      expect(screen.getByText('已完成')).toBeInTheDocument();
    });
  });

  it('should trigger data export when export button is clicked', async () => {
    const mockMetrics = {
      processStats: { totalInstances: 123, runningInstances: 10, completedInstances: 100, suspendedInstances: 13 },
      taskMetrics: { taskBacklogs: 5, avgCompletionTime: 500, failureRate: 0.1 },
      systemHealth: { cpuUsage: 0.5, memoryUsage: 1024, dbConnections: 5 }
    };
    (camundaService.getMetrics as any).mockResolvedValue(mockMetrics);
    (camundaService.getProcessDefinitions as any).mockResolvedValue([]);
    (camundaService.getEngineVersion as any).mockResolvedValue({ version: '7.20.0' });

    // Mock URL methods for download
    const createObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = vi.fn();

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const exportButton = screen.getByText('导出');
      fireEvent.click(exportButton);
      expect(createObjectURLMock).toHaveBeenCalled();
    });
  });
});
