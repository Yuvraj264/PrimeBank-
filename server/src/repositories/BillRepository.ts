import { BaseRepository } from './BaseRepository';
import Bill, { IBill } from '../models/Bill';

export class BillRepository extends BaseRepository<IBill> {
    constructor() {
        super(Bill);
    }

    async findByUserIdSorted(userId: string): Promise<IBill[]> {
        return await this.model.find({ userId: userId as any }).sort({ createdAt: -1 });
    }
}

export const billRepository = new BillRepository();
