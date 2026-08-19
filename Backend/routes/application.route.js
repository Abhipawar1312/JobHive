import express from "express";
import { isAuthenticated, isRecruiter } from "../middlewares/isAuthenticated.js";
import { applyJob, getApplicants, getAppliedJobs, updateStatus, exportApplicantsCSV } from "../Controllers/application.controller.js";

const router = express.Router();

router.route("/apply/:id").post(isAuthenticated, applyJob);
router.route("/apply/:id").get(isAuthenticated, applyJob); // keep GET for backward compatibility
router.route("/get").get(isAuthenticated, getAppliedJobs);
router.route("/:id/applicants").get(isAuthenticated, isRecruiter, getApplicants);
router.route("/status/:id/update").post(isAuthenticated, isRecruiter, updateStatus);
router.route("/:id/export-csv").get(isAuthenticated, isRecruiter, exportApplicantsCSV);

export default router;
