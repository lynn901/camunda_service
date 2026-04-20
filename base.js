import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  GitBranch, 
  Activity, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Search,
  ChevronRight,
  AlertCircle,
  Terminal,
  Server,
  Database,
  Network,
  RefreshCw,
  FastForward,
  PauseCircle,
  StopCircle,
  Cpu,
  Filter,
  ShieldAlert,
  UploadCloud,
  Trash2,
  Edit,
  PlayCircle,
  X,
  Code,
  Radio,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  Power,
  CalendarClock,
  History,
  Play,
  Pause,
  FileJson,
  Archive
} from 'lucide-react';

// --- Mock Data ---
const INITIAL_MODELS = [
  { id: 'mdl_01', key: 'cloud_pc_roaming', name: '云电脑跨区漫游 (V2)', category: '资源调度', version: 'v2.1', deployedAt: '2023-11-01 14:20', active: 142, failed: 3, successRate: '98.5%', icon: Cpu, expectedParams: '{\n  "sourceRegion": "cn-beijing",\n  "targetRegion": "cn-shanghai",\n  "bandwidthLimit": "50Mbps"\n}' },
  { id: 'mdl_02', key: 'cluster_scale_out', name: 'K8s 集群弹性扩容', category: '基础设施', version: 'v1.4', deployedAt: '2023-10-15 09:00', active: 15, failed: 0, successRate: '100%', icon: Server, expectedParams: '{\n  "clusterId": "k8s-prod-01",\n  "nodeCount": 3,\n  "instanceType": "c6.2xlarge"\n}' },
  { id: 'mdl_03', key: 'db_auto_backup', name: '全网数据库巡检与快照', category: '数据保护', version: 'v3.0', deployedAt: '2023-11-05 22:00', active: 8, failed: 2, successRate: '85.2%', icon: Database, expectedParams: '{\n  "targetClusters": ["rds-01", "rds-02"],\n  "retentionDays": 7\n}' },
  { id: 'mdl_04', key: 'vpc_peering_setup', name: 'VPC 跨域对等连接', category: '网络配置', version: 'v1.0', deployedAt: '2023-09-20 11:30', active: 4, failed: 1, successRate: '92.0%', icon: Network, expectedParams: '{\n  "requesterVpc": "vpc-bj-01",\n  "accepterVpc": "vpc-sh-02"\n}' },
];

const MOCK_INSTANCES = [
  { 
    id: 'INS-ROAM-8821', 
    modelKey: 'cloud_pc_roaming', 
    modelName: '云电脑跨区漫游 (V2)', 
    businessKey: 'USER-OP-001', 
    state: 'Failed', 
    startTime: '2023-11-08 10:20:00', 
    currentNode: '跨域镜像同步',
    progress: 65,
    variables: { sourceRegion: 'cn-beijing', targetRegion: 'cn-shanghai', bandwidthLimit: '50Mbps', autoStart: 'true' },
    steps: [
      { id: 1, name: '源端会话注销', type: 'ServiceTask', status: 'Completed', detail: '调用成功 (耗时 2s)', time: '10:20:02' },
      { id: 2, name: '增量数据快照', type: 'ServiceTask', status: 'Completed', detail: '快照 ID: snap-8821 (耗时 45s)', time: '10:20:47' },
      { id: 3, name: '跨域镜像同步', type: 'ServiceTask', status: 'Failed', detail: '传输中断', time: '10:25:12', errorLog: '[ERROR] 2023-11-08 10:25:12\norg.camunda.bpm.engine.ScriptEvaluationException: Unable to evaluate script\nCaused by: java.net.SocketTimeoutException: Read timed out at OpenStackGlanceClient.transfer(OpenStackGlanceClient.java:142)\nTarget: cn-shanghai-zone-b endpoint unresponsive.' },
      { id: 4, name: '目标端资源挂载', type: 'ServiceTask', status: 'Pending', detail: '-', time: '-' }
    ]
  },
  { 
    id: 'INS-DB-9011', 
    modelKey: 'db_auto_backup', 
    modelName: '全网数据库巡检与快照', 
    businessKey: 'RDS-PROD-CLUSTER', 
    state: 'Failed', 
    startTime: '2023-11-08 09:00:00', 
    currentNode: '执行存储快照',
    progress: 40,
    variables: { clusterId: 'rds-prod-01', retentionDays: '7', notifyEmail: 'dba@cloud.com' },
    steps: [
      { id: 1, name: '前置容量检查', type: 'ServiceTask', status: 'Completed', detail: '剩余容量满足快照要求', time: '09:00:05' },
      { id: 2, name: '执行存储快照', type: 'ServiceTask', status: 'Failed', detail: 'API 拒绝访问', time: '09:15:02', errorLog: 'HTTP 403 Forbidden: {"error": "Insufficient privileges to perform snapshot on rds-prod-01. Missing role: StorageAdmin"}' },
      { id: 3, name: '快照完整性校验', type: 'ServiceTask', status: 'Pending', detail: '-', time: '-' }
    ]
  },
  { 
    id: 'INS-ROAM-8822', 
    modelKey: 'cloud_pc_roaming', 
    modelName: '云电脑跨区漫游 (V2)', 
    businessKey: 'USER-OP-002', 
    state: 'Running', 
    startTime: '2023-11-08 11:00:00', 
    currentNode: '目标端资源挂载',
    progress: 80,
    variables: { sourceRegion: 'cn-guangzhou', targetRegion: 'cn-beijing', bandwidthLimit: '100Mbps', autoStart: 'true' },
    steps: [
      { id: 1, name: '源端会话注销', type: 'ServiceTask', status: 'Completed', detail: '调用成功 (耗时 1s)', time: '11:00:01' },
      { id: 2, name: '增量数据快照', type: 'ServiceTask', status: 'Completed', detail: '快照 ID: snap-8822 (耗时 30s)', time: '11:00:31' },
      { id: 3, name: '跨域镜像同步', type: 'ServiceTask', status: 'Completed', detail: '传输完成 (耗时 4m)', time: '11:04:31' },
      { id: 4, name: '目标端资源挂载', type: 'ServiceTask', status: 'Running', detail: '正在调用 Cinder API 挂载卷...', time: '11:04:35' }
    ]
  }
];

