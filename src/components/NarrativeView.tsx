"use client";

import React from "react";

interface KeyNumber {
    value: string;
    label: string;
    context?: string;
    trend?: "up" | "down" | "stable" | null;
    verified?: boolean;
}

interface StorySection {
    title: string;
    content: string;
    icon?: string;
}

interface Recommendation {
    action: string;
    rationale: string;
    priority: "high" | "medium" | "low";
}

interface NarrativeContent {
    executive_summary: string;
    key_numbers: KeyNumber[];
    story_sections: StorySection[];
    recommendations: Recommendation[];
    data_limitations?: string;
    validation_status?: string;
}

interface NarrativeViewProps {
    narrative: NarrativeContent;
}

const TrendIcon = ({ trend }: { trend?: "up" | "down" | "stable" | null }) => {
    if (!trend) return null;

    const icons = {
        up: (
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        ),
        down: (
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        ),
        stable: (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
        )
    };

    return icons[trend] || null;
};

const PriorityBadge = ({ priority }: { priority: "high" | "medium" | "low" }) => {
    const styles = {
        high: "bg-red-100 text-red-700 border-red-200",
        medium: "bg-amber-100 text-amber-700 border-amber-200",
        low: "bg-blue-100 text-blue-700 border-blue-200"
    };

    return (
        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${styles[priority]}`}>
            {priority}
        </span>
    );
};

export default function NarrativeView({ narrative }: NarrativeViewProps) {
    if (!narrative) return null;

    return (
        <div className="mt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-lg">📖</span>
                <span className="font-medium">Data Story</span>
                {narrative.validation_status === "validated" && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified
                    </span>
                )}
            </div>

            {/* Executive Summary */}
            {narrative.executive_summary && (
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
                    <p className="text-gray-900 text-lg font-medium leading-relaxed">
                        {narrative.executive_summary}
                    </p>
                </div>
            )}

            {/* Key Numbers */}
            {narrative.key_numbers && narrative.key_numbers.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {narrative.key_numbers.map((num, idx) => (
                        <div
                            key={idx}
                            className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-3xl font-bold text-gray-900 tracking-tight">{num.value}</span>
                                <TrendIcon trend={num.trend} />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">{num.label}</p>
                            {num.context && (
                                <p className="text-xs text-gray-500 mt-0.5">{num.context}</p>
                            )}
                            {num.verified === false && (
                                <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Derived
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Story Sections */}
            {narrative.story_sections && narrative.story_sections.length > 0 && (
                <div className="space-y-3">
                    {narrative.story_sections.map((section, idx) => (
                        <div key={idx} className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
                                {section.icon && <span className="text-xl">{section.icon}</span>}
                                {section.title}
                            </h4>
                            <p className="text-gray-700 text-base leading-relaxed">
                                {section.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Recommendations */}
            {narrative.recommendations && narrative.recommendations.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                        <span>💡</span> Recommendations
                    </h4>
                    <div className="space-y-2">
                        {narrative.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-white/80 rounded-lg border border-emerald-100/50">
                                <PriorityBadge priority={rec.priority} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900">{rec.action}</p>
                                    <p className="text-sm text-gray-600 mt-1">{rec.rationale}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Data Limitations */}
            {narrative.data_limitations && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs text-amber-700 flex items-start gap-2">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span><strong>Note:</strong> {narrative.data_limitations}</span>
                    </p>
                </div>
            )}
        </div>
    );
}
