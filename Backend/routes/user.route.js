import express from "express";
import { login, logout, register, updateProfile, forgotPassword, verifyResetOtp, resetPassword, getCurrentUser, streamResumePdf } from "../Controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated, singleUpload, updateProfile);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyResetOtp);
router.route("/reset-password").post(resetPassword);
router.route("/me").get(isAuthenticated, getCurrentUser);
router.route("/resume/stream").get(streamResumePdf);

export default router;