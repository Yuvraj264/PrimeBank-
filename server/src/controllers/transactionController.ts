import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction';
import Account from '../models/Account';
import User from '../models/User';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

export const transferFound = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Transaction removed for standalone MongoDB compatibility
    // const session = await mongoose.startSession();
    // session.startTransaction();

    try {
        const { receiverAccountNumber, amount, description, fromAccountId } = req.body;
        const senderId = req.user!._id;

        let senderAccount;
        if (fromAccountId) {
            senderAccount = await Account.findOne({ _id: fromAccountId, userId: senderId as any });
        } else {
            senderAccount = await Account.findOne({ userId: senderId as any });
        }

        if (!senderAccount) {
            throw new AppError('Sender account not found', 404);
        }

        if (senderAccount.balance < amount) {
            throw new AppError('Insufficient balance', 400);
        }

        const receiverAccount = await Account.findOne({ accountNumber: receiverAccountNumber });
        if (!receiverAccount) {
            throw new AppError('Receiver account not found', 404);
        }

        if (senderAccount.accountNumber === receiverAccount.accountNumber) {
            throw new AppError('Cannot transfer to self', 400);
        }

        // Check and reset daily limit
        const today = new Date();
        const lastReset = new Date(senderAccount.lastLimitResetDate || 0);

        if (today.toDateString() !== lastReset.toDateString()) {
            senderAccount.usedLimit = 0;
            senderAccount.lastLimitResetDate = today;
        }

        if (senderAccount.usedLimit + Number(amount) > senderAccount.dailyLimit) {
            throw new AppError(`Daily transaction limit exceeded. Remaining limit: ${senderAccount.dailyLimit - senderAccount.usedLimit}`, 400);
        }

        // Deduct from sender
        senderAccount.balance -= amount;
        senderAccount.usedLimit += Number(amount);
        await senderAccount.save();

        // Add to receiver
        receiverAccount.balance += Number(amount);
        await receiverAccount.save();

        // Create transaction records
        // 1. Debit record for sender
        await Transaction.create({
            userId: senderId as any,
            accountId: senderAccount._id as any,
            type: 'transfer',
            amount: -amount,
            currency: senderAccount.currency,
            status: 'completed',
            receiverName: (await User.findById(receiverAccount.userId))?.name,
            receiverAccountId: receiverAccount.accountNumber,
            description: description || 'Transfer to ' + receiverAccountNumber,
            category: 'transfer'
        });

        // 2. Credit record for receiver
        const senderUser = await User.findById(senderId);
        await Transaction.create({
            userId: receiverAccount.userId as any,
            accountId: receiverAccount._id as any,
            type: 'transfer',
            amount: amount,
            currency: receiverAccount.currency,
            status: 'completed',
            senderName: senderUser?.name,
            description: description || 'Received from ' + senderAccount.accountNumber,
            category: 'income'
        });

        // await session.commitTransaction();
        res.status(200).json({ status: 'success', message: 'Transfer successful' });
    } catch (error) {
        // await session.abortTransaction();
        next(error);
    } finally {
        // session.endSession();
    }
});

export const getMyTransactions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transactions = await Transaction.find({ userId: req.user!._id as any }).sort({ date: -1 });
    res.status(200).json({ status: 'success', data: transactions });
});

export const deposit = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { amount } = req.body;
    const userId = req.user!._id;

    const account = await Account.findOne({ userId: userId as any });
    if (!account) return next(new AppError('Account not found', 404));

    account.balance += Number(amount);
    await account.save();

    const transaction = await Transaction.create({
        userId: userId as any,
        accountId: account._id as any,
        type: 'deposit',
        amount,
        status: 'completed',
        description: 'Deposit',
        category: 'income'
    });

    res.status(200).json({ status: 'success', data: transaction });
});

export const withdraw = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { amount } = req.body;
    const userId = req.user!._id;

    const account = await Account.findOne({ userId: userId as any });
    if (!account) return next(new AppError('Account not found', 404));

    if (account.balance < amount) return next(new AppError('Insufficient funds', 400));

    account.balance -= Number(amount);
    await account.save();

    const transaction = await Transaction.create({
        userId: userId as any,
        accountId: account._id as any,
        type: 'withdrawal',
        amount: -amount,
        status: 'completed',
        description: 'Withdrawal',
        category: 'expense'
    });

    res.status(200).json({ status: 'success', data: transaction });
});

export const payBill = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Transaction removed for standalone MongoDB compatibility
    // const session = await mongoose.startSession();
    // session.startTransaction();

    try {
        const { billerName, amount, billType, fromAccountId } = req.body;
        const userId = req.user!._id;

        let account;
        if (fromAccountId) {
            account = await Account.findOne({ _id: fromAccountId, userId: userId as any });
        } else {
            account = await Account.findOne({ userId: userId as any });
        }

        if (!account) {
            throw new AppError('Account not found', 404);
        }

        if (account.balance < amount) {
            throw new AppError('Insufficient funds', 400);
        }

        // Check and reset daily limit
        const today = new Date();
        const lastReset = new Date(account.lastLimitResetDate || 0);

        if (today.toDateString() !== lastReset.toDateString()) {
            account.usedLimit = 0;
            account.lastLimitResetDate = today;
        }

        if (account.usedLimit + Number(amount) > account.dailyLimit) {
            throw new AppError(`Daily transaction limit exceeded. Remaining limit: ${account.dailyLimit - account.usedLimit}`, 400);
        }

        account.balance -= Number(amount);
        account.usedLimit += Number(amount);
        await account.save();

        const transaction = await Transaction.create({
            userId: userId as any,
            accountId: account._id as any,
            type: 'bill_payment',
            amount: -amount,
            status: 'completed',
            description: `Bill Payment to ${billerName}`,
            category: 'bills',
            reference: billType
        });

        // await session.commitTransaction();
        res.status(200).json({ status: 'success', data: transaction });
    } catch (error) {
        // await session.abortTransaction();
        next(error);
    } finally {
        // session.endSession();
    }
});

export const getAllTransactions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transactions = await Transaction.find().populate('userId', 'name email').sort({ date: -1 });
    res.status(200).json({ status: 'success', data: transactions });
});
