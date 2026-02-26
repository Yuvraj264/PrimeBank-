import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { authService } from '../services/AuthService';
import { auditService } from '../services/AuditService';

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { user, accessToken, refreshToken } = await authService.register(req.body);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
        status: 'success',
        token: accessToken,
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

    const { user, accessToken, refreshToken } = await authService.login(email, password);

    await auditService.logLogin(String(user._id), req.ip || 'unknown');

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
        status: 'success',
        token: accessToken,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});

export const refresh = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Requires cookie-parser middleware in server.ts
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return next(new AppError('No refresh token provided', 401));
    }

    const tokens = await authService.refresh(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
        status: 'success',
        token: tokens.accessToken
    });
});

export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    if (userId) {
        await authService.logout(userId);
    }

    res.cookie('refreshToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now() + 10 * 1000)
    });

    res.status(200).json({ status: 'success' });
});

export const setTransactionPin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const { pin } = req.body;

    if (!pin || pin.length < 4) {
        return next(new AppError('Please provide a valid PIN (minimum 4 digits)', 400));
    }

    await authService.setTransactionPin(userId, pin);

    res.status(200).json({
        status: 'success',
        message: 'Transaction PIN set successfully'
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
