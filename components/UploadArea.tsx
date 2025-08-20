import React, { useState } from 'react';
import { Upload, FileText, Globe, Plus, Loader2 } from 'lucide-react';

interface UploadAreaProps {
  onFileUpload: (file: File) => void | Promise<void>;
  onUrlUpload: (url: string, maxPages: number) => void | Promise<void>;
  isLoading: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileUpload, onUrlUpload, isLoading }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'' | 'file' | 'url'>('');
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(10);

  const openModal = (type: 'file' | 'url') => {
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType('');
    setUrl('');
    setMaxPages(10);
  };

  const handleFileInput = (file?: File) => {
    if (!file) return;
    onFileUpload(file);
    closeModal();
  };

  const handleUrlSubmit = () => {
    if (!url.trim()) return;
    onUrlUpload(url.trim(), maxPages);
    closeModal();
  };

  return (
    <div className="p-6 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Add Documents</h2>
      <button
        onClick={() => openModal('file')}
        disabled={isLoading}
        className="w-full flex items-center gap-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group disabled:opacity-50"
      >
        <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg">
          <FileText className="text-blue-600" size={16} />
        </div>
        <div>
          <p className="font-medium text-gray-900">Upload Files</p>
          <p className="text-xs text-gray-600">PDF, DOCX, TXT, CSV</p>
        </div>
        <Plus className="ml-auto text-gray-400" size={16} />
      </button>
      <button
        onClick={() => openModal('url')}
        disabled={isLoading}
        className="w-full flex items-center gap-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors group disabled:opacity-50"
      >
        <div className="p-2 bg-green-100 group-hover:bg-green-200 rounded-lg">
          <Globe className="text-green-600" size={16} />
        </div>
        <div>
          <p className="font-medium text-gray-900">Add Website</p>
          <p className="text-xs text-gray-600">Crawl web pages</p>
        </div>
        <Plus className="ml-auto text-gray-400" size={16} />
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{modalType === 'file' ? 'Upload Document' : 'Add Website'}</h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="p-6">
              {modalType === 'file' ? (
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onDrop={e => { e.preventDefault(); const files = Array.from(e.dataTransfer.files); if (files[0]) handleFileInput(files[0]); }}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => document.getElementById('uploadarea-file-input')?.click()}
                  >
                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600">Drop your file here or click to browse</p>
                    <p className="text-sm text-gray-400 mt-2">Supports PDF, DOCX, TXT, CSV</p>
                  </div>
                  <input
                    id="uploadarea-file-input"
                    type="file"
                    accept=".pdf,.docx,.txt,.csv"
                    className="hidden"
                    onChange={e => handleFileInput(e.target.files?.[0])}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                    <input
                      type="url"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Pages to Crawl</label>
                    <input
                      type="number"
                      value={maxPages}
                      min={1}
                      max={100}
                      onChange={e => setMaxPages(parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleUrlSubmit}
                    disabled={!url.trim() || isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Globe className="mr-2" size={16} />} Add Website
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};