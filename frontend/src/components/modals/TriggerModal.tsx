import React, { useState } from 'react';
import { X, PlayCircle, Terminal, Code, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { camundaService } from '../../services/camundaService';
import type { ProcessDefinition } from '../../services/camundaService';

interface TriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  process: ProcessDefinition | null;
  onSuccess: () => void;
}

export const TriggerModal: React.FC<TriggerModalProps> = ({ isOpen, onClose, process, onSuccess }) => {
  const [businessKey, setBusinessKey] = useState('');
  const [variablesJson, setVariablesJson] = useState('{\n  "priority": 1,\n  "autoStart": true\n}');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !process) return null;

  const handleTrigger = async () => {
    setLoading(true);
    setError(null);
    try {
      const vars = JSON.parse(variablesJson);
      await camundaService.startProcessInstance(process.key, businessKey, vars);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON 格式错误或启动实例失败');
    } finally {
      setLoading(false);
    }
  };

  const generateBizKey = () => {
    const key = `OP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    setBusinessKey(key);
  };

  return (
    <div className="fixed inset-0 bg-anthropic-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
      <div className="bg-anthropic-black rounded-very shadow-whisper w-[850px] border border-dark-surface overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-dark-surface bg-dark-surface/50">
          <h3 className="text-xl font-serif text-ivory flex items-center gap-2">
            <Terminal className="w-5 h-5 text-terracotta" />
            <span className="text-stone-gray">/触发/</span>
            {process.key}
          </h3>
          <button onClick={onClose} className="text-stone-gray hover:text-ivory">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 flex-1 grid grid-cols-5 gap-8 bg-anthropic-black">
          {/* Config Side */}
          <div className="col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-sans font-bold text-stone-gray uppercase tracking-widest">
                  业务流水号 (Business Key)
                </label>
                <button 
                  onClick={generateBizKey}
                  className="text-[10px] text-terracotta hover:text-coral flex items-center gap-1 font-bold uppercase transition-colors"
                >
                  <Sparkles size={10} /> 自动生成
                </button>
              </div>
              <input 
                type="text" 
                value={businessKey}
                onChange={(e) => setBusinessKey(e.target.value)}
                className="w-full bg-dark-surface border border-dark-warm rounded-generous px-4 py-2.5 text-ivory font-mono text-sm focus:outline-none focus:ring-1 focus:ring-terracotta transition-all"
                placeholder="例如: ORDER-8821"
              />
              <p className="text-[10px] text-dark-warm leading-relaxed">
                强制要求的幂等标识，用于在分布式系统中追踪该实例的完整生命周期。
              </p>
            </div>
            
            <div className="p-5 bg-dark-surface/30 border border-dark-warm rounded-generous space-y-4">
              <h4 className="text-xs font-serif text-ivory border-b border-dark-warm pb-2">模型配置详情</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-stone-gray uppercase tracking-tighter">版本</p>
                  <p className="text-xs text-terracotta font-mono mt-0.5">V{process.version}</p>
                </div>
                <div>
                  <p className="text-[9px] text-stone-gray uppercase tracking-tighter">部署 ID</p>
                  <p className="text-[10px] text-warm-silver font-mono mt-0.5 truncate" title={process.deploymentId}>{process.deploymentId.slice(0,8)}...</p>
                </div>
              </div>
              <div>
                <p className="text-[9px] text-stone-gray uppercase tracking-tighter">模型名称</p>
                <p className="text-xs text-ivory font-sans mt-0.5">{process.name || process.key}</p>
              </div>
            </div>
          </div>

          {/* Editor Side */}
          <div className="col-span-3 space-y-3 flex flex-col">
            <label className="flex items-center gap-2 text-xs font-sans font-bold text-stone-gray uppercase tracking-widest">
              <Code className="w-3.5 h-3.5" />
              初始化上下文 (Initial Variables)
            </label>
            <div className="flex-1 relative group bg-dark-surface rounded-generous border border-dark-warm overflow-hidden flex">
              {/* Pseudo Line Numbers */}
              <div className="w-10 bg-anthropic-black/50 border-r border-dark-warm py-4 text-right pr-2 select-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="text-[10px] font-mono text-dark-warm leading-relaxed h-5">{i + 1}</div>
                ))}
              </div>
              <textarea 
                value={variablesJson}
                onChange={(e) => setVariablesJson(e.target.value)}
                spellCheck={false}
                className="flex-1 bg-transparent p-4 text-warm-silver font-mono text-xs focus:outline-none leading-relaxed resize-none h-[350px]"
              />
            </div>
            <p className="text-[10px] text-dark-warm italic">提示: 确保输入符合标准的 JSON 对象格式。</p>
          </div>
        </div>

        {error && <div className="px-8 pb-4 text-xs text-crimson font-sans font-medium flex items-center gap-2 animate-bounce">
          <X size={12} /> {error}
        </div>}

        <div className="p-6 border-t border-dark-surface bg-dark-surface/50 flex justify-between items-center">
          <span className="text-[10px] text-stone-gray font-mono">Engine Endpoint: /engine-rest/process-definition</span>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="border-dark-warm text-stone-gray hover:text-ivory hover:bg-dark-surface">取消</Button>
            <Button 
              variant="terracotta" 
              disabled={loading || !businessKey}
              onClick={handleTrigger}
            >
              <PlayCircle className="mr-2 w-4 h-4" />
              {loading ? '正在启动...' : '启动流程实例'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
