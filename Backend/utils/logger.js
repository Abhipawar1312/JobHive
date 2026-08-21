import winston from "winston";
import crypto from "crypto";

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Custom log format for development readability
const devFormat = printf(({ level, message, timestamp, correlationId, stack, ...meta }) => {
    const cid = correlationId ? ` [${correlationId}]` : "";
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${level}]${cid}: ${stack || message}${metaStr}`;
});

// Create Winston Logger instance
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true })
    ),
    transports: [
        new winston.transports.Console({
            format: process.env.NODE_ENV === "production"
                ? combine(json())
                : combine(colorize({ all: true }), devFormat),
        }),
    ],
    exitOnError: false,
});

// Middleware to attach a unique correlation ID to every incoming request
export const correlationMiddleware = (req, res, next) => {
    const correlationId = req.headers["x-correlation-id"] || crypto.randomUUID();
    req.correlationId = correlationId;
    res.setHeader("X-Correlation-ID", correlationId);
    next();
};

// HTTP Request Logging Middleware
export const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const message = `${req.method} ${req.originalUrl || req.url} ${statusCode} - ${duration}ms`;

        const logPayload = {
            correlationId: req.correlationId,
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection?.remoteAddress,
        };

        if (statusCode >= 500) {
            logger.error(message, logPayload);
        } else if (statusCode >= 400) {
            logger.warn(message, logPayload);
        } else {
            logger.info(message, logPayload);
        }
    });

    next();
};

export default logger;
