import { Request, Response, NextFunction } from 'express';
import Account from '../models/Account';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

export const getMyAccounts = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const accounts = await Account.find({ userId: req.user!._id as any });
    res.status(200).json({ status: 'success', data: accounts });
});

export const createAccount = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { type, currency } = req.body;
    const userId = req.user!._id;

    // Generate random account number
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const account = await Account.create({
        userId: userId as any,
        accountNumber,
        type,
        currency: currency || 'USD',
        balance: 0,
        status: 'active'
    });

    res.status(201).json({ status: 'success', data: account });
});

export const getAccountById = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user!._id as any });
    if (!account) {
        return next(new AppError('Account not found', 404));
    }
    res.status(200).json({ status: 'success', data: account });
});

export const getStatements = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Mock statements for now
    const statements = [
        { id: 1, month: 'January', year: 2024, size: 'MB', url: '#' },
        { id: 2, month: 'December', year: 2023, size: 'KB', url: '#' },
        { id: 3, month: 'November', year: 2023, size: 'KB', url: '#' },
        { id: 4, month: 'October', year: 2023, size: 'MB', url: '#' },
        { id: 5, month: 'September', year: 2023, size: 'KB', url: '#' },
        { id: 6, month: 'August', year: 2023, size: 'MB', url: '#' },
    ];

    res.status(200).json({
        status: 'success',
        data: statements
    });
});
