"use client";
import React from 'react';
import { Menu, MessageCircle } from 'lucide-react';

interface ChatHeaderProps {
  isMobile: boolean;
  onOpenSidebar: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ isMobile, onOpenSidebar }) => (
  <div className="p-4 md:p-6 border-b border-gray-200">
    <div className="flex items-center gap-3">
      {isMobile && (
        <button onClick={onOpenSidebar} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Open sidebar">
          <Menu size={20} />
        </button>
      )}
      <div className="p-2 bg-blue-100 rounded-lg">
        <MessageCircle className="text-blue-600" size={20} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Chat with your documents</h2>
        <p className="text-sm text-gray-600 hidden md:block">Ask questions about your uploaded content</p>
      </div>
    </div>
  </div>
);

export default ChatHeader;
