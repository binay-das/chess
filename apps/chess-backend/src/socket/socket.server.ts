import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { roomHandler, handleRoomDisconnect } from "./room.handler";
import { gameHandler } from "./game.handler";
import { handleMatchmaking } from "./matchmaking.handler";
import { socketAuthMiddleware } from "./socket.auth";
import { env } from "../config/env.js";

import type { ConnectedUser } from "@repo/types";

let io: SocketIOServer | null = null;

const users = new Map<string, ConnectedUser>();


export const initSocketServer = (
    server: HttpServer
): SocketIOServer => {
    const allowedOrigins = [
        env.CLIENT_URL
    ].filter((url): url is string => Boolean(url));

    io = new SocketIOServer(server, {
        cors: {
            origin: env.NODE_ENV === "production" && env.CLIENT_URL ? env.CLIENT_URL : allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.use(socketAuthMiddleware);


    io.on("connection", (socket) => {
        const { userId, username, email } = socket.data.user;

        console.log("=====================================")
        console.log("[Socket] User connected:", username, userId);

        roomHandler(io!, socket);
        gameHandler(io!, socket);
        handleMatchmaking(io!, socket);

        users.set(userId, {
            userId,
            username,
            email,
            socketId: socket.id,
            connectedAt: new Date()
        });

        console.log(`[Socket] User connected: ${username} (${userId}) | Socket ID: ${socket.id}`);

        socket.on("disconnect", (reason) => {
            handleRoomDisconnect(io!, socket);
            const existingUser = users.get(userId);
            if (existingUser?.socketId === socket.id) {
                users.delete(userId);
            }
            console.log(`[Socket] User disconnected: ${username} (${userId}) | Socket ID: ${socket.id} | Reason: ${reason}`);
        });
    });


    return io;
};


