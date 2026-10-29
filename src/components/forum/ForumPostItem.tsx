"use client";

import { useState, useRef, useEffect } from "react";
import { Post } from "@/types/forum";
import { ForumComment } from "./ForumComment";
import {
    MoreHorizontal,
    ArrowBigUp,
    ArrowBigDown,
    MessageSquare,
    Share2,
    Pencil,
    Trash2,
    Bookmark,
    Flag,
    EyeOff,
    Bell,
} from "lucide-react";
import { forumService } from "@/services/forum.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { getFlairStyle } from "@/components/ui/tags";
import { formatForumDate } from "./formatForumDate";
import Cookies from "js-cookie";
import Image from "next/image";

const CURRENT_USER_ID = Number(Cookies.get("current_user"));

interface ForumPostItemProps {
    post: Post;
    onDelete?: (postId: number) => void;
    onUpdate?: (updatedPost: Post) => void;
    hideJoinButton?: boolean;
    autoOpenComments?: boolean;
    highlightCommentId?: number;
}

export function ForumPostItem({
    post,
    onDelete,
    onUpdate,
    hideJoinButton = false,
    autoOpenComments = false,
    highlightCommentId,
}: ForumPostItemProps) {
    const router = useRouter();
    const [showComments, setShowComments] = useState(autoOpenComments);
    const articleRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (autoOpenComments && articleRef.current) {
            setTimeout(() => {
                articleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    }, [autoOpenComments]);

    const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(null);
    const [likes, setLikes] = useState(post.likesCount);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [isTruncatable, setIsTruncatable] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isVoting, setIsVoting] = useState(false);
    const isOwner = post.authorId === CURRENT_USER_ID;
    const CONTENT_MAX_HEIGHT = 240;
    const [isJoined, setIsJoined] = useState(false);

    useEffect(() => {
        if (contentRef.current) {
            setIsTruncatable(contentRef.current.scrollHeight > CONTENT_MAX_HEIGHT);
        }
    }, [post.content]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    useEffect(() => {
        if (!CURRENT_USER_ID) return;
        forumService.isStudentLikedPost(post.id, CURRENT_USER_ID)
            .then((data) => {
                const liked = data === true
                if (liked) setVoteStatus("up");
            })
            .catch(() => { });
    }, [post.id]);

    const handleUpvote = async () => {
        if (isVoting) return;
        const prevStatus = voteStatus;
        const prevLikes = likes;
        setIsVoting(true);

        const willLike = voteStatus !== "up";
        setVoteStatus(willLike ? "up" : null);
        setLikes((p) => willLike ? p + 1 : p - 1);

        try {
            const response = await forumService.toggleLikePost(post.id, CURRENT_USER_ID);
            if (response === "Liked successfully") {
                setVoteStatus("up");
            } else if (response === "Unliked successfully") {
                setVoteStatus(null);
            }
        } catch {
            setVoteStatus(prevStatus);
            setLikes(prevLikes);
        } finally {
            setIsVoting(false);
        }
    };

    const handleDownvote = async () => {
        if (isVoting) return;
        if (voteStatus === "down") { setVoteStatus(null); return; }

        const prevStatus = voteStatus;
        const prevLikes = likes;
        setIsVoting(true);

        if (prevStatus === "up") setLikes((p) => p - 1);
        setVoteStatus("down");

        try {
            const response = await forumService.toggleUnlikePost(post.id, CURRENT_USER_ID);
            if (response === "Unliked successfully" && prevStatus !== "up") {
                setLikes((p) => p - 1);
            }
        } catch {
            setVoteStatus(prevStatus);
            setLikes(prevLikes);
        } finally {
            setIsVoting(false);
        }
    };

    const confirmDelete = async () => {
        setShowDeleteConfirm(false);
        setIsDeleting(true);
        try {
            await forumService.deletePost(post.id, CURRENT_USER_ID);
            onDelete?.(post.id);
            toast.success("Post deleted successfully!");
        } catch {
            toast.error("Failed to delete post. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <article
                ref={articleRef}
                className={[
                    "group relative bg-white border rounded-md  transition-colors hover:bg-[#F6F7F8]",
                    isDeleting ? "opacity-50 pointer-events-none" : "",
                    menuOpen
                        ? "z-50 border-[#898989]"
                        : "z-0 focus-within:z-50 border-[#EDEFF1] hover:border-[#898989]",
                ].join(" ")}
            >
                <div className="flex">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0 px-2.5 py-2.5 sm:px-3">
                        {/* Post Header */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
                                <Image
                                    width={12}
                                    height={12}
                                    src={post.forumAvatarUrl || "https://i.pravatar.cc/150"}
                                    alt={post.forumName}
                                    className="w-6 h-6 rounded-full border border-[#EDEFF1] object-cover shrink-0"
                                />
                                <Link
                                    href={`/forum/${encodeURIComponent(post.forumName)}?forumId=${post.forumId}`}
                                    className="text-xs font-semibold text-[#1C1C1C] hover:underline shrink-0"
                                >
                                    c/{post.forumName}
                                </Link>
                                <span className="text-[#878A8C] text-xs">·</span>
                                <span className="text-xs text-[#878A8C]">
                                    Posted by{" "}
                                    <span className="hover:underline cursor-pointer">{post.authorName}</span>
                                </span>
                                <span className="text-[#878A8C] text-xs">·</span>
                                <time
                                    dateTime={post.createdAt}
                                    className="text-xs text-[#878A8C] hover:underline cursor-pointer shrink-0"
                                >
                                    {formatForumDate(post.createdAt)}
                                </time>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                {!hideJoinButton && (
                                    <button
                                        onClick={() => setIsJoined((p) => !p)}
                                        className={[
                                            "text-xs font-bold rounded-full px-3 py-1 border transition-colors",
                                            isJoined
                                                ? "bg-white border border-gray-400 text-gray-800 hover:bg-gray-100"
                                                : "bg-blue-600 border border-blue-600 text-white hover:bg-blue-700",
                                        ].join(" ")}
                                    >
                                        {isJoined ? "Joined" : "Join"}
                                    </button>
                                )}

                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setMenuOpen((p) => !p)}
                                        aria-label="More options"
                                        data-testid={`menu-post-${post.id}`}
                                        className={[
                                            "relative rounded-full p-1.5 transition-colors",
                                            menuOpen
                                                ? "z-50 bg-[#EDEFF1] text-[#1C1C1C]"
                                                : "z-0 text-[#878A8C] hover:bg-[#EDEFF1] hover:text-[#1C1C1C]",
                                        ].join(" ")}
                                    >
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>

                                    {menuOpen && (
                                        <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.12),0_8px_24px_rgba(0,0,0,0.08)] border border-[#EDEFF1] py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                                            <MenuItem icon={<Bell className="h-4 w-4" />} label="Follow post" onClick={() => setMenuOpen(false)} />
                                            <MenuItem icon={<Bookmark className="h-4 w-4" />} label="Save" onClick={() => setMenuOpen(false)} />
                                            <MenuItem icon={<EyeOff className="h-4 w-4" />} label="Hide" onClick={() => setMenuOpen(false)} />
                                            <MenuItem icon={<Flag className="h-4 w-4" />} label="Report" onClick={() => setMenuOpen(false)} />
                                            {isOwner && (
                                                <>
                                                    <div className="my-1 border-t border-[#EDEFF1]" />
                                                    <MenuItem
                                                        icon={<Pencil className="h-4 w-4" />}
                                                        label="Edit Post"
                                                        onClick={() => {
                                                            setMenuOpen(false);
                                                            router.push(`/forum/submit?postId=${post.id}`);
                                                        }}
                                                    />
                                                    <MenuItem
                                                        icon={<Trash2 className="h-4 w-4" />}
                                                        label="Delete Post"

                                                        onClick={() => { setMenuOpen(false); setShowDeleteConfirm(true); }}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="mt-2 text-[18px] font-medium text-[#1C1C1C] leading-[22px]">
                            {post.title}
                        </h2>

                        {/* Flair */}
                        {post.tags && post.tags !== "No tag" && (
                            <div className="mt-1.5">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getFlairStyle(post.tags)}`}>
                                    {post.tags}
                                </span>
                            </div>
                        )}

                        {/* Content */}
                        {post.content && (
                            <div className="relative mt-2">
                                <div
                                    ref={contentRef}
                                    className="text-sm text-[#3C3C3C] leading-relaxed post-rich-content overflow-hidden transition-[max-height] duration-300 ease-in-out"
                                    style={{
                                        maxHeight: expanded
                                            ? `${contentRef.current?.scrollHeight ?? 9999}px`
                                            : `${CONTENT_MAX_HEIGHT}px`,
                                    }}
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                                {isTruncatable && !expanded && (
                                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent flex items-end justify-center pb-1">
                                        <button
                                            onClick={() => setExpanded(true)}
                                            className="text-xs font-semibold text-[#0079D3] hover:underline"
                                        >
                                            View more
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Image */}
                        {post.imageUrl && (
                            <div className="mt-3 overflow-hidden rounded-md bg-[#0D1117] border border-[#EDEFF1] flex justify-center max-h-[512px]">
                                <img
                                    src={post.imageUrl}
                                    alt="Post media"
                                    className="object-contain w-full max-h-[512px]"
                                />
                            </div>
                        )}

                        {/* Action Bar */}
                        <div className="mt-2.5 flex items-center gap-0.5 text-[#878A8C]">
                            {/* Vote Pill */}
                            <div className="flex items-center rounded-full bg-[#F8F9FA] hover:bg-[#EDEFF1] transition-colors mr-0.5 ">
                                <button
                                    onClick={handleUpvote}
                                    disabled={isVoting}
                                    aria-label="Upvote"
                                    className={[
                                        "flex items-center px-1 py-1.5 rounded-l-full text-xs font-bold transition-colors",
                                        voteStatus === "up"
                                            ? "text-[#FF4500]"
                                            : "text-[#878A8C] hover:text-[#FF4500]",
                                    ].join(" ")}
                                >
                                    <ArrowBigUp className="h-4 w-4" strokeWidth={1.5} />
                                </button>
                                <span className={[
                                    "leading-none select-none text-xs font-bold text-center",
                                    voteStatus === "up"
                                        ? "text-[#FF4500]"
                                        : voteStatus === "down"
                                            ? "text-[#7193FF]"
                                            : "text-[#1C1C1C]",
                                ].join(" ")}>
                                    {likes}
                                </span>
                                <button
                                    onClick={handleDownvote}
                                    disabled={isVoting}
                                    aria-label="Downvote"
                                    className={[
                                        "px-1 py-1.5 rounded-r-full transition-colors",
                                        voteStatus === "down"
                                            ? "text-[#7193FF]"
                                            : "text-[#878A8C] hover:text-[#7193FF]",
                                    ].join(" ")}
                                >
                                    <ArrowBigDown className="h-4 w-4" strokeWidth={1.5} />
                                </button>
                            </div>
                            <ActionBtn
                                onClick={() => setShowComments((p) => !p)}
                                icon={<MessageSquare className="h-4 w-4" />}
                                label={`${post.commentsCount} Comments`}
                            />
                            <ActionBtn
                                icon={<Share2 className="h-4 w-4" />}
                                label="Share"
                            />

                        </div>
                    </div>
                </div>

                {/* Comments */}
                {showComments && (
                    <div className="border-t border-[#EDEFF1] bg-[#F8F9FA] p-4">
                        <ForumComment postId={post.id} highlightCommentId={highlightCommentId} />
                    </div>
                )}
            </article>

            {/* Delete Modal */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowDeleteConfirm(false)}
                >
                    <div
                        className="relative w-full max-w-sm mx-4 rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                            <Trash2 className="h-7 w-7 text-gray-600" />
                        </div>
                        <h3 className="text-center text-lg font-bold text-[#1C1C1C]">Delete post?</h3>
                        <p className="mt-2 text-center text-sm text-[#878A8C] leading-relaxed">
                            This action cannot be undone. The post and all comments will be permanently deleted.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 rounded-full border border-[#0079D3] bg-white px-4 py-2 text-sm font-bold text-[#0079D3] transition-colors hover:bg-[#E8F0FE]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 rounded-full bg-gray-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function MenuItem({
    icon,
    label,
    labelClass = "text-[#1C1C1C]",
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    labelClass?: string;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#878A8C] hover:bg-[#F6F7F8] transition-colors"
        >
            {icon}
            <span className={labelClass}>{label}</span>
        </button>
    );
}

function ActionBtn({
    icon,
    label,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 rounded px-2 py-1.5 text-xs font-bold text-[#878A8C] hover:bg-[#EDEFF1] hover:text-[#1C1C1C] transition-colors"
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
