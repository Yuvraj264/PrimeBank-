import { BaseRepository } from './BaseRepository';
import Card, { ICard } from '../models/Card';

export class CardRepository extends BaseRepository<ICard> {
    constructor() {
        super(Card);
    }

    async findByUserId(userId: string): Promise<ICard[]> {
        return await this.model.find({ userId: userId as any });
    }

    async updateStatus(id: string, userId: string, status: 'active' | 'frozen'): Promise<ICard | null> {
        return await this.model.findOneAndUpdate(
            { _id: id, userId: userId as any },
            { status },
            { new: true }
        );
    }
}

export const cardRepository = new CardRepository();
