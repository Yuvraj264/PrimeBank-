import { userRepository } from '../repositories/UserRepository';
import { accountRepository } from '../repositories/AccountRepository';
import { transactionRepository } from '../repositories/TransactionRepository';
import { cardRepository } from '../repositories/CardRepository';
import { AppError } from '../utils/appError';
import { IUser } from '../models/User';

export class CustomerService {
    async getAllCustomers(): Promise<IUser[]> {
        return await userRepository.model.find({ role: 'customer' }).select('-password');
    }

    async getCustomerById(id: string): Promise<any> {
        if (typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new AppError('Invalid Customer ID format', 400);
        }

        const customer = await userRepository.model.findById(id).select('-password');
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        const account = await accountRepository.findOne({ userId: id as any });
        const recentTransactions = await transactionRepository.model.find({ userId: id as any }).sort({ date: -1 }).limit(5);

        return {
            customer,
            account,
            recentTransactions
        };
    }

    async updateCustomerStatus(id: string, status: string): Promise<IUser> {
        if (!['active', 'blocked'].includes(status)) {
            throw new AppError('Invalid status', 400);
        }

        const customer = await userRepository.updateById(id, { status } as any);
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        return customer;
    }

    async createCustomer(data: any): Promise<any> {
        const { name, email, phone, accountNumber, initialBalance } = data;

        const userExists = await userRepository.findByEmail(email);
        if (userExists) {
            throw new AppError('User with this email already exists', 400);
        }

        const accountExists = await accountRepository.findOne({ accountNumber });
        if (accountExists) {
            throw new AppError('Account number already in use', 400);
        }

        const user = await userRepository.create({
            name,
            email,
            phone,
            password: 'password123',
            role: 'customer',
            status: 'active'
        });

        const newAccount = await accountRepository.create({
            userId: user._id as any,
            accountNumber,
            type: 'savings',
            balance: initialBalance ? Number(initialBalance) : 0,
            status: 'active'
        });

        const today = new Date();
        const year = today.getFullYear() + 5;
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const expiryDate = `${month}/${year.toString().slice(-2)}`;
        const cardNumber = accountNumber;
        const cvv = String(Math.floor(100 + Math.random() * 900));

        await cardRepository.create({
            userId: user._id as any,
            accountId: newAccount._id as any,
            cardNumber,
            cardHolder: (user.fullName || user.name || 'CUSTOMER').toUpperCase(),
            expiryDate,
            cvv,
            type: 'visa',
            status: 'active'
        });

        return {
            user,
            account: newAccount,
            message: 'Customer created successfully. Default password: password123'
        };
    }
}

export const customerService = new CustomerService();