const MOCK_WORKERS = [
  { id: 'wrk-python-ops-01', host: '10.0.5.11 (k8s-node-1)', client: 'Python 3.9 SDK', topics: ['cloud_pc_roaming', 'image_sync'], status: 'Online', lastSeen: '2s ago', tasksLocked: 12, processed: 15420, errorRate: '0.1%' },
  { id: 'wrk-java-core-02', host: '10.0.5.22 (k8s-node-2)', client: 'Spring Boot 2.7', topics: ['cluster_scale_out', 'db_auto_backup'], status: 'HighLoad', lastSeen: '1s ago', tasksLocked: 85, processed: 8905, errorRate: '3.5%' },
  { id: 'wrk-go-net-01', host: '10.0.8.55 (legacy-vm-1)', client: 'Go 1.19 Client', topics: ['vpc_peering_setup'], status: 'Offline', lastSeen: '15m ago', tasksLocked: 3, processed: 340, errorRate: '0.0%' },
];

const MOCK_SCHEDULES = [
  { id: 'sch-001', name: '全局数据库每日快照', modelKey: 'db_auto_backup', cron: '0 0 2 * * ?', nextRun: '2023-11-09 02:00:00', status: 'Active', creator: 'SysAdmin', lastStatus: 'Success' },
  { id: 'sch-002', name: '周末闲置桌面回收', modelKey: 'cloud_pc_roaming', cron: '0 0 1 ? * SUN', nextRun: '2023-11-12 01:00:00', status: 'Paused', creator: 'Ops-Auto', lastStatus: 'N/A' },
  { id: 'sch-003', name: '测试区 K8s 缩容下班', modelKey: 'cluster_scale_out', cron: '0 30 19 * * MON-FRI', nextRun: '2023-11-08 19:30:00', status: 'Active', creator: 'Dev-Lead', lastStatus: 'Failed' },
];

const MOCK_AUDIT_LOGS = [
  { id: 'log-9001', timestamp: '2023-11-08 10:45:12', operator: 'admin@sys', action: 'RETRY_INSTANCE', target: 'INS-ROAM-8821', status: 'Success', detail: 'User triggered origin retry on failed step.' },
  { id: 'log-9002', timestamp: '2023-11-08 10:44:50', operator: 'admin@sys', action: 'UPDATE_VARIABLE', target: 'INS-ROAM-8821', status: 'Success', detail: 'Updated variable "bandwidthLimit" from "50Mbps" to "100Mbps".' },
  { id: 'log-9003', timestamp: '2023-11-08 09:30:10', operator: 'api-trigger', action: 'START_INSTANCE', target: 'INS-DB-9011', status: 'Success', detail: 'Launched instance via REST API.' },
  { id: 'log-9004', timestamp: '2023-11-07 22:15:00', operator: 'admin@sys', action: 'UNLOCK_WORKER', target: 'wrk-go-net-01', status: 'Warning', detail: 'Forcefully unlocked 3 dead tasks from offline worker.' },
];

const MOCK_HISTORY = [
  { 
    id: 'HIS-ROAM-8700', 
    modelKey: 'cloud_pc_roaming', 
    modelName: '云电脑跨区漫游 (V2)', 
    businessKey: 'USER-OP-OLD-1', 
    state: 'Completed', 
    startTime: '2023-11-07 08:20:00', 
    endTime: '2023-11-07 08:25:12',
    duration: '5m 12s',
    variables: { sourceRegion: 'cn-beijing', targetRegion: 'cn-shanghai', bandwidthLimit: '50Mbps', autoStart: 'true' },
    steps: [
      { id: 1, name: '源端会话注销', type: 'ServiceTask', status: 'Completed', detail: '调用成功 (耗时 2s)', time: '08:20:02' },
      { id: 2, name: '增量数据快照', type: 'ServiceTask', status: 'Completed', detail: '快照 ID: snap-8700 (耗时 45s)', time: '08:20:47' },
      { id: 3, name: '跨域镜像同步', type: 'ServiceTask', status: 'Completed', detail: '传输完成', time: '08:24:12' },
      { id: 4, name: '目标端资源挂载', type: 'ServiceTask', status: 'Completed', detail: '挂载成功', time: '08:25:12' }
    ]
  },
  { 
    id: 'HIS-DB-8900', 
    modelKey: 'db_auto_backup', 
    modelName: '全网数据库巡检与快照', 
    businessKey: 'RDS-TEST-CLUSTER', 
    state: 'Terminated', 
    startTime: '2023-11-07 09:00:00', 
    endTime: '2023-11-07 09:02:15',
    duration: '2m 15s',
    variables: { clusterId: 'rds-test-01', retentionDays: '7' },
    steps: [
      { id: 1, name: '前置容量检查', type: 'ServiceTask', status: 'Completed', detail: '剩余容量满足快照要求', time: '09:00:05' },
      { id: 2, name: '执行存储快照', type: 'ServiceTask', status: 'Failed', detail: 'API 拒绝访问', time: '09:01:02', errorLog: 'HTTP 403 Forbidden' }
    ]
  }
];

const SidebarItem = ({ icon: Icon, label, active, onClick, alertCount }) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
      active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className="flex items-center space-x-3">
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {alertCount > 0 && (
      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        {alertCount}
      </span>
    )}
  </div>
);

