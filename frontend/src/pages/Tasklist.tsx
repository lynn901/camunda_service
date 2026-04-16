import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { CheckCircle, Clock } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  assignee: string | null;
  created: string;
  processDefinitionId: string;
  processInstanceId: string;
}

export default function Tasklist() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = () => {
    setLoading(true);
    fetch('/engine-rest/task')
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (taskId: string) => {
    try {
      const res = await fetch(`/engine-rest/task/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: {} }) // Default empty completion
      });
      if (res.ok) {
        // Refresh tasks
        fetchTasks();
      } else {
        const err = await res.json();
        alert(`Failed to complete task: ${err.message}`);
      }
    } catch (e) {
      alert('Network error');
    }
  };

  return (
    <div className="container section">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2>Tasklist</h2>
          <p className="text-secondary">Manage and complete human tasks waiting for approval.</p>
        </div>
        <Button variant="outline" onClick={fetchTasks}>Refresh</Button>
      </div>

      {loading ? (
        <p className="text-tertiary">Loading tasks...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {tasks.map(task => (
            <Card key={task.id}>
              <div className="flex justify-between mb-4">
                <Badge variant="subtle">Task</Badge>
                {task.assignee ? (
                  <div className="mono-label" style={{ color: 'var(--brand-cta)' }}>@{task.assignee}</div>
                ) : (
                  <div className="mono-label">Unassigned</div>
                )}
              </div>
              <h4 className="mb-2">{task.name || 'Unnamed Task'}</h4>
              <p className="text-tertiary mono mb-2" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {new Date(task.created).toLocaleString()}
              </p>
              <p className="text-tertiary mono mb-6" style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                PID: {task.processInstanceId}
              </p>
              
              <div className="flex gap-4">
                <Button variant="primary" onClick={() => handleComplete(task.id)} style={{ width: '100%' }}>
                  <CheckCircle size={16} style={{ marginRight: '8px' }} />
                  Complete
                </Button>
              </div>
            </Card>
          ))}
          {tasks.length === 0 && (
            <p className="text-tertiary">No pending tasks found. All caught up!</p>
          )}
        </div>
      )}
    </div>
  );
}
