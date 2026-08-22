import { Server, Socket } from "socket.io";
import { reconnectPlayer } from "./room.manager";


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
}