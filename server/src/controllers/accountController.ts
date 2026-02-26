import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';
import { accountService } from '../services/AccountService';

interface AuthRequest extends Request {
    user?: IUser;
}

export const getMyAccounts = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const accounts = await accountService.getUserAccounts(userId);
    res.status(200).json({ status: 'success', data: accounts });
});

export const createAccount = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { type, currency } = req.body;
    const userId = (req.user!._id as any).toString();
    const account = await accountService.createAccount(userId, type as any, currency);
    res.status(201).json({ status: 'success', data: account });
});

export const getAccountById = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const account = await accountService.getAccountById(req.params.id as string, userId);
    res.status(200).json({ status: 'success', data: account });
});

export const getStatements = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const statements = await accountService.getMockStatements();
    res.status(200).json({
        status: 'success',
        data: statements
    });
});
