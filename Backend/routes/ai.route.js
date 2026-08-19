import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";
import {
    analyzeResumeMatch,
    generateJobDescription,
    generateInterviewQuestions,
    parseResumeForProfile,
    evaluateMockInterviewAnswer,
    tailorResumeForJob
} from "../Controllers/ai.controller.js";

const router = express.Router();

router.route("/match-resume").post(isAuthenticated, analyzeResumeMatch);
router.route("/generate-jd").post(isAuthenticated, generateJobDescription);
router.route("/interview-prep/:jobId").get(generateInterviewQuestions);
router.route("/parse-resume").post(isAuthenticated, singleUpload, parseResumeForProfile);
router.route("/evaluate-mock-answer").post(isAuthenticated, evaluateMockInterviewAnswer);
router.route("/tailor-resume").post(isAuthenticated, tailorResumeForJob);

export default router;
