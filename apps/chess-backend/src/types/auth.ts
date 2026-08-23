import { z } from "zod";

export const signUpInputSchema = z.object({
    body: z.object({
        username: z.string().min(3, "Username must be at least 3 characters").max(30),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
    }),
});

export type SignUpInput = z.infer<typeof signUpInputSchema>;

export const signInInputSchema = z.object({
    body: z.object({
        username: z.string().min(3, "Username must be at least 3 characters").max(30).optional(),
        email: z.string().email("Invalid email address").optional(),
        password: z.string().min(1, "Password is required"),
    }).refine((data) => Boolean(data.email || data.username), {
        message: "Either email or username must be provided",
        path: ["email"],
    }),
});

export type SignInInput = z.infer<typeof signInInputSchema>;