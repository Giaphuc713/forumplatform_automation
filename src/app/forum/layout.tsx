"use client";

import { AppLayout } from "@/components/forum/AppLayout";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Suspense } from "react";

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotificationProvider>
        <AppLayout>{children}</AppLayout>
      </NotificationProvider>
    </Suspense>
  );
}
