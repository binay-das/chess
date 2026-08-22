import { Chess } from "chess.js";

interface RoomPlayer {
    userId: string;
    username: string;
    socketId: string;
    color: "white" | "black";
    isDisconnected: boolean;
}

interface MoveRecord {
    from: string;
    to: string;
    san: string;
    promotion?: string;
    piece?: string;
    captured?: string;
    by: string;
    fenAfterMove: string;
    timestamp: Date;
}

interface RoomGame {
    chess: Chess;
    fen: string;
    pgn: string;
    turn: "white" | "black";
    moveHistory: MoveRecord[];
    winnerId?: string;
    winReason?: "checkmate" | "resign" | "disconnect" | "timeout";
    isDraw?: boolean;
    drawReason?: "stalemate" | "threefold" | "insufficient" | "50-move" | "agreement" | "draw";

}

interface Room {
    roomCode: string;
    hostId: string;
    players: RoomPlayer[];
    status: "waiting" | "playing" | "finished";
    createdAt: Date;
    game?: RoomGame;
}


interface JoinRoomResult {
    success: boolean;
    room?: Room;
    error?: string;
    gameStarted?: boolean;
}

interface LeaveRoomResult {
    success: boolean;
    room?: Room;
    roomDeleted: boolean;
    wasActiveGame?: boolean;
    winnerId?: string;
    error?: string
}

export type {
    Room,
    RoomPlayer,
    MoveRecord,
    RoomGame,
    JoinRoomResult,
    LeaveRoomResult
}