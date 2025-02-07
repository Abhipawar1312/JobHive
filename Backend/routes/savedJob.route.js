import express from "express";
import { saveJob, unsaveJob, getSavedJobs } from "../Controllers/savedJob.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Route to save a job
router.post("/save", isAuthenticated, saveJob);

// Route to unsave a job (jobId in URL param)
router.delete("/unsave/:jobId", isAuthenticated, unsaveJob);

// Route to get all saved jobs for the current user
router.get("/list", isAuthenticated, getSavedJobs);

export default router;
