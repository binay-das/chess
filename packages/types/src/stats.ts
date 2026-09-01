export interface UserStats {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    breakDown: {
        asWhite: { total: number; wins: number };
        asBlack: { total: number; wins: number };
    };
}

export interface GameHistoryItem {
    id: string;
    roomCode: string;
    whitePlayerId: string;
    blackPlayerId: string;
    winnerId: string | null;
    status: string;
    result: string;
    createdAt: string;
    endedAt: string;
    whitePlayer?: { id: string; username: string };
    blackPlayer?: { id: string; username: string };
    winner?: { id: string; username: string };
}
