import { useState } from "react";
import { getSocket } from "../services/socket";
import { X, AlertCircle, KeyRound, ArrowUpRight } from "lucide-react";

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

    socket.emit("room:join", {
      roomCode: roomCode.trim().toUpperCase(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c0b]/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md border border-white/10 bg-[#11110f] p-7 text-[#f5f2eb] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 cursor-pointer items-center justify-center border border-white/10 text-white/30 transition-colors hover:border-white/15 hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#c7a96b]/25 bg-[#c7a96b]/5">
              <KeyRound className="h-4 w-4 text-[#c7a96b]" />
            </div>

            <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c7a96b]">
              Join match
            </span>
          </div>

          <h2 className="font-serif text-3xl tracking-[-0.035em] text-white">
            Enter the room.
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-6 text-white/30">
            Enter the six-character code shared by your opponent.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin}>
          <label
            htmlFor="modalRoomCode"
            className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.25em] text-white/30"
          >
            Room code
          </label>

          <input
            id="modalRoomCode"
            type="text"
            placeholder="A9B2X7"
            value={roomCode}
            onChange={(e) => {
              setRoomCode(e.target.value.toUpperCase());
              setError(null);
            }}
            maxLength={6}
            autoFocus
            className="w-full border border-white/10 bg-[#0c0c0b] px-4 py-5 text-center font-mono text-2xl font-semibold uppercase tracking-[0.45em] text-[#f5f2eb] outline-none transition-colors placeholder:text-white/10 focus:border-[#c7a96b]/60"
          />

          <button
            type="submit"
            className="group mt-4 flex w-full cursor-pointer items-center justify-between border border-[#e9e4d8] bg-[#e9e4d8] px-5 py-4 text-xs font-bold text-[#11110f] transition-colors hover:bg-white"
          >
            <span>Join match</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </form>

        <p className="mt-5 text-center text-[9px] uppercase tracking-[0.18em] text-white/15">
          Room codes are case-insensitive
        </p>
      </div>
    </div>
  );
};