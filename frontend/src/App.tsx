import { useState } from 'react'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { WorkerMonitoring } from './components/WorkerMonitoring'
import { InstanceCenter } from './components/InstanceCenter'
import { ModelLibrary } from './components/ModelLibrary'
import { HistoryArchive } from './components/HistoryArchive'
import { AuditLogView } from './components/AuditLogView'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedModelKey, setSelectedModelKey] = useState<string | null>(null)

  const handleNavigateToInstances = (modelKey?: string) => {
    if (modelKey) setSelectedModelKey(modelKey)
    setActiveTab('instances')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigateToModels={() => setActiveTab('models')}
            onNavigateToInstances={handleNavigateToInstances}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        )
      case 'workers':
        return <WorkerMonitoring />
      case 'instances':
        return <InstanceCenter initialModelKey={selectedModelKey} />
      case 'models':
        return <ModelLibrary />
      case 'history':
        return <HistoryArchive />
      case 'audits':
        return <AuditLogView />
      default:
        return (
          <div className="p-8 bg-white rounded-xl border border-slate-200 text-center">
            <h2 className="text-xl font-bold mb-2 capitalize">{activeTab}</h2>
            <p className="text-slate-500">模块正在开发中...</p>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              返回概览
            </button>
          </div>
        )
    }
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  )
}

export default App
