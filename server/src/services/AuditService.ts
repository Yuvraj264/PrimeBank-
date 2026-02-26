import { auditLogRepository } from '../repositories/AuditLogRepository';

export class AuditService {
    async logLogin(userId: string, ipAddress: string): Promise<void> {
        try {
            await auditLogRepository.create({
                userId: userId as any,
                action: 'User Login',
                severity: 'info',
                ipAddress,
                details: 'User logged in successfully'
            });
        } catch (error) {
            console.error('Failed to log login:', error);
        }
    }

    async logTransaction(userId: string, targetId: string, action: string, details: string, ipAddress: string): Promise<void> {
        try {
            await auditLogRepository.create({
                userId: userId as any,
                action,
                targetId: targetId as any,
                targetModel: 'Transaction',
                severity: 'info',
                details,
                ipAddress
            });
        } catch (error) {
            console.error('Failed to log transaction:', error);
        }
    }
}

export const auditService = new AuditService();
