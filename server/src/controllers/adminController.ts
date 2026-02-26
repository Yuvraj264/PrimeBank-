import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/AdminService';
import catchAsync from '../utils/catchAsync';

export const getDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({ status: 'success', data: stats });
});

export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const role = req.query.role as string | undefined;
    const users = await adminService.getAllUsers(role);
    res.status(200).json({ status: 'success', data: users });
});

export const updateUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await adminService.updateUserStatus(req.params.id as string, req.body.status);
    res.status(200).json({ status: 'success', data: user });
});

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await adminService.deleteUser(req.params.id as string);
    res.status(204).json({ status: 'success', data: null });
});

export const updateEmployeeRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await adminService.updateEmployeeRole(req.params.id as string, req.body.role);
    res.status(200).json({ status: 'success', data: user });
});

export const getAllAccounts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const accounts = await adminService.getAllAccounts();
    res.status(200).json({ status: 'success', data: accounts });
});

export const getAuditLogs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const severity = req.query.severity as string | undefined;
    const action = req.query.action as string | undefined;
    const logs = await adminService.getAuditLogs(severity, action);
    res.status(200).json({ status: 'success', data: logs });
});

export const getFlaggedTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const transactions = await adminService.getFlaggedTransactions();
    res.status(200).json({ status: 'success', data: transactions });
});

export const updateAccountStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const account = await adminService.updateAccountStatus(req.params.id as string, req.body.status);
    res.status(200).json({ status: 'success', data: account });
});

export const resolveFraudAlert = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await adminService.resolveFraudAlert(req.params.id as string, req.body.action);
    res.status(200).json({ status: 'success', data: transaction });
});

export const getSystemConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const config = await adminService.getSystemConfig();
    res.status(200).json({ status: 'success', data: config });
});

export const updateSystemConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const config = await adminService.updateSystemConfig(req.body);
    res.status(200).json({ status: 'success', data: config });
});

export const getBlacklistedIPs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const ips = await adminService.getBlacklistedIPs();
    res.status(200).json({ status: 'success', data: ips });
});

export const blacklistIP = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const adminId = (req as any).user._id.toString();
    const newIP = await adminService.blacklistIP(req.body.ip, req.body.reason, adminId);
    res.status(201).json({ status: 'success', data: newIP });
});

export const removeBlacklistedIP = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await adminService.removeBlacklistedIP(req.params.id as string);
    res.status(204).json({ status: 'success', data: null });
});
