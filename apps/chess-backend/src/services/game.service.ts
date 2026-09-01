import { GameResult, PieceColor } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import type { Room, RoomPlayer, MoveRecord } from "../types/room";

export async function persistCompletedGame(room: Room) {
    try {
        if (!room || !room.game) {
            console.error("[GameService] Cannot persist game: Room or game state missing.");
            return;
        }

        const { roomCode, players, game, createdAt } = room;

        const whitePlayer = players.find((p: RoomPlayer) => p.color === "white");
        const blackPlayer = players.find((p: RoomPlayer) => p.color === "black");
        if (!whitePlayer || !blackPlayer) {
            console.error("[GameService] Cannot persist game: Players missing.", players);
            return;
        }

        let resultEnum: GameResult = GameResult.DRAW;

        if (game.isDraw) {
            switch (game.drawReason) {
                case "stalemate":
                    resultEnum = GameResult.STALEMATE;
                    break;
                case "threefold":
                    resultEnum = GameResult.REPETITION;
                    break;
                case "insufficient":
                    resultEnum = GameResult.INSUFFICIENT_MATERIAL;
                    break;
                case "50-move":
                    resultEnum = GameResult.FIFTY_MOVE;
                    break;
                default:
                    resultEnum = GameResult.DRAW;
                    break;
            }
        } else if (game.winnerId) {
            if (game.winReason === "checkmate") {
                resultEnum = GameResult.CHECKMATE;
            } else if (game.winReason === "resign") {
                resultEnum = GameResult.RESIGNED;
            } else {
                if (whitePlayer && game.winnerId === whitePlayer.userId) {
                    resultEnum = GameResult.WHITE_WIN;
                } else if (blackPlayer && game.winnerId === blackPlayer.userId) {
                    resultEnum = GameResult.BLACK_WIN;
                }
            }

        }

        const currentTurnEnum: PieceColor = game.turn === "white" ? PieceColor.WHITE : PieceColor.BLACK;

        const persistedGame = await prisma.game.create({
            data: {
                roomCode,
                whitePlayerId: whitePlayer.userId,
                blackPlayerId: blackPlayer.userId,
                winnerId: game.winnerId,
                status: "FINISHED",
                turn: currentTurnEnum,
                fen: game.fen,
                pgn: game.pgn || "",
                result: resultEnum,
                startedAt: createdAt || new Date(),
                endedAt: new Date(),
                moves: {
                    create: (game.moveHistory || []).map((m: MoveRecord, idx: number) => {
                        const player = players.find((p: RoomPlayer) => p.userId === m.by);
                        const playerColorEnum = player?.color === "white" ? PieceColor.WHITE : PieceColor.BLACK;

                        return {
                            moveNumber: idx + 1,
                            playerColor: playerColorEnum,
                            fromSquare: m.from,
                            toSquare: m.to,
                            san: m.san,
                            fenAfterMove: m.fenAfterMove || game.fen
                        }
                    })
                }
            },
            include: {
                moves: true,
                whitePlayer: true,
                blackPlayer: true,
                winner: true
            }
        });

        console.log(`[GameService] Game ${roomCode} successfully persisted to database! ID: ${persistedGame.id}`);
        return persistedGame;
    } catch (error) {
        console.error(`[GameService] Error persisting completed game for room ${room?.roomCode}:`, error);
        return null;
    }
}