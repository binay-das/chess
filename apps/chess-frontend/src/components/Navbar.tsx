import React from "react";
import { Crown, LogOut, User as UserIcon } from "lucide-react";
import type { User } from "../api/auth";

interface NavbarProps {
  currentTab: "home" | "signin" | "signup" | "dashboard";
  onNavigate: (tab: "home" | "signin" | "signup" | "dashboard") => void;
  user: User | null;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, user, onSignOut }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md">
      <div
        className="flex cursor-pointer items-center gap-2 text-lg font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-80"
        onClick={() => onNavigate("home")}
      >
        <Crown className="h-6 w-6 text-slate-900" />
        <span>ChessArena</span>
      </div>

      <nav className="flex items-center gap-3">
        <button
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
            currentTab === "home"
              ? "bg-slate-100 font-semibold text-slate-900"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
          onClick={() => onNavigate("home")}
        >
          Home
        </button>

        {user ? (
          <>
            <button
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
                currentTab === "dashboard"
                  ? "bg-slate-100 font-semibold text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              onClick={() => onNavigate("dashboard")}
            >
              Dashboard
            </button>
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              <UserIcon className="h-3.5 w-3.5 text-slate-500" />
              <span>{user.username}</span>
            </div>
            <button
              className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
              onClick={onSignOut}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
                currentTab === "signin"
                  ? "bg-slate-100 font-semibold text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              onClick={() => onNavigate("signin")}
            >
              Sign In
            </button>
            <button
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow active:scale-95"
              onClick={() => onNavigate("signup")}
            >
              Sign Up
            </button>
          </>
        )}
      </nav>
    </header>
  );
};
