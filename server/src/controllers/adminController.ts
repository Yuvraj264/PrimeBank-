import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import Loan from '../models/Loan';
import KYCRequest from '../models/KYCRequest';
import AuditLog from '../models/AuditLog';
import SystemConfig from '../models/SystemConfig';
import BlacklistedIP from '../models/BlacklistedIP';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/appError';

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
    const flaggedTransactions = await Transaction.countDocuments({ isFlagged: true });
    const activeLoans = await Loan.countDocuments({ status: 'active' });

    // Monthly Transaction Data (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Transaction.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: {
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' },
                    type: '$type'
                },
                totalAmount: { $sum: '$amount' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly data for frontend
    const monthlyData = processMonthlyStats(monthlyStats);

    res.status(200).json({
        status: 'success',
        data: {
            totalCustomers,
            totalEmployees,
            transactionsToday: transactionsToday[0] || { totalAmount: 0, count: 0 },
            pendingKYC,
            pendingLoans,
            flaggedTransactions,
            activeLoans,
            monthlyData
        }
    });
});

const processMonthlyStats = (stats: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const processed: any = {};

    stats.forEach(stat => {
        const key = `${months[stat._id.month - 1]}`;
        if (!processed[key]) {
            processed[key] = { month: key, deposits: 0, withdrawals: 0 };
        }
        if (stat._id.type === 'deposit') {
            processed[key].deposits += stat.totalAmount;
        } else if (stat._id.type === 'withdrawal' || stat._id.type === 'transfer' || stat._id.type === 'bill_payment') {
            processed[key].withdrawals += stat.totalAmount;
        }
    });

    return Object.values(processed);
};

export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: users });
});

export const updateUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({ status: 'success', data: user });
});

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    // Also delete associated accounts? Maybe keep for audit, but usually cascade delete
    // For now just delete user

    res.status(204).json({ status: 'success', data: null });
});

export const updateEmployeeRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return next(new AppError('Employee not found', 404));

    res.status(200).json({ status: 'success', data: user });
});

export const getAllAccounts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const accounts = await Account.find()
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', data: accounts });
});

export const getAuditLogs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { severity, action } = req.query;
    const filter: any = {};
    if (severity && severity !== 'all') filter.severity = severity;
    if (action) filter.action = { $regex: action, $options: 'i' };

    const logs = await AuditLog.find(filter)
        .populate('adminId', 'name email')
        .sort({ timestamp: -1 })
        .limit(100);

    res.status(200).json({ status: 'success', data: logs });
});

export const getFlaggedTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const transactions = await Transaction.find({ isFlagged: true })
        .populate('userId', 'name email')
        .sort({ date: -1 });

    res.status(200).json({ status: 'success', data: transactions });
});

export const updateAccountStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    const account = await Account.findByIdAndUpdate(id, { status }, { new: true });
    if (!account) return next(new AppError('Account not found', 404));

    res.status(200).json({ status: 'success', data: account });
});

export const resolveFraudAlert = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // Transaction ID
    const { action } = req.body; // 'cleared' or 'blocked'

    const transaction = await Transaction.findById(id);
    if (!transaction) return next(new AppError('Transaction not found', 404));

    if (action === 'cleared') {
        transaction.isFlagged = false;
        transaction.riskScore = 0;
        await transaction.save();
    } else if (action === 'blocked') {
        // block account and user
        await Account.findByIdAndUpdate(transaction.accountId, { status: 'frozen' });
        await User.findByIdAndUpdate(transaction.userId, { status: 'blocked' });
        // transaction status failed? or just flag remains but action taken?
        // Let's keep flag true but maybe add a note? For now just described side effects
    }

    res.status(200).json({ status: 'success', data: transaction });
});

export const getSystemConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let config = await SystemConfig.findOne();
    if (!config) {
        config = await SystemConfig.create({});
    }
    res.status(200).json({ status: 'success', data: config });
});

export const updateSystemConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const config = await SystemConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.status(200).json({ status: 'success', data: config });
});

export const getBlacklistedIPs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const ips = await BlacklistedIP.find().populate('addedBy', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: ips });
});

export const blacklistIP = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { ip, reason } = req.body;
    const newIP = await BlacklistedIP.create({
        ip,
        reason,
        addedBy: (req as any).user._id
    });
    res.status(201).json({ status: 'success', data: newIP });
});

export const removeBlacklistedIP = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await BlacklistedIP.findByIdAndDelete(id);
    res.status(204).json({ status: 'success', data: null });
});
