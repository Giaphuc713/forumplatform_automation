"use client";
import { ForumPost } from "@/components/forum/ForumPost";
import RightSidebar from "@/components/forum/RightSideBar";

export default function ForumPage() {
    return (
        <div className="h-full flex w-full bg-gray-50 overflow-auto">
            <div className="flex-1 overflow-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto">
                    <ForumPost />
                </div>
            </div>
            <div className="hidden xl:block w-80 border-l bg-white overflow-auto p-4">
                <div className="sticky top-0">
                    <RightSidebar />
                </div>
            </div>
        </div>
    );
}