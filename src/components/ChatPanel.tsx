"use client";

import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { Message } from "@/hooks/useAnalyticsChat";

interface ChatPanelProps {
    messages: Message[];
    isLoading: boolean;
    inputValue: string;
    onInputChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onSuggestionClick: (query: string) => void;
    backendStatus: "checking" | "online" | "offline";
    suggestedQueries: Array<{ icon: string; text: string }>;
    onSuggestedQuery: (query: string) => void;
    onClearMessages: () => void;
}

export default function ChatPanel({
    messages,
    isLoading,
    inputValue,
    onInputChange,
    onSubmit,
    onSuggestionClick,
    backendStatus,
    suggestedQueries,
    onSuggestedQuery,
    onClearMessages,
}: ChatPanelProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-gray-200/50 bg-white/80 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <span className="font-semibold text-gray-800">Chat</span>
                </div>

                <div className="flex items-center gap-3">
                    {messages.length > 0 && (
                        <button
                            onClick={onClearMessages}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="relative flex h-2 w-2">
                            {backendStatus === "online" && (
                                <>
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                                </>
                            )}
                            {backendStatus === "offline" && <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />}
                            {backendStatus === "checking" && <span className="relative inline-flex h-2 w-2 animate-pulse rounded-full bg-yellow-500" />}
                        </div>
                        <span className={`text-xs font-medium ${backendStatus === "online" ? "text-green-600" : backendStatus === "offline" ? "text-red-600" : "text-yellow-600"}`}>
                            {backendStatus === "online" ? "Connected" : backendStatus === "offline" ? "Offline" : "Checking..."}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="mx-auto max-w-3xl">
                    {/* Welcome Screen */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                            <div className="mb-8 inline-flex items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 shadow-xl shadow-purple-500/30">
                                <svg className="h-14 w-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h2 className="mb-3 text-3xl font-bold text-gray-900">
                                Ask me anything about your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LMS data</span>
                            </h2>
                            <p className="text-gray-500 mb-10 text-lg max-w-xl">
                                I can analyze enrollments, courses, students, and more—with beautiful visualizations and actionable insights.
                            </p>

                            {backendStatus === "offline" && (
                                <div className="mb-8 w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-4 text-left">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 shrink-0">
                                            <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-red-700">Backend Not Connected</p>
                                            <p className="text-sm text-red-600">Start the Python backend server</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Suggested Queries */}
                            <div className="w-full max-w-xl">
                                <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 text-center">Try asking</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {suggestedQueries.map((query, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => onSuggestedQuery(query.text)}
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
                        <MessageBubble
                            key={message.id}
                            role={message.role}
                            contents={message.contents}
                            timestamp={message.timestamp}
                            onSuggestionClick={onSuggestionClick}
                        />
                    ))}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200/50 bg-white/80 px-4 py-4 backdrop-blur-sm">
                <form onSubmit={onSubmit} className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => onInputChange(e.target.value)}
                            placeholder="Ask about your LMS data..."
                            disabled={isLoading || backendStatus === "offline"}
                            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                        />
                        {isLoading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <svg className="h-5 w-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading || backendStatus === "offline"}
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:shadow-none"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
