import React from "react";
import { X, FileText } from "lucide-react";

export interface IndexedDocumentMeta {
  id: string | number;
  name?: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
}

interface DocumentsCounterProps {
  count: number;
  documents?: IndexedDocumentMeta[];
  onDelete?: (id: string | number) => void;
  loadingIds?: Array<string | number>;
}

const DocumentsCounter: React.FC<DocumentsCounterProps> = ({ count, documents = [], onDelete, loadingIds = [] }) => {
  return (
    <div className="border-t border-gray-800 pt-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
        <span>Documents</span>
        <span className="inline-flex items-center justify-center text-[11px] px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300 font-medium min-w-[2rem] text-center">
          {count}
        </span>
      </h3>
      {count === 0 ? (
        <p className="text-xs text-gray-500">No documents uploaded yet</p>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
          {documents.map(doc => {
            const isDeleting = loadingIds.includes(doc.id);
            return (
              <div
                key={doc.id}
                className="group flex items-center gap-2 text-xs bg-gray-800/60 hover:bg-gray-800 border border-gray-700/70 rounded-md px-2 py-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-gray-200 font-medium">
                    {doc.name || `Document ${doc.id}`}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {doc.type || 'unknown'}{doc.size ? ` • ${(doc.size / 1024).toFixed(1)} KB` : ''}
                  </p>
                </div>
                {onDelete && (
                  <button
                    aria-label="Delete document"
                    disabled={isDeleting}
                    onClick={() => onDelete(doc.id)}
                    className="opacity-60 group-hover:opacity-100 hover:text-red-400 text-gray-400 transition disabled:opacity-30"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {count > 0 && (
        <p className="mt-2 text-[11px] text-gray-500">Indexed documents ready for questions.</p>
      )}
    </div>
  );
};

export default DocumentsCounter;
