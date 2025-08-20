"use client";
import React from "react";
import { MessageSquare } from "lucide-react";
import { ChatMessage } from "./types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  chatEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, chatEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
          <MessageSquare className="w-12 h-12 text-gray-600 mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">Ready to help!</h3>
          <p className="text-gray-500">Upload documents and start chatting 🚀</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] p-4 rounded-2xl text-sm ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
