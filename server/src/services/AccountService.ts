import { accountRepository } from '../repositories/AccountRepository';
import { IAccount } from '../models/Account';
import { AppError } from '../utils/appError';

export class AccountService {
    async getUserAccounts(userId: string): Promise<IAccount[]> {
        return await accountRepository.findByUserId(userId);
    }

    async createAccount(userId: string, type: 'savings' | 'current', currency: string = 'USD'): Promise<IAccount> {
        const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

        const account = await accountRepository.create({
            userId: userId as any,
            accountNumber,
            type,
            currency,
            balance: 0,
            status: 'active'
        });

        return account;
    }

    async getAccountById(id: string, userId: string): Promise<IAccount> {
        const account = await accountRepository.findByIdAndUserId(id, userId);
        if (!account) {
            throw new AppError('Account not found', 404);
        }
        return account;
    }

    async getMockStatements(): Promise<any[]> {
        return [
            { id: 1, month: 'January', year: 2024, size: 'MB', url: '#' },
            { id: 2, month: 'December', year: 2023, size: 'KB', url: '#' },
            { id: 3, month: 'November', year: 2023, size: 'KB', url: '#' },
            { id: 4, month: 'October', year: 2023, size: 'MB', url: '#' },
            { id: 5, month: 'September', year: 2023, size: 'KB', url: '#' },
            { id: 6, month: 'August', year: 2023, size: 'MB', url: '#' },
        ];
    }
}

export const accountService = new AccountService();
