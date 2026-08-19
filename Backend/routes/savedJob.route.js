import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getSavedJobs, saveJob, unsaveJob, updateSavedJobNotes } from "../Controllers/savedJob.controller.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getSavedJobs);
router.route("/save").post(isAuthenticated, saveJob);
router.route("/unsave/:jobId").delete(isAuthenticated, unsaveJob);
router.route("/notes/:jobId").put(isAuthenticated, updateSavedJobNotes);

export default router;
