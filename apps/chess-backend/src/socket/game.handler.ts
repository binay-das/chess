import { Server, Socket } from "socket.io";
import { reconnectPlayer, sanitizeRoom, getRoom } from "./room.manager";
import { persistCompletedGame } from "../services/game.service";
import { Room, RoomPlayer } from "../types/room";


export function gameHandler(io: Server, socket: Socket) {
    const { userId, username } = socket.data.user;

    socket.on("game:reconnect", (payload?: { roomCode?: string }) => {
        try {
            console.log("Socket before: ", socket.id)
            console.log("Payload before: ", payload)
            console.log("UserId before: ", userId)
            const res = reconnectPlayer(userId, socket.id, payload?.roomCode);
            if (!res.success || !res.room || !res.player) {
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
                room: sanitizeRoom(room),
            });
        } catch (error: any) {
            console.error("[Game] Error processing game reconnection:", error);
            socket.emit("game:error", { error: error.message || "Failed to reconnect to game" });
        }
    })

    socket.on("game:move", async (payload: { roomCode: string, from: string, to: string, promotion?: string }) => {
        try {
            if (!payload || !payload.roomCode || !payload.from || !payload.to) {
                socket.emit("game:error", { error: "Invalid move data" });
                return;
            }
            const room = getRoom(payload.roomCode);
            if (!room || !room.game || room.status !== "playing") {
                socket.emit("game:error", { error: "Game is not active" });
                return;
            }

            const player = room.players.find((p: RoomPlayer) => p.userId === userId);
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
            // @ts-ignore
            socket.emit("game:error", { error: error.message || "Failed to process resignation" });
        }

    })


    socket.on("game:resign", async (payload: { roomCode: string }) => {
        try {
            if (!payload || !payload.roomCode) {
                socket.emit("game:error", { error: "Room code is required to resign" });
                return;
            }
            const room = getRoom(payload.roomCode);
            if (!room || !room.game || room.status !== "playing") {
                socket.emit("game:error", { error: "No active game to resign from" });
                return;
            }

            const player = room.players.find((p: RoomPlayer) => p.userId === userId);
            if (!player) {
                socket.emit("game:error", { error: "You are not a player in this game" });
                return;
            }



            const opponent = room.players.find((p: RoomPlayer) => p.userId !== userId);

            room.status = "finished";
            room.game.winnerId = opponent?.userId;

            room.game.winReason = "resign"

            io.to(room.roomCode).emit("game:resigned", {
                roomCode: room.roomCode,
                resignedBy: userId,
                resignedUsername: username,
            });

            io.to(room.roomCode).emit("game:over", {
                roomCode: room.roomCode,
                winnerId: opponent?.userId,
                winnerUsername: opponent?.username,
                winReason: "resign",
                fen: room.game.fen,
                pgn: room.game.pgn,
            });

            console.log(`[Game] ${username} resigned in room ${room.roomCode}. Winner: ${opponent?.username}`);

            // Persist completed game to database asynchronously
            persistCompletedGame(room).catch((err) =>
                console.error("[GameService] Error persisting resigned game:", err)
            );
        } catch (error) {
            console.error("[Game] Error processing resignation:", error);
            // @ts-ignore
            socket.emit("game:error", { error: error.message || "Failed to process resignation" });
        }
    });

    socket.on("game:draw_offer", (payload: { roomCode: string }) => {
        try {
            if (!payload?.roomCode) return;
            const room = getRoom(payload.roomCode);
            if (!room || room.status !== "playing") return;

            const opponent = room.players.find((p) => p.userId !== userId);
            if (opponent) {
                const opponentSocket = io.sockets.sockets.get(opponent.socketId);
                if (opponentSocket) {
                    opponentSocket.emit("game:draw_offered", {
                        offeredBy: { userId, username }
                    });
                }
            }
        } catch (err) {
            console.error("[Game] Error handling draw offer:", err);
        }
    });

    socket.on("game:draw_respond", async (payload: { roomCode: string; accept: boolean }) => {
        try {
            if (!payload?.roomCode) return;
            const room = getRoom(payload.roomCode);
            if (!room || room.status !== "playing") return;

            const opponent = room.players.find((p) => p.userId !== userId);

            if (payload.accept) {
                room.status = "finished";
                if (room.game) {
                    room.game.isDraw = true;
                    room.game.drawReason = "agreement";
                }

                io.to(room.roomCode).emit("game:over", {
                    roomCode: room.roomCode,
                    isDraw: true,
                    drawReason: "agreement",
                    fen: room.game?.fen,
                    pgn: room.game?.pgn,
                });

                persistCompletedGame(room).catch((err) =>
                    console.error("[GameService] Error persisting draw game:", err)
                );
            } else {
                if (opponent) {
                    const opponentSocket = io.sockets.sockets.get(opponent.socketId);
                    if (opponentSocket) {
                        opponentSocket.emit("game:draw_declined");
                    }
                }
            }
        } catch (err) {
            console.error("[Game] Error handling draw respond:", err);
        }
    });

}