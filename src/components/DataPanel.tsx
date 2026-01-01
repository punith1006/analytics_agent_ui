"use client";

import React, { useRef, useState } from "react";
import ChartRenderer from "./ChartRenderer";
import { PinnedDataState, DataSection } from "@/hooks/usePinnedData";

interface DataPanelProps {
    pinnedData: PinnedDataState;
    onRemoveSection: (id: string) => void;
    onClearAll: () => void;
    onToggleCollapse: () => void;
    containerRef: React.RefObject<HTMLDivElement>;
}

// Individual section card component
function DataSectionCard({
    section,
    onRemove
}: {
    section: DataSection;
    onRemove: () => void;
}) {
    const timeAgo = getTimeAgo(section.timestamp);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Download section as PNG
    const handleDownloadPNG = async () => {
        if (!sectionRef.current || isDownloading) return;

        setIsDownloading(true);
        try {
            // Dynamic import html2canvas
            const html2canvas = (await import('html2canvas')).default;

            const element = sectionRef.current;
            const title = section.chart?.title || "data_view";
            const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            // Convert to blob and download
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            }, 'image/png', 1.0);
        } catch (error) {
            console.error('PNG export failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div ref={sectionRef} className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 animate-in slide-in-from-top-2">
            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 bg-gray-50">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                        {section.chart?.title || "Data View"}
                    </span>
                    <span className="text-xs text-gray-400">{timeAgo}</span>
                </div>
                <div className="flex items-center gap-1">
                    {/* Download PNG Button */}
                    <button
                        onClick={handleDownloadPNG}
                        disabled={isDownloading}
                        className="rounded p-1 text-gray-400 hover:bg-green-100 hover:text-green-600 transition-colors disabled:opacity-50"
                        title="Download as PNG"
                    >
                        {isDownloading ? (
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        )}
                    </button>
                    {/* Remove Button */}
                    <button
                        onClick={onRemove}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                        title="Remove section"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="p-3 space-y-3">
                {/* Chart */}
                {section.chart && (
                    <div>
                        <ChartRenderer config={section.chart.config as unknown as Parameters<typeof ChartRenderer>[0]['config']} />
                    </div>
                )}

                {/* Stats */}
                {section.stats && section.stats.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                        {section.stats.map((stat, idx) => (
                            <div
                                key={idx}
                                className="rounded-lg bg-gray-50 border border-gray-100 p-2"
                            >
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                                    {stat.label}
                                </p>
                                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                {stat.trend && (
                                    <p className={`text-xs ${stat.trend.startsWith('+') ? 'text-green-600' : stat.trend.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                                        {stat.trend}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Table Preview */}
                {section.table && (
                    <div className="rounded-lg border border-gray-100 overflow-hidden">
                        <div className="max-h-32 overflow-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        {section.table.columns.slice(0, 4).map((col, idx) => (
                                            <th key={idx} className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {section.table.data.slice(0, 5).map((row, rowIdx) => (
                                        <tr key={rowIdx} className="hover:bg-gray-50">
                                            {section.table!.columns.slice(0, 4).map((col, colIdx) => (
                                                <td key={colIdx} className="px-2 py-1 text-gray-700 whitespace-nowrap truncate max-w-[80px]">
                                                    {String(row[col] ?? '')}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {section.table.rowCount > 5 && (
                            <div className="px-2 py-1 text-center text-xs text-gray-500 bg-gray-50 border-t">
                                +{section.table.rowCount - 5} more rows
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper function to get relative time
function getTimeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export default function DataPanel({
    pinnedData,
    onRemoveSection,
    onClearAll,
    onToggleCollapse,
    containerRef,
}: DataPanelProps) {
    const { sections, isCollapsed } = pinnedData;

    // If collapsed, show only toggle button
    if (isCollapsed) {
        return (
            <div className="flex h-full flex-col items-center justify-center border-r border-gray-200 bg-gray-50 p-2">
                <button
                    onClick={onToggleCollapse}
                    className="rounded-lg bg-white p-2 shadow-sm hover:bg-gray-100 transition-colors"
                    title="Expand data panel"
                >
                    <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col border-r border-gray-200 bg-gradient-to-b from-slate-50 to-white">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <span className="font-semibold text-gray-800">Data View</span>
                    {sections.length > 0 && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {sections.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {sections.length > 0 && (
                        <button
                            onClick={onClearAll}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Clear all"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={onToggleCollapse}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
                        title="Collapse panel"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Panel Content - Scrollable */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                {sections.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <div className="mb-4 rounded-full bg-gray-100 p-4">
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <p className="font-medium text-gray-600">No data yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Ask a question and charts will appear here
                        </p>
                    </div>
                )}

                {/* Data Sections - Most recent at top */}
                {sections.map((section) => (
                    <DataSectionCard
                        key={section.id}
                        section={section}
                        onRemove={() => onRemoveSection(section.id)}
                    />
                ))}
            </div>
        </div>
    );
}
