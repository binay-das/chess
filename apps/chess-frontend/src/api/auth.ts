import type { AuthResponse } from "@repo/types";

const API_URL = import.meta.env.VITE_API_URL;

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

export async function signInApi(data: { email?: string; username?: string; password: string }): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/signin`, {
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
        message: result.message || "Invalid credentials",
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
