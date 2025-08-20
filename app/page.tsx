"use client";

import React, { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader"
import ChatMessages from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { ChatMessage } from "@/components/types";

const Page: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documentCount, setDocumentCount] = useState<number>(0);

  const chatEndRef = useRef<HTMLDivElement>(null!) as React.RefObject<HTMLDivElement>;

  // auto-scroll when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200">
      {/* Sidebar: branding, upload, documents counter */}
      <Sidebar
        documentCount={documentCount}
        setDocumentCount={setDocumentCount}
      />

      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <ChatMessages messages={messages} chatEndRef={chatEndRef} />
        <ChatInput setMessages={setMessages} />
      </div>
    </div>
  );
};

export default Page;
