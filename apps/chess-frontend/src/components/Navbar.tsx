import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Crown, LogOut, User as UserIcon } from "lucide-react";
import type { User } from "../api/auth";

interface NavbarProps {
  user: User | null;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onSignOut }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md">
      <Link
        to="/"
        className="flex cursor-pointer items-center gap-2 text-lg font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-80"
      >
        <Crown className="h-6 w-6 text-slate-900" />
        <span>ChessArena</span>
      </Link>

      <nav className="flex items-center gap-3">
        <Link
          to="/"
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
            currentPath === "/"
              ? "bg-slate-100 font-semibold text-slate-900"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          Home
        </Link>

        

        {user ? (
          <>
            <Link
              to="/dashboard"
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
                currentPath === "/dashboard"
                  ? "bg-slate-100 font-semibold text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Dashboard
            </Link>
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              <UserIcon className="h-3.5 w-3.5 text-slate-500" />
              <span>{user.username}</span>
            </div>
            <button
              className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
              onClick={onSignOut}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <Link
              to="/signin"
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
                currentPath === "/signin"
                  ? "bg-slate-100 font-semibold text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow active:scale-95"
            >
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};
