import { BaseRepository } from './BaseRepository';
import Notification, { INotification } from '../models/Notification';

export class NotificationRepository extends BaseRepository<INotification> {
    constructor() {
        super(Notification);
    }

    async findByUserIdSorted(userId: string): Promise<INotification[]> {
        return await this.model.find({ userId: userId as any }).sort({ createdAt: -1 });
    }
}

export const notificationRepository = new NotificationRepository();
