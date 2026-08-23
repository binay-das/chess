import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export function validate(schema: z.ZodTypeAny) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            console.log("Error in validation middleware", error);
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    // @ts-ignore
                    errors: error.errors,
                });
            }
            next(error);
        }
    };
}