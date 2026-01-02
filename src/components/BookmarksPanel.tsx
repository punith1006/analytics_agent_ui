"use client";

import React, { useState } from "react";
import { BookmarkedInsight } from "@/hooks/useBookmarks";

interface BookmarksPanelProps {
    isOpen: boolean;
    onClose: () => void;
    bookmarks: BookmarkedInsight[];
    onSelectBookmark: (bookmark: BookmarkedInsight) => void;
    onRemoveBookmark: (id: string) => void;
    onExport: () => void;
}

export default function BookmarksPanel({
    isOpen,
    onClose,
    bookmarks,
    onSelectBookmark,
    onRemoveBookmark,
    onExport
}: BookmarksPanelProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Get all unique tags
    const allTags = React.useMemo(() => {
        const tagSet = new Set<string>();
        bookmarks.forEach(b => b.tags.forEach(t => tagSet.add(t)));
        return Array.from(tagSet).sort();
    }, [bookmarks]);

    // Filter bookmarks
    const filteredBookmarks = React.useMemo(() => {
        let filtered = bookmarks;

        if (selectedTag) {
            filtered = filtered.filter(b => b.tags.includes(selectedTag));
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(b =>
                b.title.toLowerCase().includes(query) ||
                b.query.toLowerCase().includes(query) ||
                b.summary?.toLowerCase().includes(query) ||
                b.notes?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [bookmarks, selectedTag, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📚</span>
                        <h2 className="font-semibold text-gray-800">Saved Insights</h2>
                        <span className="px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
                            {bookmarks.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onExport}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Export bookmarks"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search bookmarks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                    <div className="px-4 py-2 border-b border-gray-100 flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${!selectedTag
                                    ? "bg-amber-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            All
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${selectedTag === tag
                                        ? "bg-amber-500 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}

                {/* Bookmarks List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredBookmarks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <p className="text-sm">No bookmarks yet</p>
                            <p className="text-xs mt-1">Save insights to revisit them later</p>
                        </div>
                    ) : (
                        filteredBookmarks.map(bookmark => (
                            <div
                                key={bookmark.id}
                                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => onSelectBookmark(bookmark)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-800 truncate group-hover:text-amber-700">
                                            {bookmark.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {bookmark.summary || bookmark.query}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveBookmark(bookmark.id);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Tags */}
                                {bookmark.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {bookmark.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Timestamp */}
                                <p className="text-[10px] text-gray-400 mt-2">
                                    {new Date(bookmark.timestamp).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
