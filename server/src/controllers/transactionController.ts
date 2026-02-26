import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';
import { transactionService } from '../services/TransactionService';
import { auditService } from '../services/AuditService';

interface AuthRequest extends Request {
    user?: IUser;
}

export const transferFound = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const { pin, ...data } = req.body;

    if (!req.user!.transactionPin) {
        return next(new AppError('Please set a Transaction PIN before making transfers', 400));
    }

    if (!pin || !(await req.user!.matchTransactionPin(String(pin)))) {
        return next(new AppError('Invalid or missing Transaction PIN', 401));
    }

    await transactionService.transferFunds(userId, data);
    await auditService.logTransaction(userId, 'N/A', 'Transfer Funds', `Amount: ${data.amount} to account ${data.toAccountId}`, req.ip || 'unknown');
    res.status(200).json({ status: 'success', message: 'Transfer successful' });
});

export const transferInternal = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const { pin, ...data } = req.body;

    if (!req.user!.transactionPin) {
        return next(new AppError('Please set a Transaction PIN before making transfers', 400));
    }

    if (!pin || !(await req.user!.matchTransactionPin(String(pin)))) {
        return next(new AppError('Invalid or missing Transaction PIN', 401));
    }

    await transactionService.internalTransfer(userId, data);
    await auditService.logTransaction(userId, 'N/A', 'Internal Transfer', `Amount: ${data.amount} to account ${data.receiverAccountNumber}`, req.ip || 'unknown');
    res.status(200).json({ status: 'success', message: 'Internal transfer completed successfully' });
});

export const transferBank = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const { pin, ...data } = req.body;

    if (!req.user!.transactionPin) {
        return next(new AppError('Please set a Transaction PIN before making transfers', 400));
    }

    if (!pin || !(await req.user!.matchTransactionPin(String(pin)))) {
        return next(new AppError('Invalid or missing Transaction PIN', 401));
    }

    await transactionService.bankTransfer(userId, data);
    await auditService.logTransaction(userId, 'N/A', 'Bank Transfer', `Amount: ${data.amount} to bank ${data.receiverBankName}`, req.ip || 'unknown');
    res.status(200).json({ status: 'success', message: 'Bank transfer initiated and is pending processing' });
});

export const transferScheduled = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const { pin, ...data } = req.body;

    if (!req.user!.transactionPin) {
        return next(new AppError('Please set a Transaction PIN before making transfers', 400));
    }

    if (!pin || !(await req.user!.matchTransactionPin(String(pin)))) {
        return next(new AppError('Invalid or missing Transaction PIN', 401));
    }

    await transactionService.scheduledTransfer(userId, data);
    await auditService.logTransaction(userId, 'N/A', 'Scheduled Transfer', `Amount: ${data.amount} scheduled for ${data.scheduledDate}`, req.ip || 'unknown');
    res.status(200).json({ status: 'success', message: 'Transfer scheduled successfully' });
});

export const getMyTransactions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const result = await transactionService.getMyTransactions(userId, req.query);
    res.status(200).json({
        status: 'success',
        data: result.data,
        total: result.total,
        page: parseInt(req.query.page as string || '1'),
        limit: parseInt(req.query.limit as string || '10')
    });
});

export const deposit = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const transaction = await transactionService.deposit(userId, req.body.amount);
    await auditService.logTransaction(userId, String(transaction._id), 'Deposit', `Deposited amount: ${req.body.amount}`, req.ip || 'unknown');
    res.status(200).json({ status: 'success', data: transaction });
});

export const withdraw = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const transaction = await transactionService.withdraw(userId, req.body.amount);
    await auditService.logTransaction(userId, String(transaction._id), 'Withdraw', `Withdrew amount: ${req.body.amount}`, req.ip || 'unknown');
    res.status(200).json({ status: 'success', data: transaction });
});

export const payBill = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const { pin, ...data } = req.body;

    if (!req.user!.transactionPin) {
        return next(new AppError('Please set a Transaction PIN before making payments', 400));
    }

    if (!pin || !(await req.user!.matchTransactionPin(String(pin)))) {
        return next(new AppError('Invalid or missing Transaction PIN', 401));
    }

    const transaction = await transactionService.payBill(userId, data);
    await auditService.logTransaction(userId, String(transaction._id), 'Bill Payment', `Paid ${data.amount} for bill ${data.billerName}`, req.ip || 'unknown');
    res.status(200).json({ status: 'success', data: transaction });
});

export const getAllTransactions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transactions = await transactionService.getAllTransactions();
    res.status(200).json({ status: 'success', data: transactions });
});
