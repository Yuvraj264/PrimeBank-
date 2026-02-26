import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { loanService } from '../services/LoanService';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

export const applyLoan = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const loan = await loanService.applyLoan(userId, req.body);
    res.status(201).json({ status: 'success', data: loan });
});

export const getMyLoans = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const loans = await loanService.getMyLoans(userId);
    res.status(200).json({ status: 'success', data: loans });
});

export const getAllLoans = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const loans = await loanService.getAllLoans();
    res.status(200).json({ status: 'success', data: loans });
});

export const prepayLoan = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const { pin, ...data } = req.body;

    if (!req.user!.transactionPin) {
        return next(new AppError('Please set a Transaction PIN before making payments', 400));
    }

    if (!pin || !(await req.user!.matchTransactionPin(String(pin)))) {
        return next(new AppError('Invalid or missing Transaction PIN', 401));
    }

    const loan = await loanService.prepayLoan(userId, data);
    res.status(200).json({ status: 'success', data: loan });
});

export const updateLoanStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const adminId = (req.user!._id as any).toString();

    const loan = await loanService.updateLoanStatus(id as string, adminId, status, adminComment);
    res.status(200).json({ status: 'success', data: loan });
});
