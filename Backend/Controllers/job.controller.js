import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { SavedJob } from "../models/savedJobs.model.js";
import { JobAlert } from "../models/jobAlert.model.js";
import { getCache, setCache, deleteCache, clearJobCache } from "../utils/redis.js";

// Recruiter: Post Job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !salary || !location || !jobType || !companyId) {
            return res.status(400).json({
                message: "Title, description, salary, location, jobType, and company are required.",
                success: false
            });
        }

        const job = await Job.create({
            title,
            description,
            requirements: requirements || "",
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience ? Number(experience) : 0,
            position: position ? Number(position) : 1,
            company: companyId,
            created_by: userId
        });

        // Invalidate Redis job caches
        await clearJobCache();

        return res.status(201).json({
            message: "Job posted successfully!",
            success: true,
            job
        });
    } catch (error) {
        console.error("Post Job Error:", error);
        return res.status(500).json({
            message: error.message || "Failed to create job",
            success: false
        });
    }
};

// All Users: Get All Jobs with Advanced Filters & Sorting & Pagination
export const getAllJobs = async (req, res) => {
    try {
        const userId = req.id;
        const {
            keyword,
            location,
            jobType,
            minSalary,
            maxSalary,
            experienceLevel,
            datePosted,
            sort = "newest",
            page = 1,
            limit = 50
        } = req.query;

        const query = {};

        // Keyword search across title, description, requirements
        if (keyword && keyword.trim()) {
            query.$or = [
                { title: { $regex: keyword.trim(), $options: "i" } },
                { description: { $regex: keyword.trim(), $options: "i" } },
                { requirements: { $regex: keyword.trim(), $options: "i" } },
            ];
        }

        // Location filter (case-insensitive)
        if (location && location.trim()) {
            query.location = { $regex: location.trim(), $options: "i" };
        }

        // Job type filter (supports single or comma-separated e.g. "Full-Time,Remote")
        if (jobType && jobType.trim()) {
            const types = jobType.split(",").map(t => new RegExp(t.trim(), "i"));
            query.jobType = { $in: types };
        }

        // Salary range filter
        if (minSalary || maxSalary) {
            query.salary = {};
            if (minSalary) query.salary.$gte = Number(minSalary);
            if (maxSalary) query.salary.$lte = Number(maxSalary);
        }

        // Experience filter
        if (experienceLevel !== undefined && experienceLevel !== "") {
            query.experienceLevel = { $lte: Number(experienceLevel) };
        }

        // Date posted filter (e.g. "24h", "7d", "30d")
        if (datePosted) {
            const now = new Date();
            if (datePosted === "24h") {
                query.createdAt = { $gte: new Date(now - 24 * 60 * 60 * 1000) };
            } else if (datePosted === "7d") {
                query.createdAt = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
            } else if (datePosted === "30d") {
                query.createdAt = { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
            }
        }

        // Sorting options
        let sortOption = { createdAt: -1 };
        if (sort === "salary_high") {
            sortOption = { salary: -1 };
        } else if (sort === "salary_low") {
            sortOption = { salary: 1 };
        } else if (sort === "oldest") {
            sortOption = { createdAt: 1 };
        }

        const queryHash = JSON.stringify(req.query);
        const cacheKey = `jobs:query:${queryHash}`;

        let rawJobs = null;
        let totalJobs = 0;

        const cached = await getCache(cacheKey);
        if (cached) {
            rawJobs = cached.jobs;
            totalJobs = cached.totalJobs;
        } else {
            const skip = (Number(page) - 1) * Number(limit);
            totalJobs = await Job.countDocuments(query);

            const fetchedJobs = await Job.find(query)
                .populate({ path: "company" })
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit));

            rawJobs = fetchedJobs.map(j => (j.toObject ? j.toObject() : j));
            await setCache(cacheKey, { jobs: rawJobs, totalJobs }, 120); // 2 minute TTL
        }

        // Mark saved status for logged-in user dynamically
        let savedJobIds = [];
        let savedJobs = [];
        if (userId) {
            savedJobs = await SavedJob.find({ user: userId });
            savedJobIds = savedJobs.map(s => s.job.toString());
        }

        const jobsWithSavedStatus = (rawJobs || []).map(jobObj => ({
            ...jobObj,
            isSaved: savedJobIds.includes(jobObj._id?.toString())
        }));

        return res.status(200).json({
            jobs: jobsWithSavedStatus,
            savedJobs,
            totalJobs,
            currentPage: Number(page),
            totalPages: Math.ceil(totalJobs / Number(limit)),
            success: true,
        });
    } catch (error) {
        console.error("Error retrieving jobs:", error);
        return res.status(500).json({
            message: "Internal Server Error while fetching jobs",
            success: false,
        });
    }
};

