'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { forumService } from "@/services/forum.service";
import Cookies from 'js-cookie';
const CURRENT_USER_ID = Number(Cookies.get("current_user"));

interface NotificationContextType {
    count: number;
    setCount: (count: number) => void;
    refreshCount: () => Promise<void>;
    decrement: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
    count: 0,
    setCount: () => { },
    refreshCount: async () => { },
    decrement: () => { },
});

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [count, setCount] = useState(0);

    const refreshCount = useCallback(async () => {
        try {
            const data = await forumService.getNotifications(CURRENT_USER_ID);
            setCount(Array.isArray(data) ? data.filter((n) => !n.isRead).length : 0);
        } catch (error) {
            console.error("Failed to fetch notification count:", error);
        }
    }, []);

    const decrement = useCallback(() => {
        setCount((prev) => Math.max(0, prev - 1));
    }, []);

    useEffect(() => {
        refreshCount();
    }, [refreshCount]);

    return (
        <NotificationContext.Provider value={{ count, setCount, refreshCount, decrement }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationCount() {
    return useContext(NotificationContext);
}
