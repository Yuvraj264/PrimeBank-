import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/DashboardService';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

export const getOverview = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const data = await dashboardService.getOverview(userId);
    res.status(200).json({ status: 'success', data });
});

export const getRecentTransactions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const data = await dashboardService.getRecentTransactions(userId, 10);
    res.status(200).json({ status: 'success', data });
});
