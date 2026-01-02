"use client";

import React, { useRef, useState } from "react";
import ChartRenderer, { DataPointClickEvent } from "./ChartRenderer";
import SuggestionChips from "./SuggestionChips";
import NarrativeView from "./NarrativeView";
import BookmarkButton from "./BookmarkButton";
import { MessageContent } from "@/hooks/useAnalyticsChat";

interface MetricCard {
    label: string;
    value: string | number;
    trend?: string;
    trendDirection?: "up" | "down" | "neutral";
    color?: string;
}

// Define Context Interface matching DrillContext
export interface MessageContext {
    sql_query: string;
    columns: string[];
    tables_used: string[];
}

interface MessageBubbleProps {
    role: "user" | "assistant";
    contents: MessageContent[];
    timestamp?: Date;
    onSuggestionClick?: (query: string) => void;
    isLatestMessage?: boolean;
    onRetry?: () => void;
    messageTitle?: string;
    onDataPointClick?: (event: DataPointClickEvent, context: MessageContext) => void;
    onBookmark?: () => void;
}

export default function MessageBubble({
    role,
    contents,
    timestamp,
    onSuggestionClick,
    isLatestMessage = false,
    onRetry,
    messageTitle = "Analytics Report",
    onDataPointClick,
    onBookmark
}: MessageBubbleProps) {
    const isUser = role === "user";
    const hasDataOrChart = contents.some(c => c.type === "chart" || c.type === "data" || c.type === "metrics" || c.type === "analysis");
    const hasNarrative = contents.some(c => c.type === "narrative");
    const contentRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Helper to extract context from current contents
    const getMessageContext = (): MessageContext => {
        const sqlContent = contents.find(c => c.type === "sql");
        const dataContent = contents.find(c => c.type === "data");

        // Handle sql_generated or sql_retry
        const sqlData = sqlContent?.content as { sql?: string; corrected_sql?: string; tables_used?: string[] } | undefined;
        const dataData = dataContent?.content as { columns?: string[] } | undefined;

        return {
            sql_query: sqlData?.sql || sqlData?.corrected_sql || "",
            columns: dataData?.columns || [],
            tables_used: sqlData?.tables_used || []
        };
    };

    // Export message content to PDF
    const handleDownloadPDF = async () => {
        if (!contentRef.current || isExporting) return;

        setIsExporting(true);
        try {
            // Dynamic import html2pdf to avoid SSR issues
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const html2pdf = (await import('html2pdf.js' as any)).default;

            const element = contentRef.current;
            const filename = `${messageTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

            const opt = {
                margin: [10, 10, 10, 10] as [number, number, number, number],
                filename: filename,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    scrollY: 0,
                    windowWidth: element.scrollWidth
                },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await html2pdf().set(opt as any).from(element).save();
        } catch (error) {
            console.error('PDF export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const renderContent = (content: MessageContent, index: number) => {
        const data = content.content as Record<string, unknown>;

        switch (content.type) {
            case "text":
                return (
                    <p key={index} className="whitespace-pre-wrap leading-relaxed">
                        {content.content as string}
                    </p>
                );

            case "thinking":
                const step = typeof data?.step === 'number' ? data.step : null;
                const totalSteps = typeof data?.total_steps === 'number' ? data.total_steps : null;
                return (
                    <div key={index} className="flex items-center gap-3">
                        <div className="flex space-x-1">
                            <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: "0ms" }} />
                            <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-purple-500" style={{ animationDelay: "150ms" }} />
                            <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-pink-500" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-sm text-gray-600">{(data?.status as string) || "Analyzing..."}</span>
                        {step !== null && totalSteps !== null && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                Step {step}/{totalSteps}
                            </span>
                        )}
                    </div>
                );

            case "sql":
                // Handle both sql_generated (has 'sql') and sql_retry (has 'corrected_sql')
                const sqlToShow = (data?.sql as string) || (data?.corrected_sql as string) || String(content.content);
                const isRetry = !!data?.corrected_sql;
                return (
                    <div key={index} className="mt-4">
                        <div className="mb-2 flex items-center gap-2">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${isRetry ? "bg-amber-100" : "bg-emerald-100"}`}>
                                <svg className={`h-4 w-4 ${isRetry ? "text-amber-600" : "text-emerald-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                                {isRetry ? "Generated SQL Query" : "Generated SQL Query"}
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${data?.confidence === "HIGH" ? "bg-green-100 text-green-700" :
                                data?.confidence === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-red-100 text-red-700"
                                }`}>
                                {(data?.confidence as string) || "MEDIUM"} Confidence
                            </span>
                            {isRetry && (
                                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                    🔄 Retry #{data?.attempt as number}
                                </span>
                            )}
                        </div>
                        {isRetry && typeof data?.error_analysis === 'string' && (
                            <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
                                <p className="text-amber-800"><strong>Error fixed:</strong> {data.error_analysis}</p>
                                {typeof data?.fix_applied === 'string' && (
                                    <p className="text-amber-700 mt-1"><strong>Fix applied:</strong> {data.fix_applied}</p>
                                )}
                            </div>
                        )}
                        <pre className="overflow-x-auto rounded-xl bg-gray-900 p-4 text-sm leading-relaxed text-green-400 shadow-inner">
                            <code>{sqlToShow}</code>
                        </pre>
                        {typeof data?.explanation === 'string' && (
                            <p className="mt-3 text-sm text-gray-600 italic">{data.explanation}</p>
                        )}
                    </div>
                );

            case "data":
                return (
                    <div key={index} className="mt-4">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                                Retrieved <span className="text-blue-600">{data?.row_count as number || 0}</span> rows
                            </span>
                            {data?.limited === true && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Limited to 1000</span>
                            )}
                        </div>
                        {(data?.preview as Record<string, unknown>[])?.length > 0 && (
                            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {Object.keys((data.preview as Record<string, unknown>[])[0]).map((key) => (
                                                    <th key={key} className="px-4 py-3 font-semibold text-gray-700">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(data.preview as Record<string, unknown>[]).slice(0, 5).map((row, rowIdx) => (
                                                <tr key={rowIdx} className="hover:bg-gray-50">
                                                    {Object.values(row).map((val, colIdx) => (
                                                        <td key={colIdx} className="px-4 py-3 text-gray-600">{String(val)}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case "analysis":
                return (
                    <div key={index} className="mt-4 space-y-4">
                        {typeof data?.summary === 'string' && (
                            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-5">
                                <p className="font-medium text-gray-800 leading-relaxed">{data.summary}</p>
                            </div>
                        )}
                        {(data?.insights as string[])?.length > 0 && (
                            <div>
                                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <span className="text-lg">💡</span> Key Insights
                                </h4>
                                <ul className="space-y-2">
                                    {(data.insights as string[]).map((insight, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-gray-600">
                                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {(data?.recommendations as string[])?.length > 0 && (
                            <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <span className="text-lg">🎯</span> Recommendations
                                </h4>
                                <ul className="space-y-2">
                                    {(data.recommendations as string[]).map((rec, idx) => (
                                        <li key={idx} className="flex items-start gap-2 rounded-lg bg-white/70 p-3 text-gray-700 shadow-sm">
                                            <span className="text-green-500">→</span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );

            case "chart":
                const chartConfig = data?.chartConfig as Parameters<typeof ChartRenderer>[0]["config"] | undefined;
                const chartReasoning = typeof data?.reasoning === 'string' ? data.reasoning : null;
                return (
                    <div key={index} className="mt-4">
                        {chartConfig && (
                            <ChartRenderer
                                config={chartConfig}
                                onDataPointClick={(event) => {
                                    if (onDataPointClick) {
                                        onDataPointClick(event, getMessageContext());
                                    }
                                }}
                            />
                        )}
                        {chartReasoning && (
                            <p className="mt-3 text-sm text-gray-500 italic">
                                📊 {chartReasoning}
                            </p>
                        )}
                    </div>
                );

            case "metrics":
                return (
                    <div key={index} className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                        {(content.content as MetricCard[])?.map((metric, idx) => (
                            <div
                                key={idx}
                                className="rounded-xl bg-gradient-to-br from-white to-gray-50 p-4 shadow-lg ring-1 ring-gray-100"
                            >
                                <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                                <p className="mt-1 text-3xl font-bold text-gray-900">{metric.value}</p>
                                {metric.trend && (
                                    <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${metric.trendDirection === "up" ? "text-green-600" :
                                        metric.trendDirection === "down" ? "text-red-600" :
                                            "text-gray-500"
                                        }`}>
                                        {metric.trendDirection === "up" ? "↗" : metric.trendDirection === "down" ? "↘" : "→"}
                                        {metric.trend}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                );

            case "error":
                return (
                    <div key={index} className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <span className="font-semibold text-red-700">{typeof data?.message === 'string' ? data.message : "An error occurred"}</span>
                                {typeof data?.details === 'string' && (
                                    <p className="mt-1 text-sm text-red-600">{data.details}</p>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case "suggestions":
                const suggestionsData = content.content as { categories?: { name: string; icon: string; suggestions: { text: string; query: string }[] }[] };
                return (
                    <SuggestionChips
                        key={index}
                        categories={suggestionsData?.categories || []}
                        onSuggestionClick={onSuggestionClick || (() => { })}
                    />
                );

            case "clarification":
                const clarificationData = data as {
                    question?: string;
                    options?: { id: string; icon: string; label: string }[];
                    default?: string;
                };
                return (
                    <div key={index} className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 shrink-0">
                                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-amber-800">{clarificationData?.question || "I need a bit more information:"}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-11">
                            {clarificationData?.options?.map((option, optIdx) => (
                                <button
                                    key={optIdx}
                                    onClick={() => onSuggestionClick?.(option.label)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${option.id === clarificationData.default
                                        ? "border-amber-400 bg-amber-100 text-amber-800 font-medium"
                                        : "border-amber-200 bg-white text-amber-700 hover:bg-amber-100"
                                        }`}
                                >
                                    <span>{option.icon}</span>
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case "advisory":
            case "explanatory":
                const advisoryData = data as {
                    summary?: string;
                    key_insight?: string;
                    recommendations?: {
                        title: string;
                        description: string;
                        priority: "HIGH" | "MEDIUM" | "LOW";
                        expected_impact: string;
                    }[];
                    reasoning?: string;
                };
                const priorityColors = {
                    HIGH: "bg-red-100 text-red-700 border-red-200",
                    MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
                    LOW: "bg-green-100 text-green-700 border-green-200"
                };
                return (
                    <div key={index} className="mt-4">
                        {/* Summary */}
                        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shrink-0">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-1">Strategic Insight</h4>
                                    <p className="text-gray-700">{advisoryData?.summary}</p>
                                </div>
                            </div>
                        </div>

                        {/* Key Insight */}
                        {advisoryData?.key_insight && (
                            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                                <span className="text-xl">💡</span>
                                <p className="text-yellow-800 font-medium">{advisoryData.key_insight}</p>
                            </div>
                        )}

                        {/* Recommendations */}
                        {advisoryData?.recommendations && advisoryData.recommendations.length > 0 && (
                            <div className="space-y-3">
                                <h5 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Recommendations</h5>
                                {advisoryData.recommendations.map((rec, recIdx) => (
                                    <div key={recIdx} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h6 className="font-semibold text-gray-800">{rec.title}</h6>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[rec.priority] || priorityColors.MEDIUM}`}>
                                                {rec.priority}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
                                        {rec.expected_impact && (
                                            <div className="flex items-center gap-1 text-sm text-green-600">
                                                <span>📈</span>
                                                <span>{rec.expected_impact}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Reasoning */}
                        {advisoryData?.reasoning && (
                            <p className="mt-4 text-sm text-gray-500 italic">
                                {advisoryData.reasoning}
                            </p>
                        )}
                    </div>
                );

            case "narrative":
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const narrativeData = data as any;
                return (
                    <NarrativeView
                        key={index}
                        narrative={narrativeData}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
            <div
                className={`max-w-[90%] rounded-2xl ${isUser
                    ? "rounded-br-md bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 text-white shadow-lg"
                    : "rounded-bl-md bg-white px-6 py-5 shadow-xl ring-1 ring-gray-100"
                    }`}
            >
                {!isUser && (
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <span className="font-semibold text-gray-800">Analytics Agent</span>
                            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">AI</span>
                        </div>
                        {onBookmark && (
                            <BookmarkButton
                                isBookmarked={false}
                                onBookmark={onBookmark}
                                onRemoveBookmark={() => { }}
                            />
                        )}
                    </div>
                )}

                <div ref={contentRef} className={isUser ? "text-white" : "text-gray-800"}>
                    {contents.map((content, index) => renderContent(content, index))}
                </div>

                {/* Data Story Trigger Banner - Prominent UI */}
                {!isUser && hasDataOrChart && !hasNarrative && onSuggestionClick && (
                    <div className="mt-4 mb-1">
                        <button
                            onClick={() => onSuggestionClick("Generate a data story for this analysis")}
                            className="group flex w-full items-center justify-between rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/50 p-3 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md hover:from-indigo-50 hover:to-indigo-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-indigo-100 group-hover:scale-110 transition-transform">
                                    <span className="text-lg">✨</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">Generate Data Story</p>
                                    <p className="text-xs text-gray-500">Get a deep-dive analysis & executive summary</p>
                                </div>
                            </div>
                            <div className="rounded-full bg-white p-1.5 text-indigo-400 shadow-sm ring-1 ring-gray-100 group-hover:text-indigo-600">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    </div>
                )}

                {/* Timestamp and Action Buttons */}
                <div className={`mt-3 flex items-center justify-between ${isUser ? "" : "border-t border-gray-100 pt-3"}`}>
                    {timestamp && (
                        <p className={`text-xs ${isUser ? "text-blue-100" : "text-gray-400"}`}>
                            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}

                    {/* Action Buttons - only for assistant messages */}
                    {!isUser && (
                        <div className="flex items-center gap-2">
                            {/* Retry Button - only for latest message */}
                            {isLatestMessage && onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                    title="Retry this query"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            )}

                            {/* Download PDF Button */}
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isExporting}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-green-600 transition-colors disabled:opacity-50"
                                title="Download as PDF"
                            >
                                {isExporting ? (
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
