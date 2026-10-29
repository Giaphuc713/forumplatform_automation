"use client"


import Link from "next/link";
import {
  LayoutDashboard,
  Map,
  BookOpen,
  MessageSquare,
  Bell,
  MessageCircleCode,
  UserCircle,
  ChevronDown
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/contexts/UserContext";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { handleLogout } = useAuth();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white px-4 py-2 dark:bg-black dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-700 text-white">
              <BookOpen size={20} />
            </div>
            <span className="text-xl font-bold text-blue-700">LearningPath</span>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/home" className="flex items-center gap-2 hover:text-blue-700 transition-colors">
              <LayoutDashboard size={18} />
              Home
            </Link>
            <Link href="/roadmap" className="flex items-center gap-2 hover:text-blue-700 transition-colors">
              <Map size={18} />
              AI Roadmap
            </Link>
            <Link href="/course" className="flex items-center gap-2 hover:text-blue-700 transition-colors">
              <BookOpen size={18} />
              Course
            </Link>
            <Link href="/forum" className="flex items-center gap-2 hover:text-blue-700 transition-colors">
              <MessageSquare size={18} />
              Forum
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white">
              <Bell size={20} />
            </button>

            <button className="flex items-center gap-2 rounded-md bg-blue-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-800 transition-all">
              <Link href="/ai-assistant" className="flex items-center gap-2">
                <MessageCircleCode size={18} />
                AI Assistant
              </Link>
            </button>

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
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        {children}
      </main>
    </div>
  );
}