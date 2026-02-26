import { BaseRepository } from './BaseRepository';
import Transaction, { ITransaction } from '../models/Transaction';

export class TransactionRepository extends BaseRepository<ITransaction> {
    constructor() {
        super(Transaction);
    }

    async findByUserIdSorted(userId: string): Promise<ITransaction[]> {
        return await this.model.find({ userId: userId as any }).sort({ date: -1 });
    }

    async findTransactionsWithFilters(filters: any, skip: number, limit: number): Promise<{ data: ITransaction[], total: number }> {
        const query = this.model.find(filters).sort({ date: -1, createdAt: -1 });

        if (limit > 0) {
            query.skip(skip).limit(limit);
        }

        const data = await query.exec();
        const total = await this.model.countDocuments(filters);

        return { data, total };
    }

    async findAllPopulated(): Promise<ITransaction[]> {
        return await this.model.find().populate('userId', 'name email').sort({ date: -1 });
    }
}

export const transactionRepository = new TransactionRepository();
