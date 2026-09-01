import { prisma } from "./prisma";

export const calculatePlayerStats = async (userId: string) => {
    try {
        const games = await prisma.game.findMany({
            where: {
                OR: [{
                    whitePlayerId: userId
                }, {
                    blackPlayerId: userId
                }],
                status: "FINISHED"
            },
            select: {
                id: true,
                whitePlayerId: true,
                blackPlayerId: true,
                winnerId: true,
                result: true
            }
        });

        const totalGames = games.length;

        let wins = 0;
        let losses = 0;
        let draws = 0;
        let whiteGames = 0;
        let blackGames = 0;
        let whiteWins = 0;
        let blackWins = 0;

        for (let i = 0; i < games.length; i++) {
            const isWhite = games[i]?.whitePlayerId === userId;
            if (isWhite) {
                whiteGames++;
            } else {
                blackGames++;
            }

            if (games[i]?.winnerId === userId) {
                wins++;
                if (isWhite) {
                    whiteWins++;
                } else {
                    blackWins++;
                }
            } else if (games[i]?.winnerId && games[i]?.winnerId !== userId) {
                losses++;
            } else {
                draws++;
            }
        }

        const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

        return {
            totalGames,
            wins,
            losses,
            draws,
            winRate,
            breakDown: {
                asWhite: {
                    total: whiteGames,
                    wins: whiteWins
                },
                asBlack: {
                    total: blackGames,
                    wins: blackWins
                }
            }
        }
    } catch (error) {
        console.error("[playerStats] Error calculating player stats:", error);
        return null;
    }
};