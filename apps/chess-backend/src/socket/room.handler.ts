import { Server, Socket } from "socket.io";
import { createRoom, joinRoom, leaveRoom } from "./room.manager";


export function roomHandler(io: Server, socket: Socket) {
    const { userId, username } = socket.data.user;


    socket.on("room:create", () => {
        try {
            const room = createRoom(userId, username, socket.id);
            socket.join(room.roomCode);

            console.log(`[Room] ${username} created room ${room.roomCode}`);

            socket.emit("room:created", {
                message: "Room created successfully",
                roomCode: room.roomCode,
                room
            });

            io.to(room.roomCode).emit("room:state", { room });

        } catch (error) {
            console.log(error);
            socket.emit("error", {
                message: "Failed to create room",
                // @ts-ignore
                error: error.message
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
                room
            });

            io.to(room?.roomCode as string).emit("room:player_joined", {
                joinedUser: { userId, username },
                room
            });

            io.to(room?.roomCode as string).emit("room:state", { room });
            if (result.gameStarted && room?.game) {
                console.log(`[Game] Game started in room ${room?.roomCode as string}! White to move.`);
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
            // @ts-ignore
            socket.emit("room:error", { error: error.message || "Failed to join room" });
        }
    })

    socket.on("room:leave", async (payload?: { roomCode?: string }) => {
        try {
            let roomCode = payload?.roomCode;

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
                    room: result.room,
                });

                io.to(roomCode).emit("room:state", { room: result.room });

                // Broadcast Game Over if leave happened during active game
                if (result.wasActiveGame && result.winnerId) {
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
        } catch (error: any) {
            console.error("[Room] Error leaving room:", error);
            socket.emit("room:error", { error: error.message || "Failed to leave room" });
        }
    });
}