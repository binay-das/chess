import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
    userId: string;
    username: string;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    console.log("Authenticating via middleware...")
    console.log("req.user: ", req.user);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("Token is missing or invalid");
        return res.status(401).json({
            success: false,
            message: "Authorization token is missing or invalid"
        });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        console.log("Token is missing or invalid");
        return res.status(401).json({
            success: false,
            message: "Authorization token is missing or invalid"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = decoded;
        console.log("Token is verified successfully...");
        next();
    } catch {
        console.log("Token verification failed");
        return res.status(401).json({
            success: false,
            message: "Authorization token is missing or invalid"
        });
    }
}