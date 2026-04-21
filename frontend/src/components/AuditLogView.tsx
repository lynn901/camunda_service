import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  User, 
  Clock, 
  Tag, 
  Info,
  Database
} from 'lucide-react';
import { workflowApi } from '../lib/api';

export const AuditLogView = () => {
  const [instanceIdSearch, setInstanceIdSearch] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('All');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', instanceIdSearch],
    queryFn: () => workflowApi.getAuditLogs(instanceIdSearch),
  });

  const filteredLogs = logs?.filter(log => {
    if (operatorFilter !== 'All' && log.userId !== operatorFilter) return false;
    return true;
  });

  const operators = Array.from(new Set(logs?.map(l => l.userId).filter(Boolean)));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <ShieldCheck size={24} className="mr-2 text-indigo-600" /> 
            审计日志
          </h2>
          <p className="text-sm text-slate-500 mt-1">追踪所有针对流程引擎的手动干预、变量修改与运维操作</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="按流程实例 ID 筛选审计记录..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={instanceIdSearch}
            onChange={(e) => setInstanceIdSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-slate-400" />
          <select 
            className="bg-white border border-slate-200 rounded-lg text-xs py-2 px-3 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
          >
            <option value="All">所有操作员</option>
            {operators.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-bold">操作时间</th>
              <th className="px-6 py-4 font-bold">操作员</th>
              <th className="px-6 py-4 font-bold">操作类型</th>
              <th className="px-6 py-4 font-bold">实体类型 / 属性</th>
              <th className="px-6 py-4 font-bold">变更内容 (Old → New)</th>
              <th className="px-6 py-4 font-bold">关联实例</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">加载记录中...</td></tr>
            ) : filteredLogs?.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-xs text-slate-600">
                    <Clock size={14} className="mr-2 text-slate-300" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                      <User size={12} className="text-indigo-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{log.userId || 'SYSTEM'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase border border-slate-200">
                    {log.operationType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                      <Tag size={10} className="mr-1" /> {log.entityType}
                    </div>
                    <p className="text-xs font-mono text-indigo-600">{log.property}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                   {log.property ? (
                     <div className="flex items-center space-x-2 font-mono text-[10px]">
                        <span className="text-slate-400 line-through truncate max-w-[100px]" title={log.orgValue}>{log.orgValue || 'null'}</span>
                        <span className="text-slate-300">→</span>
                        <span className="text-emerald-600 font-bold truncate max-w-[100px]" title={log.newValue}>{log.newValue || 'null'}</span>
                     </div>
                   ) : (
                     <span className="text-slate-300 text-[10px] italic">无直接属性变更</span>
                   )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-[10px] font-mono text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
                    <Info size={12} className="mr-1" />
                    {log.processInstanceId ? log.processInstanceId.substring(0, 12) + '...' : '-'}
                  </div>
                </td>
              </tr>
            ))}
            {(!filteredLogs || filteredLogs.length === 0) && !isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                  <Database size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-sm">暂无审计操作日志记录</p>
                  <p className="text-[11px] mt-2">系统将自动记录所有人工干预与关键运维操作</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
