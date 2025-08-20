"use client";
import React, { useState, useEffect } from 'react';
// Removed Loader2 import (handled inside UploadArea)
import { Sidebar } from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import { UploadArea } from '@/components/UploadArea';
import { ChatMessage, IngestedDocument } from '@/types/chat';

const Page = () => {
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).slice(2,11)}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<IngestedDocument[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [maxPages] = useState(10); // maintained for compatibility if needed

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  interface ApiResponse { success: boolean; error?: string }

  const handleFileUpload = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    try {
      setIsLoading(true);
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json() as ApiResponse;
      if (result.success) {
        setDocuments(prev => [...prev, {
          id: Date.now().toString(),
          name: file.name,
          type: 'file' as const,
          size: file.size,
          status: 'processed' as const
        }]);
  if (isMobile) setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return;

    const formData = new FormData();
    formData.append('url', urlInput);
    formData.append('sessionId', sessionId);
    formData.append('maxPages', maxPages.toString());

    try {
      setIsLoading(true);
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      if (result.success) {
        setDocuments(prev => [...prev, {
          id: Date.now().toString(),
          name: urlInput,
          type: 'url',
          status: 'processed'
        }]);
        setUrlInput('');
        if (isMobile) setSidebarOpen(false);
      }
    } catch (error) {
      console.error('URL upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!textInput.trim()) return;

    const formData = new FormData();
    formData.append('text', textInput);
    formData.append('sessionId', sessionId);

    try {
      setIsLoading(true);
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      if (result.success) {
        setDocuments(prev => [...prev, {
          id: Date.now().toString(),
          name: `Text Input (${textInput.substring(0, 30)}...)`,
          type: 'text',
          status: 'processed'
        }]);
        setTextInput('');
        if (isMobile) setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Text upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (inputMessage: string) => {
    if (!inputMessage.trim() || isLoading) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: inputMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: inputMessage,
          sessionId,
        }),
      });

      const result = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date(),
        sources: result.sources || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Ingestion helpers reused

  const uploadAreaNode = (
    <UploadArea
      isLoading={isLoading}
      onFileUpload={handleFileUpload}
      onUrlUpload={handleUrlUpload}
    />
  );

  return (
    <div className={`h-screen bg-gray-50 ${isMobile ? 'flex flex-col' : 'flex'}`}>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        documents={documents}
        textInput={textInput}
        setTextInput={setTextInput}
        handleTextUpload={handleTextUpload}
        isLoading={isLoading}
        uploadArea={uploadAreaNode}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
  <ChatHeader isMobile={isMobile} onOpenSidebar={() => setSidebarOpen(true)} />
  <MessageList messages={messages} isLoading={isLoading} />
  <ChatInput disabled={isLoading} onSend={sendMessage} />
      </div>

  {/* Upload modal now lives inside UploadArea */}
    </div>
  );
};

export default Page;