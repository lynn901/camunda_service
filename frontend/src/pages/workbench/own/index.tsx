import { PageContainer, ProTable } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Tag } from 'antd';
import React from 'react';

interface ApplicationItem {
  id: string;
  businessKey: string | null;
  processDefinitionKey: string;
  startTime: string;
  endTime: string | null;
  state: string;
}

const OwnApplications: React.FC = () => {
  const fetchMyApps = async (params: any) => {
    try {
      // Use POST for complex filtering as GET might ignore some parameters
      const body: any = {
        sorting: [
          {
            sortBy: 'startTime',
            sortOrder: 'desc',
          }
        ],
      };

      if (params.processDefinitionName) {
        body.processDefinitionNameLike = `%${params.processDefinitionName}%`;
      }
      if (params.businessKey) {
        body.processInstanceBusinessKey = params.businessKey;
      }
      if (params.state) {
        if (params.state === 'ACTIVE') {
          body.unfinished = true;
        } else if (params.state === 'COMPLETED') {
          body.finished = true;
        } else if (params.state === 'EXTERNALLY_TERMINATED') {
          body.externallyTerminated = true;
        }
      }

      const data = await request<any[]>('/engine-rest/history/process-instance', {
        method: 'POST',
        data: body,
        params: {
          maxResults: params.pageSize,
          firstResult: (params.current - 1) * params.pageSize,
        }
      });

      const countRes = await request<{ count: number }>('/engine-rest/history/process-instance/count', {
        method: 'POST',
        data: body,
      });
      
      return {
        data,
        total: countRes.count,
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

  const columns = [
    {
      title: '流程名称',
      dataIndex: 'processDefinitionName',
      ellipsis: true,
      render: (text: string, record: any) => text || record.processDefinitionKey,
    },
    {
      title: '业务主键',
      dataIndex: 'businessKey',
      copyable: true,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'state',
      initialValue: undefined,
      valueEnum: {
        ACTIVE: { text: '运行中', status: 'Processing' },
        COMPLETED: { text: '已完成', status: 'Success' },
        EXTERNALLY_TERMINATED: { text: '已终止', status: 'Error' },
      },
      render: (_: any, record: any) => {
        let color = 'default';
        if (record.state === 'ACTIVE') color = 'processing';
        if (record.state === 'COMPLETED') color = 'success';
        if (record.state === 'EXTERNALLY_TERMINATED') color = 'error';
        return <Tag color={color}>{record.state}</Tag>;
      },
    },
    {
      title: '发起时间',
      dataIndex: 'startTime',
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '完成时间',
      dataIndex: 'endTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '流程 ID',
      dataIndex: 'id',
      ellipsis: true,
      copyable: true,
    },
  ];

  return (
    <PageContainer>
      <ProTable<ApplicationItem>
        headerTitle="我的申请列表"
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        request={fetchMyApps}
        columns={columns as any}
      />
    </PageContainer>
  );
};

export default OwnApplications;
