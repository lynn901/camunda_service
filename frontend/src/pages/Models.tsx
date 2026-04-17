import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { UploadCloud, PlayCircle, Edit, Trash2, GitBranch } from 'lucide-react';
import { camundaService } from '../services/camundaService';
import type { ProcessDefinition } from '../services/camundaService';
import { UploadModal } from '../components/modals/UploadModal';
import { TriggerModal } from '../components/modals/TriggerModal';

export const Models: React.FC = () => {
  const [models, setModels] = useState<ProcessDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ProcessDefinition | null>(null);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const data = await camundaService.getProcessDefinitions();
      setModels(data);
    } catch (err) {
      console.error('Failed to fetch models', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleOpenTrigger = (model: ProcessDefinition) => {
    setSelectedModel(model);
    setIsTriggerOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-anthropic-black mb-2">BPMN Model Repository</h1>
          <p className="text-olive-gray font-sans text-sm">Manage, deploy and trigger automation workflow definitions.</p>
        </div>
        <Button variant="terracotta" onClick={() => setIsUploadOpen(true)}>
          <UploadCloud className="mr-2 w-4 h-4" />
          Deploy New Model
        </Button>
      </div>

      <div className="bg-white rounded-comfortable border border-border-cream ring-shadow ring-border-warm overflow-hidden shadow-whisper">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-ivory border-b border-border-cream text-[10px] uppercase tracking-widest text-stone-gray font-bold">
              <th className="px-6 py-4">Model Name / Key</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Version</th>
              <th className="px-6 py-4">Resource</th>
              <th className="px-6 py-4 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-cream">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-stone-gray font-sans italic">
                  Loading models from engine...
                </td>
              </tr>
            ) : models.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-stone-gray font-sans italic">
                  No process definitions found in engine.
                </td>
              </tr>
            ) : models.map((model) => (
              <tr key={model.id} className="hover:bg-parchment/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-ivory text-terracotta rounded-comfortable border border-border-cream">
                      <GitBranch size={16} />
                    </div>
                    <div>
                      <p className="font-serif font-bold text-anthropic-black text-sm">{model.name || model.key}</p>
                      <p className="text-[10px] text-stone-gray font-mono mt-0.5">{model.key}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 bg-ivory text-olive-gray rounded-highly border border-border-cream uppercase tracking-tighter">
                    {model.category || 'General'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-mono font-bold text-terracotta bg-terracotta/5 px-2 py-0.5 rounded-comfortable border border-terracotta/20">
                    V{model.version}
                  </span>
                </td>
                <td className="px-6 py-4 text-[10px] font-mono text-stone-gray">
                  {model.resource}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenTrigger(model)}
                      className="p-1.5 text-terracotta hover:bg-terracotta/10 rounded-comfortable transition-colors" 
                      title="Trigger Instance"
                    >
                      <PlayCircle size={18} />
                    </button>
                    <button className="p-1.5 text-charcoal-warm hover:bg-warm-sand rounded-comfortable transition-colors" title="Edit Model">
                      <Edit size={18} />
                    </button>
                    <button className="p-1.5 text-crimson hover:bg-crimson/10 rounded-comfortable transition-colors" title="Delete Deployment">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={fetchModels}
      />

      <TriggerModal 
        isOpen={isTriggerOpen} 
        onClose={() => setIsTriggerOpen(false)} 
        process={selectedModel} 
        onSuccess={() => {/* Maybe navigate to instances */}}
      />
    </div>
  );
};
