import { Request, Response, NextFunction } from 'express';
import Loan from '../models/Loan';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

export const applyLoan = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { type, amount, tenure, monthlyIncome, employmentStatus } = req.body;
    const userId = req.user!._id;

    // Simulate Credit Score calculation
    const creditScore = Math.floor(Math.random() * (850 - 600 + 1)) + 600;

    // Base interest rate logic
    let interestRate = 10;
    if (creditScore > 750) interestRate = 8;
    if (type === 'home') interestRate -= 1;

    const loan = await Loan.create({
        userId: userId as any,
        type,
        amount,
        tenure,
        interestRate,
        creditScore,
        monthlyIncome,
        employmentStatus
    });

    res.status(201).json({ status: 'success', data: loan });
});

export const getMyLoans = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const loans = await Loan.find({ userId: req.user!._id as any }).sort({ appliedAt: -1 });
    res.status(200).json({ status: 'success', data: loans });
});

export const getAllLoans = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const loans = await Loan.find().populate('userId', 'name email').sort({ appliedAt: -1 });
    res.status(200).json({ status: 'success', data: loans });
});

export const updateLoanStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const adminId = req.user!._id;

    if (!['approved', 'rejected'].includes(status)) {
        return next(new AppError('Invalid status', 400));
    }

    const loan = await Loan.findById(id);
    if (!loan) {
        return next(new AppError('Loan not found', 404));
    }

    loan.status = status;
    loan.adminComment = adminComment;
    loan.approvedBy = adminId as any;
    loan.approvedAt = new Date();
    await loan.save();

    res.status(200).json({ status: 'success', data: loan });
});
