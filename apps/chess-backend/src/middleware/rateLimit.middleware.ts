import { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
    const { windowMs, max, message = "Too many requests. Please try again later." } = options;
    const hits = new Map<string, { count: number; resetTime: number }>();

    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of hits.entries()) {
            if (now > record.resetTime) {
                hits.delete(key);
            }
        }
    }, windowMs);
    cleanupInterval.unref();

    return (req: Request, res: Response, next: NextFunction) => {
        const key = req.ip || req.socket.remoteAddress || "unknown";
        const now = Date.now();
        const record = hits.get(key);

        if (!record || now > record.resetTime) {
            hits.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }

        record.count++;
        if (record.count > max) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            res.setHeader("Retry-After", retryAfter);
            return res.status(429).json({
                success: false,
                message,
            });
        }

        next();
    };
}
