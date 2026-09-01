import { Socket } from "socket.io";
import jwt from "jsonwebtoken";


export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    user: JwtPayload;
  };
}

export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void): void {
  try {
    const authHeader =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!authHeader) {
      return next(new Error("Authentication error: Token missing"));
    }

    const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET! as string) as JwtPayload;
    socket.data.user = decoded;

    next();
  } catch {
    return next(new Error("Authentication error: Invalid or expired token"));
  }
}
