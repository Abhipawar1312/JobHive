import express from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobById, getAdminJobs, getAllJobs, getJobById, postJob, updateJob } from "../Controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(getJobById);
router.route("/admin/jobs/:id").get(isAuthenticated, getAdminJobById);
router.route("/update/:id").put(isAuthenticated, updateJob);
export default router;