'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePosts, FilterMode } from '@/hooks/usePosts';
import { useSearch } from '@/contexts/SearchContext';
import { ForumPostItem } from './ForumPostItem';

export function ForumPost() {
    const { searchQuery } = useSearch();
    const [sortBy, setSortBy] = useState<FilterMode>('best');
    const [tagInput, setTagInput] = useState('');
    const [activeTag, setActiveTag] = useState('');
    const { posts, loading, fetchingMore, hasMore, loadMore, refetch, removePost, updatePost } =
        usePosts(searchQuery, sortBy, activeTag);
    const observerTarget = useRef<HTMLDivElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const tagInputRef = useRef<HTMLInputElement>(null);

    const sortOptions: { id: FilterMode; label: string }[] = [
        { id: 'best', label: 'Best' },
        { id: 'tag', label: 'Tag' },
        { id: 'trending', label: 'Trending' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const target = observerTarget.current;
        if (!target) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !fetchingMore) loadMore();
            },
            { threshold: 0.1 }
        );
        observer.observe(target);
        return () => observer.unobserve(target);
    }, [hasMore, fetchingMore, loadMore, loading]);

    useEffect(() => {
        const handlePostCreated = () => refetch();
        window.addEventListener('post-created', handlePostCreated);
        return () => window.removeEventListener('post-created', handlePostCreated);
    }, [refetch]);

    const handleSortChange = (newSort: FilterMode) => {
        setSortBy(newSort);
        setIsDropdownOpen(false);
        if (newSort !== 'tag') { setTagInput(''); setActiveTag(''); }
        if (newSort === 'tag') setTimeout(() => tagInputRef.current?.focus(), 50);
    };

    const handleTagSearch = () => {
        const trimmed = tagInput.trim();
        if (trimmed) setActiveTag(trimmed);
    };

    const isTagModeEmpty = sortBy === 'tag' && !activeTag && !searchQuery.trim();

    if (loading && !isTagModeEmpty) {
        return (
            <div className="flex justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full pb-10">
            {/* Filter bar */}
            <div className="flex items-center gap-2 px-1 flex-wrap">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={[
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors border",
                            isDropdownOpen
                                ? "bg-[#EDEFF1] border-[#EDEFF1] text-[#1C1C1C]"
                                : "bg-transparent border-transparent text-[#878A8C] hover:bg-[#EDEFF1] hover:text-[#1C1C1C]",
                        ].join(" ")}
                    >
                        {sortOptions.find(opt => opt.id === sortBy)?.label}
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.12),0_8px_24px_rgba(0,0,0,0.08)] border border-[#EDEFF1] py-1 z-10">
                            <div className="px-3 py-2 text-xs font-semibold text-[#878A8C] uppercase tracking-wider">Sort by</div>
                            {sortOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleSortChange(option.id)}
                                    className={[
                                        "w-full text-left px-3 py-2 text-sm font-medium transition-colors",
                                        sortBy === option.id
                                            ? "bg-[#EDEFF1] text-[#1C1C1C]"
                                            : "text-[#3C3C3C] hover:bg-[#F6F7F8]",
                                    ].join(" ")}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {sortBy === 'tag' && (
                    <div className="flex items-center gap-1.5">
                        <input
                            ref={tagInputRef}
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTagSearch()}
                            placeholder="Enter tag..."
                            className="h-[30px] px-3 text-sm border border-[#EDEFF1] rounded-full bg-[#F6F7F8] focus:outline-none focus:border-[#0079D3] focus:ring-1 focus:ring-[#0079D3] w-36 transition-colors"
                        />
                        <button
                            onClick={handleTagSearch}
                            disabled={!tagInput.trim()}
                            className="h-[30px] px-3 text-sm bg-[#0079D3] text-white rounded-full font-bold hover:bg-[#006BBD] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Search
                        </button>
                    </div>
                )}
            </div>

            {/* Contextual labels */}
            {searchQuery.trim() && (
                <p className="text-sm text-[#878A8C] px-1">
                    Results for{' '}
                    <span className="font-semibold text-[#1C1C1C]">&quot;{searchQuery}&quot;</span>
                    <span className="ml-1">({posts.length} posts)</span>
                </p>
            )}

            {!searchQuery.trim() && sortBy === 'tag' && activeTag && (
                <p className="text-sm text-[#878A8C] px-1">
                    Posts tagged{' '}
                    <span className="font-semibold text-[#1C1C1C]">&quot;{activeTag}&quot;</span>
                    <span className="ml-1">({posts.length} posts)</span>
                </p>
            )}

            {/* Posts */}
            {isTagModeEmpty ? (
                <div className="text-center py-16 text-[#878A8C] text-sm">
                    Enter a tag above to filter posts.
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-16 text-[#878A8C] text-sm">
                    {searchQuery.trim()
                        ? `No posts found for "${searchQuery}"`
                        : sortBy === 'tag'
                            ? `No posts found with tag "${activeTag}"`
                            : 'No posts yet.'}
                </div>
            ) : (
                posts.map((post) => (
                    <ForumPostItem key={post.id} post={post} onDelete={removePost} onUpdate={updatePost} />
                ))
            )}

            <div ref={observerTarget} className="flex justify-center py-4">
                {fetchingMore && (
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                )}
                {!hasMore && posts.length > 0 && (
                    <p className="text-sm text-[#878A8C]">You&apos;ve seen all posts.</p>
                )}
            </div>
        </div>
    );
}
