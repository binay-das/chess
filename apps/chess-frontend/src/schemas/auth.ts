import { z } from "zod";

export const loginSchema = z.object({
    emailOrUsername: z
        .string()
        .min(1, "Email or Username is required"),
    password: z
        .string()
        .min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username cannot exceed 30 characters"),
        email: z
            .string()
            .min(1, "Email address is required")
            .email("Please enter a valid email address"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters"),
        confirmPassword: z
            .string()
            .min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;
