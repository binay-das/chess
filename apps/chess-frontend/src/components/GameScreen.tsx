import { useState } from "react";
import { useAuthStore } from "../store/AuthStore";
import { useGameStore } from "../store/GameStore";
import { getSocket } from "../services/socket";
import { ChessBoardComponent } from "./ChessBoard";
import {
  Copy,
  Check,
  Handshake,
  Flag,
  LogOut,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Home,
  Trophy,
  Frown,
} from "lucide-react";

export const GameScreen = () => {
  const { user } = useAuthStore();

  const {
    roomCode,
    status,
    opponent,
    playerColor,
    moveHistory,
    gameOverDetails,
    drawOfferedBy,
    rematchOfferedBy,
    invalidMoveError,
    setDrawOfferedBy,
    setRematchOfferedBy,
    setInvalidMoveError,
    resetGame,
  } = useGameStore();

  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResign = () => {
    if (roomCode && status === "playing") {
      if (confirm("Are you sure you want to resign from this game?")) {
        const socket = getSocket();
        socket.emit("game:resign", { roomCode });
      }
    }
  };

  const handleOfferDraw = () => {
    if (roomCode && status === "playing") {
      const socket = getSocket();
      socket.emit("game:draw_offer", { roomCode });
      alert("Draw offer sent to opponent.");
    }
  };

  const handleLeaveRoom = () => {
    if (roomCode) {
      const socket = getSocket();
      socket.emit("room:leave", { roomCode });
    }

    resetGame();
  };

  const handleRequestRematch = () => {
    if (roomCode) {
      const socket = getSocket();
      socket.emit("game:rematch_request", { roomCode });
      alert("Rematch offer sent to opponent.");
    }
  };

  const handleRespondRematch = (accept: boolean) => {
    if (roomCode) {
      const socket = getSocket();
      socket.emit("game:rematch_respond", { roomCode, accept });
      setRematchOfferedBy(null);
    }
  };

  const handleRespondDraw = (accept: boolean) => {
    if (roomCode) {
      const socket = getSocket();
      socket.emit("game:draw_respond", { roomCode, accept });
      setDrawOfferedBy(null);
    }
  };

  const opponentColor = playerColor === "white" ? "black" : "white";

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#0c0c0b] text-[#f5f2eb]">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex flex-col gap-5 border-b border-white/[0.08] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-7 bg-[#c7a96b]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#c7a96b]">
                Live match
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <h1 className="font-serif text-3xl tracking-[-0.035em] text-white sm:text-4xl">
                The board
              </h1>

              <button
                type="button"
                onClick={copyRoomCode}
                className="group flex cursor-pointer items-center gap-3 border border-white/[0.09] bg-[#11110f] px-3 py-2 transition-colors hover:border-white/[0.16]"
              >
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/25">
                  Room
                </span>

                <span className="font-mono text-xs font-semibold tracking-[0.25em] text-white/70">
                  {roomCode}
                </span>

                {copied ? (
                  <Check className="h-3.5 w-3.5 text-[#c7a96b]" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-white/25 transition-colors group-hover:text-white/60" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {status === "playing" && (
              <>
                <button
                  type="button"
                  onClick={handleOfferDraw}
                  className="flex cursor-pointer items-center gap-2 border border-white/[0.1] bg-[#11110f] px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.03] hover:text-white"
                >
                  <Handshake className="h-3.5 w-3.5" />
                  Draw
                </button>

                <button
                  type="button"
                  onClick={handleResign}
                  className="flex cursor-pointer items-center gap-2 border border-red-400/15 bg-red-400/[0.03] px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-300/70 transition-colors hover:border-red-400/25 hover:bg-red-400/[0.06] hover:text-red-300"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Resign
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleLeaveRoom}
              className="flex cursor-pointer items-center gap-2 border border-white/[0.1] bg-white/[0.04] px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Leave
            </button>
          </div>
        </header>

        {invalidMoveError && (
          <button
            type="button"
            onClick={() => setInvalidMoveError(null)}
            className="mb-6 flex w-full cursor-pointer items-center justify-between border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-left text-xs text-red-300 transition-colors hover:bg-red-400/[0.08]"
          >
            <span className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {invalidMoveError}
            </span>

            <span className="text-[8px] uppercase tracking-[0.2em] text-red-300/40">
              Dismiss
            </span>
          </button>
        )}

        {status === "waiting" && (
          <section className="mb-6 border border-white/[0.08] bg-[#11110f] px-6 py-10 text-center sm:px-10">
            <div className="mx-auto mb-6 flex h-10 w-10 items-center justify-center border border-[#c7a96b]/25 bg-[#c7a96b]/[0.05]">
              <Copy className="h-4 w-4 text-[#c7a96b]" />
            </div>

            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#c7a96b]">
              Waiting for opponent
            </p>

            <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em] text-white">
              Your board is ready.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/30">
              Share the room code with your opponent to begin the match.
            </p>

            <button
              type="button"
              onClick={copyRoomCode}
              className="mx-auto mt-7 flex cursor-pointer items-center gap-4 border border-white/[0.1] bg-[#0c0c0b] px-6 py-4 transition-colors hover:border-[#c7a96b]/40"
            >
              <span className="font-mono text-2xl font-semibold tracking-[0.35em] text-white">
                {roomCode}
              </span>

              {copied ? (
                <Check className="h-4 w-4 text-[#c7a96b]" />
              ) : (
                <Copy className="h-4 w-4 text-white/25" />
              )}
            </button>

            <p className="mt-4 text-[8px] uppercase tracking-[0.2em] text-white/15">
              Click the code to copy
            </p>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between border-y border-white/[0.07] px-1 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center border border-white/[0.08] bg-[#11110f] text-xs font-serif text-white/60">
                  {opponent?.username?.charAt(0).toUpperCase() || "?"}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/75">
                      {opponent?.username || "Waiting for opponent..."}
                    </span>

                    {opponent?.isDisconnected && (
                      <span className="flex items-center gap-1 text-[8px] uppercase tracking-[0.15em] text-amber-300/70">
                        <AlertTriangle className="h-3 w-3" />
                        Disconnected
                      </span>
                    )}
                  </div>

                  <span className="text-[9px] uppercase tracking-[0.16em] text-white/20">
                    Playing as {opponentColor}
                  </span>
                </div>
              </div>

              <span className="hidden text-[8px] uppercase tracking-[0.25em] text-white/15 sm:block">
                Opponent
              </span>
            </div>

            <div className="border border-white/[0.08] bg-[#11110f] p-2 sm:p-4">
              <div className="flex justify-center">
                <ChessBoardComponent />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-y border-white/[0.07] px-1 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center bg-[#e9e4d8] text-xs font-semibold text-[#11110f]">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>

                <div>
                  <span className="block text-xs font-semibold text-white/75">
                    {user?.username}{" "}
                    <span className="font-normal text-white/25">(You)</span>
                  </span>

                  <span className="text-[9px] uppercase tracking-[0.16em] text-white/20">
                    Playing as {playerColor}
                  </span>
                </div>
              </div>

              <span className="hidden text-[8px] uppercase tracking-[0.25em] text-[#c7a96b]/60 sm:block">
                Your side
              </span>
            </div>
          </section>

          <aside className="border border-white/[0.08] bg-[#11110f]">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div>
                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#c7a96b]">
                  Match record
                </span>

                <h2 className="mt-1 font-serif text-xl text-white">
                  Move history
                </h2>
              </div>

              <span className="font-mono text-[10px] text-white/20">
                {moveHistory.length} moves
              </span>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {moveHistory.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center border border-white/[0.07] text-white/15">
                    <span className="font-serif text-lg">♟</span>
                  </div>

                  <p className="mt-4 text-xs text-white/25">
                    No moves played yet.
                  </p>

                  <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/10">
                    The game begins when you move
                  </p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-[#11110f]">
                    <tr className="border-b border-white/[0.07]">
                      <th className="px-5 py-3 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/20">
                        #
                      </th>

                      <th className="px-3 py-3 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/20">
                        White
                      </th>

                      <th className="px-3 py-3 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/20">
                        Black
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.05] font-mono text-xs">
                    {Array.from({
                      length: Math.ceil(moveHistory.length / 2),
                    }).map((_, idx) => {
                      const whiteMove = moveHistory[idx * 2];
                      const blackMove = moveHistory[idx * 2 + 1];

                      return (
                        <tr
                          key={idx}
                          className="transition-colors hover:bg-white/[0.025]"
                        >
                          <td className="px-5 py-3 text-white/15">
                            {idx + 1}
                          </td>

                          <td className="px-3 py-3 font-medium text-white/65">
                            {whiteMove?.san || "—"}
                          </td>

                          <td className="px-3 py-3 font-medium text-white/65">
                            {blackMove?.san || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </aside>
        </div>
      </div>

      {status === "finished" && gameOverDetails && (
        <GameOverModal
          gameOverDetails={gameOverDetails}
          userId={user?.id}
          onRematch={handleRequestRematch}
          onLeave={handleLeaveRoom}
        />
      )}

      {rematchOfferedBy && (
        <OfferModal
          eyebrow="Rematch"
          title="Another game?"
          description={`${rematchOfferedBy.username} wants a rematch. Colors will be swapped.`}
          icon={<RotateCcw className="h-5 w-5" />}
          acceptLabel="Accept rematch"
          declineLabel="Decline"
          onAccept={() => handleRespondRematch(true)}
          onDecline={() => handleRespondRematch(false)}
        />
      )}

      {drawOfferedBy && (
        <OfferModal
          eyebrow="Draw offer"
          title="Accept a draw?"
          description={`${drawOfferedBy.username} has offered a draw. Do you accept?`}
          icon={<Handshake className="h-5 w-5" />}
          acceptLabel="Accept draw"
          declineLabel="Decline"
          onAccept={() => handleRespondDraw(true)}
          onDecline={() => handleRespondDraw(false)}
        />
      )}
    </main>
  );
};

interface GameOverModalProps {
  gameOverDetails: {
    isDraw?: boolean;
    winnerId?: string;
    winnerUsername?: string;
    drawReason?: string;
    winReason?: string;
  };
  userId?: string;
  onRematch: () => void;
  onLeave: () => void;
}

const GameOverModal = ({
  gameOverDetails,
  userId,
  onRematch,
  onLeave,
}: GameOverModalProps) => {
  const isDraw = gameOverDetails.isDraw;
  const won = gameOverDetails.winnerId === userId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c0b]/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md border border-white/[0.09] bg-[#11110f] p-8 text-center">
        <div className="absolute left-0 top-0 h-full w-px bg-[#c7a96b]" />

        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-white/[0.1] bg-white/[0.025]">
          {isDraw ? (
            <Handshake className="h-5 w-5 text-white/50" />
          ) : won ? (
            <Trophy className="h-5 w-5 text-[#c7a96b]" />
          ) : (
            <Frown className="h-5 w-5 text-red-300/60" />
          )}
        </div>

        <div className="mt-6">
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#c7a96b]">
            Match complete
          </span>

          <h2 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-white">
            {isDraw
              ? "Game drawn."
              : won
                ? "You won."
                : `${gameOverDetails.winnerUsername || "Opponent"} won.`}
          </h2>

          <p className="mt-3 text-sm text-white/30">
            {isDraw
              ? `Draw by ${gameOverDetails.drawReason || "agreement"}`
              : `Victory by ${gameOverDetails.winReason || "checkmate"}`}
          </p>
        </div>

        <div className="mt-8 grid gap-2">
          <button
            type="button"
            onClick={onRematch}
            className="flex cursor-pointer items-center justify-center gap-2 bg-[#e9e4d8] py-3.5 text-xs font-bold text-[#11110f] transition-colors hover:bg-white"
          >
            <RotateCcw className="h-4 w-4" />
            Play rematch
          </button>

          <button
            type="button"
            onClick={onLeave}
            className="flex cursor-pointer items-center justify-center gap-2 border border-white/[0.1] py-3.5 text-xs font-semibold text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.03] hover:text-white"
          >
            <Home className="h-4 w-4" />
            Return to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

interface OfferModalProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  acceptLabel: string;
  declineLabel: string;
  onAccept: () => void;
  onDecline: () => void;
}

const OfferModal = ({
  eyebrow,
  title,
  description,
  icon,
  acceptLabel,
  declineLabel,
  onAccept,
  onDecline,
}: OfferModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c0b]/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md border border-white/[0.09] bg-[#11110f] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#c7a96b]/25 bg-[#c7a96b]/[0.05] text-[#c7a96b]">
          {icon}
        </div>

        <div className="mt-6">
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#c7a96b]">
            {eyebrow}
          </span>

          <h2 className="mt-3 font-serif text-3xl tracking-[-0.035em] text-white">
            {title}
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/30">
            {description}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="cursor-pointer bg-[#e9e4d8] py-3.5 text-xs font-bold text-[#11110f] transition-colors hover:bg-white"
          >
            {acceptLabel}
          </button>

          <button
            type="button"
            onClick={onDecline}
            className="cursor-pointer border border-white/10 py-3.5 text-xs font-semibold text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.03] hover:text-white"
          >
            {declineLabel}
          </button>
        </div>
      </div>
    </div>
  );
};