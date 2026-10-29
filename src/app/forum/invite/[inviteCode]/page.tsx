'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Lock, Users, Loader2, AlertCircle, FileText, LogIn, X, Check
} from 'lucide-react';
import { forumService } from '@/services/forum.service';
import { Forum } from '@/types/forum';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import Link from 'next/link';

const bannerColor = '#adafb15e';

export default function InvitePage() {
    const { inviteCode } = useParams() as { inviteCode: string };
    const router = useRouter();

    const [forum, setForum] = useState<Forum | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMember, setIsMember] = useState(false);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const isLoggedIn = !!Cookies.get('access_token');
    const currentUserId = Number(Cookies.get('current_user'));

    useEffect(() => {
        forumService
            .getForumInforByInviteCode(inviteCode)
            .then(setForum)
            .catch(() => setError('This invite link is invalid or has expired.'))
            .finally(() => setLoading(false));
    }, [inviteCode]);

    const isPending =
        forum !== null &&
        JSON.parse(
            typeof window !== 'undefined'
                ? localStorage.getItem('pendingForumRequests') || '[]'
                : '[]',
        ).includes(forum.id);

    const isRequestPending = submitted || isPending;

    const checkMembership = useCallback(() => {
        if (!forum || !isLoggedIn) return;
        forumService
            .getForumMembers(forum.id)
            .then((members) => {
                const list = Array.isArray(members) ? members : (members as any)?.result ?? [];
                setIsMember(list.some((m: any) => m.id === currentUserId));
            })
            .catch(console.error);
    }, [forum, isLoggedIn, currentUserId]);

    useEffect(() => {
        checkMembership();
    }, [checkMembership]);

    // Poll every 10s while pending so the user is redirected as soon as the owner approves
    useEffect(() => {
        if (!isRequestPending || isMember || !isLoggedIn || !forum) return;
        const id = setInterval(checkMembership, 10_000);
        return () => clearInterval(id);
    }, [isRequestPending, isMember, isLoggedIn, forum, checkMembership]);

    useEffect(() => {
        if (isMember && forum) {
            router.replace(`/forum/${encodeURIComponent(forum.name)}?forumId=${forum.id}`);
        }
    }, [isMember, forum, router]);

    const handleSubmitRequest = async () => {
        if (!forum || submitting) return;
        setSubmitting(true);
        try {
            await forumService.joinForum(forum.id, currentUserId, message, inviteCode);
            const pending: number[] = JSON.parse(localStorage.getItem('pendingForumRequests') || '[]');
            if (!pending.includes(forum.id)) {
                localStorage.setItem('pendingForumRequests', JSON.stringify([...pending, forum.id]));
            }
            setSubmitted(true);
            setShowModal(false);
            toast.success('Your request to join has been sent successfully. Please wait for the owner\'s approval.');
        } catch {
            toast.error('Failed to submit request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-full py-24">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !forum) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center px-4">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Invite Link</h2>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <Link href="/forum" className="text-blue-600 text-sm hover:underline">
                    Back to forums
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="h-full flex">
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
                                        {forum.avatarUrl ? (
                                            <img src={forum.avatarUrl} alt={forum.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xl">
                                                {forum.name[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-8">
                                        <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                                            <Lock className="w-3 h-3" /> Private
                                        </span>
                                        {!isRequestPending && isLoggedIn && (
                                            <button
                                                onClick={() => setShowModal(true)}
                                                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 border border-blue-600 text-white text-sm rounded-full font-semibold hover:bg-blue-700 transition-colors"
                                            >
                                                Request to Join
                                            </button>
                                        )}
                                        {isRequestPending && (
                                            <span className="flex items-center gap-1.5 px-4 py-1.5 bg-yellow-50 border border-yellow-300 text-yellow-700 text-sm rounded-full font-semibold">
                                                <Check className="w-3.5 h-3.5" /> Pending
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Title + stats */}
                                <h1 className="text-xl font-bold text-[#1c1c1c] leading-tight">{forum.name}</h1>
                                <div className="flex items-center gap-4 mt-1 text-xs text-[#878a8c]">
                                    <span className="flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5" />
                                        Private forum
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5" />
                                        {(forum.membersCount ?? 0).toLocaleString()} members
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── RESTRICTED ACCESS MESSAGE ── */}
                        <div className="bg-white border border-[#ccc] rounded-xl p-10 shadow-sm flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                                <Lock className="w-7 h-7 text-gray-400" />
                            </div>

                            {isRequestPending ? (
                                <>
                                    <h3 className="text-base font-bold text-gray-900">Request pending</h3>
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        The owner will review your request. You&apos;ll gain access once approved.
                                    </p>
                                    <Link
                                        href={`/forum/${encodeURIComponent(forum.name)}?forumId=${forum.id}`}
                                        className="text-blue-600 text-sm hover:underline"
                                    >
                                        View forum page →
                                    </Link>
                                </>
                            ) : !isLoggedIn ? (
                                <>
                                    <h3 className="text-base font-bold text-gray-900">Log in to request access</h3>
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        You need an account to request membership in this private community.
                                    </p>
                                    <Link
                                        href={`/login?redirect=/forum/invite/${inviteCode}`}
                                    >
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-600 max-w-xs">
                                        This is a private forum, Please send a message request to join
                                    </p>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors"
                                    >
                                        Request to Join
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* ── JOIN REQUEST MODAL ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-full border overflow-hidden bg-gray-100 shrink-0">
                                {forum.avatarUrl ? (
                                    <img src={forum.avatarUrl} alt={forum.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                                        {forum.name[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">Request to join</h3>
                                <p className="text-xs text-gray-500">{forum.name}</p>
                            </div>
                        </div>

                        <p className="text-sm text-black font-semibold mb-3">
                            This is a private community. Only approved members can view and post in this community.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-500 mb-1">
                                Request to join <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-4 text-sm text-gray-700 resize-none focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 text-sm font-semibold text-gray-700 rounded-full hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitRequest}
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
