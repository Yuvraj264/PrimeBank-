import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null, // Required by BullMQ
});

export const queues = {
    scheduledTransfers: new Queue('scheduled-transfers', { connection: redisConnection as any }),
    emiDeduction: new Queue('emi-deduction', { connection: redisConnection as any }),
    autoPayBills: new Queue('auto-pay-bills', { connection: redisConnection as any }),
    riskRecalculation: new Queue('risk-recalculation', { connection: redisConnection as any }),
    dailyScheduler: new Queue('daily-scheduler', { connection: redisConnection as any })
};

export class QueueService {
    static async addScheduledTransfer(jobData: any, delayMs: number = 0) {
        await queues.scheduledTransfers.add('process-transfer', jobData, { delay: delayMs });
        console.log(`[QueueService] Added scheduled transfer job with delay ${delayMs}ms`);
    }

    static async addEmiDeduction(jobData: any, delayMs: number = 0) {
        await queues.emiDeduction.add('process-emi', jobData, { delay: delayMs });
        console.log(`[QueueService] Added EMI deduction job with delay ${delayMs}ms`);
    }

    static async addAutoPayBill(jobData: any, delayMs: number = 0) {
        await queues.autoPayBills.add('process-auto-pay', jobData, { delay: delayMs });
        console.log(`[QueueService] Added auto-pay bill job with delay ${delayMs}ms`);
    }

    static async addRiskRecalculation(jobData: any) {
        await queues.riskRecalculation.add('recalculate-risk', jobData);
        console.log(`[QueueService] Added risk recalculation job`);
    }
}
