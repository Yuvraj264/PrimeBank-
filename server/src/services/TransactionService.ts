import { transactionRepository } from '../repositories/TransactionRepository';
import { accountRepository } from '../repositories/AccountRepository';
import { userRepository } from '../repositories/UserRepository';
import { AppError } from '../utils/appError';
import { ITransaction } from '../models/Transaction';

export class TransactionService {
    async transferFunds(userId: string, data: any): Promise<void> {
        const { receiverAccountNumber, amount, description, fromAccountId } = data;

        let senderAccount;
        if (fromAccountId) {
            senderAccount = await accountRepository.findByIdAndUserId(fromAccountId, userId);
        } else {
            const accounts = await accountRepository.findByUserId(userId);
            senderAccount = accounts[0];
        }

        if (!senderAccount) {
            throw new AppError('Sender account not found', 404);
        }

        if (senderAccount.balance < amount) {
            throw new AppError('Insufficient balance', 400);
        }

        const receiverAccount = await accountRepository.findOne({ accountNumber: receiverAccountNumber });
        if (!receiverAccount) {
            throw new AppError('Receiver account not found', 404);
        }

        if (senderAccount.accountNumber === receiverAccount.accountNumber) {
            throw new AppError('Cannot transfer to self', 400);
        }

        const today = new Date();
        const lastReset = new Date(senderAccount.lastLimitResetDate || 0);

        if (today.toDateString() !== lastReset.toDateString()) {
            senderAccount.usedLimit = 0;
            senderAccount.lastLimitResetDate = today;
        }

        const usedLimit = senderAccount.usedLimit || 0;
        const dailyLimit = senderAccount.dailyLimit || 50000;
        if (usedLimit + Number(amount) > dailyLimit) {
            throw new AppError(`Daily transaction limit exceeded. Remaining limit: ${dailyLimit - usedLimit}`, 400);
        }

        senderAccount.balance -= amount;
        senderAccount.usedLimit = (senderAccount.usedLimit || 0) + Number(amount);
        await accountRepository.updateById(senderAccount._id as any, {
            balance: senderAccount.balance,
            usedLimit: senderAccount.usedLimit,
            lastLimitResetDate: senderAccount.lastLimitResetDate
        } as any);

        receiverAccount.balance += Number(amount);
        await accountRepository.updateById(receiverAccount._id as any, {
            balance: receiverAccount.balance
        } as any);

        const receiverUser = await userRepository.findById(receiverAccount.userId as any);
        await transactionRepository.create({
            userId: userId as any,
            accountId: senderAccount._id as any,
            type: 'transfer',
            amount: -amount,
            currency: senderAccount.currency,
            status: 'completed',
            receiverName: receiverUser?.name,
            receiverAccountId: receiverAccount.accountNumber,
            description: description || 'Transfer to ' + receiverAccountNumber,
            category: 'transfer'
        });

        const senderUser = await userRepository.findById(userId);
        await transactionRepository.create({
            userId: receiverAccount.userId as any,
            accountId: receiverAccount._id as any,
            type: 'transfer',
            amount: amount,
            currency: receiverAccount.currency,
            status: 'completed',
            senderName: senderUser?.name,
            description: description || 'Received from ' + senderAccount.accountNumber,
            category: 'income'
        });
    }

    async getMyTransactions(userId: string): Promise<ITransaction[]> {
        return await transactionRepository.findByUserIdSorted(userId);
    }

    async deposit(userId: string, amount: number): Promise<ITransaction> {
        const accounts = await accountRepository.findByUserId(userId);
        const account = accounts[0];

        if (!account) throw new AppError('Account not found', 404);

        account.balance += Number(amount);
        await accountRepository.updateById(account._id as any, { balance: account.balance } as any);

        return await transactionRepository.create({
            userId: userId as any,
            accountId: account._id as any,
            type: 'deposit',
            amount,
            status: 'completed',
            description: 'Deposit',
            category: 'income'
        });
    }

    async withdraw(userId: string, amount: number): Promise<ITransaction> {
        const accounts = await accountRepository.findByUserId(userId);
        const account = accounts[0];

        if (!account) throw new AppError('Account not found', 404);
        if (account.balance < amount) throw new AppError('Insufficient funds', 400);

        account.balance -= Number(amount);
        await accountRepository.updateById(account._id as any, { balance: account.balance } as any);

        return await transactionRepository.create({
            userId: userId as any,
            accountId: account._id as any,
            type: 'withdrawal',
            amount: -amount,
            status: 'completed',
            description: 'Withdrawal',
            category: 'expense'
        });
    }

    async payBill(userId: string, data: any): Promise<ITransaction> {
        const { billerName, amount, billType, fromAccountId } = data;

        let account;
        if (fromAccountId) {
            account = await accountRepository.findByIdAndUserId(fromAccountId, userId);
        } else {
            const accounts = await accountRepository.findByUserId(userId);
            account = accounts[0];
        }

        if (!account) throw new AppError('Account not found', 404);
        if (account.balance < amount) throw new AppError('Insufficient funds', 400);

        const today = new Date();
        const lastReset = new Date(account.lastLimitResetDate || 0);

        if (today.toDateString() !== lastReset.toDateString()) {
            account.usedLimit = 0;
            account.lastLimitResetDate = today;
        }

        const usedLimit = account.usedLimit || 0;
        const dailyLimit = account.dailyLimit || 50000;
        if (usedLimit + Number(amount) > dailyLimit) {
            throw new AppError(`Daily transaction limit exceeded. Remaining limit: ${dailyLimit - usedLimit}`, 400);
        }

        account.balance -= Number(amount);
        account.usedLimit = (account.usedLimit || 0) + Number(amount);
        await accountRepository.updateById(account._id as any, {
            balance: account.balance,
            usedLimit: account.usedLimit,
            lastLimitResetDate: account.lastLimitResetDate
        } as any);

        return await transactionRepository.create({
            userId: userId as any,
            accountId: account._id as any,
            type: 'bill_payment',
            amount: -amount,
            status: 'completed',
            description: `Bill Payment to ${billerName}`,
            category: 'bills',
            reference: billType
        });
    }

    async getAllTransactions(): Promise<ITransaction[]> {
        return await transactionRepository.findAllPopulated();
    }
}

export const transactionService = new TransactionService();
