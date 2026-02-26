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

    // In BeneficiaryService we used updateById which doesn't filter by userId.
    // It's safer to just do findOneAndUpdate using the Model directly if we haven't added it to baseRepo.
    // Let's call the service

    // Wait, the original code used findOneAndUpdate with _id and userId
    // I should fix this logic to use the repo correctly or just let the service handle it correctly.
    const { nickname, isFavorite, dailyLimit } = req.body;

    const beneficiary = await beneficiaryRepository.model.findOneAndUpdate(
        { _id: req.params.id as string, userId: userId as any },
        {
            $set: {
                ...(nickname !== undefined && { nickname }),
                ...(isFavorite !== undefined && { isFavorite }),
                ...(dailyLimit !== undefined && { dailyLimit })
            }
        },
        { new: true, runValidators: true }
    );

    if (!beneficiary) {
        return next(new AppError('Beneficiary not found', 404));
    }

    res.status(200).json({ status: 'success', data: beneficiary });
});
