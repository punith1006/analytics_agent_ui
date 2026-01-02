"use client";

import React, { useState, useEffect, useCallback } from "react";

export interface BookmarkedInsight {
    id: string;
    timestamp: Date;
    title: string;
    query: string;
    summary?: string;
    chartConfig?: unknown;
    data?: unknown[];
    tags: string[];
    notes?: string;
}

// Local storage key
const STORAGE_KEY = "analytics-bookmarks";

interface UseBookmarksReturn {
    bookmarks: BookmarkedInsight[];
    addBookmark: (insight: Omit<BookmarkedInsight, "id" | "timestamp">) => void;
    removeBookmark: (id: string) => void;
    updateBookmark: (id: string, updates: Partial<BookmarkedInsight>) => void;
    getBookmarksByTag: (tag: string) => BookmarkedInsight[];
    getAllTags: () => string[];
    clearAllBookmarks: () => void;
    exportBookmarks: () => string;
    importBookmarks: (jsonStr: string) => boolean;
}

export function useBookmarks(): UseBookmarksReturn {
    const [bookmarks, setBookmarks] = useState<BookmarkedInsight[]>([]);

    // Load bookmarks from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Convert timestamp strings back to Date objects
                const withDates = parsed.map((b: BookmarkedInsight) => ({
                    ...b,
                    timestamp: new Date(b.timestamp)
                }));
                setBookmarks(withDates);
            }
        } catch (error) {
            console.error("Failed to load bookmarks:", error);
        }
    }, []);

    // Save bookmarks to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
        } catch (error) {
            console.error("Failed to save bookmarks:", error);
        }
    }, [bookmarks]);

    const addBookmark = useCallback((insight: Omit<BookmarkedInsight, "id" | "timestamp">) => {
        const newBookmark: BookmarkedInsight = {
            ...insight,
            id: `bm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date()
        };
        setBookmarks(prev => [newBookmark, ...prev]);
    }, []);

    const removeBookmark = useCallback((id: string) => {
        setBookmarks(prev => prev.filter(b => b.id !== id));
    }, []);

    const updateBookmark = useCallback((id: string, updates: Partial<BookmarkedInsight>) => {
        setBookmarks(prev => prev.map(b =>
            b.id === id ? { ...b, ...updates } : b
        ));
    }, []);

    const getBookmarksByTag = useCallback((tag: string) => {
        return bookmarks.filter(b => b.tags.includes(tag));
    }, [bookmarks]);

    const getAllTags = useCallback(() => {
        const tagSet = new Set<string>();
        bookmarks.forEach(b => b.tags.forEach(t => tagSet.add(t)));
        return Array.from(tagSet).sort();
    }, [bookmarks]);

    const clearAllBookmarks = useCallback(() => {
        setBookmarks([]);
    }, []);

    const exportBookmarks = useCallback(() => {
        return JSON.stringify(bookmarks, null, 2);
    }, [bookmarks]);

    const importBookmarks = useCallback((jsonStr: string): boolean => {
        try {
            const parsed = JSON.parse(jsonStr);
            if (Array.isArray(parsed)) {
                const withDates = parsed.map((b: BookmarkedInsight) => ({
                    ...b,
                    timestamp: new Date(b.timestamp)
                }));
                setBookmarks(prev => [...withDates, ...prev]);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    return {
        bookmarks,
        addBookmark,
        removeBookmark,
        updateBookmark,
        getBookmarksByTag,
        getAllTags,
        clearAllBookmarks,
        exportBookmarks,
        importBookmarks
    };
}
