import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma";


const router: Router = Router()


router.get("/", async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId

        const games = await prisma.game.findMany({
            where: {
                OR: [
                    { whitePlayerId: userId },
                    { blackPlayerId: userId }
                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                whitePlayer: true,
                blackPlayer: true,
                winner: true
            }
        })

        return res.status(200).json({
            success: true,
            message: "Games fetched successfully",
            gameCount: games.length,
            games
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error
        })
    }
})

router.get("/:id", async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user!.userId;
        const gameId = req.params.id as string;

        const game = await prisma.game.findFirst({
            where: {
                OR: [
                    { id: gameId },
                    { roomCode: gameId }
                ],
                AND: {
                    OR: [
                        { whitePlayerId: userId },
                        { blackPlayerId: userId }
                    ]
                }
            },
            include: {
                whitePlayer: true,
                blackPlayer: true,
                winner: true,
                moves: {
                    orderBy: {
                        moveNumber: "asc"
                    }
                }
            }
        })

        if (!game) {
            return res.status(404).json({
                success: false,
                message: "Game not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Game fetched successfully",
            game
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error
        })
    }
})


router.get("/:id/moves", async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user!.userId;
        const gameId = req.params.id as string;

        const game = await prisma.game.findFirst({
            where: {
                OR: [
                    { id: gameId },
                    { roomCode: gameId }
                ],
                AND: {
                    OR: [
                        { whitePlayerId: userId },
                        { blackPlayerId: userId }
                    ]
                }
            },
            select: {
                id: true,
                roomCode: true
            }
        })

        if (!game) {
            return res.status(404).json({
                success: false,
                message: "Game not found"
            })
        }

        const moves = await prisma.move.findMany({
            where: {
                gameId: game.id
            },
            orderBy: {
                moveNumber: "asc"
            }
        })

        return res.status(200).json({
            success: true,
            message: "Moves fetched successfully",
            moves
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error
        })
    }
})

router.post("/create",)