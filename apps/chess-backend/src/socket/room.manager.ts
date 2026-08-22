import { generateRoomCode } from "../lib/roomId"

export interface RoomPlayer {
    userId: string;
    username: string;
    socketId: string;
    color: "white" | "black";
    joinedAt: Date;
    isDisconnected?: boolean;
}

export interface MoveRecord {
    from: string;
    to: string;
    san: string;
    promotion?: string;
    piece?: string;
    captured?: string;
    by: string;
    fenAfterMove: string;
    timestamp: Date;
}

export interface Room {
    roomCode: string;
    hostId: string;
    players: RoomPlayer[];
    status: "waiting" | "playing" | "finished";
    createdAt: Date;
}

let rooms: Room[] = [];

export const createRoom = (hostUserId: string, hostUsername: string, hostSocketId: string) => {
    const roomCode = generateRoomCode();

    const newRoom = {
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

    // @ts-ignore
    rooms.push(newRoom);

    return newRoom;
}


export const joinRoom = (roomCode: string, userId: string, username: string, socketId: string) => {
    const roomCodeTrimmed = roomCode.trim();

    const room = rooms.find((room) => room.roomCode === roomCodeTrimmed);
    if (!room) {
        return {
            success: false,
            message: "Room not found"
        }
    }

    const existingPlayerIdx = room.players.findIndex((player) => player.userId === userId);

    if (existingPlayerIdx !== -1) {
        const existingPlayer = room.players[existingPlayerIdx];
        // @ts-ignore
        existingPlayer.socketId = socketId;
        // @ts-ignore
        existingPlayer.isDisconnected = false;

        return {
            success: true,
            message: "Reconnected to existing game",
            room
        }
    }

    if (room.players.length == 2) {
        return {
            success: false,
            message: "Room is already full (maximum 2 players allowed)",
        }
    }

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


export const leaveRoom = (roomCode: string, userId: string) => {
    const roomIdTrimmed = roomCode.trim();

    const room = rooms.find((room) => room.roomCode === roomIdTrimmed);
    if (!room) {
        return {
            success: false,
            message: "Room not found"
        }
    }

    const existingPlayerIdx = room.players.findIndex((player) => player.userId === userId);

    if (existingPlayerIdx === -1) {
        return {
            success: false,
            message: "Player not found in the room"
        }
    }

    const player = room.players[existingPlayerIdx];

    const wasActiveGame = room.status === "playing";
    let winnerId: string | undefined;

    if (wasActiveGame && room.players.length === 1 && room.game) {
        const remainingPlayer = room.players[0];
        winnerId = remainingPlayer.userId;
        room.status = "finished";
        room.game.winnerId = winnerId;
        room.game.winReason = "disconnect";
    }
    if (room.players.length === 0) {
        rooms = rooms.filter((r) => r.roomCode !== roomIdTrimmed);
        return { success: true, roomDeleted: true, wasActiveGame, winnerId };
    }

    if (room.hostId === userId && room.players.length > 0) {
        room.hostId = room.players[0].userId;
    }

    if (!wasActiveGame) {
        room.status = "waiting";
    }

    return { success: true, room, roomDeleted: false, wasActiveGame, winnerId };
}


export const reconnectPlayer = (userId: string, newSocketId: string, roomCode: string) => {


    let room;


    roomCode = roomCode.trim();
    room = rooms.find((r) => r.roomCode === roomCode);

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