import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { roomHandler } from "./room.handler";
import { gameHandler } from "./game.handler";
import { socketAuthMiddleware } from "./socket.auth";

interface User {
    userId: string,
    username: string,
    email: string,
    socketId: string,
    connectedAt: Date
}

let io: SocketIOServer | null = null;

const users = new Map<string, User>();


export const initSocketServer = (
    server: HttpServer
): SocketIOServer => {
    io = new SocketIOServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.use(socketAuthMiddleware);


    io.on("connection", (socket) => {
        const { userId, username, email } = socket.data.user;

        console.log("=====================================")
        console.log("[Socket] User connected:", username, userId);

        roomHandler(io!, socket);
        gameHandler(io!, socket);

        users.set(userId, {
            userId,
            username,
            email,
            socketId: socket.id,
            connectedAt: new Date()
        });

        console.log(`[Socket] User connected: ${username} (${userId}) | Socket ID: ${socket.id}`);

        socket.on("disconnect", (reason) => {
            const existingUser = users.get(userId);
            if (existingUser?.socketId === socket.id) {
                users.delete(userId);
            }
            console.log(`[Socket] User disconnected: ${username} (${userId}) | Socket ID: ${socket.id} | Reason: ${reason}`);
        });
    });


    return io;
};


