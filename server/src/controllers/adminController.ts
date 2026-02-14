import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import Loan from '../models/Loan';
import KYCRequest from '../models/KYCRequest';
import AuditLog from '../models/AuditLog';
import catchAsync from '../utils/catchAsync';

export const getDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Calculate total transactions volume today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const transactionsToday = await Transaction.aggregate([
        { $match: { createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const pendingKYC = await KYCRequest.countDocuments({ status: 'pending' });
    const pendingLoans = await Loan.countDocuments({ status: 'pending' });

    res.status(200).json({
        status: 'success',
        data: {
            totalCustomers,
            totalEmployees,
            transactionsToday: transactionsToday[0] || { totalAmount: 0, count: 0 },
            pendingKYC,
            pendingLoans
        }
    });
});

export const getAuditLogs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const logs = await AuditLog.find().populate('adminId', 'name email').sort({ timestamp: -1 }).limit(20);
    res.status(200).json({ status: 'success', data: logs });
});

export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find().select('-password');
    res.status(200).json({ status: 'success', data: users });
});
