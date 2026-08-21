import { z } from "zod";

export const registerCompanySchema = z.object({
    body: z.object({
        companyName: z
            .string({ required_error: "Company name is required." })
            .trim()
            .min(2, "Company name must be at least 2 characters."),
    }),
});

export const updateCompanySchema = z.object({
    params: z.object({
        id: z.string().min(1, "Company ID parameter is required."),
    }),
    body: z.object({
        name: z.string().trim().min(2).optional(),
        description: z.string().optional(),
        website: z.string().optional(),
        location: z.string().optional(),
    }),
});
