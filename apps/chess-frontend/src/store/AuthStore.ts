import { create } from "zustand";
import type { AuthState } from "../types/auth";




export const useAuthStore = create<AuthState>((set) => ({
    user: JSON.parse(localStorage.getItem("user") || "null"),
    token: localStorage.getItem("token"),
    isAuthenticated: !!localStorage.getItem("token"),
    isLoading: !!localStorage.getItem("token"),
    error: null,

    setAuth: (user, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
        })
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user")

        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
        })
    },
    fetchCurrentUser: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
        }

        try {
            set({
                isLoading: true
            });

            const res = await fetch("/auth/me", {
                headers: { "Content-Type": "application/json" }
            })

            const user = res.data.user;
            localStorage.setItem("user", JSON.stringify(user))
            set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null
            })
        } catch (error) {
            console.error("Failed to fetch current user:", err);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },

    clearError: () => set({ error: null })
}))