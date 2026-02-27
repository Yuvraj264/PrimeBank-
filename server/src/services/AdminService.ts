import { userRepository } from '../repositories/UserRepository';
import { accountRepository } from '../repositories/AccountRepository';
import { transactionRepository } from '../repositories/TransactionRepository';
import { loanRepository } from '../repositories/LoanRepository';
import { kycRequestRepository } from '../repositories/KYCRequestRepository';
import { auditLogRepository } from '../repositories/AuditLogRepository';
import { systemConfigRepository } from '../repositories/SystemConfigRepository';
import { blacklistedIPRepository } from '../repositories/BlacklistedIPRepository';
import { auditService } from './AuditService';
import { AppError } from '../utils/appError';

export class AdminService {
    async getDashboardStats(): Promise<any> {
        const totalCustomers = await userRepository.model.countDocuments({ role: 'customer' });
        const totalEmployees = await userRepository.model.countDocuments({ role: 'employee' });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const transactionsToday = await transactionRepository.model.aggregate([
            { $match: { createdAt: { $gte: startOfDay } } },
            { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        const pendingKYC = await kycRequestRepository.model.countDocuments({ status: 'pending' });
        const pendingLoans = await loanRepository.model.countDocuments({ status: 'pending' });
        const flaggedTransactions = await transactionRepository.model.countDocuments({ isFlagged: true });
        const activeLoans = await loanRepository.model.countDocuments({ status: 'active' });

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await transactionRepository.model.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                        type: '$type'
                    },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthlyData = this.processMonthlyStats(monthlyStats);

        return {
            totalCustomers,
            totalEmployees,
            transactionsToday: transactionsToday[0] || { totalAmount: 0, count: 0 },
            pendingKYC,
            pendingLoans,
            flaggedTransactions,
            activeLoans,
            monthlyData
        };
    }

    private processMonthlyStats(stats: any[]) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const processed: any = {};

        stats.forEach(stat => {
            const key = `${months[stat._id.month - 1]}`;
            if (!processed[key]) {
                processed[key] = { month: key, deposits: 0, withdrawals: 0 };
            }
            if (stat._id.type === 'deposit') {
                processed[key].deposits += stat.totalAmount;
            } else if (stat._id.type === 'withdrawal' || stat._id.type === 'transfer' || stat._id.type === 'bill_payment') {
                processed[key].withdrawals += stat.totalAmount;
            }
        });

        return Object.values(processed);
    }

    async getAllUsers(role?: string): Promise<any[]> {
        const filter = role ? { role } : {};
        return await userRepository.model.find(filter).select('-password').sort({ createdAt: -1 });
    }

    async updateUserStatus(id: string, status: string, adminId: string): Promise<any> {
        const userToUpdate = await userRepository.findById(id);
        if (!userToUpdate) throw new AppError('User not found', 404);
        const beforeState = JSON.parse(JSON.stringify(userToUpdate));

        const user = await userRepository.updateById(id, { status } as any);
        if (!user) throw new AppError('User not found', 404);

        const afterState = JSON.parse(JSON.stringify(user));
        await auditService.logAction(adminId, 'Update User Status (Admin)', 'User', id, 'System', beforeState, afterState, 'warning');
        return user;
    }

    async deleteUser(id: string, adminId: string): Promise<void> {
        const userToDelete = await userRepository.findById(id);
        if (!userToDelete) throw new AppError('User not found', 404);
        const beforeState = JSON.parse(JSON.stringify(userToDelete));

        const user = await userRepository.deleteById(id);
        if (!user) throw new AppError('User not found', 404);

        await auditService.logAction(adminId, 'Delete User (Admin)', 'User', id, 'System', beforeState, null, 'destructive');
    }

    async updateEmployeeRole(id: string, role: string): Promise<any> {
        const user = await userRepository.updateById(id, { role } as any);
        if (!user) throw new AppError('Employee not found', 404);
        return user;
    }

    async getAllAccounts(): Promise<any[]> {
        return await accountRepository.model.find()
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 });
    }

    async getAuditLogs(severity?: string, action?: string): Promise<any[]> {
        const filter: any = {};
        if (severity && severity !== 'all') filter.severity = severity;
        if (action) filter.action = { $regex: action, $options: 'i' };

        return await auditLogRepository.model.find(filter)
            .populate('userId', 'name email')
            .sort({ timestamp: -1 })
            .limit(100);
    }

    async getFlaggedTransactions(): Promise<any[]> {
        return await transactionRepository.model.find({ isFlagged: true })
            .populate('userId', 'name email')
            .sort({ date: -1 });
    }

    async updateAccountStatus(id: string, status: string, adminId: string): Promise<any> {
        const accountToUpdate = await accountRepository.findById(id);
        if (!accountToUpdate) throw new AppError('Account not found', 404);
        const beforeState = JSON.parse(JSON.stringify(accountToUpdate));

        const account = await accountRepository.updateById(id, { status } as any);
        if (!account) throw new AppError('Account not found', 404);

        const afterState = JSON.parse(JSON.stringify(account));
        await auditService.logAction(adminId, 'Update Account Status (Admin)', 'Account', id, 'System', beforeState, afterState, status === 'frozen' ? 'destructive' : 'warning');
        return account;
    }

    async resolveFraudAlert(id: string, action: string): Promise<any> {
        const transaction = await transactionRepository.findById(id);
        if (!transaction) throw new AppError('Transaction not found', 404);

        if (action === 'cleared') {
            await transactionRepository.updateById(id, {
                isFlagged: false,
                riskScore: 0
            } as any);
        } else if (action === 'blocked') {
            await accountRepository.updateById(transaction.accountId as any, { status: 'frozen' } as any);
            await userRepository.updateById(transaction.userId as any, { status: 'blocked' } as any);
        }

        return await transactionRepository.findById(id);
    }

    async getSystemConfig(): Promise<any> {
        let config = await systemConfigRepository.model.findOne();
        if (!config) {
            config = (await systemConfigRepository.create({})) as any;
        }
        return config;
    }

    async updateSystemConfig(data: any, adminId: string): Promise<any> {
        let config = await systemConfigRepository.model.findOne();
        if (!config) {
            config = (await systemConfigRepository.create({})) as any;
        }
        const beforeState = JSON.parse(JSON.stringify(config));

        const updatedConfig = await systemConfigRepository.model.findOneAndUpdate({}, data, { new: true, upsert: true });
        const afterState = JSON.parse(JSON.stringify(updatedConfig));

        await auditService.logAction(adminId, 'Update System Config (Admin)', 'SystemConfig', updatedConfig?._id?.toString(), 'System', beforeState, afterState, 'security');
        return updatedConfig;
    }

    async getBlacklistedIPs(): Promise<any[]> {
        return await blacklistedIPRepository.model.find().populate('addedBy', 'name email').sort({ createdAt: -1 });
    }

    async blacklistIP(ip: string, reason: string, adminId: string): Promise<any> {
        return await blacklistedIPRepository.create({
            ip,
            reason,
            addedBy: adminId as any
        });
    }

    async removeBlacklistedIP(id: string): Promise<void> {
        await blacklistedIPRepository.deleteById(id);
    }
}

export const adminService = new AdminService();
