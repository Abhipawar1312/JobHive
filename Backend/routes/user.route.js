import express from "express";
import {
    login,
    logout,
    register,
    refreshTokenController,
    updateProfile,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    getCurrentUser,
    streamResumePdf
} from "../Controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";
import validate from "../middlewares/validate.js";
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema,
    updateProfileSchema
} from "../validators/auth.validator.js";

const router = express.Router();

router.route("/register").post(singleUpload, validate(registerSchema), register);
router.route("/login").post(validate(loginSchema), login);
router.route("/refresh-token").post(refreshTokenController);
router.route("/logout").get(logout);
router.route("/logout").post(logout);
router.route("/profile/update").post(isAuthenticated, singleUpload, validate(updateProfileSchema), updateProfile);
router.route("/forgot-password").post(validate(forgotPasswordSchema), forgotPassword);
router.route("/verify-otp").post(validate(verifyOtpSchema), verifyResetOtp);
router.route("/reset-password").post(validate(resetPasswordSchema), resetPassword);
router.route("/me").get(isAuthenticated, getCurrentUser);
router.route("/resume/stream").get(streamResumePdf);

export default router;