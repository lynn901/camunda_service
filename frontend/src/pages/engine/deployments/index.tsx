import { PageContainer, ProTable } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Button, message, Popconfirm, Upload, Modal } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';

interface Deployment {
  id: string;
  name: string;
  deploymentTime: string;
  source: string;
  tenantId: string | null;
}

const Deployments: React.FC = () => {
  const actionRef = useRef<any>(null);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  const fetchDeployments = async (params: any) => {
    try {
      const result = await request<Deployment[]>('/engine-rest/deployment', {
        method: 'GET',
        params: {
          firstResult: (params.current - 1) * params.pageSize,
          maxResults: params.pageSize,
        },
      });

      const countRes = await request<{ count: number }>('/engine-rest/deployment/count');

      return {
        data: result,
        total: countRes.count,
        success: true,
      };
    } catch (error) {
      message.error('获取部署列表失败');
      return {
        data: [],
        success: false,
      };
    }
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择文件');
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('data', file);
    });
    formData.append('deployment-name', 'Web-Upload-' + new Date().getTime());
    formData.append('deploy-changed-only', 'true');

    try {
      await request('/engine-rest/deployment/create', {
        method: 'POST',
        data: formData,
        requestType: 'form',
      });
      message.success('部署成功');
      setUploadVisible(false);
      setFileList([]);
      actionRef.current?.reload();
    } catch (e) {
      message.error('部署失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request(`/engine-rest/deployment/${id}`, {
        method: 'DELETE',
        params: { cascade: true },
      });
      message.success('部署包已删除');
      actionRef.current?.reload();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '部署 ID',
      dataIndex: 'id',
      ellipsis: true,
      search: false,
    },
    {
      title: '部署名称',
      dataIndex: 'name',
    },
    {
      title: '部署源',
      dataIndex: 'source',
      render: (source: string) => source || '-',
    },
    {
      title: '部署时间',
      dataIndex: 'deploymentTime',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: Deployment) => [
        <Popconfirm
          key="delete"
          title="警告: 删除部署将级联删除相关的流程定义及实例，确认继续?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<Deployment>
        headerTitle="部署包列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button key="upload" type="primary" icon={<UploadOutlined />} onClick={() => setUploadVisible(true)}>
            上传 BPMN 部署
          </Button>,
        ]}
        request={fetchDeployments}
        columns={columns as any}
      />

      <Modal
        title="上传 BPMN 文件"
        open={uploadVisible}
        onOk={handleUpload}
        onCancel={() => setUploadVisible(false)}
      >
        <Upload
          fileList={fileList}
          beforeUpload={(file) => {
            setFileList([...fileList, file]);
            return false;
          }}
          onRemove={(file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
          }}
        >
          <Button icon={<UploadOutlined />}>选择文件 (.bpmn, .zip)</Button>
        </Upload>
      </Modal>
    </PageContainer>
  );
};

export default Deployments;
