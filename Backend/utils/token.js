import jwt from "jsonwebtoken";
import crypto from "crypto";
import redisClient, { isRedisConnected } from "./redis.js";
import logger from "./logger.js";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const getSecretKey = () => process.env.SECRET_KEY || "default_super_secret_jwt_key";
const getRefreshSecretKey = () => process.env.REFRESH_SECRET_KEY || process.env.SECRET_KEY || "default_refresh_secret_key";

/**
 * Generate Dual Tokens (Access Token + Refresh Token)
 * Persists Refresh Token to Redis with 7-day TTL
 */
export const generateTokens = async (user) => {
    const userId = user._id ? user._id.toString() : user.id.toString();
    const role = user.role;
    const tokenId = crypto.randomUUID();

    // 1. Short-lived Access Token (15 min)
    const accessToken = jwt.sign(
        { userId, role, type: "access" },
        getSecretKey(),
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // 2. Long-lived Refresh Token (7 days)
    const refreshToken = jwt.sign(
        { userId, tokenId, type: "refresh" },
        getRefreshSecretKey(),
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // 3. Store Refresh Token in Redis with TTL
    if (isRedisConnected && redisClient) {
        try {
            const redisKey = `refresh_token:${userId}:${tokenId}`;
            await redisClient.set(redisKey, "1", "EX", REFRESH_TOKEN_TTL_SECONDS);
        } catch (err) {
            logger.warn(`Failed to store refresh token in Redis for user ${userId}: ${err.message}`);
        }
    }

    return { accessToken, refreshToken };
};

/**
 * Set HTTP-Only Secure Cookies for Access & Refresh Tokens
 */
export const setTokenCookies = (res, accessToken, refreshToken) => {
    const isProduction = process.env.NODE_ENV === "production";

    const commonCookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    };

    // Access Token Cookie (15 min)
    res.cookie("accessToken", accessToken, {
        ...commonCookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Backward compatibility: Set 'token' cookie as accessToken
    res.cookie("token", accessToken, {
        ...commonCookieOptions,
        maxAge: 15 * 60 * 1000,
    });

    // Refresh Token Cookie (7 days)
    if (refreshToken) {
        res.cookie("refreshToken", refreshToken, {
            ...commonCookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
};

/**
 * Clear All Auth Cookies
 */
export const clearTokenCookies = (res) => {
    const isProduction = process.env.NODE_ENV === "production";
    const clearOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 0,
    };

    res.cookie("accessToken", "", clearOptions);
    res.cookie("token", "", clearOptions);
    res.cookie("refreshToken", "", clearOptions);
};

/**
 * Verify Refresh Token & Ensure existence in Redis
 */
export const verifyRefreshToken = async (token) => {
    try {
        const decoded = jwt.verify(token, getRefreshSecretKey());
        if (!decoded || !decoded.userId || !decoded.tokenId) {
            return null;
        }

        // If Redis is active, verify token is not revoked
        if (isRedisConnected && redisClient) {
            const redisKey = `refresh_token:${decoded.userId}:${decoded.tokenId}`;
            const exists = await redisClient.get(redisKey);
            if (!exists) {
                logger.warn(`Refresh token rejected: revoked or expired in Redis [user: ${decoded.userId}]`);
                return null;
            }
        }

        return decoded;
    } catch (err) {
        return null;
    }
};

/**
 * Revoke specific refresh token on logout
 */
export const revokeRefreshToken = async (userId, tokenId) => {
    if (!isRedisConnected || !redisClient || !userId || !tokenId) return;
    try {
        const redisKey = `refresh_token:${userId}:${tokenId}`;
        await redisClient.del(redisKey);
    } catch (err) {
        logger.warn(`Failed to revoke refresh token: ${err.message}`);
    }
};

/**
 * Revoke ALL active sessions for user (e.g., on password reset or account compromise)
 */
export const revokeAllUserTokens = async (userId) => {
    if (!isRedisConnected || !redisClient || !userId) return;
    try {
        const keys = await redisClient.keys(`*refresh_token:${userId}:*`);
        if (keys && keys.length > 0) {
            const pipeline = redisClient.pipeline();
            keys.forEach(k => pipeline.del(k.replace("jobhive:", "")));
            await pipeline.exec();
        }
    } catch (err) {
        logger.warn(`Failed to revoke all tokens for user ${userId}: ${err.message}`);
    }
};
