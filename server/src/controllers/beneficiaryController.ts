import { Request, Response, NextFunction } from 'express';
import Beneficiary from '../models/Beneficiary';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

export const addBeneficiary = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { name, accountNumber, bankName, ifscCode, type, nickname } = req.body;
    const userId = req.user!._id;

    // Check if beneficiary already exists
    const existingBeneficiary = await Beneficiary.findOne({ userId: userId as any, accountNumber });
    if (existingBeneficiary) {
        return next(new AppError('Beneficiary with this account number already exists', 400));
    }

    const beneficiary = await Beneficiary.create({
        userId: userId as any,
        name,
        accountNumber,
        bankName,
        ifscCode,
        type,
        nickname
    });

    res.status(201).json({ status: 'success', data: beneficiary });
});

export const getBeneficiaries = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const beneficiaries = await Beneficiary.find({ userId: req.user!._id as any }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: beneficiaries });
});

export const deleteBeneficiary = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!._id;

    const beneficiary = await Beneficiary.findOneAndDelete({ _id: id, userId: userId as any });

    if (!beneficiary) {
        return next(new AppError('Beneficiary not found', 404));
    }

    res.status(204).json({ status: 'success', data: null });
});
