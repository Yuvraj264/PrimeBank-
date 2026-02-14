import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import User, { IUser } from '../models/User';
import catchAsync from '../utils/catchAsync';

interface AuthRequest extends Request {
    user?: IUser;
}

export const protect = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Not authorized to access this route', 401));
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        return next(new AppError('Not authorized to access this route', 401));
    }
});

export const restrictTo = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user!.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
