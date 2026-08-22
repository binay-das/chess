import { prisma } from "../lib/prisma";


export async function persistCompletedGame(room: any) {
    try {
        if (!room || !room.game) {
            console.error("[GameService] Cannot persist game: Room or game state missing.");
            return;
        }

        const { roomCode, players, game, createdAt } = room;
        const whitePlayer = players.find((p: any) => p.color === "w");
        const blackPlayer = players.find((p: any) => p.color === "b");
        if (!whitePlayer || !blackPlayer) {
            console.error("[GameService] Cannot persist game: Players missing.");
            return;
        }

        let resultEnum = "DRAW"

        if (game.isDraw) {
            switch (game.drawReason) {
                case "stalemate":
                    resultEnum = "STALEMATE";
                    break;
                case "threefold":
                    resultEnum = "REPETITION";
                    break;
                case "insufficient":
                    resultEnum = "INSUFFICIENT_MATERIAL";
                    break;
                case "50-move":
                    resultEnum = "FIFTY_MOVE";
                    break;
                default:
                    resultEnum = "DRAW";
                    break;

            }
        } else if (game.winnerId) {
            if (game.winReason === "checkmate") {
                resultEnum = "CHECKMATE";
            } else if (game.winReason === "resign") {
                resultEnum = "RESIGNED";
            } else {
                if (whitePlayer && game.winnerId === whitePlayer.userId) {
                    resultEnum = "WHITE_WIN"
                } else {
                    resultEnum = "BLACK_WIN"
                }
            }

        }

        const currentTurnEnum = game.turn === "white" ? "WHITE" : "BLACK";

        const persistedGame = await prisma.game.create({
            data: {
                roomCode,
                whitePlayerId: whitePlayer.userId,
                blackPlayerId: blackPlayer.userId,
                winnerId: game.winnerId,
                status: "FINISHED",
                turn: currentTurnEnum,
                fen: game.fen,
                pgn: game.pgn,
                result: resultEnum,
                startedAt: createdAt,
                endedAt: new Date(),
                moves: {
                    create: game.moveHistory.map((m: any, idx: any) => {
                        const player = players.find((p: any) => p.userId === m.by);
                        const playerColorEnum = player?.color;

                        return {
                            moveNumber: idx + 1,
                            playerColor: playerColorEnum,
                            fromSquare: m.from,
                            toSquare: m.to,
                            san: m.san,
                            fenAfterMove: game.fen
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
        console.error(`[GameService] Error persisting completed game for room ${roomCode}:`, error);
        return null;
    }
}