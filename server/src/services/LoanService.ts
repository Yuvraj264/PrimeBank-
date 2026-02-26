import { loanRepository } from '../repositories/LoanRepository';
import { AppError } from '../utils/appError';
import { ILoan } from '../models/Loan';

export class LoanService {
    async applyLoan(userId: string, data: any): Promise<ILoan> {
        const { type, amount, tenure, monthlyIncome, employmentStatus } = data;

        const creditScore = Math.floor(Math.random() * (850 - 600 + 1)) + 600;

        let interestRate = 10;
        if (creditScore > 750) interestRate = 8;
        if (type === 'home') interestRate -= 1;

        return await loanRepository.create({
            userId: userId as any,
            type,
            amount,
            tenure,
            interestRate,
            creditScore,
            monthlyIncome,
            employmentStatus
        });
    }

    async getMyLoans(userId: string): Promise<ILoan[]> {
        return await loanRepository.model.find({ userId: userId as any }).sort({ appliedAt: -1 });
    }

    async getAllLoans(): Promise<ILoan[]> {
        return await loanRepository.model.find().populate('userId', 'name email').sort({ appliedAt: -1 });
    }

    async updateLoanStatus(id: string, adminId: string, status: string, adminComment?: string): Promise<ILoan> {
        if (!['approved', 'rejected'].includes(status)) {
            throw new AppError('Invalid status', 400);
        }

        const loan = await loanRepository.findById(id);
        if (!loan) {
            throw new AppError('Loan not found', 404);
        }

        loan.status = status as any;
        loan.adminComment = adminComment;
        loan.approvedBy = adminId as any;
        loan.approvedAt = new Date();
        return await loanRepository.updateById(id, {
            status: loan.status,
            adminComment: loan.adminComment,
            approvedBy: loan.approvedBy,
            approvedAt: loan.approvedAt
        } as any) as ILoan;
    }
}

export const loanService = new LoanService();
