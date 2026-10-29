"use client";

import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/hooks/useAuth";

const links = [
    {
        name: "Dashboard",
        href: "/dashboard"
    },
    {
        name: "Home",
        href: "/home"
    },
];

export default function Navbar() {
    const { user, isLoading } = useUser();
    const { handleLogout, isLoggingOut } = useAuth();

    return (
        <div className="flex items-center justify-between px-8 py-4 bg-white border-b shadow-sm">
            <div className="flex items-center gap-6">
                {links.map((link) => (
                    <Link className="font-medium text-zinc-600 hover:text-blue-600 transition-colors" key={link.name} href={link.href}>
                        {link.name}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-4">
                {!isLoading && (
                    user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-zinc-700">
                                Xin chào, {user.name || user.email || 'User'}
                            </span>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Đăng nhập
                        </Link>
                    )
                )}
            </div>
        </div>
    );
}
