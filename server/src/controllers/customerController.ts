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
