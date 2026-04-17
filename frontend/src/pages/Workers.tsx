import React, { useState, useEffect } from 'react';
import { Server, RefreshCw, Wifi, Lock, Unlock, Search, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { camundaService } from '../services/camundaService';
import type { ExternalTask } from '../services/camundaService';

export const Workers: React.FC = () => {
  const [tasks, setTasks] = useState<ExternalTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await camundaService.getExternalTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch external tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (id: string) => {
    try {
      await camundaService.unlockExternalTask(id);
      fetchTasks();
    } catch (err) {
      alert('解锁任务失败');
    }
  };

  // Grouping unique workers and topics from tasks
  const uniqueWorkers = Array.from(new Set(tasks.map(t => t.workerId).filter(id => id)));
  const uniqueTopics = Array.from(new Set(tasks.map(t => t.topicName)));
  const lockedTasksCount = tasks.filter(t => t.workerId).length;

  return (
    <div className="space-y-12 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-anthropic-black mb-3 flex items-center gap-4">
            <Server className="text-terracotta w-10 h-10" />
            外部 Worker 节点监控
          </h1>
          <p className="text-olive-gray font-sans text-lg">监控长轮询工作节点的存活状态、Topic 订阅与任务锁获取情况。</p>
        </div>
        <Button variant="outline" onClick={fetchTasks} disabled={loading}>
          <RefreshCw className={`mr-2 w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          刷新状态
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6" elevated>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-sans font-bold text-stone-gray uppercase tracking-widest mb-1">活跃节点数</p>
              <h3 className="text-3xl font-serif text-anthropic-black">{uniqueWorkers.length}</h3>
            </div>
            <div className="p-3 bg-parchment rounded-generous ring-shadow ring-border-warm">
              <Wifi size={20} className="text-terracotta" />
            </div>
          </div>
        </Card>
        <Card className="p-6" elevated>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-sans font-bold text-stone-gray uppercase tracking-widest mb-1">订阅 Topic 数</p>
              <h3 className="text-3xl font-serif text-anthropic-black">{uniqueTopics.length}</h3>
            </div>
            <div className="p-3 bg-parchment rounded-generous ring-shadow ring-border-warm">
              <Search size={20} className="text-stone-gray" />
            </div>
          </div>
        </Card>
        <Card className="p-6" elevated>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-sans font-bold text-stone-gray uppercase tracking-widest mb-1">当前锁定任务</p>
              <h3 className="text-3xl font-serif text-anthropic-black">{lockedTasksCount}</h3>
            </div>
            <div className="p-3 bg-parchment rounded-generous ring-shadow ring-border-warm">
              <Lock size={20} className="text-terracotta" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-dark-surface text-warm-silver" elevated>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-sans font-bold text-stone-gray uppercase tracking-widest mb-1">今日处理量 (24H)</p>
              <h3 className="text-3xl font-serif text-ivory">24.6K</h3>
            </div>
            <div className="p-3 bg-anthropic-black rounded-generous ring-shadow ring-dark-warm">
              <CheckCircle size={20} className="text-terracotta" />
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-comfortable border border-border-cream ring-shadow ring-border-warm overflow-hidden shadow-whisper">
        <div className="px-8 py-5 border-b border-border-cream bg-ivory flex justify-between items-center">
          <h3 className="text-xl font-serif text-anthropic-black">Worker 注册与锁列表</h3>
          <div className="text-[10px] font-mono text-stone-gray uppercase">实时长轮询链路状态</div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white border-b border-border-cream text-[10px] uppercase tracking-widest text-stone-gray font-bold">
              <th className="px-8 py-5">Worker ID / 客户端</th>
              <th className="px-8 py-5">订阅 Topic</th>
              <th className="px-8 py-5">关联流程实例</th>
              <th className="px-8 py-5">锁过期时间</th>
              <th className="px-8 py-5 text-right">运维操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-cream">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center text-stone-gray font-sans italic">
                  正在获取节点锁信息...
                </td>
              </tr>
            ) : tasks.filter(t => t.workerId).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center text-stone-gray font-sans italic">
                  当前暂无被 Worker 锁定的外部任务。
                </td>
              </tr>
            ) : tasks.filter(t => t.workerId).map((task) => (
              <tr key={task.id} className="hover:bg-parchment/50 transition-colors">
                <td className="px-8 py-5">
                  <p className="font-mono text-xs font-bold text-anthropic-black">{task.workerId}</p>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-mono font-bold text-terracotta bg-terracotta/5 px-2 py-0.5 rounded border border-terracotta/20 uppercase">
                    {task.topicName}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <p className="text-[10px] font-mono text-stone-gray truncate w-40">{task.processInstanceId}</p>
                </td>
                <td className="px-8 py-5 text-[10px] font-sans text-stone-gray">
                  {new Date(task.lockExpirationTime).toLocaleTimeString()}
                </td>
                <td className="px-8 py-5 text-right space-x-2">
                  <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold" onClick={() => handleUnlock(task.id)}>
                    <Unlock size={12} className="mr-2" /> 强制释放锁
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
