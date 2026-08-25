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

  const isActive = (path: string) => currentPath === path;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0c0c0b]/95 text-[#f5f2eb] backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          to="/"
          className="group flex items-center gap-3"
          aria-label="ChessArena home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e9e4d8] text-[#11110f] transition-colors group-hover:bg-white">
            <Crown className="h-4.5 w-4.5" strokeWidth={2.2} />
          </div>

          <div className="hidden sm:block">
            <div className="text-sm font-bold tracking-[0.2em] text-[#f5f2eb]">
              CHESSARENA
            </div>
            <div className="mt-0.5 text-[8px] uppercase tracking-[0.28em] text-white/25">
              Competitive Chess
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

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 border-l border-white/8 pl-4 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.07]">
                  <UserIcon className="h-3.5 w-3.5 text-white/50" />
                </div>

                <div className="hidden leading-none lg:block">
                  <div className="text-xs font-semibold text-white/75">
                    {user.username}
                  </div>
                  <div className="mt-1 text-[8px] uppercase tracking-[0.18em] text-white/25">
                    Player
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                title="Sign out"
                className="group flex h-8 w-8 cursor-pointer items-center justify-center text-white/30 transition-colors hover:text-red-400"
              >
                <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className={`hidden text-xs font-medium transition-colors sm:block ${isActive("/signin")
                    ? "text-white"
                    : "text-white/40 hover:text-white"
                  }`}
              >
                Sign in
              </Link>

              <Link
                to="/signup"
                className="flex items-center gap-2 bg-[#e9e4d8] px-4 py-2 text-xs font-bold text-[#11110f] transition-colors hover:bg-white"
              >
                Join
                <span className="hidden sm:inline">the arena</span>
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
      className={`relative px-4 py-2 text-xs font-semibold transition-colors ${active
          ? "text-[#f5f2eb]"
          : "text-white/35 hover:text-white/80"
        }`}
    >
      {children}

      {active && (
        <span className="absolute bottom-0 left-1/2 h-px w-4 -translate-x-1/2 bg-[#c7a96b]" />
      )}
    </Link>
  );
};