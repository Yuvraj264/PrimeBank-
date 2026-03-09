import { EventBus } from './EventBus';
import { webhookService } from './WebhookService';
import { notificationService } from './NotificationService';
import { invalidateDashboardCache } from '../controllers/analyticsController';

export class EventConsumer {
    static async start() {
        // Subscribe to transaction completed events to trigger webhooks
        // Also invalidate dashboard cache
        await EventBus.subscribe('webhook_processor', 'transaction.completed', async (data) => {
            const { userId, eventType, payload } = data;

            // Invalidate analytics cache
            await invalidateDashboardCache();

            console.log(`[EventConsumer] Processing Webhook for user ${userId} event ${eventType}`);
            await webhookService.triggerWebhook(userId, eventType, payload);
        });

        // Subscribe to notification create events
        await EventBus.subscribe('notification_processor', 'notification.create', async (data) => {
            const { userId, type, message } = data;
            console.log(`[EventConsumer] Processing Notification for user ${userId}`);
            await notificationService.createNotification(userId, type, message);
        });

        // Listen for transaction.created events
        await EventBus.subscribe('transaction_created_processor', 'transaction.created', async (data) => {
            const { userId, payload } = data;
            console.log(`[EventConsumer] Transaction created for user ${userId}: ${payload.transactionId}`);
            // Future extension: initiate KYC or fraud checks here before completion
        });

        // Listen for loan.approved events
        await EventBus.subscribe('loan_approved_processor', 'loan.approved', async (data) => {
            const { userId, loanId, principalAmount } = data;
            console.log(`[EventConsumer] Loan ${loanId} approved for user ${userId}`);
            await notificationService.createNotification(userId, 'loan_approved', `Congratulations! Your loan of ${principalAmount} is approved.`);
        });

        // Listen for user.risk.updated events
        await EventBus.subscribe('user_risk_processor', 'user.risk.updated', async (data) => {
            const { userId, beforeState, afterState } = data;
            console.log(`[EventConsumer] User ${userId} risk updated from ${beforeState.riskLevel} to ${afterState.riskLevel}`);
            if (afterState.riskLevel === 'high' && beforeState.riskLevel !== 'high') {
                await notificationService.createNotification(userId, 'security_alert', `Your account has been flagged for high risk activity. Please contact support.`);
            }
        });

        console.log('[EventConsumer] Consumers started successfully');
    }
}
