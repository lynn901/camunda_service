import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, MonitorPlay, Moon, Settings, Sun } from 'lucide-react';
import './Layout.css';
import { Button } from './Button';
import { useTheme } from '../context/ThemeContext';

export function Layout() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <>
      <header className="topnav">
        <div className="topnav-content">
          <div className="topnav-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Activity size={24} color="var(--brand-cta)" />
            <span>Camunda Hub</span>
          </div>

          <nav className="topnav-nav">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Deployments
            </NavLink>
            <NavLink to="/monitor" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Monitor
            </NavLink>
            <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Tasklist
            </NavLink>
          </nav>

          <div className="topnav-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Button variant="primary" onClick={() => navigate('/deploy')}>
              Deploy Process
            </Button>
          </div>
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>
    </>
  );
}
