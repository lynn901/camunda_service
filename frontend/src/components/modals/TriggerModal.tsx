import React, { useState } from 'react';
import { X, PlayCircle, Terminal, Code } from 'lucide-react';
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
  const [variablesJson, setVariablesJson] = useState('{}');
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
      setError(err instanceof Error ? err.message : 'Invalid JSON or failed to start instance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-anthropic-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
      <div className="bg-anthropic-black rounded-very shadow-whisper w-[750px] border border-dark-surface overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-dark-surface bg-dark-surface/50">
          <h3 className="text-xl font-serif text-ivory flex items-center gap-2">
            <Terminal className="w-5 h-5 text-terracotta" />
            <span className="text-stone-gray">/trigger/</span>
            {process.key}
          </h3>
          <button onClick={onClose} className="text-stone-gray hover:text-ivory">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 flex-1 grid grid-cols-2 gap-8 bg-anthropic-black">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-sans font-bold text-stone-gray uppercase tracking-widest">
                Business Key
                <span className="ml-2 text-[10px] text-dark-warm normal-case font-normal">(Idempotent control identifier)</span>
              </label>
              <input 
                type="text" 
                value={businessKey}
                onChange={(e) => setBusinessKey(e.target.value)}
                className="w-full bg-dark-surface border border-dark-warm rounded-generous px-4 py-2 text-ivory font-mono text-sm focus:outline-none focus:ring-1 focus:ring-terracotta transition-all"
                placeholder="e.g., ORDER-8821"
              />
            </div>
            
            <div className="p-4 bg-dark-surface/30 border border-dark-warm rounded-generous">
              <h4 className="text-xs font-serif text-ivory mb-2">Model Information</h4>
              <p className="text-xs text-stone-gray font-sans">
                Version: <span className="text-terracotta font-mono">{process.version}</span>
              </p>
              <p className="text-xs text-stone-gray font-sans mt-1">
                Name: <span className="text-ivory">{process.name || process.key}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <label className="flex items-center gap-2 text-xs font-sans font-bold text-stone-gray uppercase tracking-widest">
              <Code className="w-3.5 h-3.5" />
              Initial Variables (JSON)
            </label>
            <textarea 
              value={variablesJson}
              onChange={(e) => setVariablesJson(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-dark-surface border border-dark-warm rounded-generous p-4 text-warm-silver font-mono text-xs focus:outline-none focus:ring-1 focus:ring-terracotta transition-all resize-none min-h-[250px] leading-relaxed"
            />
          </div>
        </div>

        {error && <div className="px-8 pb-4 text-xs text-crimson font-sans">{error}</div>}

        <div className="p-6 border-t border-dark-surface bg-dark-surface/50 flex justify-between items-center">
          <span className="text-[10px] text-stone-gray font-mono">Target Engine: default-engine (REST API)</span>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="border-dark-warm text-stone-gray hover:text-ivory hover:bg-dark-surface">Cancel</Button>
            <Button 
              variant="terracotta" 
              disabled={loading}
              onClick={handleTrigger}
            >
              <PlayCircle className="mr-2 w-4 h-4" />
              {loading ? 'Starting...' : 'Launch Instance'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
