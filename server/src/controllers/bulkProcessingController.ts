import { Request, Response, NextFunction } from 'express';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import BulkProcessingJob from '../models/BulkProcessingJob';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';

/**
 * Handles the upload and immediate synchronous processing of a Payroll CSV file.
 * Expected CSV Headers: employeeId, accountId, ifsc, grossSalary
 * Simulates a standard 10% TDS deduction and transfers net internally.
 */
export const processPayrollCSV = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const businessUserId = (req as any).user._id;

    if (!req.files || !('file' in req.files)) {
        return next(new AppError('Please upload a CSV file with the key "file"', 400));
    }

    const uploadedFile: any = req.files.file;
    const fileContent = uploadedFile.data.toString('utf-8');

    // Parse CSV
    let records: any[];
    try {
        records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
    } catch (err) {
        return next(new AppError('Failed to parse CSV file. Ensure valid formatted headers.', 400));
    }

    if (records.length === 0) {
        return next(new AppError('CSV file is empty.', 400));
    }

    // Initialize tracking variables
    let successfulCount = 0;
    let failedCount = 0;
    let totalGrossPay = 0;
    let totalTDSDeducted = 0;
    let totalNetPayout = 0;
    const errors: any[] = [];

    // Create a pending job
    const job = await BulkProcessingJob.create({
        userId: businessUserId,
        jobType: 'payroll',
        status: 'processing',
        totalRecords: records.length,
        uploadFileName: uploadedFile.name
    });

    // We process each record. In a real environment, this should be offloaded to a queue (e.g. BullMQ, AWS SQS)
    // For this build, we execute synchronously to return the report immediately.

    // Acquire merchant's primary source account
    const sourceAccount = await Account.findOne({ userId: businessUserId, isActive: true });

    if (!sourceAccount) {
        job.status = 'failed';
        job.errorMessage = 'Merchant source account not found or frozen.';
        await job.save();
        return next(new AppError(job.errorMessage, 400));
    }

    for (const [index, row] of records.entries()) {
        const { employeeId, accountId, grossSalary } = row;
        const grossPay = parseFloat(grossSalary);

        if (!accountId || isNaN(grossPay) || grossPay <= 0) {
            failedCount++;
            errors.push({ row: index + 2, reason: 'Invalid account ID or salary amount.' });
            continue;
        }

        // Simulate 10% TDS Deduction
        const tdsAmount = parseFloat((grossPay * 0.10).toFixed(2));
        const netPay = parseFloat((grossPay - tdsAmount).toFixed(2));

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check merchant balance
            if (sourceAccount.balance < netPay) {
                throw new Error('Insufficient funds in source account for this row.');
            }

            // Target employee account lookup
            const targetAccount = await Account.findOne({ _id: accountId }).session(session);
            if (!targetAccount || !targetAccount.isActive) {
                throw new Error('Target account invalid or inactive.');
            }

            // Execute the internal system deductions natively 
            sourceAccount.balance -= netPay;
            await sourceAccount.save({ session });

            targetAccount.balance += netPay;
            await targetAccount.save({ session });

            // Audit the transaction
            await Transaction.create([{
                userId: businessUserId,
                fromAccountId: sourceAccount._id,
                toAccountId: targetAccount._id,
                amount: netPay,
                transactionType: 'transfer',
                status: 'completed',
                method: 'internal',
                description: `Payroll Salary for ${employeeId || 'Employee'} (Gross: ${grossPay}, TDS: ${tdsAmount})`,
                referenceId: `PR-${job._id}-${index}`
            } as any], { session: session });

            await session.commitTransaction();
            superAccountSyncCache(sourceAccount); // Mock cache update

            successfulCount++;
            totalGrossPay += grossPay;
            totalTDSDeducted += tdsAmount;
            totalNetPayout += netPay;

        } catch (rowError: any) {
            await session.abortTransaction();
            failedCount++;
            errors.push({ row: index + 2, reason: rowError.message });
        } finally {
            session.endSession();
        }
    }

    // Finalize Job metrics
    job.status = failedCount === records.length ? 'failed' : 'completed';
    job.successfulRecords = successfulCount;
    job.failedRecords = failedCount;
    job.totalAmount = totalNetPayout;
    job.tdsDeducted = totalTDSDeducted;
    job.reportUrl = (failedCount > 0) ? JSON.stringify(errors.slice(0, 10)) : 'All records processed successfully.'; // Keep raw json errors directly in the mongo doc for now
    await job.save();

    res.status(200).json({
        status: 'success',
        message: `Payroll processing finished. Successful: ${successfulCount}, Failed: ${failedCount}`,
        data: job
    });
});

// Helper mutator to prevent read-stale state within identical event loops.
function superAccountSyncCache(mutatedRef: any) {
    // A live pointer update allows the sequential loop to deduct continuously from one memory space
}

export const getProcessingJobs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;
    const jobs = await BulkProcessingJob.find({ userId }).sort('-createdAt');
    res.status(200).json({ status: 'success', data: jobs });
});
