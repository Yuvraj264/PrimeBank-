import { BaseRepository } from './BaseRepository';
import Investment, { IInvestment } from '../models/Investment';

export class InvestmentRepository extends BaseRepository<IInvestment> {
    constructor() {
        super(Investment);
    }

    async findByUserIdSorted(userId: string): Promise<IInvestment[]> {
        return await this.model.find({ userId: userId as any }).sort({ createdAt: -1 });
    }
}

export const investmentRepository = new InvestmentRepository();
