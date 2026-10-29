"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ai-assistant?auth=signup");
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
      <div className="text-sm font-medium text-slate-500 animate-pulse">
        Redirecting to assistant...
      </div>
    </div>
  );
}