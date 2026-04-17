import { describe, it, expect, vi, beforeEach } from 'vitest';
import { camundaService } from './camundaService';

describe('camundaService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should fetch historic instances', async () => {
    const mockBackendData = [{ instanceId: 'inst-1', businessKey: 'BK-1', processDefinitionKey: 'def-1', state: 'COMPLETED', startTime: '2023-01-01', endTime: '2023-01-01' }];
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockBackendData,
    });

    const result = await camundaService.getHistoricInstances('BK-1');

    expect(fetch).toHaveBeenCalledWith('/api/workflow/history/instances?businessKey=BK-1');
    expect(result[0].id).toBe('inst-1');
    expect(result[0].businessKey).toBe('BK-1');
  });

  it('should fetch historic activities', async () => {
    const mockBackendData = [{ activityId: 'act-1', activityName: 'Task 1', activityType: 'userTask', startTime: '2023-01-01', endTime: '2023-01-01', durationInMillis: 100 }];
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockBackendData,
    });

    const result = await camundaService.getHistoricActivities('inst-1');

    expect(fetch).toHaveBeenCalledWith('/api/workflow/history/instances/inst-1/activities');
    expect(result[0].activityId).toBe('act-1');
    expect(result[0].activityName).toBe('Task 1');
  });

  it('should fetch metrics', async () => {
    const mockMetrics = { 
      processStats: { totalInstances: 100, runningInstances: 20, completedInstances: 70, suspendedInstances: 10 },
      taskMetrics: { taskBacklogs: 15, avgCompletionTime: 120.5, failureRate: 0.05 },
      systemHealth: { cpuUsage: 0.45, memoryUsage: 1024, dbConnections: 5 }
    };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockMetrics,
    });

    const result = await camundaService.getMetrics();

    expect(fetch).toHaveBeenCalledWith('/api/workflow/metrics');
    expect(result).toEqual(mockMetrics);
  });
});
