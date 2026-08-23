import { Request, Response, Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { calculatePlayerStats } from "../lib/playerStats";


const router: Router = Router();

router.get("/profile", authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;


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
                message: "User not found",
            });
        }

        const stats = await calculatePlayerStats(userId as string);

        return res.status(200).json({
            message: "User profile fetched successfully",
            data: { user, stats }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Error fetching user profile",
        })
    }
})