import React, { useState } from "react";
import { AlertCircle, LogIn } from "lucide-react";
import { signInApi, type User } from "../api/auth";

interface SignInProps {
  onNavigate: (tab: "home" | "signin" | "signup" | "dashboard") => void;
  onSuccess: (user: User, token: string) => void;
}

export const SignIn: React.FC<SignInProps> = ({ onNavigate, onSuccess }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    const isEmail = identifier.includes("@");
    const payload = isEmail
      ? { email: identifier.trim(), password }
      : { username: identifier.trim(), password };

    const res = await signInApi(payload);

    setLoading(false);

    if (res.success && res.user && res.token) {
      onSuccess(res.user, res.token);
    } else {
      setError(res.message || "Failed to sign in");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue playing</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Email or Username</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              placeholder="grandmaster or alex@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          Don't have an account?{" "}
          <button
            type="button"
            className="font-semibold text-slate-900 underline underline-offset-2 transition-colors hover:text-black"
            onClick={() => onNavigate("signup")}
          >
            Click here to sign up
          </button>
        </div>
      </div>
    </div>
  );
};
