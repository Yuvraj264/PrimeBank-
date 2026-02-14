import { Request, Response, NextFunction } from 'express';
import KYCRequest from '../models/KYCRequest';
import User from '../models/User';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

export const submitKYC = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { documentType, documentNumber, documentUrl } = req.body;
    const userId = req.user!._id;

    // Check if pending request exists
    const existingRequest = await KYCRequest.findOne({ userId: userId as any, status: 'pending' });
    if (existingRequest) {
        return next(new AppError('You already have a pending KYC request', 400));
    }

    const kycRequest = await KYCRequest.create({
        userId: userId as any,
        documentType,
        documentNumber,
        documentUrl
    });

    // Update user status to pending
    await User.findByIdAndUpdate(userId, { status: 'pending' });

    res.status(201).json({ status: 'success', data: kycRequest });
});

export const getAllKYCRequests = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const kycRequests = await KYCRequest.find().populate('userId', 'name email').sort({ submittedAt: -1 });
    res.status(200).json({ status: 'success', data: kycRequests });
});

export const getPendingKYCRequests = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const kycRequests = await KYCRequest.find({ status: 'pending' }).populate('userId', 'name email').sort({ submittedAt: 1 });
    res.status(200).json({ status: 'success', data: kycRequests });
});

export const updateKYCStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const reviewerId = req.user!._id;

    if (!['approved', 'rejected'].includes(status)) {
        return next(new AppError('Invalid status', 400));
    }

    const kycRequest = await KYCRequest.findById(id);
    if (!kycRequest) {
        return next(new AppError('KYC Request not found', 404));
    }

    kycRequest.status = status;
    kycRequest.adminComment = adminComment;
    kycRequest.reviewedAt = new Date();
    kycRequest.reviewedBy = reviewerId as any;
    await kycRequest.save();

    // Update user profile status
    if (status === 'approved') {
        await User.findByIdAndUpdate(kycRequest.userId, {
            status: 'active',
            'identityDetails.verified': true
        });
    } else if (status === 'rejected') {
        await User.findByIdAndUpdate(kycRequest.userId, { status: 'blocked' }); // or keep pending/active but failed verification
    }

    res.status(200).json({ status: 'success', data: kycRequest });
});
