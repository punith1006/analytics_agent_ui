"use client";

import React from "react";

interface Suggestion {
    text: string;
    query: string;
}

interface SuggestionCategory {
    name: string;
    icon: string;
    suggestions: Suggestion[];
}

interface SuggestionChipsProps {
    categories: SuggestionCategory[];
    onSuggestionClick: (query: string) => void;
}

export default function SuggestionChips({ categories, onSuggestionClick }: SuggestionChipsProps) {
    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                💡 Continue exploring
            </p>
            <div className="flex flex-wrap gap-2">
                {categories.map((category, catIdx) => (
                    <div key={catIdx} className="flex flex-wrap gap-2">
                        {category.suggestions.map((suggestion, sugIdx) => (
                            <button
                                key={`${catIdx}-${sugIdx}`}
                                onClick={() => onSuggestionClick(suggestion.query)}
                                className="group inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span className="text-base">{category.icon}</span>
                                <span>{suggestion.text}</span>
                                <svg
                                    className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
