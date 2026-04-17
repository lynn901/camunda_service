export interface ProcessDefinition {
  id: string;
  key: string;
  category: string;
  description: string;
  name: string;
  version: number;
  resource: string;
  deploymentId: string;
  diagram: string;
  suspended: boolean;
  tenantId: string | null;
  versionTag: string | null;
  historyTimeToLive: number | null;
  startableInTasklist: boolean;
}

export interface Deployment {
  id: string;
  name: string;
  source: string;
  deploymentTime: string;
  tenantId: string | null;
}

export interface ProcessInstance {
  id: string;
  definitionId: string;
  businessKey: string;
  caseInstanceId: string | null;
  ended: boolean;
  suspended: boolean;
  tenantId: string | null;
  state?: 'Running' | 'Failed' | 'Suspended' | 'ACTIVE' | 'SUSPENDED' | 'COMPLETED' | 'EXTERNALLY_TERMINATED' | 'INTERNALLY_TERMINATED';
  startTime?: string;
}

export interface ActivityInstance {
  id: string;
  parentActivityInstanceId: string;
  activityId: string;
  activityName: string;
  activityType: string;
  processInstanceId: string;
  processDefinitionId: string;
  childActivityInstances: ActivityInstance[];
  childExecutionInstances: any[];
  executionIds: string[];
  name?: string;
}

export interface HistoricActivityInstance {
  id: string;
  parentActivityInstanceId: string;
  activityId: string;
  activityName: string;
  activityType: string;
  processDefinitionKey: string;
  processDefinitionId: string;
  processInstanceId: string;
  executionId: string;
  taskId: string | null;
  calledProcessInstanceId: string | null;
  calledCaseInstanceId: string | null;
  assignee: string | null;
  startTime: string;
  endTime: string | null;
  durationInMillis: number | null;
  canceled: boolean;
  completeScope: boolean;
  tenantId: string | null;
  status?: 'Completed' | 'Running' | 'Failed';
}

export interface Incident {
  id: string;
  processDefinitionId: string;
  processInstanceId: string;
  executionId: string;
  incidentTimestamp: string;
  incidentType: string;
  activityId: string;
  failedActivityId: string;
  causeIncidentId: string;
  rootCauseIncidentId: string;
  configuration: string;
  incidentMessage: string;
  tenantId: string | null;
  jobId: string | null;
}

export interface Variable {
  value: any;
  type: string;
  valueInfo: any;
}

export interface ExternalTask {
  id: string;
  topicName: string;
  workerId: string;
  lockExpirationTime: string;
  processInstanceId: string;
  processDefinitionId: string;
  processDefinitionKey: string;
  activityId: string;
  activityInstanceId: string;
  errorMessage: string;
  errorDetails: string;
  retries: number;
  suspended: boolean;
  tenantId: string | null;
  priority: number;
}

export interface Metrics {
  processStats: {
    totalInstances: number;
    runningInstances: number;
    completedInstances: number;
    suspendedInstances: number;
  };
  taskMetrics: {
    taskBacklogs: number;
    avgCompletionTime: number;
    failureRate: number;
  };
  systemHealth: {
    cpuUsage: number;
    memoryUsage: number;
    dbConnections: number;
  };
}

const ENGINE_REST_URL = '/engine-rest';
const API_BASE_URL = '/api/workflow';

