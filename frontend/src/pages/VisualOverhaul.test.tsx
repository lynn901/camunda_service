import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { BrowserRouter } from 'react-router-dom';
import { camundaService } from '../services/camundaService';

vi.mock('../services/camundaService', () => ({
  camundaService: {
    getMetrics: vi.fn(),
    getProcessDefinitions: vi.fn(),
    getEngineVersion: vi.fn(),
  }
}));

describe('Visual Overhaul Assertions', () => {
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

  it('Dashboard container should have generous spacing', () => {
    const { container } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    const mainContainer = container.firstChild;
    // space-y-24 or space-y-32
    expect(mainContainer).toHaveClass(/space-y-(24|32|20|28|36)/);
  });

  it('Dashboard sections should be separated by large margins', () => {
    const { container } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    const sections = container.querySelectorAll('section, .space-y-6');
    // Check if the container has space-y class that provides large gaps
    expect(container.firstChild).toHaveClass(/space-y-(24|32|20|28|36)/);
  });
});
