'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ApiComment } from '@/types/forum';
import { forumService } from '@/services/forum.service';
import { Send, MessageSquare, MoreHorizontal, Flag, Bookmark, Pencil, Trash2, ArrowBigUp, ArrowBigDown } from 'lucide-react';
import Cookies from "js-cookie";
import { toast } from 'sonner';
const CURRENT_USER_ID = Number(Cookies.get("current_user"));

interface ForumCommentProps {
    postId: number;
    highlightCommentId?: number;
}
interface CommentInputFormProps {
    initialValue?: string;
    placeholder?: string;
    submitLabel?: string;
    onCancel?: () => void;
    onSubmit: (content: string) => Promise<void>;
    autoFocus?: boolean;
}


function timeAgo(dateString: string | null): string {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'vừa xong';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;
    return `${Math.floor(months / 12)} năm trước`;
}

function CommentSkeleton() {
    return (
        <div className="flex gap-2 animate-pulse">
            <div className="w-7 h-7 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
        </div>
    );
}
function CommentInputForm({
    initialValue = '',
    placeholder = "Bạn đang nghĩ gì?",
    submitLabel = "Bình luận",
    onCancel,
    onSubmit,
    autoFocus = false
}: CommentInputFormProps) {
    const [content, setContent] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content);
            if (!initialValue) setContent('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 border border-gray-300 rounded-2xl p-3 bg-white focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500 transition-all shadow-sm w-full"
        >
            <textarea
                autoFocus={autoFocus}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-sm focus:outline-none resize-none min-h-[20px] max-h-[150px] overflow-y-auto placeholder:text-gray-400"
                rows={1}
                disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2 items-center mt-1">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-4 py-1.5 text-[13px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    className="px-4 py-1.5 text-[13px] font-bold text-white bg-[#0045B8] hover:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed rounded-full transition-colors flex items-center justify-center min-w-[80px]"
                >
                    {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        submitLabel
                    )}
                </button>
            </div>
        </form>
    );
}

