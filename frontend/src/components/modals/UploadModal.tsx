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
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { label: '基础设施', value: 'Infrastructure' },
    { label: '资源调度', value: 'ResourceScheduling' },
    { label: '网络配置', value: 'Networking' },
    { label: '数据保护', value: 'DataProtection' },
    { label: '通用', value: 'General' }
  ];

  const handleUpload = async () => {
    if (!file || !deploymentName) return;
    setLoading(true);
    setError(null);
    try {
      await camundaService.deployModel(file, deploymentName, category);
      onSuccess();
      onClose();
    } catch (err) {
      setError('部署模型失败，请检查文件格式后重试。');
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
            部署新模型 (BPMN)
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
            <p className="text-sm font-sans font-medium text-anthropic-black text-center px-4">
              {file ? file.name : '点击或拖拽 BPMN 2.0 XML 文件至此区域'}
            </p>
            <p className="text-xs text-stone-gray mt-2">支持格式: .bpmn, .xml</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-sans font-bold text-stone-gray uppercase tracking-widest">
                部署名称
              </label>
              <input 
                type="text" 
                value={deploymentName}
                onChange={(e) => setDeploymentName(e.target.value)}
                className="w-full bg-white border border-border-warm rounded-generous px-4 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-terracotta transition-all"
                placeholder="流程名称"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-sans font-bold text-stone-gray uppercase tracking-widest">
                业务分类
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-border-warm rounded-generous px-4 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-terracotta transition-all appearance-none"
              >
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-crimson font-sans">{error}</p>}
        </div>

        <div className="p-6 border-t border-border-cream bg-white flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button 
            variant="terracotta" 
            disabled={!file || !deploymentName || loading}
            onClick={handleUpload}
          >
            {loading ? '正在部署...' : '确认并部署'}
          </Button>
        </div>
      </div>
    </div>
  );
};
