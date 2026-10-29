"use client";

import { useState } from "react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useAuth = () => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authService.logout();

            router.push("/login");
            router.refresh();
        } catch (error) {
            toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
            console.error(error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return {
        handleLogout,
        isLoggingOut,
    };
};