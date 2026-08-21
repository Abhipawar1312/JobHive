import { z } from "zod";

export const postJobSchema = z.object({
    body: z.object({
        title: z.string({ required_error: "Job title is required." }).trim().min(2, "Job title must be at least 2 characters."),
        description: z.string({ required_error: "Job description is required." }).trim().min(10, "Job description must be at least 10 characters."),
        requirements: z.string().optional().default(""),
        salary: z.union([z.string(), z.number()], { required_error: "Salary is required." })
            .transform((val) => Number(val))
            .refine((val) => !isNaN(val) && val >= 0, { message: "Salary must be a non-negative number." }),
        location: z.string({ required_error: "Location is required." }).trim().min(1, "Location is required."),
        jobType: z.string({ required_error: "Job type is required." }).trim().min(1, "Job type is required."),
        experience: z.union([z.string(), z.number()]).optional()
            .transform((val) => (val !== undefined && val !== "" ? Number(val) : 0)),
        position: z.union([z.string(), z.number()]).optional()
            .transform((val) => (val !== undefined && val !== "" ? Number(val) : 1)),
        companyId: z.string().optional(),
        status: z.enum(["open", "closed"]).optional().default("open"),
    }),
});

export const updateJobSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Job ID parameter is required."),
    }),
    body: z.object({
        title: z.string().trim().min(2).optional(),
        description: z.string().trim().min(10).optional(),
        requirements: z.string().optional(),
        salary: z.union([z.string(), z.number()]).optional()
            .transform((val) => (val !== undefined && val !== "" ? Number(val) : undefined)),
        location: z.string().trim().optional(),
        jobType: z.string().trim().optional(),
        experience: z.union([z.string(), z.number()]).optional()
            .transform((val) => (val !== undefined && val !== "" ? Number(val) : undefined)),
        position: z.union([z.string(), z.number()]).optional()
            .transform((val) => (val !== undefined && val !== "" ? Number(val) : undefined)),
        companyId: z.string().optional(),
        status: z.enum(["open", "closed"]).optional(),
    }),
});

export const getAllJobsQuerySchema = z.object({
    query: z.object({
        keyword: z.string().optional(),
        location: z.string().optional(),
        jobType: z.string().optional(),
        minSalary: z.string().optional(),
        maxSalary: z.string().optional(),
        experienceLevel: z.string().optional(),
        datePosted: z.enum(["24h", "7d", "30d"]).optional(),
        sort: z.enum(["newest", "oldest", "salary_high", "salary_low"]).optional(),
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("50"),
    }),
});

export const subscribeAlertsSchema = z.object({
    body: z.object({
        email: z.string({ required_error: "Email is required." }).trim().email("Please provide a valid email address."),
        keywords: z.union([z.string(), z.array(z.string())]).optional(),
        location: z.string().optional(),
        frequency: z.enum(["daily", "weekly"]).optional().default("weekly"),
    }),
});
