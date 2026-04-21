import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UploadCloud, 
  PlayCircle, 
  Trash2, 
  X,
  FileCode,
  Terminal,
  Activity,
  Database,
  History,
  ChevronDown,
  ChevronRight,
  Clock
} from 'lucide-react';
import { workflowApi } from '../lib/api';
import { ProcessDefinition } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ModelLibrary = () => {
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [triggerModel, setTriggerModel] = useState<ProcessDefinition | null>(null);
  const [businessKey, setBusinessKey] = useState('');
  const [variablesJson, setVariablesJson] = useState('{\n  "source": "manual-trigger"\n}');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: definitions, isLoading } = useQuery({
    queryKey: ['definitions'],
    queryFn: workflowApi.getDefinitions,
  });

  // Group definitions by key
  const groupedDefinitions = useMemo(() => {
    if (!definitions) return {};
    const groups: Record<string, ProcessDefinition[]> = {};
    definitions.forEach(def => {
      if (!groups[def.key]) groups[def.key] = [];
      groups[def.key].push(def);
    });
    // Sort versions within each group (descending)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => b.version - a.version);
    });
    return groups;
  }, [definitions]);

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: (file: File) => workflowApi.deploy(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions'] });
      setIsUploadOpen(false);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || '部署失败';
      alert(`部署错误: ${msg}`);
    }
  });

  const triggerMutation = useMutation({
    mutationFn: ({ key, businessKey, variables }: { key: string, businessKey: string, variables: any }) => 
      workflowApi.startProcess(key, businessKey, variables),
    onSuccess: () => {
      setTriggerModel(null);
      setBusinessKey('');
      alert('工作流实例启动成功！');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || '启动失败';
      alert(`启动错误: ${msg}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (deploymentId: string) => workflowApi.deleteDeployment(deploymentId, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['definitions'] })
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleTrigger = () => {
    if (!triggerModel) return;
    try {
      const vars = JSON.parse(variablesJson);
      triggerMutation.mutate({
        key: triggerModel.key,
        businessKey: businessKey || `BK-${Date.now().toString().slice(-6)}`,
        variables: vars
      });
    } catch (e) {
      alert('Invalid JSON variables');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">正在获取模型定义...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">BPMN 模型库</h2>
          <p className="text-sm text-slate-500 mt-1">管理、部署与触发自动化工作流定义文件</p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <UploadCloud size={16} className="mr-2" />
          部署新模型 (.bpmn)
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-bold">模型名称 / 标识</th>
              <th className="px-6 py-4 font-bold text-center w-24">版本历史</th>
              <th className="px-6 py-4 font-bold">部署时间</th>
              <th className="px-6 py-4 font-bold">部署 ID</th>
              <th className="px-6 py-4 font-bold text-right">运维操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.entries(groupedDefinitions).map(([key, versions]) => {
              const latest = versions[0];
              const isExpanded = expandedKeys.has(key);
              const hasMultiple = versions.length > 1;

              return (
                <React.Fragment key={key}>
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                          <FileCode size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{latest.name || latest.key}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{latest.key}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => hasMultiple && toggleExpand(key)}
                        disabled={!hasMultiple}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded border text-[11px] font-mono font-black transition-colors ${
                          hasMultiple 
                            ? 'text-indigo-700 bg-indigo-50 border-indigo-100 hover:bg-indigo-100' 
                            : 'text-slate-500 bg-slate-50 border-slate-100'
                        }`}
                      >
                        <span>v{latest.version}</span>
                        {hasMultiple && (
                          isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-[11px] text-slate-600">
                        <Clock size={12} className="mr-1.5 text-slate-400" />
                        {formatDate(latest.deploymentTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono text-slate-400">
                      {latest.deploymentId}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button 
                        onClick={() => setTriggerModel(latest)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                        title="手动触发实例"
                      >
                        <PlayCircle size={20} />
                      </button>
                      <button 
                        onClick={() => { if(confirm('确定级联删除该部署？')) deleteMutation.mutate(latest.deploymentId); }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                        title="删除模型"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                  {isExpanded && versions.slice(1).map(v => (
                    <tr key={v.id} className="bg-slate-50/30 border-l-2 border-indigo-500">
                      <td className="px-6 py-3 pl-14 opacity-60">
                        <div className="flex items-center space-x-2">
                          <History size={14} className="text-slate-400" />
                          <span className="text-xs text-slate-500 italic">旧版本定义</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="text-[10px] font-mono text-slate-400">v{v.version}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-[10px] text-slate-400">{formatDate(v.deploymentTime)}</span>
                      </td>
                      <td className="px-6 py-3 text-[9px] font-mono text-slate-300">
                        {v.deploymentId}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button 
                          onClick={() => setTriggerModel(v)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors" 
                          title="触发旧版本"
                        >
                          <PlayCircle size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
            {Object.keys(groupedDefinitions).length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                  暂无已部署的模型，请点击右上角按钮进行部署
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal ... same as before */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="部署新的 BPMN 工作流">
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
          >
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} />
            </div>
            <p className="text-sm font-bold text-slate-700">点击或拖拽文件进行上传</p>
            <p className="text-xs text-slate-400 mt-2">支持 .bpmn, .xml, .zip 格式文件</p>
            <input type="file" ref={fileInputRef} className="hidden" accept=".bpmn,.xml" onChange={handleFileUpload} />
          </div>
          {uploadMutation.isPending && (
            <div className="flex items-center justify-center text-xs text-indigo-600 font-bold animate-pulse">
              <Activity size={14} className="mr-2 animate-spin" /> 正在解析并部署模型...
            </div>
          )}
        </div>
      </Modal>

      {/* Trigger Modal ... same as before */}
      <Modal isOpen={!!triggerModel} onClose={() => setTriggerModel(null)} title={`手动触发: ${triggerModel?.key}`}>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">业务标识 (Business Key)</label>
            <div className="relative">
               <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               <input 
                type="text" 
                value={businessKey}
                onChange={(e) => setBusinessKey(e.target.value)}
                placeholder="例如: ORDER-2024-001 (留空将自动生成)" 
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">初始流程变量 (JSON Context)</label>
            <div className="relative">
              <Terminal className="absolute left-3 top-4 text-slate-400" size={14} />
              <textarea 
                value={variablesJson}
                onChange={(e) => setVariablesJson(e.target.value)}
                rows={6}
                className="w-full pl-9 pr-4 py-3 bg-slate-900 text-indigo-300 font-mono text-xs rounded-lg border border-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none leading-relaxed"
              />
            </div>
          </div>
          <div className="pt-2">
            <button 
              onClick={handleTrigger}
              disabled={triggerMutation.isPending}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {triggerMutation.isPending ? (
                <>
                  <Activity size={18} className="mr-2 animate-spin" />
                  正在启动实例...
                </>
              ) : (
                <>
                  <PlayCircle size={18} className="mr-2" />
                  确认启动工作流
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
