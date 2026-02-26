import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';
import { kycService } from '../services/KycService';

interface AuthRequest extends Request {
    user?: IUser;
}

export const submitKYC = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const kycRequest = await kycService.submitKYC(userId, req.body);
    res.status(201).json({ status: 'success', data: kycRequest });
});

export const getAllKYCRequests = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const kycRequests = await kycService.getAllKYCRequests();
    res.status(200).json({ status: 'success', data: kycRequests });
});

export const getPendingKYCRequests = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const kycRequests = await kycService.getPendingKYCRequests();
    res.status(200).json({ status: 'success', data: kycRequests });
});

export const updateKYCStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const reviewerId = (req.user!._id as any).toString();

    const kycRequest = await kycService.updateKYCStatus(id as string, reviewerId, status, adminComment);
    res.status(200).json({ status: 'success', data: kycRequest });
});
