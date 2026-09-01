import { Chess } from "chess.js";
import type {
    RoomPlayer,
    MoveRecord,
    JoinRoomResult,
    LeaveRoomResult,
    WinReason,
    DrawReason,
    RoomGame as SharedRoomGame,
    Room as SharedRoom
} from "@repo/types";

export interface RoomGame extends Omit<SharedRoomGame, "timers"> {
    chess: Chess;
    timers?: {
        white: number;
        black: number;
        lastMoveTime: number;
        interval?: NodeJS.Timeout;
    };
}

export interface Room extends Omit<SharedRoom, "game" | "createdAt"> {
    createdAt: Date;
    game?: RoomGame;
}

export type {
    RoomPlayer,
    MoveRecord,
    JoinRoomResult,
    LeaveRoomResult
};