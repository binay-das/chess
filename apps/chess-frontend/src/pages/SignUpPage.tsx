import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowUpRight,
  Crown,
  UserPlus,
} from "lucide-react";

import { signUpApi, type User } from "../api/auth";
import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/auth";

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
      onSuccess?.(res.user, res.token);
      navigate("/dashboard");
    } else {
      setApiError(res.message || "Failed to create account");
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-72px)] overflow-hidden bg-[#0c0c0b] text-[#f5f2eb]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[15%] top-[10%] h-137.5 w-137.5 rounded-full bg-[#c7a96b]/[0.035] blur-[150px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-size-[32px_32px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-2 lg:px-10">
        <div className="hidden lg:block">
          <div className="mb-8 flex items-center gap-3 text-[10px] font-semibold tracking-[0.3em] text-white/30">
            Join the arena
          </div>

          <h1 className="max-w-xl font-serif text-7xl leading-[0.9] tracking-[-0.045em] text-[#f4f0e7]">
            Make your
            <br />
            <span className="italic text-[#c7a96b]">move.</span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-7 text-white/35">
            Create your player profile and step onto the board. Find opponents,
            play live, and build your rating one game at a time.
          </p>

          <div className="mt-12 space-y-5 border-t border-white/8 pt-7">
            <Stat
              number="01"
              title="Create your identity"
              description="Choose your username and claim your place on the board."
            />

            <Stat
              number="02"
              title="Find your opponent"
              description="Connect with players and start a real-time game."
            />

            <Stat
              number="03"
              title="Build your rating"
              description="Every game is another chance to improve."
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold tracking-[0.3em] text-white/30">
              <span className="h-px w-7 bg-[#c7a96b]" />
              Join the arena
            </div>

            <h1 className="font-serif text-5xl tracking-[-0.04em]">
              Make your{" "}
              <span className="italic text-[#c7a96b]">move.</span>
            </h1>
          </div>

          <div className="border border-white/9 bg-[#11110f] p-7 sm:p-9">
            <div className="mb-8">
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c7a96b]">
                Create account
              </div>

              <h2 className="mt-3 font-serif text-3xl tracking-tight text-white">
                Step onto the board.
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/30">
                Set up your player profile and start playing.
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
              <FormField
                label="Username"
                placeholder="e.g. magnus"
                error={errors.username?.message}
                disabled={isSubmitting}
                {...register("username")}
              />

              <FormField
                label="Email address"
                type="email"
                placeholder="name@example.com"
                error={errors.email?.message}
                disabled={isSubmitting}
                {...register("email")}
              />

              <FormField
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                disabled={isSubmitting}
                {...register("password")}
              />

              <FormField
                label="Confirm password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                disabled={isSubmitting}
                {...register("confirmPassword")}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-2 flex w-full cursor-pointer items-center justify-center gap-3 bg-[#e9e4d8] py-3.5 text-sm font-bold text-[#11110f] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#11110f]/30 border-t-[#11110f]" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create account
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-white/[0.07] pt-6 text-center text-xs text-white/30">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-semibold text-[#c7a96b] transition-colors hover:text-[#e0c98e]"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/15">
            <Crown className="h-3 w-3" />
            Your game starts here
          </div>
        </div>
      </div>
    </main>
  );
};

interface StatProps {
  number: string;
  title: string;
  description: string;
}

const Stat: React.FC<StatProps> = ({
  number,
  title,
  description,
}) => {
  return (
    <div className="flex gap-5">
      <span className="pt-0.5 font-mono text-[9px] text-[#c7a96b]/60">
        {number}
      </span>

      <div>
        <h3 className="text-xs font-semibold text-white/70">
          {title}
        </h3>

        <p className="mt-1 max-w-sm text-xs leading-5 text-white/25">
          {description}
        </p>
      </div>
    </div>
  );
};

interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
          {label}
        </label>

        <input
          ref={ref}
          {...props}
          className={`w-full border bg-[#0c0c0b] px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/15 ${error
              ? "border-red-400/50 focus:border-red-400"
              : "border-white/10 focus:border-[#c7a96b]/70"
            }`}
        />

        {error && (
          <p className="mt-2 text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";

export const SignUp = SignUpPage;