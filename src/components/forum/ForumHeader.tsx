'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Plus, BookOpen, MessageCircleCode, UserCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationCount } from '@/contexts/NotificationContext';
import { useUser } from '@/contexts/UserContext';
import Image from "next/image";

interface ForumHeaderProps {
    title?: string;
    onSearch?: (keyword: string) => void;
    onSortChange?: () => void;
    onFilterChange?: () => void;
}

export function ForumHeader({ title = 'Forum', onSearch }: ForumHeaderProps) {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const { handleLogout } = useAuth();
    const { count: notificationCount } = useNotificationCount();
    const { user } = useUser();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => onSearch?.(value), 400);
    };

    useEffect(() => {
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    }, []);

    return (
        <header className="sticky top-0 z-30 h-14 border-b border-[#EDEFF1] bg-white px-4 flex items-center justify-between gap-4 shadow-sm">
            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded  bg-blue-700 text-white">
                    <BookOpen size={18} />
                </div>
                <span className="hidden sm:inline text-lg font-bold  text-blue-700">LearningPath</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-2">
                <div className={[
                    "relative flex items-center rounded-full border transition-colors",
                    isFocused
                        ? "bg-white border-[#0079D3] ring-1 ring-[#0079D3]"
                        : "bg-[#F6F7F8] border-[#EDEFF1] hover:border-[#878A8C] hover:bg-white",
                ].join(" ")}>
                    <Search className="absolute left-3 w-4 h-4 text-[#878A8C] shrink-0" />
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Search Posts"
                        className="w-full pl-9 pr-4 py-2 bg-transparent text-sm text-[#1C1C1C] placeholder:text-[#878A8C] focus:outline-none"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
                {/* Create */}
                <Link
                    href="/forum/submit"
                    className="flex items-center gap-1.5 bg-[#eaedef] hover:bg-[#e2e7e9] text-gray-900 px-3 py-1.5 rounded-full text-sm font-bold transition-colors"
                >
                    <div className="flex items-center justify-center border border-white/60 rounded-[4px] w-4 h-4">
                        <Plus className="w-3 h-3 text-gray-900 stroke-[3]" />
                    </div>
                    <span className="text-gray-900 sm:inline">Create</span>
                </Link>

                {/* Notifications */}
                <Link
                    href="/forum/notifications"
                    className="relative p-2 text-[#878A8C] hover:bg-[#EDEFF1] hover:text-[#1C1C1C] rounded-full transition-colors"
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    {notificationCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#FF4500] rounded-full leading-none">
                            {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                    )}
                </Link>

                {/* AI Assistant */}
                <button className="flex items-center gap-2 rounded-md bg-blue-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-800 transition-all">
                    <Link href="/ai-assistant" className="flex items-center gap-2">
                        <MessageCircleCode size={18} />
                        AI Assistant
                    </Link>
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-1 border-l pl-4 dark:border-zinc-800">
                    <Link href="/personal" className="flex items-center gap-2 hover:text-zinc-800 dark:hover:text-white">
                        {user?.photoURL ? (
                            <div className="h-8 w-8 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700">
                                <Image
                                    width={8}
                                    height={8}
                                    src={user.photoURL}
                                    alt={user.name || "User avatar"}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : (
                            <UserCircle size={28} className="text-zinc-400" />
                        )}
                        <span className="hidden sm:inline">{user?.name}</span>
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <ChevronDown size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>
                                <Link href="/personal">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href="/settings">Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout}>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
