import express from "express";
import { isAuthenticated, isRecruiter } from "../middlewares/isAuthenticated.js";
import validate from "../middlewares/validate.js";
import {
    getAdminJobById,
    getAdminJobs,
    getAllJobs,
    getJobById,
    postJob,
    updateJob,
    deleteJob,
    subscribeJobAlerts
} from "../Controllers/job.controller.js";
import {
    postJobSchema,
    updateJobSchema,
    getAllJobsQuerySchema,
    subscribeAlertsSchema
} from "../validators/job.validator.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, isRecruiter, validate(postJobSchema), postJob);
router.route("/get").get(validate(getAllJobsQuerySchema), getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, isRecruiter, getAdminJobs);
router.route("/get/:id").get(getJobById);
router.route("/admin/jobs/:id").get(isAuthenticated, isRecruiter, getAdminJobById);
router.route("/update/:id").put(isAuthenticated, isRecruiter, validate(updateJobSchema), updateJob);
router.route("/delete/:id").delete(isAuthenticated, isRecruiter, deleteJob);
router.route("/subscribe-alerts").post(validate(subscribeAlertsSchema), subscribeJobAlerts);

export default router;