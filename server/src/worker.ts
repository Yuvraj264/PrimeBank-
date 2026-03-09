import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { rabbitMQ } from './config/rabbitMQ';
import { EventBus } from './services/EventBus';
import { EventConsumer } from './services/EventConsumer';
import { transactionRepository } from './repositories/TransactionRepository';
import { accountRepository } from './repositories/AccountRepository';
import { notificationRepository } from './repositories/NotificationRepository';

dotenv.config();

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

async function startWorker() {
    console.log('[Worker] Starting background worker process...');

    // Connect to external services
    await connectDB();
    await rabbitMQ.connect();
    await EventBus.init();

    // Start RabbitMQ Consumers
    await EventConsumer.start();

    // Start BullMQ Workers
    const scheduledTransfersWorker = new Worker('scheduled-transfers', async job => {
        console.log(`[Worker] Processing Scheduled Transfer: ${job.id}`);
        // We simulate the transaction completion logic here
        const { transactionId, receiverAccountId, amount } = job.data;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const tx = await transactionRepository.model.findById(transactionId).session(session);
            if (!tx || tx.status !== 'pending') {
                console.log(`[Worker] Transaction ${transactionId} not found or not pending.`);
                await session.abortTransaction();
                return;
            }

            // Since it's a simulated bank transfer, we assume external receiver
            tx.status = 'completed';
            await tx.save({ session });

            await session.commitTransaction();

            // Publish Event
            EventBus.publish('transaction.completed', {
                userId: tx.userId,
                eventType: 'payment_completed',
                payload: {
                    transactionId: tx._id,
                    type: 'scheduled_transfer',
                    amount: amount,
                    status: 'completed'
                }
            });

            console.log(`[Worker] Transaction ${transactionId} completed successfully.`);
        } catch (error) {
            await session.abortTransaction();
            console.error(`[Worker] Failed to process transfer ${transactionId}:`, error);
            throw error;
        } finally {
            session.endSession();
        }
    }, { connection: redisConnection as any });

    scheduledTransfersWorker.on('completed', job => {
        console.log(`[Worker] Job ${job.id} has completed!`);
    });

    scheduledTransfersWorker.on('failed', (job, err) => {
        console.log(`[Worker] Job ${job?.id} has failed with ${err.message}`);
    });

    // Worker for EMI Deductions
    const emiDeductionWorker = new Worker('emi-deduction', async job => {
        console.log(`[Worker] Processing EMI Deduction: ${job.id}`);
        // Simulated EMI deduction logic:
        // 1. Fetch Loan by job.data.loanId
        // 2. Fetch User Account
        // 3. Deduct EMI amount from User Balance
        // 4. Update Loan remainingBalance
        // 5. Create Transaction record
        // 6. Emit transaction.completed
        console.log(`[Worker] EMI Deduction successful for loan ${job.data.loanId}`);
    }, { connection: redisConnection as any });

    // Worker for Auto-Pay Bills
    const autoPayBillsWorker = new Worker('auto-pay-bills', async job => {
        console.log(`[Worker] Processing Auto-Pay Bill: ${job.id}`);
        // Simulated Auto-Pay logic:
        // 1. Fetch Bill by job.data.billId
        // 2. Fetch User Account
        // 3. Deduct Bill amount from User Balance
        // 4. Update Bill status to 'paid'
        // 5. Create Transaction record
        // 6. Emit transaction.completed
        console.log(`[Worker] Auto-Pay Bill successful for bill ${job.data.billId}`);
    }, { connection: redisConnection as any });

    // Worker for Risk Recalculation
    const riskRecalculationWorker = new Worker('risk-recalculation', async job => {
        console.log(`[Worker] Processing Risk Recalculation: ${job.id}`);
        // Simulated Risk Recalculation logic:
        // 1. Fetch User history
        // 2. Recalculate Risk Score
        // 3. Update Policy / Limits
        console.log(`[Worker] Risk Recalculated for user ${job.data.userId}`);
        EventBus.publish('user.risk.updated', {
            userId: job.data.userId,
            riskScore: 750 // placeholder simulation
        });
    }, { connection: redisConnection as any });

    // Daily Scheduler Worker (Runs daily to enqueue EMI, AutoPay, Risk jobs)
    const dailySchedulerWorker = new Worker('daily-scheduler', async job => {
        if (job.name === 'generate-daily-metrics') {
            const { processDailyMetrics } = require('./jobs/analyticsJobs');
            await processDailyMetrics();
        } else if (job.name === 'process-scheduled-transfers') {
            const { processScheduledTransfers } = require('./jobs/transactionJobs');
            await processScheduledTransfers();
        } else if (job.name === 'daily-check') {
            console.log(`[Worker] Running Daily Scheduler: Enqueueing Jobs...`);
            // Example: Query all loans where EMI is due today and add to emiDeduction queue
            // Example: Query all unpaid auto-pay bills due today and add to autoPayBills queue
            // Example: Add a risk recalculation job for users with high activity
            console.log(`[Worker] Daily Scheduler completed adding jobs.`);
        }
    }, { connection: redisConnection as any });

    // Add exactly one repeatable job for the daily scheduler on startup
    const { queues } = require('./services/QueueService');
    await queues.dailyScheduler.add('daily-check', {}, {
        repeat: { pattern: '0 1 * * *' }, // Run at 1 AM everyday
        jobId: 'singleton-daily-scheduler' // Ensures we don't duplicate the recurring job
    });

    await queues.dailyScheduler.add('generate-daily-metrics', {}, {
        repeat: { pattern: '55 23 * * *' }, // Run at 23:55 everyday
        jobId: 'singleton-daily-metrics'
    });

    await queues.dailyScheduler.add('process-scheduled-transfers', {}, {
        repeat: { pattern: '* * * * *' }, // Run every minute for DB polling
        jobId: 'singleton-process-scheduled-transfers'
    });

    console.log('[Worker] Listening for background jobs...');
}

startWorker().catch(err => {
    console.error('[Worker] Fatal error:', err);
    process.exit(1);
});
