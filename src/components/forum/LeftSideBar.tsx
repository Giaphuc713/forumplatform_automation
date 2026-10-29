'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Plus, Briefcase, Compass, Home, MessageSquare, FileText, Settings, Shield, TrendingUp, ChevronDown, ChevronUp, Star } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { forumService } from '@/services/forum.service';
import { Forum } from '@/types/forum';
import cookies from 'js-cookie';
import Image from 'next/image';
export const OWNED_FORUMS_KEY = 'ownedForums';
const CURRENT_USER_ID = cookies.get('current_user');
interface LeftSideBarProps {
    isOpen: boolean;
    onClose: () => void;
    onToggle: () => void;
    onOpenCreate: () => void;
}

export function LeftSideBar({ isOpen, onClose, onToggle, onOpenCreate }: LeftSideBarProps) {

    const [modExpanded, setModExpanded] = useState(true);

    const { data: ownedForums = [] } = useQuery<Forum[]>({
        queryKey: [OWNED_FORUMS_KEY, CURRENT_USER_ID],
        queryFn: () => forumService.getListForumByOwnerId(Number(CURRENT_USER_ID)),
        enabled: CURRENT_USER_ID ? true : false,
    });

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            <aside
                className={clsx(
                    "sticky top-14 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out lg:sticky lg:h-[calc(100vh-3.5rem)]",
                    isOpen
                        ? "w-64 translate-x-0 lg:transform-none"
                        : "w-64 -translate-x-full lg:w-0 lg:translate-x-0"
                )}
            >
                <div className="h-full w-full overflow-hidden bg-white border-r border-[#EDEFF1]">
                    <div className="flex h-full w-64 flex-col overflow-y-auto pt-3 pb-20 scrollbar-hide">

                        {/* Communities section */}
                        <div className="px-3 pb-3 border-b border-[#EDEFF1]">
                            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-[#878A8C]">
                                Communities
                            </p>
                            <button
                                onClick={onOpenCreate}
                                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-[#1C1C1C] hover:bg-[#EDEFF1] transition-colors"
                            >
                                <Plus className="h-5 w-5 text-[#878A8C]" />
                                Start a community
                            </button>
                        </div>

                        {/* Moderation */}
                        {ownedForums.length > 0 && (
                            <div className="px-3 pb-3 border-b border-[#EDEFF1]">
                                <button
                                    onClick={() => setModExpanded(v => !v)}
                                    className="flex w-full items-center justify-between px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#878A8C] transition-colors"
                                >
                                    <span>Moderation</span>
                                    {modExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                </button>
                                {modExpanded && (
                                    <nav className="flex flex-col gap-0.5">
                                        {ownedForums.map(forum => (
                                            <ForumNavItem key={forum.id} forum={forum} />
                                        ))}
                                    </nav>
                                )}
                            </div>
                        )}

                        {/* Resources */}
                        <div className="mt-3 px-3 pb-3 border-b border-[#EDEFF1]">
                            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-[#878A8C]">
                                Resources
                            </p>
                            <nav className="flex flex-col gap-0.5">
                                <NavItem href="/forum" icon={<Home className="h-5 w-5" />} label="Home" />
                                <NavItem href="/developer" icon={<TrendingUp className="h-5 w-5" />} label="Developer Platform" />
                                {/* <NavItem href="/pro" icon={<FileText className="h-5 w-5" />} label="Forum Pro" badge="BETA" /> */}
                                <NavItem href="/help" icon={<MessageSquare className="h-5 w-5" />} label="Help" />
                                {/* <NavItem href="/blog" icon={<FileText className="h-5 w-5" />} label="Blog" />
                                <NavItem href="/careers" icon={<Briefcase className="h-5 w-5" />} label="Careers" />
                                <NavItem href="/press" icon={<FileText className="h-5 w-5" />} label="Press" /> */}
                            </nav>
                        </div>

                        {/* Best of Forum */}
                        <div className="mt-3 px-3 pb-3 border-b border-[#EDEFF1]">
                            <nav className="flex flex-col gap-0.5">
                                <NavItem href="/best" icon={<Home className="h-5 w-5" />} label="Best of Forum" />
                                <NavItem href="/best/por" icon={<Compass className="h-5 w-5" />} label="Best of Forum in Por..." />
                                <NavItem href="/best/ger" icon={<Compass className="h-5 w-5" />} label="Best of Forum in Ger..." />
                            </nav>
                        </div>

                        {/* Legal */}
                        <div className="mt-3 px-3 pb-3 border-b border-[#EDEFF1]">
                            <nav className="flex flex-col gap-0.5">
                                <NavItem href="/rules" icon={<FileText className="h-5 w-5" />} label="Forum Rules" />
                                <NavItem href="/privacy" icon={<Shield className="h-5 w-5" />} label="Privacy Policy" />
                                <NavItem href="/agreement" icon={<FileText className="h-5 w-5" />} label="User Agreement" />
                                <NavItem href="/accessibility" icon={<Settings className="h-5 w-5" />} label="Accessibility" />
                            </nav>
                        </div>

                        <p className="px-5 mt-auto pt-6 pb-4 text-xs text-[#878A8C]">
                            LearningPath, Inc. © 2026. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Desktop collapse button */}
                <div className={clsx(
                    "hidden lg:block absolute -right-4 top-4 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}>
                    <button
                        onClick={onToggle}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#EDEFF1] shadow-sm hover:bg-[#F6F7F8] transition-colors"
                        title="Collapse Navigation"
                    >
                        <svg className="h-4 w-4 text-[#878A8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </aside>

            {/* Desktop expand button */}
            {!isOpen && (
                <div className="hidden lg:block fixed left-4 top-20 z-40 animate-in fade-in zoom-in duration-200">
                    <button
                        onClick={onToggle}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#EDEFF1] shadow-sm hover:bg-[#F6F7F8] transition-colors"
                        title="Expand Navigation"
                    >
                        <svg className="h-4 w-4 text-[#878A8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            )}
        </>
    );
}

function ForumNavItem({ forum }: { forum: Forum }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentForumId = searchParams.get("forumId");
    const href = `/forum/${encodeURIComponent(forum.name)}?forumId=${forum.id}`;
    const isActive =
        pathname === `/forum/${encodeURIComponent(forum.name)}` &&
        currentForumId === forum.id.toString();
    return (
        <Link
            href={href}
            className={clsx(
                "flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                isActive
                    ? "bg-[#EDEFF1] text-[#1C1C1C] font-semibold"
                    : "text-[#3C3C3C] hover:bg-[#F6F7F8]"
            )}
        >
            {forum.avatarUrl ? (
                <img src={forum.avatarUrl} alt={forum.name} className="h-5 w-5 rounded-full object-cover shrink-0" />
            ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EDEFF1] text-[10px] font-bold text-[#878A8C]">
                    {forum.name.charAt(0).toUpperCase()}
                </span>
            )}
            <span className="truncate">c/{forum.name}</span>
            <Star className="ml-auto h-3.5 w-3.5 shrink-0 text-[#878A8C]" />
        </Link>
    );
}

function NavItem({
    href,
    icon,
    label,
    badge,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    badge?: string;
}) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={clsx(
                "flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-colors",
                isActive
                    ? "bg-[#EDEFF1] text-[#1C1C1C] font-semibold"
                    : "text-[#3C3C3C] hover:bg-[#F6F7F8]"
            )}
        >
            <div className="flex items-center gap-3">
                <span className={isActive ? "text-[#1C1C1C]" : "text-[#878A8C]"}>
                    {icon}
                </span>
                <span className="truncate">{label}</span>
            </div>
            {badge && (
                <span className="text-[10px] font-bold text-[#FF4500] tracking-wider">{badge}</span>
            )}
        </Link>
    );
}
