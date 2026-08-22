
export interface User {
    id: string;
    username: string;
    email: string;
    rating: number;
    createdAt?: string;
}

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