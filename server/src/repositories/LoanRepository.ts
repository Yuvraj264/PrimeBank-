import { BaseRepository } from './BaseRepository';
import Loan, { ILoan } from '../models/Loan';

export class LoanRepository extends BaseRepository<ILoan> {
    constructor() {
        super(Loan);
    }
}

export const loanRepository = new LoanRepository();
