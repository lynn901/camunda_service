import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Play, Trash2, Edit3 } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils';

interface ProcessDefinition {
  id: string;
  key: string;
  name: string | null;
  version: number;
  deploymentId: string;
}

export default function Deployments() {
  const [definitions, setDefinitions] = useState<ProcessDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    authFetch('/engine-rest/process-definition?latestVersion=true')
      .then(res => res.json())
      .then(data => {
        setDefinitions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDeleteDeployment = async (deploymentId: string) => {
    if (!confirm('Are you sure you want to delete this deployment? This will also delete all associated process instances and history.')) {
      return;
    }

    try {
      const res = await authFetch(`/engine-rest/deployment/${deploymentId}?cascade=true`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDefinitions(prev => prev.filter(def => def.deploymentId !== deploymentId));
      } else {
        alert('Failed to delete deployment');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const handleUpdate = (name: string | null) => {
    navigate('/deploy', { state: { defaultName: name } });
  };

  const handleStartInstance = async (key: string) => {

    try {
      const res = await authFetch(`/engine-rest/process-definition/key/${key}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        alert('Process instance started successfully!');
      } else {
        const error = await res.json();
        alert(`Failed to start: ${error.message}`);
      }
    } catch (e) {
      alert('Network error');
    }
  };

  return (
    <div className="container section">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2>Deployments</h2>
          <p className="text-secondary">View and manage your latest process definitions.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/deploy')}>New Deployment</Button>
      </div>

      {loading ? (
        <p className="text-tertiary">Loading definitions...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {definitions.map(def => (
            <Card key={def.id}>
              <div className="flex justify-between mb-4">
                <Badge variant="subtle">v{def.version}</Badge>
                <div className="mono-label">{def.key}</div>
              </div>
              <h4 className="mb-2">{def.name || def.key}</h4>
              <p className="text-tertiary mono mb-6" style={{ fontSize: '13px', wordBreak: 'break-all' }}>
                ID: {def.id}
              </p>
              
              <div className="flex gap-2 flex-wrap">
                <Button variant="secondary" onClick={() => handleStartInstance(def.key)} style={{ flex: 1 }}>
                  <Play size={16} style={{ marginRight: '8px' }} />
                  Start
                </Button>
                <Button variant="outline" onClick={() => navigate('/monitor')} style={{ flex: 1 }}>
                  Monitor
                </Button>
                <Button variant="ghost" onClick={() => handleUpdate(def.name || def.key)} title="Update/Redeploy">
                  <Edit3 size={16} />
                </Button>
                <Button variant="ghost" onClick={() => handleDeleteDeployment(def.deploymentId)} style={{ color: 'var(--accent-red)' }} title="Delete Deployment">
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
          {definitions.length === 0 && (
            <p className="text-tertiary">No deployments found. Try deploying a process.</p>
          )}
        </div>
      )}
    </div>
  );
}
