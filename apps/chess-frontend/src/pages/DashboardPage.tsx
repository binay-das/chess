import { useEffect, useState } from "react";
import { useAuthStore } from "../store/AuthStore"
import { useGameStore } from "../store/GameStore";
import { connectSocket, getSocket } from "../services/socket";
import { JoinRoomModal } from "../components/JoinRoomModal";
import { Trophy, AlertCircle, Gamepad2, Award, XCircle, Zap, Plus, KeyRound } from "lucide-react";
import { GameScreen } from "../components/GameScreen";

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
    const { roomCode,
        setRoomState,
        updateMove,
        setGameOver,
        setDrawOfferedBy,
        setRematchOfferedBy,
        setError,
        error: gameError
    } = useGameStore();

    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [recentGames, setRecentGames] = useState<GameHistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const loadDasboardData = async () => {
        try {
            const response = await fetch('/api/users/stats');
            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }
            const data = await response.json();
            setStats(data);

            const [statRes, gameRes] = await Promise.all([
                fetch('/users/stats'),
                fetch('/games')
            ]);

            if (!statRes.ok || !gameRes.ok) {
            }

            if (statRes.ok) {
                const statData = await statRes.json();
                setStats(statData.data);
            }

            if (gameRes.ok) {
                const gameData = await gameRes.json();
                setStats(gameData.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoadingHistory(false);
        }
    }

    useEffect(() => {
        loadDasboardData();
    }, []);


    useEffect(() => {
        if (!user) return;

        const socket = connectSocket();

        // check if player has any ongoing game to reconnect
        socket.emit("game:reconnect");

        const onRoomCreated = (data: any) => {
            setRoomState({
                roomCode: data.roomCode,
                status: data.room?.status || "waiting",
                players: data.players || data.room?.players || [],
                currentUserId: user.id,
            });
        };

        const onRoomJoined = (data: any) => {
            setRoomState({
                roomCode: data.roomCode,
                status: data.room?.status || "playing",
                players: data.players || data.room?.players || [],
                currentUserId: user.id,
                game: data.room?.game,
            });
        };

        const onRoomState = (data: any) => {
            const room = data.room || data;
            if (room && room.roomCode) {
                setRoomState({
                    roomCode: room.roomCode,
                    status: room.status,
                    players: room.players || [],
                    currentUserId: user.id,
                    game: room.game,
                });
            }
        };

        const onGameStarted = (data: any) => {
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


        const onGameMoved = (data: any) => {
            updateMove({
                fen: data.fen,
                pgn: data.pgn,
                turn: data.turn,
                move: data.move,
                isCheck: data.isCheck,
            });
        };

        const onGameOver = (data: any) => {
            setGameOver({
                winnerId: data.winnerId,
                winnerUsername: data.winnerUsername,
                winReason: data.winReason,
                isDraw: data.isDraw,
                drawReason: data.drawReason,
            });
        };



        const onGameRestored = (data: any) => {
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


        const onDrawOffered = (data: any) => {
            setDrawOfferedBy(data.offeredBy);
        };

        const onDrawDeclined = () => {
            alert("Your draw offer was declined.");
        };

        const onRematchOffered = (data: any) => {
            setRematchOfferedBy(data.offeredBy);
        };

        const onRematchDeclined = () => {
            alert("Your rematch request was declined.");
        };

        const onError = (data: any) => {
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
    }, [user, setRoomState, updateMove, setGameOver, setDrawOfferedBy, setRematchOfferedBy, setError]);



    const handleCreateRoom = () => {
        const socket = getSocket();
        socket.emit("room:create");
    };

    if (roomCode) {
        return <GameScreen />;
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Welcome back, <span className="font-extrabold text-slate-900">{user?.username}</span>!
                    </h1>
                    <p className="text-sm font-medium text-slate-500">
                        {user?.email} • Real-time Multiplayer Chess Arena
                    </p>
                </div>

                <div className="flex items-center gap-3.5 self-start rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-xs sm:self-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100/80">
                        <Trophy className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Rating</span>
                        <span className="text-lg font-bold text-slate-900">{user?.rating || 1200} Elo</span>
                    </div>
                </div>
            </div>

            {gameError && (
                <div className="flex cursor-pointer items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600 shadow-xs transition-all hover:bg-red-100/50" onClick={() => setError(null)}>
                    <span className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                        <span>{gameError} (click to dismiss)</span>
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                        <Gamepad2 className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold tracking-tight text-slate-900">{stats?.totalGames ?? 0}</span>
                        <span className="text-xs font-medium text-slate-500">Total Games</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                        <Award className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold tracking-tight text-emerald-600">{stats?.wins ?? 0}</span>
                        <span className="text-xs font-medium text-slate-500">Victories</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600">
                        <XCircle className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold tracking-tight text-rose-600">{stats?.losses ?? 0}</span>
                        <span className="text-xs font-medium text-slate-500">Defeats</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold tracking-tight text-amber-600">{stats?.winRate ?? 0}%</span>
                        <span className="text-xs font-medium text-slate-500">Win Rate</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Play Chess</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-600">HOST MATCH</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Create a Room</h3>
                            <p className="text-xs leading-relaxed text-slate-500">Generate a unique 6-character room code to host a game with a friend.</p>
                        </div>
                        <button onClick={handleCreateRoom} className="mt-6 flex w-full items-center justify-center rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.99] cursor-pointer">
                            Create Room
                        </button>
                    </div>

                    <div className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-600">JOIN MATCH</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Join Existing Room</h3>
                            <p className="text-xs leading-relaxed text-slate-500">Enter a 6-character room code from your opponent to join an active room.</p>
                        </div>
                        <button onClick={() => setIsJoinModalOpen(true)} className="mt-6 flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] cursor-pointer">
                            Join Room
                        </button>
                    </div>
                </div>
            </div>

            {/* Previous Games Table Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Previous Games</h2>
                {loadingHistory ? (
                    <div className="p-8 text-center text-slate-400">Loading match history...</div>
                ) : recentGames?.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500 shadow-sm">
                        <p>No completed games found. Play your first match to build your history!</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left text-sm text-slate-700">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">White Player</th>
                                    <th className="px-4 py-3">Black Player</th>
                                    <th className="px-4 py-3">Result</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentGames.map((game) => {
                                    const isWhite = game.whitePlayer?.id === user?.id;
                                    const isWinner = game.winnerId === user?.id;
                                    const isDraw = game.result.toLowerCase().includes("draw");

                                    return (
                                        <tr
                                            key={game.id}
                                            className="cursor-pointer hover:bg-slate-50 transition-colors"
                                        // onClick={() => setSelectedReplayGameId(game.id)}
                                        >
                                            <td className="px-4 py-3">
                                                <span className={isWhite ? "font-bold text-slate-900" : ""}>
                                                    {game.whitePlayer?.username || "Unknown"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={!isWhite ? "font-bold text-slate-900" : ""}>
                                                    {game.blackPlayer?.username || "Unknown"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${isDraw
                                                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                                                        : isWinner
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : "bg-rose-50 text-rose-700 border border-rose-200"
                                                        }`}
                                                >
                                                    {isDraw ? "Draw" : isWinner ? "Victory" : "Defeat"} ({game.result})
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 text-sm">
                                                {new Date(game.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <JoinRoomModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
        </div>
    );
}