export interface User {
    id: string;
    username: string;
    email: string;
    rating: number;
    createdAt?: string | Date;
}

export interface JwtPayload {
    userId: string;
    username: string;
    email: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: User;
    token?: string;
    error?: string;
}

export interface ConnectedUser {
    userId: string;
    username: string;
    email: string;
    socketId: string;
    connectedAt: Date | string;
}
