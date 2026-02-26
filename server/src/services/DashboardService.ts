import { accountRepository } from '../repositories/AccountRepository';
import { transactionRepository } from '../repositories/TransactionRepository';
import { loanRepository } from '../repositories/LoanRepository';
import { AppError } from '../utils/appError';
import mongoose from 'mongoose';

export class DashboardService {
    async getOverview(userId: string): Promise<any> {
        // 1. Total Balance & Accounts
        const accounts = await accountRepository.findByUserId(userId);
        const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
        const accountDetails = accounts.map(acc => ({
            id: acc._id,
            accountNumber: acc.accountNumber,
            type: acc.type,
            balance: acc.balance,
            currency: acc.currency
        }));

        // 2. Monthly Income & Spending
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const accountIds = accounts.map(a => a._id);

        const transactions = await transactionRepository.model.find({
            $or: [{ userId: userId as any }, { toAccountId: { $in: accountIds } as any }],
            createdAt: { $gte: startOfMonth }
        });

        let monthlyIncome = 0;
        let monthlySpending = 0;

        transactions.forEach(t => {
            // Income = deposits OR transfers where user is the receiver
            if (t.type === 'deposit') {
                monthlyIncome += t.amount || 0;
            } else if (t.type === 'transfer' && accounts.some(a => String(a._id) === String(t.toAccountId))) {
                monthlyIncome += t.amount || 0;
            }

            // Spending = withdrawals, bill_payments OR transfers where user is sender
            else if (t.type === 'withdrawal' || t.type === 'bill_payment') {
                monthlySpending += t.amount || 0;
            } else if (t.type === 'transfer' && String(t.userId) === userId) {
                monthlySpending += t.amount || 0;
            }
        });

        // 3. Upcoming Dues (Active Loans)
        const activeLoans = await loanRepository.model.find({
            userId: userId as any,
            status: 'active'
        });

        const upcomingDues = activeLoans.map(loan => ({
            id: loan._id,
            type: loan.loanType,
            amountDue: loan.emiAmount,
            dueDate: new Date(new Date().setDate(28)) // Default to 28th if not set
        }));

        // 4. Financial Health Score (Simple algorithm)
        let financialHealthScore = 70; // Base score
        if (monthlyIncome > 0) {
            const savingsRatio = (monthlyIncome - monthlySpending) / monthlyIncome;
            if (savingsRatio > 0.4) financialHealthScore += 20;
            else if (savingsRatio > 0.2) financialHealthScore += 10;
            else if (savingsRatio < 0) financialHealthScore -= 20;
        } else if (monthlySpending > 0) {
            financialHealthScore -= 30; // Spending with no income
        }

        financialHealthScore = Math.max(0, Math.min(100, financialHealthScore));

        return {
            totalBalance,
            accountDetails,
            monthlyIncome,
            monthlySpending,
            upcomingDues,
            financialHealthScore
        };
    }

    async getRecentTransactions(userId: string, limit: number = 10): Promise<any[]> {
        const accounts = await accountRepository.findByUserId(userId);
        const accountIds = accounts.map(a => a._id);

        // Find transactions where user is sender OR receiver
        return await transactionRepository.model.find({
            $or: [
                { userId: userId as any },
                { toAccountId: { $in: accountIds } as any }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}

export const dashboardService = new DashboardService();
