"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Globe, MessageSquare, Send, Loader2, Plus, File } from 'lucide-react';

type UploadType = 'file' | 'text' | 'website';
interface ChatMessage { type: 'user' | 'ai'; content: string }

const Page: React.FC = () => {
  // Upload states
  const [uploadType, setUploadType] = useState<UploadType>('file');
  const [textContent, setTextContent] = useState<string>('');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentCount, setDocumentCount] = useState<number>(0);
  
  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle upload
  const handleUpload = async (): Promise<void> => {
    if (uploadType === 'text' && !textContent.trim()) {
      setUploadStatus('Please enter some text content');
      return;
    }
    if (uploadType === 'file' && !selectedFile) {
      setUploadStatus('Please select a file');
      return;
    }
    if (uploadType === 'website' && !websiteUrl.trim()) {
      setUploadStatus('Please enter a website URL');
      return;
    }

    setUploadLoading(true);
    setUploadStatus('');

    try {
      const formData = new FormData();
      formData.append('type', uploadType);

      if (uploadType === 'text') {
        formData.append('content', textContent);
      } else if (uploadType === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else if (uploadType === 'website') {
        formData.append('url', websiteUrl);
        formData.append('maxPages', '5');
      }

      const response = await fetch('/api/index', {
        method: 'POST',
        body: formData
      });

  const result = await response.json();
      
      if (response.ok) {
        setUploadStatus(`✅ ${result.message}`);
        setDocumentCount(prev => prev + 1);
        // Clear form
        if (uploadType === 'text') setTextContent('');
        if (uploadType === 'file') {
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
        if (uploadType === 'website') setWebsiteUrl('');
      } else {
        setUploadStatus(`❌ ${result.error}`);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown upload error';
      setUploadStatus(`❌ Upload failed: ${msg}`);
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle chat query
  const handleQuery = async (): Promise<void> => {
    if (!query.trim()) return;

    const userMessage: ChatMessage = { type: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    
    setChatLoading(true);
    const currentQuery = query;
    setQuery('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: currentQuery })
      });

      if (!response.body) throw new Error('No response body');

      // Add AI message placeholder
      const aiMessageIndex = messages.length + 1;
      setMessages(prev => [...prev, { type: 'ai', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                accumulatedContent += data.text;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[aiMessageIndex] = { type: 'ai', content: accumulatedContent };
                  return newMessages;
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
  } catch (error: unknown) {
      setMessages(prev => [
        ...prev.slice(0, -1),
    { type: 'ai', content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Upload Area */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">AskYourDocs</h1>
          <p className="text-sm text-gray-600 mt-1">Upload documents and chat with them</p>
        </div>

        {/* Upload Sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Add Documents Section */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Add Documents</h2>
            
            {/* Upload Files */}
            <div className="mb-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                  <File className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Upload Files</div>
                  <div className="text-xs text-gray-500">PDF, DOCX, TXT, CSV</div>
                </div>
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.docx,.doc,.txt,.csv"
                className="hidden"
              />
              {selectedFile && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                  Selected: {selectedFile.name}
                </div>
              )}
            </div>

            {/* Add Website */}
            <div className="mb-4">
              <div 
                onClick={() => setUploadType('website')}
                className={`flex items-center p-3 border rounded-lg cursor-pointer group ${
                  uploadType === 'website' ? 'bg-green-50 border-green-200' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                  <Globe className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Add Website</div>
                  <div className="text-xs text-gray-500">Crawl web pages</div>
                </div>
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </div>
              {uploadType === 'website' && (
                <div className="mt-2 space-y-2">
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Documents Count */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Documents ({documentCount})
            </h3>
            {documentCount === 0 && (
              <p className="text-xs text-gray-500">No documents uploaded yet</p>
            )}
          </div>

          {/* Add Text Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Text</h3>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter your text here..."
              className="w-full h-32 p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                setUploadType('text');
                handleUpload();
              }}
              disabled={uploadLoading || !textContent.trim()}
              className="w-full mt-3 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center justify-center text-sm"
            >
              {uploadLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Text
                </>
              )}
            </button>
          </div>

          {/* Upload Button for File/Website */}
          {(uploadType === 'file' && selectedFile) || (uploadType === 'website' && websiteUrl.trim()) ? (
            <button
              onClick={handleUpload}
              disabled={uploadLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center text-sm"
            >
              {uploadLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Index
                </>
              )}
            </button>
          ) : null}

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`p-3 rounded-lg text-xs ${
              uploadStatus.includes('✅') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {uploadStatus}
            </div>
          )}
        </div>
      </div>

      {/* Right Main Area - Chat */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-3">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Chat with your documents</h2>
              <p className="text-sm text-gray-600">Ask questions about your uploaded content</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to help!</h3>
              <p className="text-gray-600 max-w-md">
                Upload some documents and start asking questions.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-xl">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your documents..."
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={chatLoading}
              />
              <button
                onClick={handleQuery}
                disabled={chatLoading || !query.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;