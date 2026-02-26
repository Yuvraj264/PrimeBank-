import { transactionRepository } from '../repositories/TransactionRepository';
import { accountRepository } from '../repositories/AccountRepository';
import { userRepository } from '../repositories/UserRepository';
import { notificationRepository } from '../repositories/NotificationRepository';
import { AppError } from '../utils/appError';
import { ITransaction } from '../models/Transaction';
import { notificationService } from './NotificationService';
import mongoose from 'mongoose';

export class TransactionService {
    async transferFunds(userId: string, data: any): Promise<void> {
        const { receiverAccountNumber, amount, description, fromAccountId } = data;

        let senderAccount;
        if (fromAccountId) {
            senderAccount = await accountRepository.findByIdAndUserId(fromAccountId, userId);
        } else {
            const accounts = await accountRepository.findByUserId(userId);
            senderAccount = accounts[0];
        }

        if (!senderAccount) {
            throw new AppError('Sender account not found', 404);
        }

        if (senderAccount.balance < amount) {
            throw new AppError('Insufficient balance', 400);
        }

        const receiverAccount = await accountRepository.findOne({ accountNumber: receiverAccountNumber });
        if (!receiverAccount) {
            throw new AppError('Receiver account not found', 404);
        }

        if (senderAccount.accountNumber === receiverAccount.accountNumber) {
            throw new AppError('Cannot transfer to self', 400);
        }

        const today = new Date();
        const lastReset = new Date(senderAccount.lastLimitResetDate || 0);

        if (today.toDateString() !== lastReset.toDateString()) {
            senderAccount.usedLimit = 0;
            senderAccount.lastLimitResetDate = today;
        }

        const usedLimit = senderAccount.usedLimit || 0;
        const dailyLimit = senderAccount.dailyLimit || 50000;
        if (usedLimit + Number(amount) > dailyLimit) {
            throw new AppError(`Daily transaction limit exceeded.Remaining limit: ${dailyLimit - usedLimit} `, 400);
        }

        senderAccount.balance -= amount;
        senderAccount.usedLimit = (senderAccount.usedLimit || 0) + Number(amount);
        await accountRepository.updateById(senderAccount._id as any, {
            balance: senderAccount.balance,
            usedLimit: senderAccount.usedLimit,
            lastLimitResetDate: senderAccount.lastLimitResetDate
        } as any);

        receiverAccount.balance += Number(amount);
        await accountRepository.updateById(receiverAccount._id as any, {
            balance: receiverAccount.balance
        } as any);

        const receiverUser = await userRepository.findById(receiverAccount.userId as any);
        await transactionRepository.create({
            userId: userId as any,
            accountId: senderAccount._id as any,
            type: 'transfer',
            amount: -amount,
            currency: senderAccount.currency,
            status: 'completed',
            receiverName: receiverUser?.name,
            receiverAccountId: receiverAccount.accountNumber,
            description: description || 'Transfer to ' + receiverAccountNumber,
            category: 'transfer'
        });

        const senderUser = await userRepository.findById(userId);
        await transactionRepository.create({
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
    }

    async internalTransfer(userId: string, data: any): Promise<void> {
        const { receiverAccountNumber, amount, description, fromAccountId } = data;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            let senderAccount;
            if (fromAccountId) {
                senderAccount = await accountRepository.model.findOne({ _id: fromAccountId, userId: userId as any }).session(session);
            } else {
                const accounts = await accountRepository.model.find({ userId: userId as any }).session(session);
                senderAccount = accounts[0];
            }

            if (!senderAccount) {
                throw new AppError('Sender account not found', 404);
            }

            if (senderAccount.status !== 'active' && senderAccount.status !== 'dormant') {
                throw new AppError(`Sender account is ${senderAccount.status} `, 400);
            }

            if (senderAccount.balance < amount) {
                throw new AppError('Insufficient balance', 400);
            }

            const receiverAccount = await accountRepository.model.findOne({ accountNumber: receiverAccountNumber }).session(session);
            if (!receiverAccount) {
                throw new AppError('Receiver account not found', 404);
            }

            if (receiverAccount.status !== 'active' && receiverAccount.status !== 'dormant') {
                throw new AppError(`Receiver account is ${receiverAccount.status} `, 400);
            }

            if (senderAccount.accountNumber === receiverAccount.accountNumber) {
                throw new AppError('Cannot transfer to self', 400);
            }

            const today = new Date();
            const lastReset = new Date(senderAccount.lastLimitResetDate || 0);

            if (today.toDateString() !== lastReset.toDateString()) {
                senderAccount.usedLimit = 0;
                senderAccount.lastLimitResetDate = today;
            }

            const usedLimit = senderAccount.usedLimit || 0;
            const dailyLimit = senderAccount.dailyLimit || 50000;
            if (usedLimit + Number(amount) > dailyLimit) {
                throw new AppError(`Daily transaction limit exceeded.Remaining limit: ${dailyLimit - usedLimit} `, 400);
            }

            // Create pending transactions
            const senderTransaction = await transactionRepository.model.create([{
                userId: userId as any,
                accountId: senderAccount._id as any,
                type: 'transfer',
                amount: -amount,
                currency: senderAccount.currency,
                status: 'pending',
                receiverName: 'Internal User',
                receiverAccountId: receiverAccount.accountNumber,
                description: description || 'Transfer to ' + receiverAccountNumber,
                category: 'transfer'
            }], { session });

            const receiverTransaction = await transactionRepository.model.create([{
                userId: receiverAccount.userId as any,
                accountId: receiverAccount._id as any,
                type: 'transfer',
                amount: amount,
                currency: receiverAccount.currency,
                status: 'pending',
                senderName: 'Internal User',
                description: description || 'Received from ' + senderAccount.accountNumber,
                category: 'income'
            }], { session });

            // Deduct and Credit
            senderAccount.balance -= Number(amount);
            senderAccount.usedLimit = (senderAccount.usedLimit || 0) + Number(amount);
            await senderAccount.save({ session });

            receiverAccount.balance += Number(amount);
            await receiverAccount.save({ session });

            // Mark as completed
            senderTransaction[0].status = 'completed';
            await senderTransaction[0].save({ session });

            receiverTransaction[0].status = 'completed';
            await receiverTransaction[0].save({ session });

            // Notifications
            await notificationRepository.model.create([{
                userId: userId as any,
                type: 'transaction_alert',
                message: `You successfully transferred ${amount} ${senderAccount.currency} to account ${receiverAccount.accountNumber}.`
            }], { session });

            await notificationRepository.model.create([{
                userId: receiverAccount.userId as any,
                type: 'transaction_alert',
                message: `You received a transfer of ${amount} ${receiverAccount.currency} from account ${senderAccount.accountNumber}.`
            }], { session });

            await session.commitTransaction();
            session.endSession();
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async bankTransfer(userId: string, data: any): Promise<void> {
        const { receiverBankName, receiverAccountNumber, receiverIFSC, amount, description, fromAccountId } = data;

        let senderAccount;
        if (fromAccountId) {
            senderAccount = await accountRepository.findByIdAndUserId(fromAccountId, userId);
        } else {
            const accounts = await accountRepository.findByUserId(userId);
            senderAccount = accounts[0];
        }

        if (!senderAccount) throw new AppError('Sender account not found', 404);
        if (senderAccount.status !== 'active' && senderAccount.status !== 'dormant') throw new AppError(`Sender account is ${senderAccount.status}`, 400);

        // Deduct here or inside cron? For bank transfers, usually we deduct immediately to prevent double spend, then keep transaction pending. 
        if (senderAccount.balance < amount) throw new AppError('Insufficient balance', 400);

        const today = new Date();
        const lastReset = new Date(senderAccount.lastLimitResetDate || 0);
        if (today.toDateString() !== lastReset.toDateString()) {
            senderAccount.usedLimit = 0;
            senderAccount.lastLimitResetDate = today;
        }

        const usedLimit = senderAccount.usedLimit || 0;
        const dailyLimit = senderAccount.dailyLimit || 50000;
        if (usedLimit + Number(amount) > dailyLimit) {
            throw new AppError(`Daily transaction limit exceeded. Remaining limit: ${dailyLimit - usedLimit}`, 400);
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const transaction = await transactionRepository.model.create([{
                userId: userId as any,
                accountId: senderAccount._id as any,
                type: 'transfer',
                method: 'neft', // Example
                amount: -amount,
                currency: senderAccount.currency,
                status: 'pending', // Pending to allow for cron simulation
                receiverName: `Bank Transfer - ${receiverBankName}`,
                receiverAccountId: receiverAccountNumber,
                description: description || 'Bank Transfer',
                category: 'transfer',
                processingDelay: 2, // Assuming hours
                scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
            }], { session });

            senderAccount.balance -= Number(amount);
            senderAccount.usedLimit = (senderAccount.usedLimit || 0) + Number(amount);
            await senderAccount.save({ session });

            // Create a pseudo receiver transaction if needed, or simply let the external bank handle it. Since we are simulating, we only hold the debit transaction.
            await session.commitTransaction();
            session.endSession();
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async scheduledTransfer(userId: string, data: any): Promise<void> {
        const { receiverAccountNumber, amount, description, fromAccountId, scheduledDate } = data;

        if (!scheduledDate || new Date(scheduledDate) <= new Date()) {
            throw new AppError('Scheduled date must be in the future', 400);
        }

        let senderAccount;
        if (fromAccountId) {
            senderAccount = await accountRepository.findByIdAndUserId(fromAccountId, userId);
        } else {
            const accounts = await accountRepository.findByUserId(userId);
            senderAccount = accounts[0];
        }

        if (!senderAccount) throw new AppError('Sender account not found', 404);
        if (senderAccount.status !== 'active' && senderAccount.status !== 'dormant') throw new AppError(`Sender account is ${senderAccount.status}`, 400);

        // We DO NOT deduct balance yet for scheduled transfer. We will check balance when the cron job executes it.
        // We just record the scheduled intention.
        await transactionRepository.create({
            userId: userId as any,
            accountId: senderAccount._id as any,
            type: 'transfer',
            amount: -amount,
            currency: senderAccount.currency,
            status: 'pending',
            receiverName: 'Scheduled Transfer',
            receiverAccountId: receiverAccountNumber,
            description: description || 'Scheduled Transfer',
            category: 'transfer',
            scheduledDate: new Date(scheduledDate)
        });
    }

    async getMyTransactions(userId: string, queryParams: any): Promise<any> {
        const { startDate, endDate, status, type, search, page, limit } = queryParams;

        let filters: any = {
            $or: [
                { userId: userId as any },
                { 'receiverAccountId': { $exists: true } } // Mongoose handles this gracefully for legacy string matching, let's refine this to specifically match toAccountId or fromAccountId if needed.
            ]
        };

        // For stricter schema matching
        filters = {
            $or: [
                { userId: userId as any },
                { fromAccountId: userId as any }, // if it's an ObjectId reference
                { toAccountId: userId as any }
            ]
        };

        if (status) filters.status = status;
        if (type) filters.type = type;

        if (startDate || endDate) {
            filters.date = {};
            if (startDate) filters.date.$gte = new Date(startDate);
            if (endDate) filters.date.$lte = new Date(endDate);
        }

        if (search) {
            const regex = new RegExp(search, 'i');
            filters.$and = [
                {
                    $or: [
                        { description: { $regex: regex } },
                        { referenceId: { $regex: regex } },
                        { method: { $regex: regex } }
                    ]
                }
            ];
        }

        const pageNumber = parseInt(page as string, 10) || 1;
        const limitNumber = parseInt(limit as string, 10) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        return await transactionRepository.findTransactionsWithFilters(filters, skip, limitNumber);
    }

    async deposit(userId: string, amount: number): Promise<ITransaction> {
        const accounts = await accountRepository.findByUserId(userId);
        const account = accounts[0];

        if (!account) throw new AppError('Account not found', 404);

        account.balance += Number(amount);
        await accountRepository.updateById(account._id as any, { balance: account.balance } as any);

        const transaction = await transactionRepository.create({
            userId: userId as any,
            accountId: account._id as any,
            type: 'deposit',
            amount,
            status: 'completed',
            description: 'Deposit',
            category: 'income'
        });

        await notificationService.createNotification(
            userId,
            'deposit_alert',
            `Successfully deposited ${amount} into your account.`
        );

        return transaction;
    }

    async withdraw(userId: string, amount: number): Promise<ITransaction> {
        const accounts = await accountRepository.findByUserId(userId);
        const account = accounts[0];

        if (!account) throw new AppError('Account not found', 404);
        if (account.balance < amount) throw new AppError('Insufficient funds', 400);

        account.balance -= Number(amount);
        await accountRepository.updateById(account._id as any, { balance: account.balance } as any);

        const transaction = await transactionRepository.create({
            userId: userId as any,
            accountId: account._id as any,
            type: 'withdrawal',
            amount: -amount,
            status: 'completed',
            description: 'Withdrawal',
            category: 'expense'
        });

        await notificationService.createNotification(
            userId,
            'withdrawal_alert',
            `Successfully withdrew ${amount} from your account.`
        );

        return transaction;
    }

    async payBill(userId: string, data: any): Promise<ITransaction> {
        const { billerName, amount, billType, fromAccountId } = data;

        let account;
        if (fromAccountId) {
            account = await accountRepository.findByIdAndUserId(fromAccountId, userId);
        } else {
            const accounts = await accountRepository.findByUserId(userId);
            account = accounts[0];
        }

        if (!account) throw new AppError('Account not found', 404);
        if (account.balance < amount) throw new AppError('Insufficient funds', 400);

        const today = new Date();
        const lastReset = new Date(account.lastLimitResetDate || 0);

        if (today.toDateString() !== lastReset.toDateString()) {
            account.usedLimit = 0;
            account.lastLimitResetDate = today;
        }

        const usedLimit = account.usedLimit || 0;
        const dailyLimit = account.dailyLimit || 50000;
        if (usedLimit + Number(amount) > dailyLimit) {
            throw new AppError(`Daily transaction limit exceeded.Remaining limit: ${dailyLimit - usedLimit} `, 400);
        }

        account.balance -= Number(amount);
        account.usedLimit = (account.usedLimit || 0) + Number(amount);
        await accountRepository.updateById(account._id as any, {
            balance: account.balance,
            usedLimit: account.usedLimit,
            lastLimitResetDate: account.lastLimitResetDate
        } as any);

        return await transactionRepository.create({
            userId: userId as any,
            accountId: account._id as any,
            type: 'bill_payment',
            amount: -amount,
            status: 'completed',
            description: `Bill Payment to ${billerName} `,
            category: 'bills',
            reference: billType
        });
    }

    async getAllTransactions(): Promise<ITransaction[]> {
        return await transactionRepository.findAllPopulated();
    }
}

export const transactionService = new TransactionService();
