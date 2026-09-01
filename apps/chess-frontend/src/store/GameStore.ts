import { create } from "zustand";
import type { MoveRecord, GameOverDetails, RoomPlayer as PlayerInfo } from "@repo/types";

export type { PlayerInfo, MoveRecord, GameOverDetails };

export interface GameState {
    roomCode: string | null;
    status: "idle" | "waiting" | "playing" | "finished";
    fen: string;
    pgn: string;
    turn: "white" | "black";
    playerColor: "white" | "black";
    players: PlayerInfo[];
    opponent: PlayerInfo | null;
    moveHistory: MoveRecord[];
    isCheck: boolean;
    gameOverDetails: GameOverDetails | null;
    drawOfferedBy: { userId: string; username: string } | null;
    rematchOfferedBy: { userId: string; username: string } | null;
    invalidMoveError: string | null;
    error: string | null;
    timers: { white: number; black: number } | null;

    // actions
    setRoomState: (roomData: {
        roomCode: string;
        status: "waiting" | "playing" | "finished";
        players: PlayerInfo[];
        currentUserId: string;
        game?: {
            fen: string;
            pgn: string;
            turn: "white" | "black";
            moveHistory?: MoveRecord[];
        }
    }) => void;

    updateMove: (moveData: {
        fen: string;
        pgn: string;
        turn: "white" | "black";
        move: MoveRecord;
        isCheck?: boolean;
    }) => void;

    setGameOver: (details: GameOverDetails) => void;

    setDrawOfferedBy: (user: { userId: string; username: string } | null) => void;

    setRematchOfferedBy: (user: { userId: string; username: string } | null) => void;

    setInvalidMoveError: (msg: string | null) => void;

    setError: (error: string | null) => void;
    
    updateTimers: (timers: { white: number; black: number }) => void;

    resetGame: () => void;
}

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";


export const useGameStore = create<GameState>((set) => ({
    roomCode: null,
    status: "idle",
    fen: DEFAULT_FEN,
    pgn: "",
    turn: "white",
    playerColor: "white",
    players: [],
    opponent: null,
    moveHistory: [],
    isCheck: false,
    gameOverDetails: null,
    drawOfferedBy: null,
    rematchOfferedBy: null,
    invalidMoveError: null,
    error: null,
    timers: null,

    setRoomState: ({
        roomCode,
        status,
        players,
        currentUserId,
        game
    }) => {
        const me = players.find(
            (p) => p.userId === currentUserId
        );

        const opponent = players.find(
            (p) => p.userId !== currentUserId
        );

        const playerColor = me ? me.color : "white";

        set({
            roomCode,
            status,
            players,
            opponent,
            playerColor,
            fen: game?.fen || DEFAULT_FEN,
            pgn: game?.pgn || "",
            turn: game?.turn || "white",
            moveHistory: game?.moveHistory || [],
            drawOfferedBy: null,
            rematchOfferedBy: null,
            invalidMoveError: null,
            error: null
        });
    },

    updateMove: ({
        fen, pgn, turn, move, isCheck = false
    }) => {
        set((state) => ({
            fen,
            pgn,
            turn,
            isCheck,
            moveHistory: [...state.moveHistory, move],
            invalidMoveError: null,
            error: null
        }))
    },

    setGameOver: (details) => {
        set({
            status: "finished",
            gameOverDetails: details,
            drawOfferedBy: null
        })
    },

    setDrawOfferedBy: (user) => {
        set({
            drawOfferedBy: user
        })
    },

    setRematchOfferedBy: (user) => {
        set({
            rematchOfferedBy: user
        })
    },

    setInvalidMoveError: (msg) => {
        set({
            invalidMoveError: msg
        })
    },

    setError: (error) => {
        set({
            error
        })
    },

    updateTimers: (timers) => {
        set({
            timers
        })
    },

    resetGame: () => {
        set({
            roomCode: null,
            status: "idle",
            fen: DEFAULT_FEN,
            pgn: "",
            turn: "white",
            playerColor: "white",
            players: [],
            opponent: null,
            moveHistory: [],
            isCheck: false,
            gameOverDetails: null,
            drawOfferedBy: null,
            rematchOfferedBy: null,
            invalidMoveError: null,
            error: null,
            timers: null,
        })
    }
}))