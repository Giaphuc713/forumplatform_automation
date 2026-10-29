"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CreatePostForm } from "@/components/forum/CreatePost";
import { RightSideBarDetail } from "@/components/forum/RightSideBarDetail";
import Cookies from "js-cookie";
const currentuserID = Number(Cookies.get("current_user"));
function SubmitPageContent() {
    const searchParams = useSearchParams();
    const forumIdParam = searchParams.get("forumId");
    const postIdParam = searchParams.get("postId");

    const forumId = forumIdParam ? Number(forumIdParam) : undefined;
    const postId = postIdParam ? Number(postIdParam) : undefined;

    // Track the active forum (may change when editing loads a post's forumId)
    const [activeForumId, setActiveForumId] = useState<number | null>(forumId ?? null);

    return (
        <div className="h-full flex">
            {/* Main Content — Create/Edit Form */}
            <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-2xl mx-auto w-full">
                    <CreatePostForm
                        forumId={forumId}
                        postId={postId}
                        onForumChange={(id) => setActiveForumId(id)}
                    />
                </div>
            </div>

            {/* Right Sidebar — Forum Details (shown when a forum is selected) */}
            {activeForumId && (
                <aside className="w-80 p-4 overflow-auto border-l border-[#EDEFF1] bg-white hidden lg:block">
                    <div className="sticky top-0">
                        <RightSideBarDetail forumId={activeForumId} />
                    </div>
                </aside>
            )}
        </div>
    );
}

export default function SubmitPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-full">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
            }
        >
            <SubmitPageContent />
        </Suspense>
    );
}
