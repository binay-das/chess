import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";




const router: Router = Router();

router.post("/signup", async (req: Request, res: Response) => {
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
            process.env.JWT_SECRET! as string,
            { expiresIn: process.env.JWT_EXPIRES_IN! as jwt.SignOptions["expiresIn"] }
        )

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user,
            token
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


router.post("/signin", async (req: Request, res: Response) => {
    try {
        const { email, username, password } = req.body;
        const identifier = email || username;


        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
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
            process.env.JWT_SECRET! as string,
            { expiresIn: process.env.JWT_EXPIRES_IN! as jwt.SignOptions["expiresIn"] }
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
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error
        })
    }
})


router.get("/me", async (req: Request, res: Response) => {
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
        if(!user) {
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
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error
        })
    }
})


export default router
