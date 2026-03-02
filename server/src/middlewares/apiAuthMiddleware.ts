import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import ApiKey from '../models/ApiKey';
import BusinessProfile from '../models/BusinessProfile';
import redisClient from '../config/redis';

/**
 * Middleware to authenticate Machine-to-Machine (M2M) API requests using x-api-key headers.
 * Extracts the raw key, verifies it against the ApiKey table, and enforces rate limits via Redis.
 */
export const authenticateApiKey = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const rawApiKey = req.headers['x-api-key'] as string;

    if (!rawApiKey) {
        return next(new AppError('API Key is missing. Please provide x-api-key in headers.', 401));
    }

    const parts = rawApiKey.split('_');
    if (parts.length !== 4 || parts[0] !== 'pb' || parts[1] !== 'live') {
        return next(new AppError('Invalid API Key format.', 401));
    }

    const apiKeyPrefix = `pb_live_${parts[2]}`;
    const secretPart = parts[3];

    // Find the API key record
    const apiKeyRecord = await ApiKey.findOne({ api_key: apiKeyPrefix }).populate('merchant_id');
    if (!apiKeyRecord || !apiKeyRecord.is_active) {
        return next(new AppError('Invalid or inactive API Key.', 401));
    }

    // Verify secret
    const isValid = await apiKeyRecord.compareSecret(secretPart);
    if (!isValid) {
        return next(new AppError('Invalid API Key.', 401));
    }

    // Rate Limiting Logic via Redis
    const currentMinute = new Date().getMinutes();
    const rateLimitKey = `api_rate_limit:${rawApiKey}:${currentMinute}`;

    try {
        const requests = await redisClient.incr(rateLimitKey);
        if (requests === 1) {
            await redisClient.expire(rateLimitKey, 60); // Expire in 60 seconds
        }

        if (requests > apiKeyRecord.rate_limit) {
            return next(new AppError('Rate limit exceeded. Try again later.', 429));
        }
    } catch (redisError) {
        console.error('Redis Rate Limiting Error:', redisError);
        // Fail open if Redis is down, or fail closed. We choose fail open here for availability.
        // Wait, Redis is a core dependency. But failing open might overload backend. Continuing for now.
    }

    const business = apiKeyRecord.merchant_id as any;
    if (!business || !business.isActive) {
        return next(new AppError('Associated business profile is inactive.', 401));
    }

    (req as any).business = business;
    (req as any).user = { _id: business.userId, role: 'merchant' }; // Mock a session user for standard repos

    next();
});
