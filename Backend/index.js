import dotenv from "dotenv";
dotenv.config({});

import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import fs from "fs";

import connectDB from "./utils/db.js";
import { initSocket } from "./utils/socket.js";
import { authLimiter, aiLimiter, generalLimiter, isRedisConnected } from "./utils/redis.js";
import logger, { correlationMiddleware, requestLogger } from "./utils/logger.js";

import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import savedJobRoute from "./routes/savedJob.route.js";
import aiRoute from "./routes/ai.route.js";
import notificationRoute from "./routes/notification.route.js";
import messageRoute from "./routes/message.route.js";

const app = express();
const server = http.createServer(app);

// Distributed Tracing & Correlation ID
app.use(correlationMiddleware);

// Structured HTTP Request Logging
app.use(requestLogger);

// Security Headers with Helmet (Allowing cross-origin iframe preview for resumes)
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: false,
    })
);

// Global Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// NoSQL Injection Sanitization (strips '$' and '.' in inputs)
app.use(
    mongoSanitize({
        replaceWith: "_",
        onSanitize: ({ req, key }) => {
            logger.warn(`NoSQL Injection attempt sanitized on key: ${key}`, {
                ip: req.ip,
                url: req.originalUrl,
                correlationId: req.correlationId,
            });
        },
    })
);

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://jobhive-m79b.onrender.com",
    process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive for local dev & staging
        }
    },
    credentials: true,
};
app.use(cors(corsOptions));

// Health & Readiness Endpoints for Production Monitoring
app.get("/healthz", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/readyz", (req, res) => {
    res.status(200).json({
        status: "ready",
        redis: isRedisConnected ? "connected" : "in-memory-fallback",
        timestamp: new Date().toISOString(),
    });
});

// Apply Rate Limiters
app.use("/api/v1/user/login", authLimiter);
app.use("/api/v1/user/register", authLimiter);
app.use("/api/v1/user/forgot-password", authLimiter);
app.use("/api/v1/ai", aiLimiter);

// Initialize WebSockets
initSocket(server, allowedOrigins);

// API Endpoints
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/savedjobs", savedJobRoute);
app.use("/api/v1/ai", aiRoute);
app.use("/api/v1/notifications", notificationRoute);
app.use("/api/v1/messages", messageRoute);

const __dirname = path.resolve();
const frontendDistPath = fs.existsSync(path.join(__dirname, "Frontend", "dist"))
    ? path.join(__dirname, "Frontend", "dist")
    : path.join(__dirname, "..", "Frontend", "dist");

if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/")) {
            return res.status(404).json({ message: "API endpoint not found", success: false });
        }
        res.sendFile(path.join(frontendDistPath, "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.json({ message: "JobHive Backend API is running smoothly." });
    });
}

// Centralized Error Handling Middleware with Structured Logging
app.use((err, req, res, next) => {
    logger.error("Unhandled Server Error", {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        correlationId: req.correlationId,
    });

    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        correlationId: req.correlationId,
        success: false,
    });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    connectDB();
    logger.info(`🚀 JobHive Server & Sockets running on port ${PORT}`);
    if (process.env.GEMINI_API_KEY) {
        logger.info(`🤖 Google Gemini AI active`);
    }
    if (process.env.SENDGRID_API_KEY) {
        logger.info(`📧 SendGrid Real Email Provider active`);
    } else if (process.env.MAILTRAP_SMTP_USER) {
        logger.info(`📧 Mailtrap SMTP connected`);
    }
});