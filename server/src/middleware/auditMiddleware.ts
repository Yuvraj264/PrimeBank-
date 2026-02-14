import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

export const logAction = (action: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        // Proceed with the request
        const originalSend = res.send;

        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    await AuditLog.create({
                        adminId: req.user?._id as any,
                        action,
                        targetId: req.params.id as any, // Assuming ID is in params for resource actions
                        details: `Method: ${req.method}, URL: ${req.originalUrl}`,
                        ipAddress: req.ip
                    });
                } catch (err) {
                    console.error('Audit Log Error:', err);
                }
            }
        });

        next();
    };
};
