import { describe, it, expect, vi, beforeEach } from 'vitest';
import { camundaService } from './camundaService';

describe('camundaService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should fetch historic instances', async () => {
    const mockInstances = [{ id: 'inst-1', businessKey: 'BK-1' }];
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockInstances,
    });

    const result = await camundaService.getHistoricInstances('BK-1');

    expect(fetch).toHaveBeenCalledWith('/api/workflow/history/instances?businessKey=BK-1');
    expect(result).toEqual(mockInstances);
  });

  it('should fetch historic activities', async () => {
    const mockActivities = [{ activityId: 'act-1', activityName: 'Task 1' }];
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockActivities,
    });

    const result = await camundaService.getHistoricActivities('inst-1');

    expect(fetch).toHaveBeenCalledWith('/api/workflow/history/instances/inst-1/activities');
    expect(result).toEqual(mockActivities);
  });
});
