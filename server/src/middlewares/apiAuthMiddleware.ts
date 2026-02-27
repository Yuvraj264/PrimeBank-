import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import BusinessProfile from '../models/BusinessProfile';
import bcrypt from 'bcryptjs';

/**
 * Middleware to authenticate Machine-to-Machine (M2M) API requests using x-api-key headers.
 * Extracts the raw key, splits the public client ID from the secret, and verifies the hash
 * against the BusinessProfile table.
 */
export const authenticateApiKey = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const rawApiKey = req.headers['x-api-key'] as string;

    if (!rawApiKey) {
        return next(new AppError('API Key is missing. Please provide x-api-key in headers.', 401));
    }

    // Format: pb_live_[businessId]_[randomSecret]
    const parts = rawApiKey.split('_');
    if (parts.length !== 4 || parts[0] !== 'pb' || parts[1] !== 'live') {
        return next(new AppError('Invalid API Key format.', 401));
    }

    const businessId = parts[2];
    const secretPart = parts[3];

    // Find the business profile
    const business = await BusinessProfile.findById(businessId);
    if (!business || !business.isActive) {
        return next(new AppError('Invalid or inactive API Key.', 401));
    }

    // Hash comparison
    if (!business.apiSecretHash) {
        return next(new AppError('API access is not enabled for this business.', 403));
    }

    const isValid = await bcrypt.compare(secretPart, business.apiSecretHash);
    if (!isValid) {
        return next(new AppError('Invalid API Key.', 401));
    }

    // Rate Limiting simulation logic would hook here using Redis or RAM blocks
    // For now, we attach the business context to the request for downstream controllers.

    (req as any).business = business;
    (req as any).user = { _id: business.userId, role: 'merchant' }; // Mock a session user for standard repos

    next();
});
