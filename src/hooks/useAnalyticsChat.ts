"use client";

import { useState, useCallback, useRef } from "react";

// Analytics Agent API base URL
const ANALYTICS_API_URL = process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "http://192.168.10.62:8001";

export interface MessageContent {
    type: "text" | "sql" | "data" | "analysis" | "chart" | "metrics" | "error" | "thinking" | "suggestions" | "clarification" | "explanatory" | "advisory" | "narrative";
    content: unknown;
}

export interface Message {
    id: string;
    role: "user" | "assistant";
    contents: MessageContent[];
    timestamp: Date;
}

interface UseAnalyticsChatReturn {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    conversationId: string;
    sendMessage: (query: string) => Promise<void>;
    clearMessages: () => void;
    newConversation: () => void;
}

/**
 * Custom hook for SSE-based chat communication with the analytics agent
 */
export function useAnalyticsChat(): UseAnalyticsChatReturn {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const currentMessageRef = useRef<Message | null>(null);

    // Generate conversation ID once per session
    const conversationIdRef = useRef<string>(Math.random().toString(36).substring(2, 15));

    const generateId = (): string => Math.random().toString(36).substring(2, 15);

    const updateCurrentMessage = useCallback((content: MessageContent) => {
        if (!currentMessageRef.current) {
            currentMessageRef.current = {
                id: generateId(),
                role: "assistant",
                contents: [],
                timestamp: new Date(),
            };
        }

        const currentMessage = currentMessageRef.current;

        // For thinking events, replace previous thinking content
        if (content.type === "thinking") {
            currentMessage.contents = currentMessage.contents.filter(
                (c: MessageContent) => c.type !== "thinking"
            );
        }

        currentMessage.contents.push(content);

        setMessages((prev) => {
            const existingIndex = prev.findIndex((m) => m.id === currentMessage.id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = { ...currentMessage };
                return updated;
            }
            return [...prev, { ...currentMessage }];
        });
    }, []);

    const handleSSEEvent = useCallback(
        (eventType: string, eventData: unknown) => {
            switch (eventType) {
                case "thinking":
                    updateCurrentMessage({ type: "thinking", content: eventData });
                    break;
                case "sql_generated":
                    updateCurrentMessage({ type: "sql", content: eventData });
                    break;
                case "sql_retry":
                    // Self-healing retry - show corrected SQL
                    updateCurrentMessage({ type: "sql", content: eventData });
                    break;
                case "data_retrieved":
                    updateCurrentMessage({ type: "data", content: eventData });
                    break;
                case "analysis":
                    updateCurrentMessage({ type: "analysis", content: eventData });
                    break;
                case "visualization":
                    const vizData = eventData as Record<string, unknown>;
                    if (vizData && vizData.chartConfig) {
                        updateCurrentMessage({ type: "chart", content: vizData });
                    }
                    if (vizData && Array.isArray(vizData.metrics) && vizData.metrics.length > 0) {
                        updateCurrentMessage({ type: "metrics", content: vizData.metrics });
                    }
                    break;
                case "suggestions":
                    updateCurrentMessage({ type: "suggestions", content: eventData });
                    break;
                case "clarification_needed":
                    updateCurrentMessage({ type: "clarification", content: eventData });
                    break;
                case "advisory":
                case "explanatory":
                    updateCurrentMessage({ type: "explanatory", content: eventData });
                    break;
                case "narrative":
                    updateCurrentMessage({ type: "narrative", content: eventData });
                    break;
                case "error":
                    updateCurrentMessage({ type: "error", content: eventData });
                    break;
                case "complete":
                    break;
                default:
                    console.log("Unknown event:", eventType, eventData);
            }
        },
        [updateCurrentMessage]
    );

    const sendMessage = useCallback(
        async (query: string) => {
            if (!query.trim()) return;

            setError(null);
            setIsLoading(true);

            // Add user message
            const userMessage: Message = {
                id: generateId(),
                role: "user",
                contents: [{ type: "text", content: query }],
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, userMessage]);

            // Reset current message ref
            currentMessageRef.current = null;

            try {
                const response = await fetch(`${ANALYTICS_API_URL}/api/analytics/chat`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "text/event-stream",
                    },
                    body: JSON.stringify({
                        query,
                        conversation_id: conversationIdRef.current
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) {
                    throw new Error("No response body");
                }

                let buffer = "";
                let currentEventType = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith("event: ")) {
                            currentEventType = line.slice(7).trim();
                        } else if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            if (data === "[DONE]") continue;

                            try {
                                const parsed = JSON.parse(data);
                                handleSSEEvent(currentEventType || "unknown", parsed);
                            } catch {
                                continue;
                            }
                        }
                    }
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Unknown error";
                console.error("SSE Error:", err);
                setError(errorMessage);
                updateCurrentMessage({
                    type: "error",
                    content: {
                        message: "Connection Error",
                        details: `Failed to connect to the analytics service at ${ANALYTICS_API_URL}. Please ensure the Python backend is running.`,
                    },
                });
            } finally {
                setIsLoading(false);
                // Remove thinking state from final message
                const currentMsg: Message | null = currentMessageRef.current;
                if (currentMsg !== null) {
                    const msg: Message = currentMsg;
                    msg.contents = msg.contents.filter(
                        (c: MessageContent) => c.type !== "thinking"
                    );
                    setMessages((prev) => {
                        const idx = prev.findIndex((m) => m.id === msg.id);
                        if (idx >= 0) {
                            const updated = [...prev];
                            updated[idx] = { ...msg };
                            return updated;
                        }
                        return prev;
                    });
                }
            }
        },
        [updateCurrentMessage, handleSSEEvent]
    );

    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
        currentMessageRef.current = null;
    }, []);

    // Start a new conversation with fresh ID
    const newConversation = useCallback(() => {
        conversationIdRef.current = Math.random().toString(36).substring(2, 15);
        clearMessages();
    }, [clearMessages]);

    return {
        messages,
        isLoading,
        error,
        conversationId: conversationIdRef.current,
        sendMessage,
        clearMessages,
        newConversation
    };
}
