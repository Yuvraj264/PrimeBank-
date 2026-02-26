import { supportTicketRepository } from '../repositories/SupportTicketRepository';
import { AppError } from '../utils/appError';
import { ISupportTicket } from '../models/SupportTicket';

export class SupportService {
    async createTicket(userId: string, data: any): Promise<ISupportTicket> {
        const { subject, category, description, priority } = data;

        return await supportTicketRepository.create({
            userId: userId as any,
            subject,
            category,
            description,
            priority: priority || 'medium',
            status: 'open'
        });
    }

    async getUserTickets(userId: string): Promise<ISupportTicket[]> {
        return await supportTicketRepository.findByUserIdSorted(userId);
    }

    async getAllTickets(): Promise<ISupportTicket[]> {
        return await supportTicketRepository.findAllSorted();
    }

    async updateTicketStatus(id: string, status: string): Promise<ISupportTicket> {
        if (!['open', 'pending', 'resolved'].includes(status)) {
            throw new AppError('Invalid status. Must be open, pending, or resolved.', 400);
        }

        const ticket = await supportTicketRepository.findById(id);
        if (!ticket) {
            throw new AppError('Support ticket not found', 404);
        }

        ticket.status = status as any;
        return await supportTicketRepository.updateById(id, { status: ticket.status } as any) as ISupportTicket;
    }
}

export const supportService = new SupportService();
