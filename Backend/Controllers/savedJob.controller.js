import { SavedJob } from "../models/savedJobs.model.js";
import { Job } from "../models/job.model.js";

// Save a job
export const saveJob = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId, notes } = req.body;

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required.",
                success: false,
            });
        }

        const jobExists = await Job.findById(jobId);
        if (!jobExists) {
            return res.status(404).json({
                message: "Job not found.",
                success: false,
            });
        }

        const alreadySaved = await SavedJob.findOne({ user: userId, job: jobId });
        if (alreadySaved) {
            return res.status(400).json({
                message: "Job already saved.",
                success: false,
            });
        }

        const newSavedJob = await SavedJob.create({
            user: userId,
            job: jobId,
            notes: notes || ""
        });

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

// Unsave a job
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
            message: "Job removed from saved list.",
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

// Get all saved jobs for current user
export const getSavedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const savedJobs = await SavedJob.find({ user: userId }).populate({
            path: 'job',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'company',
            }
        });
        return res.status(200).json({
            savedJobs: savedJobs || [],
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

// Update notes on a saved job
export const updateSavedJobNotes = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId } = req.params;
        const { notes } = req.body;

        const savedJob = await SavedJob.findOneAndUpdate(
            { user: userId, job: jobId },
            { notes: notes || "" },
            { new: true }
        );

        if (!savedJob) {
            return res.status(404).json({
                message: "Saved job not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Notes updated.",
            savedJob,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error updating notes",
            success: false
        });
    }
};
