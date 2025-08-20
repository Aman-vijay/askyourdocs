"use client";
import React from "react";
import { Bot, User, Loader2 } from "lucide-react";
import { ChatMessage } from "./types"; // Add date-fns for timestamp formatting

interface ChatMessagesProps {
  messages: ChatMessage[];
  chatEndRef: React.RefObject<HTMLDivElement>;
  loading: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, chatEndRef, loading }) => {
  // Helper to detect if message continues same author chain
  const isContinuation = (idx: number) =>
    idx > 0 && messages[idx - 1].type === messages[idx].type;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative bg-gray-900/95">
     
      <div className="pointer-events-none absolute inset-0 opacity-[0.65] [mask-image:radial-gradient(circle_at_50%_30%,black,transparent_75%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(37,99,235,0.15),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(147,51,234,0.15),transparent_65%)]" />
      </div>

      {messages.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center h-full text-center text-gray-400 animate-fade-in">
          <Bot className="w-12 h-12 text-gray-500 mb-4 transition-transform hover:scale-110" />
          <h3 className="text-xl font-semibold text-white mb-2">Welcome to the Chat!</h3>
          <p className="text-gray-400 text-sm max-w-md">
            Start a conversation or upload a document to get assistance 🚀
          </p>
        </div>
      ) : (
        <div className="relative max-w-3xl mx-auto">
          {messages.map((message, index) => {
            const continuation = isContinuation(index);
            const baseBubble =
              'max-w-[80%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm transition-all duration-300 font-sans';
            const userStyles = continuation
              ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white border border-white/15 rounded-br-sm shadow-blue-900/20'
              : 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white border border-white/15 rounded-br-sm shadow-blue-900/30';
            const aiStyles = continuation
              ? 'bg-gray-800/85 text-gray-100 border border-gray-700/50 rounded-bl-sm shadow-black/15'
              : 'bg-gray-800/95 text-gray-100 border border-gray-700/60 rounded-bl-sm shadow-black/25 backdrop-blur-sm';

            return (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : 'justify-start'
                } ${continuation ? 'mt-2' : 'mt-6'} first:mt-0 animate-slide-in`}
              >
                {/* Avatar with hover animation */}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 transition-all duration-200 ${
                    continuation ? 'opacity-0 pointer-events-none' : 'hover:scale-110'
                  } ${message.type === 'user' ? 'bg-blue-500' : 'bg-gray-700'}`}
                >
                  {message.type === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`${baseBubble} ${message.type === 'user' ? userStyles : aiStyles}`}>
                  <div className="text-base">{message.content}</div>
                 
                </div>
              </div>
            );
          })}

         
          {loading && (
            <div className="flex items-start gap-3 justify-start mt-6 animate-fade-in">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="px-4 py-3 bg-gray-800/85 backdrop-blur-sm rounded-2xl text-sm flex gap-2 border border-gray-700/50 shadow-black/15">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-gray-300 font-medium">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} className="h-4" />
        </div>
      )}
    </div>
  );
};

export default ChatMessages;


