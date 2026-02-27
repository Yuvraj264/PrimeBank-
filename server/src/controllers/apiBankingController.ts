import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import BusinessProfile from '../models/BusinessProfile';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';

/**
 * Generates a completely new API Key for a business. Returns the raw key ONLY ONCE.
 * Saves the bcrypt hash to the database.
 */
export const generateApiKey = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;

    // Ensure the business profile exists
    let business = await BusinessProfile.findOne({ userId });

    // Auto-onboard if missing for demo purposes (usually handled by a KYC onboarding flow)
    if (!business) {
        business = await BusinessProfile.create({
            userId,
            businessName: req.body.businessName || 'Default Enterprise',
            gstNumber: `GST${Date.now()}`,
            pan: `PAN${Date.now()}`,
            businessType: 'private_limited',
            turnover: 0
        });
    }

    // Generate a secure 32-byte secret sequence
    const randomSecret = crypto.randomBytes(32).toString('hex');

    // Construct the cleartext API key globally unique prefix
    // Format: pb_live_[businessId]_[randomSecret]
    const clearTextApiKey = `pb_live_${business._id}_${randomSecret}`;

    // Hash the secret for storage
    const salt = await bcrypt.genSalt(10);
    const apiSecretHash = await bcrypt.hash(randomSecret, salt);

    // Persist hash to database
    business.apiKey = `pb_live_${business._id}_***`; // Masked version for UI reference
    business.apiSecretHash = apiSecretHash;
    await business.save();

    // WARNING: Return the cleartext key exactly once
    res.status(200).json({
        status: 'success',
        message: 'API Key generated successfully. Please store this securely. It will never be shown again.',
        data: {
            apiKey: clearTextApiKey,
            webhookUrl: business.webhookUrl,
            rateLimit: business.apiRateLimit
        }
    });
});

export const getApiConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;
    const business = await BusinessProfile.findOne({ userId }).select('-apiSecretHash');

    if (!business) {
        return next(new AppError('Business profile not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: business
    });
});

export const updateWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;
    const { webhookUrl } = req.body;

    if (!webhookUrl || !webhookUrl.startsWith('http')) {
        return next(new AppError('Invalid Webhook URL provided.', 400));
    }

    const business = await BusinessProfile.findOneAndUpdate(
        { userId },
        { webhookUrl },
        { new: true, runValidators: true }
    ).select('-apiSecretHash');

    res.status(200).json({
        status: 'success',
        message: 'Webhook updated.',
        data: business
    });
});
