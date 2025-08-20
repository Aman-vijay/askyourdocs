"use client";
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { IndexedDocumentMeta } from "@/components/DocumentsCounter";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { ChatMessage } from "@/components/types";

const Page: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documentCount, setDocumentCount] = useState<number>(0);
  const [documents, setDocuments] = useState<IndexedDocumentMeta[]>([]);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null!) as React.RefObject<HTMLDivElement>;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200">
      <Sidebar 
        documentCount={documentCount} 
        setDocumentCount={setDocumentCount} 
        documents={documents}
        setDocuments={setDocuments}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <ChatMessages messages={messages} chatEndRef={chatEndRef} loading={loading} />
        <ChatInput setMessages={setMessages} setLoading={setLoading} />
      </div>
    </div>
  );
};

export default Page;
