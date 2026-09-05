import { Server, Socket } from "socket.io";
import { createRoom, joinRoom, leaveRoom, leaveUserRooms, sanitizeRoom } from "./room.manager";
import { persistCompletedGame } from "../services/game.service";
import { startGameTimer, stopGameTimer } from "./timer.manager";


export function roomHandler(io: Server, socket: Socket) {
    const { userId, username } = socket.data.user;
    console.log("=====================================")

    console.log("[Room] Room handler initialized for user", username, userId);


    socket.on("room:create", () => {
        try {
            const room = createRoom(userId, username, socket.id);
            socket.join(room.roomCode);

            console.log(`[Room] ${username} created room ${room.roomCode}`);

            socket.emit("room:created", {
                message: "Room created successfully",
                roomCode: room.roomCode,
                room: sanitizeRoom(room)
            });

            io.to(room.roomCode).emit("room:state", { room: sanitizeRoom(room) });

        } catch (error) {
            console.log(error);
            const msg = error instanceof Error ? error.message : "Failed to create room";
            socket.emit("error", {
                message: "Failed to create room",
                error: msg
            });
        }
    })


    socket.on("room:join", (payload: { roomCode: string }) => {
        try {
            const { roomCode } = payload;
            const result = joinRoom(roomCode, userId, username, socket.id);


            const room = result.room;

            socket.join(room?.roomCode as string);

            console.log(`[Room] ${username} joined room ${room?.roomCode as string}`);

            socket.emit("room:joined", {
                message: "Joined room successfully",
                roomCode: room?.roomCode as string,
                room: sanitizeRoom(room)
            });

            io.to(room?.roomCode as string).emit("room:player_joined", {
                joinedUser: { userId, username },
                room: sanitizeRoom(room)
            });

            io.to(room?.roomCode as string).emit("room:state", { room: sanitizeRoom(room) });
            if (result.gameStarted && room?.game) {
                console.log(`[Game] Game started in room ${room?.roomCode as string}! White to move.`);
                startGameTimer(io, room.roomCode);
                io.to(room?.roomCode as string).emit("game:started", {
                    roomCode: room?.roomCode as string,
                    fen: room?.game.fen,
                    turn: room?.game.turn,
                    players: room.players.map((p) => ({
                        userId: p.userId,
                        username: p.username,
                        color: p.color,
                    })),
                });
            }

        } catch (error) {
            console.error("[Room] Error joining room:", error);
            const msg = error instanceof Error ? error.message : "Failed to join room";
            socket.emit("room:error", { error: msg });
        }
    })

    socket.on("room:leave", async (payload?: { roomCode?: string }) => {
        try {
            const roomCode = payload?.roomCode;

            if (!roomCode) {
                socket.emit("room:error", { error: "Not currently in any room" });
                return;
            }

            const result = leaveRoom(roomCode, userId, socket.id);

            socket.leave(roomCode);
            socket.emit("room:left", { message: "Left room successfully", roomCode });

            if (result.success && !result.roomDeleted && result.room) {
                io.to(roomCode).emit("room:player_left", {
                    leftUser: { userId, username },
                    room: sanitizeRoom(result.room),
                });

                io.to(roomCode).emit("room:state", { room: sanitizeRoom(result.room) });

                // Broadcast Game Over if leave happened during active game
                if (result.wasActiveGame && result.winnerId) {
                    stopGameTimer(roomCode);
                    const remainingPlayer = result.room.players.find((p) => p.userId === result.winnerId);
                    io.to(roomCode).emit("game:over", {
                        roomCode,
                        winnerId: result.winnerId,
                        winnerUsername: remainingPlayer?.username,
                        winReason: "disconnect",
                        fen: result.room.game?.fen,
                        pgn: result.room.game?.pgn,
                    });
                }
            }

            console.log(`[Room] ${username} left room ${roomCode}`);
        } catch (error) {
            console.error("[Room] Error leaving room:", error);
            const msg = error instanceof Error ? error.message : "Failed to leave room";
            socket.emit("room:error", { error: msg });
        }
    });
}


export function handleRoomDisconnect(io: Server, socket: Socket) {
    const { userId, username } = socket.data.user;

    const results = leaveUserRooms(userId, socket.id);

    for (const { roomCode, result } of results) {
        socket.leave(roomCode);

        if (result.success && !result.roomDeleted && result.room) {
            io.to(roomCode).emit("room:player_left", {
                leftUser: {
                    userId, username
                },
                reason: "disconnected",
                room: sanitizeRoom(result.room)
            })

            io.to(roomCode).emit("room:state", { room: sanitizeRoom(result.room) });

            // broadcast game over
            if (result.wasActiveGame && result.winnerId) {
                stopGameTimer(roomCode);
                const remainingPlayer = result.room.players.find(
                    (p) => p.userId === result.winnerId
                )
                io.to(roomCode).emit("game:over", {
                    roomCode,
                    winnerId: result.winnerId,
                    winnerUsername: remainingPlayer?.username,
                    winReason: "disconnect",
                    fen: result.room.game?.fen,
                    pgn: result.room.game?.pgn,
                });

                // persist game
                persistCompletedGame(result.room).catch((err) => {
                    console.error("[GameService] Error persisting disconnected game:", err)
                })
            }

        }
    }
}