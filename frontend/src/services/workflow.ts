import { request } from '@umijs/max';

/** 获取流程定义列表 GET /engine-rest/process-definition */
export async function getProcessDefinitions(params?: {
  latestVersion?: boolean;
  active?: boolean;
  startableInTasklist?: boolean;
}) {
  return request<any[]>('/engine-rest/process-definition', {
    method: 'GET',
    params: {
      latestVersion: true,
      active: true,
      startableInTasklist: true,
      ...params,
    },
  });
}

/** 发起流程实例 POST /engine-rest/process-definition/{id}/start */
export async function startProcessInstance(id: string, variables: any = {}) {
  return request<any>(`/engine-rest/process-definition/${id}/start`, {
    method: 'POST',
    data: {
      variables: Object.keys(variables).reduce((acc: any, key) => {
        acc[key] = { value: variables[key] };
        return acc;
      }, {}),
    },
  });
}

/** 获取流程图 XML GET /engine-rest/process-definition/{id}/xml */
export async function getProcessDefinitionXml(id: string) {
  return request<{ id: string; bpmn20Xml: string }>(`/engine-rest/process-definition/${id}/xml`, {
    method: 'GET',
  });
}

/** 关联消息 POST /engine-rest/message */
export async function correlateMessage(messageName: string, processInstanceId?: string, variables: any = {}) {
  return request<any>('/engine-rest/message', {
    method: 'POST',
    data: {
      messageName,
      processInstanceId,
      processVariables: Object.keys(variables).reduce((acc: any, key) => {
        acc[key] = { value: variables[key] };
        return acc;
      }, {}),
      resultEnabled: true,
    },
  });
}

/** 发送信号 POST /engine-rest/signal */
export async function deliverSignal(name: string, executionId?: string, variables: any = {}) {
  return request<any>('/engine-rest/signal', {
    method: 'POST',
    data: {
      name,
      executionId,
      variables: Object.keys(variables).reduce((acc: any, key) => {
        acc[key] = { value: variables[key] };
        return acc;
      }, {}),
    },
  });
}

/** 创建独立任务 POST /engine-rest/task/create */
export async function createStandaloneTask(data: {
  name: string;
  description?: string;
  assignee?: string;
  due?: string;
}) {
  return request<any>('/engine-rest/task/create', {
    method: 'POST',
    data,
  });
}
