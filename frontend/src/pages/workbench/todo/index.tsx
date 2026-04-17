import { PageContainer, ProTable } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Button, Tag, Space, message, Modal, Drawer, Descriptions, Divider, Input, Collapse } from 'antd';
import React, { useRef, useState } from 'react';
import { ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import BpmnHighlightViewer from '@/components/BpmnHighlightViewer';
import { correlateMessage, deliverSignal } from '@/services/workflow';

interface TaskItem {
  id: string;
  name: string;
  type: 'User Task' | 'External Task';
  assignee: string | null;
  created: string;
  processInstanceId: string;
  processDefinitionId: string;
  activityId?: string;
  isExternal: boolean;
}

const TodoList: React.FC = () => {
  const actionRef = useRef<any>(null);
  const [currentRow, setCurrentRow] = useState<TaskItem>();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [msgName, setMsgName] = useState('');
  const [sigName, setSigName] = useState('');

  const fetchTasks = async (params: any) => {
    try {
      // Use POST for User Tasks to support complex filtering
      const body: any = {
        active: true,
      };

      if (params.name) {
        body.nameLike = `%${params.name}%`;
      }
      if (params.assignee) {
        body.assigneeLike = `%${params.assignee}%`;
      }

      // 1. Fetch User Tasks
      const userTasks = await request<any[]>('/engine-rest/task', {
        method: 'POST',
        data: body,
        params: {
          maxResults: params.pageSize,
          firstResult: (params.current - 1) * params.pageSize,
        }
      });

      // 2. Fetch External Tasks (Basic support, usually less filtered)
      const extTasks = await request<any[]>('/engine-rest/external-task', {
        method: 'GET',
        params: {
          active: true,
          maxResults: 50, // Limit for unified view
        }
      });

      const unified: TaskItem[] = [
        ...userTasks.map((t: any) => ({
          id: t.id,
          name: t.name,
          type: 'User Task' as const,
          assignee: t.assignee,
          created: t.created,
          processInstanceId: t.processInstanceId,
          processDefinitionId: t.processDefinitionId,
          activityId: t.taskDefinitionKey,
          isExternal: false
        })),
        ...extTasks.map((t: any) => ({
          id: t.id,
          name: `External: ${t.topicName}`,
          type: 'External Task' as const,
          assignee: 'Worker Pool',
          created: new Date().toISOString(),
          processInstanceId: t.processInstanceId,
          processDefinitionId: t.processDefinitionId,
          activityId: t.activityId,
          isExternal: true
        }))
      ];

      // Handle front-end filtering for external tasks if name is provided
      const filtered = params.name 
        ? unified.filter(item => item.name.toLowerCase().includes(params.name.toLowerCase()))
        : unified;

      return {
        data: filtered,
        success: true,
      };
    } catch (error) {
      console.error(error);
      return {
        data: [],
        success: false,
      };
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await request(`/engine-rest/task/${taskId}/complete`, {
        method: 'POST',
        data: { variables: {} }
      });
      message.success('任务已完成');
      setShowDetail(false);
      actionRef.current?.reload();
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleIntervene = async (type: 'message' | 'signal', name: string) => {
    if (!name) return;
    try {
      if (type === 'message') {
        await correlateMessage(name, currentRow?.processInstanceId);
        message.success(`消息 [${name}] 已关联`);
        setMsgName('');
      } else {
        await deliverSignal(name);
        message.success(`信号 [${name}] 已广播`);
        setSigName('');
      }
      actionRef.current?.reload();
      setShowDetail(false);
    } catch (e) {
      message.error('干预操作失败，请检查名称是否匹配或流程状态');
    }
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      render: (dom: any, entity: TaskItem) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      hideInSearch: true,
      render: (type: string) => (
        <Tag color={type === 'User Task' ? 'blue' : 'orange'}>{type}</Tag>
      ),
    },
    {
      title: '处理人',
      dataIndex: 'assignee',
      render: (assignee: string) => (
        <Tag icon={<ClockCircleOutlined />} color="default">
          {assignee || '未分配'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: TaskItem) => [
        <Button
          type="link"
          key="complete"
          disabled={record.isExternal}
          onClick={() => {
            Modal.confirm({
              title: '确认完成任务?',
              onOk: () => handleComplete(record.id),
            });
          }}
        >
          {record.isExternal ? '等待 Worker' : '办理'}
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<TaskItem>
        headerTitle="待办任务列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        request={fetchTasks}
        columns={columns as any}
      />
      <Drawer
        width={800}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
        title="任务详情"
      >
        {currentRow?.id && (
          <>
            <Descriptions title={currentRow?.name} column={2}>
              <Descriptions.Item label="任务 ID">{currentRow?.id}</Descriptions.Item>
              <Descriptions.Item label="任务类型">{currentRow?.type}</Descriptions.Item>
              <Descriptions.Item label="实例 ID">{currentRow?.processInstanceId}</Descriptions.Item>
              <Descriptions.Item label="当前节点">{currentRow?.activityId}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <Collapse ghost defaultActiveKey={['visual']}>
              <Collapse.Panel header="流程进度可视化" key="visual">
                {currentRow.processDefinitionId && currentRow.activityId && (
                  <BpmnHighlightViewer 
                    processDefinitionId={currentRow.processDefinitionId} 
                    activeActivityIds={[currentRow.activityId]} 
                  />
                )}
              </Collapse.Panel>
              <Collapse.Panel header="业务干预 (消息/信号)" key="intervene">
                <p style={{ fontSize: 12, color: '#666' }}>
                  提示：通过关联 BPMN 消息或广播信号来主动改变流程流转路径。
                </p>
                <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
                  <Input 
                    placeholder="输入消息名称 (Message Name)" 
                    value={msgName} 
                    onChange={e => setMsgName(e.target.value)} 
                  />
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />}
                    onClick={() => handleIntervene('message', msgName)}
                  >
                    关联消息
                  </Button>
                </Space.Compact>
                <Space.Compact style={{ width: '100%' }}>
                  <Input 
                    placeholder="输入信号名称 (Signal Name)" 
                    value={sigName} 
                    onChange={e => setSigName(e.target.value)} 
                  />
                  <Button 
                    type="primary" 
                    danger
                    icon={<SendOutlined />}
                    onClick={() => handleIntervene('signal', sigName)}
                  >
                    广播信号
                  </Button>
                </Space.Compact>
              </Collapse.Panel>
            </Collapse>
            <Divider />
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowDetail(false)}>取消</Button>
              <Button 
                type="primary" 
                disabled={currentRow.isExternal}
                onClick={() => handleComplete(currentRow.id)}
              >
                直接完成 (Approve)
              </Button>
            </Space>
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TodoList;
