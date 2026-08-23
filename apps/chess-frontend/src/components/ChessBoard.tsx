import { Chess, type PieceSymbol, type Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useGameStore } from "../store/GameStore";
import { useEffect, useMemo, useState } from "react";

interface CapturedPieces {
    white: PieceSymbol[];
    black: PieceSymbol[];
}

const INITIAL_PIECES: Record<PieceSymbol, number> = {
    p: 8,
    n: 2,
    b: 2,
    r: 2,
    q: 1,
    k: 1,
};

export const ChessBoardComponent = () => {
    const { fen, turn, playerColor, roomCode, status, isCheck } = useGameStore();
    const [game, setGame] = useState(new Chess(fen));

    const [moveFrom, setMoveFrom] = useState<Square | null>(null);
    const [optionSquares, setOptionsSquares] = useState<Record<string, { background?: string; borderRadius?: string }>>({});

    // sync using stored fen
    useEffect(() => {
        try {
            const updatedGame = new Chess(fen);
            setGame(updatedGame);
            setOptionsSquares({});
            setMoveFrom(null);
        } catch (error) {
            console.log("FEN invalid: ", error);
        }
    }, [fen]);

    const isMyTurn = status === "playing" && turn === playerColor;

    // calculate captured pieces from current fen
    const capturedPieces = useMemo<CapturedPieces>(() => {
        const currentCounts: Record<"w" | "b", Record<PieceSymbol, number>> = {
            w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
            b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
        };
        const board = game.board();
        for (const row of board) {
            for (const square of row) {
                if (square) {
                    currentCounts[square.color][square.type]++;
                }
            }
        }
        const capturedWhite: PieceSymbol[] = [];
        const capturedBlack: PieceSymbol[] = [];

        (Object.keys(INITIAL_PIECES) as PieceSymbol[]).forEach((type) => {
            const missingWhite = INITIAL_PIECES[type] - currentCounts.w[type];
            for (let i = 0; i < missingWhite; i++) capturedWhite.push(type);

            const missingBlack = INITIAL_PIECES[type] - currentCounts.b[type];
            for (let i = 0; i < missingBlack; i++) capturedBlack.push(type);
        });

        return { white: capturedWhite, black: capturedBlack };



    }, [game]);


    const getMoveOptions = (square: Square) => {
        const moves = game.moves({
            square,
            verbose: true
        });
        console.log("moves: ", moves);

        if (moves.length === 0) {
            setOptionsSquares({});
            return false;
        }

        const newSquares = {};

        moves.forEach((move) => {
            newSquares[move.to] = {
                background: game.get(move.to as Square) && game.get(move.to as Square)?.color !== game.get(square)?.color
                    ? "radial-gradient(circle, rgba(239, 68, 68, 0.7) 40%, transparent 40%)"
                    : "radial-gradient(circle, rgba(245, 158, 11, 0.6) 25%, transparent 25%)",
                borderRadius: "50%"
            };
        });

        newSquares[square] = {
            background: "rgba(245, 158, 11, 0.2)",
        };

        setOptionsSquares(newSquares);
        return true;
    };

    const handleSquareClick = (square: string) => {
        setMoveFrom(square as Square);
        getMoveOptions(square as Square);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-4 w-full max-w-xl mx-auto">
            <div className="flex items-center justify-between w-full border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Room Code</span>
                    <p className="text-sm font-bold text-slate-900">{roomCode || "Local / Demo"}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Turn:</span>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md capitalize ${
                        turn === "white" ? "bg-slate-100 text-slate-900 border border-slate-300" : "bg-slate-900 text-white"
                    }`}>
                        {turn} {isMyTurn ? "(Your turn)" : ""}
                    </span>
                    {isCheck && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-red-100 text-red-700 animate-pulse">
                            CHECK!
                        </span>
                    )}
                </div>
            </div>

            <div className="w-full flex items-center justify-between text-xs font-medium text-slate-600 px-1">
                <span>Black Captured:</span>
                <span className="text-sm font-semibold tracking-wider">
                    {capturedPieces.black.length > 0 ? capturedPieces.black.map((p) => p.toUpperCase()).join(" ") : "None"}
                </span>
            </div>

            <div className="w-full aspect-square border-4 border-slate-800 rounded-lg overflow-hidden shadow-2xl bg-slate-100">
                <Chessboard
                    position={fen}
                    onSquareClick={handleSquareClick}
                    customSquareStyles={optionSquares}
                    boardOrientation={playerColor === "black" ? "black" : "white"}
                    arePiecesDraggable={isMyTurn}
                />
            </div>

            <div className="w-full flex items-center justify-between text-xs font-medium text-slate-600 px-1">
                <span>White Captured:</span>
                <span className="text-sm font-semibold tracking-wider">
                    {capturedPieces.white.length > 0 ? capturedPieces.white.map((p) => p.toUpperCase()).join(" ") : "None"}
                </span>
            </div>
        </div>
    );
};