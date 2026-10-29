import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useUser = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: true,

            setUser: (user) => set({ user, isLoading: false }),

            setLoading: (loading) => set({ isLoading: loading }),

            clearUser: () => set({ user: null, isLoading: false }),
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);