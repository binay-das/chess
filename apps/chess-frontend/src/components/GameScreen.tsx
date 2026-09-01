import { useState } from "react";
import type { GameOverModalProps, OfferModalProps } from "@repo/types";
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
    timers,
  } = useGameStore();

  const [copied, setCopied] = useState<boolean>(false);

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

  const formatTime = (ms?: number) => {
    if (ms === undefined) return "10:00";
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const myTimeMs = timers?.[playerColor];
  const opponentTimeMs = timers?.[opponentColor];

  const myTimeStr = formatTime(myTimeMs);
  const opponentTimeStr = formatTime(opponentTimeMs);

  const isMyTimeLow = myTimeMs !== undefined && myTimeMs <= 59999;
  const isOpponentTimeLow = opponentTimeMs !== undefined && opponentTimeMs <= 59999;

  return (
    <main className="min-h-[calc(100vh-72px)] bg-(--bg-main) text-(--text-primary) transition-colors duration-200">
      <div className="mx-auto max-w-375 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex flex-col gap-5 border-b border-(--border-10) pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-(--accent-gold)">
                Live match
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <h1 className="font-serif text-3xl tracking-[-0.035em] text-(--text-heading) sm:text-4xl">
                The board
              </h1>

              <button
                type="button"
                onClick={copyRoomCode}
                title="Click to copy room code"
                className="group flex cursor-pointer items-center gap-3.5 border border-(--accent-gold)/30 bg-(--bg-surface-1) px-4 py-2.5 transition-colors hover:border-(--accent-gold)/60 hover:bg-(--border-5)"
              >
                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-(--accent-gold)">
                  Room
                </span>

                <span className="font-mono text-sm font-bold tracking-[0.28em] text-(--text-primary)">
                  {roomCode}
                </span>

                {copied ? (
                  <Check className="h-4 w-4 text-(--accent-gold)" />
                ) : (
                  <Copy className="h-4 w-4 text-(--text-muted-35) transition-colors group-hover:text-(--text-muted-80)" />
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
                  className="flex cursor-pointer items-center gap-2 border border-(--border-10) bg-(--bg-surface-1) px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-(--text-muted-55) transition-colors hover:border-(--border-20) hover:bg-(--border-5) hover:text-(--text-primary)"
                >
                  <Handshake className="h-3.5 w-3.5" />
                  Draw
                </button>

                <button
                  type="button"
                  onClick={handleResign}
                  className="flex cursor-pointer items-center gap-2 border border-red-400/15 bg-red-400/5 px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-300/70 transition-colors hover:border-red-400/25 hover:bg-red-400/10 hover:text-red-300"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Resign
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleLeaveRoom}
              className="flex cursor-pointer items-center gap-2 border border-(--border-10) bg-(--border-5) px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-(--text-muted-60) transition-colors hover:border-(--border-20) hover:bg-(--border-10) hover:text-(--text-primary)"
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
            className="mb-6 flex w-full cursor-pointer items-center justify-between border border-red-400/20 bg-red-400/5 px-4 py-3 text-left text-xs text-red-300 transition-colors hover:bg-red-400/10"
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
          <div className="mb-6 flex items-center gap-3 border border-(--accent-gold)/20 bg-(--accent-gold)/5 px-4 py-3 text-xs text-(--text-muted-70)">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--accent-gold) opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-(--accent-gold)" />
            </span>

            <span className="font-semibold text-(--text-primary)">
              Waiting for opponent to join...
            </span>

            <span className="hidden text-(--text-muted-20) sm:inline">•</span>

            <span className="hidden text-(--text-muted-50) sm:inline">
              Share the room code with your opponent to begin the match.
            </span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between border-y border-(--border-10) px-1 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center border border-(--border-10) bg-(--bg-surface-1) text-xs font-serif text-(--text-muted-60)">
                  {opponent?.username?.charAt(0).toUpperCase() || "?"}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-(--text-muted-75)">
                      {opponent?.username || "Waiting for opponent..."}
                    </span>

                    {opponent?.isDisconnected && (
                      <span className="flex items-center gap-1 text-[8px] uppercase tracking-[0.15em] text-amber-300/70">
                        <AlertTriangle className="h-3 w-3" />
                        Disconnected
                      </span>
                    )}
                  </div>

                  <span className="text-[9px] uppercase tracking-[0.16em] text-(--text-muted-20)">
                    Playing as {opponentColor}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="hidden text-[8px] uppercase tracking-[0.25em] text-(--text-muted-15) sm:block">
                  Opponent
                </span>
                <span className={`font-mono text-lg font-bold ${isOpponentTimeLow ? "text-red-500" : "text-(--text-muted-75)"}`}>
                  {opponentTimeStr}
                </span>
              </div>
            </div>

            <div className="border border-(--border-10) bg-(--bg-surface-1) p-2 sm:p-4">
              <div className="flex justify-center">
                <ChessBoardComponent />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-y border-(--border-10) px-1 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center bg-(--btn-profile-bg) text-xs font-semibold text-(--btn-profile-text)">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>

                <div>
                  <span className="block text-xs font-semibold text-(--text-muted-75)">
                    {user?.username}{" "}
                    <span className="font-normal text-(--text-muted-25)">(You)</span>
                  </span>

                  <span className="text-[9px] uppercase tracking-[0.16em] text-(--text-muted-20)">
                    Playing as {playerColor}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="hidden text-[8px] uppercase tracking-[0.25em] text-(--accent-gold)/60 sm:block">
                  Your side
                </span>
                <span className={`font-mono text-lg font-bold ${isMyTimeLow ? "text-red-500" : "text-(--text-muted-75)"}`}>
                  {myTimeStr}
                </span>
              </div>
            </div>
          </section>

          <aside className="border border-(--border-10) bg-(--bg-surface-1)">
            <div className="flex items-center justify-between border-b border-(--border-10) px-5 py-4">
              <div>
                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-(--accent-gold)">
                  Match record
                </span>

                <h2 className="mt-1 font-serif text-xl text-(--text-heading)">
                  Move history
                </h2>
              </div>

              <span className="font-mono text-[10px] text-(--text-muted-20)">
                {moveHistory.length} moves
              </span>
            </div>

            <div className="max-h-125 overflow-y-auto">
              {moveHistory.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center border border-(--border-10) text-(--text-muted-15)">
                    <span className="font-serif text-lg">♟</span>
                  </div>

                  <p className="mt-4 text-xs text-(--text-muted-25)">
                    No moves played yet.
                  </p>

                  <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-(--text-muted-10)">
                    The game begins when you move
                  </p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-(--bg-surface-1)">
                    <tr className="border-b border-(--border-10)">
                      <th className="px-5 py-3 text-[8px] font-semibold uppercase tracking-[0.2em] text-(--text-muted-20)">
                        #
                      </th>

                      <th className="px-3 py-3 text-[8px] font-semibold uppercase tracking-[0.2em] text-(--text-muted-20)">
                        White
                      </th>

                      <th className="px-3 py-3 text-[8px] font-semibold uppercase tracking-[0.2em] text-(--text-muted-20)">
                        Black
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-(--border-5) font-mono text-xs">
                    {Array.from({
                      length: Math.ceil(moveHistory.length / 2),
                    }).map((_, idx) => {
                      const whiteMove = moveHistory[idx * 2];
                      const blackMove = moveHistory[idx * 2 + 1];

                      return (
                        <tr
                          key={idx}
                          className="transition-colors hover:bg-(--border-5)"
                        >
                          <td className="px-5 py-3 text-(--text-muted-15)">
                            {idx + 1}
                          </td>

                          <td className="px-3 py-3 font-medium text-(--text-muted-65)">
                            {whiteMove?.san || "—"}
                          </td>

                          <td className="px-3 py-3 font-medium text-(--text-muted-65)">
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


const GameOverModal = ({
  gameOverDetails,
  userId,
  onRematch,
  onLeave,
}: GameOverModalProps) => {
  const isDraw = gameOverDetails.isDraw;
  const won = gameOverDetails.winnerId === userId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--bg-modal-backdrop) p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md border border-(--border-10) bg-(--bg-surface-1) p-8 text-center shadow-2xl">
        <div className="absolute left-0 top-0 h-full w-px bg-(--accent-gold)" />

        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-(--border-10) bg-(--border-5)">
          {isDraw ? (
            <Handshake className="h-5 w-5 text-(--text-muted-50)" />
          ) : won ? (
            <Trophy className="h-5 w-5 text-(--accent-gold)" />
          ) : (
            <Frown className="h-5 w-5 text-red-300/60" />
          )}
        </div>

        <div className="mt-6">
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-(--accent-gold)">
            Match complete
          </span>

          <h2 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-(--text-heading)">
            {isDraw
              ? "Game drawn."
              : won
                ? "You won."
                : `${gameOverDetails.winnerUsername || "Opponent"} won.`}
          </h2>

          <p className="mt-3 text-sm text-(--text-muted-30)">
            {isDraw
              ? `Draw by ${gameOverDetails.drawReason || "agreement"}`
              : `Victory by ${gameOverDetails.winReason || "checkmate"}`}
          </p>
        </div>

        <div className="mt-8 grid gap-2">
          <button
            type="button"
            onClick={onRematch}
            className="flex cursor-pointer items-center justify-center gap-2 bg-(--btn-primary-bg) py-3.5 text-xs font-bold text-(--btn-primary-text) transition-colors hover:bg-(--btn-primary-hover)"
          >
            <RotateCcw className="h-4 w-4" />
            Play rematch
          </button>

          <button
            type="button"
            onClick={onLeave}
            className="flex cursor-pointer items-center justify-center gap-2 border border-(--border-10) py-3.5 text-xs font-semibold text-(--text-muted-55) transition-colors hover:border-(--border-20) hover:bg-(--border-5) hover:text-(--text-primary)"
          >
            <Home className="h-4 w-4" />
            Return to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};


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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--bg-modal-backdrop) p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md border border-(--border-10) bg-(--bg-surface-1) p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-(--accent-gold)/25 bg-(--accent-gold)/5 text-(--accent-gold)">
          {icon}
        </div>

        <div className="mt-6">
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-(--accent-gold)">
            {eyebrow}
          </span>

          <h2 className="mt-3 font-serif text-3xl tracking-[-0.035em] text-(--text-heading)">
            {title}
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-(--text-muted-30)">
            {description}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="cursor-pointer bg-(--btn-primary-bg) py-3.5 text-xs font-bold text-(--btn-primary-text) transition-colors hover:bg-(--btn-primary-hover)"
          >
            {acceptLabel}
          </button>

          <button
            type="button"
            onClick={onDecline}
            className="cursor-pointer border border-(--border-10) py-3.5 text-xs font-semibold text-(--text-muted-55) transition-colors hover:border-(--border-20) hover:bg-(--border-5) hover:text-(--text-primary)"
          >
            {declineLabel}
          </button>
        </div>
      </div>
    </div>
  );
};