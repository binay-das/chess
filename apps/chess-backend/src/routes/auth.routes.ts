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
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error
        })
    }
})


export default router
