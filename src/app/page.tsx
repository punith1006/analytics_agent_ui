"use client";

import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "@/components/MessageBubble";
import { useAnalyticsChat } from "@/hooks/useAnalyticsChat";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  const { messages, isLoading, sendMessage, clearMessages } = useAnalyticsChat();

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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const query = inputValue;
    setInputValue("");
    await sendMessage(query);
  };

  const handleSuggestedQuery = (query: string) => {
    setInputValue(query);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LMS Analytics Agent</h1>
              <p className="text-sm text-gray-500">AI-powered Data Scientist & Business Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
              >
                Clear Chat
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                {backendStatus === "online" && (
                  <>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                  </>
                )}
                {backendStatus === "offline" && <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />}
                {backendStatus === "checking" && <span className="relative inline-flex h-3 w-3 animate-pulse rounded-full bg-yellow-500" />}
              </div>
              <span className={`text-sm font-medium ${backendStatus === "online" ? "text-green-600" : backendStatus === "offline" ? "text-red-600" : "text-yellow-600"}`}>
                {backendStatus === "online" ? "Connected" : backendStatus === "offline" ? "Offline" : "Checking..."}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="mb-12 text-center">
              <div className="mb-8 inline-flex items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 shadow-xl shadow-purple-500/30">
                <svg className="h-14 w-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="mb-3 text-3xl font-bold text-gray-900">
                Hello! I&apos;m your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Analytics Agent</span>
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600">
                Ask me anything about your LMS data. I can analyze enrollments, courses, students, and more—with beautiful visualizations and actionable insights.
              </p>

              {backendStatus === "offline" && (
                <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                      <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-red-700">Backend Not Connected</p>
                      <p className="text-sm text-red-600">
                        Please start the Python backend server:
                        <code className="mx-1 rounded bg-red-100 px-2 py-0.5 font-mono text-xs">
                          cd analytics_agent && .\venv\Scripts\activate && python main.py
                        </code>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Queries */}
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Try asking</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SUGGESTED_QUERIES.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestedQuery(query.text)}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-gray-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                    >
                      <span className="text-xl">{query.icon}</span>
                      <span className="text-sm font-medium">{query.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <MessageBubble key={message.id} role={message.role} contents={message.contents} timestamp={message.timestamp} />
          ))}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t border-gray-200/50 bg-white/80 px-4 py-5 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your LMS data..."
                disabled={isLoading || backendStatus === "offline"}
                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-6 py-4 pr-14 text-gray-900 placeholder-gray-500 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
              />
              {isLoading && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  <svg className="h-6 w-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading || backendStatus === "offline"}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:shadow-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-gray-400">
            Analytics Agent uses OpenAI GPT-4o to analyze your data. Results are generated dynamically.
          </p>
        </div>
      </footer>
    </div>
  );
}
