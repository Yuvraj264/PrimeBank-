import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { authService } from '../services/AuthService';

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { user, token } = await authService.register(req.body);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const { user, token } = await authService.login(email, password);

    res.status(200).json({
        status: 'success',
        token,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});

export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const user = await authService.getMe(userId);

    res.status(200).json({
        status: 'success',
        data: user,
    });
});

export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const user = await authService.updateProfile(userId, req.body);

    res.status(200).json({
        status: 'success',
        data: user
    });
});

export const verifyPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;
    const userId = (req as any).user.id;

    if (!password) {
        return next(new AppError('Please provide password', 400));
    }

    await authService.verifyPassword(userId, password);

    res.status(200).json({
        status: 'success',
        message: 'Password verified'
    });
});
