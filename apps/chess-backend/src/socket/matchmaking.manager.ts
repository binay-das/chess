import type { Socket } from "socket.io";
import { createRoom, joinRoom } from "./room.manager";

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

export const processQueue = () => {
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

        // Notify both players
        p1.socket.emit("match:found", { roomCode });
        p2.socket.emit("match:found", { roomCode });

        // They still need to officially 'join' via sockets or client redirection
        // but the backend room is ready!
    }
};
