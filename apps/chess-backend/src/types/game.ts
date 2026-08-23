import { z } from "zod";

export const getGameByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Game ID is required"),
    }),
});

export const getGameMovesSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Game ID is required"),
    }),
});
