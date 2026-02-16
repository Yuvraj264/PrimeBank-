import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';

export const getAllCustomers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customers = await User.find({ role: 'customer' }).select('-password');
    res.status(200).json({ status: 'success', data: customers });
});

export const getCustomerById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validate ObjectId
    if (typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError('Invalid Customer ID format', 400));
    }

    const customer = await User.findById(id).select('-password');

    if (!customer) {
        return next(new AppError('Customer not found', 404));
    }

    const account = await Account.findOne({ userId: id as any });
    const transactions = await Transaction.find({ userId: id as any }).sort({ date: -1 }).limit(5);

    res.status(200).json({
        status: 'success',
        data: {
            customer,
            account,
            recentTransactions: transactions
        }
    });
});

export const updateCustomerStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'blocked'].includes(status)) {
        return next(new AppError('Invalid status', 400));
    }

    const customer = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!customer) {
        return next(new AppError('Customer not found', 404));
    }

    res.status(200).json({ status: 'success', data: customer });
});

export const createCustomer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, accountNumber, initialBalance } = req.body;

    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new AppError('User with this email already exists', 400));
    }

    // 2. Check if account number exists
    const accountExists = await Account.findOne({ accountNumber });
    if (accountExists) {
        return next(new AppError('Account number already in use', 400));
    }

    // 3. Create User
    const user = await User.create({
        name,
        email,
        phone,
        password: 'password123', // Default password
        role: 'customer',
        status: 'active',
        profileCompleted: true
    });

    // 4. Create Account
    const newAccount = await Account.create({
        userId: user._id as any,
        accountNumber,
        type: 'savings',
        balance: initialBalance ? Number(initialBalance) : 0,
        status: 'active'
    });

    // 5. Create Virtual Card
    const today = new Date();
    const year = today.getFullYear() + 5;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const expiryDate = `${month}/${year.toString().slice(-2)}`;
    // Standard Visa format: 4xxx...
    const cardNumber = '4' + Array(15).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
    const cvv = String(Math.floor(100 + Math.random() * 900));

    // Dynamic import to avoid circular dependency if any
    await import('../models/Card').then(({ default: Card }) => {
        Card.create({
            userId: user._id as any,
            accountId: newAccount._id as any,
            cardNumber,
            cardHolder: user.name.toUpperCase(),
            expiryDate,
            cvv,
            type: 'visa', // Default to Visa
            status: 'active'
        });
    });

    res.status(201).json({
        status: 'success',
        data: {
            user,
            account: newAccount,
            message: 'Customer created successfully. Default password: password123'
        }
    });
});
