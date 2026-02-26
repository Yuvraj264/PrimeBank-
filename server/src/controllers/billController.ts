import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';
import { billService } from '../services/BillService';
import { auditService } from '../services/AuditService';

interface AuthRequest extends Request {
    user?: IUser;
}

export const payBill = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const { pin, ...data } = req.body;

    if (!req.user!.transactionPin) {
        return next(new AppError('Please set a Transaction PIN before making payments', 400));
    }

    if (!pin || !(await req.user!.matchTransactionPin(String(pin)))) {
        return next(new AppError('Invalid or missing Transaction PIN', 401));
    }

    const bill = await billService.payBill(userId, data);
    await auditService.logTransaction(userId, 'N/A', 'Bill Payment', `Paid ${data.amount} for bill ${data.billerName}`, req.ip || 'unknown');

    res.status(201).json({ status: 'success', data: bill });
});

export const getBillHistory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const bills = await billService.getHistory(userId);

    res.status(200).json({ status: 'success', data: bills });
});

export const toggleAutoPay = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const bill = await billService.toggleAutoPay(req.params.id as string, userId);

    res.status(200).json({ status: 'success', data: bill });
});
