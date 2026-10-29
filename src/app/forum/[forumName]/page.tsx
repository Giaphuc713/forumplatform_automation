'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Plus, MoreHorizontal, Search, FileText, Users, Loader2, AlertCircle, Check, Bell } from 'lucide-react';
import { forumService } from '@/services/forum.service';
import { Post, Forum } from '@/types/forum';
import { ForumPostItem } from '@/components/forum/ForumPostItem';
import { RightSideBarDetail } from '@/components/forum/RightSideBarDetail';
import { useSearch } from '@/contexts/SearchContext';
import Link from 'next/link';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
const PAGE_SIZE = 10;
const CURRENT_USER_ID = Number(Cookies.get("current_user"));

export default function ForumDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const forumName = decodeURIComponent(params.forumName as string);
    const forumId = Number(searchParams.get('forumId'));
    const focusPostId = searchParams.get('focusPost') ? Number(searchParams.get('focusPost')) : null;
    const focusCommentId = searchParams.get('focusComment') ? Number(searchParams.get('focusComment')) : null;

    const [focusedPost, setFocusedPost] = useState<Post | null>(null);
    const [focusLoading, setFocusLoading] = useState(false);

    useEffect(() => {
        if (!focusPostId) return;
        setFocusLoading(true);
        forumService.getPostById(focusPostId, CURRENT_USER_ID)
            .then(setFocusedPost)
            .catch(console.error)
            .finally(() => setFocusLoading(false));
    }, [focusPostId]);

    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { searchQuery } = useSearch();

    // Join state
    const [isJoined, setIsJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [membersCount, setMembersCount] = useState(0);
    const [showNotification, setShowNotification] = useState(false);

    const observerTarget = useRef<HTMLDivElement>(null);
    const hasMore = page < totalPages - 1;
    const [forum, setForum] = useState<Forum | null>(null);

    useEffect(() => {
        const fetchForumAndMembership = async () => {
            try {
                const [forumData, membersData] = await Promise.all([
                    forumService.getForumById(forumId, CURRENT_USER_ID),
                    forumService.getForumMembers(forumId)
                ]);
                setForum(forumData);
                const memberList = Array.isArray(membersData) ? membersData : (membersData as any)?.result ?? [];
                setMembersCount(memberList.length);

                const isMember = memberList.some((m: any) => m.id === CURRENT_USER_ID);
                setIsJoined(isMember);
                if (isMember) setShowNotification(true);

            } catch (err) {
                console.error('Error fetching forum details:', err);
            }
        };

        fetchForumAndMembership();
    }, [forumId]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            setError(null);

            try {
                if (searchQuery.trim()) {
                    const { posts, totalPages, totalElements } = await forumService.searchPosts(searchQuery.trim(), 0, 10);
                    const filtered = posts.filter(p => p.forumId === forumId);
                    setPosts(filtered);
                    setTotalPages(totalPages);
                    setTotalElements(totalElements);
                } else {
                    const { posts: fetched, totalPages: tp, totalElements: te } =
                        await forumService.getForumPosts(forumId, CURRENT_USER_ID, 0, PAGE_SIZE);
                    setPosts(fetched);
                    setTotalPages(tp);
                    setTotalElements(te);
                }
                setPage(0);
            } catch (err) {
                console.error('Error fetching forum posts:', err);
                setError('Failed to load posts. Please try again.');
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [forumId, searchQuery]);

    // Handle join forum
    const handleJoinForum = async () => {
        if (isJoining) return;
        setIsJoining(true);
        try {
            if (isJoined) {
                await forumService.leaveForum(forumId, CURRENT_USER_ID);
                setIsJoined(false);
                setShowNotification(false);
                setMembersCount((prev) => Math.max(0, prev - 1));
                toast.success('Bạn đã rời khỏi diễn đàn');
            } else {
                await forumService.joinForum(forumId, CURRENT_USER_ID, "", ""); // default message and invitation code
                setIsJoined(true);
                setShowNotification(true);
                setMembersCount((prev) => prev + 1);
                toast.success('Bạn đã tham gia diễn đàn thành công');
            }
        } catch (err) {
            console.error('Error joining/leaving forum:', err);
            toast.error('Action failed. Please try again.');
        } finally {
            setIsJoining(false);
        }
    };
    // Load more
    const loadMore = useCallback(async () => {
        if (fetchingMore || !hasMore || searchQuery.trim()) return;
        setFetchingMore(true);
        try {
            const nextPage = page + 1;
            const { posts: more, totalPages: tp } = await forumService.getForumPosts(
                forumId,
                CURRENT_USER_ID,
                nextPage,
                PAGE_SIZE
            );
            setPosts((prev) => [...prev, ...more]);
            setPage(nextPage);
            setTotalPages(tp);
        } catch (err) {
            console.error('Error loading more:', err);
        } finally {
            setFetchingMore(false);
        }
    }, [fetchingMore, hasMore, page, forumId, searchQuery]);

    // Intersection observer for infinite scroll
    useEffect(() => {
        const target = observerTarget.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !fetchingMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(target);
        return () => observer.unobserve(target);
    }, [hasMore, fetchingMore, loading, loadMore]);

    const handleRemovePost = (postId: number) => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setTotalElements((prev) => prev - 1);
    };

    const handleUpdatePost = (updated: Post) => {
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    };

    const bannerColor = '#adafb15e';
    return (
        <div className="h-full flex">
            {/* ── Main content column ── */}
            <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-2xl mx-auto w-full">

                    {/* ── FORUM BANNER ── */}
                    <div className="bg-white border border-[#ccc] rounded-xl overflow-hidden mb-6 shadow-sm">
                        {/* Cover strip */}
                        <div className="h-24 relative" style={{ backgroundColor: bannerColor }}>
                            <div className="absolute inset-0 bg-gradient-to-br opacity-80" />
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage:
                                        'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)',
                                }}
                            />
                        </div>

                        <div className="px-5 pb-4">
                            {/* Avatar + Actions row */}
                            <div className="flex items-end justify-between -mt-7 mb-3">
                                <div
                                    className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-md shrink-0 relative z-10 bg-white"
                                    style={{ backgroundColor: bannerColor }}
                                >
                                    <img src={forum?.avatarUrl} alt={forumName} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex items-center gap-2 mt-8">
                                    <Link
                                        href={`/forum/submit?forumId=${forumId}`}
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-400 text-sm rounded-full font-semibold hover:bg-gray-100 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Post
                                    </Link>
                                    {isJoined && (
                                        <button className="relative p-1.5 rounded-full border-gray-400 border bg-white hover:bg-gray-100 transition-colors">
                                            <Bell className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleJoinForum}
                                        disabled={isJoining}
                                        className={`
                                                    flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-full font-semibold transition-all duration-200
                                                    ${isJoining ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                                                    ${isJoined
                                                ? 'bg-white border border-gray-400 text-gray-800 hover:bg-gray-100'
                                                : 'bg-blue-600 border border-blue-600 text-white hover:bg-blue-700'
                                            }
                                                `}
                                    >
                                        {isJoined ? 'Joined' : 'Join'}
                                    </button>

                                    <button className="p-1.5 rounded-full border border-[#edeff1] hover:bg-[#f6f7f8] transition-colors">
                                        <MoreHorizontal className="w-5 h-5 text-[#878a8c]" />
                                    </button>
                                </div>
                            </div>

                            {/* Title + stats */}
                            <h1 className="text-xl font-bold text-[#1c1c1c] leading-tight">{forumName}</h1>
                            <div className="flex items-center gap-4 mt-1 text-xs text-[#878a8c]">
                                <span className="flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5" />
                                    {loading ? '—' : (posts.length === 0 ? 0 : totalElements.toLocaleString())} posts
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" />
                                    {membersCount > 0 ? `${membersCount.toLocaleString()} members` : 'Private forum'}
                                </span>
                            </div>

                            {/* Search bar */}

                        </div>
                    </div>
                    {focusPostId ? (
                        focusLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-6 h-6 animate-spin text-[#0079d3]" />
                            </div>
                        ) : focusedPost ? (
                            <ForumPostItem
                                post={focusedPost}
                                hideJoinButton={true}
                                autoOpenComments={true}
                                highlightCommentId={focusCommentId ?? undefined}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 gap-2 text-[#878a8c]">
                                <AlertCircle className="w-10 h-10 opacity-30" />
                                <p className="text-sm font-medium">Post not found.</p>
                            </div>
                        )
                    ) : posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-2 text-[#878a8c]">
                            <FileText className="w-10 h-10 opacity-30" />
                            <p className="text-sm font-medium">No posts yet in this forum.</p>
                            <p className="text-xs">Be the first to start a discussion!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {posts.map((post) => (
                                <ForumPostItem
                                    key={post.id}
                                    post={post}
                                    onDelete={handleRemovePost}
                                    onUpdate={handleUpdatePost}
                                    hideJoinButton={true}
                                />
                            ))}
                        </div>
                    )}

                    {/* Infinite scroll sentinel — hidden in focus mode */}
                    {!focusPostId && (
                        <div ref={observerTarget} className="flex justify-center py-6">
                            {fetchingMore && (
                                <Loader2 className="w-6 h-6 animate-spin text-[#0079d3]" />
                            )}
                            {!hasMore && posts.length > 0 && !loading && (
                                <p className="text-xs text-[#878a8c]">You&#39;ve seen all posts.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar */}
            <aside className="w-80 p-4 overflow-auto border-l border-[#EDEFF1] bg-white hidden lg:block">
                <div className="sticky top-0">
                    <RightSideBarDetail forumId={forumId} />
                </div>
            </aside>
        </div>
    );
}