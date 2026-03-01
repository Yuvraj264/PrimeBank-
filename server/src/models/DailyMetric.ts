import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyMetric extends Document {
    date: Date;
    dailyVolume: number;
    totalDeposits: number;
    totalWithdrawals: number;
    activeUsers: number;
    revenue: number;
    fraudRate: number;
    defaultRate: number;
    cardUsage: {
        online: number;
        pos: number;
        atm: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const dailyMetricSchema = new Schema<IDailyMetric>(
    {
        date: { type: Date, required: true, unique: true, index: true },
        dailyVolume: { type: Number, required: true, default: 0 },
        totalDeposits: { type: Number, required: true, default: 0 },
        totalWithdrawals: { type: Number, required: true, default: 0 },
        activeUsers: { type: Number, required: true, default: 0 },
        revenue: { type: Number, required: true, default: 0 },
        fraudRate: { type: Number, required: true, default: 0 },
        defaultRate: { type: Number, required: true, default: 0 },
        cardUsage: {
            online: { type: Number, required: true, default: 0 },
            pos: { type: Number, required: true, default: 0 },
            atm: { type: Number, required: true, default: 0 },
        },
    },
    { timestamps: true }
);

const DailyMetric = mongoose.model<IDailyMetric>('DailyMetric', dailyMetricSchema);

export default DailyMetric;
