import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import beneficiaryRoutes from './routes/beneficiaryRoutes';
import kycRoutes from './routes/kycRoutes';
import loanRoutes from './routes/loanRoutes';
import customerRoutes from './routes/customerRoutes';
import adminRoutes from './routes/adminRoutes';
import accountRoutes from './routes/accountRoutes';
import cardRoutes from './routes/cardRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import billRoutes from './routes/billRoutes';
import investmentRoutes from './routes/investmentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import supportRoutes from './routes/supportRoutes';
import complianceRoutes from './routes/complianceRoutes';
import apiBankingRoutes from './routes/apiBankingRoutes';
import vendorRoutes from './routes/vendorRoutes';
import bulkProcessingRoutes from './routes/bulkProcessingRoutes';
import gstRoutes from './routes/gstRoutes';
import errorHandler from './middlewares/errorHandler';
import dotenv from 'dotenv';
import { AppError } from './utils/appError';
import { startTransactionCronJobs } from './jobs/transactionJobs';

dotenv.config();

connectDB();

startTransactionCronJobs();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.get('/', (req, res) => {
    res.send('API Running');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/beneficiaries', beneficiaryRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/loans', loanRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/cards', cardRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/bills', billRoutes);
app.use('/api/v1/investments', investmentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/compliance', complianceRoutes);
app.use('/api/v1/business/api', apiBankingRoutes);
app.use('/api/v1/business/vendors', vendorRoutes);
app.use('/api/v1/business/bulk', bulkProcessingRoutes);
app.use('/api/v1/business/gst', gstRoutes);

app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
