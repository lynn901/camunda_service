import { PageContainer, ProTable } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Button, Tag, Space, message, Modal, Drawer, Descriptions, Divider, Tabs, List, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import BpmnHighlightViewer from '@/components/BpmnHighlightViewer';

interface ProcessInstance {
  id: string;
  definitionId: string;
  businessKey: string;
  caseInstanceId: string;
  ended: boolean;
  suspended: boolean;
  tenantId: string | null;
}

const ProcessInstances: React.FC = () => {
  const actionRef = useRef<any>(null);
  const [currentRow, setCurrentRow] = useState<ProcessInstance>();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [variables, setVariables] = useState<any[]>([]);
  const [activeActivities, setActiveActivities] = useState<string[]>([]);

  const fetchInstances = async (params: any) => {
    try {
      // Query process-instance from Camunda
      const result = await request<ProcessInstance[]>('/engine-rest/process-instance', {
        method: 'GET',
        params: {
          firstResult: (params.current - 1) * params.pageSize,
          maxResults: params.pageSize,
        },
      });

      // Get total count for pagination
      const countRes = await request<{ count: number }>('/engine-rest/process-instance/count');

      return {
        data: result,
        total: countRes.count,
        success: true,
      };
    } catch (error) {
      message.error('获取实例列表失败');
      return {
        data: [],
        success: false,
      };
    }
  };

  const [editingVariable, setEditingVariable] = useState<any>(null);
  const [showVarModal, setShowVarModal] = useState<boolean>(false);
  const [userTasks, setUserTasks] = useState<any[]>([]);

  const fetchInstanceDetails = async (instanceId: string) => {
    try {
      // Fetch variables
      const varsRes = await request(`/engine-rest/process-instance/${instanceId}/variables`);
      const varList = Object.entries(varsRes).map(([key, val]: [string, any]) => ({
        name: key,
        value: val.value,
        type: val.type,
      }));
      setVariables(varList);

      // Fetch active activities
      const activitiesRes = await request(`/engine-rest/process-instance/${instanceId}/activity-instances`);
      
      const getChildActivities = (item: any): string[] => {
        let res: string[] = [];
        if (item.activityId) res.push(item.activityId);
        if (item.childActivityInstances) {
          item.childActivityInstances.forEach((child: any) => {
            res = [...res, ...getChildActivities(child)];
          });
        }
        return res;
      };
      
      setActiveActivities(getChildActivities(activitiesRes));

      // Fetch active User Tasks for forced transfer
      const tasksRes = await request<any[]>(`/engine-rest/task?processInstanceId=${instanceId}`);
      setUserTasks(tasksRes);
    } catch (e) {
      message.error('获取详情失败');
    }
  };

  const handleUpdateVariable = async (values: any) => {
    try {
      await request(`/engine-rest/process-instance/${currentRow?.id}/variables/${values.name}`, {
        method: 'PUT',
        data: {
          value: values.type === 'Integer' ? parseInt(values.value) : values.value,
          type: values.type,
        },
      });
      message.success('变量已更新');
      setShowVarModal(false);
      if (currentRow) fetchInstanceDetails(currentRow.id);
    } catch (e) {
      message.error('更新失败');
    }
  };

  const handleForcedTransfer = async (taskId: string, assignee: string) => {
    try {
      await request(`/engine-rest/task/${taskId}/assignee`, {
        method: 'POST',
        data: { userId: assignee },
      });
      message.success('转办成功');
      if (currentRow) fetchInstanceDetails(currentRow.id);
    } catch (e) {
      message.error('转办失败');
    }
  };

  const handleMoveNode = async (targetActivityId: string) => {
    try {
      // Example modification: cancel all current activities and start at target
      await request(`/engine-rest/process-instance/${currentRow?.id}/modification`, {
        method: 'POST',
        data: {
          instructions: [
            {
              type: 'startBeforeActivity',
              activityId: targetActivityId,
            },
            {
              type: 'cancelCurrentActiveActivityInstances',
              cancelCurrentActiveActivityInstances: true,
            }
          ]
        }
      });
      message.success('流程节点已跳转');
      actionRef.current?.reload();
      setShowDetail(false);
    } catch (e) {
      message.error('跳转失败');
    }
  };

  const handleAction = async (instanceId: string, action: string) => {
    try {
      if (action === 'suspend') {
        await request(`/engine-rest/process-instance/${instanceId}/suspended`, {
          method: 'PUT',
          data: { suspended: true },
        });
      } else if (action === 'activate') {
        await request(`/engine-rest/process-instance/${instanceId}/suspended`, {
          method: 'PUT',
          data: { suspended: false },
        });
      } else if (action === 'delete') {
        await request(`/engine-rest/process-instance/${instanceId}`, {
          method: 'DELETE',
        });
      }
      message.success('操作成功');
      actionRef.current?.reload();
      if (showDetail) setShowDetail(false);
    } catch (e) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '实例 ID',
      dataIndex: 'id',
      render: (id: string, entity: ProcessInstance) => (
        <a onClick={() => {
          setCurrentRow(entity);
          setShowDetail(true);
          fetchInstanceDetails(id);
        }}>
          {id}
        </a>
      ),
    },
    {
      title: '定义 ID',
      dataIndex: 'definitionId',
      ellipsis: true,
    },
    {
      title: '业务键 (Key)',
      dataIndex: 'businessKey',
      render: (key: string) => key || '-',
    },
    {
      title: '状态',
      dataIndex: 'suspended',
      render: (suspended: boolean) => (
        <Tag color={suspended ? 'warning' : 'success'}>
          {suspended ? '已挂起' : '运行中'}
        </Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: ProcessInstance) => [
        <Popconfirm
          key="suspend"
          title={record.suspended ? '确认激活该实例?' : '确认挂起该实例?'}
          onConfirm={() => handleAction(record.id, record.suspended ? 'activate' : 'suspend')}
        >
          <Button type="link">
            {record.suspended ? '激活' : '挂起'}
          </Button>
        </Popconfirm>,
        <Popconfirm
          key="delete"
          title="确认强制终止并删除该实例?"
          onConfirm={() => handleAction(record.id, 'delete')}
        >
          <Button type="link" danger>
            终止
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<ProcessInstance>
        headerTitle="流程实例管理"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        request={fetchInstances}
        columns={columns as any}
      />
      <Drawer
        width={1000}
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title={`实例详情: ${currentRow?.id}`}
      >
        <Tabs defaultActiveKey="diagram">
          <Tabs.TabPane tab="流程可视化" key="diagram">
            {currentRow && (
              <BpmnHighlightViewer 
                processDefinitionId={currentRow.definitionId} 
                activeActivityIds={activeActivities} 
              />
            )}
            <Divider />
            <h4>当前活跃节点</h4>
            <List
              dataSource={activeActivities}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Popconfirm
                      key="jump"
                      title="警告: 强行跳转节点可能导致数据不一致，确认继续?"
                      onConfirm={() => {
                        const target = prompt('请输入目标节点 Activity ID:');
                        if (target) handleMoveNode(target);
                      }}
                    >
                      <Button type="link" danger>跳转至此</Button>
                    </Popconfirm>
                  ]}
                >
                  <Tag color="blue">{item}</Tag>
                </List.Item>
              )}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="变量管理" key="variables">
            <List
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>实例变量列表</span>
                  <Button type="primary" size="small" onClick={() => {
                    setEditingVariable({ name: '', value: '', type: 'String' });
                    setShowVarModal(true);
                  }}>新增变量</Button>
                </div>
              }
              dataSource={variables}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button key="edit" type="link" onClick={() => {
                      setEditingVariable(item);
                      setShowVarModal(true);
                    }}>编辑</Button>
                  ]}
                >
                  <Descriptions column={3} size="small" style={{ width: '100%' }}>
                    <Descriptions.Item label="名称">{item.name}</Descriptions.Item>
                    <Descriptions.Item label="类型">{item.type}</Descriptions.Item>
                    <Descriptions.Item label="值">{JSON.stringify(item.value)}</Descriptions.Item>
                  </Descriptions>
                </List.Item>
              )}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="人工任务" key="tasks">
            <List
              header={<div>当前未完成 User Tasks</div>}
              dataSource={userTasks}
              renderItem={(item: any) => (
                <List.Item
                  actions={[
                    <Button key="transfer" type="link" onClick={() => {
                      const newUser = prompt('请输入新负责人 User ID:');
                      if (newUser) handleForcedTransfer(item.id, newUser);
                    }}>强制转办</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={`ID: ${item.id} | 当前负责人: ${item.assignee || '未分配'}`}
                  />
                </List.Item>
              )}
            />
          </Tabs.TabPane>
        </Tabs>
      </Drawer>

      <Modal
        title="变量编辑"
        open={showVarModal}
        onCancel={() => setShowVarModal(false)}
        onOk={() => {
          // Simplistic form validation for demo purposes
          handleUpdateVariable(editingVariable);
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <label>名称: </label>
          <input 
            value={editingVariable?.name} 
            disabled={editingVariable?.name !== ''} 
            onChange={e => setEditingVariable({...editingVariable, name: e.target.value})}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>类型: </label>
          <select 
            value={editingVariable?.type} 
            onChange={e => setEditingVariable({...editingVariable, type: e.target.value})}
            style={{ width: '100%' }}
          >
            <option value="String">String</option>
            <option value="Integer">Integer</option>
            <option value="Boolean">Boolean</option>
          </select>
        </div>
        <div>
          <label>值: </label>
          <input 
            value={editingVariable?.value} 
            onChange={e => setEditingVariable({...editingVariable, value: e.target.value})}
            style={{ width: '100%' }}
          />
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ProcessInstances;
