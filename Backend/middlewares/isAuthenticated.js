import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import logger from "../utils/logger.js";

/**
 * Authentication Middleware
 * Checks accessToken (or fallback token cookie/bearer header).
 * Attaches req.id and req.role.
 */
export const isAuthenticated = async (req, res, next) => {
    try {
        // Look in cookies first (accessToken or legacy token), then Authorization header
        let token = req.cookies.accessToken || req.cookies.token;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "User not authenticated. Please log in.",
                code: "NO_TOKEN",
                success: false,
            });
        }

        const secret = process.env.SECRET_KEY || "default_super_secret_jwt_key";
        const decoded = jwt.verify(token, secret);

        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                message: "Invalid token.",
                code: "INVALID_TOKEN",
                success: false,
            });
        }

        req.id = decoded.userId;
        req.role = decoded.role;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Access token has expired. Please refresh your session.",
                code: "TOKEN_EXPIRED",
                success: false,
            });
        }

        logger.warn("Authentication Middleware Error", { error: error.message, correlationId: req.correlationId });
        return res.status(401).json({
            message: "Authentication failed. Session expired or invalid token.",
            code: "AUTH_FAILED",
            success: false,
        });
    }
};

/**
 * Strict Role-Based Access Control (RBAC) Middleware
 * @param  {...string} allowedRoles Roles allowed to access the route (e.g. 'recruiter', 'student', 'admin')
 */
export const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            let role = req.role;

            // If role wasn't in the token, lookup user once
            if (!role && req.id) {
                const user = await User.findById(req.id).select("role");
                if (user) {
                    role = user.role;
                    req.role = user.role;
                }
            }

            if (!role || !allowedRoles.includes(role)) {
                return res.status(403).json({
                    message: `Access forbidden: Required role [${allowedRoles.join(", ")}]. Current role: '${role || "unassigned"}'.`,
                    code: "FORBIDDEN_ROLE",
                    success: false,
                });
            }

            next();
        } catch (error) {
            logger.error("Role authorization error", { error: error.message, correlationId: req.correlationId });
            return res.status(500).json({
                message: "Authorization check failed.",
                success: false,
            });
        }
    };
};

/**
 * Recruiter Role Guard (Alias to authorizeRoles("recruiter") for backward compatibility)
 */
export const isRecruiter = authorizeRoles("recruiter");

export default isAuthenticated;