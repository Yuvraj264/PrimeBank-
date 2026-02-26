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

        // 4. Financial Health Score (Refined Algorithm)
        let score = 50; // Starting base score

        // 4a. Savings Ratio (Weight: 30%)
        let savingsRatio = 0;
        if (monthlyIncome > 0) {
            savingsRatio = (monthlyIncome - monthlySpending) / monthlyIncome;
            if (savingsRatio >= 0.2) score += 30; // Excellent
            else if (savingsRatio >= 0.1) score += 15; // Good
            else if (savingsRatio > 0) score += 5; // Okay
            else score -= 10; // Negative savings
        } else if (monthlySpending > 0) {
            score -= 10; // Spending with zero income
        }

        // 4b. EMI Load (Weight: 30%)
        const totalEMIs = upcomingDues.reduce((sum, d) => sum + d.amountDue, 0);
        if (monthlyIncome > 0) {
            const emiLoad = totalEMIs / monthlyIncome;
            if (emiLoad === 0) score += 30; // No debt
            else if (emiLoad <= 0.3) score += 20; // Healthy debt
            else if (emiLoad <= 0.5) score += 5; // Manageable
            else score -= 15; // High debt burden
        } else if (totalEMIs > 0) {
            score -= 20; // Debt with zero income
        }

        // 4c. Credit Usage (Weight: 20%)
        // Approximating credit usage via Account usedLimit vs dailyLimit
        const totalUsedLimit = accounts.reduce((sum, a) => sum + (a.usedLimit || 0), 0);
        const totalDailyLimit = accounts.reduce((sum, a) => sum + (a.dailyLimit || 50000), 0);
        if (totalDailyLimit > 0) {
            const creditUsage = totalUsedLimit / totalDailyLimit;
            if (creditUsage <= 0.3) score += 20; // Excellent utilization
            else if (creditUsage <= 0.6) score += 10; // Good
            else score -= 10; // High usage
        } else {
            score += 10; // Default points if no limits exist
        }

        // 4d. Deposit Consistency (Weight: 20%)
        // Analyze frequency of deposits in the current month
        const depositCount = transactions.filter(t => t.type === 'deposit' || (t.type === 'transfer' && accounts.some(a => String(a._id) === String(t.toAccountId)))).length;
        if (depositCount >= 4) score += 20; // Highly consistent (weekly)
        else if (depositCount >= 2) score += 10; // Consistent (bi-weekly)
        else if (depositCount === 1) score += 5; // Single deposit

        const financialHealthScore = Math.max(0, Math.min(100, Math.round(score)));

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
