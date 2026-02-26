import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';
import { transactionService } from '../services/TransactionService';

interface AuthRequest extends Request {
    user?: IUser;
}

export const transferFound = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    await transactionService.transferFunds(userId, req.body);
    res.status(200).json({ status: 'success', message: 'Transfer successful' });
});

export const getMyTransactions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const transactions = await transactionService.getMyTransactions(userId);
    res.status(200).json({ status: 'success', data: transactions });
});

export const deposit = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const transaction = await transactionService.deposit(userId, req.body.amount);
    res.status(200).json({ status: 'success', data: transaction });
});

export const withdraw = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const transaction = await transactionService.withdraw(userId, req.body.amount);
    res.status(200).json({ status: 'success', data: transaction });
});

export const payBill = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const transaction = await transactionService.payBill(userId, req.body);
    res.status(200).json({ status: 'success', data: transaction });
});

export const getAllTransactions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transactions = await transactionService.getAllTransactions();
    res.status(200).json({ status: 'success', data: transactions });
});
