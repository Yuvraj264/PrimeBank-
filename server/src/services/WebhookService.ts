import crypto from 'crypto';
import axios from 'axios';
import BusinessProfile from '../models/BusinessProfile';
import { ITransaction } from '../models/Transaction';

class WebhookService {
    /**
     * Trigger a webhook event for a given merchant/business
     */
    async triggerWebhook(userId: string, eventType: string, payload: any): Promise<void> {
        try {
            // Find the business profile to get the webhook details
            const business = await BusinessProfile.findOne({ userId });

            if (!business || !business.webhookUrl || !business.isActive) {
                return; // Nothing to trigger
            }

            // Construct the payload structure
            const webhookPayload = {
                event: eventType,
                timestamp: new Date().toISOString(),
                data: payload
            };

            const payloadString = JSON.stringify(webhookPayload);

            // Set up headers
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            // Sign the payload if a secret is available
            if (business.webhookSecret) {
                const signature = crypto
                    .createHmac('sha256', business.webhookSecret)
                    .update(payloadString)
                    .digest('hex');
                headers['x-webhook-signature'] = signature;
            }

            // Fire the webhook (fire-and-forget for this MVP, real robust systems use queues like BullMQ)
            axios.post(business.webhookUrl, payloadString, {
                headers,
                timeout: 5000 // 5 seconds timeout
            }).catch(err => {
                console.error(`Webhook delivery failed for business ${business._id}:`, err.message);
                // Can log to a failed webhooks table here for retry logic
            });

        } catch (error) {
            console.error('Error in triggerWebhook:', error);
        }
    }
}

export const webhookService = new WebhookService();
