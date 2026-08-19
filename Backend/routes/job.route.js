import express from "express";
import { isAuthenticated, isRecruiter } from "../middlewares/isAuthenticated.js";
import { getAdminJobById, getAdminJobs, getAllJobs, getJobById, postJob, updateJob, deleteJob, subscribeJobAlerts } from "../Controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, isRecruiter, postJob);
router.route("/get").get(getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, isRecruiter, getAdminJobs);
router.route("/get/:id").get(getJobById);
router.route("/admin/jobs/:id").get(isAuthenticated, isRecruiter, getAdminJobById);
router.route("/update/:id").put(isAuthenticated, isRecruiter, updateJob);
router.route("/delete/:id").delete(isAuthenticated, isRecruiter, deleteJob);
router.route("/subscribe-alerts").post(subscribeJobAlerts);

export default router;