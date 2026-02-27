import { transactionRepository } from '../repositories/TransactionRepository';
import { suspiciousActivityRepository } from '../repositories/SuspiciousActivityRepository';
import { userRepository } from '../repositories/UserRepository';

export class ReportService {
    async getMonthlyTransactions(month: number, year: number) {
        // Construct date range
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const transactions = await transactionRepository.model.find({
            createdAt: { $gte: startDate, $lte: endDate }
        })
            .populate('userId', 'name email accountNumber')
            .sort({ createdAt: -1 })
            .lean(); // Use lean for faster export processing

        return transactions;
    }

    async getSuspiciousActivityReport() {
        const sar = await suspiciousActivityRepository.model.find()
            .populate('userId', 'name email riskScore')
            .populate('transactionId', 'amount type referenceId')
            .sort({ createdAt: -1 })
            .lean();

        return sar;
    }

    async getHighValueTransactions(thresholdAmount: number = 10000) {
        const transactions = await transactionRepository.model.find({
            amount: { $gte: thresholdAmount }
        })
            .populate('userId', 'name email riskLevel')
            .sort({ amount: -1 })
            .lean();

        return transactions;
    }

    async getKYCPendingReport() {
        const users = await userRepository.model.find({
            kycStatus: 'pending'
        })
            .select('name email phone kycStatus riskLevel createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return users;
    }
}

export const reportService = new ReportService();
