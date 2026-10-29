"use client";

import { Post } from "@/types/forum";
import { useState, useEffect } from "react";
import { forumService } from "@/services/forum.service";
import Link from "next/link";
import { formatForumDate } from "./formatForumDate";
import Cookies from "js-cookie";
import Image from "next/image";

const CURRENT_USER_ID = Number(Cookies.get("current_user"));
const CLEARED_AT_KEY = "rightSidebar_clearedAt";

export default function RightSidebar() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForums = async () => {
            try {
                const response = await forumService.getPostsByStudentId(CURRENT_USER_ID, 0, 5);
                const clearedAt = sessionStorage.getItem(CLEARED_AT_KEY);
                const filtered = clearedAt
                    ? response.filter((p) => new Date(p.createdAt) > new Date(clearedAt))
                    : response;
                setPosts(filtered);
            } catch (error) {
                console.error("Error fetching forums:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchForums();
    }, []);

    const handleClear = () => {
        sessionStorage.setItem(CLEARED_AT_KEY, new Date().toISOString());
        setPosts([]);
    };

    if (loading || posts.length === 0) return null;

    return (
        <aside className="w-full rounded-md border border-[#EDEFF1] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-[#EDEFF1] bg-[#F8F9FA]">
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#878A8C]">
                    Recent Posts
                </h2>
                <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs font-bold text-[#0079D3] hover:text-[#006BBD] hover:underline transition-colors"
                >
                    Clear
                </button>
            </div>

            {/* Post list */}
            <div className="divide-y divide-[#EDEFF1]">
                {posts.map((post) => (
                    <article
                        key={post.id}
                        className="flex items-start gap-3 p-3 bg-white hover:bg-[#F6F7F8] transition-colors cursor-pointer"
                    >
                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                            {/* Forum meta */}
                            <div className="flex items-center gap-1.5 min-w-0">
                                {post.forumAvatarUrl ? (
                                    <img
                                        src={post.forumAvatarUrl}
                                        alt=""
                                        className="w-7 h-7 shrink-0 rounded-full border border-[#EDEFF1] object-cover"
                                    />
                                ) : (
                                    <div className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-[#FF4500] to-[#FF6534]" aria-hidden />
                                )}
                                <Link
                                    href={`/forum/${encodeURIComponent(post.forumName)}?forumId=${post.forumId}`}
                                    className="text-[11px] font-semibold text-[#1C1C1C] hover:underline truncate"
                                >
                                    c/{post.forumName}
                                </Link>
                                <span className="text-[#878A8C] text-[11px] shrink-0">·</span>
                                <time className="text-[11px] text-[#878A8C] shrink-0" dateTime={post.createdAt}>
                                    {formatForumDate(post.createdAt)}
                                </time>
                            </div>

                            {/* Post content preview */}
                            <div
                                className="line-clamp-2 text-xs leading-relaxed text-[#1C1C1C] font-medium post-rich-content"
                                title={post.content}
                                dangerouslySetInnerHTML={{ __html: post.content.trim() }}
                            />

                            {/* Engagement stats */}
                            <div className="flex items-center gap-2 text-[11px] text-[#878A8C]">
                                <span>{post.likesCount.toLocaleString()} {post.likesCount === 1 ? "upvote" : "upvotes"}</span>
                                <span>·</span>
                                <span>{post.commentsCount.toLocaleString()} {post.commentsCount === 1 ? "comment" : "comments"}</span>
                            </div>
                        </div>

                        {/* Thumbnail */}
                        {post.imageUrl && (
                            <img
                                src={post.imageUrl}
                                alt=""
                                className="w-16 h-16 shrink-0 rounded-md object-cover border border-[#EDEFF1]"
                            />
                        )}
                    </article>
                ))}
            </div>
        </aside>
    );
}