const App = () => {
  const [models, setModels] = useState(INITIAL_MODELS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [activeModelFilter, setActiveModelFilter] = useState('All');

  // Dashboard State
  const [dashboardTimeRange, setDashboardTimeRange] = useState('24h');

  // History State
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [triggerModel, setTriggerModel] = useState(null);
  const [triggerParams, setTriggerParams] = useState('');
  const [triggerBizKey, setTriggerBizKey] = useState('');
  const [editingModel, setEditingModel] = useState(null);
  
  // 新增: 用于控制删除确认弹窗的状态
  const [modelToDelete, setModelToDelete] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  // Scheduled Tasks State
  const [schedules, setSchedules] = useState(MOCK_SCHEDULES);

  const openTriggerModal = (model) => {
    setTriggerModel(model);
    setTriggerParams(model.expectedParams || '{\n  \n}');
    setTriggerBizKey(`MANUAL-OP-${Math.floor(Math.random() * 10000)}`);
  };

  const handleTriggerExecute = () => {
    alert(`触发执行成功！\n模型: ${triggerModel.name}\nBusiness Key: ${triggerBizKey}`);
    setTriggerModel(null);
    setActiveTab('instances'); 
  };

  // 调整: 点击垃圾桶时不再调用 window.confirm，而是唤起自定义弹窗
  const handleDeleteClick = (model) => {
    setModelToDelete(model);
  };

  // 新增: 在自定义弹窗中点击"确认"后真正执行删除操作
  const confirmDeleteModel = () => {
    if (!modelToDelete) return;
    setModels(models.filter(m => m.id !== modelToDelete.id));
    if (activeModelFilter === modelToDelete.id) setActiveModelFilter('All');
    setModelToDelete(null);
  };

  const handleDeleteScheduleClick = (schedule) => {
    setScheduleToDelete(schedule);
  };

  const confirmDeleteSchedule = () => {
    if (!scheduleToDelete) return;
    setSchedules(schedules.filter(s => s.id !== scheduleToDelete.id));
    setScheduleToDelete(null);
  };

  const handleUpdateModel = () => {
    setModels(models.map(m => m.id === editingModel.id ? editingModel : m));
    setEditingModel(null);
  };

  const toggleScheduleStatus = (id) => {
    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s
    ));
  };

  // --- Render Functions ---
  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">整体概览</h2>
          <p className="text-sm text-slate-500">平台所有自动化工作流的运行健康度</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <CalendarClock size={14} className="text-slate-400 ml-2 mr-1" />
            <select 
              className="w-full text-xs bg-transparent focus:outline-none py-1 pr-2 text-slate-700 font-medium cursor-pointer"
              value={dashboardTimeRange}
              onChange={(e) => setDashboardTimeRange(e.target.value)}
            >
              <option value="1h">最近 1 小时</option>
              <option value="24h">最近 24 小时</option>
              <option value="7d">最近 7 天</option>
              <option value="30d">最近 30 天</option>
            </select>
          </div>
          <div className="text-sm font-medium text-slate-500 flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <Activity size={16} className="text-emerald-500 mr-2" />
            引擎状态: <span className="text-emerald-600 ml-1 font-bold">健康</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">活跃实例总数</p>
          <div className="flex items-end justify-between"><h3 className="text-3xl font-black text-slate-800">169</h3><Activity size={24} className="text-indigo-200" /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">完成实例总数</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-800">
              {dashboardTimeRange === '1h' ? '128' : dashboardTimeRange === '24h' ? '1,402' : dashboardTimeRange === '7d' ? '9,845' : '38,201'}
            </h3>
            <CheckCircle size={24} className="text-emerald-200" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">挂起/节点失败</p>
          <div className="flex items-end justify-between"><h3 className="text-3xl font-black text-rose-600">6</h3><ShieldAlert size={24} className="text-rose-200" /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-purple-500 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setActiveTab('schedules')}>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">活跃定时任务</p>
          <div className="flex items-end justify-between"><h3 className="text-3xl font-black text-purple-600">2</h3><CalendarClock size={24} className="text-purple-200" /></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
          <h3 className="font-bold text-slate-800">工作流模型矩阵</h3>
          <button className="text-xs text-indigo-600 font-medium hover:underline" onClick={() => setActiveTab('models')}>管理所有模型</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {models.map(model => (
            <div key={model.id} className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => { setActiveModelFilter(model.key); setActiveTab('instances'); }}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${model.failed > 0 ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    <model.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm truncate w-32" title={model.name}>{model.name}</h4>
                    <p className="text-xs text-slate-500">{model.category}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); openTriggerModal(model); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-indigo-600 hover:bg-indigo-100 rounded transition-all"
                  title="手动触发实例"
                >
                  <PlayCircle size={18} />
                </button>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">运行中实例:</span>
                  <span className="font-mono font-medium">{model.active}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">异常/失败:</span>
                  <span className={`font-mono font-bold ${model.failed > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{model.failed}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className={`h-full ${model.failed > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: model.successRate }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-rose-500 flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center">
              <ShieldAlert size={16} className="mr-2 text-rose-500" />
              异常实例告警
            </h3>
            <button className="text-xs text-indigo-600 font-medium hover:underline" onClick={() => { setActiveModelFilter('All'); setActiveTab('instances'); }}>前往干预中心</button>
          </div>
          <div className="p-0 flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {MOCK_INSTANCES.filter(i => i.state === 'Failed').slice(0, 4).map(inst => (
                <div key={inst.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-xs font-bold text-rose-600">{inst.id}</span>
                      <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">故障拦截</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium truncate w-64" title={inst.modelName}>{inst.modelName}</p>
                    <p className="text-[10px] text-slate-400 mt-1">停滞节点: <span className="font-medium text-slate-500">{inst.currentNode}</span></p>
                  </div>
                  <button 
                    onClick={() => { setSelectedInstance(inst); setActiveTab('instances'); }}
                    className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 rounded-lg transition-colors flex flex-col items-center shadow-sm"
                    title="立即诊断"
                  >
                    <Activity size={16} />
                    <span className="text-[8px] mt-0.5 font-bold">去抢救</span>
                  </button>
                </div>
              ))}
              {MOCK_INSTANCES.filter(i => i.state === 'Failed').length === 0 && (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <CheckCircle size={32} className="text-emerald-400 opacity-50 mb-2" />
                  <p className="text-slate-500 text-sm font-medium">当前无运行异常实例</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
            <h3 className="font-bold text-slate-800 flex items-center">
              <History size={16} className="mr-2 text-indigo-500" />
              最近干预与操作
            </h3>
            <button className="text-xs text-indigo-600 font-medium hover:underline" onClick={() => setActiveTab('audits')}>查看完整审计日志</button>
          </div>
          <div className="p-0 flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-100">
                {MOCK_AUDIT_LOGS.slice(0, 4).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold mr-3 text-slate-600 shrink-0">
                          {log.operator.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center">
                            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border bg-indigo-50 text-indigo-700 border-indigo-200 mr-2">
                              {log.action}
                            </span>
                            <span className="text-xs text-slate-600 truncate">{log.detail}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center">
                            <Terminal size={10} className="mr-1" /> {log.target}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right shrink-0 min-w-[100px]">
                      <p className="text-[10px] text-slate-500">{log.timestamp.split(' ')[1]}</p>
                      <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded border font-medium ${
                        log.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>{log.status === 'Success' ? '执行成功' : '警告'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModels = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">BPMN 模型库</h2>
          <p className="text-sm text-slate-500">管理、部署与触发自动化工作流定义文件</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <UploadCloud size={16} className="mr-2" />
            部署新模型
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-bold">模型名称 / 标识</th>
              <th className="px-6 py-4 font-bold">分类</th>
              <th className="px-6 py-4 font-bold">版本</th>
              <th className="px-6 py-4 font-bold">最新部署时间</th>
              <th className="px-6 py-4 font-bold text-right">运维操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {models.map(model => (
              <tr key={model.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded">
                      <model.icon size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{model.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{model.key}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                    {model.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {model.version}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                  {model.deployedAt}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => openTriggerModal(model)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors tooltip-trigger" 
                    title="手动触发实例"
                  >
                    <PlayCircle size={18} />
                  </button>
                  <button 
                    onClick={() => setEditingModel({ ...model })}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" 
                    title="编辑模型"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(model)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" 
                    title="删除/停用"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSchedules = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <CalendarClock size={24} className="mr-2 text-purple-600" />
            定时调度引擎
          </h2>
          <p className="text-sm text-slate-500 mt-1">基于 Cron 表达式自动周期性触发工作流实例</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm">
          <UploadCloud size={16} className="mr-2" />
          创建新定时任务
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-bold">任务名称</th>
              <th className="px-6 py-4 font-bold">绑定的模型标识</th>
              <th className="px-6 py-4 font-bold">Cron 表达式</th>
              <th className="px-6 py-4 font-bold">预计下次执行</th>
              <th className="px-6 py-4 font-bold text-center">状态</th>
              <th className="px-6 py-4 font-bold text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedules.map(sch => (
              <tr key={sch.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800 text-sm">{sch.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">创建人: {sch.creator}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                    {sch.modelKey}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                    {sch.cron}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                  {sch.nextRun}
                  {sch.lastStatus === 'Failed' && <span className="ml-2 text-rose-500 text-[10px] font-bold bg-rose-50 px-1 py-0.5 rounded border border-rose-100">上次失败</span>}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => toggleScheduleStatus(sch.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                      sch.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {sch.status === 'Active' ? '已启用' : '已暂停'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors tooltip-trigger" title="立即手动执行一次">
                    <Play size={16} />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="编辑配置">
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteScheduleClick(sch)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" 
                    title="删除定时任务"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWorkers = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Radio size={24} className="mr-2 text-indigo-600" /> 
            外部工作节点
          </h2>
          <p className="text-sm text-slate-500 mt-1">监控长轮询工作节点的存活状态、订阅队列与任务锁获取情况</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCw size={16} className="mr-2" />
            刷新状态
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">活跃节点</p>
            <h3 className="text-2xl font-black text-emerald-600">2</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg"><Wifi size={24} className="text-emerald-500" /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">离线掉线</p>
            <h3 className="text-2xl font-black text-rose-600">1</h3>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg"><WifiOff size={24} className="text-rose-500" /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">当前锁定任务</p>
            <h3 className="text-2xl font-black text-amber-600">100</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg"><Lock size={24} className="text-amber-500" /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between border-r-4 border-r-indigo-500">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">今日处理量</p>
            <h3 className="text-2xl font-black text-slate-800">24.6K</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg"><Server size={24} className="text-indigo-500" /></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">节点注册列表</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="搜索节点 ID 或订阅队列..." 
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-bold">节点 ID / 客户端</th>
              <th className="px-6 py-4 font-bold">部署节点 (Host)</th>
              <th className="px-6 py-4 font-bold">订阅队列 (Topics)</th>
              <th className="px-6 py-4 font-bold">运行状态 / 心跳时间</th>
              <th className="px-6 py-4 font-bold text-center">锁定任务</th>
              <th className="px-6 py-4 font-bold text-right">运维操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_WORKERS.map(worker => (
              <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-mono font-bold text-slate-800 text-sm">{worker.id}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Code size={12} className="mr-1" /> {worker.client}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                    {worker.host}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {worker.topics.map(topic => (
                      <span key={topic} className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        {topic}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {worker.status === 'Online' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        worker.status === 'Online' ? 'bg-emerald-500' : 
                        worker.status === 'HighLoad' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></span>
                    </span>
                    <span className={`text-xs font-bold ${
                      worker.status === 'Online' ? 'text-emerald-700' : 
                      worker.status === 'HighLoad' ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {worker.status === 'HighLoad' ? '高负载' : worker.status === 'Offline' ? '节点失联' : '正常运行'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">心跳时间: {worker.lastSeen}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`text-sm font-black font-mono ${worker.tasksLocked > 50 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {worker.tasksLocked}
                    </span>
                    {worker.status === 'Offline' && worker.tasksLocked > 0 && (
                      <span className="text-[9px] text-rose-500 font-bold bg-rose-50 px-1 mt-1 rounded border border-rose-100">死锁告警</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                  {worker.tasksLocked > 0 && (
                    <button className="flex items-center px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors" title="强制释放该节点持有的任务锁，允许其他Worker抢占">
                      <Unlock size={14} className="mr-1" /> 释放锁
                    </button>
                  )}
                  <button className="flex items-center px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors" title="阻止该节点继续拉取新任务">
                    <Power size={14} className="mr-1" /> 隔离挂起
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInstances = () => {
    const filteredInstances = activeModelFilter === 'All' 
      ? MOCK_INSTANCES 
      : MOCK_INSTANCES.filter(i => i.modelKey === activeModelFilter);

    return (
      <div className="h-[calc(100vh-8rem)] flex gap-6 animate-in fade-in">
        <div className="w-[380px] shrink-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 mb-3">干预中心</h3>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
              <Filter size={16} className="text-slate-400 ml-2 mr-1" />
              <select 
                className="w-full text-xs bg-transparent focus:outline-none py-1 text-slate-700 font-medium cursor-pointer"
                value={activeModelFilter}
                onChange={(e) => setActiveModelFilter(e.target.value)}
              >
                <option value="All">查看所有模型实例 ({MOCK_INSTANCES.length})</option>
                {models.map(m => <option key={m.key} value={m.key}>{m.name} ({m.failed > 0 ? `异常 ${m.failed}` : '正常'})</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
            {filteredInstances.map(inst => (
              <div 
                key={inst.id} 
                onClick={() => setSelectedInstance(inst)}
                className={`p-4 rounded-lg cursor-pointer border transition-all ${
                  selectedInstance?.id === inst.id ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-700">{inst.id}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate w-40" title={inst.businessKey}>业务标识: {inst.businessKey}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded flex items-center font-bold ${
                    inst.state === 'Running' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                    inst.state === 'Failed' ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {inst.state === 'Failed' && <ShieldAlert size={10} className="mr-1" />}
                    {inst.state === 'Running' ? '运行中' : inst.state === 'Failed' ? '异常' : '已挂起'}
                  </span>
                </div>
                
                <div className="bg-slate-50 p-2 rounded border border-slate-100 mb-2">
                  <p className="text-xs font-medium text-slate-700 truncate">{inst.modelName}</p>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${inst.state === 'Failed' ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${inst.progress}%` }} />
                </div>
                <div className={`flex items-center text-xs font-medium truncate ${inst.state === 'Failed' ? 'text-rose-600' : 'text-indigo-600'}`}>
                  {inst.state === 'Failed' ? <AlertCircle size={12} className="mr-1 shrink-0" /> : <Activity size={12} className="mr-1 shrink-0" />} 
                  停滞节点: {inst.currentNode}
                </div>
              </div>
            ))}
            {filteredInstances.length === 0 && (
              <div className="text-center p-8 text-slate-400 text-sm">此模型下无活跃实例</div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {selectedInstance ? (
            <>
              <div className="p-5 border-b border-slate-200 bg-slate-800 text-white flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <Terminal size={18} className="text-indigo-400" />
                    <h2 className="text-lg font-bold font-mono tracking-tight">{selectedInstance.id}</h2>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600">{selectedInstance.modelName}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-2">启动时间: {selectedInstance.startTime} | 上下文: {selectedInstance.businessKey}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="flex items-center px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-xs font-medium transition-colors" title="PUT /process-instance/{id}/suspended">
                    <PauseCircle size={14} className="mr-1.5" /> 挂起 (Suspend)
                  </button>
                  <button className="flex items-center px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 rounded text-xs font-medium transition-colors" title="DELETE /process-instance/{id}">
                    <StopCircle size={14} className="mr-1.5" /> 删除 (Delete)
                  </button>
                </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 border-r border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center">
                    <Activity size={16} className="mr-2 text-indigo-500" /> 执行链路
                  </h3>
                  
                  <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                    {selectedInstance.steps.map((step, i) => (
                      <div key={step.id} className="relative pl-8">
                        <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-sm ${
                          step.status === 'Completed' ? 'bg-emerald-500 text-white' :
                          step.status === 'Running' ? 'bg-indigo-500 text-white animate-pulse' :
                          step.status === 'Failed' ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-slate-200 text-slate-400'
                        }`}>
                          {step.status === 'Completed' ? <CheckCircle size={16} /> :
                           step.status === 'Failed' ? <XCircle size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                        </div>
                        
                        <div className={`p-4 rounded-lg border ${step.status === 'Failed' ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'} shadow-sm`}>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className={`font-bold text-sm flex items-center ${step.status === 'Pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                              {step.name}
                              <span className="ml-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                                {step.type}
                              </span>
                            </h4>
                            <span className="text-xs font-mono text-slate-400">{step.time}</span>
                          </div>
                          
                          <p className="text-xs text-slate-600 mt-1">{step.detail}</p>
                          
                          {step.status === 'Failed' && (
                            <div className="mt-4 border-t border-rose-200/60 pt-3">
                              <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-2">异常堆栈信息</p>
                              <div className="bg-slate-900 text-rose-300 p-3 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto border border-slate-700 shadow-inner max-h-40 overflow-y-auto leading-relaxed">
                                {step.errorLog}
                              </div>

                              <div className="flex space-x-2 mt-4">
                                <button className="flex-1 flex justify-center items-center text-xs bg-indigo-600 border border-indigo-700 text-white px-2 py-2 rounded shadow-sm hover:bg-indigo-700 font-medium transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1" title="PUT /external-task/{id}/retries 或 /job/{id}/retries">
                                  <RefreshCw size={14} className="mr-1.5" /> 重置重试 (Set Retries)
                                </button>
                                <button className="flex-1 flex justify-center items-center text-xs bg-amber-500 border border-amber-600 text-white px-2 py-2 rounded shadow-sm hover:bg-amber-600 font-medium transition-all" title="DELETE /incident/{id}">
                                  <ShieldAlert size={14} className="mr-1.5" /> 清除故障 (Clear Incident)
                                </button>
                                <button className="flex-1 flex justify-center items-center text-xs bg-white border border-slate-300 text-slate-700 px-2 py-2 rounded shadow-sm hover:bg-slate-50 font-medium transition-all" title="POST /process-instance/{id}/modification">
                                  <FastForward size={14} className="mr-1.5" /> 节点跳转 (Modification)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-72 bg-white flex flex-col shrink-0">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                      <Settings size={14} className="mr-1" /> 上下文变量
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">流程运行时变量，排障时支持热修改</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {Object.entries(selectedInstance.variables).map(([k, v]) => (
                      <div key={k} className="group">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">{k}</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            defaultValue={typeof v === 'object' ? JSON.stringify(v) : String(v)} 
                            className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all outline-none"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-slate-100">
                      <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded border border-slate-200 transition-colors">
                        + 注入新变量
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <Terminal size={64} className="mb-4 opacity-10" />
              <p className="font-medium text-slate-500">选择左侧异常实例进入 Camunda 7 诊断控制台</p>
              <p className="text-xs mt-2 opacity-60">支持 Incident 管理、流程修改 (Modification) 与变量热更新</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    const filteredHistory = activeModelFilter === 'All' 
      ? MOCK_HISTORY 
      : MOCK_HISTORY.filter(i => i.modelKey === activeModelFilter);

    return (
      <div className="h-[calc(100vh-8rem)] flex gap-6 animate-in fade-in">
        <div className="w-[380px] shrink-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 mb-3">执行历史归档</h3>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
              <Filter size={16} className="text-slate-400 ml-2 mr-1" />
              <select 
                className="w-full text-xs bg-transparent focus:outline-none py-1 text-slate-700 font-medium cursor-pointer"
                value={activeModelFilter}
                onChange={(e) => setActiveModelFilter(e.target.value)}
              >
                <option value="All">查看所有归档记录 ({MOCK_HISTORY.length})</option>
                {models.map(m => <option key={m.key} value={m.key}>{m.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
            {filteredHistory.map(inst => (
              <div 
                key={inst.id} 
                onClick={() => setSelectedHistory(inst)}
                className={`p-4 rounded-lg cursor-pointer border transition-all ${
                  selectedHistory?.id === inst.id ? 'bg-slate-100 border-slate-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-700">{inst.id}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate w-40" title={inst.businessKey}>业务标识: {inst.businessKey}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded flex items-center font-bold ${
                    inst.state === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {inst.state === 'Completed' ? '已完成' : '已终止'}
                  </span>
                </div>
                
                <div className="bg-slate-50 p-2 rounded border border-slate-100 mb-2">
                  <p className="text-xs font-medium text-slate-700 truncate">{inst.modelName}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>耗时: {inst.duration}</span>
                  <span>{inst.endTime}</span>
                </div>
              </div>
            ))}
            {filteredHistory.length === 0 && (
              <div className="text-center p-8 text-slate-400 text-sm">暂无历史记录</div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {selectedHistory ? (
            <>
              <div className="p-5 border-b border-slate-200 bg-slate-800 text-white flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <Archive size={18} className="text-slate-400" />
                    <h2 className="text-lg font-bold font-mono tracking-tight text-slate-200">{selectedHistory.id}</h2>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600">{selectedHistory.modelName}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-2">完成时间: {selectedHistory.endTime} | 耗时: {selectedHistory.duration}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`flex items-center px-3 py-1.5 rounded text-xs font-bold border ${
                    selectedHistory.state === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-700 text-slate-300 border-slate-600'
                  }`}>
                    {selectedHistory.state === 'Completed' ? <CheckCircle size={14} className="mr-1.5" /> : <XCircle size={14} className="mr-1.5" />}
                    {selectedHistory.state === 'Completed' ? '执行成功' : '人工终止'}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 border-r border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center">
                    <Activity size={16} className="mr-2 text-slate-500" /> 历史执行链路 (只读)
                  </h3>
                  
                  <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                    {selectedHistory.steps.map((step, i) => (
                      <div key={step.id} className="relative pl-8">
                        <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-sm ${
                          step.status === 'Completed' ? 'bg-emerald-500 text-white' :
                          step.status === 'Failed' ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-slate-400 text-white'
                        }`}>
                          {step.status === 'Completed' ? <CheckCircle size={16} /> :
                           step.status === 'Failed' ? <XCircle size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                        </div>
                        
                        <div className={`p-4 rounded-lg border ${step.status === 'Failed' ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'} shadow-sm opacity-80`}>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-sm flex items-center text-slate-700">
                              {step.name}
                              <span className="ml-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                                {step.type}
                              </span>
                            </h4>
                            <span className="text-xs font-mono text-slate-400">{step.time}</span>
                          </div>
                          
                          <p className="text-xs text-slate-600 mt-1">{step.detail}</p>
                          
                          {step.status === 'Failed' && step.errorLog && (
                            <div className="mt-4 border-t border-rose-200/60 pt-3">
                              <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-2">异常堆栈信息</p>
                              <div className="bg-slate-900 text-rose-300 p-3 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto border border-slate-700 shadow-inner max-h-40 overflow-y-auto leading-relaxed">
                                {step.errorLog}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-72 bg-white flex flex-col shrink-0 opacity-80">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                      <Settings size={14} className="mr-1" /> 最终上下文快照
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">流程结束时的变量状态 (只读)</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {Object.entries(selectedHistory.variables).map(([k, v]) => (
                      <div key={k} className="group">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">{k}</label>
                        <div className="bg-slate-50 border border-slate-200 rounded p-2 text-slate-600 text-xs font-mono">
                          {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <Archive size={64} className="mb-4 opacity-10" />
              <p className="font-medium text-slate-500">选择左侧归档记录查看执行详情</p>
              <p className="text-xs mt-2 opacity-60">支持回溯完整的执行链路和最终变量快照</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAuditLogs = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <History size={24} className="mr-2 text-slate-700" />
            操作审计日志
          </h2>
          <p className="text-sm text-slate-500 mt-1">追溯平台所有用户发起的流程干预及高危管理操作</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="搜索操作人或目标资源 ID..." 
            className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-bold">时间</th>
                <th className="px-6 py-4 font-bold">操作人</th>
                <th className="px-6 py-4 font-bold">操作类型</th>
                <th className="px-6 py-4 font-bold">目标资源</th>
                <th className="px-6 py-4 font-bold">执行详情</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_AUDIT_LOGS.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-700 flex items-center">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold mr-2 text-slate-600">
                        {log.operator.substring(0,2).toUpperCase()}
                      </div>
                      {log.operator}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded border ${
                      log.action.includes('RETRY') || log.action.includes('UNLOCK') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      log.action.includes('START') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {log.target}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600 flex items-center">
                      {log.status === 'Success' ? <CheckCircle size={12} className="text-emerald-500 mr-1.5 shrink-0" /> : 
                       log.status === 'Warning' ? <AlertCircle size={12} className="text-amber-500 mr-1.5 shrink-0" /> : 
                       <XCircle size={12} className="text-rose-500 mr-1.5 shrink-0" />}
                      {log.detail}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'models': return renderModels();
      case 'workers': return renderWorkers();
      case 'schedules': return renderSchedules();
      case 'audits': return renderAuditLogs();
      case 'instances': return renderInstances();
      case 'history': return renderHistory();
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Settings size={48} className="mb-4 opacity-20 animate-spin-slow" />
            <p>模块正在初始化中...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-900 font-sans relative">
      <aside className="w-[220px] bg-[#0f172a] flex flex-col shrink-0 shadow-2xl z-20 border-r border-slate-800">
        <div className="flex items-center space-x-3 p-4 mb-6 border-b border-slate-800/80 bg-[#1e293b]/30">
          <div className="w-8 h-8 bg-indigo-500 rounded border border-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <GitBranch size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide leading-tight">OpsFlow<span className="text-indigo-400">Engine</span></h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">运维控制台</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 overflow-y-auto pb-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2 px-2">监控与干预</div>
          <SidebarItem icon={LayoutDashboard} label="整体概览" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} alertCount={0} />
          <SidebarItem icon={Activity} label="干预中心" active={activeTab === 'instances'} onClick={() => setActiveTab('instances')} alertCount={6} />
          <SidebarItem icon={Archive} label="执行历史" active={activeTab === 'history'} onClick={() => setActiveTab('history')} alertCount={0} />
          
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">模型与自动化调度</div>
          <SidebarItem icon={GitBranch} label="BPMN 模型库" active={activeTab === 'models'} onClick={() => setActiveTab('models')} alertCount={0} />
          <SidebarItem icon={CalendarClock} label="定时任务" active={activeTab === 'schedules'} onClick={() => setActiveTab('schedules')} alertCount={0} />
          <SidebarItem icon={Server} label="外部工作节点" active={activeTab === 'workers'} onClick={() => setActiveTab('workers')} alertCount={0} />
          
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">系统安全</div>
          <SidebarItem icon={History} label="审计日志" active={activeTab === 'audits'} onClick={() => setActiveTab('audits')} alertCount={0} />
        </nav>

        <div className="p-4 border-t border-slate-800/80 bg-[#1e293b]/30 shrink-0">
          <div className="flex items-center space-x-3 p-2 hover:bg-slate-800 cursor-pointer rounded transition-colors">
            <div className="w-8 h-8 rounded bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-indigo-300 font-mono">
              OP
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-200 truncate">系统管理员</p>
              <p className="text-[9px] text-emerald-400 truncate flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1 animate-pulse"></span> 在线</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative bg-slate-50">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-2">
            <Terminal size={16} className="text-slate-400" />
            <span className="text-slate-400 font-medium text-xs font-mono uppercase tracking-wider">/ OpsConsole /</span>
            <span className="text-slate-800 font-bold text-sm">
              {activeTab === 'dashboard' ? '整体概览' : 
               activeTab === 'models' ? '模型库' : 
               activeTab === 'workers' ? '外部工作节点' : 
               activeTab === 'schedules' ? '定时任务' : 
               activeTab === 'audits' ? '审计日志' : 
               activeTab === 'history' ? '执行历史' :
               activeTab === 'instances' ? '干预中心' : activeTab}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="搜索流程 ID / 业务 Key..." 
                className="pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white w-64 transition-all"
              />
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <Settings size={16} className="text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors" />
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 w-full mx-auto max-w-[1600px]">
          {renderContent()}
        </div>
      </main>

      {/* --- Modals --- */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center"><UploadCloud size={18} className="mr-2 text-indigo-600" />部署新模型</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-10 flex flex-col items-center justify-center text-slate-500 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer bg-slate-50">
                <FileCodeIcon size={40} className="mb-3 text-indigo-300" />
                <p className="font-medium text-sm text-slate-700">点击或拖拽 BPMN 2.0 XML 文件至此</p>
                <p className="text-xs mt-1 text-slate-400">支持 .bpmn, .xml 格式</p>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-600 mb-1">模型分类归属 (可选)</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                  <option>基础设施</option>
                  <option>资源调度</option>
                  <option>数据保护</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-2">
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">取消</button>
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">开始解析与部署</button>
            </div>
          </div>
        </div>
      )}

      {triggerModel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-slate-900 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-[650px] border border-slate-700 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-800/50">
              <h3 className="font-bold text-white flex items-center font-mono">
                <Terminal size={16} className="mr-2 text-emerald-400" /> 
                <span className="text-slate-400 mr-2">/trigger/</span> {triggerModel.key}
              </h3>
              <button onClick={() => setTriggerModel(null)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="p-6 flex-1 bg-[#0f172a]">
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center">
                  Business Key <span className="ml-2 text-slate-600 normal-case font-sans font-normal">(业务流水号/幂等控制标识)</span>
                </label>
                <input 
                  type="text" 
                  value={triggerBizKey}
                  onChange={e => setTriggerBizKey(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center">
                  <Code size={14} className="mr-1" /> 初始变量 (JSON Payload)
                </label>
                <div className="relative group h-full">
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-800/50 border-r border-slate-700 rounded-l pt-3 pb-3 text-right pr-2 select-none h-48">
                    <span className="block text-[10px] text-slate-600 font-mono">1</span>
                    <span className="block text-[10px] text-slate-600 font-mono">2</span>
                    <span className="block text-[10px] text-slate-600 font-mono">3</span>
                    <span className="block text-[10px] text-slate-600 font-mono">4</span>
                    <span className="block text-[10px] text-slate-600 font-mono">5</span>
                    <span className="block text-[10px] text-slate-600 font-mono">6</span>
                  </div>
                  <textarea 
                    value={triggerParams}
                    onChange={e => setTriggerParams(e.target.value)}
                    className="w-full h-48 bg-[#1e293b] border border-slate-700 rounded p-3 pl-10 text-indigo-300 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors resize-none leading-relaxed"
                    spellCheck="false"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-mono">目标引擎: default-engine (REST API)</span>
              <div className="space-x-3 flex">
                <button onClick={() => setTriggerModel(null)} className="px-5 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">取消</button>
                <button 
                  onClick={handleTriggerExecute} 
                  className="flex items-center px-6 py-2 text-sm font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all"
                >
                  <PlayCircle size={16} className="mr-2" /> 启动实例
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑模型 Modal */}
      {editingModel && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[600px] overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center"><Edit size={18} className="mr-2 text-indigo-600" />编辑模型配置</h3>
              <button onClick={() => setEditingModel(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">模型名称</label>
                  <input 
                    type="text" 
                    value={editingModel.name}
                    onChange={(e) => setEditingModel({...editingModel, name: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">模型分类</label>
                  <select 
                    value={editingModel.category}
                    onChange={(e) => setEditingModel({...editingModel, category: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option>基础设施</option>
                    <option>资源调度</option>
                    <option>数据保护</option>
                    <option>网络配置</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">版本号</label>
                <input 
                  type="text" 
                  value={editingModel.version}
                  onChange={(e) => setEditingModel({...editingModel, version: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center justify-between">
                  <span>初始变量模板 (JSON)</span>
                  <span className="text-[10px] text-slate-400 font-normal">在触发实例时作为默认参数</span>
                </label>
                <textarea 
                  value={editingModel.expectedParams}
                  onChange={(e) => setEditingModel({...editingModel, expectedParams: e.target.value})}
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 font-mono text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  spellCheck="false"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-2">
              <button onClick={() => setEditingModel(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">取消</button>
              <button onClick={handleUpdateModel} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors">保存配置</button>
            </div>
          </div>
        </div>
      )}

      {/* 新增: 删除确认 Modal */}
      {modelToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">确认删除模型？</h3>
              <p className="text-sm text-slate-500 mb-6">
                您确定要删除模型 <span className="font-bold text-slate-700">{modelToDelete.name}</span> 吗？此操作不可逆。
              </p>
              <div className="flex justify-center space-x-3">
                <button 
                  onClick={() => setModelToDelete(null)} 
                  className="px-5 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDeleteModel} 
                  className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新增: 删除定时任务确认 Modal */}
      {scheduleToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">确认删除定时任务？</h3>
              <p className="text-sm text-slate-500 mb-6">
                您确定要删除定时任务 <span className="font-bold text-slate-700">{scheduleToDelete.name}</span> 吗？此操作不可逆。
              </p>
              <div className="flex justify-center space-x-3">
                <button 
                  onClick={() => setScheduleToDelete(null)} 
                  className="px-5 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDeleteSchedule} 
                  className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const FileCodeIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <path d="m10 13-2 2 2 2"></path>
    <path d="m14 17 2-2-2-2"></path>
  </svg>
);

export default App;