// Candidate / Public: Get Single Job By ID
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const cacheKey = `job:${jobId}`;

        const cachedJob = await getCache(cacheKey);
        if (cachedJob) {
            return res.status(200).json({
                job: cachedJob,
                success: true,
                fromCache: true
            });
        }

        const job = await Job.findById(jobId)
            .populate("applications")
            .populate("company")
            .populate("created_by", "fullname email profilePhoto role");

        if (!job) {
            return res.status(404).json({
                message: "Job Not Found",
                success: false
            });
        }

        const jobObj = job.toObject();
        await setCache(cacheKey, jobObj, 300); // 5 minute TTL

        return res.status(200).json({
            job: jobObj,
            success: true
        });
    } catch (error) {
        console.error("Get Job By ID Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

// Recruiter: Get single job created by admin
export const getAdminJobById = async (req, res) => {
    try {
        const adminId = req.id;
        const jobId = req.params.id;

        const job = await Job.findOne({ _id: jobId, created_by: adminId }).populate("company");

        if (!job) {
            return res.status(404).json({
                message: "Job Not Found or Unauthorized Access.",
                success: false,
            });
        }

        return res.status(200).json({
            job,
            success: true,
        });
    } catch (error) {
        console.error("Admin Get Job By ID Error:", error);
        return res.status(500).json({
            message: "Internal Server Error.",
            success: false,
        });
    }
};

// Recruiter: Get all jobs created by current recruiter
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId })
            .populate("company")
            .populate("applications")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            jobs: jobs || [],
            success: true
        });
    } catch (error) {
        console.error("Get Admin Jobs Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

// Recruiter: Update Job
export const updateJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;

        const updateData = {
            title,
            description,
            requirements,
            salary: salary ? Number(salary) : undefined,
            location,
            jobType,
            experienceLevel: experience !== undefined ? Number(experience) : undefined,
            position: position !== undefined ? Number(position) : undefined,
            company: companyId ? new mongoose.Types.ObjectId(companyId) : undefined
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, created_by: req.id },
            updateData,
            { new: true }
        );

        if (!job) {
            return res.status(404).json({
                message: "Job Not Found or Unauthorized.",
                success: false,
            });
        }

        // Invalidate Redis caches
        await clearJobCache();
        await deleteCache(`job:${req.params.id}`);

        return res.status(200).json({
            message: "Job updated successfully.",
            job,
            success: true,
        });
    } catch (error) {
        console.error("Update Job Error:", error);
        return res.status(500).json({
            message: "Internal Server Error.",
            success: false,
        });
    }
};

// Recruiter: Delete Job
export const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findOneAndDelete({ _id: jobId, created_by: req.id });

        if (!job) {
            return res.status(404).json({
                message: "Job not found or not authorized to delete.",
                success: false
            });
        }

        // Invalidate Redis caches
        await clearJobCache();
        await deleteCache(`job:${jobId}`);

        return res.status(200).json({
            message: "Job deleted successfully.",
            success: true
        });
    } catch (error) {
        console.error("Delete Job Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

// Candidate / Guest: Subscribe to Smart Job Alerts
export const subscribeJobAlerts = async (req, res) => {
    try {
        const { email, keywords, location, frequency } = req.body;
        const userId = req.id || null;

        if (!email) {
            return res.status(400).json({
                message: "Email is required to subscribe to job alerts.",
                success: false
            });
        }

        const keywordsArray = Array.isArray(keywords)
            ? keywords
            : typeof keywords === "string"
            ? keywords.split(",").map(k => k.trim()).filter(Boolean)
            : [];

        const alert = await JobAlert.create({
            email,
            user: userId,
            keywords: keywordsArray,
            location: location || "",
            frequency: frequency || "weekly",
            isActive: true
        });

        return res.status(201).json({
            message: "Successfully subscribed to JobHive Smart Job Alerts!",
            alert,
            success: true
        });
    } catch (error) {
        console.error("Subscribe Job Alerts Error:", error);
        return res.status(500).json({
            message: "Failed to subscribe to job alerts.",
            success: false
        });
    }
};
