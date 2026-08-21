import React from "react";
import { ArrowRight, ShieldCheck, Zap, Award, Swords } from "lucide-react";
import type { User } from "../api/auth";

interface HomeProps {
  onNavigate: (tab: "home" | "signin" | "signup" | "dashboard") => void;
  user: User | null;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, user }) => {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 py-12 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-medium text-slate-600 shadow-xs">
        <Award className="h-3.5 w-3.5 text-slate-900" />
        <span>Real-time Multiplayer Chess Engine</span>
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
        Master Your Strategy.<br />Play Chess Anytime.
      </h1>

      <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
        Experience a distraction-free, minimal chess platform built for speed.
        Connect with players worldwide or challenge your friends seamlessly.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {user ? (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
            onClick={() => onNavigate("dashboard")}
          >
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
              onClick={() => onNavigate("signup")}
            >
              Create Account <ArrowRight className="h-4 w-4" />
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
              onClick={() => onNavigate("signin")}
            >
              Sign In
            </button>
          </>
        )}
      </div>

      <div className="mt-12 grid w-full grid-cols-1 gap-6 text-left sm:grid-cols-3">
        <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-900">
            <Swords className="h-5 w-5" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-slate-900">Instant Matchmaking</h3>
          <p className="text-xs leading-relaxed text-slate-500">
            Pair with opponents of similar rating instantly with automated queueing.
          </p>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-900">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-slate-900">Ultra Low Latency</h3>
          <p className="text-xs leading-relaxed text-slate-500">
            Real-time move synchronization powered by lightweight WebSockets.
          </p>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-900">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-slate-900">Secure Auth</h3>
          <p className="text-xs leading-relaxed text-slate-500">
            JWT-backed authentication with encrypted password protection.
          </p>
        </div>
      </div>
    </div>
  );
};
