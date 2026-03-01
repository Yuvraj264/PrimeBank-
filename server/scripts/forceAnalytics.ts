import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import { AnalyticsService } from '../src/services/AnalyticsService';
import { connectRedis } from '../src/config/redis';

const forceRun = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/primebank');
        await connectRedis();
        console.log('Connected. Running manual aggregation for last 5 days...');
        
        for (let i = 4; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            await AnalyticsService.generateDailyMetrics(date);
            console.log(`Generated for: ${date.toISOString()}`);
        }
        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

forceRun();
