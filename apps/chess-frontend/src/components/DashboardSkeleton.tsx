import React from "react";

export const StatSkeleton: React.FC = () => {
  return <div className="mt-3 h-8 w-20 animate-pulse rounded bg-(--border-10)" />;
};

export const MatchHistorySkeleton: React.FC = () => {
  return (
    <div className="overflow-x-auto border-y border-(--border-8)">
      <table className="w-full min-w-150 text-left">
        <thead>
          <tr className="border-b border-(--border-8)">
            <th className="px-4 py-4 text-[9px] font-semibold uppercase tracking-[0.22em] text-(--text-muted-25)">
              Opponent
            </th>

            <th className="px-4 py-4 text-[9px] font-semibold uppercase tracking-[0.22em] text-(--text-muted-25)">
              Color
            </th>

            <th className="px-4 py-4 text-[9px] font-semibold uppercase tracking-[0.22em] text-(--text-muted-25)">
              Result
            </th>

            <th className="px-4 py-4 text-[9px] font-semibold uppercase tracking-[0.22em] text-(--text-muted-25)">
              Date
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-(--border-6)">
          {[1, 2, 3].map((i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-4 py-5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-(--border-10)" />
                  <div className="h-4 w-28 rounded bg-(--border-10)" />
                </div>
              </td>

              <td className="px-4 py-5">
                <div className="h-4 w-16 rounded bg-(--border-10)" />
              </td>

              <td className="px-4 py-5">
                <div className="h-4 w-16 rounded bg-(--border-10)" />
              </td>

              <td className="px-4 py-5">
                <div className="h-4 w-20 rounded bg-(--border-10)" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
