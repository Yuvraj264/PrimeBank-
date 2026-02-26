import { notificationRepository } from '../repositories/NotificationRepository';
import { INotification } from '../models/Notification';
import mongoose from 'mongoose';

export class NotificationService {
    async createNotification(
        userId: string,
        type: string,
        message: string,
        session?: mongoose.ClientSession
    ): Promise<INotification> {
        const payload = {
            userId: userId as any,
            type,
            message,
            isRead: false
        };

        if (session) {
            const result = await notificationRepository.model.create([payload], { session });
            return result[0];
        }

        return await notificationRepository.model.create(payload);
    }

    async getUserNotifications(userId: string): Promise<INotification[]> {
        return await notificationRepository.findByUserIdSorted(userId);
    }

    async markAsRead(id: string, userId: string): Promise<INotification | null> {
        return await notificationRepository.model.findOneAndUpdate(
            { _id: id, userId: userId as any },
            { isRead: true },
            { new: true }
        );
    }

    async markAllAsRead(userId: string): Promise<void> {
        await notificationRepository.model.updateMany(
            { userId: userId as any, isRead: false },
            { isRead: true }
        );
    }
}

export const notificationService = new NotificationService();
