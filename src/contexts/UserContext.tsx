"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { studentService } from "@/services/studentService";
import { authService } from "@/services/auth.service"; // Import class bạn vừa sửa ở trên

export interface User {
    uid: string;
    email: string | null;
    name: string | null;
    photoURL: string | null;
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    checkAuth: () => Promise<void>;
    updateMockUser: (updatedUser: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setLoading] = useState(true);

    const updateMockUser = (updatedUser: Partial<User>) => {
        if (user) {
            const newUser = { ...user, ...updatedUser };
            setUser(newUser);
            if (user.uid.startsWith("mock-")) {
                localStorage.setItem("mock_user", JSON.stringify(newUser));
            }
        }
    };

    const checkAuth = async () => {
        try {
            const token = Cookies.get("access_token");
            if (token) {
                const profile = await studentService.getProfile();
                setUser({
                    uid: String(profile.id),
                    email: profile.email,
                    name: profile.fullName || profile.studentCode || "User",
                    photoURL: profile.avatarUrl || null,
                });
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <UserContext.Provider value={{ user, isLoading, setUser, checkAuth, updateMockUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) throw new Error("useUser must be used within UserProvider");
    return context;
}