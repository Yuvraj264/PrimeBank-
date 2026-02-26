import { BaseRepository } from './BaseRepository';
import SuspiciousActivity, { ISuspiciousActivity } from '../models/SuspiciousActivity';

export class SuspiciousActivityRepository extends BaseRepository<ISuspiciousActivity> {
    constructor() {
        super(SuspiciousActivity);
    }

    async findPending(): Promise<ISuspiciousActivity[]> {
        return await this.model.find({ status: 'pending_review' }).populate('userId', 'fullName email riskScore riskLevel').sort({ createdAt: -1 });
    }

    async findByUserId(userId: string): Promise<ISuspiciousActivity[]> {
        return await this.model.find({ userId: userId as any }).sort({ createdAt: -1 });
    }
}

export const suspiciousActivityRepository = new SuspiciousActivityRepository();
