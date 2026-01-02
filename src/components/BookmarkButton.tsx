"use client";

import React, { useState } from "react";

interface BookmarkButtonProps {
    isBookmarked: boolean;
    onBookmark: () => void;
    onRemoveBookmark: () => void;
    className?: string;
}

export default function BookmarkButton({
    isBookmarked,
    onBookmark,
    onRemoveBookmark,
    className = ""
}: BookmarkButtonProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        if (isBookmarked) {
            onRemoveBookmark();
        } else {
            onBookmark();
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`p-1.5 rounded-lg transition-all duration-200 ${className} ${isBookmarked
                    ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                    : "text-gray-400 hover:text-amber-500 hover:bg-gray-50"
                } ${isAnimating ? "scale-125" : "scale-100"}`}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this insight"}
        >
            {isBookmarked ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            )}
        </button>
    );
}
