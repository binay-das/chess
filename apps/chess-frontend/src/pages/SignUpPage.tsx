import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, UserPlus } from "lucide-react";
import { signUpApi, type User } from "../api/auth";
import { registerSchema, type RegisterFormData } from "../schemas/auth";

interface SignUpPageProps {
  onSuccess?: (user: User, token: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);

    const res = await signUpApi({
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password,
    });

    if (res.success && res.user && res.token) {
      if (onSuccess) {
        onSuccess(res.user, res.token);
      }
      navigate("/dashboard");
    } else {
      setApiError(res.message || "Failed to create account");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create an account</h2>
          <p className="mt-1 text-sm text-slate-500">Join the minimal chess arena and start playing</p>
        </div>

        {apiError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Username</label>
            <input
              type="text"
              {...register("username")}
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
                errors.username
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
              }`}
              placeholder="e.g. magnus"
              disabled={isSubmitting}
            />
            {errors.username && (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              {...register("email")}
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
                errors.email
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
              }`}
              placeholder="name@example.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.email.message}</p>
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

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
              }`}
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.confirmPassword.message}</p>
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
                <UserPlus className="h-4 w-4" /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-semibold text-slate-900 underline underline-offset-2 transition-colors hover:text-black"
          >
            Click here to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export const SignUp = SignUpPage;
