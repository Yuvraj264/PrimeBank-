import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';

import redisClient from '../config/redis';

export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cacheKey = 'dashboard:summary:all';
        const cachedMetrics = await redisClient.get(cacheKey);

        if (cachedMetrics) {
            return res.status(200).json({
                status: 'success',
                data: JSON.parse(cachedMetrics),
                source: 'cache'
            });
        }

        const payload = await AnalyticsService.getDashboardMetrics();

        // Cache the dashboard metrics for 5 minutes
        await redisClient.setEx(cacheKey, 300, JSON.stringify(payload));

        res.status(200).json({
            status: 'success',
            data: payload
        });
    } catch (error) {
        next(error);
    }
};

export const invalidateDashboardCache = async () => {
    try {
        await redisClient.del('dashboard:summary:all');
        console.log('[Cache] Dashboard summary cache invalidated');
    } catch (err) {
        console.error('[Cache] Failed to invalidate dashboard cache', err);
    }
};

export const runManualAggregation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date } = req.body;
        const targetDate = date ? new Date(date) : new Date();
        const metric = await AnalyticsService.generateDailyMetrics(targetDate);
        res.status(200).json({
            status: 'success',
            message: 'Manual aggregation completed successfully',
            data: metric
        });
    } catch (error) {
        next(error);
    }
};
