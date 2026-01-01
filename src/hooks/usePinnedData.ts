"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface DataSection {
    id: string;
    timestamp: Date;
    chart?: {
        config: Record<string, unknown>;
        title: string;
    };
    table?: {
        data: Record<string, unknown>[];
        columns: string[];
        rowCount: number;
    };
    stats?: Array<{
        label: string;
        value: string | number;
        trend?: string;
        icon?: string;
    }>;
}

export interface PinnedDataState {
    sections: DataSection[];
    isCollapsed: boolean;
}

export interface UsePinnedDataReturn {
    pinnedData: PinnedDataState;
    addSection: (section: Omit<DataSection, 'id' | 'timestamp'>) => void;
    removeSection: (id: string) => void;
    clearAllSections: () => void;
    toggleCollapse: () => void;
    updateFromMessage: (contents: Array<{ type: string; content: unknown }>) => void;
    containerRef: React.RefObject<HTMLDivElement>;
}

export function usePinnedData(): UsePinnedDataReturn {
    const [pinnedData, setPinnedData] = useState<PinnedDataState>({
        sections: [],
        isCollapsed: false,
    });

    const containerRef = useRef<HTMLDivElement>(null);

    // Generate unique ID
    const generateId = () => `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add a new section (prepends to top) - with deduplication
    const addSection = useCallback((section: Omit<DataSection, 'id' | 'timestamp'>) => {
        setPinnedData(prev => {
            // Deduplication: Check if section with same chart title exists within last 2 seconds
            const chartTitle = section.chart?.title || "";
            const now = new Date();
            const recentDuplicate = prev.sections.find(s => {
                const timeDiff = now.getTime() - s.timestamp.getTime();
                return s.chart?.title === chartTitle && timeDiff < 2000;
            });

            if (recentDuplicate) {
                // Skip - already added recently
                return prev;
            }

            const newSection: DataSection = {
                id: generateId(),
                timestamp: now,
                ...section,
            };

            return {
                ...prev,
                sections: [newSection, ...prev.sections], // New section at the top
            };
        });
    }, []);

    // Remove a section by ID with smooth scroll adjustment
    const removeSection = useCallback((id: string) => {
        setPinnedData(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s.id !== id),
        }));
    }, []);

    // Clear all sections
    const clearAllSections = useCallback(() => {
        setPinnedData(prev => ({
            ...prev,
            sections: [],
        }));
    }, []);

    // Toggle collapse
    const toggleCollapse = useCallback(() => {
        setPinnedData(prev => ({
            ...prev,
            isCollapsed: !prev.isCollapsed,
        }));
    }, []);

    // Auto-update from message contents (adds new section instead of replacing)
    const updateFromMessage = useCallback((contents: Array<{ type: string; content: unknown }>) => {
        let chart: DataSection['chart'] | undefined;
        let table: DataSection['table'] | undefined;
        let stats: DataSection['stats'] | undefined;

        contents.forEach(content => {
            if (content.type === "chart") {
                const chartContent = content.content as Record<string, unknown>;
                if (chartContent?.chartConfig) {
                    const config = chartContent.chartConfig as Record<string, unknown>;
                    chart = {
                        config,
                        title: (config.title as string) || "Chart",
                    };
                }
            }
            if (content.type === "data") {
                const dataContent = content.content as Record<string, unknown>;
                if (dataContent?.data && Array.isArray(dataContent.data)) {
                    const data = dataContent.data as Record<string, unknown>[];
                    table = {
                        data: data.slice(0, 100),
                        columns: data.length > 0 ? Object.keys(data[0]) : [],
                        rowCount: data.length,
                    };
                }
            }
            if (content.type === "metrics") {
                const metricsContent = content.content as DataSection['stats'];
                if (Array.isArray(metricsContent)) {
                    stats = metricsContent;
                }
            }
        });

        // Only add a section if there's meaningful content
        if (chart || table || stats) {
            addSection({ chart, table, stats });
        }
    }, [addSection]);

    // Scroll to top when new section is added
    useEffect(() => {
        if (containerRef.current && pinnedData.sections.length > 0) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [pinnedData.sections.length]);

    return {
        pinnedData,
        addSection,
        removeSection,
        clearAllSections,
        toggleCollapse,
        updateFromMessage,
        containerRef,
    };
}
