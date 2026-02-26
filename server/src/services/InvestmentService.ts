import { investmentRepository } from '../repositories/InvestmentRepository';
import { accountRepository } from '../repositories/AccountRepository';
import { transactionRepository } from '../repositories/TransactionRepository';
import { AppError } from '../utils/appError';
import { IInvestment } from '../models/Investment';
import mongoose from 'mongoose';

export class InvestmentService {
    async openInvestment(userId: string, data: any): Promise<IInvestment> {
        const { investmentType, amount, durationMonths, fromAccountId } = data;

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
            if (account.balance < amount) throw new AppError('Insufficient funds to open this investment', 400);

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

            // Deduct from account
            account.balance -= Number(amount);
            account.usedLimit = (account.usedLimit || 0) + Number(amount);
            await account.save({ session });

            // Calculate returns and maturity
            let returnsPercentage = 6.5; // Default base Rate
            if (investmentType === 'FD') returnsPercentage = 7.1;
            if (investmentType === 'RD') returnsPercentage = 6.8;
            if (investmentType === 'MF') returnsPercentage = 12.5; // High risk mock

            const maturityDate = new Date();
            maturityDate.setMonth(maturityDate.getMonth() + durationMonths);

            const investment = await investmentRepository.model.create([{
                userId: userId as any,
                investmentType,
                amount,
                returnsPercentage,
                maturityDate,
                status: 'active'
            }], { session });

            // Create Transaction Record
            await transactionRepository.model.create([{
                userId: userId as any,
                accountId: account._id as any,
                type: 'transfer',
                amount: -amount,
                currency: account.currency,
                status: 'completed',
                receiverName: `PrimeBank ${investmentType} Portfolio`,
                description: `Investment deposit to ${investmentType}`,
                category: 'investments',
                referenceId: investment[0]._id.toString()
            }], { session });

            await session.commitTransaction();
            session.endSession();

            return investment[0];
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async getInvestments(userId: string): Promise<IInvestment[]> {
        return await investmentRepository.findByUserIdSorted(userId);
    }

    async getPerformance(userId: string): Promise<any> {
        const investments = await investmentRepository.model.find({ userId: userId as any });

        let totalInvested = 0;
        let estimatedCurrentValue = 0;
        const portfolio = {
            FD: 0,
            RD: 0,
            MF: 0
        };

        const now = new Date();

        investments.forEach(inv => {
            if (inv.status === 'active') {
                totalInvested += inv.amount;
                portfolio[inv.investmentType] = (portfolio[inv.investmentType] || 0) + inv.amount;

                // Mock current value calculation based on elapsed time
                const elapsedMonths = (now.getTime() - new Date(inv.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
                const earnedInterest = (inv.amount * inv.returnsPercentage * (Math.max(0, elapsedMonths) / 12)) / 100;
                estimatedCurrentValue += (inv.amount + earnedInterest);
            }
        });

        return {
            totalInvested,
            estimatedCurrentValue: Math.round(estimatedCurrentValue * 100) / 100,
            totalReturns: Math.round((estimatedCurrentValue - totalInvested) * 100) / 100,
            portfolio
        };
    }
}

export const investmentService = new InvestmentService();