export const camundaService = {
  async getProcessDefinitions(): Promise<ProcessDefinition[]> {
    const response = await fetch(`${ENGINE_REST_URL}/process-definition?latestVersion=true`);
    if (!response.ok) throw new Error('Failed to fetch process definitions');
    return response.json();
  },

  async getProcessDefinitionXml(id: string): Promise<{ bpmn20Xml: string }> {
    const url = id.includes(':') 
      ? `${ENGINE_REST_URL}/process-definition/${id}/xml`
      : `${ENGINE_REST_URL}/process-definition/key/${id}/xml`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch process definition XML');
    return response.json();
  },

  async getEngineVersion(): Promise<{ version: string }> {
    const response = await fetch(`${ENGINE_REST_URL}/version`);
    if (!response.ok) throw new Error('Failed to fetch engine version');
    return response.json();
  },

  async getDeployments(): Promise<Deployment[]> {
    const response = await fetch(`${ENGINE_REST_URL}/deployment`);
    if (!response.ok) throw new Error('Failed to fetch deployments');
    return response.json();
  },

  async deployModel(file: File, deploymentName: string, category: string = 'General'): Promise<Deployment> {
    const formData = new FormData();
    formData.append('deployment-name', `${category}: ${deploymentName}`);
    formData.append('deployment-source', 'OpsFlowEngine Console');
    formData.append('data', file);

    const response = await fetch(`${ENGINE_REST_URL}/deployment/create`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to deploy model');
    return response.json();
  },

  async startProcessInstance(processDefinitionKey: string, businessKey: string, variables: Record<string, any>) {
    const camundaVariables: Record<string, any> = {};
    for (const [key, value] of Object.entries(variables)) {
      camundaVariables[key] = { value, type: typeof value === 'number' ? 'Integer' : typeof value === 'boolean' ? 'Boolean' : 'String' };
    }

    const response = await fetch(`${ENGINE_REST_URL}/process-definition/key/${processDefinitionKey}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessKey,
        variables: camundaVariables,
      }),
    });

    if (!response.ok) throw new Error('Failed to start process instance');
    return response.json();
  },

  async getProcessInstances(filter: { processDefinitionKey?: string, active?: boolean, suspended?: boolean, incidentId?: string } = {}): Promise<ProcessInstance[]> {
    const params = new URLSearchParams();
    if (filter.processDefinitionKey) params.append('processDefinitionKey', filter.processDefinitionKey);
    if (filter.active) params.append('active', 'true');
    if (filter.suspended) params.append('suspended', 'true');
    if (filter.incidentId) params.append('incidentId', filter.incidentId);

    const response = await fetch(`${ENGINE_REST_URL}/process-instance?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch process instances');
    return response.json();
  },

  async getIncidents(processInstanceId?: string): Promise<Incident[]> {
    const url = processInstanceId 
      ? `${ENGINE_REST_URL}/incident?processInstanceId=${processInstanceId}`
      : `${ENGINE_REST_URL}/incident`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch incidents');
    return response.json();
  },

  async getActivityInstances(processInstanceId: string): Promise<ActivityInstance> {
    const response = await fetch(`${ENGINE_REST_URL}/process-instance/${processInstanceId}/activity-instances`);
    if (!response.ok) throw new Error('Failed to fetch activity instances');
    return response.json();
  },

  async getHistoricActivityInstances(processInstanceId: string): Promise<HistoricActivityInstance[]> {
    const response = await fetch(`${ENGINE_REST_URL}/history/activity-instance?processInstanceId=${processInstanceId}&sortBy=startTime&sortOrder=asc`);
    if (!response.ok) throw new Error('Failed to fetch historic activity instances');
    return response.json();
  },

  async getVariables(processInstanceId: string): Promise<Record<string, Variable>> {
    const response = await fetch(`${ENGINE_REST_URL}/process-instance/${processInstanceId}/variables`);
    if (!response.ok) throw new Error('Failed to fetch variables');
    return response.json();
  },

  async updateVariable(processInstanceId: string, name: string, value: any, type: string) {
    const response = await fetch(`${ENGINE_REST_URL}/process-instance/${processInstanceId}/variables/${name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, type }),
    });
    if (!response.ok) throw new Error('Failed to update variable');
  },

  async deleteVariable(processInstanceId: string, name: string) {
    const response = await fetch(`${ENGINE_REST_URL}/process-instance/${processInstanceId}/variables/${name}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete variable');
  },

  async suspendProcessInstance(processInstanceId: string) {
    const response = await fetch(`${ENGINE_REST_URL}/process-instance/${processInstanceId}/suspended`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspended: true }),
    });
    if (!response.ok) throw new Error('Failed to suspend process instance');
  },

  async activateProcessInstance(processInstanceId: string) {
    const response = await fetch(`${ENGINE_REST_URL}/process-instance/${processInstanceId}/suspended`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspended: false }),
    });
    if (!response.ok) throw new Error('Failed to activate process instance');
  },

  async terminateProcessInstance(processInstanceId: string) {
    const response = await fetch(`${ENGINE_REST_URL}/process-instance/${processInstanceId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to terminate process instance');
  },

  async retryJob(jobId: string, retries: number = 3) {
    const response = await fetch(`${ENGINE_REST_URL}/job/${jobId}/retries`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ retries })
    });
    if (!response.ok) throw new Error('Failed to retry job');
  },

  async getExternalTasks(): Promise<ExternalTask[]> {
    const response = await fetch(`${ENGINE_REST_URL}/external-task`);
    if (!response.ok) throw new Error('Failed to fetch external tasks');
    return response.json();
  },

  async getMetrics(): Promise<Metrics> {
    const response = await fetch(`${API_BASE_URL}/metrics`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  },

  async unlockExternalTask(id: string) {
    const response = await fetch(`${ENGINE_REST_URL}/external-task/${id}/unlock`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to unlock external task');
  },

  async getHistoricInstances(businessKey?: string): Promise<ProcessInstance[]> {
    const url = businessKey 
      ? `${API_BASE_URL}/history/instances?businessKey=${businessKey}`
      : `${API_BASE_URL}/history/instances`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch historic instances');
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.instanceId,
      definitionId: item.processDefinitionKey,
      businessKey: item.businessKey,
      startTime: item.startTime,
      endTime: item.endTime,
      state: item.state,
      ended: !!item.endTime,
      suspended: item.state === 'SUSPENDED',
      caseInstanceId: null,
      tenantId: null
    }));
  },

  async getHistoricActivities(instanceId: string): Promise<HistoricActivityInstance[]> {
    const response = await fetch(`${API_BASE_URL}/history/instances/${instanceId}/activities`);
    if (!response.ok) throw new Error('Failed to fetch historic activities');
    const data = await response.json();
    
    return data.map((item: any, index: number) => ({
      id: `${item.activityId}-${index}`, 
      activityId: item.activityId,
      activityName: item.activityName,
      activityType: item.activityType,
      startTime: item.startTime,
      endTime: item.endTime,
      durationInMillis: item.durationInMillis,
      parentActivityInstanceId: '',
      processDefinitionKey: '',
      processDefinitionId: '',
      processInstanceId: instanceId,
      executionId: '',
      taskId: null,
      calledProcessInstanceId: null,
      calledCaseInstanceId: null,
      assignee: null,
      canceled: false,
      completeScope: false,
      tenantId: null
    }));
  },

  async getStatistics() {
    const [instances, incidents, definitions, historyInstances] = await Promise.all([
      this.getProcessInstances(),
      this.getIncidents(),
      this.getProcessDefinitions(),
      fetch(`${ENGINE_REST_URL}/history/process-instance?finished=true`).then(res => res.json().catch(() => []))
    ]);

    const modelStats: Record<string, { active: number, failed: number, completed: number, successRate: string }> = {};
    definitions.forEach(def => {
      modelStats[def.key] = { active: 0, failed: 0, completed: 0, successRate: '0%' };
    });

    instances.forEach(inst => {
      const key = inst.definitionId.split(':')[0];
      const isFailed = incidents.some(inc => inc.processInstanceId === inst.id);
      if (modelStats[key]) {
        if (isFailed) {
          modelStats[key].failed++;
        } else {
          modelStats[key].active++;
        }
      }
    });

    if (Array.isArray(historyInstances)) {
      historyInstances.forEach((hist: any) => {
        const key = hist.processDefinitionKey;
        if (modelStats[key]) {
          modelStats[key].completed++;
        }
      });
    }

    Object.keys(modelStats).forEach(key => {
      const stats = modelStats[key];
      const totalFinished = stats.completed;
      const totalAttempted = stats.completed + stats.failed;
      if (totalAttempted > 0) {
        stats.successRate = Math.round((totalFinished / totalAttempted) * 100) + '%';
      } else {
        stats.successRate = '100%'; 
      }
    });

    return {
      activeInstances: instances.length,
      incidents: incidents.length,
      totalModels: definitions.length,
      modelStats
    };
  }
};
