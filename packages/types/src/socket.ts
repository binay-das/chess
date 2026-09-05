import type { Color, MoveRecord, GameOverDetails } from "./game";
import type { Room, RoomPlayer, RoomGame } from "./room";

export interface RoomEventPayload {
    message?: string;
    roomCode?: string;
    status?: "waiting" | "playing" | "finished";
    room?: Room;
    players?: RoomPlayer[];
    game?: RoomGame;
    joinedUser?: { userId: string; username: string };
}

export interface GameStartedPayload {
    roomCode: string;
    fen: string;
    pgn?: string;
    turn: Color;
    players: RoomPlayer[];
}

export interface GameMovedPayload {
    fen: string;
    pgn: string;
    turn: Color;
    move: MoveRecord;
    isCheck?: boolean;
}

export interface GameRestoredPayload {
    roomCode: string;
    status?: "waiting" | "playing" | "finished";
    fen: string;
    pgn: string;
    turn: Color;
    players: RoomPlayer[];
    moveHistory: MoveRecord[];
    gameOverDetails?: GameOverDetails;
}

export interface OfferPayload {
    offeredBy: {
        userId: string;
        username: string;
    };
}

export interface ErrorPayload {
    error: string;
}

export interface QueuedPlayer {
    userId: string;
    username: string;
    socket?: any;
    joinedAt: number;
}
