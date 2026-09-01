import { prisma } from "../lib/prisma";
import { Request, Response, NextFunction, Router } from "express";
import { calculatePlayerStats } from "../lib/playerStats";
import { authenticate } from "../middleware/auth.middleware";


const router: Router = Router();

router.get("/profile", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized, userId not found"
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                username: true,
                email: true,
                rating: true,
                createdAt: true
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const stats = await calculatePlayerStats(userId);

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            data: { user, stats }
        });
    } catch (error) {
        next(error);
    }
});

export default router;