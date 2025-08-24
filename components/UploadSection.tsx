"use client";
import React, { useState, useRef } from "react";
import { Upload, Globe, MessageSquare, Loader2, Plus, File } from "lucide-react";
import { UploadType } from "./types";

import { IndexedDocumentMeta } from "./DocumentsInfo";

interface UploadSectionProps {
  setDocumentCount: React.Dispatch<React.SetStateAction<number>>;
  setDocuments: React.Dispatch<React.SetStateAction<IndexedDocumentMeta[]>>;
}

const UploadSection: React.FC<UploadSectionProps> = ({ setDocumentCount, setDocuments }) => {
  const [uploadType, setUploadType] = useState<UploadType>("file");
  const [textContent, setTextContent] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (uploadType === "text" && !textContent.trim()) {
      setUploadStatus("Please enter some text content");
      return;
    }
    if (uploadType === "file" && !selectedFile) {
      setUploadStatus("Please select a file");
      return;
    }
    if (uploadType === "website" && !websiteUrl.trim()) {
      setUploadStatus("Please enter a website URL");
      return;
    }

    setUploadLoading(true);
    setUploadStatus("");

    try {
      const formData = new FormData();
      formData.append("type", uploadType);
      if (uploadType === "text") formData.append("content", textContent);
      if (uploadType === "file" && selectedFile) formData.append("file", selectedFile);
      if (uploadType === "website") {
        formData.append("url", websiteUrl);
        formData.append("maxPages", "5");
      }

      const response = await fetch("/api/index", { method: "POST", body: formData });
      const result = await response.json();

      if (response.ok) {
        setUploadStatus(`✅ ${result.message}`);
        setDocumentCount((prev) => prev + 1);
        // Push a new document meta entry (best-effort; backend currently doesn't return ID)
        setDocuments(prev => [
          ...prev,
          {
            id: Date.now(),
            name: uploadType === 'file' && selectedFile ? selectedFile.name : uploadType === 'website' ? websiteUrl : 'Text Snippet',
            type: uploadType,
            size: uploadType === 'file' && selectedFile ? selectedFile.size : undefined,
            uploadedAt: new Date().toISOString()
          }
        ]);

        // Reset fields
        if (uploadType === "text") setTextContent("");
        if (uploadType === "file") {
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
        if (uploadType === "website") setWebsiteUrl("");
      } else {
        setUploadStatus(`❌ ${result.error}`);
      }
    } catch (err) {
      setUploadStatus(`❌ Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-300 mb-3">Add Documents</h2>

      {/* Upload Type Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { key: "file", label: "File", icon: <Upload className="w-3.5 h-3.5" /> },
          { key: "text", label: "Text", icon: <MessageSquare className="w-3.5 h-3.5" /> },
          { key: "website", label: "Website", icon: <Globe className="w-3.5 h-3.5" /> },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setUploadType(item.key as UploadType)}
            className={`flex items-center justify-center gap-1.5 text-xs font-medium px-2 py-2 rounded-md border transition ${
              uploadType === item.key
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-gray-800/60 text-gray-300 border-gray-700 hover:bg-gray-800"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      {uploadType === "file" && (
        <div className="mb-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center p-3 border border-dashed border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800/50 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600/20 rounded-lg mr-3">
              <File className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {selectedFile ? selectedFile.name : "Select a file"}
              </div>
              <div className="text-xs text-gray-400">PDF, DOCX, TXT, CSV • Max 20MB</div>
            </div>
            <Plus className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {uploadType === "text" && (
        <div className="mb-4">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste or type text here..."
            rows={6}
            className="w-full text-sm rounded-md bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none p-3 resize-none text-gray-200 placeholder-gray-500"
          />
          <div className="mt-1 text-[10px] text-gray-500 text-right">{textContent.length} chars</div>
        </div>
      )}

      {uploadType === "website" && (
        <div className="mb-4 space-y-2">
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full text-sm rounded-md bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none p-2 text-gray-200 placeholder-gray-500"
          />
          <p className="text-[11px] text-gray-500">We&apos;ll crawl up to 5 pages starting from this URL.</p>
        </div>
      )}

      {/* Upload Button */}
      <div className="space-y-2">
        <button
          onClick={handleUpload}
          disabled={
            uploadLoading ||
            (uploadType === "file" && !selectedFile) ||
            (uploadType === "text" && !textContent.trim()) ||
            (uploadType === "website" && !websiteUrl.trim())
          }
          className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white py-2.5 rounded-md transition"
        >
          {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploadLoading ? "Uploading..." : `Upload ${uploadType}`}
        </button>

        {uploadStatus && (
          <div
            className={`text-xs rounded-md p-2 border ${
              uploadStatus.startsWith("✅")
                ? "text-green-300 border-green-700 bg-green-900/20"
                : uploadStatus.startsWith("❌")
                ? "text-red-300 border-red-700 bg-red-900/20"
                : "text-gray-300 border-gray-700 bg-gray-800/40"
            }`}
          >
            {uploadStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSection;
