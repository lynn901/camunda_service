import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Space, message, Modal, Input, Select, Tag, Divider, List, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, EyeOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

interface FormField {
  id: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required: boolean;
  placeholder?: string;
}

interface FormSchema {
  id: string;
  name: string;
  fields: FormField[];
}

const FormDesigner: React.FC = () => {
  const [forms, setForms] = useState<FormSchema[]>([
    {
      id: 'form_1',
      name: '请假申请表',
      fields: [
        { id: 'reason', label: '请假原因', type: 'string', required: true, placeholder: '请输入请假原因' },
        { id: 'days', label: '请假天数', type: 'number', required: true },
      ]
    }
  ]);
  const [currentForm, setCurrentForm] = useState<FormSchema | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleSaveForm = () => {
    if (!currentForm?.name) {
      message.error('请输入表单名称');
      return;
    }
    const index = forms.findIndex(f => f.id === currentForm.id);
    if (index >= 0) {
      const newForms = [...forms];
      newForms[index] = currentForm;
      setForms(newForms);
    } else {
      setForms([...forms, { ...currentForm, id: `form_${Date.now()}` }]);
    }
    message.success('保存成功');
    setShowEditModal(false);
  };

  const addField = () => {
    if (!currentForm) return;
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: '新字段',
      type: 'string',
      required: false
    };
    setCurrentForm({ ...currentForm, fields: [...currentForm.fields, newField] });
  };

  const removeField = (id: string) => {
    if (!currentForm) return;
    setCurrentForm({
      ...currentForm,
      fields: currentForm.fields.filter(f => f.id !== id)
    });
  };

  const columns = [
    { title: '表单 ID', dataIndex: 'id', width: 120 },
    { title: '表单名称', dataIndex: 'name' },
    { 
      title: '字段数量', 
      dataIndex: 'fields', 
      render: (fields: any[]) => <Tag color="blue">{fields.length}</Tag> 
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text: any, record: FormSchema) => [
        <Button key="edit" type="link" onClick={() => {
          setCurrentForm(record);
          setShowEditModal(true);
        }}>编辑</Button>,
        <Button key="preview" type="link" icon={<EyeOutlined />} onClick={() => {
          setCurrentForm(record);
          setShowPreviewModal(true);
        }}>预览</Button>,
        <Button key="delete" type="link" danger onClick={() => {
          setForms(forms.filter(f => f.id !== record.id));
        }}>删除</Button>
      ]
    }
  ];

  return (
    <PageContainer
      header={{
        extra: [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => {
            setCurrentForm({ id: '', name: '', fields: [] });
            setShowEditModal(true);
          }}>新建表单</Button>
        ]
      }}
    >
      <ProTable<FormSchema>
        headerTitle="动态表单模板"
        rowKey="id"
        search={false}
        dataSource={forms}
        columns={columns as any}
      />

      <Modal
        title={currentForm?.id ? '编辑表单' : '新建表单'}
        open={showEditModal}
        onOk={handleSaveForm}
        onCancel={() => setShowEditModal(false)}
        width={800}
      >
        <div style={{ marginBottom: 24 }}>
          <label>表单名称: </label>
          <Input 
            value={currentForm?.name} 
            onChange={e => setCurrentForm({ ...currentForm!, name: e.target.value })}
            placeholder="请输入表单名称"
          />
        </div>
        <Divider titlePlacement="left">表单字段配置</Divider>
        <List
          dataSource={currentForm?.fields}
          renderItem={(field, index) => (
            <Card size="small" style={{ marginBottom: 12 }} actions={[
              <Button type="link" danger icon={<DeleteOutlined />} onClick={() => removeField(field.id)}>删除</Button>
            ]}>
              <Space wrap>
                <Input 
                  addonBefore="标签" 
                  value={field.label} 
                  onChange={e => {
                    const newFields = [...currentForm!.fields];
                    newFields[index].label = e.target.value;
                    setCurrentForm({ ...currentForm!, fields: newFields });
                  }} 
                />
                <Select 
                  value={field.type} 
                  style={{ width: 120 }}
                  onChange={val => {
                    const newFields = [...currentForm!.fields];
                    newFields[index].type = val;
                    setCurrentForm({ ...currentForm!, fields: newFields });
                  }}
                >
                  <Select.Option value="string">文本 (String)</Select.Option>
                  <Select.Option value="number">数字 (Number)</Select.Option>
                  <Select.Option value="boolean">布尔 (Boolean)</Select.Option>
                  <Select.Option value="date">日期 (Date)</Select.Option>
                </Select>
                <Select 
                  value={field.required ? '必填' : '选填'} 
                  style={{ width: 100 }}
                  onChange={val => {
                    const newFields = [...currentForm!.fields];
                    newFields[index].required = val === '必填';
                    setCurrentForm({ ...currentForm!, fields: newFields });
                  }}
                >
                  <Select.Option value="必填">必填</Select.Option>
                  <Select.Option value="选填">选填</Select.Option>
                </Select>
                <Input 
                  placeholder="提示文字" 
                  value={field.placeholder} 
                  onChange={e => {
                    const newFields = [...currentForm!.fields];
                    newFields[index].placeholder = e.target.value;
                    setCurrentForm({ ...currentForm!, fields: newFields });
                  }} 
                />
              </Space>
            </Card>
          )}
        />
        <Button block type="dashed" icon={<PlusOutlined />} onClick={addField}>添加字段</Button>
      </Modal>

      <Modal
        title={`预览表单: ${currentForm?.name}`}
        open={showPreviewModal}
        onCancel={() => setShowPreviewModal(false)}
        footer={[<Button key="close" onClick={() => setShowPreviewModal(false)}>关闭</Button>]}
      >
        <List
          dataSource={currentForm?.fields}
          renderItem={field => (
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
              </div>
              {field.type === 'string' && <Input placeholder={field.placeholder} />}
              {field.type === 'number' && <Input type="number" placeholder={field.placeholder} />}
              {field.type === 'boolean' && <Select style={{ width: '100%' }} placeholder="请选择"><Select.Option value="true">是</Select.Option><Select.Option value="false">否</Select.Option></Select>}
              {field.type === 'date' && <Input type="date" />}
            </div>
          )}
        />
        <Divider />
        <pre style={{ background: '#f5f5f5', padding: 8, fontSize: '12px' }}>
          {JSON.stringify(currentForm, null, 2)}
        </pre>
      </Modal>
    </PageContainer>
  );
};

export default FormDesigner;
