import { Color, MoveRecord, WinReason, DrawReason, GameTimers } from "./game";

export interface RoomPlayer {
    userId: string;
    username: string;
    socketId?: string;
    color: Color;
    joinedAt?: Date | string;
    isDisconnected?: boolean;
}

export interface RoomGame {
    fen: string;
    pgn: string;
    turn: Color;
    moveHistory: MoveRecord[];
    winnerId?: string;
    winReason?: WinReason;
    isDraw?: boolean;
    drawReason?: DrawReason;
    timers?: GameTimers;
}

export interface Room {
    roomCode: string;
    hostId?: string;
    players: RoomPlayer[];
    status: "waiting" | "playing" | "finished";
    createdAt?: Date | string;
    game?: RoomGame;
}

export interface JoinRoomResult {
    success: boolean;
    room?: Room;
    error?: string;
    gameStarted?: boolean;
}

export interface LeaveRoomResult {
    success: boolean;
    room?: Room;
    roomDeleted: boolean;
    wasActiveGame?: boolean;
    winnerId?: string;
    error?: string;
}
