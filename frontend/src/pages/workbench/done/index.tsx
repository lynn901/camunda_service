import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag, message } from 'antd';
import { request } from '@umijs/max';
import React from 'react';

const DoneList: React.FC = () => {
  const fetchDoneTasks = async (params: any) => {
    try {
      // Use POST /history/task for complex history searching
      const body: any = {
        finished: true,
        sorting: [
          {
            sortBy: 'endTime',
            sortOrder: 'desc',
          }
        ],
      };

      if (params.name) {
        body.taskNameLike = `%${params.name}%`;
      }
      if (params.businessKey) {
        body.processInstanceBusinessKey = params.businessKey;
      }
      if (params.assignee) {
        body.taskAssignee = params.assignee;
      }

      const data = await request<any[]>('/engine-rest/history/task', {
        method: 'POST',
        data: body,
        params: {
          maxResults: params.pageSize,
          firstResult: (params.current - 1) * params.pageSize,
        }
      });

      const countRes = await request<{ count: number }>('/engine-rest/history/task/count', {
        method: 'POST',
        data: body,
      });

      return {
        data: data,
        success: true,
        total: countRes.count,
      };
    } catch (error: any) {
      console.error('Fetch Error:', error);
      message.error('请求失败: ' + error.message);
      return { data: [], success: false };
    }
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '流程名称',
      dataIndex: 'processDefinitionName',
      ellipsis: true,
      hideInSearch: true,
      render: (text: string, record: any) => text || record.processDefinitionKey,
    },
    {
      title: '业务主键',
      dataIndex: 'businessKey',
      copyable: true,
    },
    {
      title: '处理人',
      dataIndex: 'assignee',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '完成时间',
      dataIndex: 'endTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'deleteReason',
      hideInSearch: true,
      render: (reason: string) => (
        <Tag color={reason === 'completed' ? 'success' : 'default'}>
          {reason === 'completed' ? '已完成' : '已取消'}
        </Tag>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable
        headerTitle="已办任务列表"
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        request={fetchDoneTasks}
        columns={columns as any}
      />
    </PageContainer>
  );
};

export default DoneList;
