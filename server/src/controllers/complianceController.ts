import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { complianceService } from '../services/ComplianceService';
import { reportService } from '../services/ReportService';
import { jsonToCsv } from '../utils/csvExporter';

export const getPendingReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const reviews = await complianceService.getPendingReviews();
    res.status(200).json({ status: 'success', data: reviews });
});

export const getHighRiskUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await complianceService.getHighRiskUsers();
    res.status(200).json({ status: 'success', data: users });
});

export const reviewActivity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status, adminRemarks } = req.body;
    if (!status || !['approved', 'rejected', 'blocked'].includes(status)) {
        return next(new AppError('Valid review status is required (approved, rejected, blocked)', 400));
    }

    const activityId = req.params.id as string;
    const activity = await complianceService.reviewActivity(activityId, status, adminRemarks);
    res.status(200).json({ status: 'success', data: activity });
});

export const addToSanctionList = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, country, reason } = req.body;
    if (!name || !reason) {
        return next(new AppError('Name and Reason are required for sanctions', 400));
    }

    const sanction = await complianceService.addToSanctionList({ name, country, reason });
    res.status(201).json({ status: 'success', data: sanction });
});

export const updateUserRiskProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { isPEP, riskScore, riskLevel } = req.body;
    const userId = req.params.id as string;
    const user = await complianceService.updateUserRisk(userId, { isPEP, riskScore, riskLevel });
    res.status(200).json({ status: 'success', data: user });
});

export const generateReport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.params;
    const { format, month, year, threshold } = req.query;

    let data: any[] = [];
    let filename = `${type}_report_${Date.now()}`;

    try {
        switch (type) {
            case 'monthly-transactions':
                const m = parseInt(month as string) || new Date().getMonth() + 1;
                const y = parseInt(year as string) || new Date().getFullYear();
                data = await reportService.getMonthlyTransactions(m, y);
                break;
            case 'suspicious-activity':
                data = await reportService.getSuspiciousActivityReport();
                break;
            case 'high-value-transactions':
                const t = parseInt(threshold as string) || 10000;
                data = await reportService.getHighValueTransactions(t);
                break;
            case 'kyc-pending':
                data = await reportService.getKYCPendingReport();
                break;
            default:
                return next(new AppError('Invalid report type. Supported: monthly-transactions, suspicious-activity, high-value-transactions, kyc-pending', 400));
        }

        if (format === 'csv') {
            const csv = jsonToCsv(data);
            res.header('Content-Type', 'text/csv');
            res.attachment(`${filename}.csv`);
            return res.send(csv);
        }

        // Default JSON
        res.status(200).json({
            status: 'success',
            results: data.length,
            data
        });
    } catch (error) {
        next(error);
    }
});
