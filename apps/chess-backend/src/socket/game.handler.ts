import { Server, Socket } from "socket.io";
import { reconnectPlayer } from "./room.manager";
import { persistCompletedGame } from "../services/game.service";


export function gameHandler(io: Server, socket: Socket) {
    const { userId, username } = socket.data.user;

    socket.on("game:reconnect", (payload: { roomCode: string }) => {
        try {
            const res = reconnectPlayer(userId, socket.id, payload.roomCode);
            if (!res.success || !res.room || !res.player) {
                socket.emit("game:error", { error: res.message || "No active game found to reconnect" });
                return;
            }

            const room = res.room;
            const player = res.player;

            socket.join(room.roomCode);

            console.log(`[Game] ${username} reconnected to game in room ${room.roomCode}`);

            socket.emit("game:restored", {
                msg: "Successfully recommected to ongoing game",
                roomCode: room.roomCode,
                status: room.status,
                fen: room.game?.fen,
                pgn: room.game?.pgn,
                turn: room.game?.turn,
                moveHistory: room.game?.moveHistory,
                yourColor: player.color,
                players: room.players.map((p) => ({
                    userId: p.userId,
                    username: p.username,
                    color: p.color,
                    isDisconnected: p.isDisconnected || false,
                })),

            })
            io.to(room.roomCode).emit("game:player_reconnected", {
                reconnectedUser: { userId, username, color: player.color },
                room,
            });
        } catch (error: any) {
            console.error("[Game] Error processing game reconnection:", error);
            socket.emit("game:error", { error: error.message || "Failed to reconnect to game" });
        }
    })

    socket.on("game:move", async (payload: { roomCode: string, from: string, to: string, promotion?: string, room: any }) => {
        try {
            if (!payload.roomCode || !payload.from || !payload.to) {
                socket.emit("game:error", { error: "Invalid move data" });
                return;
            }
            const room = payload.room;
            if (room.status !== "playing") {
                socket.emit("game:error", { error: "Game is not active" });
                return;
            }

            const player = room.players.find((p) => p.userId === userId);
            if (!player) {
                socket.emit("game:error", { error: "You are not a player in this game" });
                return;
            }

            // Verify turn (White moves first)
            if (player.color !== room.game.turn) {
                socket.emit("game:error", { error: `Not your turn. It is ${room.game.turn}'s turn.` });
                return;
            }

            const chess = room.game.chess;
            let executedMove;
            try {
                executedMove = chess.move({
                    from: payload.from,
                    to: payload.to,
                    promotion: payload.promotion || "q"
                })
            } catch (err: any) {
                socket.emit("game:error", { error: err?.message || "Invalid move" });
                return;
            }

            if (!executedMove) {
                socket.emit("game:error", { error: "Invalid move" });
                return;
            }
            room.game.fen = chess.fen();
            room.game.pgn = chess.pgn();
            room.game.turn = chess.turn() === "w" ? "white" : "black";


            const moveRecord = {
                from: executedMove.from,
                to: executedMove.to,
                san: executedMove.san,
                piece: executedMove.piece,
                captured: executedMove.captured,
                promotion: executedMove.promotion,
                by: userId,
                fenAfterMove: room.game.fen,
                timestamp: new Date()
            }

            room.game.moveHistory.push(moveRecord);

            // Check for Game Over conditions (Checkmate, Draw, Stalemate, etc.)
            const isCheckmate = chess.isCheckmate();
            const isDraw = chess.isDraw();
            const isCheck = chess.inCheck();

            // Broadcast move to all room members
            io.to(room.roomCode).emit("game:moved", {
                roomCode: room.roomCode,
                move: moveRecord,
                fen: room.game.fen,
                pgn: room.game.pgn,
                turn: room.game.turn,
                isCheck,
                isCheckmate,
                isDraw,
            });

            if (isCheckmate) {
                room.status = "finished";
                room.game.winnerId = userId;
                room.game.winReason = "checkmate";

                io.to(room.roomCode).emit("game:over", {
                    roomCode: room.roomCode,
                    winnerId: userId,
                    winnerUsername: username,
                    winReason: "checkmate",
                    fen: room.game.fen,
                    pgn: room.game.pgn,
                });
                console.log(`[Game] Checkmate in room ${room.roomCode}! Winner: ${username}`);

                // Persist completed game to database asynchronously
                persistCompletedGame(room).catch((err) =>
                    console.error("[GameService] Error persisting checkmate game:", err)
                );
            } else if (isDraw) {
                room.status = "finished";
                room.game.isDraw = true;

                let drawReason: "stalemate" | "threefold" | "insufficient" | "50-move" | "draw" = "draw";
                if (chess.isStalemate()) drawReason = "stalemate";
                else if (chess.isThreefoldRepetition()) drawReason = "threefold";
                else if (chess.isInsufficientMaterial()) drawReason = "insufficient";

                room.game.drawReason = drawReason;

                io.to(room.roomCode).emit("game:over", {
                    roomCode: room.roomCode,
                    isDraw: true,
                    drawReason,
                    fen: room.game.fen,
                    pgn: room.game.pgn,
                });
                console.log(`[Game] Draw in room ${room.roomCode}! Reason: ${drawReason}`);

                // Persist completed game to database asynchronously
                persistCompletedGame(room).catch((err) =>
                    console.error("[GameService] Error persisting draw game:", err)
                );
            }
        } catch (error) {
            console.error("[Game] Error executing move:", error);
            socket.emit("game:error", { error: error.message || "Failed to execute move" });
        }

    })
}