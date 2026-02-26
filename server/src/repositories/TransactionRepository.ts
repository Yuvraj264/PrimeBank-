import { BaseRepository } from './BaseRepository';
import Transaction, { ITransaction } from '../models/Transaction';

export class TransactionRepository extends BaseRepository<ITransaction> {
    constructor() {
        super(Transaction);
    }

    async findByUserIdSorted(userId: string): Promise<ITransaction[]> {
        return await this.model.find({ userId: userId as any }).sort({ date: -1 });
    }

    async findAllPopulated(): Promise<ITransaction[]> {
        return await this.model.find().populate('userId', 'name email').sort({ date: -1 });
    }
}

export const transactionRepository = new TransactionRepository();
