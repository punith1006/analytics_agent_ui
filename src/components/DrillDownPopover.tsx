"use client";

import React, { useEffect, useRef, useState } from "react";

interface DrillOption {
    id: string;
    icon: string;
    label: string;
    description: string;
    drill_type: string;
    target_dimension?: string;
}

interface DrillDownPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    clickedElement: {
        dimension: string;
        value: unknown;
        label: string;
        seriesName: string;
        rawData: Record<string, unknown>;
    } | null;
    options: DrillOption[];
    onSelectOption: (option: DrillOption) => void;
    breadcrumb?: { dimension: string; value: string }[];
    position?: { x: number; y: number };
    isLoading?: boolean;
}

export default function DrillDownPopover({
    isOpen,
    onClose,
    clickedElement,
    options,
    onSelectOption,
    breadcrumb = [],
    position,
    isLoading = false
}: DrillDownPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });

    // Calculate safe position on mount and when position changes
    useEffect(() => {
        if (isOpen && position && popoverRef.current) {
            const popoverWidth = 280;
            const popoverHeight = 320;
            const padding = 16;

            let x = position.x;
            let y = position.y + 8; // Slight offset below click

            // Keep within viewport bounds
            if (x + popoverWidth > window.innerWidth - padding) {
                x = window.innerWidth - popoverWidth - padding;
            }
            if (x < padding) x = padding;

            if (y + popoverHeight > window.innerHeight - padding) {
                y = position.y - popoverHeight - 8; // Show above if no room below
            }
            if (y < padding) y = padding;

            setAdjustedPosition({ x, y });
        }
    }, [isOpen, position]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            // Delay to prevent immediate close from the same click
            setTimeout(() => {
                document.addEventListener("mousedown", handleClickOutside);
            }, 100);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen || !clickedElement) return null;

    return (
        <>
            {/* Subtle backdrop for focus */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Popover */}
            <div
                ref={popoverRef}
                className="fixed z-50"
                style={{
                    left: adjustedPosition.x,
                    top: adjustedPosition.y,
                    animation: "popIn 0.15s ease-out"
                }}
            >
                <style jsx>{`
                    @keyframes popIn {
                        from {
                            opacity: 0;
                            transform: scale(0.95) translateY(-4px);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }
                `}</style>

                <div className="w-72 bg-white rounded-xl shadow-2xl border border-gray-200/80 overflow-hidden">

                    {/* Header with data point info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                                    Drill into
                                </p>
                                <p className="text-base font-semibold text-gray-900 truncate mt-0.5">
                                    {clickedElement.label}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="ml-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Value badge */}
                        <div className="mt-2 flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                                {String(clickedElement.value)}
                            </span>
                            <span className="text-xs text-gray-400">
                                {clickedElement.seriesName}
                            </span>
                        </div>
                    </div>

                    {/* Breadcrumb (if drilling deeper) */}
                    {breadcrumb.length > 0 && (
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                {breadcrumb.map((crumb, idx) => (
                                    <span key={idx} className="flex items-center gap-1.5 text-gray-500">
                                        {idx > 0 && <span className="text-gray-300">›</span>}
                                        <span className="font-medium">{crumb.value}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Options as cards */}
                    <div className="p-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span className="text-sm">Loading options...</span>
                                </div>
                            </div>
                        ) : options.length > 0 ? (
                            <div className="space-y-1">
                                {options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => onSelectOption(option)}
                                        className="w-full p-3 rounded-lg text-left transition-all duration-150
                                                   hover:bg-gray-50 active:bg-gray-100
                                                   group cursor-pointer"
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon with subtle background */}
                                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 
                                                          group-hover:bg-blue-100 group-hover:scale-105
                                                          flex items-center justify-center transition-all duration-150">
                                                <span className="text-lg">{option.icon}</span>
                                            </div>

                                            {/* Text content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                                                    {option.label}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                    {option.description}
                                                </p>
                                            </div>

                                            {/* Arrow indicator */}
                                            <svg
                                                className="w-4 h-4 text-gray-300 group-hover:text-blue-500 
                                                         group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500">No drill options available</p>
                            </div>
                        )}
                    </div>

                    {/* Keyboard hint footer */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                            <span>Click to explore</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">ESC</kbd>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