// Single comment item with nested replies (Reddit-style)
function CommentItem({ comment, depth = 0, postId, onReplyAdded, highlightCommentId }: {
    comment: ApiComment;
    depth?: number;
    postId: number;
    onReplyAdded: (parentId: number, reply: ApiComment) => void;
    highlightCommentId?: number;
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const commentRef = useRef<HTMLDivElement>(null);

    const isOwner = comment.authorId === CURRENT_USER_ID;
    const isTarget = highlightCommentId === comment.id;

    useEffect(() => {
        if (!isTarget || !commentRef.current) return;
        setTimeout(() => {
            commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setIsHighlighted(true);
            setTimeout(() => setIsHighlighted(false), 2500);
        }, 300);
    }, [isTarget]);

    // Đóng menu khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const handleSaveEdit = async () => {
        if (!editContent.trim()) return;
        try {
            await forumService.updateComment(comment.id, comment.authorId, editContent.trim());
            comment.content = editContent.trim();
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating comment:', error);
            toast.error('Lỗi cập nhật bình luận');
        }
    };

    const handleDelete = async () => {
        try {
            await forumService.deleteComment(comment.id, comment.authorId);
            setIsDeleted(true);
            toast.success('Delete comment successfully');
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Error deleting comment');
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    if (isDeleted) return null;
    const isNested = depth > 0;
    return (
        <div ref={commentRef} className={`group relative ${isNested ? "ml-12 mt-4" : ""}`}>
            {showDeleteConfirm && createPortal(
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setShowDeleteConfirm(false)}
                >
                    <div
                        className="relative w-full max-w-sm mx-4 rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <Trash2 className="h-7 w-7 text-gray-600" />
                        </div>
                        <h3 className="text-center text-lg font-bold text-gray-900">
                            Bạn có muốn xóa bình luận này?
                        </h3>
                        <p className="mt-2 text-center text-sm text-gray-500 leading-relaxed">
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:scale-[0.98]"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 rounded-xl bg-gray-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700 active:scale-[0.98]"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            <div
                className={`flex gap-3 relative rounded-lg transition-colors duration-700 ${isMenuOpen ? 'z-50' : 'z-0'} ${isHighlighted ? 'bg-blue-100 ring-2 ring-blue-300' : ''}`}
            >

                {/* Avatar */}
                <div className="w-6 h-6 shrink-0 relative flex items-center justify-center bg-[#eaedef] text-gray-700 font-bold rounded-full overflow-hidden">
                    <img src={comment.authorAvatarUrl} alt={comment.authorName} className="h-6 w-6 rounded-full object-cover" />
                </div>

                {/* Comment content */}
                <div className="flex-1 min-w-0">

                    {/* Header: Author, timestamp, and menu */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs text-gray-900 hover:underline cursor-pointer">
                            {comment.authorName}
                        </span>
                        {isOwner && (
                            <span className="text-[10px] font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded-full">OP</span>
                        )}
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{timeAgo(comment.createdAt)}</span>

                        {/* More menu */}
                        <div className="ml-auto relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${isMenuOpen ? 'bg-gray-100 opacity-100' : 'opacity-0 group-hover:opacity-100 hover:bg-gray-100'}`}
                            >
                                <MoreHorizontal className="w-4 h-4 text-gray-600" />
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-[99] animate-in fade-in zoom-in-95 duration-100">
                                    {isOwner && (
                                        <>
                                            <button
                                                onClick={() => { setIsMenuOpen(false); setIsEditing(true); }}
                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4 text-blue-600" />
                                                <span className="text-gray-700">Edit Comment</span>
                                            </button>
                                            <button
                                                onClick={() => { setIsMenuOpen(false); setShowDeleteConfirm(true); }}
                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Delete Comment</span>
                                            </button>
                                            <div className="h-[1px] bg-gray-100 my-1" />
                                        </>
                                    )}
                                    <button onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors">
                                        <Bookmark className="w-4 h-4 text-gray-500" />
                                        <span>Save Comment</span>
                                    </button>
                                    <button onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors">
                                        <Flag className="w-4 h-4 text-amber-500" />
                                        <span>Report Comment</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comment text / Edit Box */}
                    {isEditing ? (
                        <div className="mb-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black min-h-[20px]"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSaveEdit} className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors">
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-[15px] text-gray-900 mb-1 whitespace-pre-line leading-relaxed">
                            {comment.content}
                        </p>
                    )}

                    {/* Action buttons (Like / Reply) */}
                    {!isEditing && (
                        <div className="flex items-center gap-4 mt-1">
                            <button className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                                Like
                            </button>
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className={`text-xs font-semibold transition-colors ${isReplying ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Reply
                            </button>
                        </div>
                    )}

                    {/* Inline reply form */}
                    {isReplying && (
                        <div className="mt-2">
                            <CommentInputForm
                                placeholder={`Trả lời ${comment.authorName}...`}
                                submitLabel="Reply"
                                autoFocus
                                onCancel={() => setIsReplying(false)}
                                onSubmit={async (replyContent) => {
                                    const newReply = await forumService.createComment({
                                        postId,
                                        studentId: CURRENT_USER_ID,
                                        content: replyContent.trim(),
                                        parentId: comment.id,
                                    });
                                    onReplyAdded(comment.id, newReply);
                                    setIsReplying(false);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Nested replies — propagate highlightCommentId at every depth */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="space-y-4">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            depth={depth + 1}
                            postId={postId}
                            onReplyAdded={onReplyAdded}
                            highlightCommentId={highlightCommentId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function ForumComment({ postId, highlightCommentId }: ForumCommentProps) {
    const [comments, setComments] = useState<ApiComment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            try {
                const data = await forumService.getComments(postId);
                setComments(data);
            } catch (err) {
                console.error('Error fetching comments:', err);
                setComments([]);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [postId]);

    const handleReplyAdded = (parentId: number, reply: ApiComment) => {
        const insertReply = (list: ApiComment[]): ApiComment[] =>
            list.map((c) => {
                if (c.id === parentId) {
                    return { ...c, replies: [...(c.replies || []), reply] };
                }
                if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: insertReply(c.replies) };
                }
                return c;
            });
        setComments((prev) => insertReply(prev));
    };

    const handleTopLevelSubmit = async (commentContent: string) => {
        const newComment = await forumService.createComment({
            postId: postId,
            studentId: CURRENT_USER_ID,
            content: commentContent.trim(),
        });
        setComments((prev) => [newComment, ...prev]);
    };

    return (
        <div className="flex flex-col gap-4">
            <CommentInputForm
                placeholder="Bạn đang nghĩ gì?"
                submitLabel="Bình luận"
                onSubmit={handleTopLevelSubmit}
            />

            <div className="flex flex-col gap-3 mt-2">
                {loading ? (
                    <>
                        <CommentSkeleton />
                        <CommentSkeleton />
                    </>
                ) : comments.length === 0 ? (
                    <div className="text-center py-4">
                        <MessageSquare className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                        <p className="text-sm text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            postId={postId}
                            onReplyAdded={handleReplyAdded}
                            highlightCommentId={highlightCommentId}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
