import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validate } from "../middleware/validate.middleware";
import { signInInputSchema, signUpInputSchema } from "../types/auth";
import { authenticate } from "../middleware/auth.middleware";
import { env } from "../config/env.js";
import { createRateLimiter } from "../middleware/rateLimit.middleware.js";

const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: "Too many authentication attempts. Please try again later."
});

const router: Router = Router();

router.post("/signup", authRateLimiter, validate(signUpInputSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        })

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists"
                })
            }
            if (existingUser.username === username) {
                return res.status(400).json({
                    success: false,
                    message: "Username already exists"
                })
            }
        }

        const passwordHash: string = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash
            },
            select: {
                id: true,
                username: true,
                email: true,
                rating: true,
                createdAt: true
            }
        })

        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                email: user.email,
            },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
        )

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user,
            token
        })



    } catch (error) {
        next(error);
    }
})


router.post("/signin", authRateLimiter, validate(signInInputSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, username, password } = req.body;
        const identifier = email || username;


        console.log("=====================================")

        console.log("[Sign in] Identifier:", identifier);

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            }
        })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            })
        }

        const isPasswordValid: boolean = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            })
        }

        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                email: user.email,
            },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
        )

        return res.status(200).json({
            success: true,
            message: "User signed in successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                rating: user.rating,
                createdAt: user.createdAt
            }
        })
    } catch (error) {
        next(error);
    }
})


router.get("/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                username: true,
                email: true,
                rating: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user
        })
    } catch (error) {
        next(error);
    }
})


export default router
