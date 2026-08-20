import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import https from "https";
import http from "http";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { sendPasswordResetEmail } from "../utils/emailService.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Please fill in all required fields.",
                success: false
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "This email address is already registered. Please sign in or use another email.",
                success: false,
            });
        }

        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
            return res.status(400).json({
                message: "This phone number is already registered with another account.",
                success: false,
            });
        }

        let profilePhotoUrl = "";
        const file = req.file;
        if (file) {
            try {
                const fileUri = getDataUri(file);
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                profilePhotoUrl = cloudResponse.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError);
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: profilePhotoUrl,
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
            user: {
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("Register Error:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || "field";
            if (field === "phoneNumber") {
                return res.status(400).json({
                    message: "This phone number is already registered with another account.",
                    success: false
                });
            }
            if (field === "email") {
                return res.status(400).json({
                    message: "This email address is already associated with another account.",
                    success: false
                });
            }
        }
        return res.status(500).json({
            message: "Failed to create account. Please try again.",
            success: false
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Please provide email, password, and role.",
                success: false
            });
        }

        let user = await User.findOne({ email }).populate("profile.company");
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        if (role !== user.role) {
            return res.status(400).json({
                message: `Account registered as ${user.role}, not ${role}.`,
                success: false
            });
        }

        const tokenData = {
            userId: user._id,
            role: user.role
        };
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '7d' });

        const userData = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        const cookieOptions = {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production"
        };

        return res.status(200).cookie("token", token, cookieOptions).json({
            message: `Welcome back, ${user.fullname}!`,
            user: userData,
            token,
            success: true
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            message: error.message || "Server error during login",
            success: false
        });
    }
};

export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            message: "Server error during logout",
            success: false
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const userId = req.id;

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        const file = req.file;
        let cloudResponse = null;

        if (file) {
            try {
                const fileUri = getDataUri(file);
                const isPdf = file.mimetype?.includes("pdf") || file.originalname?.toLowerCase().endsWith(".pdf");
                const cleanBaseName = file.originalname
                    ? file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
                    : "Resume";

                cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                    resource_type: "auto",
                    public_id: isPdf ? `resumes/${cleanBaseName}_${Date.now()}` : `profiles/${cleanBaseName}_${Date.now()}`,
                    use_filename: true,
                    unique_filename: true,
                });
            } catch (uploadError) {
                console.error("File upload error:", uploadError);
            }
        }

        let skillsArray;
        if (skills) {
            skillsArray = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim()).filter(Boolean);
        }

        if (fullname) user.fullname = fullname;
        if (email && email !== user.email) {
            const existingEmailUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingEmailUser) {
                return res.status(400).json({
                    message: "This email address is already associated with another account.",
                    success: false
                });
            }
            user.email = email;
        }
        if (phoneNumber && phoneNumber !== user.phoneNumber) {
            const existingPhoneUser = await User.findOne({ phoneNumber, _id: { $ne: userId } });
            if (existingPhoneUser) {
                return res.status(400).json({
                    message: "This phone number is already registered with another account.",
                    success: false
                });
            }
            user.phoneNumber = phoneNumber;
        }
        if (bio !== undefined) user.profile.bio = bio;
        if (skillsArray) user.profile.skills = skillsArray;

        if (cloudResponse) {
            // Check if file is PDF or image
            if (file.mimetype.includes("pdf")) {
                user.profile.resume = cloudResponse.secure_url;
                user.profile.resumeOriginalName = file.originalname;
            } else {
                user.profile.profilePhoto = cloudResponse.secure_url;
            }
        }

        await user.save();
        await user.populate("profile.company");

        const updatedUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: updatedUser,
            success: true
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || "field";
            if (field === "phoneNumber") {
                return res.status(400).json({
                    message: "This phone number is already registered with another account.",
                    success: false
                });
            }
            if (field === "email") {
                return res.status(400).json({
                    message: "This email address is already associated with another account.",
                    success: false
                });
            }
            return res.status(400).json({
                message: `The provided ${field} is already in use by another user.`,
                success: false
            });
        }
        return res.status(500).json({
            message: "Failed to update profile. Please check your details and try again.",
            success: false
        });
    }
};

// Forgot Password — generate OTP and email it
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required.",
                success: false
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "No user found with this email address.",
                success: false
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

        user.resetPasswordToken = hashedOtp;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        await sendPasswordResetEmail(user.email, otp);

        return res.status(200).json({
            message: "A 6-digit password reset OTP has been sent to your email.",
            success: true
        });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({
            message: "Error processing password reset request",
            success: false
        });
    }
};

// Step 2: Verify OTP — validates OTP and issues a short-lived resetToken
export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and 6-digit OTP code are required.",
                success: false
            });
        }

        const hashedOtp = crypto.createHash("sha256").update(otp.trim()).digest("hex");

        const user = await User.findOne({
            email,
            resetPasswordToken: hashedOtp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired OTP code. Please check or request a new one.",
                success: false
            });
        }

        // Generate a secure, short-lived reset session token for Step 3
        const resetSessionToken = crypto.randomBytes(32).toString("hex");
        const hashedResetSessionToken = crypto.createHash("sha256").update(resetSessionToken).digest("hex");

        user.resetPasswordToken = hashedResetSessionToken;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes to choose new password
        await user.save();

        return res.status(200).json({
            message: "OTP verified successfully. You can now set your new password.",
            resetToken: resetSessionToken,
            success: true
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({
            message: "Error verifying OTP code",
            success: false
        });
    }
};

// Step 3: Reset Password — verify resetToken / OTP and update password
export const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, otp, newPassword } = req.body;
        if (!email || (!resetToken && !otp) || !newPassword) {
            return res.status(400).json({
                message: "Email, authorization token, and new password are required.",
                success: false
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long.",
                success: false
            });
        }

        const tokenToVerify = (resetToken || otp).trim();
        const hashedToken = crypto.createHash("sha256").update(tokenToVerify).digest("hex");

        const user = await User.findOne({
            email,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Password reset session has expired or is invalid. Please restart the request.",
                success: false
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({
            message: "Password has been reset successfully! Please log in with your new password.",
            success: true
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({
            message: "Error resetting password",
            success: false
        });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

export const streamResumePdf = async (req, res) => {
    try {
        const { url, filename, download } = req.query;

        if (!url) {
            return res.status(400).send("Resume URL is required");
        }

        const safeFilename = filename ? filename.replace(/[/\\?%*:|"<>]/g, "_") : "Resume.pdf";
        const disposition = download === "true" ? "attachment" : "inline";

        res.removeHeader("X-Frame-Options");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `${disposition}; filename="${safeFilename}"`);

        const client = url.startsWith("https") ? https : http;

        client.get(url, (streamRes) => {
            if (streamRes.statusCode !== 200) {
                return res.status(streamRes.statusCode).send("Failed to fetch PDF from storage");
            }
            streamRes.pipe(res);
        }).on("error", (err) => {
            console.error("PDF stream error:", err);
            if (!res.headersSent) {
                res.status(500).send("Error streaming PDF");
            }
        });
    } catch (error) {
        console.error("Resume stream endpoint error:", error);
        if (!res.headersSent) {
            res.status(500).send("Internal Server Error");
        }
    }
};