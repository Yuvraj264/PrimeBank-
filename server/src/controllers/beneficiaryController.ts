import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';
import { beneficiaryService } from '../services/BeneficiaryService';
import { beneficiaryRepository } from '../repositories/BeneficiaryRepository';

interface AuthRequest extends Request {
    user?: IUser;
}

export const addBeneficiary = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const beneficiary = await beneficiaryService.addBeneficiary(userId, req.body);
    res.status(201).json({ status: 'success', data: beneficiary });
});

export const getBeneficiaries = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const beneficiaries = await beneficiaryService.getBeneficiaries(userId);
    res.status(200).json({ status: 'success', data: beneficiaries });
});

export const deleteBeneficiary = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    await beneficiaryService.deleteBeneficiary(req.params.id as string, userId);
    res.status(204).json({ status: 'success', data: null });
});

export const updateBeneficiary = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const beneficiary = await beneficiaryService.updateBeneficiary(req.params.id as string, userId, req.body);
    res.status(200).json({ status: 'success', data: beneficiary });
});
