import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { AlertCircle, Activity } from 'lucide-react';
// @ts-ignore
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

interface ProcessDefinition {
  id: string;
  key: string;
  name: string | null;
  version: number;
}

export default function Monitor() {
  const [definitions, setDefinitions] = useState<ProcessDefinition[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [stats, setStats] = useState<{ active: number, incidents: number }>({ active: 0, incidents: 0 });
  const [loadingXml, setLoadingXml] = useState(false);
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const bpmnViewerInstance = useRef<any>(null);

  useEffect(() => {
    fetch('/engine-rest/process-definition?latestVersion=true')
      .then(res => res.json())
      .then(data => {
        setDefinitions(data);
        if (data.length > 0) {
          handleSelectProcess(data[0].id);
        }
      });

    return () => {
      if (bpmnViewerInstance.current) {
        bpmnViewerInstance.current.destroy();
      }
    };
  }, []);

  const handleSelectProcess = async (id: string) => {
    setSelectedProcess(id);
    setLoadingXml(true);

    // Fetch stats
    try {
      const activeRes = await fetch(`/engine-rest/process-instance/count?processDefinitionId=${id}`);
      const activeData = await activeRes.json();
      
      const incidentsRes = await fetch(`/engine-rest/incident/count?processDefinitionId=${id}`);
      const incidentsData = await incidentsRes.json();
      
      setStats({
        active: activeData.count || 0,
        incidents: incidentsData.count || 0
      });
    } catch (e) {
      console.error(e);
    }

    // Fetch XML
    try {
      const xmlRes = await fetch(`/engine-rest/process-definition/${id}/xml`);
      const xmlData = await xmlRes.json();
      const bpmnXml = xmlData.bpmn20Xml;

      if (!bpmnViewerInstance.current) {
        bpmnViewerInstance.current = new BpmnViewer({
          container: viewerRef.current || undefined,
          width: '100%',
          height: '100%'
        });
      }

      await bpmnViewerInstance.current.importXML(bpmnXml);
      bpmnViewerInstance.current.get('canvas').zoom('fit-viewport');
    } catch (e) {
      console.error('Error rendering BPMN', e);
    } finally {
      setLoadingXml(false);
    }
  };

  return (
    <div className="container section">
      <div className="mb-8">
        <h2>Process Monitor</h2>
        <p className="text-secondary">Track process instances and inspect BPMN diagrams dynamically.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
        {/* Sidebar */}
        <div className="flex-col gap-4" style={{ display: 'flex' }}>
          <h4 className="mb-2">Definitions</h4>
          {definitions.map(def => (
            <div 
              key={def.id}
              onClick={() => handleSelectProcess(def.id)}
              style={{
                padding: '16px',
                backgroundColor: selectedProcess === def.id ? 'var(--surface-prominent)' : 'var(--surface-raised)',
                border: `1px solid ${selectedProcess === def.id ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div className="mono-label mb-2">{def.key}</div>
              <div style={{ fontWeight: 500, fontSize: '15px' }}>{def.name || def.key}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-col gap-6" style={{ display: 'flex' }}>
          {/* Stats Bar */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <Card variant="feature" style={{ flex: 1, padding: '24px' }}>
              <div className="flex items-center gap-4">
                <div style={{ padding: '16px', backgroundColor: 'rgba(0, 82, 239, 0.1)', borderRadius: 'var(--radius-pill)', color: 'var(--brand-hover)' }}>
                  <Activity size={24} />
                </div>
                <div>
                  <div className="mono-label">Active Instances</div>
                  <h2 style={{ margin: 0, marginTop: '4px' }}>{stats.active}</h2>
                </div>
              </div>
            </Card>

            <Card variant="feature" style={{ flex: 1, padding: '24px' }}>
              <div className="flex items-center gap-4">
                <div style={{ padding: '16px', backgroundColor: 'rgba(221, 0, 0, 0.1)', borderRadius: 'var(--radius-pill)', color: 'var(--accent-red)' }}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <div className="mono-label" style={{ color: 'var(--accent-red)' }}>Incidents</div>
                  <h2 style={{ margin: 0, marginTop: '4px' }}>{stats.incidents}</h2>
                </div>
              </div>
            </Card>
          </div>

          {/* BPMN Viewer Wrapper */}
          <Card style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Process Diagram</h4>
              {loadingXml && <Badge variant="subtle">Loading...</Badge>}
            </div>
            
            {/* The canvas area for BpmnViewer */}
            <div 
              ref={viewerRef} 
              style={{ flex: 1, width: '100%', backgroundColor: 'var(--bg-canvas)' }}
              className="bjs-container"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
