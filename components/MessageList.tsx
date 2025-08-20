"use client";
import React from 'react';
import { ChatMessage } from '@/types/chat';
import { Loader2, MessageCircle } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => (
  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
    {messages.length === 0 ? (
      <div className="text-center py-8 md:py-12">
        <MessageCircle className="mx-auto mb-4 text-gray-300" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to help!</h3>
        <p className="text-gray-600 px-4">Upload some documents and start asking questions.</p>
      </div>
    ) : (
      messages.map(message => (
        <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
          {message.role === 'assistant' && (
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle size={16} className="text-blue-600" />
            </div>
          )}
          <div className={`max-w-[85%] md:max-w-3xl ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-50'} rounded-2xl px-4 py-3`}>
            <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Sources:</p>
                <div className="space-y-1">
                  {message.sources.map((source, idx) => (
                    <div key={idx} className="text-xs bg-white rounded px-2 py-1">
                      {source.snippet}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {message.role === 'user' && (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium">U</span>
            </div>
          )}
        </div>
      ))
    )}
    {isLoading && (
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Loader2 className="animate-spin text-blue-600" size={16} />
        </div>
        <div className="bg-gray-50 rounded-2xl px-4 py-3">
          <p className="text-gray-600">Thinking...</p>
        </div>
      </div>
    )}
  </div>
);

export default MessageList;
