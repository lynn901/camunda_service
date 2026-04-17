import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, ListTodo, GitFork, Settings } from 'lucide-react';

const Dashboard = () => (
  <div style={{ padding: 'var(--space-4)' }}>
    <h1 style={{ fontSize: '38px', marginBottom: 'var(--space-4)' }}>Engine Overview</h1>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-3)' }}>
      <div className="card" style={{ background: 'var(--bg-surface)', padding: 'var(--space-3)', borderRadius: '6px', border: '1px solid var(--border-visible)' }}>
        <h3 style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Process Instances</h3>
        <p style={{ fontSize: '32px' }}>24</p>
      </div>
      <div className="card" style={{ background: 'var(--bg-surface)', padding: 'var(--space-3)', borderRadius: '6px', border: '1px solid var(--border-visible)' }}>
        <h3 style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Active Tasks</h3>
        <p style={{ fontSize: '32px' }}>12</p>
      </div>
      <div className="card" style={{ background: 'var(--bg-surface)', padding: 'var(--space-3)', borderRadius: '6px', border: '1px solid var(--border-visible)' }}>
        <h3 style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Incidents</h3>
        <p style={{ fontSize: '32px', color: 'var(--color-red)' }}>0</p>
      </div>
    </div>
  </div>
);

const Tasks = () => (
  <div style={{ padding: 'var(--space-4)' }}>
    <h1 style={{ fontSize: '38px', marginBottom: 'var(--space-4)' }}>Pending Tasks</h1>
    <div style={{ background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-visible)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-visible)', textAlign: 'left' }}>
            <th style={{ padding: 'var(--space-2)', color: 'var(--text-secondary)', fontWeight: '400', fontSize: '13px' }}>ID</th>
            <th style={{ padding: 'var(--space-2)', color: 'var(--text-secondary)', fontWeight: '400', fontSize: '13px' }}>NAME</th>
            <th style={{ padding: 'var(--space-2)', color: 'var(--text-secondary)', fontWeight: '400', fontSize: '13px' }}>ASSIGNEE</th>
            <th style={{ padding: 'var(--space-2)', color: 'var(--text-secondary)', fontWeight: '400', fontSize: '13px' }}>CREATED</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={4} style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-tertiary)' }}>No pending tasks found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-canvas)' }}>
        {/* Sidebar */}
        <nav style={{ 
          width: '240px', 
          borderRight: '1px solid var(--border-visible)', 
          padding: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)'
        }}>
          <div style={{ marginBottom: 'var(--space-4)', padding: '0 var(--space-2)' }}>
            <span style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-primary)' }}>Camunda Hub</span>
          </div>
          
          <Link to="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-2)', 
            padding: 'var(--space-2)',
            borderRadius: '4px',
            color: 'var(--text-secondary)'
          }} className="nav-link">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          
          <Link to="/tasks" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-2)', 
            padding: 'var(--space-2)',
            borderRadius: '4px',
            color: 'var(--text-secondary)'
          }} className="nav-link">
            <ListTodo size={18} />
            <span>Tasks</span>
          </Link>

          <Link to="/processes" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-2)', 
            padding: 'var(--space-2)',
            borderRadius: '4px',
            color: 'var(--text-secondary)'
          }} className="nav-link">
            <GitFork size={18} />
            <span>Processes</span>
          </Link>

          <div style={{ marginTop: 'auto' }}>
            <Link to="/settings" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-2)', 
              padding: 'var(--space-2)',
              borderRadius: '4px',
              color: 'var(--text-secondary)'
            }} className="nav-link">
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/processes" element={<div style={{ padding: 'var(--space-4)' }}><h1>Processes</h1></div>} />
            <Route path="/settings" element={<div style={{ padding: 'var(--space-4)' }}><h1>Settings</h1></div>} />
          </Routes>
        </main>
      </div>

      <style>{`
        .nav-link:hover {
          background: var(--bg-surface);
          color: var(--text-primary) !important;
        }
      `}</style>
    </Router>
  );
}

export default App;
