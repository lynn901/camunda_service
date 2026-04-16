import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { CheckCircle, Clock, Activity } from 'lucide-react';
import { authFetch } from '../utils';

interface Task {
  id: string;
  name: string;
  assignee: string | null;
  created: string;
  processInstanceId: string;
  type?: string;
  isExternal?: boolean;
}

export default function Tasklist() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, completed: 0 });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // 1. Fetch User Tasks (Standard)
      const userTasksRes = await authFetch('/engine-rest/task');
      const userTasks = await userTasksRes.json();
      
      // 2. Fetch Active External Tasks (Technically waiting for workers)
      const extTasksRes = await authFetch('/engine-rest/external-task?active=true');
      const extTasks = await extTasksRes.json();

      // 3. Map them to a unified format
      const unifiedTasks = [
        ...userTasks.map((t: any) => ({
          id: t.id,
          name: t.name,
          type: 'User Task',
          assignee: t.assignee,
          created: t.created,
          processInstanceId: t.processInstanceId,
          isExternal: false
        })),
        ...extTasks.map((t: any) => ({
          id: t.id,
          name: `External: ${t.topicName}`,
          type: 'External Task',
          assignee: 'Worker Pool',
          created: new Date().toISOString(), // External tasks don't always have a simple created field in this API
          processInstanceId: t.processInstanceId,
          isExternal: true
        }))
      ];

      setTasks(unifiedTasks);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const pendingRes = await authFetch('/engine-rest/task/count');
      const pendingData = await pendingRes.json();
      
      const extPendingRes = await authFetch('/engine-rest/external-task/count');
      const extPendingData = await extPendingRes.json();
      
      // Update: Count finished process instances (executions of the whole workflow) 
      // instead of individual activities/tasks.
      const completedRes = await authFetch('/engine-rest/history/process-instance/count?finished=true');
      const completedData = await completedRes.json();
      
      setStats({
        pending: (pendingData.count || 0) + (extPendingData.count || 0),
        completed: completedData.count || 0
      });
    } catch (e) {
      console.error('Error fetching stats', e);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const handleComplete = async (taskId: string) => {
    try {
      const res = await authFetch(`/engine-rest/task/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: {} }) // Default empty completion
      });
      if (res.ok) {
        // Refresh tasks and stats
        fetchTasks();
        fetchStats();
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
        <Button variant="outline" onClick={() => { fetchTasks(); fetchStats(); }}>Refresh</Button>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        <Card variant="feature" style={{ flex: 1, padding: '24px' }}>
          <div className="flex items-center gap-4">
            <div style={{ padding: '16px', backgroundColor: 'rgba(0, 82, 239, 0.1)', borderRadius: 'var(--radius-pill)', color: 'var(--brand-hover)' }}>
              <Activity size={24} />
            </div>
            <div>
              <div className="mono-label">Pending Tasks</div>
              <h2 className="mono" style={{ margin: 0, marginTop: '4px' }}>{stats.pending}</h2>
            </div>
          </div>
        </Card>

        <Card variant="feature" style={{ flex: 1, padding: '24px' }}>
          <div className="flex items-center gap-4">
            <div style={{ padding: '16px', backgroundColor: 'rgba(0, 201, 153, 0.1)', borderRadius: 'var(--radius-pill)', color: 'var(--accent-green)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="mono-label" style={{ color: 'var(--accent-green)' }}>Completed Total</div>
              <h2 className="mono" style={{ margin: 0, marginTop: '4px' }}>{stats.completed}</h2>
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <p className="text-tertiary mono">Loading tasks...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {tasks.map(task => (
            <Card key={`${task.id}-${task.isExternal}`}>
              <div className="flex justify-between mb-4">
                <Badge variant="subtle">{task.type || 'Task'}</Badge>
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
                PID: <span className="mono">{task.processInstanceId}</span>
              </p>
              
              <div className="flex gap-4">
                <Button 
                  variant="primary" 
                  onClick={() => !task.isExternal && handleComplete(task.id)} 
                  disabled={task.isExternal}
                  style={{ width: '100%', opacity: task.isExternal ? 0.6 : 1 }}
                >
                  <CheckCircle size={16} style={{ marginRight: '8px' }} />
                  {task.isExternal ? 'Waiting for Worker' : 'Complete'}
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
