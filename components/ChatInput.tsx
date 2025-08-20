"use client";
import React, { useState } from 'react';
import { Loader2, Send } from 'lucide-react';

interface ChatInputProps {
  disabled: boolean;
  onSend: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ disabled, onSend }) => {
  const [value, setValue] = useState('');
  const send = () => {
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setValue('');
  };
  return (
    <div className="p-4 md:p-6 border-t border-gray-200">
      <div className="flex gap-2 md:gap-3">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask a question about your documents..."
          className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
        <button
          onClick={send}
          disabled={!value.trim() || disabled}
          className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {disabled ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
