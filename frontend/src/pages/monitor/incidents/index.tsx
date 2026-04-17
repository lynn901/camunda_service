import { PageContainer, ProTable } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Button, Tag, Space, message, Popconfirm, Modal, Typography } from 'antd';
import React, { useRef } from 'react';

const { Text } = Typography;

interface Incident {
  id: string;
  processDefinitionId: string;
  processInstanceId: string;
  executionId: string;
  incidentTimestamp: string;
  incidentType: string;
  activityId: string;
  causeIncidentId: string;
  rootCauseIncidentId: string;
  configuration: string;
  tenantId: string | null;
  incidentMessage: string;
  jobDefinitionId: string | null;
}

const Incidents: React.FC = () => {
  const actionRef = useRef<any>(null);

  const fetchIncidents = async (params: any) => {
    try {
      const result = await request<Incident[]>('/engine-rest/incident', {
        method: 'GET',
        params: {
          firstResult: (params.current - 1) * params.pageSize,
          maxResults: params.pageSize,
        },
      });

      const countRes = await request<{ count: number }>('/engine-rest/incident/count');

      return {
        data: result,
        total: countRes.count,
        success: true,
      };
    } catch (error) {
      message.error('获取异常列表失败');
      return {
        data: [],
        success: false,
      };
    }
  };

  const handleRetry = async (record: Incident) => {
    try {
      if (record.configuration) {
        // Retry a job
        await request(`/engine-rest/job/${record.configuration}/retries`, {
          method: 'PUT',
          data: { retries: 1 },
        });
        message.success('已重置重试次数，任务将重新运行');
        actionRef.current?.reload();
      } else {
        message.warning('该异常类型不支持直接重试');
      }
    } catch (e) {
      message.error('重试失败');
    }
  };

  const columns = [
    {
      title: '异常 ID',
      dataIndex: 'id',
      ellipsis: true,
      search: false,
    },
    {
      title: '类型',
      dataIndex: 'incidentType',
      render: (type: string) => <Tag color="error">{type}</Tag>,
    },
    {
      title: '异常消息',
      dataIndex: 'incidentMessage',
      ellipsis: true,
      render: (msg: string) => (
        <a onClick={() => {
          Modal.info({
            title: '异常详情',
            width: 600,
            content: (
              <div style={{ maxHeight: 400, overflow: 'auto' }}>
                <Text type="danger">{msg}</Text>
              </div>
            ),
          });
        }}>
          {msg}
        </a>
      ),
    },
    {
      title: '实例 ID',
      dataIndex: 'processInstanceId',
      ellipsis: true,
    },
    {
      title: '节点 ID',
      dataIndex: 'activityId',
    },
    {
      title: '发生时间',
      dataIndex: 'incidentTimestamp',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: Incident) => [
        <Popconfirm
          key="retry"
          title="确认重试该任务?"
          onConfirm={() => handleRetry(record)}
          disabled={!record.configuration}
        >
          <Button type="link" disabled={!record.configuration}>
            重试 (Retry)
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<Incident>
        headerTitle="流程运行异常 (Incidents)"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        request={fetchIncidents}
        columns={columns as any}
      />
    </PageContainer>
  );
};

export default Incidents;
