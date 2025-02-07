import { SavedJob } from "../models/savedJobs.model.js";
import { Job } from "../models/job.model.js";

/**
 * @desc   Save a job for the authenticated user
 * @route  POST /api/savedjobs/save
 * @access Protected (requires isAuthenticated middleware)
 */
export const saveJob = async (req, res) => {
    try {
        const userId = req.id; // using your isAuthenticated middleware that sets req.id
        const { jobId } = req.body;

        // Validate jobId
        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required.",
                success: false,
            });
        }

        // Optionally, verify that the job exists
        const jobExists = await Job.findById(jobId);
        if (!jobExists) {
            return res.status(404).json({
                message: "Job not found.",
                success: false,
            });
        }

        // Check if the job is already saved by the user
        const alreadySaved = await SavedJob.findOne({ user: userId, job: jobId });
        if (alreadySaved) {
            return res.status(400).json({
                message: "Job already saved.",
                success: false,
            });
        }

        const newSavedJob = await SavedJob.create({ user: userId, job: jobId });
        return res.status(201).json({
            message: "Job saved successfully.",
            savedJob: newSavedJob,
            success: true,
        });
    } catch (error) {
        console.error("Error saving job:", error);
        return res.status(500).json({
            message: "Server Error.",
            success: false,
        });
    }
};

/**
 * @desc   Unsave a job for the authenticated user
 * @route  DELETE /api/savedjobs/unsave/:jobId
 * @access Protected (requires isAuthenticated middleware)
 */
export const unsaveJob = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required in the URL.",
                success: false,
            });
        }

        const removed = await SavedJob.findOneAndDelete({ user: userId, job: jobId });
        if (!removed) {
            return res.status(404).json({
                message: "Saved job not found.",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Job unsaved successfully.",
            success: true,
        });
    } catch (error) {
        console.error("Error unsaving job:", error);
        return res.status(500).json({
            message: "Server Error.",
            success: false,
        });
    }
};

/**
 * @desc   Get all saved jobs for the authenticated user
 * @route  GET /api/savedjobs/
 * @access Protected (requires isAuthenticated middleware)
 */
export const getSavedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const savedJobs = await SavedJob.find({ user: userId }).populate({
            path: 'job',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'company',
                options: { sort: { createdAt: - 1 } }
            }
        })
        return res.status(200).json({
            savedJobs,
            success: true,
        });
    } catch (error) {
        console.error("Error retrieving saved jobs:", error);
        return res.status(500).json({
            message: "Server Error.",
            success: false,
        });
    }
};
