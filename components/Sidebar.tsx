"use client";
import React from "react";
import UploadSection from "./UploadSection";
import DocumentsCounter from "./DocumentsCounter"

interface SidebarProps {
  documentCount: number;
  setDocumentCount: React.Dispatch<React.SetStateAction<number>>;
}

const Sidebar: React.FC<SidebarProps> = ({ documentCount, setDocumentCount }) => {
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
        <UploadSection setDocumentCount={setDocumentCount} />
        <DocumentsCounter count={documentCount} />
      </div>
    </div>
  );
};

export default Sidebar;
