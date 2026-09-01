import type { Server, Socket } from "socket.io";
import { joinQueue, leaveQueue, processQueue } from "./matchmaking.manager";

export function handleMatchmaking(io: Server, socket: Socket) {
    socket.on("queue:join", () => {
        joinQueue(socket);
        processQueue();
    });

    socket.on("queue:leave", () => {
        leaveQueue(socket.data.user.userId);
    });

    // Handle disconnect by leaving queue
    socket.on("disconnect", () => {
        leaveQueue(socket.data.user.userId);
    });
}
