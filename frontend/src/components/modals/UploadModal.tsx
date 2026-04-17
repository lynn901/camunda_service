import React, { useState } from 'react';
import { X, UploadCloud, FileCode } from 'lucide-react';
import { Button } from '../ui/Button';
import { camundaService } from '../../services/camundaService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [deploymentName, setDeploymentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file || !deploymentName) return;
    setLoading(true);
    setError(null);
    try {
      await camundaService.deployModel(file, deploymentName);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to deploy model. Please check the file and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-anthropic-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
      <div className="bg-ivory rounded-very shadow-whisper w-[500px] border border-border-cream overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border-cream bg-white">
          <h3 className="text-xl font-serif text-anthropic-black flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-terracotta" />
            Deploy New Model
          </h3>
          <button onClick={onClose} className="text-stone-gray hover:text-anthropic-black">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div 
            className={`
              border-2 border-dashed rounded-generous p-12 flex flex-col items-center justify-center transition-colors cursor-pointer
              ${file ? 'border-terracotta bg-parchment' : 'border-border-warm bg-white hover:border-terracotta hover:bg-parchment'}
            `}
            onClick={() => document.getElementById('bpmn-upload')?.click()}
          >
            <input 
              id="bpmn-upload" 
              type="file" 
              className="hidden" 
              accept=".bpmn,.xml" 
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  if (!deploymentName) setDeploymentName(selectedFile.name.replace(/\.bpmn$/, ''));
                }
              }}
            />
            <FileCode className={`w-12 h-12 mb-4 ${file ? 'text-terracotta' : 'text-stone-gray'}`} />
            <p className="text-sm font-sans font-medium text-anthropic-black">
              {file ? file.name : 'Click or drag BPMN 2.0 XML to this area'}
            </p>
            <p className="text-xs text-stone-gray mt-2">Supports .bpmn, .xml formats</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-sans font-bold text-stone-gray uppercase tracking-widest">
              Deployment Name
            </label>
            <input 
              type="text" 
              value={deploymentName}
              onChange={(e) => setDeploymentName(e.target.value)}
              className="w-full bg-white border border-border-warm rounded-generous px-4 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-terracotta transition-all"
              placeholder="e.g., Order Process V1"
            />
          </div>

          {error && <p className="text-xs text-crimson font-sans">{error}</p>}
        </div>

        <div className="p-6 border-t border-border-cream bg-white flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            variant="terracotta" 
            disabled={!file || !deploymentName || loading}
            onClick={handleUpload}
          >
            {loading ? 'Deploying...' : 'Confirm & Deploy'}
          </Button>
        </div>
      </div>
    </div>
  );
};
