import { Request, Response, NextFunction } from 'express';
import Card from '../models/Card';
import Account from '../models/Account';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

export const createCard = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user already has an active card
    const existingCard = await Card.findOne({
        userId: req.user!._id,
        status: { $in: ['active', 'frozen'] }
    } as any);

    if (existingCard) {
        return next(new AppError('You already have an active card', 400));
    }

    // Find user's account to link
    const account = await Account.findOne({ userId: req.user!._id } as any);
    if (!account) {
        return next(new AppError('No eligible account found to link card', 404));
    }

    // Generate Card Details
    const today = new Date();
    const year = today.getFullYear() + 5;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const expiryDate = `${month}/${year.toString().slice(-2)}`;

    const cardNumber = '4' + Array(15).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
    const cvv = String(Math.floor(100 + Math.random() * 900));

    const newCard = await Card.create({
        userId: req.user!._id as any,
        accountId: account._id as any,
        cardNumber,
        cardHolder: req.user!.name.toUpperCase(),
        expiryDate,
        cvv,
        type: 'visa',
        status: 'active'
    });

    res.status(201).json({
        status: 'success',
        data: newCard
    });
});

export const toggleCardFreeze = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const card = await Card.findOne({ _id: req.params.id, userId: req.user!._id } as any);

    if (!card) {
        return next(new AppError('Card not found', 404));
    }

    card.status = card.status === 'active' ? 'frozen' : 'active';
    await card.save();

    res.status(200).json({
        status: 'success',
        data: card
    });
});

export const getMyCards = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const cards = await Card.find({ userId: req.user!._id } as any);

    res.status(200).json({
        status: 'success',
        results: cards.length,
        data: cards
    });
});

export const getCardDetails = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const card = await Card.findOne({ _id: req.params.id, userId: req.user!._id } as any);

    if (!card) {
        return next(new AppError('Card not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: card
    });
});
