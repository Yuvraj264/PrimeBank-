import { billRepository } from '../repositories/BillRepository';
import { accountRepository } from '../repositories/AccountRepository';
import { transactionRepository } from '../repositories/TransactionRepository';
import { AppError } from '../utils/appError';
import { IBill } from '../models/Bill';
import { notificationService } from './NotificationService';
import mongoose from 'mongoose';

export class BillService {
    async payBill(userId: string, data: any): Promise<IBill> {
        const { billerName, amount, billType, fromAccountId } = data;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            let account;
            if (fromAccountId) {
                account = await accountRepository.model.findOne({ _id: fromAccountId, userId: userId as any }).session(session);
            } else {
                const accounts = await accountRepository.model.find({ userId: userId as any }).session(session);
                account = accounts[0];
            }

            if (!account) throw new AppError('Account not found', 404);
            if (account.status !== 'active' && account.status !== 'dormant') throw new AppError(`Account is ${account.status}`, 400);
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
                throw new AppError(`Daily transaction limit exceeded. Remaining limit: ${dailyLimit - usedLimit}`, 400);
            }

            account.balance -= Number(amount);
            account.usedLimit = (account.usedLimit || 0) + Number(amount);
            await account.save({ session });

            const transactionData = {
                userId: userId as any,
                accountId: account._id as any,
                type: 'bill_payment',
                amount: -amount,
                currency: account.currency,
                status: 'completed',
                receiverName: billerName,
                description: `Bill Payment to ${billerName}`,
                category: 'bills',
                referenceId: billType
            };

            await transactionRepository.model.create([transactionData], { session });

            const newBill = await billRepository.model.create([{
                userId: userId as any,
                billType,
                billerName,
                accountNumber: account.accountNumber,
                dueDate: new Date(),
                amount,
                status: 'paid',
                autoPayEnabled: false
            }], { session });

            await session.commitTransaction();
            session.endSession();

            await notificationService.createNotification(
                userId,
                'bill_paid',
                `Successfully paid ${amount} to ${billerName}.`
            );

            return newBill[0];
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async getHistory(userId: string): Promise<IBill[]> {
        return await billRepository.findByUserIdSorted(userId);
    }

    async toggleAutoPay(id: string, userId: string): Promise<IBill> {
        const bill = await billRepository.model.findOne({ _id: id, userId: userId as any });

        if (!bill) {
            throw new AppError('Bill not found or you do not have permission', 404);
        }

        bill.autoPayEnabled = !bill.autoPayEnabled;
        await bill.save();

        return bill;
    }
}

export const billService = new BillService();
