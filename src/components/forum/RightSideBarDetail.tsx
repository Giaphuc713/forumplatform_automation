"use client";

import { useEffect, useState } from "react";
import { forumService } from "@/services/forum.service";
import { Forum, ForumMember } from "@/types/forum";
import { Loader2, Share2, CalendarDays, Lock, Globe, ChevronUp, ChevronDown, X } from 'lucide-react';
import { toast } from "sonner";
import Cookies from 'js-cookie';
import { formatForumDate } from "@/components/forum/formatForumDate";

const currentuserID = Number(Cookies.get("current_user"));

interface RightSideBarDetailProps {
    forumId: number;
}

const RULES = [
    { id: 1, title: "Respect others and be civil", body: "Remember the human. Behave like you would in real life." },
    { id: 2, title: "No spam", body: "Excessive promotion, spam, or advertising of any kind is not allowed." },
];

export function RightSideBarDetail({ forumId }: RightSideBarDetailProps) {
    const [forum, setForum] = useState<Forum | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [members, setMembers] = useState<ForumMember[] | null>(null);
    const [expandedRule, setExpandedRule] = useState<number | null>(2);
    const [showAllMembers, setShowAllMembers] = useState(false);

    const handleShareLink = async () => {
        try {
            const code = await forumService.createInvitationCode(forumId, currentuserID);
            const inviteUrl = `${window.location.origin}/forum/invite/${code}`;
            await navigator.clipboard.writeText(inviteUrl);
            toast.success("Copy link successfully");
        } catch {
            toast.error("Only owner of forum can share invitation code");
        }
    };

    const handleDeleteMember = async (memberId: number) => {
        try {
            await forumService.deleteMember(forumId, memberId, currentuserID);
            setMembers((prev) => prev ? prev.filter((m) => m.id !== memberId) : prev);
            toast.success("Member removed");
        } catch {
            toast.error("Failed to remove member");
        }
    };

    const toggleRule = (id: number) => setExpandedRule(expandedRule === id ? null : id);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            forumService.getForumById(forumId, currentuserID),
            forumService.getForumMembers(forumId),
        ])
            .then(([fetchedForum, fetchedMembers]) => {
                setForum(fetchedForum);
                setIsOwner(fetchedForum.authorId === currentuserID);
                setMembers(fetchedMembers);
            })
            .catch((err) => console.error("Error fetching forum details:", err))
            .finally(() => setLoading(false));
    }, [forumId]);

    if (loading) {
        return (
            <div className="w-full rounded-md border border-[#EDEFF1] bg-white p-6 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#878A8C]" />
            </div>
        );
    }

    if (!forum) {
        return (
            <div className="w-full rounded-md border border-[#EDEFF1] bg-white p-4 text-center text-[11px] text-[#878A8C]">
                Forum not found
            </div>
        );
    }

    return (
        <div className="w-full rounded-md border border-[#EDEFF1] overflow-hidden">

            {/* About section */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#F8F9FA] border-b border-[#EDEFF1]">
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#878A8C]">
                    About Community
                </h2>
            </div>

            <div className="px-4 py-3 bg-white border-b border-[#EDEFF1]">
                <p className="text-[13px] text-[#1C1C1C] font-semibold mb-3 whitespace-pre-wrap leading-relaxed">
                    {forum.description}
                </p>

                <div className="flex flex-col gap-2 text-[13px] text-[#878A8C] mb-3">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 shrink-0" />
                        <span>Created {formatForumDate(forum.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {forum.type === 'PRIVATE' || !forum.isPublic
                            ? <Lock className="w-4 h-4 shrink-0" />
                            : <Globe className="w-4 h-4 shrink-0" />
                        }
                        <span className="capitalize">{forum.type.toLowerCase()}</span>
                    </div>
                </div>

                {isOwner && (
                    <button
                        onClick={handleShareLink}
                        className="w-full flex items-center justify-center gap-2 py-1.5 bg-[#0079D3] hover:bg-[#006BBD] rounded-full text-[13px] font-bold text-white transition-colors"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        Share Invite Link
                    </button>
                )}
            </div>

            {/* Rules section */}
            <div className="border-b border-[#EDEFF1]">
                <div className="px-4 py-2.5 bg-[#F8F9FA] border-b border-[#EDEFF1]">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#878A8C]">
                        {forum.name} Rules
                    </h3>
                </div>
                <div className="bg-white divide-y divide-[#EDEFF1]">
                    {RULES.map((rule) => (
                        <div key={rule.id}>
                            <button
                                onClick={() => toggleRule(rule.id)}
                                className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#F6F7F8] transition-colors"
                            >
                                <div className="flex gap-3 text-[13px] font-medium text-[#1C1C1C]">
                                    <span className="text-[#878A8C] shrink-0">{rule.id}</span>
                                    <span>{rule.title}</span>
                                </div>
                                {expandedRule === rule.id
                                    ? <ChevronUp className="w-4 h-4 shrink-0 text-[#878A8C]" />
                                    : <ChevronDown className="w-4 h-4 shrink-0 text-[#878A8C]" />
                                }
                            </button>
                            {expandedRule === rule.id && (
                                <p className="text-[13px] text-[#878A8C] px-4 pb-2.5 pl-11 leading-relaxed">
                                    {rule.body}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Members section */}
            <div>
                <div className="px-4 py-2.5 bg-[#F8F9FA] border-b border-[#EDEFF1]">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#878A8C]">
                        Members{members ? ` (${members.length})` : ''}
                    </h3>
                </div>
                <div className="bg-white divide-y divide-[#EDEFF1]">
                    {(showAllMembers ? members : members?.slice(0, 3))?.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F6F7F8] transition-colors group">
                            <img
                                src={member.avatarUrl || "/default-avatar.png"}
                                alt={member.fullName}
                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#EDEFF1]"
                            />
                            <div className="flex-1 min-w-0">
                                <span className="text-[13px] font-semibold text-[#1C1C1C] hover:underline truncate block">
                                    u/{member.fullName}
                                </span>
                                {member.id === currentuserID && (
                                    <span className="text-[11px] text-[#878A8C]">You</span>
                                )}
                            </div>
                            {isOwner && member.id !== currentuserID && (
                                <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#EDEFF1] text-[#878A8C] hover:text-[#1C1C1C] transition-all shrink-0"
                                    title="Remove member"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {members && members.length > 3 && (
                    <div className="px-4 py-3 bg-white border-t border-[#EDEFF1]">
                        <button
                            onClick={() => setShowAllMembers((prev) => !prev)}
                            className="w-full py-1.5 text-[13px] font-bold text-[#0079D3] hover:bg-[#F6F7F8] rounded-full transition-colors flex items-center justify-center gap-1"
                        >
                            {showAllMembers
                                ? <><ChevronUp className="w-4 h-4" />Show less</>
                                : <><ChevronDown className="w-4 h-4" />View all {members.length} members</>
                            }
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}
