import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { History } from './History';
import { camundaService } from '../services/camundaService';
import React from 'react';

vi.mock('../services/camundaService', () => ({
  camundaService: {
    getProcessDefinitions: vi.fn(),
    getHistoricInstances: vi.fn(),
    getHistoricActivities: vi.fn(),
    getProcessDefinitionXml: vi.fn(),
  }
}));

describe('History Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render history instances', async () => {
    (camundaService.getProcessDefinitions as any).mockResolvedValue([]);
    (camundaService.getHistoricInstances as any).mockResolvedValue([
      { id: 'inst-1', businessKey: 'BK-1', state: 'COMPLETED', definitionId: 'proc:1' }
    ]);
    (camundaService.getHistoricActivities as any).mockResolvedValue([]);
    (camundaService.getProcessDefinitionXml as any).mockResolvedValue({ bpmn20Xml: '' });

    render(<History />);

    await waitFor(() => {
      expect(screen.getByText('inst-1')).toBeInTheDocument();
      expect(screen.getByText('BK-1')).toBeInTheDocument();
    });
  });
});
