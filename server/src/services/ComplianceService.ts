import { suspiciousActivityRepository } from '../repositories/SuspiciousActivityRepository';
import { sanctionListRepository } from '../repositories/SanctionListRepository';
import { userRepository } from '../repositories/UserRepository';
import { transactionRepository } from '../repositories/TransactionRepository';
import { AppError } from '../utils/appError';
import { auditService } from './AuditService';

export class ComplianceService {

    // Thresholds
    private LARGE_TRANSACTION_LIMIT = 10000;
    private STRUCTURING_LIMIT = 9000;
    private VELOCITY_WINDOW_HOURS = 1;
    private VELOCITY_MAX_TXNS = 5;

    /**
     * Engine: Assess a transaction for AML red flags BEFORE it is processed
     */
    async analyzeTransaction(userId: string, amount: number, type: string, receiverName?: string): Promise<{ isBlocked: boolean; reason?: string }> {
        const user = await userRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404);

        if (user.accountStatus === 'frozen' || user.accountStatus === 'closed') {
            return { isBlocked: true, reason: 'Account is frozen or closed' };
        }

        const flags: any[] = [];
        let blockTransaction = false;

        // 1. Sanctions Screening
        if (receiverName) {
            const hits = await sanctionListRepository.findByName(receiverName);
            if (hits.length > 0) {
                flags.push({ rule: 'sanction_match', severity: 'critical', meta: { matchedName: hits[0].name } });
                blockTransaction = true;
            }
        }

        // 2. Large Transaction Rule
        if (amount >= this.LARGE_TRANSACTION_LIMIT) {
            flags.push({ rule: 'large_transaction', severity: 'high', meta: { amount } });
        }

        // 3. Structuring Detection (Smurfing check)
        // If amount is suspiciously close to the limit (e.g. 9,999 to avoid 10k reporting)
        if (amount >= this.STRUCTURING_LIMIT && amount < this.LARGE_TRANSACTION_LIMIT) {
            flags.push({ rule: 'structuring', severity: 'medium', meta: { amount } });
        }

        // 4. Velocity Check (Rapid successive transfers)
        const oneHourAgo = new Date(Date.now() - this.VELOCITY_WINDOW_HOURS * 60 * 60 * 1000);
        const recentTxns = await transactionRepository.model.countDocuments({
            userId: userId as any,
            createdAt: { $gte: oneHourAgo }
        });

        if (recentTxns >= this.VELOCITY_MAX_TXNS) {
            flags.push({ rule: 'velocity_check', severity: 'high', meta: { count: recentTxns } });
        }

        // Determine Risk Bump
        if (flags.length > 0) {
            await this.logSuspiciousActivities(userId, flags);
            await this.calculateAndBumpUserRisk(userId, flags);
        }

        // If user is already high risk or transaction hits critical flags -> BLOCK
        if (blockTransaction || user.riskLevel === 'high') {
            // Freeze user automatically on critical hits
            if (blockTransaction) {
                const beforeState = JSON.parse(JSON.stringify(user));
                user.accountStatus = 'frozen';
                await user.save();
                const afterState = JSON.parse(JSON.stringify(user));
                await auditService.logAction(undefined, 'Auto Freeze Account (Compliance)', 'User', userId, 'System', beforeState, afterState, 'destructive');
            }
            return { isBlocked: true, reason: 'Transaction blocked due to compliance alerts' };
        }

        return { isBlocked: false };
    }

    private async logSuspiciousActivities(userId: string, flags: any[], txnId?: string) {
        for (const flag of flags) {
            await suspiciousActivityRepository.create({
                userId: userId as any,
                transactionId: txnId as any,
                ruleFlagged: flag.rule,
                severity: flag.severity,
                status: 'pending_review',
                metadata: flag.meta
            });
        }
    }

    private async calculateAndBumpUserRisk(userId: string, newFlags: any[]) {
        const user = await userRepository.findById(userId);
        if (!user) return;

        const beforeState = JSON.parse(JSON.stringify(user));
        let riskBump = 0;
        for (const flag of newFlags) {
            if (flag.severity === 'critical') riskBump += 40;
            if (flag.severity === 'high') riskBump += 20;
            if (flag.severity === 'medium') riskBump += 10;
            if (flag.severity === 'low') riskBump += 5;
        }

        user.riskScore += riskBump;
        if (user.isPEP) user.riskScore += 10; // PEPs naturally have higher baseline risk

        user.riskScore = Math.min(100, user.riskScore);

        if (user.riskScore >= 75) user.riskLevel = 'high';
        else if (user.riskScore >= 40) user.riskLevel = 'medium';
        else user.riskLevel = 'low';

        await user.save();
        const afterState = JSON.parse(JSON.stringify(user));

        if (beforeState.riskScore !== afterState.riskScore) {
            await auditService.logAction(undefined, 'Automated Risk Bump', 'User', userId, 'System', beforeState, afterState, 'warning');
        }
    }

    // Admin Operations
    async getPendingReviews() {
        return await suspiciousActivityRepository.findPending();
    }

    async getHighRiskUsers() {
        return await userRepository.model.find({ riskLevel: 'high' }).select('-password -transactionPin');
    }

    async reviewActivity(activityId: string, status: 'approved' | 'rejected' | 'blocked', adminRemarks: string) {
        const activity = await suspiciousActivityRepository.findById(activityId);
        if (!activity) throw new AppError('Activity not found', 404);

        const beforeState = JSON.parse(JSON.stringify(activity));
        const updatedActivity = await suspiciousActivityRepository.updateById(activityId, { status, adminRemarks } as any);
        const afterState = JSON.parse(JSON.stringify(updatedActivity));

        await auditService.logAction(undefined, 'Admin Reviewed Suspicious Activity', 'SuspiciousActivity', activityId, 'System', beforeState, afterState, 'warning');

        return updatedActivity;
    }

    async addToSanctionList(data: any) {
        return await sanctionListRepository.create(data);
    }

    async updateUserRisk(userId: string, updates: { isPEP?: boolean; riskScore?: number; riskLevel?: 'low' | 'medium' | 'high' }) {
        const user = await userRepository.findById(userId);
        const beforeState = JSON.parse(JSON.stringify(user));

        const updatedUser = await userRepository.updateById(userId, updates as any);
        const afterState = JSON.parse(JSON.stringify(updatedUser));

        await auditService.logAction(undefined, 'Admin Updated User Risk', 'User', userId, 'System', beforeState, afterState, 'warning');

        return updatedUser;
    }
}

export const complianceService = new ComplianceService();
