"use client";

import React, { useState, useEffect } from "react";
import DataPanel from "@/components/DataPanel";
import ChatPanel from "@/components/ChatPanel";
import { useAnalyticsChat } from "@/hooks/useAnalyticsChat";
import { usePinnedData } from "@/hooks/usePinnedData";

// Suggested queries for quick start
const SUGGESTED_QUERIES = [
  { icon: "📊", text: "How many courses do we have?" },
  { icon: "📈", text: "Show me enrollment trends over time" },
  { icon: "🏆", text: "What are the top 5 courses by enrollment?" },
  { icon: "👥", text: "List all active partners" },
  { icon: "📁", text: "Show course category distribution" },
  { icon: "🆕", text: "How many students registered this month?" },
  { icon: "📅", text: "Show me the schedule for upcoming courses" },
  { icon: "💼", text: "What is the total revenue from enrollments?" },
];

export default function HomePage() {
  const [inputValue, setInputValue] = useState("");
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  const { messages, isLoading, sendMessage, clearMessages } = useAnalyticsChat();
  const {
    pinnedData,
    removeSection,
    clearAllSections,
    toggleCollapse,
    updateFromMessage,
    containerRef,
  } = usePinnedData();

  // Check backend status on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch("http://localhost:8001/health");
        if (res.ok) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch {
        setBackendStatus("offline");
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-update pinned data when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        updateFromMessage(lastMessage.contents);
      }
    }
  }, [messages, updateFromMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const query = inputValue;
    setInputValue("");
    await sendMessage(query);
  };

  const handleSuggestedQuery = (query: string) => {
    setInputValue(query);
  };

  const handleSuggestionClick = async (query: string) => {
    if (isLoading) return;
    await sendMessage(query);
  };

  // Retry: Find the last user message and resend it
  const handleRetry = async () => {
    if (isLoading) return;
    // Find the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMessage) {
      const userText = lastUserMessage.contents.find(c => c.type === "text")?.content as string;
      if (userText) {
        await sendMessage(userText);
      }
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LMS Analytics Agent</h1>
              <p className="text-xs text-gray-500">AI-powered Data Scientist & BI</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Future: Bookmarks, Export, Settings buttons */}
            <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              📑 Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Panel - Data View */}
        <div
          className={`transition-all duration-300 ease-in-out ${pinnedData.isCollapsed ? "w-12" : "w-2/5 min-w-[320px] max-w-[500px]"
            }`}
        >
          <DataPanel
            pinnedData={pinnedData}
            onRemoveSection={removeSection}
            onClearAll={clearAllSections}
            onToggleCollapse={toggleCollapse}
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
          />
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1 min-w-0">
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmit={handleSubmit}
            onSuggestionClick={handleSuggestionClick}
            backendStatus={backendStatus}
            suggestedQueries={SUGGESTED_QUERIES}
            onSuggestedQuery={handleSuggestedQuery}
            onClearMessages={clearMessages}
            onRetry={handleRetry}
          />
        </div>
      </main>
    </div>
  );
}
