import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';

export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = await AnalyticsService.getDashboardMetrics();
        res.status(200).json({
            status: 'success',
            data: payload
        });
    } catch (error) {
        next(error);
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
