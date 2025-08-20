"use client";
import React from 'react';
import { FileText, Plus, File, ExternalLink } from 'lucide-react';
import { IngestedDocument } from '@/types/chat';
interface SidebarProps {
  isMobile: boolean;
  sidebarOpen: boolean;
  documents: IngestedDocument[];
  textInput: string;
  setTextInput: (v: string) => void;
  handleTextUpload: () => void;
  isLoading: boolean;
  uploadArea?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobile,
  sidebarOpen,
  documents,
  textInput,
  setTextInput,
  handleTextUpload,
  isLoading,
  uploadArea
}) => {
  return (
    <div className={`
      ${isMobile ? 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out' : ''}
      ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
      ${isMobile ? 'w-full' : 'w-80'}
      bg-white border-r border-gray-200 flex flex-col
    `}>
      {!isMobile && (
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">AskYourDocs</h1>
          <p className="text-sm text-gray-600 mt-1">Upload documents and chat with them</p>
        </div>
      )}

  {uploadArea}

      <div className="flex-1 p-6 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Documents ({documents.length})</h3>
        <div className="space-y-2">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1 bg-white rounded">
                {doc.type === 'file' ? <File size={14} /> : doc.type === 'url' ? <ExternalLink size={14} /> : <FileText size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                <p className="text-xs text-green-600">Processed</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Text</h3>
        <div className="space-y-3">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste or type your text here..."
            className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={handleTextUpload}
            disabled={!textInput.trim() || isLoading}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
          >
            {isLoading ? <Plus className="animate-spin mr-2" size={14} /> : <Plus className="mr-2" size={14} />}
            Add Text
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
