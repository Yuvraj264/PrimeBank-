import cron from 'node-cron';
import { AnalyticsService } from '../services/AnalyticsService';

// Run every night at 23:55 to finalize the day's metrics
export const startAnalyticsCronJobs = () => {
    // 0 23 55 * * *
    cron.schedule('55 23 * * *', async () => {
        console.log('[AnalyticsCron] Running End-Of-Day Metrics Aggregator...');
        try {
            const today = new Date();
            await AnalyticsService.generateDailyMetrics(today);
            console.log('[AnalyticsCron] Successfully finalized metrics for', today.toISOString().split('T')[0]);
        } catch (error) {
            console.error('[AnalyticsCron] Error running metrics aggregator:', error);
        }
    });
};
