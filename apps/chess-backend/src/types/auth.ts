import { z } from "zod"

export const signUpInputSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(30),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const signInInputSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(30),
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
}).refine((data) => data.email || data.username, {
    message: "Either email or username must be provided",
    path: ["email", "username"],
})