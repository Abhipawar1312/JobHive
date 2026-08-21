import { z } from "zod";

export const applyJobSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Job ID is required."),
    }),
});

export const updateApplicationStatusSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Application ID is required."),
    }),
    body: z.object({
        status: z.enum([
            "pending",
            "reviewing",
            "shortlisted",
            "interview",
            "accepted",
            "rejected"
        ], {
            errorMap: () => ({
                message: "Status must be one of: 'pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'."
            })
        }),
    }),
});
