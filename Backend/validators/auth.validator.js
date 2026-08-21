import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        fullname: z
            .string({ required_error: "Full name is required." })
            .trim()
            .min(2, "Full name must be at least 2 characters."),
        email: z
            .string({ required_error: "Email is required." })
            .trim()
            .email("Please provide a valid email address."),
        phoneNumber: z
            .union([z.string(), z.number()])
            .transform((val) => Number(val))
            .refine((val) => !isNaN(val) && val.toString().length >= 7, {
                message: "Please enter a valid phone number (at least 7 digits).",
            }),
        password: z
            .string({ required_error: "Password is required." })
            .min(6, "Password must be at least 6 characters long."),
        role: z.enum(["student", "recruiter"], {
            errorMap: () => ({ message: "Role must be either 'student' or 'recruiter'." }),
        }),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z
            .string({ required_error: "Email is required." })
            .trim()
            .email("Please provide a valid email address."),
        password: z
            .string({ required_error: "Password is required." })
            .min(1, "Password cannot be empty."),
        role: z.enum(["student", "recruiter"], {
            errorMap: () => ({ message: "Role must be either 'student' or 'recruiter'." }),
        }),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z
            .string({ required_error: "Email is required." })
            .trim()
            .email("Please provide a valid email address."),
    }),
});

export const verifyOtpSchema = z.object({
    body: z.object({
        email: z
            .string({ required_error: "Email is required." })
            .trim()
            .email("Please provide a valid email address."),
        otp: z
            .union([z.string(), z.number()])
            .transform((val) => String(val).trim())
            .refine((val) => val.length === 6, {
                message: "OTP must be exactly 6 digits.",
            }),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        email: z
            .string({ required_error: "Email is required." })
            .trim()
            .email("Please provide a valid email address."),
        otp: z
            .union([z.string(), z.number()])
            .transform((val) => String(val).trim()),
        newPassword: z
            .string({ required_error: "New password is required." })
            .min(6, "Password must be at least 6 characters."),
    }),
});

export const updateProfileSchema = z.object({
    body: z.object({
        fullname: z.string().trim().min(2).optional(),
        email: z.string().trim().email().optional(),
        phoneNumber: z.union([z.string(), z.number()]).optional(),
        bio: z.string().optional(),
        skills: z.union([z.string(), z.array(z.string())]).optional(),
    }),
});
