"use client";

import { useState, useCallback, useRef } from "react";
import { DataPointClickEvent } from "@/components/ChartRenderer";

// Analytics Agent API base URL
const ANALYTICS_API_URL = process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "http://192.168.10.62:8001";

export interface DrillOption {
    id: string;
    icon: string;
    label: string;
    description: string;
    drill_type: string;
    target_dimension?: string;
}

export interface DrillContext {
    sql_query: string;
    columns: string[];
    tables_used: string[];
}

export interface BreadcrumbItem {
    dimension: string;
    value: string;
    drill_type: string;
}

interface UseDrillDownReturn {
    isDrilling: boolean;
    drillOptions: DrillOption[];
    breadcrumb: BreadcrumbItem[];
    clickedElement: DataPointClickEvent | null;
    fetchDrillOptions: (clicked: DataPointClickEvent, context: DrillContext) => Promise<void>;
    executeDrillDown: (option: DrillOption) => Promise<void>;
    resetDrill: () => void;
    goBack: () => void;
    onDrillResult?: (result: { chartConfig: unknown; data: unknown }) => void;
    setOnDrillResult: (callback: (result: { chartConfig: unknown; data: unknown }) => void) => void;
}

/**
 * Custom hook for interactive drill-down functionality
 */
export function useDrillDown(): UseDrillDownReturn {
    const [isDrilling, setIsDrilling] = useState(false);
    const [drillOptions, setDrillOptions] = useState<DrillOption[]>([]);
    const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
    const [clickedElement, setClickedElement] = useState<DataPointClickEvent | null>(null);

    const currentContextRef = useRef<DrillContext | null>(null);
    const onDrillResultRef = useRef<((result: { chartConfig: unknown; data: unknown }) => void) | null>(null);

    const setOnDrillResult = useCallback((callback: (result: { chartConfig: unknown; data: unknown }) => void) => {
        onDrillResultRef.current = callback;
    }, []);

    /**
     * Fetch drill-down options for a clicked chart element
     */
    const fetchDrillOptions = useCallback(async (
        clicked: DataPointClickEvent,
        context: DrillContext
    ) => {
        setClickedElement(clicked);
        currentContextRef.current = context;
        setIsDrilling(true);

        try {
            const response = await fetch(`${ANALYTICS_API_URL}/api/analytics/drill-options`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clicked_element: {
                        dimension: clicked.dimension,
                        value: clicked.value,
                        label: clicked.label,
                        rawData: clicked.rawData
                    },
                    current_context: context,
                    breadcrumb: breadcrumb
                })
            });

            if (!response.ok) {
                throw new Error("Failed to fetch drill options");
            }

            const data = await response.json();
            setDrillOptions(data.options || []);
        } catch (error) {
            console.error("Drill options error:", error);
            setDrillOptions([]);
        } finally {
            setIsDrilling(false);
        }
    }, [breadcrumb]);

    /**
     * Execute a drill-down and stream results
     */
    const executeDrillDown = useCallback(async (option: DrillOption) => {
        if (!clickedElement || !currentContextRef.current) return;

        setIsDrilling(true);

        try {
            const response = await fetch(`${ANALYTICS_API_URL}/api/analytics/drill-down`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "text/event-stream"
                },
                body: JSON.stringify({
                    clicked_element: {
                        dimension: clickedElement.dimension,
                        value: clickedElement.value,
                        label: clickedElement.label,
                        rawData: clickedElement.rawData
                    },
                    drill_option: option,
                    current_context: currentContextRef.current,
                    breadcrumb: breadcrumb
                })
            });

            if (!response.ok) {
                throw new Error("Drill-down request failed");
            }

            const reader = response.body?.getReader();
            if (!reader) return;

            const decoder = new TextDecoder();
            let chartConfig: unknown = null;
            let newBreadcrumb: BreadcrumbItem[] = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data:")) {
                        try {
                            const data = JSON.parse(line.slice(5).trim());

                            // Handle visualization event
                            if (data && typeof data === "object" && "chartConfig" in data) {
                                chartConfig = data.chartConfig;
                            }

                            // Handle complete event with breadcrumb
                            if (data && typeof data === "object" && "breadcrumb" in data) {
                                newBreadcrumb = data.breadcrumb;
                            }
                        } catch {
                            // Ignore parse errors for incomplete chunks
                        }
                    }
                }
            }

            // Update breadcrumb
            if (newBreadcrumb.length > 0) {
                setBreadcrumb(newBreadcrumb);
            }

            // Notify parent of drill result
            if (chartConfig && onDrillResultRef.current) {
                onDrillResultRef.current({ chartConfig, data: null });
            }

            // Reset clicked element after successful drill
            setClickedElement(null);
            setDrillOptions([]);

        } catch (error) {
            console.error("Drill-down error:", error);
        } finally {
            setIsDrilling(false);
        }
    }, [clickedElement, breadcrumb]);

    /**
     * Reset drill state completely
     */
    const resetDrill = useCallback(() => {
        setClickedElement(null);
        setDrillOptions([]);
        setBreadcrumb([]);
        currentContextRef.current = null;
    }, []);

    /**
     * Go back one level in drill hierarchy
     */
    const goBack = useCallback(() => {
        if (breadcrumb.length > 0) {
            setBreadcrumb(prev => prev.slice(0, -1));
        }
        setClickedElement(null);
        setDrillOptions([]);
    }, [breadcrumb]);

    return {
        isDrilling,
        drillOptions,
        breadcrumb,
        clickedElement,
        fetchDrillOptions,
        executeDrillDown,
        resetDrill,
        goBack,
        setOnDrillResult
    };
}
