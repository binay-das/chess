import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Crown, LogOut, Trophy } from "lucide-react";
import type { User } from "../api/auth";
import { ModeToggle } from "./mode-toggle";

interface NavbarProps {
  user: User | null;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onSignOut }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : "?";

  return (
    <header className="sticky top-0 z-50 border-b border-(--border-10) bg-(--bg-header) text-(--text-primary) backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          to="/"
          className="group flex items-center gap-3"
          aria-label="ChessArena home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--border-10) text-(--text-primary) transition-colors group-hover:bg-(--text-primary) group-hover:text-(--bg-main)">
            <Crown className="h-4.5 w-4.5" strokeWidth={2} />
          </div>

          <div className="hidden sm:block">
            <div className="text-lg font-bold tracking-tight text-(--text-primary)">
              ChessArena
            </div>
          </div>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          <NavLink to="/" active={isActive("/")}>
            Home
          </NavLink>

          {user && (
            <NavLink to="/dashboard" active={isActive("/dashboard")}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <ModeToggle />

          {user ? (
            <div className="group relative">
              <button
                type="button"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-(--btn-profile-bg) font-bold text-sm text-(--btn-profile-text) shadow-md transition-all hover:opacity-90 hover:scale-105 active:scale-95 select-none focus:outline-none focus:ring-2 focus:ring-(--border-10)"
                aria-label="User profile menu"
              >
                {initial}
              </button>

              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all duration-200 absolute right-0 top-full pt-2 z-50 w-72">
                <div className="rounded-2xl border border-(--border-10) bg-(--bg-surface-5) p-5 shadow-2xl backdrop-blur-xl">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--btn-profile-bg) font-extrabold text-2xl text-(--btn-profile-text) shadow-inner select-none">
                      {initial}
                    </div>

                    <div className="mt-3 font-bold text-base text-(--text-primary)">
                      {user.username}
                    </div>

                    <div className="text-xs text-(--text-muted-40)">
                      {user.email}
                    </div>
                  </div>

                  <div className="my-4 border-t border-(--border-10)" />

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between rounded-lg bg-(--border-5) px-3 py-2">
                      <span className="text-(--text-muted-40)">Name</span>
                      <span className="font-semibold text-(--text-muted-90)">{user.username}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-(--border-5) px-3 py-2">
                      <span className="text-(--text-muted-40)">Username</span>
                      <span className="font-medium text-(--text-muted-80)">@{user.username}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-(--border-5) px-3 py-2">
                      <span className="text-(--text-muted-40)">Email</span>
                      <span className="font-medium text-(--text-muted-80) truncate max-w-37.5">{user.email}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-(--border-5) px-3 py-2">
                      <span className="flex items-center gap-1.5 text-(--text-muted-40)">
                        <Trophy className="h-3.5 w-3.5 text-(--accent-gold)" />
                        <span>Rating</span>
                      </span>
                      <span className="font-bold text-(--accent-gold)">{user.rating || 1200} Elo</span>
                    </div>
                  </div>

                  <div className="my-4 border-t border-(--border-10)" />

                  <button
                    type="button"
                    onClick={onSignOut}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/signin"
                className={`hidden text-sm font-medium transition-colors sm:block ${isActive("/signin")
                  ? "text-(--text-primary)"
                  : "text-(--text-muted-50) hover:text-(--text-primary)"
                  }`}
              >
                Sign in
              </Link>

              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-lg bg-(--border-10) px-4 py-2 text-xs font-semibold text-(--text-primary) transition-colors hover:bg-(--text-primary) hover:text-(--bg-main)"
              >
                Join the arena
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => {
  return (
    <Link
      to={to}
      className={`relative px-4 py-2 text-sm font-medium transition-colors ${active
        ? "text-(--text-primary)"
        : "text-(--text-muted-40) hover:text-(--text-primary)"
        }`}
    >
      {children}

      {active && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-(--text-primary)" />
      )}
    </Link>
  );
};