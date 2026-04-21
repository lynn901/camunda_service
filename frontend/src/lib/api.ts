import axios from 'axios';
import { 
  ProcessDefinition, 
  ProcessInstance, 
  HistoricActivityInstance, 
  Incident, 
  Metrics, 
  Task 
} from '../types';

const api = axios.create({
  baseURL: '/api/workflow',
});

export const workflowApi = {
  // Definitions
  getDefinitions: () => api.get<ProcessDefinition[]>('/definitions').then(res => res.data),
  deploy: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ deploymentId: string; resourceName: string }>('/deploy', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  suspendDefinition: (key: string) => api.put(`/definitions/${key}/suspend`),
  activateDefinition: (key: string) => api.put(`/definitions/${key}/activate`),

  // Instances
  startProcess: (key: string, businessKey: string, variables?: any) => 
    api.post(`/start/${key}`, variables, { params: { businessKey } }).then(res => res.data),
  terminateInstance: (instanceId: string, reason?: string) => 
    api.delete(`/instance/${instanceId}`, { params: { reason } }),
  getVariables: (instanceId: string) => api.get<Record<string, any>>(`/instance/${instanceId}/variables`).then(res => res.data),
  setVariables: (instanceId: string, variables: any) => api.put(`/instance/${instanceId}/variables`, variables),
  
  // History
  getHistoryInstances: (businessKey?: string) => 
    api.get<ProcessInstance[]>('/history/instances', { params: { businessKey } }).then(res => res.data),
  getHistoryActivities: (instanceId: string) => 
    api.get<HistoricActivityInstance[]>(`/history/instances/${instanceId}/activities`).then(res => res.data),

  // Tasks
  getTasks: (instanceId: string) => api.get<Task[]>(`/task/by-instance/${instanceId}`).then(res => res.data),
  completeTask: (taskId: string, variables?: any) => api.post(`/task/${taskId}/complete`, variables),

  // Intervention
  getIncidents: (instanceId: string) => api.get<Incident[]>(`/instance/${instanceId}/incidents`).then(res => res.data),
  setJobRetries: (jobId: string, retries = 1) => api.post(`/jobs/${jobId}/retries`, null, { params: { retries } }),
  modifyInstance: (instanceId: string, cancelActivityId: string, startBeforeActivityId: string) => 
    api.post(`/instance/${instanceId}/modification`, null, { params: { cancelActivityId, startBeforeActivityId } }),

  // Metrics
  getMetrics: () => api.get<Metrics>('/metrics').then(res => res.data),
};
