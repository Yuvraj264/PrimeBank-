import { AnalyticsService } from '../services/AnalyticsService';

// Run every night at 23:55 to finalize the day's metrics
export const processDailyMetrics = async () => {
    console.log('[Analytics] Running End-Of-Day Metrics Aggregator...');
    try {
        const today = new Date();
        await AnalyticsService.generateDailyMetrics(today);
        console.log('[Analytics] Successfully finalized metrics for', today.toISOString().split('T')[0]);
    } catch (error) {
        console.error('[Analytics] Error running metrics aggregator:', error);
    }
};
