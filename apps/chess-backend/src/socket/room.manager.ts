import { Chess } from "chess.js";
import { generateRoomCode } from "../lib/roomId"
import type { Room, RoomPlayer } from "../types/room";

const rooms: Map<string, Room> = new Map();

export const createRoom = (hostUserId: string, hostUsername: string, hostSocketId: string) => {
    leaveUserRooms(hostUserId, hostSocketId);
    
    const roomCode = generateRoomCode();

    const newRoom: Room = {
        roomCode,
        hostId: hostUserId,
        players: [{
            userId: hostUserId,
            username: hostUsername,
            socketId: hostSocketId,
            color: "white",
            joinedAt: new Date(),
            isDisconnected: false
        }],
        status: "waiting",
        createdAt: new Date()
    }

    rooms.set(roomCode, newRoom);

    return newRoom;
}


export const joinRoom = (
    roomCode: string,
    userId: string,
    username: string,
    socketId: string) => {

    const roomCodeTrimmed = roomCode.trim();

    const room = rooms.get(roomCodeTrimmed)
    if (!room) {
        return {
            success: false,
            message: "Room not found"
        }
    }

    const existingPlayerIdx = room.players.findIndex((player) => player.userId === userId);

    if (existingPlayerIdx !== -1) {
        const existingPlayer = room.players[existingPlayerIdx];
        if (existingPlayer) {
            existingPlayer.socketId = socketId;
            existingPlayer.isDisconnected = false;
        }

        return { success: true, room, gameStarted: room.status === "playing" };

    }

    if (room.players.length >= 2) {
        return {
            success: false,
            message: "Room is already full (maximum 2 players allowed)",
        }
    }

    leaveUserRooms(userId, socketId);

    const fistPlayerColor = room?.players[0]?.color;
    const assignedColor = fistPlayerColor === "white" ? "black" : "white";


    const newPlayer: RoomPlayer = {
        userId,
        username,
        socketId,
        color: assignedColor,
        joinedAt: new Date(),
        isDisconnected: false
    }

    room.players.push(newPlayer);

    let gameStarted = false;

    if (room.players.length === 2) {
        room.status = "playing";
        const chess = new Chess();
        room.game = {
            chess,
            fen: chess.fen(),
            pgn: chess.pgn(),
            turn: "white",
            moveHistory: [],
        };
        gameStarted = true;
    }

    return { success: true, room, gameStarted };
}


export const leaveRoom = (roomCode: string, userId: string, socketId?: string) => {
    const roomIdTrimmed = roomCode.trim();

    const room = rooms.get(roomIdTrimmed);
    if (!room) {
        return {
            success: false,
            error: "Room not found",
            roomDeleted: false
        };

    }

    const playerIdx = room.players.findIndex((player) => player.userId === userId || player.socketId === socketId);

    if (playerIdx === -1) {
        return {
            success: false,
            error: "Player not found in the room",
            roomDeleted: false
        }
    }

    // const player = room.players[playerIdx];

    const wasActiveGame = room.status === "playing";
    let winnerId: string | undefined;


    room.players.splice(playerIdx, 1);

    if (wasActiveGame && room.players.length === 1 && room.game) {
        const remainingPlayer = room.players[0];
        winnerId = remainingPlayer?.userId;
        room.status = "finished";
        room.game.winnerId = winnerId;
        room.game.winReason = "disconnect";
    }
    if (room.players.length === 0) {
        rooms.delete(roomIdTrimmed);

        return {
            success: true,
            roomDeleted: true,
            wasActiveGame,
            winnerId
        };
    }

    if (room.hostId === userId && room.players.length > 0) {
        room.hostId = room.players[0]?.userId as string;
    }

    if (room.status !== "finished" && !wasActiveGame) {
        room.status = "waiting";
    }

    return {
        success: true,
        room,
        roomDeleted: false,
        wasActiveGame,
        winnerId
    };
}


export const reconnectPlayer = (
    userId: string,
    newSocketId: string,
    roomCode?: string
) => {


    let room;


    if (roomCode) {
        room = rooms.get(roomCode);
    } else {
        function getUserRoom(userId: string): Room | undefined {
            for (const room of rooms.values()) {
                if (room.players.some((p) => p.userId === userId)) {
                    return room;
                }
            }
            return undefined;
        }
        room = getUserRoom(userId);
    }

    if (!room) {
        return {
            success: false,
            message: "Room not found",
            room: null
        }
    }

    const player = room.players.find(
        (p) => p.userId === userId
    )

    if (!player) {
        return {
            success: false,
            message: "Player not found in the room",
            room: null
        }
    }

    player.socketId = newSocketId;
    player.isDisconnected = false;


    return { success: true, room, player };




}


export const markPlayerDisconnected = (
    userId: string,
    socketId: string
) => {
    for (const [code, room] of rooms.entries()) {
        const player = room.players.find(
            (p) => p.userId === userId && p.socketId === socketId
        )

        if (player) {
            player.isDisconnected = true;
            return {
                roomCode: code,
                room
            }
        }
    }
}

export const leaveUserRooms = (
    userId: string,
    socketId: string
) => {
    const results = []

    for (const [code, room] of rooms.entries()) {
        const isUserInRoom = room.players.some(
            (p) => p.userId === userId || p.socketId === socketId
        );

        if (isUserInRoom) {
            const result = leaveRoom(code, userId, socketId);
            results.push({
                roomCode: code,
                result
            })
        }
    }

    return results;
}

export const sanitizeRoom = (room: Room | null | undefined) => {
    if (!room) return null;
    const { game, ...restRoom } = room;
    if (!game) {
        return { ...restRoom };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { chess, ...restGame } = game;
    return {
        ...restRoom,
        game: restGame,
    };
};

export const getRoom = (roomCode: string): Room | undefined => {
    if (!roomCode) return undefined;
    return rooms.get(roomCode.trim());
};

