import dotenv from "dotenv";
dotenv.config({});

import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";

import connectDB from "./utils/db.js";
import { initSocket } from "./utils/socket.js";
import { authLimiter, aiLimiter, generalLimiter } from "./utils/redis.js";

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

// Security Headers with Helmet (Allowing cross-origin iframe preview for resumes)
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: false,
    })
);

// Global Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

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

import fs from "fs";

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

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        success: false,
    });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    connectDB();
    console.log(`🚀 JobHive Server & Sockets running`);
    if (process.env.GEMINI_API_KEY) {
        console.log(`🤖 Google Gemini AI active`);
    }
    if (process.env.SENDGRID_API_KEY) {
        console.log(`📧 SendGrid Real Email Provider active`);
    } else if (process.env.MAILTRAP_SMTP_USER) {
        console.log(`📧 Mailtrap SMTP connected`);
    }
});