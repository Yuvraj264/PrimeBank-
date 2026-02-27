import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction';
import BusinessProfile from '../models/BusinessProfile';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import mongoose from 'mongoose';

/**
 * Generates a dynamic GST Summary based on all transactions linked to a merchant's accounts.
 * Calculates Outgoing (Tax Paid) and Incoming (Tax Collected) based on transaction directions.
 */
export const getGSTSummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;

    // Fetch the merchant profile to attach GST tags
    const business = await BusinessProfile.findOne({ userId });
    if (!business) {
        return next(new AppError('No business profile found. Please register as a merchant first.', 404));
    }

    const { startDate, endDate } = req.query;

    const matchStage: any = {
        userId: new mongoose.Types.ObjectId(userId as string),
        status: 'completed'
    };

    if (startDate && endDate) {
        matchStage.createdAt = {
            $gte: new Date(startDate as string),
            $lte: new Date(endDate as string)
        };
    }

    // Aggregate transactions
    const aggregation = await Transaction.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalIncomingVolume: {
                    $sum: { $cond: [{ $in: ['$transactionType', ['deposit', 'transfer_in']] }, '$amount', 0] }
                },
                totalOutgoingVolume: {
                    $sum: { $cond: [{ $in: ['$transactionType', ['withdrawal', 'transfer', 'bill_payment', 'transfer_out']] }, '$amount', 0] }
                }
            }
        }
    ]);

    const stats = aggregation[0] || { totalIncomingVolume: 0, totalOutgoingVolume: 0 };

    // Standard simulated GST calculation (18% applied universally for the demo scope)
    const GST_RATE = 0.18;

    // If money came in, we collected GST on behalf of our sales
    const gstCollected = parseFloat((stats.totalIncomingVolume * GST_RATE).toFixed(2));

    // If money went out, we paid GST on our purchases/expenses
    const gstPaid = parseFloat((stats.totalOutgoingVolume * GST_RATE).toFixed(2));

    // Net Liability: If Collected > Paid, we owe the government. If Paid > Collected, we claim Input Tax Credit (ITC).
    const netGstLiability = parseFloat((gstCollected - gstPaid).toFixed(2));

    res.status(200).json({
        status: 'success',
        data: {
            businessName: business.businessName,
            gstNumber: business.gstNumber,
            pan: business.pan,
            period: {
                start: startDate || 'All Time',
                end: endDate || new Date().toISOString()
            },
            summary: {
                grossIncoming: stats.totalIncomingVolume,
                grossOutgoing: stats.totalOutgoingVolume,
                gstCollected: gstCollected,
                gstPaid: gstPaid,
                netGstLiability: netGstLiability,
                gstRateApplied: '18%'
            }
        }
    });
});
