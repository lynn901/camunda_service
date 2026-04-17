import { PageContainer, ProTable } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Button, Tag, Space, message, Popconfirm, Modal, List, Divider, Tabs, Select, Badge } from 'antd';
import { EyeOutlined, HistoryOutlined, PoweroffOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import BpmnHighlightViewer from '@/components/BpmnHighlightViewer';

interface ProcessDefinition {
  id: string;
  key: string;
  category: string;
  description: string | null;
  name: string;
  version: number;
  resource: string;
  deploymentId: string;
  diagram: string | null;
  suspended: boolean;
  tenantId: string | null;
  versionTag: string | null;
}

const Definitions: React.FC = () => {
  const actionRef = useRef<any>(null);
  const [showXml, setShowXml] = useState(false);
  const [xmlContent, setXmlContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<ProcessDefinition[]>([]);
  const [selectedDefinition, setSelectedDefinition] = useState<ProcessDefinition | null>(null);

  const fetchDefinitions = async (params: any) => {
    try {
      const result = await request<ProcessDefinition[]>('/engine-rest/process-definition', {
        method: 'GET',
        params: {
          latestVersion: true, // Default to only showing the latest version
          firstResult: (params.current - 1) * params.pageSize,
          maxResults: params.pageSize,
        },
      });

      const countRes = await request<{ count: number }>('/engine-rest/process-definition/count', {
        params: { latestVersion: true }
      });

      return {
        data: result,
        total: countRes.count,
        success: true,
      };
    } catch (error) {
      message.error('获取定义列表失败');
      return {
        data: [],
        success: false,
      };
    }
  };

  const handleToggleStatus = async (record: ProcessDefinition) => {
    try {
      await request(`/engine-rest/process-definition/${record.id}/suspended`, {
        method: 'PUT',
        data: { suspended: !record.suspended },
      });
      message.success('状态已更新');
      actionRef.current?.reload();
    } catch (e) {
      message.error('操作失败');
    }
  };

  const viewXml = async (id: string) => {
    try {
      const res = await request(`/engine-rest/process-definition/${id}/xml`);
      setXmlContent(res.bpmn20Xml);
      setShowXml(true);
    } catch (e) {
      message.error('获取 XML 失败');
    }
  };

  const viewHistory = async (key: string) => {
    try {
      const res = await request<ProcessDefinition[]>('/engine-rest/process-definition', {
        params: { key, sortBy: 'version', sortOrder: 'desc' }
      });
      setHistoryList(res);
      setSelectedDefinition(res[0]); // Default to latest for heatmap
      setShowHistory(true);
    } catch (e) {
      message.error('获取历史版本失败');
    }
  };

  const columns = [
    {
      title: '流程 ID',
      dataIndex: 'id',
      ellipsis: true,
      search: false,
    },
    {
      title: '流程标识 (Key)',
      dataIndex: 'key',
    },
    {
      title: '流程名称',
      dataIndex: 'name',
    },
    {
      title: '版本',
      dataIndex: 'version',
      render: (v: number) => <Tag color="blue">v{v}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'suspended',
      render: (suspended: boolean) => (
        <Tag color={suspended ? 'warning' : 'success'}>
          {suspended ? '已挂起' : '活跃'}
        </Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: ProcessDefinition) => [
        <Button key="xml" type="link" icon={<EyeOutlined />} onClick={() => viewXml(record.id)}>
          查看 XML
        </Button>,
        <Button key="history" type="link" icon={<HistoryOutlined />} onClick={() => viewHistory(record.key)}>
          历史版本
        </Button>,
        <Popconfirm
          key="toggle"
          title={record.suspended ? '确认激活该流程定义?' : '确认挂起该流程定义?'}
          onConfirm={() => handleToggleStatus(record)}
        >
          <Button type="link" danger={!record.suspended} icon={<PoweroffOutlined />}>
            {record.suspended ? '激活' : '挂起'}
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<ProcessDefinition>
        headerTitle="流程定义列表 (最新版)"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        request={fetchDefinitions}
        columns={columns as any}
      />

      <Modal
        title="BPMN XML 内容"
        open={showXml}
        onCancel={() => setShowXml(false)}
        footer={[<Button key="close" onClick={() => setShowXml(false)}>关闭</Button>]}
        width={1000}
      >
        <pre style={{ maxHeight: '600px', overflow: 'auto', background: '#f5f5f5', padding: '16px' }}>
          {xmlContent}
        </pre>
      </Modal>

      <Modal
        title="流程历史版本与效能分析"
        open={showHistory}
        onCancel={() => setShowHistory(false)}
        footer={null}
        width={1000}
      >
        <Tabs defaultActiveKey="list">
          <Tabs.TabPane tab="版本列表" key="list">
            <List
              itemLayout="horizontal"
              dataSource={historyList}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button key="v-xml" type="link" onClick={() => viewXml(item.id)}>XML</Button>,
                    <Popconfirm
                      key="v-toggle"
                      title="确认切换状态?"
                      onConfirm={() => handleToggleStatus(item)}
                    >
                      <Button type="link">{item.suspended ? '激活' : '挂起'}</Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    title={<span>{item.name} <Tag color="blue">v{item.version}</Tag></span>}
                    description={`ID: ${item.id} | Deployment: ${item.deploymentId}`}
                  />
                  <div>{item.suspended ? <Tag color="warning">已挂起</Tag> : <Tag color="success">活跃</Tag>}</div>
                </List.Item>
              )}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="节点耗时热力图" key="heatmap">
            <div style={{ marginBottom: 16 }}>
              选择版本: 
              <Select 
                value={selectedDefinition?.id} 
                onChange={(val) => setSelectedDefinition(historyList.find(h => h.id === val) || null)}
                style={{ width: 300, marginLeft: 8 }}
              >
                {historyList.map(h => <Select.Option key={h.id} value={h.id}>v{h.version} ({h.id})</Select.Option>)}
              </Select>
            </div>
            {selectedDefinition && (
              <BpmnHighlightViewer 
                processDefinitionId={selectedDefinition.id} 
                mode="heatmap" 
              />
            )}
            <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>
              <Space>
                <Badge status="success" text="快速 (<1h)" />
                <Badge status="warning" text="中等 (1h-24h)" />
                <Badge status="error" text="缓慢 (>24h)" />
              </Space>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </PageContainer>
  );
};

export default Definitions;
