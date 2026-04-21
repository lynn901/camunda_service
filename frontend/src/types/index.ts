export interface ProcessDefinition {
  id: string;
  key: string;
  name: string;
  version: number;
  deploymentId: string;
  deploymentTime?: string;
  resourceName: string;
  suspended?: boolean;
}

export interface ProcessInstance {
  instanceId: string;
  processDefinitionId: string;
  processDefinitionKey: string;
  businessKey: string;
  startTime: string;
  endTime?: string;
  state: 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'SUSPENDED';
  durationInMillis?: number;
}

export interface HistoricActivityInstance {
  activityId: string;
  activityName: string;
  activityType: string;
  startTime: string;
  endTime?: string;
  durationInMillis?: number;
}

export interface Incident {
  id: string;
  incidentType: string;
  incidentMessage: string;
  activityId: string;
  executionId: string;
  jobId?: string;
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

export interface Task {
  id: string;
  name: string;
  assignee?: string;
  createTime: string;
  taskDefinitionKey: string;
  processInstanceId?: string;
}

export interface ExternalWorker {
  workerId: string;
  activeTasks: number;
  topics: string[];
  lastSeen: string;
  status: 'Online' | 'HighLoad' | 'Offline';
}
