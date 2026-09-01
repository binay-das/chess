import { Request, Response, NextFunction } from "express";

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) {
    console.error("[Unhandled Express Error]", err);
    res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
    });
}
