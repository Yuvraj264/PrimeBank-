import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';
import { supportService } from '../services/SupportService';

interface AuthRequest extends Request {
    user?: IUser;
}

export const createTicket = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const ticket = await supportService.createTicket(userId, req.body);
    res.status(201).json({ status: 'success', data: ticket });
});

export const getMyTickets = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const tickets = await supportService.getUserTickets(userId);
    res.status(200).json({ status: 'success', data: tickets });
});

export const getAllTickets = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Admin only route in routes config
    const tickets = await supportService.getAllTickets();
    res.status(200).json({ status: 'success', data: tickets });
});

export const updateTicketStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { status } = req.body;
    if (!status) {
        return next(new AppError('Please provide a status', 400));
    }

    const ticket = await supportService.updateTicketStatus(req.params.id as string, status);
    res.status(200).json({ status: 'success', data: ticket });
});
