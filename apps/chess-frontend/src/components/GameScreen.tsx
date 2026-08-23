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

    // game actions
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

    const opponentColor = playerColor === "white" ? "black" : "white";

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
            {/* Header bar */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Room Code:</span>
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-sm font-bold tracking-widest text-slate-900">
                        {roomCode}
                    </span>
                    <button
                        onClick={copyRoomCode}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 cursor-pointer"
                    >
                        {copied ? (
                            <>
                                <span>Copied!</span>
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                            </>
                        ) : (
                            <>
                                <span>Copy Code</span>
                                <Copy className="h-3.5 w-3.5 text-slate-500" />
                            </>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {status === "playing" && (
                        <>
                            <button
                                onClick={handleOfferDraw}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 cursor-pointer"
                            >
                                <Handshake className="h-4 w-4 text-slate-600" />
                                <span>Offer Draw</span>
                            </button>
                            <button
                                onClick={handleResign}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 shadow-xs transition-all hover:bg-rose-100 active:scale-95 cursor-pointer"
                            >
                                <Flag className="h-4 w-4 text-rose-600" />
                                <span>Resign</span>
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleLeaveRoom}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-900 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95 cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Leave Room</span>
                    </button>
                </div>
            </div>

            {invalidMoveError && (
                <div
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600 shadow-xs transition-all hover:bg-red-100/60 animate-bounce"
                    onClick={() => setInvalidMoveError(null)}
                >
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{invalidMoveError}</span>
                </div>
            )}

            {status === "waiting" && (
                <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">Waiting for Opponent to Join...</h2>
                        <p className="text-xs text-slate-500">Share this room code with a friend to start the match:</p>
                    </div>
                    <div
                        className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 font-mono text-2xl font-bold tracking-widest text-slate-900 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-100"
                        onClick={copyRoomCode}
                    >
                        {roomCode}
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <Copy className="h-3.5 w-3.5" /> Click code to copy
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="flex flex-col space-y-4 lg:col-span-2">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-800">
                                {opponent?.username?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">
                                    {opponent ? opponent.username : "Waiting for opponent..."}
                                </span>
                                <span className="text-xs capitalize text-slate-500">Playing as {opponentColor}</span>
                            </div>
                        </div>
                        {opponent?.isDisconnected && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                <span>Disconnected</span>
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                            </span>
                        )}
                    </div>

                    <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <ChessBoardComponent />
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{user?.username} (You)</span>
                            <span className="text-xs capitalize text-slate-500">Playing as {playerColor}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Move History
                    </h3>
                    <div className="max-h-110 overflow-y-auto pr-1">
                        {moveHistory.length === 0 ? (
                            <p className="py-8 text-center text-xs text-slate-400">No moves played yet.</p>
                        ) : (
                            <table className="w-full text-left text-xs text-slate-700">
                                <thead className="sticky top-0 bg-slate-50 text-[10px] font-semibold uppercase text-slate-500">
                                    <tr>
                                        <th className="rounded-l-md px-3 py-2">#</th>
                                        <th className="px-3 py-2">White</th>
                                        <th className="rounded-r-md px-3 py-2">Black</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-mono">
                                    {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, idx) => {
                                        const whiteMove = moveHistory[idx * 2];
                                        const blackMove = moveHistory[idx * 2 + 1];
                                        return (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="font-sans text-slate-400 px-3 py-2">{idx + 1}.</td>
                                                <td className="font-medium text-slate-900 px-3 py-2">{whiteMove?.san || ""}</td>
                                                <td className="font-medium text-slate-900 px-3 py-2">{blackMove?.san || ""}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>





        </div>
    );
};