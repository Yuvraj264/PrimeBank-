import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';
import { investmentService } from '../services/InvestmentService';
import { auditService } from '../services/AuditService';

interface AuthRequest extends Request {
    user?: IUser;
}

export const openInvestment = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const { pin, ...data } = req.body;

    if (!req.user!.transactionPin) {
        return next(new AppError('Please set a Transaction PIN before making investments', 400));
    }

    if (!pin || !(await req.user!.matchTransactionPin(String(pin)))) {
        return next(new AppError('Invalid or missing Transaction PIN', 401));
    }

    const investment = await investmentService.openInvestment(userId, data);
    await auditService.logTransaction(userId, String(investment._id), 'Open Investment', `Invested ${data.amount} in ${data.investmentType}`, req.ip || 'unknown');

    res.status(201).json({ status: 'success', data: investment });
});

export const getInvestments = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const investments = await investmentService.getInvestments(userId);

    res.status(200).json({ status: 'success', data: investments });
});

export const getPerformance = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const performance = await investmentService.getPerformance(userId);

    res.status(200).json({ status: 'success', data: performance });
});
