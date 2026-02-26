import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';
import { cardService } from '../services/CardService';

interface AuthRequest extends Request {
    user?: IUser;
}

export const createCard = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const newCard = await cardService.createCard(userId, req.user!.fullName || req.user!.name || 'Customer');

    res.status(201).json({
        status: 'success',
        data: newCard
    });
});

export const toggleCardFreeze = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const card = await cardService.toggleCardFreeze(req.params.id as string, userId);

    res.status(200).json({
        status: 'success',
        data: card
    });
});

export const updateCardLimits = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const card = await cardService.updateCardLimits(req.params.id as string, userId, req.body);

    res.status(200).json({
        status: 'success',
        data: card
    });
});

export const createVirtualCard = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const { accountId } = req.body;

    if (!accountId) {
        return next(new AppError('Account ID is required to generate a virtual card', 400));
    }

    const userName = req.user!.fullName || req.user!.name || 'Customer';
    const card = await cardService.createVirtualCard(userId, accountId, userName);

    res.status(201).json({
        status: 'success',
        data: card
    });
});

export const reportLostCard = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const card = await cardService.reportLostCard(req.params.id as string, userId);

    res.status(200).json({
        status: 'success',
        message: 'Card permanently blocked',
        data: card
    });
});

export const getMyCards = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const cards = await cardService.getMyCards(userId);

    res.status(200).json({
        status: 'success',
        results: cards.length,
        data: cards
    });
});

export const getCardDetails = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = (req.user!._id as any).toString();
    const card = await cardService.getCardDetails(req.params.id as string, userId);

    res.status(200).json({
        status: 'success',
        data: card
    });
});
