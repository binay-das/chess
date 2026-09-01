import { useEffect, useState } from "react";
import { useAuthStore } from "../store/AuthStore";
import { useGameStore } from "../store/GameStore";
import { connectSocket, getSocket } from "../services/socket";
import { JoinRoomModal } from "../components/JoinRoomModal";
import {
  Trophy,
  AlertCircle,
  Gamepad2,
  Award,
  XCircle,
  Zap,
  Plus,
  KeyRound,
  ArrowUpRight,
} from "lucide-react";
import { GameScreen } from "../components/GameScreen";
import {
  StatSkeleton,
  MatchHistorySkeleton,
} from "../components/DashboardSkeleton";

import type { PlayerInfo, MoveRecord, GameOverDetails } from "../store/GameStore";

interface RoomEventPayload {
  roomCode?: string;
  status?: "waiting" | "playing" | "finished";
  players?: PlayerInfo[];
  game?: {
    fen: string;
    pgn: string;
    turn: "white" | "black";
    moveHistory?: MoveRecord[];
  };
  room?: {
    roomCode?: string;
    status?: "waiting" | "playing" | "finished";
    players?: PlayerInfo[];
    game?: {
      fen: string;
      pgn: string;
      turn: "white" | "black";
      moveHistory?: MoveRecord[];
    };
  };
}

interface GameStartedPayload {
  roomCode: string;
  fen: string;
  pgn?: string;
  turn: "white" | "black";
  players?: PlayerInfo[];
}

interface GameMovedPayload {
  fen: string;
  pgn: string;
  turn: "white" | "black";
  move: MoveRecord;
  isCheck?: boolean;
}

interface GameRestoredPayload {
  roomCode: string;
  status: "waiting" | "playing" | "finished";
  players: PlayerInfo[];
  fen: string;
  pgn: string;
  turn: "white" | "black";
  moveHistory?: MoveRecord[];
}

interface OfferPayload {
  offeredBy: { userId: string; username: string };
}

interface ErrorPayload {
  error?: string;
}

interface GameHistoryItem {
  id: string;
  whitePlayer: { id: string; username: string };
  blackPlayer: { id: string; username: string };
  winnerId?: string;
  result: string;
  createdAt: string;
}

interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export const DashboardPage = () => {
  const { user } = useAuthStore();

  const {
    roomCode,
    setRoomState,
    updateMove,
    setGameOver,
    setDrawOfferedBy,
    setRematchOfferedBy,
    setError,
    error: gameError,
  } = useGameStore();

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentGames, setRecentGames] = useState<GameHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const baseUrl = import.meta.env.VITE_API_URL;

        // Fetch Profile & Stats
        const profileRes = await fetch(`${baseUrl}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (profileRes.ok) {
          const result = await profileRes.json();

          if (result.data?.stats) {
            setStats(result.data.stats);
          }
        }

        // Fetch Games History
        const gamesRes = await fetch(`${baseUrl}/games`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (gamesRes.ok) {
          const result = await gamesRes.json();

          if (result.games) {
            setRecentGames(result.games);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!user) return;

    const socket = connectSocket();

    socket.emit("game:reconnect");



    const onRoomCreated = (data: RoomEventPayload) => {
      if (!data.roomCode && !data.room?.roomCode) return;
      setRoomState({
        roomCode: data.roomCode || data.room?.roomCode || "",
        status: data.room?.status || "waiting",
        players: data.players || data.room?.players || [],
        currentUserId: user.id,
      });
    };

    const onRoomJoined = (data: RoomEventPayload) => {
      if (!data.roomCode && !data.room?.roomCode) return;
      setRoomState({
        roomCode: data.roomCode || data.room?.roomCode || "",
        status: data.room?.status || "playing",
        players: data.players || data.room?.players || [],
        currentUserId: user.id,
        game: data.room?.game,
      });
    };

    const onRoomState = (data: RoomEventPayload) => {
      const room = data.room || data;

      if (room && room.roomCode) {
        const currentStatus = useGameStore.getState().status;

        const statusToSet =
          room.status === "finished" ||
            (currentStatus === "finished" && room.status !== "playing")
            ? "finished"
            : room.status || "waiting";

        setRoomState({
          roomCode: room.roomCode,
          status: statusToSet,
          players: room.players || [],
          currentUserId: user.id,
          game: room.game,
        });
      }
    };

    const onGameStarted = (data: GameStartedPayload) => {
      setRoomState({
        roomCode: data.roomCode,
        status: "playing",
        players: data.players || [],
        currentUserId: user.id,
        game: {
          fen: data.fen,
          pgn: data.pgn || "",
          turn: data.turn,
        },
      });
    };

    const onGameMoved = (data: GameMovedPayload) => {
      updateMove({
        fen: data.fen,
        pgn: data.pgn,
        turn: data.turn,
        move: data.move,
        isCheck: data.isCheck,
      });
    };

    const onGameOver = (data: GameOverDetails) => {
      setGameOver({
        winnerId: data.winnerId,
        winnerUsername: data.winnerUsername,
        winReason: data.winReason,
        isDraw: data.isDraw,
        drawReason: data.drawReason,
      });
    };

    const onGameRestored = (data: GameRestoredPayload) => {
      setRoomState({
        roomCode: data.roomCode,
        status: data.status,
        players: data.players,
        currentUserId: user.id,
        game: {
          fen: data.fen,
          pgn: data.pgn,
          turn: data.turn,
          moveHistory: data.moveHistory,
        },
      });
    };

    const onDrawOffered = (data: OfferPayload) => {
      setDrawOfferedBy(data.offeredBy);
    };

    const onDrawDeclined = () => {
      alert("Your draw offer was declined.");
    };

    const onRematchOffered = (data: OfferPayload) => {
      setRematchOfferedBy(data.offeredBy);
    };

    const onRematchDeclined = () => {
      alert("Your rematch request was declined.");
    };

    const onError = (data: ErrorPayload) => {
      setError(data.error || "An error occurred");
    };

    socket.on("room:created", onRoomCreated);
    socket.on("room:joined", onRoomJoined);
    socket.on("room:player_joined", onRoomState);
    socket.on("room:state", onRoomState);
    socket.on("game:started", onGameStarted);
    socket.on("game:start", onGameStarted);
    socket.on("game:moved", onGameMoved);
    socket.on("game:over", onGameOver);
    socket.on("game:restored", onGameRestored);
    socket.on("game:draw_offered", onDrawOffered);
    socket.on("game:draw_declined", onDrawDeclined);
    socket.on("game:rematch_offered", onRematchOffered);
    socket.on("game:rematch_declined", onRematchDeclined);
    socket.on("room:error", onError);
    socket.on("game:error", onError);

    return () => {
      socket.off("room:created", onRoomCreated);
      socket.off("room:joined", onRoomJoined);
      socket.off("room:player_joined", onRoomState);
      socket.off("room:state", onRoomState);
      socket.off("game:started", onGameStarted);
      socket.off("game:start", onGameStarted);
      socket.off("game:moved", onGameMoved);
      socket.off("game:over", onGameOver);
      socket.off("game:restored", onGameRestored);
      socket.off("game:draw_offered", onDrawOffered);
      socket.off("game:draw_declined", onDrawDeclined);
      socket.off("game:rematch_offered", onRematchOffered);
      socket.off("game:rematch_declined", onRematchDeclined);
      socket.off("room:error", onError);
      socket.off("game:error", onError);
    };
  }, [
    user,
    setRoomState,
    updateMove,
    setGameOver,
    setDrawOfferedBy,
    setRematchOfferedBy,
    setError,
  ]);

  useEffect(() => {
    if (roomCode) {
      document.title = `Live Match (${roomCode}) | ChessArena`;
    } else {
      document.title = "Dashboard | ChessArena";
    }
  }, [roomCode]);

  const handleCreateRoom = () => {
    const socket = getSocket();
    socket.emit("room:create");
  };

  if (roomCode) {
    return <GameScreen />;
  }

  const rating = user?.rating || 1200;

  return (
    <main className="min-h-[calc(100vh-72px)] bg-(--bg-main) text-(--text-primary) transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <section className="grid gap-12 border-b border-(--border-8) pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-7 flex items-center gap-3 text-[10px] font-semibold tracking-[0.3em] text-(--text-muted-30)">
              Player dashboard
            </div>

            <h1 className="max-w-3xl font-serif text-5xl leading-[0.95] tracking-[-0.045em] text-(--text-heading) sm:text-6xl lg:text-7xl">
              Welcome back,
              <br />
              <span className="italic text-(--accent-gold)">
                {user?.username || "player"}.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-sm leading-7 text-(--text-muted-35)">
              Your games. Your rating. Your next move.
              <span className="mx-2 text-(--text-muted-15)">•</span>
              {user?.email}
            </p>
          </div>

          <div className="relative border border-(--border-9) bg-(--bg-surface-1) px-7 py-6 lg:min-w-57.5">
            <div className="absolute left-0 top-0 h-full w-px bg-(--accent-gold)" />

            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-(--accent-gold)" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-(--text-muted-30)">
                Current rating
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-serif text-4xl tracking-[-0.03em] text-(--text-heading)">
                {rating}
              </span>

              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-(--text-muted-25)">
                Elo
              </span>
            </div>
          </div>
        </section>

        {gameError && (
          <button
            type="button"
            onClick={() => setError(null)}
            className="mt-8 flex w-full cursor-pointer items-center justify-between border border-red-400/20 bg-red-400/5 px-5 py-4 text-left text-xs text-red-300 transition-colors hover:bg-red-400/8"
          >
            <span className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {gameError}
            </span>

            <span className="text-[9px] uppercase tracking-[0.15em] text-red-300/50">
              Dismiss
            </span>
          </button>
        )}

        <section className="mt-12 border-y border-(--border-8)">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Total games"
              value={stats?.totalGames ?? 0}
              icon={<Gamepad2 className="h-4 w-4" />}
              loading={loadingHistory}
            />

            <Stat
              label="Victories"
              value={stats?.wins ?? 0}
              icon={<Award className="h-4 w-4" />}
              accent
              loading={loadingHistory}
            />

            <Stat
              label="Defeats"
              value={stats?.losses ?? 0}
              icon={<XCircle className="h-4 w-4" />}
              loading={loadingHistory}
            />

            <Stat
              label="Win rate"
              value={`${stats?.winRate ?? 0}%`}
              icon={<Zap className="h-4 w-4" />}
              accent
              loading={loadingHistory}
            />
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-7 flex items-end justify-between gap-6">
            <div>
              <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.28em] text-(--accent-gold)">
                The board
              </div>

              <h2 className="font-serif text-4xl tracking-[-0.035em] text-(--text-heading)">
                Play
              </h2>

              <p className="mt-2 text-sm text-(--text-muted-30)">
                Choose how you want to enter the board.
              </p>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden border border-(--border-8) bg-(--border-8) lg:grid-cols-[1.2fr_1fr]">
            <div className="group relative flex min-h-75 flex-col justify-between bg-(--bg-surface-1) p-7 sm:p-9">
              <div className="absolute right-8 top-8 text-(--accent-gold)/20 transition-colors group-hover:text-(--accent-gold)/40">
                <Plus className="h-8 w-8" strokeWidth={1} />
              </div>

              <div>
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-(--accent-gold)/25 bg-(--accent-gold)/5">
                    <Plus className="h-4 w-4 text-(--accent-gold)" />
                  </div>

                  <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-(--accent-gold)">
                    Host match
                  </span>
                </div>

                <h3 className="font-serif text-3xl tracking-tight text-(--text-heading)">
                  Create a room
                </h3>

                <p className="mt-3 max-w-md text-sm leading-6 text-(--text-muted-30)">
                  Host a private match and invite an opponent with a room code.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCreateRoom}
                className="group/button mt-10 flex w-full cursor-pointer items-center justify-between border border-(--btn-primary-bg) bg-(--btn-primary-bg) px-5 py-3.5 text-xs font-bold text-(--btn-primary-text) transition-colors hover:bg-(--btn-primary-hover)"
              >
                <span>Create room</span>

                <ArrowUpRight className="h-4 w-4 transition-transform group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5" />
              </button>
            </div>

            <div className="group flex min-h-75 flex-col justify-between bg-(--bg-surface-4) p-7 sm:p-9">
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-(--border-10) bg-(--border-2)">
                    <KeyRound className="h-4 w-4 text-(--text-muted-45)" />
                  </div>

                  <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-(--text-muted-30)">
                    Join match
                  </span>
                </div>

                <h3 className="font-serif text-3xl tracking-tight text-(--text-heading)">
                  Join a room
                </h3>

                <p className="mt-3 max-w-md text-sm leading-6 text-(--text-muted-30)">
                  Have a room code? Enter it and join your opponent on the
                  board.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsJoinModalOpen(true)}
                className="group/button mt-10 flex w-full cursor-pointer items-center justify-between border border-(--border-12) bg-transparent px-5 py-3.5 text-xs font-semibold text-(--text-muted-70) transition-colors hover:border-(--border-20) hover:bg-(--border-5) hover:text-(--text-primary)"
              >
                <span>Enter room code</span>

                <ArrowUpRight className="h-4 w-4 transition-transform group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5" />
              </button>
            </div>
          </div>
        </section>

        <section className="mt-16 pb-12">
          <div className="mb-7">
            <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.28em] text-(--accent-gold)">
              Match history
            </div>

            <h2 className="font-serif text-4xl tracking-[-0.035em] text-(--text-heading)">
              Recent games
            </h2>

            <p className="mt-2 text-sm text-(--text-muted-30)">
              Your latest completed matches.
            </p>
          </div>

          {loadingHistory ? (
            <MatchHistorySkeleton />
          ) : recentGames.length === 0 ? (
            <div className="border border-(--border-8) bg-(--bg-surface-1) px-6 py-12 text-center">
              <Gamepad2 className="mx-auto h-6 w-6 text-(--text-muted-15)" />

              <p className="mt-4 text-sm text-(--text-muted-30)">
                No completed games yet.
              </p>

              <p className="mt-1 text-xs text-(--text-muted-15)">
                Play your first match to build your history.
              </p>
            </div>
          ) : (
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
                  {recentGames.map((game) => {
                    const isWhite = game.whitePlayer?.id === user?.id;
                    const isWinner = game.winnerId === user?.id;
                    const isDraw = game.result.toLowerCase().includes("draw");

                    const opponent = isWhite
                      ? game.blackPlayer?.username
                      : game.whitePlayer?.username;

                    return (
                      <tr
                        key={game.id}
                        className="group transition-colors hover:bg-(--table-hover)"
                      >
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center border border-(--border-8) bg-(--border-2)">
                              <span className="font-serif text-sm text-(--text-muted-50)">
                                {opponent?.charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>

                            <span className="text-sm font-medium text-(--text-muted-70)">
                              {opponent || "Unknown"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-5">
                          <div className="flex items-center gap-2 text-xs text-(--text-muted-35)">
                            <span
                              className={`h-3 w-3 border ${isWhite
                                ? "border-white/50 bg-[#f0ece3]"
                                : "border-zinc-700 bg-[#292825]"
                                }`}
                            />

                            {isWhite ? "White" : "Black"}
                          </div>
                        </td>

                        <td className="px-4 py-5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-[0.18em] ${isDraw
                              ? "text-(--text-muted-40)"
                              : isWinner
                                ? "text-emerald-400/80"
                                : "text-red-400/70"
                              }`}
                          >
                            {isDraw
                              ? "Draw"
                              : isWinner
                                ? "Victory"
                                : "Defeat"}
                          </span>
                        </td>

                        <td className="px-4 py-5 text-xs text-(--text-muted-20)">
                          {new Date(game.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </main>
  );
};

interface StatProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: boolean;
  loading?: boolean;
}

const Stat = ({ label, value, icon, accent, loading }: StatProps) => {
  return (
    <div className="border-r border-(--border-8) px-5 py-6 first:pl-0 last:border-r-0 lg:px-7">
      <div className="flex items-center gap-2 text-(--text-muted-20)">
        {icon}

        <span className="text-[9px] font-semibold uppercase tracking-[0.22em]">
          {label}
        </span>
      </div>

      {loading ? (
        <StatSkeleton />
      ) : (
        <div
          className={`mt-3 font-serif text-3xl tracking-[-0.03em] ${accent ? "text-(--accent-gold)" : "text-(--text-heading)"
            }`}
        >
          {value}
        </div>
      )}
    </div>
  );
};