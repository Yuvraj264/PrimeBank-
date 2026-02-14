import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Account from '../models/Account';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import jwt from 'jsonwebtoken';

const signToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: '30d',
    });
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role, phone } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(new AppError('User already exists', 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        phone
    });

    if (user) {
        // Create a default account for customers
        if (user.role === 'customer') {
            await Account.create({
                userId: user._id as any,
                accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                type: 'savings',
                balance: 0
            });
        }

        const token = signToken(user._id as unknown as string);

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
    } else {
        return next(new AppError('Invalid user data', 400));
    }
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const token = signToken(user._id as unknown as string);

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
    } else {
        return next(new AppError('Invalid email or password', 401));
    }
});

export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById((req as any).user.id).select('-password');

    res.status(200).json({
        status: 'success',
        data: user,
    });
});

export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const allowedFields = [
        'personalDetails',
        'identityDetails',
        'address',
        'professionalDetails',
        'nominee'
    ];

    const updates: any = {};
    Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
            updates[key] = req.body[key];
        }
    });

    if (req.body.personalDetails?.fullName) {
        updates.name = req.body.personalDetails.fullName;
    }

    updates.profileCompleted = true;

    const user = await User.findByIdAndUpdate(
        (req as any).user.id,
        updates,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: 'success',
        data: user
    });
});
