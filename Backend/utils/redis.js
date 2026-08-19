import Redis from "ioredis";
import { RedisStore } from "rate-limit-redis";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const REDIS_PREFIX = "jobhive:";
let isRedisConnected = false;
let redisClient = null;

try {
    const redisUrl = process.env.REDIS_URL;

    if (redisUrl) {
        redisClient = new Redis(redisUrl, {
            keyPrefix: REDIS_PREFIX,
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                if (times > 5) return null;
                return Math.min(times * 200, 2000);
            }
        });
    } else {
        redisClient = new Redis({
            host: process.env.REDIS_HOST || "127.0.0.1",
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            keyPrefix: REDIS_PREFIX,
            maxRetriesPerRequest: 1,
            retryStrategy(times) {
                if (times > 2) return null;
                return Math.min(times * 200, 1000);
            }
        });
    }

    redisClient.on("ready", () => {
        isRedisConnected = true;
        console.log(`✅ [Redis] Connected & Ready with namespace: '${REDIS_PREFIX}'`);
    });

    redisClient.on("connect", () => {
        isRedisConnected = true;
    });

    redisClient.on("error", (err) => {
        if (isRedisConnected) {
            console.warn(`⚠️ [Redis] Connection warning: ${err.message}`);
        }
        isRedisConnected = false;
    });

    redisClient.on("close", () => {
        isRedisConnected = false;
    });
} catch (error) {
    console.warn("⚠️ [Redis] Initialization skipped, using in-memory fallbacks.");
    isRedisConnected = false;
}

// -------------------------------------------------------------
// Cache Helper Utilities
// -------------------------------------------------------------
export const getCache = async (key) => {
    if (!isRedisConnected || !redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.warn(`[Redis] getCache error for key ${key}:`, err.message);
        return null;
    }
};

export const setCache = async (key, value, ttlSeconds = 300) => {
    if (!isRedisConnected || !redisClient) return false;
    try {
        const serialized = JSON.stringify(value);
        await redisClient.set(key, serialized, "EX", ttlSeconds);
        return true;
    } catch (err) {
        console.warn(`[Redis] setCache error for key ${key}:`, err.message);
        return false;
    }
};

export const deleteCache = async (key) => {
    if (!isRedisConnected || !redisClient) return false;
    try {
        await redisClient.del(key);
        return true;
    } catch (err) {
        console.warn(`[Redis] deleteCache error for key ${key}:`, err.message);
        return false;
    }
};

export const clearJobCache = async () => {
    if (!isRedisConnected || !redisClient) return false;
    try {
        // Find and delete all job listing cache keys under jobhive prefix
        const keys = await redisClient.keys(`${REDIS_PREFIX}jobs:*`);
        if (keys && keys.length > 0) {
            // ioredis keys() includes the prefix if matched from root; clean them for pipeline
            const rawKeys = keys.map(k => k.replace(REDIS_PREFIX, ""));
            const pipeline = redisClient.pipeline();
            rawKeys.forEach(k => pipeline.del(k));
            await pipeline.exec();
        }
        return true;
    } catch (err) {
        console.warn("[Redis] clearJobCache error:", err.message);
        return false;
    }
};

// -------------------------------------------------------------
// Rate Limiters (Redis-backed with In-Memory fallback)
// -------------------------------------------------------------

// Helper to create store
const createRateLimitStore = (prefixName) => {
    if (isRedisConnected && redisClient) {
        try {
            return new RedisStore({
                sendCommand: (...args) => redisClient.call(...args),
                prefix: `rl:${prefixName}:`
            });
        } catch (e) {
            return undefined; // Fallback to memory
        }
    }
    return undefined;
};

// 1. Auth Rate Limiter (50 requests per 15 minutes)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    store: createRateLimitStore("auth"),
    message: {
        message: "Too many authentication requests from this IP. Please try again after 15 minutes.",
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 2. AI Gemini Endpoints Rate Limiter (20 requests per 1 minute per IP)
export const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 AI generations per minute
    store: createRateLimitStore("ai"),
    message: {
        message: "AI generation rate limit reached. Please wait a moment before trying again.",
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 3. General API Rate Limiter (300 requests per 1 minute)
export const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 300,
    store: createRateLimitStore("general"),
    standardHeaders: true,
    legacyHeaders: false,
});

export { redisClient, isRedisConnected };
export default redisClient;
