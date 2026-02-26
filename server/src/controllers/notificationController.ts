import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';
import { notificationService } from '../services/NotificationService';

interface AuthRequest extends Request {
    user?: IUser;
}

export const getUserNotifications = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const notifications = await notificationService.getUserNotifications(userId);
    res.status(200).json({ status: 'success', data: notifications });
});

export const markNotificationAsRead = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const notificationId = req.params.id as string;
    const notification = await notificationService.markAsRead(notificationId, userId);

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    res.status(200).json({ status: 'success', data: notification });
});

export const markAllNotificationsAsRead = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    await notificationService.markAllAsRead(userId);

    res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
});
