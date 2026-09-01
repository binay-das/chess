export type Color = "white" | "black";

export interface MoveRecord {
    from: string;
    to: string;
    san: string;
    promotion?: string;
    piece?: string;
    captured?: string;
    by?: string;
    fenAfterMove: string;
    timestamp: Date | string;
}

export type WinReason = "checkmate" | "resign" | "disconnect" | "timeout";
export type DrawReason = "stalemate" | "threefold" | "insufficient" | "50-move" | "agreement" | "draw";

export interface GameOverDetails {
    winnerId?: string;
    winnerUsername?: string;
    winReason?: WinReason;
    isDraw?: boolean;
    drawReason?: DrawReason | string;
}

export interface GameTimers {
    white: number;
    black: number;
    lastMoveTime?: number;
}

export interface CapturedPieces {
    white: string[];
    black: string[];
}

