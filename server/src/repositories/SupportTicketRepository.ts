import { BaseRepository } from './BaseRepository';
import SupportTicket, { ISupportTicket } from '../models/SupportTicket';

export class SupportTicketRepository extends BaseRepository<ISupportTicket> {
    constructor() {
        super(SupportTicket);
    }

    async findByUserIdSorted(userId: string): Promise<ISupportTicket[]> {
        return await this.model.find({ userId: userId as any }).sort({ createdAt: -1 });
    }

    async findAllSorted(): Promise<ISupportTicket[]> {
        return await this.model.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    }
}

export const supportTicketRepository = new SupportTicketRepository();
