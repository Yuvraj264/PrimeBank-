import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import BusinessProfile from '../models/BusinessProfile';
import ApiKey from '../models/ApiKey';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';

/**
 * Generates a completely new API Key for a business. Returns the raw key ONLY ONCE.
 * Saves the hashed secret to the ApiKey collection.
 */
export const generateApiKey = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;

    // Ensure the business profile exists
    let business = await BusinessProfile.findOne({ userId });

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
    const apiKeyPrefix = `pb_live_${business._id}`;
    const clearTextApiKey = `${apiKeyPrefix}_${randomSecret}`;

    // Create API Key record
    // The ApiKey model pre-save hook will automatically hash api_secret
    const apiKeyRecord = await ApiKey.create({
        api_key: apiKeyPrefix, // We can just use the prefix as the identifier and require the secret separately, or store the prefix as api_key and secret as api_secret
        api_secret: randomSecret,
        merchant_id: business._id,
        rate_limit: business.apiRateLimit || 100,
        is_active: true
    });

    // We can also update the business profile to have a reference or a masked key
    business.apiKey = `${apiKeyPrefix}_***`;
    await business.save();

    res.status(200).json({
        status: 'success',
        message: 'API Key generated successfully. Please store this securely. It will never be shown again.',
        data: {
            apiKey: apiKeyPrefix,
            apiSecret: randomSecret, // They must pass x-api-key: prefix_secret (or however middleware expects it)
            // Wait, middleware expects pb_live_businessId_secret as ONE string.
            // Let's adjust so the user gets one string, and the DB stores it properly.
            fullApiKey: clearTextApiKey,
            webhookUrl: business.webhookUrl,
            rateLimit: apiKeyRecord.rate_limit
        }
    });
});

export const getApiConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;
    const business = await BusinessProfile.findOne({ userId }).select('-apiSecretHash');

    if (!business) {
        return next(new AppError('Business profile not found', 404));
    }

    // Fetch associated active API Keys
    const apiKeys = await ApiKey.find({ merchant_id: business._id, is_active: true }).select('-api_secret');

    res.status(200).json({
        status: 'success',
        data: {
            ...business.toObject(),
            apiKeys
        }
    });
});

export const updateWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;
    const { webhookUrl, generateSecret } = req.body;

    if (!webhookUrl || !webhookUrl.startsWith('http')) {
        return next(new AppError('Invalid Webhook URL provided.', 400));
    }

    const updates: any = { webhookUrl };
    let newSecret = null;

    if (generateSecret) {
        newSecret = crypto.randomBytes(32).toString('hex');
        updates.webhookSecret = newSecret;
    }

    const business = await BusinessProfile.findOneAndUpdate(
        { userId },
        updates,
        { new: true, runValidators: true }
    ).select('-apiSecretHash');

    res.status(200).json({
        status: 'success',
        message: 'Webhook updated.',
        data: {
            business,
            ...(newSecret && { newlyGeneratedSecret: newSecret })
        }
    });
});
