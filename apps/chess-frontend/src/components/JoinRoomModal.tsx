import { useState } from "react";
import { getSocket } from "../services/socket";
import { X, AlertCircle } from "lucide-react";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinRoomModal = ({ isOpen, onClose }: JoinRoomModalProps) => {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError("Please enter a 6-character room code.");
      return;
    }

    const socket = getSocket();
    socket.emit("room:join", { roomCode: roomCode.trim().toUpperCase() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
        <button
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Join Match Room</h2>
          <p className="mt-1 text-sm text-slate-500">Enter the 6-character room code from your opponent</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="modalRoomCode" className="block text-xs font-semibold text-slate-700">
              Room Code
            </label>
            <input
              id="modalRoomCode"
              type="text"
              placeholder="e.g. A9B2X7"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase());
                setError(null);
              }}
              maxLength={6}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-center font-mono text-xl tracking-widest text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 uppercase"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.99] cursor-pointer"
          >
            Join Match
          </button>
        </form>
      </div>
    </div>
  );
};

