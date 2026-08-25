import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowUpRight, Crown, LogIn } from "lucide-react";

import { signInApi, type User } from "../api/auth";
import { loginSchema, type LoginFormData } from "../schemas/auth";

interface SignInPageProps {
  onSuccess?: (user: User, token: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Sign In | ChessArena";
  }, []);

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
      ? {
        email: data.emailOrUsername.trim(),
        password: data.password,
      }
      : {
        username: data.emailOrUsername.trim(),
        password: data.password,
      };

    const res = await signInApi(payload);

    if (res.success && res.user && res.token) {
      onSuccess?.(res.user, res.token);
      navigate("/dashboard");
    } else {
      setApiError(res.message || "Failed to sign in");
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-72px)] overflow-hidden bg-(--bg-main) text-(--text-primary) transition-colors duration-200">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[20%] top-[15%] h-125 w-125 rounded-full bg-(--glow-amber) blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--dot-pattern)_1px,transparent_0)] bg-size-[32px_32px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-2 lg:px-10">
        <div className="hidden lg:block">
          <div className="mb-8 flex items-center gap-3 text-[10px] font-semibold tracking-[0.3em] text-(--text-muted-30)">
            Welcome back
          </div>

          <h1 className="max-w-xl font-serif text-7xl leading-[0.9] tracking-[-0.045em] text-(--text-heading)">
            Your board
            <br />
            <span className="italic text-(--accent-gold)">awaits.</span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-7 text-(--text-muted-35)">
            Pick up where you left off. Your games, rating, and opponents are
            waiting for your next move.
          </p>

          <div className="mt-12 flex items-center gap-4 border-t border-(--border-8) pt-6">
            <div className="flex h-10 w-10 items-center justify-center border border-(--border-10) bg-(--border-2)">
              <Crown className="h-4 w-4 text-(--accent-gold)" />
            </div>

            <div>
              <div className="text-xs font-semibold text-(--text-muted-65)">
                ChessArena
              </div>
              <div className="mt-1 text-[9px] uppercase tracking-[0.2em] text-(--text-muted-25)">
                Competitive chess
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold tracking-[0.3em] text-(--text-muted-30)">
              Welcome back
            </div>

            <h1 className="font-serif text-5xl tracking-[-0.04em]">
              Your board{" "}
              <span className="italic text-(--accent-gold)">awaits.</span>
            </h1>
          </div>

          <div className="border border-(--border-9) bg-(--bg-surface-1) p-7 sm:p-9">
            <div className="mb-8">
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-(--accent-gold)">
                Sign in
              </div>

              <h2 className="mt-3 font-serif text-3xl tracking-tight text-(--text-heading)">
                Continue your game.
              </h2>

              <p className="mt-2 text-sm leading-6 text-(--text-muted-30)">
                Enter your credentials to return to the board.
              </p>
            </div>

            {apiError && (
              <div className="mb-5 flex items-start gap-3 border border-red-400/20 bg-red-400/6 p-3.5 text-xs text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-(--text-muted-35)">
                  Email or username
                </label>

                <input
                  type="text"
                  {...register("emailOrUsername")}
                  placeholder="grandmaster or alex@example.com"
                  disabled={isSubmitting}
                  className={`w-full border bg-(--bg-input) px-4 py-3.5 text-sm text-(--text-primary) outline-none transition-colors placeholder:text-(--text-muted-15) ${errors.emailOrUsername
                      ? "border-red-400/50 focus:border-red-400"
                      : "border-(--border-10) focus:border-(--accent-gold)"
                    }`}
                />

                {errors.emailOrUsername && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.emailOrUsername.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-(--text-muted-35)">
                  Password
                </label>

                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className={`w-full border bg-(--bg-input) px-4 py-3.5 text-sm text-(--text-primary) outline-none transition-colors placeholder:text-(--text-muted-15) ${errors.password
                      ? "border-red-400/50 focus:border-red-400"
                      : "border-(--border-10) focus:border-(--accent-gold)"
                    }`}
                />

                {errors.password && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-2 flex w-full cursor-pointer items-center justify-center gap-3 bg-(--btn-primary-bg) py-3.5 text-sm font-bold text-(--btn-primary-text) transition-colors hover:bg-(--btn-primary-hover) disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-(--btn-primary-text)/30 border-t-(--btn-primary-text)" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign in
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-(--border-10) pt-6 text-center text-xs text-(--text-muted-30)">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-(--accent-gold) transition-colors hover:text-(--accent-gold-hover)"
              >
                Create one
              </Link>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] text-(--text-muted-15)">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
            Secure authentication
          </div>
        </div>
      </div>
    </main>
  );
};

export const SignIn = SignInPage;