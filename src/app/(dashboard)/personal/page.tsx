"use client";

import { InfoGrid } from "@/src/components/personal/InfoGrid";
import { NotificationSidebar } from "@/src/components/personal/NotificationSidebar";
import { ProfileCard } from "@/src/components/personal/ProfileCard";
import { useStudentProfile } from "@/src/hooks/useStudentProfile";
import { Loader2 } from "lucide-react";

export default function PersonalPage() {
  const { profile, isLoading, error, refetch } = useStudentProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-zinc-500" size={40} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px] text-red-500">
        <p>{error || "Không thể tải thông tin hồ sơ"}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column */}
      <div className="lg:col-span-3">
        <ProfileCard profile={profile} refetch={refetch} />
      </div>

      {/* Middle Column */}
      <div className="lg:col-span-6 h-full">
        <InfoGrid profile={profile} refetch={refetch} />
      </div>

      {/* Right Column */}
      <div className="lg:col-span-3">
        <NotificationSidebar />
      </div>
    </div>
  );
}