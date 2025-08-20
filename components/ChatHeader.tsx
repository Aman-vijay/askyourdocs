import React from "react";
import { MessageSquare } from "lucide-react";

const ChatHeader: React.FC = () => (
  <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center">
    <div className="flex items-center justify-center w-8 h-8 bg-blue-600/20 rounded-full mr-3">
      <MessageSquare className="w-4 h-4 text-blue-400" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-white">Chat with your documents</h2>
      <p className="text-sm text-gray-400">Ask questions about uploaded content</p>
    </div>
  </div>
);

export default ChatHeader;
