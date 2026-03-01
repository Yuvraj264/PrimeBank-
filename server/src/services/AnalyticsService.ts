import mongoose from 'mongoose';
import DailyMetric from '../models/DailyMetric';
import Transaction from '../models/Transaction';
import Loan from '../models/Loan';
import Card from '../models/Card';
import AuditLog from '../models/AuditLog';
import SuspiciousActivity from '../models/SuspiciousActivity';
import redisClient from '../config/redis';

export class AnalyticsService {
    static async generateDailyMetrics(targetDate: Date = new Date()) {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // 1. Transaction Volume, Deposits, Withdrawals
        const txStats = await Transaction.aggregate([
            { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay }, status: 'completed' } },
            {
                $group: {
                    _id: null,
                    dailyVolume: { $sum: '$amount' },
                    totalDeposits: {
                        $sum: { $cond: [{ $eq: ['$transactionType', 'credit'] }, '$amount', 0] }
                    },
                    totalWithdrawals: {
                        $sum: { $cond: [{ $eq: ['$transactionType', 'debit'] }, '$amount', 0] }
                    }
                }
            }
        ]);

        const stats = txStats[0] || { dailyVolume: 0, totalDeposits: 0, totalWithdrawals: 0 };

        // 2. Active Users (Unique users who logged in today)
        const activeUsers = await AuditLog.distinct('userId', {
            action: { $regex: /login/i },
            timestamp: { $gte: startOfDay, $lte: endOfDay }
        });
        const activeUsersCount = activeUsers.length;

        // 3. Revenue (loan interest + card fees simulation)
        const totalLoans = await Loan.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, totalPrincipal: { $sum: '$principalAmount' } } }
        ]);
        const loanInterestRevenue = ((totalLoans[0]?.totalPrincipal || 0) * 0.15) / 365; // Simulating 15% APR collected daily

        const totalCards = await Card.countDocuments({ status: 'active' });
        const cardFeesRevenue = totalCards * 0.05; // Simulating $0.05 daily fee per card

        const revenue = loanInterestRevenue + cardFeesRevenue;

        // 4. Fraud Rate (Suspicious TX / Total TX)
        const totalTx = await Transaction.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
        const flaggedTx = await SuspiciousActivity.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
        const fraudRate = totalTx > 0 ? (flaggedTx / totalTx) * 100 : 0;

        // 5. Default Rate
        const totalLoansCount = await Loan.countDocuments();
        const rejectedLoansCount = await Loan.countDocuments({ status: 'rejected' });
        const defaultRate = totalLoansCount > 0 ? (rejectedLoansCount / totalLoansCount) * 100 : 0;

        // 6. Card Usage Distribution
        const cardTx = await Transaction.countDocuments({ method: 'card', createdAt: { $gte: startOfDay, $lte: endOfDay } });

        const cardUsage = {
            online: Math.floor(cardTx * 0.65), // 65% Online
            pos: Math.floor(cardTx * 0.25),   // 25% POS
            atm: cardTx - Math.floor(cardTx * 0.65) - Math.floor(cardTx * 0.25) // Remaining ATM
        };

        const metric = await DailyMetric.findOneAndUpdate(
            { date: startOfDay },
            {
                $set: {
                    dailyVolume: stats.dailyVolume,
                    totalDeposits: stats.totalDeposits,
                    totalWithdrawals: stats.totalWithdrawals,
                    activeUsers: activeUsersCount,
                    revenue: Number(revenue.toFixed(2)),
                    fraudRate: Number(fraudRate.toFixed(2)),
                    defaultRate: Number(defaultRate.toFixed(2)),
                    cardUsage
                }
            },
            { upsert: true, new: true }
        );

        // Invalidate cache
        if (redisClient.isReady) {
            try {
                await redisClient.del('analytics_dashboard');
            } catch (e) { }
        }

        return metric;
    }

    static async getDashboardMetrics() {
        if (redisClient.isReady) {
            try {
                const cached = await redisClient.get('analytics_dashboard');
                if (cached) {
                    return JSON.parse(cached);
                }
            } catch (e) {
                console.warn('Redis get failed, falling back to db', e);
            }
        }

        // Fetch last 30 days
        const metrics = await DailyMetric.find().sort({ date: 1 }).limit(30);

        // Calculate aggregates for summary cards
        const latest = metrics[metrics.length - 1] || {
            dailyVolume: 0,
            activeUsers: 0,
            revenue: 0,
            fraudRate: 0,
            totalDeposits: 0,
            totalWithdrawals: 0
        };

        const payload = {
            timeseries: metrics,
            summary: {
                currentVolume: latest.dailyVolume,
                activeUsers: latest.activeUsers,
                dailyRevenue: latest.revenue,
                currentFraudRate: latest.fraudRate,
                currentDefaultRate: latest.defaultRate,
                totalDeposits: latest.totalDeposits,
                totalWithdrawals: latest.totalWithdrawals
            }
        };

        if (redisClient.isReady) {
            // Cache for 1 hour
            try {
                await redisClient.setEx('analytics_dashboard', 3600, JSON.stringify(payload));
            } catch (e) {
                console.warn('Redis set failed', e);
            }
        }

        return payload;
    }
}
