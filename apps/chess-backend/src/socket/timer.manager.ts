import { Server } from "socket.io";
import { rooms } from "./room.manager";
import { persistCompletedGame } from "../services/game.service";

export const startGameTimer = (io: Server, roomCode: string) => {
    const room = rooms.get(roomCode);
    if (!room || !room.game || !room.game.timers) return;

    if (room.game.timers.interval) {
        clearInterval(room.game.timers.interval);
    }

    room.game.timers.lastMoveTime = Date.now();

    room.game.timers.interval = setInterval(async () => {
        const currentRoom = rooms.get(roomCode);
        if (!currentRoom || !currentRoom.game || currentRoom.status !== "playing" || !currentRoom.game.timers) {
            if (currentRoom?.game?.timers?.interval) {
                clearInterval(currentRoom.game.timers.interval);
            }
            return;
        }

        const timers = currentRoom.game.timers;
        const now = Date.now();
        const elapsed = now - timers.lastMoveTime;
        timers.lastMoveTime = now;

        const currentTurn = currentRoom.game.turn;
        
        timers[currentTurn] -= elapsed;

        if (timers[currentTurn] <= 0) {
            timers[currentTurn] = 0;
            clearInterval(timers.interval);

            currentRoom.status = "finished";
            currentRoom.game.winReason = "timeout";
            
            const timeoutPlayerId = currentRoom.players.find(p => p.color === currentTurn)?.userId;
            const winningPlayer = currentRoom.players.find(p => p.color !== currentTurn);
            
            if (winningPlayer) {
                currentRoom.game.winnerId = winningPlayer.userId;
            }

            io.to(roomCode).emit("game:timeout", {
                roomCode,
                winnerId: winningPlayer?.userId,
                loserId: timeoutPlayerId,
                winReason: "timeout"
            });
            
            io.to(roomCode).emit("game:over", {
                roomCode,
                winnerId: winningPlayer?.userId,
                winReason: "timeout"
            });

            await persistCompletedGame(currentRoom);
        } else {
            io.to(roomCode).emit("game:time_update", {
                roomCode,
                white: timers.white,
                black: timers.black
            });
        }
    }, 1000); // update every 1 second
};

export const stopGameTimer = (roomCode: string) => {
    const room = rooms.get(roomCode);
    if (room?.game?.timers?.interval) {
        clearInterval(room.game.timers.interval);
        room.game.timers.interval = undefined;
    }
};

export const updateTimerOnMove = (roomCode: string) => {
    const room = rooms.get(roomCode);
    if (room?.game?.timers) {
        const timers = room.game.timers;
        timers.lastMoveTime = Date.now();
    }
};
