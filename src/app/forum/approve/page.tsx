'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, X, Loader2, Users, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { forumService } from '@/services/forum.service';
import { PendingInfor } from '@/types/forum';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatForumDate } from '@/components/forum/formatForumDate';
import Image from 'next/image';

export default function ApprovePage() {
    const searchParams = useSearchParams();
    const forumId = Number(searchParams.get('forumId'));
    const ownerId = Number(Cookies.get('current_user'));

    const [members, setMembers] = useState<PendingInfor[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<Record<number, 'approve' | 'reject' | null>>({});
    const [error, setError] = useState<string | null>(null);

    const fetchPending = useCallback(async () => {
        if (!forumId || !ownerId) {
            setError('Missing forum or owner information.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await forumService.getPendingMemberShip(forumId, ownerId);
            const list: PendingInfor[] = Array.isArray(data)
                ? data
                : (data?.result ?? data?.content ?? []);
            setMembers(list.filter((m) => m.status === 'PENDING'));
        } catch {
            setError('Failed to load pending requests.');
        } finally {
            setLoading(false);
        }
    }, [forumId, ownerId]);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const handleApprove = async (member: PendingInfor) => {
        setActionLoading((prev) => ({ ...prev, [member.studentId]: 'approve' }));
        try {
            await forumService.approveJoinRequest(forumId, member.studentId, ownerId);
            setMembers((prev) => prev.filter((m) => m.studentId !== member.studentId));
            toast.success(`${member.fullName} has been approved.`);
        } catch {
            toast.error(`Failed to approve ${member.fullName}.`);
        } finally {
            setActionLoading((prev) => ({ ...prev, [member.studentId]: null }));
        }
    };

    const handleReject = async (member: PendingInfor) => {
        setActionLoading((prev) => ({ ...prev, [member.studentId]: 'reject' }));
        try {
            await forumService.rejectJoinRequest(forumId, member.studentId, ownerId);
            setMembers((prev) => prev.filter((m) => m.studentId !== member.studentId));
            toast.success(`${member.fullName}'s request has been declined.`);
        } catch {
            toast.error(`Failed to decline ${member.fullName}.`);
        } finally {
            setActionLoading((prev) => ({ ...prev, [member.studentId]: null }));
        }
    };

    if (!forumId) {
        return (
            <div className="max-w-2xl mx-auto mt-20 text-center px-4">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Forum Selected</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Please navigate here from your private forum&apos;s management panel.
                </p>
                <Link href="/forum" className="text-blue-600 text-sm hover:underline">
                    Back to forums
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-7 w-full">
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-[#1c1c1c]">Membership Requests</h1>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">{error}</p>
                    <button
                        onClick={fetchPending}
                        className="mt-4 text-sm text-blue-600 hover:underline"
                    >
                        Try again
                    </button>
                </div>
            ) : members.length === 0 ? (
                <div className="text-center py-20">
                    <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-base font-semibold text-gray-700">No pending requests</p>
                    <p className="text-sm text-gray-400 mt-1">
                        All caught up — no one is waiting for approval.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {members.map((member) => {
                            const busy = actionLoading[member.studentId];
                            return (
                                <div
                                    key={member.studentId}
                                    className="bg-white border border-[#EDEFF1] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {/* Card body */}
                                    <div className="p-4 flex gap-3">
                                        {/* Avatar */}
                                        <div className="shrink-0">
                                            {member.avatarUrl ? (
                                                <Image
                                                    src={member.avatarUrl}
                                                    alt={member.fullName}
                                                    className="w-14 h-14 rounded-full object-cover border border-[#EDEFF1]"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl">
                                                    {member.fullName?.[0]?.toUpperCase() ?? '?'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-[#1c1c1c] text-sm leading-tight truncate">
                                                {member.fullName}
                                            </p>
                                            <p className="text-xs text-[#878a8c] truncate mt-0.5">
                                                {member.email}
                                            </p>

                                            {/* Meta pills */}
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                <span className="inline-flex items-center gap-1 text-[11px] text-[#878a8c] bg-[#F6F7F8] px-2 py-0.5 rounded-full">
                                                    <Clock className="w-3 h-3" />
                                                    {formatForumDate(member.joinedAt)}
                                                </span>
                                                {member.role && member.role !== 'USER' && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                                                        {member.role}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Request message */}
                                            {member.requestMessage && (
                                                <div className="mt-2 flex items-start gap-1.5 bg-[#F6F7F8] rounded-lg px-2.5 py-2">
                                                    <MessageSquare className="w-3.5 h-3.5 text-[#878a8c] shrink-0 mt-0.5" />
                                                    <p className="text-xs text-[#3c3c3c] line-clamp-2 leading-relaxed">
                                                        {member.requestMessage}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="px-4 pb-4 flex gap-2">
                                        <button
                                            onClick={() => handleApprove(member)}
                                            disabled={!!busy}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {busy === 'approve' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4" />
                                            )}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(member)}
                                            disabled={!!busy}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#EDEFF1] text-[#3c3c3c] text-sm font-semibold rounded-lg hover:bg-[#e2e7e9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {busy === 'reject' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <X className="w-4 h-4" />
                                            )}
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
