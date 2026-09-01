
import type { User } from "@repo/types";

export type { User };

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    setAuth: (user: User, token: string) => void;
    logout: () => void;
    fetchCurrentUser: () => Promise<void>;
    clearError: () => void;
}