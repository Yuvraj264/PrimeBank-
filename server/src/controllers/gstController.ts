import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction';
import BusinessProfile from '../models/BusinessProfile';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import mongoose from 'mongoose';

// GST rate applied on the exact transactions - usually fetched from an external config or Tax Engine
const STANDARD_GST_RATE = 0.18;

export const getGSTSummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id; // From JWT

    // 1. Ensure the Merchant actually has an initialized Business Profile
    const profile = await BusinessProfile.findOne({ userId });

    if (!profile) {
        return next(new AppError('Business profile not found. Please initialize your API banking first.', 404));
    }

    // 2. Fetch all completed outgoing/incoming transactions for this Merchant to simulate Ledgers
    // In a real banking app, GST is computed based on specific `invoice` tags, but here we estimate
    // based on incoming transfers from non-merchants vs outgoing expenditures.

    const GST_PIPELINE = [
        {
            $match: {
                status: 'completed',
                $or: [
                    { 'fromAccountId': new mongoose.Types.ObjectId(userId) }, // Outgoing
                    { 'toAccountId': new mongoose.Types.ObjectId(userId) }    // Incoming
                ]
            }
        },
        {
            $project: {
                amount: 1,
                isIncoming: { $eq: ['$toAccountId', new mongoose.Types.ObjectId(userId)] },
                isOutgoing: { $eq: ['$fromAccountId', new mongoose.Types.ObjectId(userId)] }
            }
        },
        {
            $group: {
                _id: null,
                totalIncoming: {
                    $sum: { $cond: ['$isIncoming', '$amount', 0] }
                },
                totalOutgoing: {
                    $sum: { $cond: ['$isOutgoing', '$amount', 0] }
                }
            }
        }
    ];

    const result = await Transaction.aggregate(GST_PIPELINE);

    let stats = {
        totalIncoming: 0,
        totalOutgoing: 0
    };

    if (result.length > 0) {
        stats = result[0];
    }

    // Compute GST Liabilities
    // GST Collected = Tax portion of incoming sales (Assuming incoming represents gross sales and we deduce tax)
    const gstCollected = stats.totalIncoming * STANDARD_GST_RATE;

    // GST Paid = Tax portion of outgoing expenses
    const gstPaid = stats.totalOutgoing * STANDARD_GST_RATE;

    const netGstLiability = gstCollected - gstPaid;

    res.status(200).json({
        status: 'success',
        data: {
            businessName: profile.businessName,
            gstNumber: profile.gstNumber || 'Unregistered',
            pan: profile.pan,
            summary: {
                grossIncoming: stats.totalIncoming,
                grossOutgoing: stats.totalOutgoing,
                gstRateApplied: (STANDARD_GST_RATE * 100) + '%',
                gstCollected,
                gstPaid,
                netGstLiability
            }
        }
    });
});
