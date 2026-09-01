import { Chess, type PieceSymbol, type Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useGameStore } from "../store/GameStore";
import { useEffect, useMemo, useState } from "react";
import { getSocket } from "../services/socket";

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

    const game = useMemo(() => {
        try {
            return new Chess(fen);
        } catch {
            return new Chess();
        }
    }, [fen]);

    const [moveFrom, setMoveFrom] = useState<Square | null>(null);
    const [optionSquares, setOptionsSquares] = useState<Record<string, { background?: string; borderRadius?: string }>>({});
    const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

    // reset square options when fen changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOptionsSquares({});
        setMoveFrom(null);
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

        const newSquares: Record<string, { background?: string; borderRadius?: string }> = {};

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

    const makeMove = (from: Square, to: Square, promotion?: string) => {
        if (!roomCode || status !== "playing") {
            return false;
        }

        // Check if it's a promotion move
        const piece = game.get(from);
        if (piece && piece.type === "p") {
            const toRank = to[1];
            if ((piece.color === "w" && toRank === "8") || (piece.color === "b" && toRank === "1")) {
                if (!promotion) {
                    // Open promotion dialog
                    setPendingPromotion({ from, to });
                    return false;
                }
            }
        }

        try {
            const tempGame = new Chess(game.fen());
            const move = tempGame.move({
                from, to, promotion: promotion || "q"
            });


            if (!move) {
                return false;
            }

            const socket = getSocket();


            socket.emit("game:move", {
                roomCode,
                from,
                to,
                promotion: promotion || "q",
            });

            return true;


        } catch {
            return false;
        }
    }

    const onSquareClick = ({ square }: { square: string }) => {
        if (!isMyTurn) {
            return;
        }

        const sq = square as Square;

        if (!moveFrom) {
            const hasMoves = getMoveOptions(sq);
            if (hasMoves) {
                setMoveFrom(sq);
                return;
            }
        } else {
            makeMove(moveFrom, sq);
            setMoveFrom(null);
            setOptionsSquares({});
        }
    }

    const onPieceDrop = ({
        sourceSquare,
        targetSquare,
    }: {
        sourceSquare: string;
        targetSquare: string | null;
    }) => {
        if (!isMyTurn || !targetSquare) return false;
        const success = makeMove(sourceSquare as Square, targetSquare as Square);
        setMoveFrom(null);
        setOptionsSquares({});
        return success;
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-4 w-full max-w-xl mx-auto">
            <div className="chessboard-status-header">
                <div className={`turn-indicator ${isMyTurn ? "turn-my-turn" : "turn-waiting"}`}>
                    <span className="turn-pulse"></span>
                    <span>
                        {status !== "playing"
                            ? "Game Not Started"
                            : isMyTurn
                                ? "Your Turn!"
                                : `Opponent's Turn (${turn})`}
                    </span>
                </div>
                {isCheck && <span className="check-badge">CHECK!</span>}
            </div>

            <div className="w-full flex items-center justify-between text-xs font-medium text-(--text-muted-50) px-1">
                <span>Black Captured:</span>
                <span className="text-sm font-semibold tracking-wider text-(--text-primary)">
                    {capturedPieces.black.length > 0 ? capturedPieces.black.map((p) => p.toUpperCase()).join(" ") : "None"}
                </span>
            </div>

            <Chessboard
                options={{
                    position: game.fen(),
                    onPieceDrop,
                    onSquareClick,
                    boardOrientation: playerColor,
                    squareStyles: optionSquares,
                    boardStyle: {
                        borderRadius: "6px",
                        boxShadow: "var(--board-shadow)",
                    },
                    allowDragging: isMyTurn
                }}
            />

            <div className="w-full flex items-center justify-between text-xs font-medium text-(--text-muted-50) px-1">
                <span>White Captured:</span>
                <span className="text-sm font-semibold tracking-wider text-(--text-primary)">
                    {capturedPieces.white.length > 0 ? capturedPieces.white.map((p) => p.toUpperCase()).join(" ") : "None"}
                </span>
            </div>

            {pendingPromotion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-(--bg-surface-1) border border-(--border-10) p-6 shadow-2xl rounded-lg">
                        <h3 className="text-lg font-serif mb-4 text-center text-(--text-heading)">Choose Promotion</h3>
                        <div className="flex gap-4 justify-center">
                            {['q', 'r', 'b', 'n'].map((p) => {
                                const pieceCode = `${playerColor === "white" ? "w" : "b"}${p.toUpperCase()}`;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => {
                                            makeMove(pendingPromotion.from, pendingPromotion.to, p);
                                            setPendingPromotion(null);
                                        }}
                                        className="p-3 bg-(--bg-surface-2) hover:bg-(--bg-surface-3) rounded-md border border-(--border-10) transition-colors cursor-pointer"
                                    >
                                        <img src={`/pieces/${pieceCode}.svg`} alt={p} className="w-12 h-12" />
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setPendingPromotion(null)}
                            className="mt-6 w-full py-2 text-sm text-(--text-muted-50) hover:text-(--text-primary) transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};