import { auditLogRepository } from '../repositories/AuditLogRepository';

export class AuditService {
    async logLogin(userId: string, ipAddress: string): Promise<void> {
        try {
            await auditLogRepository.create({
                userId: userId as any,
                action: 'User Login',
                entityType: 'User',
                entityId: userId,
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
                entityType: 'Transaction',
                entityId: targetId,
                severity: 'info',
                details,
                ipAddress
            });
        } catch (error) {
            console.error('Failed to log transaction:', error);
        }
    }

    async logAction(
        userId: string | undefined, // undefined for system actions
        action: string,
        entityType: string,
        entityId: string,
        ipAddress: string,
        beforeState?: any,
        afterState?: any,
        severity: 'info' | 'warning' | 'destructive' | 'security' = 'info'
    ): Promise<void> {
        try {
            await auditLogRepository.create({
                userId: userId as any,
                action,
                entityType,
                entityId,
                ipAddress,
                beforeState,
                afterState,
                severity
            });
        } catch (error) {
            console.error(`Failed to log audit action for ${entityType}:`, error);
        }
    }
}

export const auditService = new AuditService();
