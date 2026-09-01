import type { Server, Socket } from "socket.io";
import { createRoom, joinRoom } from "./room.manager";
import { startGameTimer } from "./timer.manager";

// queue of { userId, username, socket }
interface QueuedPlayer {
    userId: string;
    username: string;
    socket: Socket;
    joinedAt: number;
}

const queue: QueuedPlayer[] = [];

export const joinQueue = (socket: Socket) => {
    const { userId, username } = socket.data.user;

    // Remove if already in queue
    leaveQueue(userId);

    queue.push({
        userId,
        username,
        socket,
        joinedAt: Date.now()
    });

    console.log(`[Matchmaking] ${username} joined queue. Queue size: ${queue.length}`);
};

export const leaveQueue = (userId: string) => {
    const index = queue.findIndex(p => p.userId === userId);
    if (index !== -1) {
        queue.splice(index, 1);
        console.log(`[Matchmaking] User ${userId} left queue. Queue size: ${queue.length}`);
    }
};

export const processQueue = (io: Server) => {
    // Need at least 2 players
    while (queue.length >= 2) {
        // Pop two players
        const p1 = queue.shift()!;
        const p2 = queue.shift()!;

        console.log(`[Matchmaking] Matched ${p1.username} and ${p2.username}`);

        // Create room using p1 as host
        const room = createRoom(p1.userId, p1.username, p1.socket.id);
        const roomCode = room.roomCode;

        // p2 joins the room
        joinRoom(roomCode, p2.userId, p2.username, p2.socket.id);

        // Join both sockets to the Socket.IO room
        p1.socket.join(roomCode);
        p2.socket.join(roomCode);

        // Start game timer
        startGameTimer(io, roomCode);

        // Notify both players match is found
        p1.socket.emit("match:found", { roomCode });
        p2.socket.emit("match:found", { roomCode });

        // Broadcast game:started to both players simultaneously
        if (room.game) {
            io.to(roomCode).emit("game:started", {
                roomCode,
                fen: room.game.fen,
                turn: room.game.turn,
                players: room.players.map((p) => ({
                    userId: p.userId,
                    username: p.username,
                    color: p.color,
                })),
            });
        }
    }
};
