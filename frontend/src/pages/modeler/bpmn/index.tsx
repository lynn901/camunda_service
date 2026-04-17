import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Button, Space, message, Modal, Input } from 'antd';
import { DownloadOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';

import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';

// CSS for bpmn-js
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';

const DEFAULT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const BpmnDesigner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const propertiesRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<any>(null);
  const [deploymentName, setDeploymentName] = useState('New Process');
  const [showDeployModal, setShowDeployModal] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !propertiesRef.current) return;

    modelerRef.current = new BpmnModeler({
      container: containerRef.current,
      propertiesPanel: {
        parent: propertiesRef.current
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        CamundaPlatformPropertiesProviderModule
      ],
      moddleExtensions: {
        camunda: camundaModdleDescriptor
      }
    });

    modelerRef.current.importXML(DEFAULT_XML).catch((err: any) => {
      console.error('Error loading BPMN XML:', err);
    });

    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy();
      }
    };
  }, []);

  const handleDownloadXml = async () => {
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      const blob = new Blob([xml], { type: 'application/xml' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'diagram.bpmn';
      link.click();
    } catch (e) {
      message.error('导出 XML 失败');
    }
  };

  const handleDeploy = async () => {
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      const formData = new FormData();
      const blob = new Blob([xml], { type: 'application/xml' });
      formData.append('data', blob, `${deploymentName}.bpmn`);
      formData.append('deployment-name', deploymentName);
      formData.append('deploy-changed-only', 'true');

      await request('/engine-rest/deployment/create', {
        method: 'POST',
        data: formData,
        requestType: 'form',
      });

      message.success('流程已部署成功');
      setShowDeployModal(false);
    } catch (e) {
      message.error('部署失败');
    }
  };

  return (
    <PageContainer
      header={{
        extra: [
          <Space key="extra">
            <Button icon={<DownloadOutlined />} onClick={handleDownloadXml}>导出 XML</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={() => setShowDeployModal(true)}>发布到引擎</Button>
          </Space>
        ]
      }}
    >
      <div style={{ display: 'flex', height: 'calc(100vh - 250px)', border: '1px solid #d9d9d9' }}>
        <div ref={containerRef} style={{ flex: 1, position: 'relative' }} />
        <div 
          ref={propertiesRef} 
          style={{ 
            width: '350px', 
            borderLeft: '1px solid #d9d9d9', 
            backgroundColor: '#f8f8f8',
            overflowY: 'auto'
          }} 
        />
      </div>

      <Modal
        title="发布流程定义"
        open={showDeployModal}
        onOk={handleDeploy}
        onCancel={() => setShowDeployModal(false)}
      >
        <div style={{ marginBottom: 16 }}>
          <label>部署名称: </label>
          <Input 
            value={deploymentName} 
            onChange={e => setDeploymentName(e.target.value)} 
            placeholder="例如: 订单审批流程"
          />
        </div>
        <p style={{ color: '#888' }}>这会将当前的 BPMN 模型发布到 Camunda 引擎中作为一个新的部署包。</p>
      </Modal>

      <style>{`
        .bjs-powered-by {
          display: none;
        }
      `}</style>
    </PageContainer>
  );
};

export default BpmnDesigner;
