import { PageContainer, ProList } from '@ant-design/pro-components';
import { Button, message, Space, Tag, Modal, Form, Input } from 'antd';
import React, { useState } from 'react';
import { getProcessDefinitions, startProcessInstance } from '@/services/workflow';
import { useIntl, history } from '@umijs/max';

const Launchpad: React.FC = () => {
  const intl = useIntl();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<any>(null);
  const [form] = Form.useForm();

  const handleStart = (record: any) => {
    setCurrentProcess(record);
    setIsModalVisible(true);
  };

  const onFinish = async (values: any) => {
    try {
      await startProcessInstance(currentProcess.id, values);
      message.success(intl.formatMessage({ id: 'pages.workbench.launchpad.success', defaultMessage: 'Process started successfully!' }));
      setIsModalVisible(false);
      form.resetFields();
      history.push('/workbench/own');
    } catch (error) {
      message.error(intl.formatMessage({ id: 'pages.workbench.launchpad.error', defaultMessage: 'Failed to start process.' }));
    }
  };

  return (
    <PageContainer>
      <ProList<any>
        rowKey="id"
        headerTitle={intl.formatMessage({ id: 'menu.workbench.launchpad', defaultMessage: 'Launchpad' })}
        request={async (params) => {
          const data = await getProcessDefinitions();
          return {
            data,
            success: true,
          };
        }}
        pagination={{
          pageSize: 10,
        }}
        metas={{
          title: {
            dataIndex: 'name',
            render: (text, record) => (
              <Space>
                {text || record.key}
                <Tag color="blue">v{record.version}</Tag>
              </Space>
            ),
          },
          subTitle: {
            render: (text, record) => {
              return (
                <Space size={0}>
                  <Tag color="cyan">{record.category || 'General'}</Tag>
                </Space>
              );
            },
          },
          description: {
            dataIndex: 'description',
          },
          actions: {
            render: (text, record) => [
              <Button type="primary" key="start" onClick={() => handleStart(record)}>
                {intl.formatMessage({ id: 'pages.workbench.launchpad.trigger', defaultMessage: 'Start' })}
              </Button>,
            ],
          },
        }}
        grid={{ gutter: 16, column: 3 }}
      />

      <Modal
        title={`${intl.formatMessage({ id: 'pages.workbench.launchpad.trigger', defaultMessage: 'Start' })}: ${currentProcess?.name || currentProcess?.key}`}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.workbench.launchpad.businessKey', defaultMessage: 'Business Key' })}
            name="businessKey"
          >
            <Input placeholder="Optional business reference" />
          </Form.Item>
          <p style={{ color: 'rgba(0,0,0,0.45)' }}>
            Note: This is a basic initiation form. In the future, dynamic forms will be integrated here.
          </p>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Launchpad;
