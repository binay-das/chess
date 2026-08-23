import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LogIn } from "lucide-react";
import { signInApi, type User } from "../api/auth";
import { loginSchema, type LoginFormData } from "../schemas/auth";

interface SignInPageProps {
  onSuccess?: (user: User, token: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);

    const isEmail = data.emailOrUsername.includes("@");
    const payload = isEmail
      ? { email: data.emailOrUsername.trim(), password: data.password }
      : { username: data.emailOrUsername.trim(), password: data.password };

    const res = await signInApi(payload);

    if (res.success && res.user && res.token) {
      if (onSuccess) {
        onSuccess(res.user, res.token);
      }
      navigate("/dashboard");
    } else {
      setApiError(res.message || "Failed to sign in");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue playing</p>
        </div>

        {apiError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Email or Username</label>
            <input
              type="text"
              {...register("emailOrUsername")}
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
                errors.emailOrUsername
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
              }`}
              placeholder="grandmaster or alex@example.com"
              disabled={isSubmitting}
            />
            {errors.emailOrUsername && (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.emailOrUsername.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              {...register("password")}
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
                errors.password
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
              }`}
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
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
          <Link
            to="/signup"
            className="font-semibold text-slate-900 underline underline-offset-2 transition-colors hover:text-black"
          >
            Click here to sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export const SignIn = SignInPage;
