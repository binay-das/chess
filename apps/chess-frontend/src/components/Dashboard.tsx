import React from "react";
import type { User } from "../api/auth";
import { CheckCircle2 } from "lucide-react";
import { Chessboard } from "react-chessboard";

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


      <Chessboard />


    </div>
  );
};
