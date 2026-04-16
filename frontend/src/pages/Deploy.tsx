import React, { useState, useEffect } from 'react';

import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { UploadCloud } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';


export default function Deploy() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [file, setFile] = useState<File | null>(null);
  const [deploymentName, setDeploymentName] = useState(location.state?.defaultName || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);


  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('deployment-name', deploymentName || file.name);
    formData.append('enable-duplicate-filtering', 'true');
    formData.append('deploy-changed-only', 'true');
    formData.append('data', file, file.name);

    try {
      const res = await fetch('/engine-rest/deployment/create', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, data });
      } else {
        setResult({ success: false, data });
      }
    } catch (err: any) {
      setResult({ success: false, data: { message: err.message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section">
      <div className="mb-8">
        <h2>Deploy Process</h2>
        <p className="text-secondary">Upload a BPMN 2.0 XML file to deploy to the Camunda Engine.</p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <Card>
          <form onSubmit={handleDeploy} className="flex-col gap-6" style={{ display: 'flex' }}>
            <div>
              <label className="mono-label" style={{ display: 'block', marginBottom: '8px' }}>
                BPMN File Parameter
              </label>
              <Input 
                type="file" 
                accept=".bpmn,.xml" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            
            <div>
              <label className="mono-label" style={{ display: 'block', marginBottom: '8px' }}>
                Deployment Name (Optional)
              </label>
              <Input 
                type="text" 
                placeholder="e.g. Order Process V2" 
                value={deploymentName}
                onChange={(e) => setDeploymentName(e.target.value)}
              />
            </div>

            <Button variant="primary" type="submit" disabled={!file || loading}>
              <UploadCloud size={18} style={{ marginRight: '8px' }} />
              {loading ? 'Deploying...' : 'Deploy to Engine'}
            </Button>
          </form>

          {result && (
            <div className={`mt-6 p-4`} style={{ border: `1px solid ${result.success ? 'var(--accent-green)' : 'var(--accent-red)'}`, borderRadius: 'var(--radius-sm)'}}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={result.success ? "success" : "error"}>
                  {result.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
              <pre className="mono text-tertiary" style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
