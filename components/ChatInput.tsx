"use client";
import React, { useState } from "react";
import { Send } from "lucide-react";
import { ChatMessage } from "./types";

interface ChatInputProps {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>; // 👈 new prop
}

const ChatInput: React.FC<ChatInputProps> = ({ setMessages, setLoading }) => {
  const [query, setQuery] = useState("");

  const handleQuery = async () => {
    if (!query.trim()) return;

    const userMessage: ChatMessage = { type: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = query;
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery }),
      });

      if (!response.body) throw new Error("No response body");

      setMessages((prev) => [...prev, { type: "ai", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                accumulatedContent += data.text;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    type: "ai",
                    content: accumulatedContent,
                  };
                  return newMessages;
                });
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          type: "ai",
          content: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  return (
    <div className="bg-gray-900 border-t border-gray-800 p-4">
      <div className="max-w-3xl mx-auto relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask something..."
          className="w-full pr-12 pl-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200 placeholder-gray-500"
        />
        <button
          onClick={handleQuery}
          disabled={!query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition disabled:bg-gray-600"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
