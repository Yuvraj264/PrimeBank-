import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import RolePermission from '../models/RolePermission';
import Permission from '../models/Permission';
import Role from '../models/Role';

export const checkPermission = (requiredPermission: string) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        // 1. Basic auth check
        if (!user) {
            return next(new AppError('Unauthorized: Please log in.', 401));
        }

        // 2. System Admins historically bypass (backward compatibility if assignedRole is missing)
        // If they have an assignedRole, we enforce it strictly. If they DON'T but they are 'admin', 
        // we might allow it or fail closed depending on migration state. Let's strictly enforce if assignedRole exists.

        if (!user.assignedRole) {
            // Un-migrated user fallback: If user is an admin but has no specific role assigned yet,
            // we assume they are a legacy Super Admin.
            if (user.role === 'admin') {
                return next();
            }
            return next(new AppError('Forbidden: Role mapping missing.', 403));
        }

        // 3. Resolve the Permission ID
        const targetPermission = await Permission.findOne({ name: requiredPermission });
        if (!targetPermission) {
            return next(new AppError(`Configuration Error: Permission '${requiredPermission}' does not exist in the system.`, 500));
        }

        // 4. Verify junction mapping
        const hasAccess = await RolePermission.findOne({
            roleId: user.assignedRole,
            permissionId: targetPermission._id
        });

        if (!hasAccess) {
            // Also check if they are explicitly 'Super Admin' to bypass 
            const userRole = await Role.findById(user.assignedRole);
            if (userRole && userRole.name === 'Super Admin') {
                return next();
            }

            return next(new AppError(`Forbidden: You lack the '${requiredPermission}' permission.`, 403));
        }

        // Access Granted
        next();
    });
};
