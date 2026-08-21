const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  id: string;
  username: string;
  email: string;
  rating: number;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  error?: unknown;
}

export async function signUpApi(data: { username: string; email: string; password: string }): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Failed to sign up",
      };
    }
    return result;
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error. Is the backend server running?",
    };
  }
}

