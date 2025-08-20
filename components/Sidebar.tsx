"use client";
import React from "react";
import UploadSection from "./UploadSection";
import DocumentsCounter, { IndexedDocumentMeta } from "./DocumentsCounter";

interface SidebarProps {
  documentCount: number;
  setDocumentCount: React.Dispatch<React.SetStateAction<number>>;
  documents: IndexedDocumentMeta[];
  setDocuments: React.Dispatch<React.SetStateAction<IndexedDocumentMeta[]>>;
}

const Sidebar: React.FC<SidebarProps> = ({ documentCount, setDocumentCount, documents, setDocuments }) => {
  const [deletingIds, setDeletingIds] = React.useState<Array<string | number>>([]);

  const handleDelete = async (id: string | number) => {
    setDeletingIds(prev => [...prev, id]);
    try {
      // If backend deletion endpoint available, call it here.
      // await fetch(`/api/documents?documentId=${id}`, { method: 'DELETE' });
      setDocuments(prev => prev.filter(d => d.id !== id));
      setDocumentCount(prev => Math.max(0, prev - 1));
    } finally {
      setDeletingIds(prev => prev.filter(x => x !== id));
    }
  };
  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Branding */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">AskYourDocs</h1>
        <p className="text-sm text-gray-400 mt-1">
          Upload docs & chat with them
        </p>
      </div>

      {/* Upload + Docs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
  <UploadSection setDocumentCount={setDocumentCount} setDocuments={setDocuments} />
  <DocumentsCounter count={documentCount} documents={documents} onDelete={handleDelete} loadingIds={deletingIds} />
      </div>
    </div>
  );
};

export default Sidebar;
