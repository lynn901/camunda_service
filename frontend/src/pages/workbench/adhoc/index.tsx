import { PageContainer, ProForm, ProFormText, ProFormTextArea, ProFormDateTimePicker, ProFormSelect } from '@ant-design/pro-components';
import { message, Card } from 'antd';
import React from 'react';
import { createStandaloneTask } from '@/services/workflow';
import { history, useIntl } from '@umijs/max';

const AdhocTask: React.FC = () => {
  const intl = useIntl();

  const onFinish = async (values: any) => {
    try {
      await createStandaloneTask({
        name: values.name,
        description: values.description,
        assignee: values.assignee,
        due: values.due,
      });
      message.success(intl.formatMessage({ id: 'pages.workbench.adhoc.success', defaultMessage: 'Ad-hoc task created successfully!' }));
      history.push('/workbench/todo');
    } catch (error) {
      message.error(intl.formatMessage({ id: 'pages.workbench.adhoc.error', defaultMessage: 'Failed to create ad-hoc task.' }));
    }
  };

  return (
    <PageContainer>
      <Card title={intl.formatMessage({ id: 'pages.workbench.adhoc.title', defaultMessage: 'Create Ad-hoc Task' })}>
        <ProForm
          onFinish={onFinish}
          submitter={{
            searchConfig: {
              submitText: intl.formatMessage({ id: 'pages.workbench.adhoc.submit', defaultMessage: 'Create Task' }),
            },
          }}
        >
          <ProFormText
            name="name"
            label={intl.formatMessage({ id: 'pages.workbench.adhoc.name', defaultMessage: 'Task Name' })}
            placeholder="e.g. Please review the quarterly report"
            rules={[{ required: true }]}
          />
          <ProFormSelect
            name="assignee"
            label={intl.formatMessage({ id: 'pages.workbench.adhoc.assignee', defaultMessage: 'Assignee' })}
            options={[
              { label: 'Demo User (demo)', value: 'demo' },
              { label: 'Admin (admin)', value: 'admin' },
            ]}
            placeholder="Select a person to assign"
          />
          <ProFormDateTimePicker
            name="due"
            label={intl.formatMessage({ id: 'pages.workbench.adhoc.dueDate', defaultMessage: 'Due Date' })}
          />
          <ProFormTextArea
            name="description"
            label={intl.formatMessage({ id: 'pages.workbench.adhoc.description', defaultMessage: 'Description' })}
            placeholder="Provide additional context for this task"
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default AdhocTask;
