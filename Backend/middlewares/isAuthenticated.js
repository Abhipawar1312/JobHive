import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated. Please log in.",
                success: false
            });
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY);
        if (!decode || !decode.userId) {
            return res.status(401).json({
                message: "Invalid token.",
                success: false
            });
        }

        req.id = decode.userId;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({
            message: "Authentication failed. Session expired or invalid token.",
            success: false
        });
    }
};

export const isRecruiter = async (req, res, next) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (user.role !== "recruiter") {
            return res.status(403).json({
                message: "Access forbidden: Recruiter role required.",
                success: false
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("isRecruiter Error:", error.message);
        return res.status(500).json({
            message: "Authorization check failed",
            success: false
        });
    }
};

export default isAuthenticated;