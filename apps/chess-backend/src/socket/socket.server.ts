import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { roomHandler } from "./room.handler";
import { gameHandler } from "./game.handler";

interface User {
    userId: string,
    username: string,
    email: string,
    socketId: string,
    connectedAt: Date
}

let io: SocketIOServer | null = null;

const users: User[] = [];


export const initSocketServer = (
    server: HttpServer
): SocketIOServer => {
    io = new SocketIOServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        const { userId, username, email } = socket.data.user;

        console.log("=====================================")
        console.log("[Socket] User connected:", username, userId);

        roomHandler(io!, socket);
        gameHandler(io!, socket);

        const existingUser = users.find(
            (u) => u.userId === userId
        );

        if (existingUser) {
            existingUser.socketId = socket.id;
            existingUser.connectedAt = new Date();
        } else {
            users.push({
                userId,
                username,
                email,
                socketId: socket.id,
                connectedAt: new Date()
            })
        }

        console.log(`[Socket] User connected: ${username} (${userId}) | Socket ID: ${socket.id}`);




        socket.on("disconnect", (reason) => {
            const user = users.find((u) => u.userId === userId);

            if (user) {
                user.socketId = "";
                users.splice(users.findIndex((u) => u.userId === userId), 1);
            }
            `[Socket] User disconnected: ${username} (${userId}) | Socket ID: ${socket.id} | Reason: ${reason}`
        })
    });


    return io;
};


