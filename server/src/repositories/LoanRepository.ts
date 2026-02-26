import { BaseRepository } from './BaseRepository';
import Loan, { ILoan } from '../models/Loan';

export class LoanRepository extends BaseRepository<ILoan> {
    constructor() {
        super(Loan);
    }

    async findByUserIdSorted(userId: string): Promise<ILoan[]> {
        return await this.model.find({ userId: userId as any }).sort({ createdAt: -1 });
    }
}

export const loanRepository = new LoanRepository();
