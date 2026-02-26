import { loanRepository } from '../repositories/LoanRepository';
import { accountRepository } from '../repositories/AccountRepository';
import { transactionRepository } from '../repositories/TransactionRepository';
import { AppError } from '../utils/appError';
import { ILoan } from '../models/Loan';
import { notificationService } from './NotificationService';
import mongoose from 'mongoose';

export class LoanService {
    async applyLoan(userId: string, data: any): Promise<ILoan> {
        const { loanType, principalAmount, tenureMonths, monthlyIncome, employmentStatus } = data;

        const creditScore = Math.floor(Math.random() * (850 - 600 + 1)) + 600;

        let interestRate = 10;
        if (creditScore > 750) interestRate = 8;
        if (loanType === 'home') interestRate -= 1;

        // Calculate EMI
        const r = (interestRate / 12) / 100;
        const n = tenureMonths;
        const p = principalAmount;

        let emiAmount = 0;
        if (r > 0) {
            emiAmount = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        } else {
            emiAmount = p / n;
        }

        return await loanRepository.create({
            userId: userId as any,
            loanType,
            principalAmount,
            tenureMonths,
            interestRate,
            emiAmount: Math.round(emiAmount * 100) / 100,
            remainingBalance: principalAmount,
            creditScore,
            monthlyIncome,
            employmentStatus,
            status: 'pending'
        });
    }

    async getMyLoans(userId: string): Promise<ILoan[]> {
        return await loanRepository.findByUserIdSorted(userId);
    }

    async getAllLoans(): Promise<ILoan[]> {
        return await loanRepository.model.find().populate('userId', 'name email').sort({ appliedAt: -1 });
    }

    async updateLoanStatus(id: string, adminId: string, status: string, adminComment?: string): Promise<ILoan> {
        if (!['approved', 'rejected'].includes(status)) {
            throw new AppError('Invalid status', 400);
        }

        const loan = await loanRepository.findById(id);
        if (!loan) {
            throw new AppError('Loan not found', 404);
        }

        loan.status = status as any;
        loan.adminComment = adminComment;
        loan.approvedBy = adminId as any;
        loan.approvedAt = new Date();
        const updatedLoan = await loanRepository.updateById(id, {
            status: loan.status,
            adminComment: loan.adminComment,
            approvedBy: loan.approvedBy,
            approvedAt: loan.approvedAt
        } as any) as ILoan;

        await notificationService.createNotification(
            updatedLoan.userId.toString(),
            'loan_update',
            `Your loan application for ${updatedLoan.principalAmount} has been ${status}.`
        );

        return updatedLoan;
    }

    async prepayLoan(userId: string, data: any): Promise<ILoan> {
        const { loanId, prepayAmount, fromAccountId } = data;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const loan = await loanRepository.model.findOne({ _id: loanId, userId: userId as any }).session(session);
            if (!loan) throw new AppError('Loan not found', 404);
            if (loan.status !== 'approved') throw new AppError(`Cannot prepay a loan that is in ${loan.status} status`, 400);
            if (loan.remainingBalance <= 0) throw new AppError('Loan is already fully paid', 400);

            const amountToPay = Math.min(prepayAmount, loan.remainingBalance);

            let account;
            if (fromAccountId) {
                account = await accountRepository.model.findOne({ _id: fromAccountId, userId: userId as any }).session(session);
            } else {
                const accounts = await accountRepository.model.find({ userId: userId as any }).session(session);
                account = accounts[0];
            }

            if (!account) throw new AppError('Account not found', 404);
            if (account.status !== 'active' && account.status !== 'dormant') throw new AppError(`Account is ${account.status}`, 400);
            if (account.balance < amountToPay) throw new AppError('Insufficient funds to prepay this amount', 400);

            const today = new Date();
            const lastReset = new Date(account.lastLimitResetDate || 0);

            if (today.toDateString() !== lastReset.toDateString()) {
                account.usedLimit = 0;
                account.lastLimitResetDate = today;
            }

            const usedLimit = account.usedLimit || 0;
            const dailyLimit = account.dailyLimit || 50000;
            if (usedLimit + Number(amountToPay) > dailyLimit) {
                throw new AppError(`Daily transaction limit exceeded. Remaining limit: ${dailyLimit - usedLimit}`, 400);
            }

            account.balance -= Number(amountToPay);
            account.usedLimit = (account.usedLimit || 0) + Number(amountToPay);
            await account.save({ session });

            loan.remainingBalance -= Number(amountToPay);
            await loan.save({ session });

            await transactionRepository.model.create([{
                userId: userId as any,
                accountId: account._id as any,
                type: 'bill_payment',
                amount: -amountToPay,
                currency: account.currency,
                status: 'completed',
                receiverName: 'PrimeBank Loan Repayment',
                description: `Loan Prepayment for Loan ${loan._id}`,
                category: 'bills',
                referenceId: loan._id.toString()
            }], { session });

            await session.commitTransaction();
            session.endSession();

            await notificationService.createNotification(
                userId,
                'loan_payment',
                `Successfully prepaid ${amountToPay} towards your loan.`
            );

            return loan;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

export const loanService = new LoanService();
