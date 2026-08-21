import React from "react";
import type { User } from "../api/auth";
import { CheckCircle2 } from "lucide-react";

interface DashboardProps {
  user: User;
  token: string;
  onSignOut: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "Recently";

  return (
    <div className="w-full max-w-xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white shadow-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">{user.username}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Authenticated</span>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rating</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">{user.rating ?? 1200}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</div>
            <div className="mt-1.5 text-base font-bold text-slate-900">Online</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Joined</div>
            <div className="mt-1.5 text-base font-bold text-slate-900">{formattedDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
